'use strict';
//directives that used by products across the project
angular.module('posBOApp')

    //Directive to display form of product providing 
    //data : entity ,
    //valid : 
    //isEdited : field of p entity that marked as true when form field is changed
    //useUnique : is true then a restcall over a unique product policy on server to allow code modification
    .directive('productEntityForm', function () {
        return {
            templateUrl: 'app/scripts/directives/views-directives/product-modules/product-form-template.html',
            controller: 'ProductFormCtrl', restrict: 'E',
            scope: { data: '=', valid: '=', isEdited: '=', useUnique: '=', lookups: '=', triggerValid: '=?' },
        }
    })
    .controller('ProductFormCtrl', function ($q, $scope, $mdDialog, tosterFactory, DynamicApiService) {
        //console.log('Products Form Ctrl Directive activated');
        $scope.lookups = $scope.lookups;
        $scope.uploadModel = {
            controllerName: 'Upload',
            actionName: 'products',
            extraData: 1,//represents storeinfo.Id
            externalDirectory: 'region'
        };

        //this is a filter function applied on code of products 
        //if configuration on backend has unique policy of product code active then it RESTS
        //with a resource called by checksamecode promise 
        //else filter apply as true and of unique code to not handle code 
        $scope.checkUniqueCode = function (form, code, id) {
            $scope.isEdited = true; $scope.data.EntityStatus = 3;
            if ($scope.useUnique != true) {
                form.Code.$setValidity("uniquecode", true);
                return;
            }
            if (code != undefined && code.length > 0) {
                $q.all({
                    checkCodePromise: checkSameCode($scope.data)
                }).then(function (res) {
                    if (res.checkCodePromise != -1) {
                        if ($scope.overviewRowEntryForm.$valid != res.checkCodePromise) {
                            form.Code.$setValidity("uniquecode", res.checkCodePromise)
                        }
                    } else {
                        form.Code.$setValidity("uniquecode", false);
                    }

                })
            }
        }

        //this is a function that loads any products with filter search resource to take products existed by the same barcode
        //the only param is the code inserting and return is a bool value if 
        function checkSameCode(ent) {
            var cprod = angular.copy(ent);
            return (DynamicApiService.getDynamicObjectData('Product', "uniqueCode=" + cprod.Code).then(function (result) {
                //if no results allow save
                if (result.data.length < 1) { return true; }
                var ddar = angular.copy(result.data);
                //filter those with actual same code and diff ID loaded and not string included as promise filter returned 
                var funique = ddar.filter(function (item) { return (item.Code == cprod.Code && item.Id != cprod.Id) })
                //if no result on filter then it is unique
                if (funique.length == 0) {
                    return true;
                } else { //else not a valid Code to save
                    (cprod.Code == undefined || cprod.Code == '') ? tosterFactory.showCustomToast('#' + funique.length + ' with null or empty Code found.', 'warning')
                        : tosterFactory.showCustomToast('#' + funique.length + ' products with same Code:"' + cprod.Code + '" found. Provide unique code to save current product.', 'warning');
                    return false;
                }
            }).catch(function () { tosterFactory.showCustomToast('Error on checking unique code of product.', 'error'); return -1; }).finally(function () { })
            );
        }
        $scope.applyDescriptions = function () {
            var txt = $scope.data.Description;
            $scope.data.ExtraDescription = txt;
            $scope.data.SalesDescription = txt;
        }
        $scope.imgChange = function (uri) {
            $scope.data.ImageUri = uri;
            $scope.isEdited = true; $scope.data.EntityStatus = 3;
        }

        $scope.$watch('data', function (newValue, oldValue) {
            //console.log('aora');
            if (newValue != undefined) {
                $scope.overviewRowEntryForm.$setSubmitted();
                //$scope.checkUniqueCode($scope.overviewRowEntryForm, newValue.Code, newValue.Id)
            }

        })

        $scope.$watch('overviewRowEntryForm.$valid', function (newValue, oldValue) {
            //console.log('----------- Products overview validation change ------------'); console.log($scope.overviewRowEntryForm);
            if ($scope.data != undefined && $scope.data.vmodel != undefined) {
                if (newValue) {
                    $scope.valid = true;
                    $scope.data['vmodel']['Overview'] = true;
                } else {
                    $scope.valid = false;
                    $scope.data['vmodel']['Overview'] = false;
                }
            }
        }, true);
    })


    .directive('productRecipesList', function () {
        return {
            templateUrl: 'app/scripts/directives/views-directives/product-modules/product-recipes-template.html',
            controller: 'ProductRecipesListCtrl', restrict: 'E',
            scope: { data: '=', isEdited: '=', lookups: '=' },
        }
    })
    .controller('ProductRecipesListCtrl', ProductRecListCtrl)

    .directive('productExtrasList', function () {
        return {
            templateUrl: 'app/scripts/directives/views-directives/product-modules/product-extras-template.html',
            controller: 'ProductExtrasListCtrl', restrict: 'E',
            scope: { data: '=', isEdited: '=', lookups: '=' },
        }
    })
    .controller('ProductExtrasListCtrl', function ($scope, $mdDialog, $q, tosterFactory, DynamicApiService, dataUtilFactory) {
        //this are functions that handles display entity on list as deleted , inserted , edited
        //also on apply some kind of this change also mark product currying it as dirty
        //console.log('******************** Product Extras Initiallizing  **********************');
        $scope.selectedDndPr = null;
        //Extras entity Status  0:new 1:edited 2:deleted
        $scope.ingDescEnum = dataUtilFactory.createEnums($scope.lookups['Ingredients'], {}, 'Id', 'Description');
        $scope.unitDescEnum = dataUtilFactory.createEnums($scope.lookups['Units'], {}, 'Id', 'Description');
        $scope.markEditedDetail = function (ent) {
            if (ent.EntityStatus != 2 && ent.EntityStatus != 0) {
                ent['EntityStatus'] = 1;
                $scope.isEdited = true; $scope.data.EntityStatus = 3;
            }
        }
        $scope.toaddingrs = [];
        $scope.toggleInsSelection = function (item) {
            (item.selected != true) ? item.selected = true : item.selected = false;
        }
        $scope.manageingrs = function (type) {
            //console.log('Managing Ingredients:' + type);
            $scope.inrgManageType = type;
            $scope.toaddingrs = [];
            switch (type) {
                case 'display': $scope.viewTemplate = 'main-list-display'; break;
                case 'options': $scope.viewTemplate = 'append-ingredients'; break;
                case 'insert':
                    $scope.directDesc = false;
                    var ings = $scope.lookups.ingrsByCat[$scope.data.ProductCategoryId];
                    if (ings != undefined) {
                        $scope.toaddingrs = ings;
                        $scope.toaddingrs = $scope.toaddingrs.map(function (ex) {
                            var fltred = $scope.data.ProductExtras.filter(function (pe) { return pe.IngredientId == ex.IngredientId; });
                            (fltred != undefined && fltred.length > 0 && fltred.length > 1) ? ex['selected'] = true : ex['selected'] = false;
                            return ex;
                        })
                    };
                    $scope.innerHeader = 'Select Ingredients to add'; $scope.notLengthMSg = 'There are no ingredients matching selected product category.';
                    $scope.innerInfo = 'Action will remove extras included and not belong to category and insert missing from selected to add. Entities will be marked as deleted.';
                    $scope.viewTemplate = 'insert-ingredients-choice-template';
                    break;
                case 'append':
                    $scope.directDesc = false;
                    var ings = $scope.lookups.ingrsByCat[$scope.data.ProductCategoryId];
                    angular.forEach(ings, function (ing) {
                        var fltred = $scope.data.ProductExtras.filter(function (pe) { return pe.IngredientId == ing.IngredientId; });
                        if (fltred != undefined && fltred.length > 0 && fltred.length > 1) {
                        } else {
                            ing['selected'] = false;
                            $scope.toaddingrs.unshift(ing);
                        }
                    })
                    $scope.innerHeader = 'Select Ingredients to Append'; $scope.notLengthMSg = 'There are no ingredients matching selected product category.';
                    $scope.innerInfo = 'Action will NOT remove extras included. Entities selected will append to Extras only if they are missing.';
                    $scope.viewTemplate = 'insert-ingredients-choice-template';
                    break;
                case 'manual':

                    $scope.innerHeader = 'Associated Categories'; $scope.notLengthMSg = 'There are no associated ingredients.';
                    $scope.innerInfo = 'Action will allow you to add extras from associated mark as deleted extras included and not belong to cloning product and insert missing from selected to add.';
                    $scope.viewTemplate = 'bycategory-ingredients-choice-template';
                    break;
                case 'product':
                    if ($scope.searchp != undefined && $scope.searchp != {})
                        $scope.manageIngsFromProductLoaded($scope.searchp.ProductExtras);
                    $scope.innerHeader = 'Select Extras from product'; $scope.notLengthMSg = 'There are no extras matching selected product.';
                    $scope.innerInfo = 'Action will mark as deleted extras included and not belong to cloning product and insert missing from selected to add.';
                    $scope.viewTemplate = 'byproduct-ingredients-choice-template';
                    break;
                case 'all':
                    $scope.directDesc = true;
                    var ings = $scope.lookups['Ingredients'];
                    if (ings != undefined) {
                        $scope.toaddingrs = ings;
                        $scope.toaddingrs = $scope.toaddingrs.map(function (ex) {
                            var fltred = $scope.data.ProductExtras.filter(function (pe) { return pe.IngredientId == ex.Id; });
                            (fltred != undefined && fltred.length > 0 && fltred.length > 1) ? ex['selected'] = true : ex['selected'] = false;
                            return ex;
                        })
                    }
                    $scope.innerHeader = 'Select from all Ingredients'; $scope.notLengthMSg = 'There are no ingredients registered.';
                    $scope.innerInfo = 'Action will insert missing from selected to add.'
                    $scope.viewTemplate = 'insert-ingredients-direct-template';
                    break;
                default: $scope.viewTemplate = 'main-list'; break;
            }

        }
        //interation of givven array to make selected entitiy false
        $scope.clearSelected = function (arr) { angular.forEach(arr, function (i) { i['selected'] = false; }); return; }
        $scope.selectAll = function (arr) { angular.forEach(arr, function (i) { i['selected'] = true; }); return; }
        $scope.assocSelectionChanged = function (id) {
            $scope.toaddingrs = [];
            var retar = $scope.lookups.ingrsByCat[id];
            if (retar != undefined) {
                $scope.toaddingrs = retar;
            }
        }
        $scope.appendIngredients = function () {
            var arr = $scope.toaddingrs.filter(function (i) { return i.selected == true; });
            //console.log('Managing ingredients Array type:' + $scope.inrgManageType);  console.log(arr);
            var obj;
            switch ($scope.inrgManageType) {
                case 'insert':
                    obj = dataUtilFactory.createEnumObjs(arr, {}, 'IngredientId');
                    $scope.data['ProductExtras'] = $scope.data['ProductExtras'].filter(function (row) {
                        //then i have to append 
                        if (obj[row.IngredientId] != undefined) { //if exist into append
                            obj[row.IngredientId]['added'] = true; //mark it to ins
                            if (row.IsDeleted == true) { //if is deleted restore
                                row.EntityStatus = 1; row.IsDeleted = false;
                            }
                            return row;
                        } else { if (row.Id != 0) { row.EntityStatus = 2; row.IsDeleted = true; return row; } }
                    });
                    angular.forEach(Object.values(obj), function (ingr) { if (ingr['added'] != true) $scope.addDetail('ProductExtras', ingr); })
                    break;
                case 'append': case 'manual':
                    obj = dataUtilFactory.createEnumObjs(arr, {}, 'IngredientId');
                    $scope.data['ProductExtras'] = $scope.data['ProductExtras'].filter(function (row) {
                        if (obj[row.IngredientId] != undefined) {
                            obj[row.IngredientId]['added'] = true; //it exists allready
                            if (row.IsDeleted == true) { //if is deleted restore
                                row.EntityStatus = 1;
                                row.IsDeleted = false;
                            }
                        }
                        return row;
                    });
                    angular.forEach(Object.values(obj), function (ingr) { if (ingr['added'] != true) $scope.addDetail('ProductExtras', ingr); })
                    break;
                case 'product': case 'all':
                    obj = dataUtilFactory.createEnumObjs(arr, {}, 'Id');
                    $scope.data['ProductExtras'] = $scope.data['ProductExtras'].filter(function (row) {
                        if (obj[row.IngredientId] != undefined) {
                            obj[row.IngredientId]['added'] = true;
                            if (row.IsDeleted == true) { //if is deleted restore
                                row.EntityStatus = 1;
                                row.IsDeleted = false;
                            }
                        }
                        return row;
                    });
                    angular.forEach(Object.values(obj), function (ingr) {
                        if (ingr['added'] != true)
                            $scope.addDetail('ProductExtras', ingr, true)
                    });
                    break; default: break;
            }
            $scope.manageingrs();
        }
        //a function to apply new default recipe object to list of product recipe 
        $scope.addDetail = function (type, forceIngr, byid) {
            var newobj = {};
            var c = angular.copy(emptyExtrasObj); angular.extend(newobj, c);
            //apply Product Id to entity and  append obj created to Product detail.DTO by type
            if (newobj != {}) {
                newobj.ProductId = $scope.data.Id;
                //newobj.Sort = findnextpossition($scope.data);
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

                $scope.data[type].push(newobj);
                $scope.isEdited = true; $scope.data.EntityStatus = 3;
            }
            $scope.sortDisplay();
            $scope.manageingrs();

        }
        $scope.sortDisplay = function () {
            var cnt = 1;
            angular.forEach($scope.data['ProductExtras'], function (ex) {
                if (ex.Sort != cnt && ex.EntityStatus != 0 && ex.IsDeleted != true && ex.EntityStatus != 2)
                    ex.EntityStatus = 1;

                if (ex.IsDeleted != true && ex.EntityStatus != 2) {
                    ex.Sort = cnt;
                    cnt++;
                } else { ex.Sort = null; }
            })
            $scope.isEdited = true; $scope.data.EntityStatus = 3;
        }

        $scope.RestPromice = {
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
        //when a product is selected from copy prop feature
        //this function applyies 
        $scope.manageIngsFromProductLoaded = manageifpl;
        function manageifpl(exarr) {
            var loop = (exarr.ProductExtras != undefined) ? exarr.ProductExtras : [];
            angular.forEach(loop, function (i) {
                var fltred = $scope.lookups['Ingredients'].filter(function (pe) { return pe.Id == i.IngredientId; });
                if (fltred != undefined && fltred.length > 0) {
                    var t = angular.copy(fltred[0]);
                    t['selected'] = false;
                    // extend obj to map default values to ingredients selection for clone and append
                    var extendItem = {
                        IsRequired: i.IsRequired,
                        MaxQty: i.MaxQty,
                        MinQty: i.MinQty,
                        UnitId: i.UnitId
                    }
                    t = angular.extend(t, extendItem);
                    $scope.toaddingrs.unshift(t);
                }
            })
            //console.log($scope.toaddingrs);
        }

        //remove detail mark entities as deleted to 
        //used to display red font 
        //and mark selected product as dirty
        $scope.removeDetail = function (type, row, index) {
            var sindex = $scope.data['ProductExtras'].indexOf(row);
            if (row.Id == 0) {
                $scope.data['ProductExtras'].splice(sindex, 1);
            } else {
                row.EntityStatus = 2;
                row.IsDeleted = true;
            }
            $scope.isEdited = true; $scope.data.EntityStatus = 3;
            $scope.sortDisplay();
            //$scope.markEdited();
        }
        //unmark deleted property to edited then allow to save
        $scope.refreshRow = function (type, row) {
            row.EntityStatus = 1;
            row.IsDeleted = false;
            $scope.isEdited = true; $scope.data.EntityStatus = 3;
            $scope.sortDisplay();
        }
        var emptyExtrasObj = { Id: 0, ProductId: 0, UnitId: null, IngredientId: null, IsRequired: false, MinQty: 0, MaxQty: 1, Sort: 0, EntityStatus: 0 };
        $scope.$watch('data.ProductCategoryId', function (newValue, oldValue) {
            if (newValue != undefined) {
                if ($scope.inrgManageType == 'insert' || $scope.inrgManageType == 'append')
                    $scope.manageingrs($scope.inrgManageType);
            }

        })
        $scope.init = function () {
            $scope.toaddingrs = []; $scope.compareExtras = {};
            $scope.searchp = null;
            $scope.directDesc = false;
            //$scope.viewTemplate = 'main-list';
            //$scope.manageingrs();
            $scope.manageingrs('display');
        }();
    })

    .directive('productBarcodesList', function () {
        return {
            templateUrl: 'app/scripts/directives/views-directives/product-modules/product-barcodes-template.html',
            controller: 'ProductBarcodesListCtrl', restrict: 'E',
            scope: { data: '=', isEdited: '=', lookups: '=' },
        }
    })
    .controller('ProductBarcodesListCtrl', function ($scope, $mdDialog, tosterFactory, DynamicApiService) {
        //this is a functions that handles display entity on list as deleted , inserted , edited
        //also on apply some kind of this change also mark product currying it as dirty
        $scope.markEditedDetail = function (ent) {
            if (ent.EntityStatus != 2 && ent.EntityStatus != 0) {
                ent['EntityStatus'] = 1;
                $scope.isEdited = true; $scope.data.EntityStatus = 3;

            }
        }
        //a function to apply new default recipe object to list of product recipe 
        $scope.addDetail = function (type) {
            var newobj = {};
            var c = angular.copy(emptyBarcodesObj); angular.extend(newobj, c);
            //apply Product Id to entity and  append obj created to Product detail.DTO by type
            if (newobj != {}) {
                newobj.ProductId = $scope.data.Id;
                $scope.data[type].unshift(newobj);
                $scope.isEdited = true; $scope.data.EntityStatus = 3;
            }
        }
        //remove detail mark entities as deleted to 
        //used to display red font 
        //and mark selected product as dirty
        $scope.removeDetail = function (type, row, index) {
            if (row.Id == 0) {
                $scope.data['ProductBarcodes'].splice(index, 1);
            } else {
                row.EntityStatus = 2;
                row.IsDeleted = true;
            }
            $scope.isEdited = true; $scope.data.EntityStatus = 3;

            //$scope.markEdited();
        }
        //unmark deleted property to edited then allow to save
        $scope.refreshRow = function (type, row) {
            row.EntityStatus = 1;
            row.IsDeleted = false;
            $scope.isEdited = true; $scope.data.EntityStatus = 3;

        }
        var emptyBarcodesObj = { Id: 0, ProductId: 0, Barcode: "", EntityStatus: 0 };

    })

    .directive('productPricesList', function () {
        return {
            templateUrl: 'app/scripts/directives/views-directives/product-modules/product-prices-template.html',
            controller: 'ProductPricesListCtrl', restrict: 'E',
            scope: { data: '=', isEdited: '=', lookups: '=', lookupObjects: '=' },
        }
    })
    .controller('ProductPricesListCtrl', function ($scope, $mdDialog, tosterFactory, DynamicApiService) {
        //this is a functions that handles display entity on list as deleted , inserted , edited
        //also on apply some kind of this change also mark product currying it as dirty
        $scope.markEditedDetail = function (ent) {
            if (ent.EntityStatus == undefined)
                ent['EntityStatus'] = -1;
            else if (ent.EntityStatus != 2 && ent.EntityStatus != 0) {
                ent['EntityStatus'] = 1;
                $scope.isEdited = true; $scope.data.EntityStatus = 3;
            }
        }

        //action to apply selected vat to all ProductPrices 
        $scope.applyMultiVat = function (multiVat) {
            if (multiVat == undefined || multiVat == 'null') {
                tosterFactory.showCustomToast('Nothing to apply.', 'info');
                return;
            }
            angular.forEach($scope.data.ProductPrices, function (i) {
                //apply vat id to dtos
                i.VatId = Number(multiVat);
                //manage if they change
                if (i.EntityStatus != 0)
                    i['EntityStatus'] = 1;
                $scope.isEdited = true; $scope.data.EntityStatus = 3;

            })
        }
        $scope.applyMultiTax = function (multiTax) {
            //if (multiTax == undefined || multiTax == 'null') {
            //    tosterFactory.showCustomToast('Nothing to apply.', 'info');
            //    return;
            //}
            var rtax = (multiTax == undefined || multiTax == 'null') ? null : Number(multiTax);
            angular.forEach($scope.data.ProductPrices, function (i) {
                //apply tat id to dtos
                i.TaxId = rtax;
                //manage if they change
                if (i.EntityStatus != 0)
                    i['EntityStatus'] = 1;
                $scope.isEdited = true; $scope.data.EntityStatus = 3;

            })
        }
        //on change 
        $scope.productPriceChange = function (dto, value) {
            var num = (dto.Price != null) ? Number(dto.Price.toFixed(2)) : 0.0;
            dto.Price = (num != undefined) ? num : 0.0;
            if (dto.EntityStatus != 0) {
                dto['EntityStatus'] = 1;
                $scope.isEdited = true; $scope.data.EntityStatus = 3;

            }
            //osa product sto loop twn trexwn ProductPrices exoun lookupPlId = me auto pou allakse 
            angular.forEach($scope.data.ProductPrices, function (item) {
                var tid = $scope.lookupObjects.Pricelist[item.PricelistId]['LookUpPriceListId'];
                if (tid == dto.PricelistId && item.PricelistId != tid) {
                    var c = $scope.lookupObjects.Pricelist[item.PricelistId];
                    var cPercent = (c.Percentage / 100);
                    var tnum = num * cPercent;
                    item.Price = Number(tnum.toFixed(2));
                    if (item.EntityStatus != 0) {
                        item['EntityStatus'] = 1;
                        $scope.isEdited = true; $scope.data.EntityStatus = 3;

                    }
                }
            })
        }
    })


    //Modal Controller for Products management
    //Policy that can be applied on insertion switched between NEW, CLONE, FILE_INS by initiallization policy template (also a button on bottomn left returns to init template)
    //Modal uses templates of Product Details mentioned above to handle single product insertion via NEW || CLONE
    //On File_INS there are 2 cards 1 on creating a file by selected Product Entities you wish to manage then a card of file_insertion that casts csv on productEntities
    .controller('ProductInsertModalCtrl', function ($scope, $mdDialog, $q, tosterFactory, dataUtilFactory, DynamicApiService, validationEntitiesFactory, lookupdata, savePolicy) {
        var vf = validationEntitiesFactory;
        //Strings of tooltips on clone Product Details
        $scope.crecstr = ''; $scope.cexstr = ''; $scope.cbarstr = ''; $scope.cprstr = '';
        //Empty Product for insert perposes
        var emptyProductObj = {
            Id: 0, Description: '', ExtraDescription: '', SalesDescription: '', Qty: 0, UnitId: null, PreparationTime: 0, KdsId: null, KitchenId: null,
            ImageUri: '', ProductCategoryId: null, Code: '', IsReturnItem: false, IsCustom: false, KitchenRegionId: null, IsDeleted: null, EntityStatus: 3, ProductBarcodes: [], ProductExtras: [], ProductPrices: [], ProductRecipe: [], loadedDetails: true
        };
        //Initiallization modal insertion function 
        $scope.init = function () {
            console.log('insertmodal policy chooser');
            $scope.lookupdata = lookupdata;
            $scope.savePolicy = ($scope.lookupdata.lastSavePolicy == undefined || $scope.savePolicyOptions[$scope.lookupdata.lastSavePolicy] == undefined) ? 'append' : $scope.lookupdata.lastSavePolicy;
            $scope.selectedClone = null; //obj used to clone a product
            $scope.checkErrorObj = {};
            $scope.valid2save = false;

            //Insertion of file variables
            //check on insert file to apply on product creation
            $scope.predefineDropDowns = false;
            //Variable to map products Created
            $scope.multiapply = {
                ProductCategoryId: null, UnitId: null, KdsId: null, KitchenId: null, KitchenRegionId: null
            }

            //Init View State to switch insertion policy
            $scope.switchCreationPolicy('ins-option');
        }
        //view State var and action fun to switch between modal functionality
        $scope.viewState = '';
        $scope.switchCreationPolicy = function (type) {
            $scope.viewState = type;
            switch (type) {
                //choice option template
                case 'ins-option':
                    $scope.templateOption = 'product-creation-choice-policy-template'; break;
                //Empty product template with form and details tab
                case 'new':
                    emptyProductObj.ProductPrices = angular.copy($scope.lookupdata.productPricesDTOs);
                    $scope.newproduct = vf.validate('Product', emptyProductObj);
                    $scope.templateOption = 'ins-prodmodal-tabs';
                    break;
                //autocomplete template to choose a product u wish to copy
                case 'clone':
                    $scope.templateOption = 'clone-product-selection-template'; break;
                // Same as insert template to manage form and Detail Tabs 
                case 'editclone':
                    $scope.templateOption = 'ins-prodmodal-tabs'; break;
                //template to allow user export constucted csv and manage import file
                case 'csv':
                    $scope.templateOption = 'generate-product-csv-template'; break;
                //Import File create Product objects with 2 tabs 1 with multi form entities apply and a collapse container for editing details
                case 'csv-import':
                    $scope.templateOption = 'file-imported-products-template'; break;
                case 'multi-save':
                    $scope.templateOption = 'multi-add-products-template'; break;
                default: break;
            }
        }
        //---------------------------------------------------------------------------------------------------
        //--------------------------------- CSV Import Export Functionality ---------------------------------
        //---------------------------------------------------------------------------------------------------

        //https://github.com/SheetJS/js-xlsx module implement Ref to Json Sheet Import File //http://oss.sheetjs.com/js-xlsx/ Demo
        //ref to create sheet from Json
        $scope.filename = "test";
        $scope.selectedExportEntities = []; //Array of properties as strings to create xls head data
        $scope.getArray = []; //This is an Array of Entities to add to file denerated //Used as empty

        //Provides full filename with .csv filetype
        $scope.provideFullFilename = function (fln) {
            //$scope.FullFilename = (fln + '.csv');
            if (fln != undefined && fln != '') { if (fln.substring(fln.length - 4, fln.length) != '.csv') { $scope.FullFilename = (fln + '.csv'); } else { $scope.FullFilename = (fln); } }
            return $scope.FullFilename;
        }
        //---------------------------------- Generate Csv Features ---------------------------------
        //Provides Header Fields for export file 
        $scope.getHeader = function (headfields) {return constructCsvHead(headfields); };
        //A function that gets selected fields and generates Header on your file
        function constructCsvHead(headarr) {
            var h, res, index;
            if (headarr == undefined || headarr.length == 0) h = ["Description", "Code"];
            else {
                index = headarr.indexOf("Code"); if (index == -1) headarr.unshift("Code");
                index = headarr.indexOf("Description"); if (index == -1) headarr.unshift("Description");
                h = angular.copy(headarr);
            }
            res = csvLiteralPricelists();
            return h.concat(res);
        }
        //function that takes lookups over pricelists and construct headerIdentification field for file import
        //String[i] = pl.Id:pl.Description
        function csvLiteralPricelists() {
            var pls = $scope.lookupdata.lookupObjects.Pricelist, res = [];
            angular.forEach(pls, function (pl, id) { var str = id + ':' + pl.Description; res.push(str); })
            return res;
        }

        //---------------------------------- CSV Import Functionality ---------------------------------
        //This is a function that applyies header drop downs on multi ins Edit template on all products
        //created from import and listed under fileImportedProds
        //('ProductCategoryId', multiapply)
        $scope.applyMultiVar = function (type, obj) {
            var entref = type, value = (obj[type] != undefined) ? obj[type] : null;
            if (type == undefined || value == undefined) { alert('Try to apply invalid data on products'); return; }
            //apply value on Product['propertytype']
            angular.forEach($scope.fileImportedProds, function (item) {
                if (item[entref] !== undefined) { item[entref] = value; } else { console.warn('No product Entity:' + entref + ' found with value:' + value + ' on item:'); console.log(item); }
                $scope.revalidate(item);
            })
        }
        //Function to handle product validity when a property is changed or a multi apply var is commited
        $scope.revalidate = function (p) {
            p = vf.validate('Product', p);
        }

        //this is the action function when an import is performed
        $scope.createProductObjects = function (file) {
            if (file == undefined) {
                tosterFactory.showCustomToast('No input file. Please provide a file', 'info');
                return;
            }
            //here we have an array of csv objs
            var arrobj = deserializeFile(file);
            if (arrobj == undefined || arrobj.length == 0) {
                tosterFactory.showCustomToast('No entries found on current file', 'info');
                return;
            }
            var prods = constructProducts(arrobj);
            if (prods == undefined || prods.length == 0) {
                tosterFactory.showCustomToast('No products created', 'warning');
                return;
            } else if (prods.length > 0) {
                $scope.fileImportedProds = angular.copy(prods);
                $scope.switchCreationPolicy('csv-import');
            }
            //var importFileProducts = createProductFromImport(prods)
        }
        //here an Array of objects with header file as properties is created
        function deserializeFile(obj) {
            var head = [], res = [];
            if (obj != undefined && obj.result != undefined && obj.result.length > 1) {
                angular.forEach(obj.result, function (txti, key) {
                    if (key == 0) {
                        head = CSVtoArray(txti[key]);
                    } else {
                        if (txti[0] != undefined) {
                            var regarr = CSVtoArray(txti[0]), newObj = {};
                            if (regarr != undefined && regarr.length > 0) {
                                angular.forEach(head, function (prop, i) { newObj[prop] = regarr[i]; })
                                res.push(newObj);
                            }
                        }
                    }
                })
            }
            return res;
        }
        //a Function to trigger when usage of predefined maps of drop downs is activated before generating products from file 
        //to append and multi var options on products 
        $scope.chpredef = function (value) {
            $scope.predefineDropDowns = value;
        }
        //REGEX replace on CSV with delimeter ','
        function CSVtoArray(text) {
            var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
            var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
            // Return NULL if input string is not well formed CSV string.
            if (!re_valid.test(text)) return null;
            var a = [];                     // Initialize array to receive values.
            text.replace(re_value, // "Walk" the string using replace with callback.
                function (m0, m1, m2, m3) {
                    // Remove backslash from \' in single quoted values.
                    if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
                    // Remove backslash from \" in double quoted values.
                    else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
                    else if (m3 !== undefined) a.push(m3);
                    return ''; // Return empty string.
                });
            // Handle special case of empty last value.
            if (/,\s*$/.test(text)) a.push('');
            return a;
        };
        //Create main form Entities of a new product
        //Copy Description to Extras and Sales 
        //Copy Code
        //Etc Field Adds
        //here an Array of header defined prods converted to Products
        function constructProducts(inprodarr) {
            //inp arr: of obj : Description , Code , plId:plName (i)
            var fileObjs = [];
            //For each Product inserted
            angular.forEach(inprodarr, function (prod) {
                //copy main values
                var cp = createBody(prod);
                //create product Prices
                var p = createPrices(prod, cp);
                if ($scope.predefineDropDowns == true && $scope.multiapply != undefined)
                    p = angular.extend(p, $scope.multiapply);
                p = vf.validate('Product', p)
                p['insfppd'] = false; //collapse var on multi edit prices template
                fileObjs.push(p);
            })
            if (fileObjs.length != inprodarr.length)
                alert('Missmatch on products length created.\n Something went wrong on transformation.\n Possible unhandled or error Construction products.\n Reinsert file after check to avoid conflicts');
            return (fileObjs);
        }
        //clones an empty product entity and replace its values with file imported  entities under main Properties
        function createBody(ins) {
            var newObj = angular.copy(emptyProductObj);
            var loop = Object.keys(newObj);
            angular.forEach(loop, function (k) {
                if (ins[k] != undefined) {
                    (k == 'PreparationTime') ? newObj[k] = Number(ins[k]) : newObj[k] = ins[k];
                }
                if (k == 'SalesDescription' && ins['SalesDescription'] == undefined)
                    newObj[k] = ins['Description'];
                if (k == 'ExtraDescription' && ins['ExtraDescription'] == undefined)
                    newObj[k] = ins['Description'];
            })
            return newObj;
        }
        //According to import products with product prices 
        function createPrices(prod, nob) {
            var ret = angular.extend({}, nob);
            var plsob = angular.extend([], $scope.lookupdata.lookupObjects.Pricelist);
            var prices = angular.extend({}, $scope.lookupdata.productPricesDTOs);
            angular.forEach(prices, function (dpl) {
                var temp = dpl.PricelistId + ':' + plsob[dpl.PricelistId].Description; //construct ref key over price ent
                var dplIns = angular.extend({}, dpl);
                if (prod[temp] != undefined) {
                    var price = Number(prod[temp]);
                    dplIns.Price = price;
                }
                ret.ProductPrices.push(dplIns);
            })
            return ret;
        }

        //A UI-function that appyies Algebra absolute AND over valid features
        $scope.isProdTValid = function (p) {
            return (p.vmodel.Barcodes == true && p.vmodel.Extras == true && p.vmodel.Overview == true && p.vmodel.Prices == true && p.vmodel.Recipes == true) ? true : false;
        }
        //On save multi products header function to apply selection on valid products
        $scope.toggle = function (forceapply) {
            $scope.fileImportedProds = $scope.fileImportedProds.map(function (i) {
                if ($scope.isProdTValid(i))
                    i['selected'] = forceapply;
                return i;
            })
        }
        //a function that is called on save changes 
        $scope.checkImportedToSave = function () {
            $scope.fileImportedProds = $scope.fileImportedProds.map(function (p) { p = vf.validate('Product', p); return p; })
            var codearr = $scope.fileImportedProds.map(function (val) { return { Id: val.Id, Code: val.Code }; })
            if ($scope.lookupdata.useunique == true) {
                $q.all({
                    multicodes: DynamicApiService.postAttributeRoutingData('Product', 'CheckUniqueProductCodes', codearr) //$scope.RestPromice.checkMultiCodes($scope.fileImportedProds)               //get pagged Results of Products
                }).then(function (d) {
                    //here manage price loaded to directive via pricelists
                    if (d.multicodes.data != null) {
                        var loaded = d.multicodes.data;
                        $scope.fileImportedProds = uniqueVsEdited(loaded, $scope.fileImportedProds);
                    }
                });
            } else { }
            $scope.switchCreationPolicy('multi-save');
        }
        //uses rest call to handle unique codes switched overview validation and parses same codes as tool tip
        function uniqueVsEdited(loaded, edited) {
            var g = dataUtilFactory.createEnumObjs(loaded, {}, 'Code');
            angular.forEach(edited, function (e) {
                if (g[e.Code] != undefined && g[e.Code].Cnt > 0 && g[e.Code].Cnt && g[e.Code].SameIds.length > 0) {
                    e['vmodel']['Overview'] = false,
                        e['vmodel']['SameCodes'] = g[e.Code].SameIds
                }
            })
            return edited;
        }
        $scope.multiAdded = [];
        //Save multiple products that are selected on product view
        $scope.saveMultipleProducts = function () {
            var tosave = [], rest = [];
            angular.forEach($scope.fileImportedProds, function (p) {
                if (p.Id == 0 && $scope.isProdTValid(p) == true)
                    tosave.push(p);
                else
                    rest.push(p);
            })

            $scope.processing = true; $scope.busyupdating = true;
            $q.all({
                multipostPromise: DynamicApiService.postAttributeRoutingData('Product', 'AddRange', tosave),//$scope.RestPromice.putMultiple(toedit),            //[Kds,Kitchen,KitchenRegion,ProductCategories,Units,Ingredient_ProdCategoryAssoc,Pricelist,Vat,Tax,Ingredients] lookups for Products management
            }).then(function (d) {
                //console.log('Rest multi update returned'); console.log(d.updatePromise);
                if (d.multipostPromise != -1) {
                    $scope.fileImportedProds = rest; //those who didnt save
                    var res = angular.copy(d.multipostPromise.data);
                    res = res.map(function (p) { p = vf.validate('Product', p); return p; })
                    $scope.fileImportedProds = $scope.fileImportedProds.concat(res)
                    $scope.multiAdded = $scope.multiAdded.concat(res);
                }
            }).finally(function () {
                $scope.busyupdating = false;
                if ($scope.busydeleting == false)
                    $scope.processing = false;
            })
        };
        //Close Modal then append Imports on 
        $scope.returnImports = function () {
            var appendArr = $scope.multiAdded.map(function (p) {
                p.EntityStatus = 5, p.loadedDetails = true;
                return p;
            })

            var ret = {
                model: appendArr,
                policy: 'append-imported'
            }
            //console.log('data to return'); console.log(ret);
            $mdDialog.hide(ret);
        }
        //------------------------------------------------------------------------------- Clone functionality -------------------------------------------------------------------------------
        //on Autocomplete selection this is a handle function on selected item changed
        $scope.clonedProductChanged = function (prod) {
            //console.log('CloneProduct Changed'); console.log($scope.selectedClone);
            var tp = angular.extend({}, prod);
            //string variables that are created for tooltips on clone selection 
            $scope.crecstr = ''; $scope.cexstr = ''; $scope.cbarstr = ''; $scope.cprstr = '';
            angular.forEach(prod.ProductRecipe, function (pr) { $scope.crecstr += lookupdata.lookupObjects.Ingredients[pr.IngredientId].Description + '<br>'; });
            angular.forEach(prod.ProductExtras, function (pr) { $scope.cexstr += lookupdata.lookupObjects.Ingredients[pr.IngredientId].Description + '<br>'; });
            angular.forEach(prod.ProductBarcodes, function (pr) { $scope.cbarstr += pr.Barcode + '<br>'; });
            angular.forEach(prod.ProductPrices, function (pr) { $scope.cprstr += '<div layout="row" layout-align="start space-between"><span>' + lookupdata.lookupObjects.Pricelist[pr.PricelistId].Description + ' :</span><span flex></span> <span>' + pr.Price + '</span></div><br>'; });


            tp.Id = 0, tp.Description = '', tp.ExtraDescription = '', tp.SalesDescription = '', tp.Code = '';
            tp.IsDeleted = null; tp.EntityStatus = 3;
            tp.ProductBarcodes = reinitcloneDetails(tp.ProductBarcodes);
            tp.ProductExtras = reinitcloneDetails(tp.ProductExtras);
            tp.ProductPrices = reinitcloneDetails(tp.ProductPrices);
            tp.ProductRecipe = reinitcloneDetails(tp.ProductRecipe);
            angular.forEach($scope.lookupdata.productPricesDTOs, function (item) {
                var found = tp.ProductPrices.filter(function (pp) {
                    return pp.PricelistId == item.PricelistId;
                })
                if (found == undefined || found.length == 0) {
                    var tmp = angular.extend({}, item);
                    tp.ProductPrices.push(tmp);
                }
            })

            $scope.newproduct = vf.validate('Product', tp);
            $scope.selectedClone = angular.extend({}, prod);

        }
        function reinitcloneDetails(arr) {
            var loop = arr;
            angular.forEach(loop, function (item) {
                item.ProductId = 0;
                item.Id = 0; item.EntityStatus = 0; item.IsDeleted = false;
            })
            return loop;
        }

        $scope.devlog = function (data) {
            console.log('******************************Dev Loging******************************');
            console.log(data);
        }
        //CAll FActory to validate model via vmodel
        $scope.validateProd = function (data) {
            $scope.templateOption = 'validation-product-template';
            $scope.viewState = 'validation-single';
            var modifiedData = vf.validate('Product', data), tmpvs = true;

            angular.forEach(modifiedData.vmodel, function (value) {
                if (value != true) tmpvs = value;
            })
            $scope.newproduct = angular.extend($scope.newproduct, modifiedData);
            $scope.checkErrorObj = modifiedData.vmodel;
            $scope.valid2save = tmpvs;
        }
        //modify action button on save policy template
        $scope.backToEdit = function () {
            $scope.valid2save = false;
            $scope.checkErrorObj = {};
            $scope.templateOption = 'ins-prodmodal-tabs';
            $scope.viewState = 'new';
        }

        $scope.hide = function () { $mdDialog.cancel(); };
        $scope.cancel = function () { $mdDialog.cancel(); };
        $scope.confirm = function (answer) {
            $q.all({
                postPromise: DynamicApiService.postSingle('Product', $scope.newproduct),            //[Kds,Kitchen,KitchenRegion,ProductCategories,Units,Ingredient_ProdCategoryAssoc,Pricelist,Vat,Tax,Ingredients] lookups for Products management
            }).then(function (d) {
                if (d.postPromise.data != null) {
                    var ret = {
                        model: d.postPromise.data,
                        policy: $scope.savePolicy
                    }
                    //console.log('data to return'); console.log(ret);
                    $mdDialog.hide(ret);
                }
            }).catch(function (message) {
                console.log('Catch save product promise error'); console.log(message);
                tosterFactory.showCustomToast('Product failed to save on server', 'error');
            })
        }
        $scope.savePolicyOptions = {
            append: { Description: 'Save & Append' },
            save: { Description: 'Save Only' },
            //reload: { Description: 'Save and Reload' },
        }
        $scope.policyChange = function (savePolicy) {
            $scope.savePolicy = savePolicy;
            //console.log(savePolicy);
        }

    })
    .controller('RestoreDeletedProductsCtrl', function ($scope, $mdDialog, $q, tosterFactory, DynamicApiService, lookupdata) {
        $scope.init = function () {
            $scope.products = []; $scope.loadDeleted();
            $scope.pcatEnum = lookupdata.ProductCategories;
            $scope.recoveredIds = [];
        }
        $scope.loadDeleted = function () {
            $scope.loading = true;
            var tmp = { IsDeleted: true };
            var params = 'page=1&pageSize=-1' + '&filters=' + JSON.stringify(tmp) + '&orFilter=false';
            $scope.RestPromice.searchFilteredProducts(params).then(function (result) {
                if (result.data != -1) { $scope.products = result.data.Results; } else { $scope.products = []; }
            }).catch(function (fail) { console.warn('Products failed to load is deleted'); }).finally(function () { $scope.loading = false; })
        }
        $scope.restoreProducts = function () {
            $scope.saving = true; var sarr = [];
            angular.forEach($scope.products, function (pi) {
                if (pi.selected == true) sarr.push(pi.Id);
            })
            if (sarr.length > 0) {
                //console.log('To restore Arr ids :' + sarr)
                $scope.RestPromice.RestoreIsDeleted(sarr).then(function (result) {
                    if (result.data != -1) {
                        $scope.recoveredIds = $scope.recoveredIds.concat(result.data);
                        $scope.loadDeleted();
                    }
                }).catch(function (fail) { console.warn('Products failed to load is deleted'); }).finally(function () { $scope.saving = false; })
            } else {
                $scope.saving = false;
            }

        }

        //Resources
        $scope.RestPromice = {
            //Filter searhed products 
            'searchFilteredProducts': function (filterparams) {
                return DynamicApiService.getDynamicObjectData('Product', filterparams).then(function (result) { //Rest Get call for data using Api service to call Webapi 
                    //console.log('Search result of products succeded.'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Searching Products yeild no results', 'fail'); console.warn('Get Product by Filters server failed. Reason:'); console.warn(rejection); return -1; });
            },
            'RestoreIsDeleted': function (idarr) {
                var params = idarr;
                return DynamicApiService.putAttributeRoutingData("Product", "RestoreIsDeleted", params).then(function (result) { //Rest Get call for data using Api service to call Webapi 
                    //console.log('Multi Recovery deleted products succeded.'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Restore deleted products failed', 'fail'); console.warn('Resource of restore product failed. Reason:'); console.warn(rejection); return -1; });

            }
        };
        //row click function to toggle selection of pi 
        $scope.selectProd = function (pr) { pr.selected = (pr.selected != true) ? true : false; }
        //header click selection function that triggers toggle to all 
        $scope.toggleSelection = function () {
            var t = true;
            for (var i = 0; i < $scope.products.length; i++) { if ($scope.products[i].selected == true) { t = false; break; } }
            $scope.products = $scope.products.map(function (pi) { pi.selected = t; return pi; })
            $scope.allchecked = t;
        }
        //Modal return functions
        $scope.hide = function () { $mdDialog.cancel(); };
        $scope.confirm = function (answer) {
            $mdDialog.hide($scope.recoveredIds);
        }
    })
    .controller('ProductSaveChangesModalCtrl', function ($scope, $mdDialog, $q, tosterFactory, DynamicApiService, validationEntitiesFactory, lookupdata) {
        //console.log('Saving modal proccess started');
        var vf = validationEntitiesFactory;
        $scope.init = function () {
            $scope.processing = false;
            $scope.busyupdating = false;
            $scope.busydeleting = false;
            $scope.succesfullyDeleted = []; $scope.succesfullyUpdated = [];
            $scope.excludedFromDelete = []; $scope.excludedFromUpdate = [];
            $scope.delarr = (lookupdata.deleteArray != undefined) ? lookupdata.deleteArray : []; //array of products where is deleted == true
            $scope.editarr = (lookupdata.editArray != undefined) ? lookupdata.editArray : []; // array of products where Entity status == 3 'edited'
            $scope.lookupObjects = lookupdata.lookupObjects; //obj of lookups to use as dropdown lookups
            $scope.templateOption = 'view-edited-template';
            //$scope.succesfullyDeleted = angular.copy($scope.delarr);$scope.succesfullyUpdated = angular.copy($scope.editarr);

        }()
        $scope.viewDetails = function (type) {
            switch (type) {
                case 'edit': $scope.templateOption = 'view-edited-selection-choice'; break;
                case 'delete': $scope.templateOption = 'view-deleted-selection-choice'; break;
                default: break;
            }
        }
        //Single Product Update on row file img click apply single save & handle entity
        $scope.saveSingleProduct = function (pr) {
            $scope.processing = true;
            $scope.busyupdating = true;
            if (pr == undefined) {
                tosterFactory.showCustomToast('No valid product to update.', 'info');
                return;
            }
            var pru = pr;
            $q.all({
                svp: $scope.RestPromice.putSingle(pru),            //[Kds,Kitchen,KitchenRegion,ProductCategories,Units,Ingredient_ProdCategoryAssoc,Pricelist,Vat,Tax,Ingredients] lookups for Products management
            }).then(function (d) {
                //console.log('Single update returned'); console.log(d.svp.data);
                if (d.svp.data != -1) { $scope.succesfullyUpdated.unshift(d.svp.data); var a = $scope.editarr.filter(function (item) { return (item.Id != pru.Id); }); $scope.editarr = a; }
            }).finally(function () {
                $scope.busyupdating = false;
                if ($scope.busydeleting == false)
                    $scope.processing = false;
            })
        };
        //Save multiple products that are selected on product view
        $scope.saveMultipleProducts = function (arr) {
            //alert('Save Multi');
            var toedit = $scope.editarr.filter(function (item) { return (item.selected == true); })
            if (toedit == undefined || toedit.length == 0) {
                //tosterFactory.showCustomToast('No products selected.', 'info');
                return;
            }
            $scope.processing = true; $scope.busyupdating = true;
            $q.all({
                updatePromise: $scope.RestPromice.putMultiple(toedit),            //[Kds,Kitchen,KitchenRegion,ProductCategories,Units,Ingredient_ProdCategoryAssoc,Pricelist,Vat,Tax,Ingredients] lookups for Products management
            }).then(function (d) {
                //console.log('Rest multi update returned'); console.log(d.updatePromise);
                if (d.updatePromise != -1) {
                    $scope.succesfullyUpdated = $scope.succesfullyUpdated.concat(d.updatePromise.data);
                    var a = $scope.editarr.filter(function (item) { return (item.selected != true); })
                    $scope.editarr = a;
                }
            }).finally(function () {
                $scope.busyupdating = false;
                if ($scope.busydeleting == false)
                    $scope.processing = false;
            })
        };
        //Single Product Delete
        $scope.deleteSingleProduct = function (pr) {
            //alert('Delete Single');
            $scope.processing = true; $scope.busydeleting = true;
            if (pr == undefined) {
                tosterFactory.showCustomToast('No valid product to delete.', 'info');
                return;
            }
            var prd = pr;
            $q.all({
                svp: $scope.RestPromice.deleteSingle(prd),            //[Kds,Kitchen,KitchenRegion,ProductCategories,Units,Ingredient_ProdCategoryAssoc,Pricelist,Vat,Tax,Ingredients] lookups for Products management
            }).then(function (d) {
                //console.log('Single delete returned'); console.log(d.svp);
                if (d.svp != -1) {
                    $scope.succesfullyDeleted.unshift(prd);
                    var a = $scope.delarr.filter(function (item) { return (item.Id != prd.Id); })
                    $scope.delarr = a;
                }
            }).finally(function () {
                $scope.busydeleting = false;
                if ($scope.busyupdating == false)
                    $scope.processing = false;
            })

        };
        //Delete multiple products
        $scope.deleteMultipleProducts = function (arr) {
            //alert('Delete Multi');
            var todel = $scope.delarr.filter(function (item) { return (item.selected == true); })
            if (todel == undefined || todel.length == 0) {
                //tosterFactory.showCustomToast('No products selected to delete.', 'info');
                return;
            }

            var ids = todel.map(function (i) { return i.Id; })
            $scope.processing = true; $scope.busydeleting = true;
            $q.all({
                delPromise: $scope.RestPromice.deleteMultiple(ids),            //[Kds,Kitchen,KitchenRegion,ProductCategories,Units,Ingredient_ProdCategoryAssoc,Pricelist,Vat,Tax,Ingredients] lookups for Products management
            }).then(function (d) {
                //console.log('Rest multi delete returned'); console.log(d.delPromise);
                if (d.delPromise != -1) {
                    $scope.succesfullyDeleted = $scope.succesfullyDeleted.concat(todel);
                    var a = $scope.delarr.filter(function (item) { return (item.selected != true); })
                    $scope.delarr = a;
                }
            }).finally(function () {
                $scope.busydeleting = false;
                if ($scope.busyupdating == false)
                    $scope.processing = false;
            })
        };
        //Key  Action to apply all changes 
        //First Toggles all available products for delete and update to selected true
        //then calls multi apply functions to save product changes 
        $scope.applyChanges = function () {
            $scope.toggle('edited', true);
            $scope.toggle('deleted', true);
            $scope.saveMultipleProducts();
            $scope.deleteMultipleProducts();
        }

        $scope.toggle = function (arraytype, forceapply) {
            switch (arraytype) {
                case 'edited':
                    $scope.editarr = $scope.editarr.map(function (i) {
                        if ($scope.validToEdit(i.vmodel))
                            i['selected'] = forceapply;
                        return i;
                    })
                    break;
                case 'deleted':
                    $scope.delarr = $scope.delarr.map(function (i) {
                        i['selected'] = forceapply;
                        return i;
                    })
                    break;
                default: break;
            }
        }
        $scope.validToEdit = function (vmodeli) {
            if (vmodeli.Overview != true || vmodeli.Recipes != true || vmodeli.Extras != true || vmodeli.Barcodes != true || vmodeli.Prices != true) {
                return false;
            } else {
                return true;
            }
        }

        //Resource actions over server 
        $scope.RestPromice = {
            putSingle: function (model) {
                return DynamicApiService.putSingle('Product', '', model).then(function (result) {
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Updating product failed', 'fail'); console.log('Single product put failed'); console.warn(rejection); return -1; });
            },
            putMultiple: function (arr) {
                return DynamicApiService.putAttributeRoutingData("Product", "UpdateRange", arr).then(function (result) { return result; })
                    .catch(function (rejection) { tosterFactory.showCustomToast('Update products in range failed.', 'fail'); console.warn('Update multiple products action failed. Reason:'); console.warn(rejection); return -1; });
            },
            deleteSingle: function (model) {
                return DynamicApiService.deleteSingle('Product', model.Id).then(function (result) { return result; })
                    .catch(function (rejection) { tosterFactory.showCustomToast('Single deleting product failed.', 'fail'); console.log('Single product delete failed'); console.warn(rejection); return -1; });
            },
            deleteMultiple: function (arr) {
                return DynamicApiService.deleteAttributeRoutingData("Product", "DeleteRange", arr).then(function (result) { return result; })
                    .catch(function (rejection) { tosterFactory.showCustomToast('Delete range of products failed.', 'fail'); console.warn('Delete multiple products action failed. Reason:'); console.warn(rejection); return -1; });
            }
        }


        $scope.logsars = function () {
            console.log('DEL-ARR');
            console.log($scope.delarr);
            console.log('EDIT-ARR');
            console.log($scope.editarr);
        }
        //Modal Return actions
        $scope.confirm = function (answer) {
            var ret = {
                updated: angular.copy($scope.succesfullyUpdated),
                deleted: angular.copy($scope.succesfullyDeleted)
            }
            $mdDialog.hide(ret);
        }
    })
    .filter('sortByRef', function (dataUtilFactory) {
        return function (arr, field, lookup) {
            var loop = arr.map(function (ai) { return ai; })
            loop.sort(function (a, b) {
                return (lookup[a[field]] > lookup[b[field]] ? 1 : -1);
            });
            return loop;
        };
    })
    .filter('filterByRef', function () {
        return function (arr, searchStr, fieldref, enumobj, boolField, boolValue) {
            var ret = [];
            if (searchStr == undefined && boolField == null && boolValue == null) {
                return arr;
            } else if ((searchStr == undefined || searchStr.length == 0) && boolField != null && boolValue != null) {
                angular.forEach(arr, function (ai) {
                    var boolEval = true;
                    if (boolValue != true) { boolEval = (ai[boolField] != true) ? true : false; } else { boolEval = (ai[boolField] == true) ? true : false; }
                    if (boolEval) return ret.push(ai);
                })
                return ret;
            } else {
                angular.forEach(arr, function (ai) {
                    var s = angular.lowercase(enumobj[ai[fieldref]]);
                    var found = s.indexOf(searchStr);
                    var boolEval = true;
                    if (boolField != null && boolValue != null) {
                        if (boolValue != true) { boolEval = (ai[boolField] != true) ? true : false; } else { boolEval = (ai[boolField] == true) ? true : false; }
                    }
                    if (found > -1 && boolEval) return ret.push(ai);
                })
                return ret;
            }
            //console.log(ai); console.log(searchStr); console.log(enumobj);
        };
    })
    .filter('filterDescCodeIngr', function () {
        return function (arr, searchStr, field, bvalue) {
            if (searchStr == null && field == null && bvalue == null) { return arr; }
            var ret = [];
            if (searchStr == null && field != null && bvalue != null) {
                // filter selected parsed without search string filter
                angular.forEach(arr, function (ai) {
                    var boolEval = true;
                    if (field != null && bvalue != null) {
                        if (bvalue != true) {
                            boolEval = (ai[field] != true) ? true : false;
                        } else {
                            boolEval = (ai[field] == true) ? true : false;
                        }
                    }
                    if (boolEval)
                        return ret.push(ai);
                })
            } else {
                // filter selected parsed
                angular.forEach(arr, function (ai) {
                    var s = angular.lowercase(ai['Description']), c = angular.lowercase(ai['Code']);
                    var boolEval = true;
                    if (field != null && bvalue != null) {
                        if (bvalue != true) {
                            boolEval = (ai[field] != true) ? true : false;
                        } else {
                            boolEval = (ai[field] == true) ? true : false;
                        }
                    }

                    if (((s != null && s.indexOf(searchStr) > -1) || (c != null && c.indexOf(searchStr) > -1)) && boolEval)
                        return ret.push(ai);
                })
            }
            //console.log(ai); console.log(searchStr); console.log(enumobj);
            return ret;
        };
    })
    .directive('productSearchAutoc', function () {
        return {
            template: '<md-autocomplete flex md-no-cache="true" md-selected-item="parseitem" md-search-text-change="searchTextChange(searchText)" md-search-text="searchText" md-items="item in querySearch(searchText)" md-selected-item-change="selectedItemChange(item)" md-item-text="item.Description" md-min-length="0" placeholder="Search products registered">'
            + '<md-item-template><span md-highlight-text="searchText" md-highlight-flags="^i">{{item.Code}} : {{item.Description}}</span></md-item-template>'
            + '<md-not-found>No products matching "{{searchText}}" on description or code were found.</md-not-found></md-autocomplete>',
            controller: 'productSearchAutocCtrl', restrict: 'E',
            scope: { itemChange: '=?', selectedItem: '=?' },
        }
    })
    .controller('productSearchAutocCtrl', function ($scope, $q, DynamicApiService, tosterFactory) {
        //variables to map with autocomplete directive
        $scope.simulateQuery = true; $scope.isDisabled = false; $scope.noCache = false;
        $scope.querySearch = querySearch; $scope.selectedItemChange = selectedItemChange; $scope.searchTextChange = void (0);
        $scope.parseitem = $scope.selectedItem;

        //function binded to search text over results
        function querySearch(query) {
            if (query == undefined || query == '')
                return [];
            var tmp = { Description: query, Code: query }; var params = 'page=1&pageSize=-1' + '&filters=' + JSON.stringify(tmp) + '&orFilter=true'; var results = [], deferred;
            if ($scope.simulateQuery) {
                deferred = $q.defer();
                $scope.RestPromice.searchFilteredProducts(params).then(function (result) {
                    results = result.data.Results; deferred.resolve(results);
                }).catch(function (fail) { console.warn('Products failed on description or code search'); deferred.resolve([]); })
                return deferred.promise;
            } else { return results; }
        }
        function searchTextChange(text) { }
        function selectedItemChange(selectedItem) {
            if (selectedItem == undefined || selectedItem === null || selectedItem == -1) {
                $scope.itemChange({});
                return;
            }
            $q.all({ detailsProduct: $scope.RestPromice.dynamicObjEntity('Product', 'did=' + selectedItem.Id + '&detailed=true'), }).then(function (d) {
                var ret = angular.copy(d.detailsProduct.data);
                if (ret == null) return;
                if ($scope.itemChange != undefined) {
                    $scope.selectedItem = angular.extend({}, ret);
                    $scope.itemChange(ret);
                }
                //$scope.manageIngsFromProductLoaded(ret.ProductExtras);
            })
        }
        $scope.RestPromice = {
            'searchFilteredProducts': function (filterparams) {
                return DynamicApiService.getDynamicObjectData('Product', filterparams).then(function (result) { //Rest Get call for data using Api service to call Webapi 
                    console.log('Search result of products succeded.'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Searching Products yeild no results', 'fail'); console.warn('Get Product by Filters server failed. Reason:'); console.warn(rejection); return -1; });
            },
            //Dynamic  rest call to load entity via params call products by filter and etc of entities by dynamic params created
            'dynamicObjEntity': function (entity, params) {
                return DynamicApiService.getDynamicObjectData(entity, params).then(function (result) {
                    return result;
                }).catch(function (error) { tosterFactory.showCustomToast('Loading ' + entity + ' failed', 'fail'); console.log('Fail Load'); console.log(error); return null; });
            },
        };
    });
function ProductRecListCtrl($scope, $mdDialog, tosterFactory, DynamicApiService, dataUtilFactory) {
    //this is a functions that handles display entity on list as deleted , inserted , edited
    //also on apply some kind of this change also mark product currying it as dirty
    $scope.ingDescEnum = dataUtilFactory.createEnums($scope.lookups['Ingredients'], {}, 'Id', 'Description');
    $scope.unitDescEnum = dataUtilFactory.createEnums($scope.lookups['Units'], {}, 'Id', 'Description');
    $scope.markEditedDetail = function (ent) {
        if (ent.EntityStatus != 2 && ent.EntityStatus != 0) {
            ent['EntityStatus'] = 1;
            $scope.isEdited = true; $scope.data.EntityStatus = 3;
        }
    }
    $scope.manageingrs = function (type) {
        console.log('Managing Ingredients:' + type);
        $scope.inrgManageType = type;
        switch (type) {
            case 'display': $scope.viewTemplate = 'view-recipe-ingredients'; break;
            case 'product':
                if ($scope.searchp != undefined && $scope.searchp != {})
                    $scope.manageIngsFromProductLoaded($scope.searchp.ProductRecipe);
                $scope.innerHeader = 'Select Recipe from product'; $scope.notLengthMSg = 'There are no recipe items matching selected product.';
                $scope.innerInfo = 'Action will mark as deleted recipe items included and not belong to cloning product and insert missing from selected to add.';
                $scope.viewTemplate = 'byproduct-recipe-choice-template';
                break;
            default: $scope.viewTemplate = 'edit-recipe-ingredients'; break;
        }
    }
    $scope.sortDisplay = function () {
        var cnt = 1;
        angular.forEach($scope.data['ProductRecipe'], function (ex) {
            if (ex.Sort != cnt && ex.EntityStatus != 0 && ex.IsDeleted != true && ex.EntityStatus != 2)
                ex.EntityStatus = 1;

            if (ex.IsDeleted != true && ex.EntityStatus != 2) {
                ex.Sort = cnt;
                cnt++;
            } else { ex.Sort = null; }
        })
        $scope.isEdited = true; $scope.data.EntityStatus = 3;
    }
    //a function to apply new default recipe object to list of product recipe 
    $scope.addDetail = function (type, forceIngr, byid) {
        var newobj = {};
        var c = angular.copy(emptyRecipesObj); angular.extend(newobj, c);
        //apply Product Id to entity and  append obj created to Product detail.DTO by type
        if (newobj != {}) {
            newobj.ProductId = $scope.data.Id;
            //newobj.Sort = findnextpossition($scope.data);
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

            $scope.data[type].push(newobj);
            $scope.isEdited = true; $scope.data.EntityStatus = 3;
        }
        $scope.sortDisplay();
        $scope.manageingrs();

    }
    //remove detail mark entities as deleted to 
    //used to display red font 
    //and mark selected product as dirty
    $scope.removeDetail = function (type, row, index) {
        //should i be ProductRecipe or product extras
        var sindex = $scope.data['ProductRecipe'].indexOf(row);
        //console.log('Missmatch Delete e'); console.log(row); console.log(index); console.log(sindex);
        if (row.Id == 0) {
            $scope.data['ProductRecipe'].splice(sindex, 1);
        } else {
            row.EntityStatus = 2;
            row.IsDeleted = true;
        }
        $scope.isEdited = true; $scope.data.EntityStatus = 3;
        $scope.sortDisplay();

    }
    //unmark deleted property to edited then allow to save
    $scope.refreshRow = function (type, row) {
        row.EntityStatus = 1;
        row.IsDeleted = false;
        $scope.isEdited = true; $scope.data.EntityStatus = 3;
        $scope.sortDisplay();
    }
    var emptyRecipesObj = { Id: 0, ProductId: 0, Qty: 0, UnitId: null, IngredientId: null, DefaultQty: 0, MinQty: 0, MaxQty: 1, Sort: 0, EntityStatus: 0 };


    //Clone Recipe functionallity
    $scope.toggleInsSelection = function (item) {
        (item.selected != true) ? item.selected = true : item.selected = false;
    }

    $scope.clearSelected = function (arr) { angular.forEach(arr, function (i) { i['selected'] = false; }); return; }
    $scope.selectAll = function (arr) { angular.forEach(arr, function (i) { i['selected'] = true; }); return; }
    $scope.manageIngsFromProductLoaded = manageifpl;
    function manageifpl(exarr) {
        var loop = (exarr.ProductRecipe != undefined) ? exarr.ProductRecipe : [];
        angular.forEach(loop, function (i) {
            var fltred = $scope.lookups['Ingredients'].filter(function (pe) { return pe.Id == i.IngredientId; });
            if (fltred != undefined && fltred.length > 0) {
                var t = angular.copy(fltred[0]);
                t['selected'] = false;
                // extend obj to map default values to ingredients selection for clone and append
                var extendItem = {
                    UnitId: i.UnitId,
                    DefaultQty: i.DefaultQty,
                    MaxQty: i.MaxQty,
                    MinQty: i.MinQty,
                    Qty: i.Qty
                }
                t = angular.extend(t, extendItem);
                $scope.toaddingrs.unshift(t);
            }
        })
        console.log($scope.toaddingrs);
    }
    $scope.appendIngredients = function () {
        var arr = $scope.toaddingrs.filter(function (i) { return i.selected == true; });
        var obj;
        switch ($scope.inrgManageType) {
            case 'product': case 'all':
                obj = dataUtilFactory.createEnumObjs(arr, {}, 'Id');
                $scope.data['ProductRecipe'] = $scope.data['ProductRecipe'].filter(function (row) {
                    if (obj[row.IngredientId] != undefined) {
                        obj[row.IngredientId]['added'] = true;
                        if (row.IsDeleted == true) { //if is deleted restore
                            row.EntityStatus = 1;
                            row.IsDeleted = false;
                        }
                    }
                    return row;
                });
                angular.forEach(Object.values(obj), function (ingr) {
                    if (ingr['added'] != true)
                        $scope.addDetail('ProductRecipe', ingr, true)
                });
                break; default: break;
        }
        $scope.manageingrs();
    }
    //----------------- End clone ingrs
    $scope.init = function () {
        $scope.toaddingrs = [];
        $scope.searchp = null;
        $scope.manageingrs('display');
    }();


    $scope.simulateQuery = false; $scope.isDisabled = false;
    // list of `state` value/display objects
    $scope.querySearch = querySearch;
    $scope.selectedItemChange = selectedItemChange;
    $scope.searchTextChange = searchTextChange;
    $scope.sitemBinded = function (id) {
        if (id == null) {
            return null;
        }
        var ret = $scope.lookups.Ingredients.filter(function (item) { return item.Id == id; });
        return (ret.length > 0) ? ret[0] : null;
    }
    $scope.newState = newState;
    function newState(state) { alert("Sorry! You'll need to create a Constitution for " + state + " first!"); }
    /** * Search for states... use $timeout to simulate * remote dataservice call. */
    function querySearch(query) {
        var results = query ? $scope.lookups.Ingredients.filter(createFilterFor(query)) : $scope.lookups.Ingredients;
        return results;
    }
    function createFilterFor(query) {
        var lowercaseQuery = query.toLowerCase();
        return function filterFn(state) {
            return ((state.Description != null && state.Description.indexOf(lowercaseQuery) === 0) || (state.Code != null && state.Code.indexOf(lowercaseQuery) === 0));
        };
    }

    function searchTextChange(text) {
        console.log('Text changed to ' + text);
    }
    function selectedItemChange(item, pr) {
        console.log('Item changed to ' + JSON.stringify(item));
        pr.IngredientId = item.Id;
    }
    /** Create filter function for a query string */

}