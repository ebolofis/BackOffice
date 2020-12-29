'use strict';
//product extras component 
angular.module('posBOApp')
    .controller('ProductExtrasCompCTRL', ProductExtrasCompCTRL)
    .component('productExtrasComp', {
        templateUrl: 'app/scripts/components/products/templates/product-extras-comp.html', controller: 'ProductExtrasCompCTRL',
        bindings: { data: '=', isEdited: '=', lookups: '=', pcatmap: '<' }
    });


// Product - data  - EntityStatus Enum = { loaded: 0, detailed: 1, created: 2, edited: 3, deleted: 4 };
// Extras EntityStatus Enum = { 0:new, 1:edited, 2:deleted }
function ProductExtrasCompCTRL($scope, $mdDialog, $timeout, tosterFactory, DynamicApiService, dataUtilFactory) {
    var self = this;
    // Display Ref of Ingredients
    self.ingDescEnum = dataUtilFactory.createEnums(self.lookups['Ingredients'], {}, 'Id', 'Description');

    // Display Enum of Units
    self.unitDescEnum = dataUtilFactory.createEnums(self.lookups['Units'], {}, 'Id', 'Description');

    // Default Extras Obj
    var emptyExtrasObj = { Id: 0, ProductId: 0, UnitId: null, IngredientId: null, IsRequired: false, MinQty: 0, MaxQty: 1, Sort: 0, EntityStatus: 0 };

    // this is a function that handles display entity on list as deleted , inserted , edited
    // also on apply some kind of this change also mark product currying it as dirty
    self.markEditedDetail = function (ent) {
        if (ent.EntityStatus != 2 && ent.EntityStatus != 0) {
            ent['EntityStatus'] = 1;
            self.isEdited = true; self.data.EntityStatus = 3;
        }
    }

    // Clone functionality switches ingrs with selected flag from - to list 
    self.toggleInsSelection = function (item) { (item.selected != true) ? item.selected = true : item.selected = false; }

    //this are functions that handles display entity on list as deleted , inserted , edited
    //also on apply some kind of this change also mark product currying it as dirty
    self.manageingrs = function (type) {
        //console.log('Managing Ingredients:' + type);
        self.inrgManageType = type;
        self.toaddingrs = [];
        switch (type) {

            case 'options': self.viewTemplate = 'append-ingredients'; break;
            case 'insert':
                self.directDesc = false;
                var ings = self.lookups.ingrsByCat[self.data.ProductCategoryId];
                if (ings != undefined) {
                    self.toaddingrs = ings;
                    self.toaddingrs = self.toaddingrs.map(function (ex) {
                        var fltred = self.data.ProductExtras.filter(function (pe) { return pe.IngredientId == ex.IngredientId; });
                        (fltred != undefined && fltred.length > 0 && fltred.length > 1) ? ex['selected'] = true : ex['selected'] = false;
                        return ex;
                    })
                };
                self.innerHeader = 'Select Ingredients to add'; self.notLengthMSg = 'There are no ingredients matching selected product category.';
                self.innerInfo = 'Action will remove extras included and not belong to category and insert missing from selected to add. Entities will be marked as deleted.';
                self.viewTemplate = 'insert-ingredients-choice-template';
                break;
            case 'append':
                self.directDesc = false;
                var ings = self.lookups.ingrsByCat[self.data.ProductCategoryId];
                angular.forEach(ings, function (ing) {
                    var fltred = self.data.ProductExtras.filter(function (pe) { return pe.IngredientId == ing.IngredientId; });
                    if (fltred != undefined && fltred.length > 0 && fltred.length > 1) {
                    } else {
                        ing['selected'] = false;
                        self.toaddingrs.unshift(ing);
                    }
                })
                self.innerHeader = 'Select Ingredients to Append'; self.notLengthMSg = 'There are no ingredients matching selected product category.';
                self.innerInfo = 'Action will NOT remove extras included. Entities selected will append to Extras only if they are missing.';
                self.viewTemplate = 'insert-ingredients-choice-template';
                break;
            case 'manual':

                self.innerHeader = 'Associated Categories'; self.notLengthMSg = 'There are no associated ingredients.';
                self.innerInfo = 'Action will allow you to add extras from associated mark as deleted extras included and not belong to cloning product and insert missing from selected to add.';
                self.viewTemplate = 'bycategory-ingredients-choice-template';
                break;
            case 'product':
                if (self.searchp != undefined && self.searchp != {})
                    self.manageIngsFromProductLoaded(self.searchp.ProductExtras);
                self.innerHeader = 'Select Extras from product'; self.notLengthMSg = 'There are no extras matching selected product.';
                self.innerInfo = 'Action will mark as deleted extras included and not belong to cloning product and insert missing from selected to add.';
                self.viewTemplate = 'byproduct-ingredients-choice-template';
                break;
            case 'all':
                self.directDesc = true;
                var ings = self.lookups['Ingredients'];
                if (ings != undefined) {
                    self.toaddingrs = ings;
                    self.toaddingrs = self.toaddingrs.map(function (ex) {
                        var fltred = self.data.ProductExtras.filter(function (pe) { return pe.IngredientId == ex.Id; });
                        (fltred != undefined && fltred.length > 0 && fltred.length > 1) ? ex['selected'] = true : ex['selected'] = false;
                        return ex;
                    })
                }
                self.innerHeader = 'Select from all Ingredients'; self.notLengthMSg = 'There are no ingredients registered.';
                self.innerInfo = 'Action will insert missing from selected to add.'
                self.viewTemplate = 'insert-ingredients-direct-template';
                break;
            case 'display': default: self.viewTemplate = 'main-list-display'; break;
        }

    }
    //interation of givven array to make selected entity false
    self.assocSelectionChanged = function (id) {
        self.toaddingrs = [];
        var retar = self.lookups.ingrsByCat[id];
        if (retar != undefined) {
            self.toaddingrs = retar;
        }
    }

    self.appendIngredients = function () {
        var arr = self.toaddingrs.filter(function (i) { return i.selected == true; });
        var byidadd = false;
        var obj;
        switch (self.inrgManageType) {
            case 'insert':
                obj = dataUtilFactory.createEnumObjs(arr, {}, 'IngredientId');
                self.data['ProductExtras'] = self.data['ProductExtras'].filter(function (row) {
                    //then i have to append 
                    if (obj[row.IngredientId] != undefined) { //if exist into append
                        obj[row.IngredientId]['added'] = true; //mark it to ins
                        if (row.IsDeleted == true) { //if is deleted restore
                            row.EntityStatus = 1; row.IsDeleted = false;
                        }
                        return row;
                    } else { if (row.Id != 0) { row.EntityStatus = 2; row.IsDeleted = true; return row; } }
                });
                break;
            case 'append': case 'manual':
                obj = dataUtilFactory.createEnumObjs(arr, {}, 'IngredientId');
                self.data['ProductExtras'] = self.data['ProductExtras'].filter(function (row) {
                    if (obj[row.IngredientId] != undefined) {
                        obj[row.IngredientId]['added'] = true; //it exists allready
                        if (row.IsDeleted == true) { //if is deleted restore
                            row.EntityStatus = 1;
                            row.IsDeleted = false;
                        }
                    }
                    return row;
                });

                break;
            case 'product': case 'all':
                obj = dataUtilFactory.createEnumObjs(arr, {}, 'Id');
                self.data['ProductExtras'] = self.data['ProductExtras'].filter(function (row) {
                    if (obj[row.IngredientId] != undefined) {
                        obj[row.IngredientId]['added'] = true;
                        if (row.IsDeleted == true) { //if is deleted restore
                            row.EntityStatus = 1;
                            row.IsDeleted = false;
                        }
                    }
                    return row;
                });
                byidadd = true;
                break; default: break;
        }
        var max = dataUtilFactory.findmax(self.data['ProductExtras'], 'Sort');
        if (max == null) max = 0;
        //order array before calling addDetail to manage sort on insertion
        var cnt = 0, l = Object.values(obj).length, tarr = Object.values(obj).sort(function (a, b) { return (a.Sort - b.Sort); })
        angular.forEach(tarr, function (ingr) {
            if (ingr['added'] != true) {
                var adt;
                if (ingr.Sort != null) { adt = ingr.Sort; } else { adt = l; l++; }
                ingr.Sort = max + adt;
                self.addDetail('ProductExtras', ingr, byidadd);
            }
        });
        self.manageingrs('display');
    }

    // Cuts array into 2 those deleted and not 
    // Applies Insertion Sort on active Then for its missplaced by view item applies index
    self.sortDisplay = function () {
        var active = [], inactive = [];
        // split active inactive
        angular.forEach(self.data['ProductExtras'], function (i) { if (i.IsDeleted == true && i.EntityStatus == 2) { inactive.push(i); } else { active.push(i); } })
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
        self.data['ProductExtras'] = active.concat(inactive);
    }

    // Based on index appeared dnd list uses this function to sort ingredients for recipe
    self.dragsort = function () {
        var active = [], inactive = [];
        // split active inactive
        angular.forEach(self.data['ProductExtras'], function (i) { if (i.IsDeleted == true && i.EntityStatus == 2) { inactive.push(i); } else { active.push(i); } })

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
        self.data['ProductExtras'] = active.concat(inactive);
    }
    //a function to apply new default recipe object to list of product recipe
    self.addDetail = function (type, forceIngr, byid) {
        var newobj = {};
        var c = angular.copy(emptyExtrasObj); angular.extend(newobj, c);
        //apply Product Id to entity and  append obj created to Product detail.DTO by type
        if (newobj != {}) {
            newobj.ProductId = self.data.Id;
            //newobj.Sort = findnextpossition(self.data);
            if (forceIngr != undefined && forceIngr.IngredientId != undefined)
                newobj.IngredientId = forceIngr.IngredientId;
            if (forceIngr != undefined && forceIngr.Id != undefined && byid == true)
                newobj.IngredientId = forceIngr.Id;
            if (forceIngr != undefined && forceIngr.UnitId != undefined)
                newobj.UnitId = forceIngr.UnitId;
            if (forceIngr != undefined && forceIngr.IsRequired != undefined)
                newobj.IsRequired = forceIngr.IsRequired;
            if (forceIngr != undefined && forceIngr.MinQty != undefined)
                newobj.MinQty = forceIngr.MinQty;
            if (forceIngr != undefined && forceIngr.MaxQty != undefined)
                newobj.MaxQty = forceIngr.MaxQty;
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
        var sindex = self.data['ProductExtras'].indexOf(row);
        if (row.Id == 0) {
            self.data['ProductExtras'].splice(sindex, 1);
        } else {
            row.EntityStatus = 2; row.IsDeleted = true;
            row.Sort = null;
            self.data['ProductExtras'].splice(sindex, 1);
            self.data['ProductExtras'].push(row);
        }
        self.isEdited = true; self.data.EntityStatus = 3; row.isEditing = false;
        self.sortDisplay();
    }

    // function on action edit maps all product items to is editing false and applies on current provided
    // This changes template and provides ingredient edit functionality to autocomplete selection
    self.editDetail = function (item, value) {
        self.data['ProductExtras'] = self.data['ProductExtras'].map(function (pr) { pr.isEditing = false; return pr; })
        self.searchText = '';
        item.isEditing = value;
        if (value == true) { self.selectedItem = self.sitemBinded(item.IngredientId); }

    }

    // Unmark deleted property to edited then allow to save
    self.refreshRow = function (type, row) {
        var m = dataUtilFactory.findmax(self.data['ProductExtras'], 'Sort');
        row.Sort = m + 1;
        row.EntityStatus = 1; row.IsDeleted = false; self.isEdited = true;
        self.data.EntityStatus = 3; self.sortDisplay();
    }

    // search and returns ingredient item from lookups by id provided
    // if no result with this id found it returns null
    self.sitemBinded = function (id) {
        if (id == null) { return null; }
        var ret = self.lookups.Ingredients.filter(function (item) { return item.Id == id; });
        return (ret.length > 0) ? ret[0] : null;
    }

    // Toggle clear selection button on product clone
    self.clearSelected = function (arr) { angular.forEach(arr, function (i) { i['selected'] = false; }); return; }

    // Toggle selection button on product clone
    self.selectAll = function (arr) { angular.forEach(arr, function (i) { i['selected'] = true; }); return; }

    // when a product is selected from copy prop feature
    // this function applyies 
    self.manageIngsFromProductLoaded = manageifpl;
    function manageifpl(exarr) {
        var loop = (exarr.ProductExtras != undefined) ? exarr.ProductExtras : [];
        if (loop.length == 0) { self.toaddingrs = []; return; }
        angular.forEach(loop, function (i) {
            var fltred = self.lookups['Ingredients'].filter(function (pe) { return pe.Id == i.IngredientId; });
            if (fltred != undefined && fltred.length > 0) {
                var t = angular.copy(fltred[0]);
                t['selected'] = false;
                // extend obj to map default values to ingredients selection for clone and append
                var extendItem = {
                    IsRequired: i.IsRequired,
                    MaxQty: i.MaxQty,
                    MinQty: i.MinQty,
                    UnitId: i.UnitId,
                    Sort: i.Sort
                }
                t = angular.extend(t, extendItem);
                self.toaddingrs.unshift(t);
            }
        })
    }

    // watches one bind values of component to apply events
    // var of pcatmap is mapped to product.ProductCategory
    self.$onChanges = function (changes) {
        // event to map on product category change
        if (changes.pcatmap != null && changes.pcatmap.currentValue != null) {
            if (self.inrgManageType == 'insert' || self.inrgManageType == 'append')
                self.manageingrs(self.inrgManageType);
        }
    };

    // Searches list of ingredients for description and code with help of
    // createFilterFor function
    function querySearch(query) {
        var results = query ? self.lookups.Ingredients.filter(createFilterFor(query)) : self.lookups.Ingredients;
        return results;
    }

    // filter of search query to filter Code and Descr 
    function createFilterFor(query) {
        var lowercaseQuery = query.toLowerCase();
        return function filterFn(ingr) { return ((ingr.Description != null && ingr.Description.indexOf(lowercaseQuery) === 0) || (ingr.Code != null && ingr.Code.indexOf(lowercaseQuery) === 0)); };
    }

    // on autocomplete select this function applies ingredient id to product recipe provided by model
    // if non is selected then it applies null
    function selectedItemChange(item, pr) {
        if (item != null && item.Id != null) {
            pr.IngredientId = item.Id; self.markEditedDetail(pr);
        } else {
            pr.IngredientId = null; self.markEditedDetail(pr);
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

    // Ajax API calls to search products filtered and dynamic api call 
    self.RestPromice = {
        'searchFilteredProducts': function (filterparams) {
            return DynamicApiService.getDynamicObjectData('Product', filterparams).then(function (result) { //Rest Get call for data using Api service to call Webapi 
                console.log('Search result of products succeded.'); console.log(result);
                return result;
            }).catch(function (rejection) { tosterFactory.showCustomToast('Searching Products yeild no results', 'fail'); console.warn('Get by Product by Filters server failed. Reason:'); console.warn(rejection); return -1; });
        },
        //Dynamic  rest call to load entity via params call products by filter and etc of entities by dynamic params created
        'dynamicObjEntity': function (entity, params) {
            return DynamicApiService.getDynamicObjectData(entity, params).then(function (result) {
                return result;
            }).catch(function (error) { tosterFactory.showCustomToast('Loading ' + entity + ' failed', 'fail'); console.log('Fail Load'); console.log(error); return null; });
        },
    };

    self.init = function () {
        self.toaddingrs = []; self.compareExtras = {};
        self.searchp = null;
        self.directDesc = false;
        //self.sortDisplay();
        //self.viewTemplate = 'main-list';
        //self.manageingrs();
        self.manageingrs('display');
    }();
}