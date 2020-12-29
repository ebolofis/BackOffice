'use strict';

// Product Recipe Component
// a Component that handles recipe of product Tab 
// Provide data of product isEdited mapped on product Value and lookups for basic edit lists like categories units etc 
angular.module('posBOApp')
    .controller('ProductRecipesCompCTRL', ProductRecipesCompCTRL)
    .component('productRecipesComp', {
        templateUrl: 'app/scripts/components/products/templates/product-recipe-comp.html',
        controller: 'ProductRecipesCompCTRL',
        bindings: { data: '=', isEdited: '=', lookups: '=', }
    });
// Product - data  - EntityStatus Enum = { loaded: 0, detailed: 1, created: 2, edited: 3, deleted: 4 };
// Extras EntityStatus Enum = { 0:new, 1:edited, 2:deleted }
function ProductRecipesCompCTRL($mdDialog, tosterFactory, DynamicApiService, dataUtilFactory) {
    var self = this;

    // Display enum of ingredients and enum of units creted to display description by id bj  { id : Description }
    self.ingDescEnum = dataUtilFactory.createEnums(self.lookups['Ingredients'], {}, 'Id', 'Description');
    self.unitDescEnum = dataUtilFactory.createEnums(self.lookups['Units'], {}, 'Id', 'Description');

    // Empty Product Recie Obj
    var emptyRecipesObj = { Id: 0, ProductId: 0, Qty: 0, UnitId: null, IngredientId: null, DefaultQty: 0, MinQty: 0, MaxQty: 1, Sort: 0, EntityStatus: 0 };

    // this is a function that handles display entity on list as deleted , inserted , edited
    // also on apply some kind of this change also mark product currying it as dirty
    self.markEditedDetail = function (ent) {
        //Extras entity Status  0:new 1:edited 2:deleted
        if (ent.EntityStatus != 2 && ent.EntityStatus != 0) {
            ent['EntityStatus'] = 1;
            self.isEdited = true;
            // product entitystatus.edited
            self.data.EntityStatus = 3;
        }
    }

    // Display Template and functionality of menu view option
    // On product 
    self.manageingrs = function (type) {
        self.inrgManageType = type;
        switch (type) {
            case 'product':
                self.toaddingrs = [];
                if (self.searchp != undefined && self.searchp != {}) {
                    self.manageIngsFromProductLoaded(self.searchp);
                }
                self.innerHeader = 'Select Recipe from product';
                self.notLengthMSg = 'There are no recipe items matching selected product.';
                self.innerInfo = 'Action will mark as deleted recipe items included and not belong to cloning product and insert missing from selected to add.';
                self.viewTemplate = 'byproduct-recipe-choice-template';
                break;
            case 'display': default:
                self.viewTemplate = 'view-recipe-ingredients';
                break;
        }
    }

    // Applies index to null order, sorts by Sort field and opperates on Ins/Edited to mark as edited and remove sort on deleted
    self.sortDisplay = function () {
        var active = [], inactive = [];
        // split active inactive
        angular.forEach(self.data['ProductRecipe'], function (i) { if (i.IsDeleted == true && i.EntityStatus == 2) { inactive.push(i); } else { active.push(i); } })
        // Insertion Sort Algorithm
        for (var i = 0; i < active.length; i++) {
            var temp = active[i], j = i - 1;
            if (active[j] != null && active[j].Sort == null) active[j].Sort = i;
            while (j >= 0 && active[j].Sort > temp.Sort) { active[j + 1] = active[j]; j--; }
            active[j + 1] = temp;
        }
        var cnt = 1;
        // { 0:new, 1:edited, 2:deleted }
        // if item is not on prop possition mark it as edited to be saved and change index of sort
        angular.forEach(active, function (ex, indx) {
            if (ex.Sort != indx + 1) {
                if (ex.EntityStatus != 0) {
                    ex.EntityStatus = 1;
                }
                ex.Sort = indx + 1;
            }
        })
        self.isEdited = true; self.data.EntityStatus = 3;
        self.data['ProductRecipe'] = active.concat(inactive);
    }

    // Based on index appeared dnd list uses this function to sort ingredients for recipe
    self.dragsort = function () {
        var active = [], inactive = [];
        // split active inactive
        angular.forEach(self.data['ProductRecipe'], function (i) { if (i.IsDeleted == true && i.EntityStatus == 2) { inactive.push(i); } else { active.push(i); } })

        // { 0:new, 1:edited, 2:deleted }
        // if item is not on prop possition mark it as edited to be saved and change index of sort
        angular.forEach(active, function (ex, indx) {
            if (ex.Sort != indx + 1) {
                if (ex.EntityStatus != 0) {
                    ex.EntityStatus = 1;
                }
                ex.Sort = indx + 1;
            }
        })
        self.isEdited = true; self.data.EntityStatus = 3;
        self.data['ProductRecipe'] = active.concat(inactive);
    }

    // A function to apply new default recipe object to list of product recipe
    self.addDetail = function (type, forceIngr, byid) {
        var newobj = {};
        var c = angular.copy(emptyRecipesObj); angular.extend(newobj, c);
        //apply Product Id to entity and  append obj created to Product detail.DTO by type
        if (newobj != {}) {
            newobj.ProductId = self.data.Id;
            //newobj.Sort = findnextpossition(self.data);
            if (forceIngr != undefined && forceIngr.IngredientId != undefined)
                newobj.IngredientId = forceIngr.IngredientId;
            if (forceIngr != undefined && forceIngr.Id != undefined && byid == true)
                newobj.IngredientId = forceIngr.Id;
            //UnitId
            if (forceIngr != undefined && forceIngr.UnitId != undefined)
                newobj.UnitId = forceIngr.UnitId;
            //DefaultQty
            if (forceIngr != undefined && forceIngr.DefaultQty != undefined)
                newobj.DefaultQty = forceIngr.DefaultQty;
            //MinQty
            if (forceIngr != undefined && forceIngr.MinQty != undefined)
                newobj.MinQty = forceIngr.MinQty;
            //MaxQty
            if (forceIngr != undefined && forceIngr.MaxQty != undefined)
                newobj.MaxQty = forceIngr.MaxQty;
            //Qty
            if (forceIngr != undefined && forceIngr.Qty != undefined)
                newobj.Qty = forceIngr.Qty;
            //Sort
            if (forceIngr != undefined && forceIngr.Sort != undefined)
                newobj.Sort = forceIngr.Sort;
            if (newobj.Sort == null || newobj.Sort == 0) {
                var m = dataUtilFactory.findmax(self.data[type], 'Sort');
                newobj.Sort = (m != null) ? m + 1 : self.data[type].length;
            }

            self.data[type].push(newobj);
            self.isEdited = true; self.data.EntityStatus = 3;
        }
        self.sortDisplay();
        self.manageingrs();

    }

    // Remove - mark detail entities as deleted to display on red font and mark selected product as dirty
    self.removeDetail = function (type, row, index) {
        //should i be ProductRecipe or product extras
        var sindex = self.data['ProductRecipe'].indexOf(row);
        if (row.Id == 0) {
            self.data['ProductRecipe'].splice(sindex, 1);
        } else {
            row.EntityStatus = 2; row.IsDeleted = true;
            row.Sort = null;
            self.data['ProductRecipe'].splice(sindex, 1);
            self.data['ProductRecipe'].push(row);
            //(m) ? m + 1 : self.data['ProductRecipe'].length;
        }
        self.isEdited = true; self.data.EntityStatus = 3; row.isEditing = false;
        self.sortDisplay();
    }

    // function on action edit maps all product items to is editing false and applies on current provided
    // This changes template and provides ingredient edit functionality to autocomplete selection
    self.editDetail = function (item, value) {
        self.sortDisplay();
        self.data['ProductRecipe'] = self.data['ProductRecipe'].map(function (pr) { pr.isEditing = false; return pr; })
        self.searchText = '';
        item.isEditing = value;
        if (value == true) { self.selectedItem = self.sitemBinded(item.IngredientId); }
    }

    // unmark deleted property to edited then allow to save
    self.refreshRow = function (type, row) {
        var m = dataUtilFactory.findmax(self.data['ProductRecipe'], 'Sort');
        row.Sort = m + 1;
        row.EntityStatus = 1; row.IsDeleted = false; self.isEdited = true;
        self.data.EntityStatus = 3; self.sortDisplay();
    }

    // function to call whenever an auto complete product selection is triggered to manage ingrs
    self.manageIngsFromProductLoaded = manageifpl;
    function manageifpl(autop) {
        var loop = (autop.ProductRecipe != undefined) ? autop.ProductRecipe : [];
        if (loop.length == 0) { self.toaddingrs = []; return; }
        angular.forEach(loop, function (i) {
            var fltred = self.lookups['Ingredients'].filter(function (pe) { return pe.Id == i.IngredientId; });
            if (fltred != undefined && fltred.length > 0) {
                var t = angular.copy(fltred[0]);
                t['selected'] = false;
                // extend obj to map default values to ingredients selection for clone and append
                var extendItem = {
                    UnitId: i.UnitId,
                    DefaultQty: i.DefaultQty,
                    MaxQty: i.MaxQty,
                    MinQty: i.MinQty,
                    Qty: i.Qty,
                    Sort: i.Sort
                }
                t = angular.extend(t, extendItem);
                self.toaddingrs.unshift(t);
            }
        })
    }

    // Action Button on cline to append ingrs as Recipe objects to product managing
    self.appendIngredients = function () {
        var obj, arr = self.toaddingrs.filter(function (i) { return i.selected == true; });
        //from selected 
        switch (self.inrgManageType) {
            case 'product': case 'all':
                obj = dataUtilFactory.createEnumObjs(arr, {}, 'Id');
                self.data['ProductRecipe'] = self.data['ProductRecipe'].filter(function (row) {
                    if (obj[row.IngredientId] != undefined) {
                        obj[row.IngredientId]['added'] = true;
                        // if is deleted restore
                        if (row.IsDeleted == true) { row.EntityStatus = 1; row.IsDeleted = false; }
                    }
                    return row;
                });
                var max = dataUtilFactory.findmax(self.data['ProductRecipe'], 'Sort');
                if (max == null) max = 0;
                //order array before calling addDetail to manage sort on insertion

                var cnt = 0, l = Object.values(obj).length, tarr = Object.values(obj).sort(function (a, b) { return (a.Sort - b.Sort); })

                angular.forEach(tarr, function (ingr) {
                    if (ingr['added'] != true) {
                        var adt;
                        if (ingr.Sort != null) { adt = ingr.Sort; } else { adt = l; l++; }
                        ingr.Sort = max + adt;
                        self.addDetail('ProductRecipe', ingr, true)
                    }
                });
                break; default: break;
        }
        //return to basic view
        self.manageingrs();
    }

    // Clone Recipe functionality switches ingrs with selected flag from - to list 
    self.toggleInsSelection = function (item) { (item.selected != true) ? item.selected = true : item.selected = false; }

    // Toggle clear selection button on product clone
    self.clearSelected = function (arr) {
        
        angular.forEach(arr, function (i) { i['selected'] = false; });
        return;
    }

    // Toggle selection button on product clone
    self.selectAll = function (arr) { angular.forEach(arr, function (i) { i['selected'] = true; }); return; }

    // search and returns ingredient item from lookups by id provided
    // if no result with this id found it returns null
    self.sitemBinded = function (id) {
        if (id == null) { return null; }
        var ret = self.lookups.Ingredients.filter(function (item) { return item.Id == id; });
        return (ret.length > 0) ? ret[0] : null;
    }

    // Searches list of ingredients for description and code with help of
    // createFilterFor function
    function querySearch(query) {
        var arr = self.lookups.Ingredients;
        var results = query ? arr.filter(createFilterFor(query)) : arr;
        return results;
    }

    // filter of search query to filter Code and Descr 
    function createFilterFor(query) {
        var lowercaseQuery = query.toLowerCase();
        return function filterFn(state) {
            return ((state.Description != null && state.Description.indexOf(lowercaseQuery) === 0) || (state.Code != null && state.Code.indexOf(lowercaseQuery) === 0));
        };
    }

    // on autocomplete select this function applies ingredient id to product recipe provided by model
    // if non is selected then it applies null
    function selectedItemChange(item, pr) {
        if (item != null && item.Id != null) {
            pr.IngredientId = item.Id;
            self.markEditedDetail(pr);
        } else {
            pr.IngredientId = null;
            self.markEditedDetail(pr);
        }
    }

    // action function on search text change 
    function searchTextChange(text) {
        // console.log('Text changed to ' + text);
    }

    // Component map values to functions for autocomplete actions
    self.querySearch = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange = searchTextChange;

    // Custom Initiallization function triggeres on ng-init of component
    self.initView = function () {
        self.toaddingrs = [];
        self.searchp = null;
        self.manageingrs('display');
    };
}
