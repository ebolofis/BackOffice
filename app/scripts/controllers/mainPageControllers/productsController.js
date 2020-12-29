'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:ManageProductsController
 * @description
 * # DepartmentsController
 * Controller of the posBOApp to manage productDTO and its DTO entities including Recipe , Extras , Barcodes , PricelistDetails
 * Main Product-EntityEnum //loaded: 0, detailed: 1, created: 2, edited: 3, deleted: 4
 * Details Product-EntityEnum //{ inserted = 0 , edited = 1 , deleted = 2  , loaded =null || undefined }
**/

angular.module('posBOApp')
    .controller('ManageProductsController', ManageProductsController)
    .factory('validationEntitiesFactory', validationEntitiesFactory)

function ManageProductsController(tosterFactory, $stateParams, $rootScope, $scope, $filter, $http, $window, $q, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, validationEntitiesFactory, boutil, config) {
    //loaded: 0, detailed: 1, created: 2, edited: 3, deleted: 4 , imported: 5

    //variables to disable action buttons and Users actions 
    //[search products drop down] -- [load details enitties] --  [action on  save]  -- [check on change products list]
    $scope.searchingProcess = false; $scope.loadingTabs = false; $scope.savingProcess = false; $scope.ableChangeResults = true;
    $scope.selectedDisplayType = { Type: 'loaded' };

    //a product on map has those entities that are true if a modification applied to one of its entities 
    var editrefmodel = { formEdited: false, recipesEdited: false, extrasEdited: false, barcodesEdited: false, pricesEdited: false, };
    var productEntityStateEnum = { loaded: 0, detailed: 1, created: 2, edited: 3, deleted: 4 };
    //Empty DTO objects used for insertion 
    $scope.emptyProductObj = {
        Id: 0, Description: '', ExtraDescription: '', SalesDescription: '', Qty: 0, UnitId: null, PreparationTime: null, KdsId: null, KitchenId: null,
        ImageUri: '', ProductCategoryId: null, Code: '', IsReturnItem: false, IsCustom: false, KitchenRegionId: null, IsDeleted: null, EntityStatus: 0
    };
    $scope.productPricesDTO = { Id: 0, PricelistId: null, ProductId: null, Price: 0.0, PriceWithout: 0.0, VatId: null, TaxId: null, IngredientId: null, MinRequiredExtras: 0, IsDeleted: false, EntityStatus: 0 };
    $scope.pmap = {}; //a map of products loaded that keeps products as they loaded from db
    //Initiallization view Function
    var vf = validationEntitiesFactory; //initshortcut for validation factory

    $scope.initProc = {
        lookup: { Description: 'Loading lookups for Product entities', State: 'idle', ErrorMsg: '', fun: $scope.loadLookups },
        business: { Description: 'Loading setup configuration', State: 'idle', ErrorMsg: '', fun: $scope.loadSetup },
        data: { Description: 'Loading Products', State: 'idle', ErrorMsg: '', fun: $scope.loadProducts },
        mpp: { Description: 'Checking Missing Product Prices', State: 'idle', ErrorMsg: '', fun: $scope.loadMissingProdP },
        mip: { Description: 'Checking Missing Ingredient Prices', State: 'idle', ErrorMsg: '', fun: $scope.loadMissingIngrP },
        initiallizingView: { Description: 'Initiallizing View dependencies', State: 'idle', ErrorMsg: '' },
    }
    //Load Products Promise 
    //Checks Success and applies init promise policy
    $scope.loadProducts = loadProducts;
    function loadProducts() {
        $scope.initProc.data.State = 'idle';
        var deferred = $q.defer(), filter = createParamsFromFilter();
        var promise = $scope.RestPromice.dynamicObjEntity('Product', filter).then(function (d) {
            //here manage price loaded to directive via pricelists
            if (d != null && d.data != null) {
                var loaded = d.data; configureProductsLoaded(loaded); $scope.initProc.data.State = 'success'; deferred.resolve('success');
            } else { $scope.initProc.data.State = 'failed'; deferred.reject('failed'); }
        });
        return deferred.promise;
    }
    //Load Configuration Settings Promise 
    //Checks Success and applies init promise policy
    $scope.loadSetup = loadSetup;
    function loadSetup() {
        $scope.initProc.business.State = 'idle';
        var deferred = $q.defer();
        var promise = $scope.RestPromice.lookups('BusinessIntelligence').then(function (d) {
            if (d != null && d.data != null && d.data.LookUpEntities.BIPolicy.Product != undefined) {
                $scope.BIconf = d.data.LookUpEntities;
                $scope.initProc.business.State = 'success';
                if ($scope.BIconf != {} && $scope.BIconf.BIPolicy.Product.UniqueCode == true) { tosterFactory.showCustomToast('Unique Code save policy is active', 'info'); }
                deferred.resolve('success');
            } else {
                $scope.initProc.business.State = 'failed';
                deferred.reject('failed');
            }
        })
        return deferred.promise;

    }

    //Load LookUps Promise 
    //Checks Success and applies init promise policy
    $scope.loadLookups = loadLookups;
    function loadLookups() {
        $scope.initProc.lookup.State = 'idle';
        //$scope.initProc = angular.extend({} , $scope.initProc);
        var deferred = $q.defer();
        var promise = $scope.RestPromice.lookups('ProductsManage').then(function (d) {
            if (d != null && d.data != null) {
                //Sort dropdown lookup by description to apply easier selection
                $scope.lookups = d.data.LookUpEntities;
                var sorted = dataUtilFactory.quicksort($scope.lookups.ProductCategories, 'Description');
                $scope.lookups.ProductCategories = sorted;
                //initiallize of dtos by pricelist to append missing on load product
                createProductPricesDTOs();

                //Object that created lookups from array to an Object by id ref
                $scope.lookupObjects = {};
                angular.forEach(Object.keys($scope.lookups), function (key, value) {
                    //var idref = (key == 'ProductCategories') ? 'CategoryId' : 'Id';
                    var idref = 'Id';
                    $scope.lookupObjects[key] = dataUtilFactory.createEnumObjs($scope.lookups[key], {}, idref);
                })
                //Group and Sort Lookups for Ingredient Assocs
                var containerObjects = dataUtilFactory.groupTo($scope.lookups.Ingredient_ProdCategoryAssoc, 'ProductCategoryId'), sorted = {};
                angular.forEach(containerObjects, function (arr, pkey) { var ss = dataUtilFactory.quicksort(arr, 'Sort'); sorted[pkey] = ss; })

                $scope.lookups['ingrsByCat'] = angular.copy(sorted);
                $scope.lookupExtras = { ingrsByCat: $scope.lookups['ingrsByCat'], Units: $scope.lookups['Units'], Ingredients: $scope.lookups['Ingredients'], ProductCategories: $scope.lookupObjects['ProductCategories'], }
                $scope.lookupEnums = {
                    Units: dataUtilFactory.createEnums($scope.lookups['Units'], {}, 'Id', 'Description'),
                    Ingredients: dataUtilFactory.createEnums($scope.lookups['Ingredients'], {}, 'Id', 'Description'),
                    ProductCategories: dataUtilFactory.createEnums($scope.lookups['ProductCategories'], {}, 'Id', 'Description')
                }
                $scope.initProc.lookup.State = 'success'; deferred.resolve('success');
            } else {
                $scope.initProc.lookup.State = 'failed'; deferred.reject('failed');
            }
        });
        return deferred.promise;
    }

    $scope.loadMissingProdP = loadMissingPP;
    $scope.loadMissingIngrP = loadMissingIP;
    function loadMissingPP() { return loadMissing(false); }
    function loadMissingIP() { return loadMissing(true); }
    function loadMissing(ingrs) {
        if (ingrs != true) {
            $scope.initProc.mpp.State = 'idle'; ingrs = false;
        } else {
            $scope.initProc.mip.State = 'idle'; ingrs = true;
        }

        var deferred = $q.defer();
        var promise = $scope.RestPromice.checkMissingPrices(ingrs).then(function (d) {
            if (d != null && d.data != null) {
                var loaded = d.data;
                (ingrs == true) ? $scope.initProc.mpp.State = 'success' : $scope.initProc.mip.State = 'success';
                deferred.resolve(loaded);
            } else {
                (ingrs == true) ? $scope.initProc.mpp.State = 'failed' : $scope.initProc.mip.State = 'failed';
                deferred.reject(-1);
            }
        });
        return deferred.promise;
    }
    $scope.init = function () {
        $scope.displayOptionTemplate = 'initiallizing-products-template';
        $rootScope.stateName = 'Manage Products' 
        //angular.forEach($scope.initProc, function (value, key) { value.State = 'idle'; })
        $scope.devAccess = (config.workPolicy == 'dev') ? true : false;
        $scope.pricesMissmatch = { Products: [], Ingredients: [] };
        $scope.deleteAction = false; $scope.selectedProduct = null; $scope.filterCatCollapsed = false; $scope.searchingProcess = true; //init var to multi select delete
        $scope.selectedDisplayType.Type = 'loaded'; $scope.displayedProducts = []; //Display vars for drop down on products
        $scope.selectedFilters = { fpcat: null, fcode: "", fdesc: "" }; //initiallize filters var used to Create Predicate on Back-End used in collapse directive for specified Search
        $scope.paging = { total: 1, current: 1, onPageChanged: pagfun, pageSize: 20 }; $scope.currentPage = 1;//initiallize paggination vars
        $scope.BIconf = {}; //var that indicates current page variable and on change apply functionality
        //When all lookUps and products finished loading 
        var lookupPromise = $scope.loadLookups();       //[Kds,Kitchen,KitchenRegion,ProductCategories,Units,Ingredient_ProdCategoryAssoc,Pricelist,Vat,Tax,Ingredients] lookups for Products management
        var setupPromise = $scope.loadSetup();
        var productsPromise = $scope.loadProducts();    //get pagged Results of Products
        var missingProdPricePromise = $scope.loadMissingProdP();
        var missingIngrPricePromise = $scope.loadMissingIngrP();//

        //[Kds,Kitchen,KitchenRegion,ProductCategories,Units,Ingredient_ProdCategoryAssoc,Pricelist,Vat,Tax,Ingredients] lookups for Products management
        //get pagged Results of Products
        $q.all({ lookupPromise, setupPromise, productsPromise, missingProdPricePromise, missingIngrPricePromise }).then(function (d) {
            if (d.missingProdPricePromise != -1) { $scope.pricesMissmatch.Products = d.missingProdPricePromise; }
            if (d.missingIngrPricePromise != -1) { $scope.pricesMissmatch.Ingredients = d.missingIngrPricePromise; }
        }).finally(function () {
            $scope.searchingProcess = false;
            checkInitProperties();
        });
    }
    function checkInitProperties() {
        //lookup: //business: //data: //mpp: //mip:
        //initiallizingView:
        if ($scope.initProc.lookup.State == 'success' && $scope.initProc.business.State == 'success' && $scope.initProc.data.State == 'success' && $scope.initProc.mpp.State == 'success' && $scope.initProc.mip.State == 'success') {
            if ($scope.pricesMissmatch.Products.length > 0 || $scope.pricesMissmatch.Ingredients.length > 0) {
                var missm = {
                    Products: ($scope.pricesMissmatch.Products.length > 0) ? false : true,
                    Ingredients: ($scope.pricesMissmatch.Ingredients.length > 0) ? false : true,
                }
                MissMatchPricesModal(missm);
            } else {
                $scope.initProc.initiallizingView.State = 'success'; $scope.displayOptionTemplate = 'main-layout-template';
            }
        } else {
            $scope.initProc.initiallizingView.State = 'failed'; $scope.displayOptionTemplate = 'initiallizing-products-template';
        }
    }
    //Input is an obj{ Product: bool , Ingredients: bool} that represents witch entities are valid and which has missmatches
    function MissMatchPricesModal(fixedEnt) {
        var vats = $scope.lookups['Vat'];
        var lengths = {
            Products: $scope.pricesMissmatch.Products.length,
            Ingredients: $scope.pricesMissmatch.Ingredients.length,
        }
        var html = '<p>Products Autocorrection policy found prices missmatches.<br /> ({{lengths.Products}}) Products and/or ({{lengths.Ingredients}}) Ingredients with no Prices over Pricelists Edited.'
            + '<br />Do you want api to auto fix these references by vat selected and Price value at 0 cost ? <br /><br />'
            + '<small>*This action may take a while. After Process finish view will reloaded and this msg should not Repeat again.</small></p>';

        var template = '<md-dialog aria-label="AddNewProductModal" ng-cloak>'
            + '<md-toolbar><div class="md-toolbar-tools"><h2>Product Prices Missmatch</h2><span flex></span><md-button class="md-icon-button" aria-label="CloseModal" ng-click="close()"><md-icon md-svg-icon="navigation:close"></md-icon></md-button></div></md-toolbar>'
            + '<md-dialog-content  layout="column" layout-align="start stretch" flex>'
            + '<div class="md-padding" layout="row" layout-align="start stretch">'
            + '<div layout="column" layout-align="start stretch" flex ng-if="proccessing.Products != true &&  proccessing.Ingredients !=true">' + html
            + '<div layout="row" layout-align="start center" flex="grow">'
            + '<md-input-container class="md-block" required flex="50">'
            + '<label>Apply Vat</label><md-select name="SMissMatch vat" ng-model="selectedVatId" required><md-option ng-repeat="ch in vats" value="{{ch.Id}}">{{ch.Description}}</md-option></md-select>'
            + '</md-input-container>'
            + '</div></div>'
            + '<div layout="column" layout-align="start stretch" flex ng-if="proccessing.Products == true ||  proccessing.Ingredients==true">'
            + '<div layout="column" layout-align="center center" flex="grow" ><md-progress-circular md-mode="indeterminate"></md-progress-circular><span>Applying Missmatches...</span></div>'
            + '</div>'
            + '</div>'
            + '</md-dialog-content>'
            + '<md-dialog-actions layout="row" layout-align="end center">'
            + '<div><md-button  ng-if="fixed.Ingredients != true || fixed.Products != true" ng-click="close()" aria-label="CancelAction">Close</md-button>'
            + '<div><md-button  ng-if="fixed.Ingredients == true || fixed.Products == true" ng-click="close(\'done\')" aria-label="doneAction">Done</md-button>'
            + '<md-button ng-if="fixed.Products != true" ng-click="fix(selectedVatId , \'prod\')" class="md-raised" style="margin-right:20px;" aria-label="ConfAction">Products</md-button>'
            + '<md-button ng-if="fixed.Ingredients != true" ng-click="fix(selectedVatId , \'ingr\')" class="md-raised" style="margin-right:20px;" aria-label="ConfAction">Ingredients</md-button>'
            + '<md-button  ng-if="fixed.Ingredients != true || fixed.Products != true" ng-click="fix(selectedVatId , \'all\')" class="md-primary md-raised" style="margin-right:20px;" aria-label="ConfAction">Fix All</md-button>'
            + '</div>'
            + '</md-dialog-actions></md-dialog>';



        return ($mdDialog.show({
            controller: function ($scope, $mdDialog, $q, DynamicApiService, fixed, vats, lengths) {
                console.log('Hi i am the controller of modalauto fix missmatch on pls'); console.log(vats);

                $scope.vats = vats;
                $scope.selectedVatId = $scope.vats[0].Id;
                $scope.fixed = (fixed != undefined) ? fixed : { Products: false, Ingredients: false };
                $scope.proccessing = { Products: false, Ingredients: false };
                $scope.lengths = lengths;

                $scope.fix = function (vid, type) {
                    switch (type) {
                        case 'prod': fixMissMatches(vid); break;
                        case 'ingr': fixMissMatches(vid, true); break;
                        case 'all': default:
                            fixMissMatches(vid);
                            fixMissMatches(vid, true); break;
                    }
                }
                function fixMissMatches(vatid, searchingrs) {
                    (searchingrs) ? $scope.proccessing.Ingredients = true : $scope.proccessing.Products = true;
                    $scope.RestPromice.fixMissingPrices(vatid, searchingrs).then(function (result) {
                        if (result != null) {
                            (searchingrs) ? $scope.fixed.Ingredients = true : $scope.fixed.Products = true;
                            (searchingrs) ? $scope.lengths.Ingredients = 0 : $scope.lengths.Products = 0;
                        }
                    }).finally(function () {
                        (searchingrs) ? $scope.proccessing.Ingredients = false : $scope.proccessing.Products = false;
                    })
                }
                $scope.RestPromice = {
                    'checkMissingPrices': function (searchingrs) {
                        var ingrs = (searchingrs == true) ? true : false;
                        return DynamicApiService.getAttributeRoutingData('ProductPrices', 'GetMissingPrices/' + ingrs).then(function (result) {
                            (searchingrs) ? $scope.lengths.Ingredients = result.length : $scope.lengths.Products = result.length;
                            return result;
                        }).catch(function (error) {
                            tosterFactory.showCustomToast('Multi check on unique codes failed', 'fail'); console.log('Fail Load'); console.log(error); return null;
                        });
                    },
                    'fixMissingPrices': function (vatid, searchingrs) {
                        var ingrs = (searchingrs == true) ? true : false;
                        return DynamicApiService.postAttributeRoutingData('ProductPrices/FixMissingPrices', vatid + '/' + ingrs).then(function (result) {
                            return result;
                        }).catch(function (error) {
                            tosterFactory.showCustomToast('Multi check on unique codes failed', 'fail'); console.log('Fail Load'); console.log(error); return null;
                        });
                    }
                }

                $scope.cancel = function () { $mdDialog.cancel(); };
                $scope.close = function (type) {
                    $mdDialog.hide(type);
                }

            }, template: template,
            parent: angular.element('#wrapper'),
            clickOutsideToClose: false, fullscreen: true,
            resolve: { fixed: function () { return fixedEnt; }, vats: function () { return vats; }, lengths: function () { return lengths; } }
        }).then(function (data) {
            if (data != undefined) {
                $scope.init();
            } else {
                $scope.initProc.initiallizingView.State = 'success'; $scope.displayOptionTemplate = 'main-layout-template';
            }
        }, function (reason) { })
        )
    }
    ////////////////////////////// FUNCTIONALITY FUNS ////////////////////////////////////
    $scope.RestPromice = {
        //Resource of lookups needed to manage lockers and side entities of forms
        'lookups': function (nameType) {
            return DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { return result; }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Lookups failed', 'fail'); console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection); return null; });
        },
        //Dynamic  rest call to load entity via params call products by filter and etc of entities by dynamic params created
        'dynamicObjEntity': function (entity, params) {
            return DynamicApiService.getDynamicObjectData(entity, params).then(function (result) { return result; }).catch(function (error) { tosterFactory.showCustomToast('Loading ' + entity + ' failed', 'fail'); console.log('Fail Load'); console.log(error); return null; });
        },
        'checkMultiCodes': function (datarr) {
            return DynamicApiService.postAttributeRoutingData('Product', 'CheckUniqueProductCodes', datarr).then(function (result) { return result; }).catch(function (error) { tosterFactory.showCustomToast('Multi check on unique codes failed', 'fail'); console.log('Fail Load'); console.log(error); return null; });
        },
        'checkMissingPrices': function (searchingrs) {
            var ingrs = (searchingrs == true) ? true : false;
            return DynamicApiService.getAttributeRoutingData('ProductPrices', 'GetMissingPrices/' + ingrs).then(function (result) {
                return result;
            }).catch(function (error) {
                tosterFactory.showCustomToast('Multi check on unique codes failed', 'fail'); console.log('Fail Load'); console.log(error); return null;
            });
        },
        'fixMissingPrices': function (vatid, searchingrs) {
            var ingrs = (searchingrs == true) ? true : false;
            return DynamicApiService.postAttributeRoutingData('ProductPrices/FixMissingPrices', vatid + '/' + ingrs).then(function (result) {
                return result;
            }).catch(function (error) {
                tosterFactory.showCustomToast('Multi check on unique codes failed', 'fail'); console.log('Fail Load'); console.log(error); return null;
            });
        }
    }
    //on load pricelists create an array of productPrices Dtos
    //Those are default models provided to pricelists tab directive and used to append on missing pricelists of products loaded
    //$scope.productPricesDTOs <----------- ALL PRICELIST DTOS
    function createProductPricesDTOs() {
        $scope.productPricesDTOs = [];
        angular.forEach($scope.lookups.Pricelist, function (value) {
            var tmpObj = {
                PricelistId: value.Id,
                LookUpPriceListId: value.LookUpPriceListId,
                PricelistMasterId: value.PricelistMasterId,
                Percentage: value.Percentage,
                Id: 0, ProductId: null, Price: 0.0, PriceWithout: 0.0, VatId: $scope.lookups.Vat[0].Id, TaxId: null, IngredientId: null, MinRequiredExtras: 0, IsDeleted: false, EntityStatus: 0,
            }
            $scope.productPricesDTOs.push(tmpObj);
        })
    }
    //A fun that handles response over loaded REST answer
    //this is a default action function that manages returned products from resource and paggination update 
    //Append data to view vars
    function configureProductsLoaded(loaded) {
        if (loaded.Results.length < 1) { tosterFactory.showCustomToast('No Products found on these filters', 'info'); }
        //manage pagging
        if ($scope.paging.total != loaded.PageCount) $scope.paging.total = loaded.PageCount;
        if ($scope.paging.current != loaded.CurrentPage) $scope.paging.current = loaded.CurrentPage;
        $scope.currentPage = loaded.CurrentPage;
        //manage products 
        $scope.products = loaded.Results;
        var res = angular.copy(loaded.Results);
        appendToMap(res); //update products map 
        $scope.changeDP('loaded');
    }

    //When a product is loaded manage history products
    //a function that extend and updates map of products loaded 
    function appendToMap(arr) {
        angular.forEach(arr, function (prod) {
            var ent = {};
            var t = angular.extend({ EntityStatus: 0 }, prod);
            ent = angular.extend(ent, t);
            //creation state
            if ($scope.pmap[ent.Id] == undefined) {
                $scope.pmap[ent.Id] = ent;
            } else if ($scope.pmap[ent.Id] != undefined) {
                //total override
            }
        })
    }
    //a function that provides and array of ids to give a main lookup on products map
    //via selected view filter
    $scope.changeDP = changeDisplayProducts;
    function changeDisplayProducts(type) {
        $scope.displayedProducts = [];
        if ($scope.selectedProduct != null) {
            var busid = angular.copy($scope.selectedProduct);
            $scope.selectedProduct = null;
        }

        if (type != null)
            $scope.selectedDisplayType.Type = type;
        switch ($scope.selectedDisplayType.Type) {
            //loaded: 0, detailed: 1, created: 2, edited: 3, deleted: 4
            case 'loaded': $scope.displayedProducts = $scope.products.map(function (i) { return i.Id; }); break;
            case 'detailed': angular.forEach($scope.pmap, function (val, id) { if (val.EntityStatus > 0) $scope.displayedProducts.push(Number(id)); }); break;
            case 'created': angular.forEach($scope.pmap, function (val, id) { if (val.EntityStatus == 2) $scope.displayedProducts.push(Number(id)); }); break;
            case 'imported': angular.forEach($scope.pmap, function (val, id) { if (val.EntityStatus == 5) $scope.displayedProducts.push(Number(id)); }); break;
            case 'edited': angular.forEach($scope.pmap, function (val, id) { if (val.EntityStatus >= 3 && val.isDeleted != true && val.EntityStatus != 5) $scope.displayedProducts.push(Number(id)); }); break;
            case 'deleted': angular.forEach($scope.pmap, function (val, id) { if (val.isDeleted == true) $scope.displayedProducts.push(Number(id)); }); break;
            default: break;
        }
        //backup selected Id 
        if (busid != null) {
            var index = $scope.displayedProducts.indexOf(busid);
            if (index != undefined && index != -1) {
                $scope.selectedProduct = busid;
            }
        }
    }
    //a function that marks selected row as edited that is also mapped with scope.products list of drop down
    $scope.markEdited = function () { if ($scope.pmap[$scope.selectedProduct].EntityStatus < 3) $scope.pmap[$scope.selectedProduct].EntityStatus = 3; }

    //Function switched by entity called with External Params 
    //Fills LookUps Data and grids Data rows
    //On click master list of products
    // this function  triggers a resource to get detailed products
    $scope.changeSelectedProductId = function (dataid) {
        //there is a selected product manage its changes 
        if (dataid == undefined) { alert('Invalid Id of product data:' + dataid + '.'); return; } //check if data is empty
        $scope.selectedProduct = dataid;
        //load details from map update list of products and update map
        //loaded: 0, detailed: 1, created: 2, edited: 3, deleted: 4
        if ($scope.pmap[dataid].EntityStatus == 0 || $scope.pmap[dataid].EntityStatus == 2) {
            loadDetailsFromServer(dataid);
        }
    };
    //a load promise to server by product id provided
    //a policy variable that handles result action
    function loadDetailsFromServer(prod, policy) {
        $scope.loadingTabs = true;
        $q.all({ detailsProduct: $scope.RestPromice.dynamicObjEntity('Product', 'did=' + prod + '&detailed=true'), }).then(function (d) {
            var ret = angular.copy(d.detailsProduct.data);
            if (ret == null) return;
            if ($scope.pmap[ret.Id] != undefined) {
                var item = $scope.pmap[ret.Id];
                var prlength = ret.ProductPrices.length;
                //create details manage Product Prices
                var details = { ProductBarcodes: ret.ProductBarcodes, ProductExtras: sortByField(ret.ProductExtras, 'Sort'), ProductPrices: ret.ProductPrices, ProductRecipe: sortByField(ret.ProductRecipe, 'Sort'), emodel: angular.copy(editrefmodel) };
                var allPPs = manageProductPricesEntities(details.ProductPrices);
                details.ProductPrices = allPPs;
                //if policy is reload then loaded obj has to 
                if (policy == 'reload') {
                    item['EntityStatus'] = 1; //apply detailed flag
                    item = angular.extend(ret, details); //Caution on reload Extend with loaded
                } else {
                    //loaded: 0, detailed: 1, created: 2, edited: 3, deleted: 4
                    if (item.EntityStatus < 3 || item.EntityStatus == undefined) {
                        if (item.EntityStatus == 0)
                            item.EntityStatus = 1;
                        item = angular.extend(item, details); //On any other cases Extend with MAP item
                    }
                }
                //extend item with edit model && valid model
                vf.validate('Product', item);
                if (details.ProductPrices != null && prlength != allPPs.length) {
                    item['EntityStatus'] = 3;
                    item.emodel.pricesEdited = true;
                }
                $scope.pmap[ret.Id] = item;
            } else {
                alert('Loading or Discarding changes on Item of undefined.\nPlease refresh to avoid missmatches on products map');
            }
        }).finally(function () { $scope.loadingTabs = false; });

    }
    function sortByField(arr, sortfield) {
        var dpsLoaded = [], sortFielded = [], emptySort = [], sorted = [];
        //on ingredients loaded filter those with not sort defined sort them with quicksort then append
        angular.forEach(arr, function (item) {
            if (item.Sort == undefined) {
                emptySort.push(item);
            } else { sortFielded.push(item); }
        })
        try {
            sorted = dataUtilFactory.quicksort(sortFielded, sortfield);
        } catch (e) {
            console.warn('Trying to sort ingredients loaded error (append unsorted):');
            sorted = sortFielded;
        }
        dpsLoaded = sorted.concat(emptySort);
        return dpsLoaded;
    }


    //on product selection change 
    //apply productprice dto that are missing
    function manageProductPricesEntities(pps) {
        var ret = angular.copy(pps);
        angular.forEach($scope.productPricesDTOs, function (dto) {
            dto.EntityStatus = null;
            var found = [];
            found = pps.filter(function (i) { return i.PricelistId == dto.PricelistId; })
            if (found == 0) {
                console.log('PricelistDetails dto not found and appending'); console.log(dto);
                var inso = angular.extend({}, dto);
                inso.ProductId = $scope.selectedProduct;
                ret.push(inso);
            }
        })
        return ret;
    }

    /////////////////////////Single Product Actions//////////////////////////

    //function to reload map entity and dropdown product from server
    $scope.discardItemChanges = function (rowe) { (rowe == undefined) ? loadDetailsFromServer($scope.selectedProduct, 'reload') : loadDetailsFromServer(rowe, 'reload'); };
    //step wizard to insert a new product
    $scope.addProduct = function () {
        var lookupdata = {
            lookups: $scope.lookups,
            lookupExtras: $scope.lookupExtras,
            lookupObjects: $scope.lookupObjects,
            useunique: $scope.BIconf.BIPolicy.Product.UniqueCode,
            productPricesDTOs: $scope.productPricesDTOs,
            lastSavePolicy: $scope.lastSavePolicy
        }
        var savePolicy = $scope.lastSavePolicy;
        $mdDialog.show({
            controller: 'ProductInsertModalCtrl', templateUrl: 'app/scripts/directives/views-directives/product-modules/product-insert-modal-template.html',
            parent: angular.element('#wrapper'), clickOutsideToClose: false, fullscreen: true,
            resolve: { lookupdata: function () { return lookupdata; }, savePolicy: function () { return savePolicy; }, }
        }).then(function (data) {
            console.log('Create new product modal success and data:'); console.log(data);
            //APPEND imported products 
            if (data.policy == 'append-imported') {
                var imparr = data.model.map(function (prod) {
                    prod = angular.extend(prod, { emodel: editrefmodel });
                    if ($scope.selectedDisplayType.Type == 'loaded' || $scope.selectedDisplayType.Type == 'detailed' || $scope.selectedDisplayType.Type == 'created' || $scope.selectedDisplayType.Type == 'imported') {
                        $scope.displayedProducts.unshift(prod.Id);
                    }
                    return prod;
                });
                //bind imports to map
                angular.forEach(imparr, function (np) {
                    $scope.pmap[np.Id] = np;
                })
            } else {
                //Single Manage CLONE || INS
                $scope.lastSavePolicy = data.policy;
                //extend item with edit model
                var prod = data.model;
                prod = angular.extend(prod, { emodel: editrefmodel });
                //extend item with valid model
                vf.validate('Product', prod, {}); prod.EntityStatus = 2; $scope.pmap[data.model.Id] = prod;
                switch ($scope.lastSavePolicy) {
                    case 'append':
                        if ($scope.selectedDisplayType.Type == 'loaded' || $scope.selectedDisplayType.Type == 'detailed' || $scope.selectedDisplayType.Type == 'created') {
                            $scope.displayedProducts.unshift(prod.Id);
                        } break;
                    case 'reload': case 'save': default: break;
                }
            }
        }).catch(function () { console.log('Create new product modal error and data:'); });
    }
    //a function to trigger flag of delete 
    //actual delete will happen on save
    $scope.removeProduct = function (data) { if (data != null) { ($scope.pmap[data].isDeleted != true) ? $scope.pmap[data].isDeleted = true : $scope.pmap[data].isDeleted = false; } else { alert('There is no entity with current id to delete'); } }

    $scope.restoreIsDeleted = function () {
        var lookupdata = $scope.lookupEnums;
        $mdDialog.show({
            controller: 'RestoreDeletedProductsCtrl', templateUrl: 'app/scripts/directives/views-directives/product-modules/product-restore-deleted-modal-template.html',
            parent: angular.element('#wrapper'), clickOutsideToClose: false, fullscreen: true,
            resolve: { lookupdata: function () { return lookupdata; } }
        }).then(function (data) {
            //console.log('Restore Deleted Products:'); console.log(data);
            $scope.categoryfiltersChanged($scope.selectedFilters);
        })
    }
    //*****************************************************Search Products Functionality******************************************************************
    //Collapse panel Filtered Category button Action [Clear]
    $scope.clearCatFilters = function () { $scope.selectedFilters = { fpcat: null, fcode: "", fdesc: "" }; };
    //FILTERED REST PRODUCT Procedures
    //Collapse panel filters button action $$tip: move this to a directive on this controller
    $scope.toggleSearch = function () {
        $window.onclick = null; $scope.filterCatCollapsed = !$scope.filterCatCollapsed;
        if ($scope.filterCatCollapsed == true) {
            $window.onclick = function (event) {
                var target = $(event.target);
                if (target.parents('div#collapseFilterSearch').length < 1) {
                    if (target[0].getAttribute('id') == 'collapseFilterSearch') { return; } else { $scope.filterCatCollapsed = false; $scope.$apply(); }
                }
            };
        }
    };
    //function that toggles filter collapse when an other menu is activated
    $scope.checkToggleCollapsed = function () {
        if ($scope.filterCatCollapsed == false) return;
        $scope.toggleSearch();
    }
    //Collapse panel Filtered Category button Action [GO] Used only by Category Change
    //CAUTION make this to work with Description && other fields
    //Pagesize change functionality
    $scope.categoryfiltersChanged = function (selfilts) {
        $scope.filterCatCollapsed = false;
        $scope.currentPage = 0; $scope.paging.current = 1; //force change to load page 1 //leave this changed case pagfun will trigger when those 2 are different
        if (selfilts.fpcat == null && selfilts.fcode == "" && selfilts.fdesc == "") {
            pagfun(); return;
        } else {
            pagfun(selfilts); return;
        }
    }
    //event of pagged function mapped with paged Lockers REST Get
    function pagfun(param, force) {
        if ($scope.currentPage != $scope.paging.current || force == true) {
            $scope.currentPage = $scope.paging.current;
            $scope.searchingProcess = true;
            var filter = createParamsFromFilter(param);
            $q.all({
                productsPromise: $scope.RestPromice.dynamicObjEntity('Product', filter)               //get pagged Results of Products
            }).then(function (d) { //here manage price loaded to directive via pricelists
                if (d.productsPromise.data != null) {
                    var loaded = d.productsPromise.data;
                    configureProductsLoaded(loaded);
                }
                $scope.searchingProcess = false;
            });
        }
    }
    //this function creates parameters for products filtered call
    //create filter for products
    function createParamsFromFilter(params) {
        var parameters = 'page=' + $scope.currentPage + '&pageSize=' + $scope.paging.pageSize; var extr = '';
        if (params == "" || params == undefined)
            extr = "&filters={}";
        else {
            var tmp = {};
            if (params.fdesc != undefined && params.fdesc !== '') tmp.Description = params.fdesc;
            if (params.fcode != undefined && params.fcode !== '') tmp.Code = params.fcode;
            if (params.fpcat != undefined) tmp.ProductCategoryId = params.fpcat;
            extr = "&filters=" + JSON.stringify(tmp);
        }
        parameters += extr;
        return parameters;
    }
    //Switch Button on filter to apply multi delete mark policy
    $scope.deleteOptionView = function (boolchoice) {
        //variable binded to selection delete policy if true view of drop down will allow selection mark as deleted
        $scope.deleteAction = boolchoice;
    }
    //*************************************************** Search products by barcodes included *********************************************************
    //Var that user to search via barcode
    $scope.searchBarcodeInput = '';
    //function on enter keypress to handle sensors return event
    $scope.enterKeyBarcodeEvent = function (keyEvent, barcode) {
        $scope.searchBarcodeInput = barcode;
        if (keyEvent.which === 13) { if ($scope.searchBarcodeInput != undefined && $scope.searchBarcodeInput != '') { $scope.barcodeSearch(); } }
    }
    //A resource call on server to load products that has Barcodes DTO with searchBarcodeInput string
    $scope.barcodeSearch = function () {
        $scope.clearCatFilters();
        $scope.searchingProcess = true;
        //get pagged Results of Products
        $q.all({ productsPromise: $scope.RestPromice.dynamicObjEntity('Product', 'barcode=' + $scope.searchBarcodeInput) }).then(function (d) {
            //here manage price loaded to directive via pricelists
            if (d.productsPromise.data != null) {
                var loaded = d.productsPromise.data;
                var constret = { CurrentPage: 1, Extras: null, PageCount: 1, PageSize: $scope.paging.pageSize, Results: loaded, RowCount: loaded.length }
                configureProductsLoaded(constret);
            }
        }).finally(function () { $scope.searchingProcess = false; });
    }

    //$scope.clearBarcode = function () {
    //    $scope.searchBarcodeInput = '';
    //    $scope.clearCatFilters();
    //    $scope.selectedFilters = { fpcat: null, fcode: "", fdesc: "" };
    //    $scope.categoryfiltersChanged($scope.selectedFilters);
    //}

    //********************************************************* BASE SAVE - Discard All  - Develop Log ACTIONS *********************************************************
    //return an array of isdeleted products on the map used by save opperation before modal pops up
    function getDeleteProducts() { var arr = []; arr = Object.values($scope.pmap).filter(function (val) { return (val.isDeleted == true); }); return arr; };
    //a function to interate through map and return an array of type 3 status 
    //those are products new or not that has been edited
    function getEditProducts() {
        var arr = [], carr = [];
        angular.forEach(Object.values($scope.pmap), function (val) {
            vf.validate('Product', val);
            if (val.EntityStatus == 3 && val.isDeleted != true) {
                arr.push(val); carr.push({ Id: val.Id, Code: val.Code });
            }
        })
        return ({ maparr: arr, codearr: carr });
    }
    //a function that is called on save changes 
    $scope.saveGridChanges = function () {
        var eprods = getEditProducts();
        var lookupdata = {
            editArray: eprods.maparr,
            deleteArray: getDeleteProducts(),
            lookupObjects: $scope.lookupObjects,
        }
        if ($scope.BIconf.BIPolicy.Product.UniqueCode == true) {
            $q.all({
                multicodes: $scope.RestPromice.checkMultiCodes(eprods.codearr)               //get pagged Results of Products
            }).then(function (d) {
                //here manage price loaded to directive via pricelists
                if (d.multicodes.data != null) {
                    var loaded = d.multicodes.data;
                    lookupdata.editArray = uniqueVsEdited(loaded, lookupdata.editArray)
                    modalSave(lookupdata);
                }
            });
        } else { modalSave(lookupdata); }
    }
    //uses rest call to handle unique codes switched overview validation and parses same codes as tool tip
    function uniqueVsEdited(loaded, edited) {
        var g = dataUtilFactory.createEnumObjs(loaded, {}, 'Id');
        angular.forEach(edited, function (e) {
            if (g[e.Id] != undefined && g[e.Id].Cnt > 0 && g[e.Id].Cnt && g[e.Id].SameIds.length > 0) {
                e['vmodel']['Overview'] = false,
                    e['vmodel']['SameCodes'] = g[e.Id].SameIds
            }
        })
        return edited;
    }
    //a function that triggers save modal functionality
    function modalSave(pdata) {
        $mdDialog.show({
            controller: 'ProductSaveChangesModalCtrl', templateUrl: 'app/scripts/directives/views-directives/product-modules/product-save-changes-modal-template.html',
            parent: angular.element('#wrapper'), clickOutsideToClose: false, fullscreen: true,
            resolve: { lookupdata: function () { return pdata; }, }
        }).then(function (data) { manageSaveReturn(data); })
    }
    //function that restores variables of main view 
    //handles map by deleting entities that have been managed
    //and reloads last query results based on view choice
    function manageSaveReturn(data) {
        $scope.selectedProduct = null;
        angular.forEach(data.updated, function (item) { delete $scope.pmap[item.Id]; });
        angular.forEach(data.deleted, function (item) { delete $scope.pmap[item.Id]; });
        $scope.categoryfiltersChanged($scope.selectedFilters); $scope.selectedDisplayType.Type = 'loaded';
    }


    //Discarding changes has been an easy feature
    //by deleteing entities on the map that has isdeleted or entity state not loaded you get by reload the extend of the map
    //empty selected product to 
    $scope.discardAllChanges = function () {
        var discdial = $mdDialog.confirm().title('Discard all Changes').textContent('You are about to discard all changes on loaded products. Proceed ?').ariaLabel('msndialoglabel').ok('Discard').cancel('Cancel');
        $mdDialog.show(discdial).then(function () {
            $scope.selectedProduct = null;
            var idkeys = Object.keys($scope.pmap);
            angular.forEach(idkeys, function (cid) {
                if ($scope.pmap[cid].EntityStatus >= 3 || $scope.pmap[cid].isDeleted == true) {
                    delete $scope.pmap[cid];
                }
            })
            $scope.categoryfiltersChanged($scope.selectedFilters);
        });
    }

    //********************************* Develop Helper Functions *********************************************
    //Call of validation factory to check current map[data]
    $scope.validationCheckOverProduct = function (data) {
        if (data != undefined && $scope.pmap[data] != undefined) {
            var isValid = vf.validate('Product', $scope.pmap[data]);
        }
    }
    //Single Dummy button action to log row selected and map by id entity
    $scope.logSelected = function () {
        var p = $scope.products.filter(function (pi) { return pi.Id == $scope.selectedProduct; })
        if (p.length > 1)
            alert('More than one products with same id {{' + $scope.selectedProduct + '}} on droplist ');
        console.log('Logging selected Product by id :' + $scope.selectedProduct);
        console.log('Ref Product Array '); console.log(p[0]);
        console.log('Ref on map:'); console.log($scope.pmap[$scope.selectedProduct]);
    }
    $scope.logMap = function () { console.log('*********Products Map ********'); console.log($scope.pmap); }
    $scope.logDisplayed = function () {
        var viewparr = {};
        angular.forEach($scope.displayedProducts, function (key) {
            viewparr[key] = $scope.pmap[key];
        })
        console.log('Logging Display Array');
        console.log(viewparr);
    }
    $scope.logEntity = function (ent) {
        console.log(ent);
    }

    //********************************************************* NOT IMPLEMENTED ACTIONS *********************************************************

    //$scope.IngredianetsByCategory
    $scope.appendMissingCategoryIngrs = function () {
        var prod = $scope.pmap[$scope.selectedProduct];
        tosterFactory.showCustomToast('No Ingredients mapped in selected Product Category.', 'info');

        angular.forEach($scope.lookups['ingrsByCat'][prod.ProductCategoryId], function (value) {
            var ingrId = value.IngredientId, cobj = $scope.ingredientsEnumObjs[ingrId];
            if (cobj.Id !== ingrId)
                tosterFactory.showCustomToast('Ingredient Association does not match current Id', 'error');
            var newobj = {
                IngredientId: ingrId, UnitId: cobj.UnitId, Description: cobj.Description, selected: true
            }
            catMatchIngrs.push(newobj);
        })
        $scope.popConfirmationMsgModal('Insert also selected category Ingredients(' + catMatchIngrs.length + ') in extras grid ?').result.then(function (data) {
            //insert new Extras regs
            var copy = angular.copy($scope.emptyExtrasObj);
            angular.forEach(catMatchIngrs, function (item) {
                copy.IngredientId = item.IngredientId;
                copy.UnitId = item.UnitId;
                $scope.addSubGridEntity('Extras', copy);
            })
        }, function (reason) { });
    }
    //modal to perform confirmation action in deletion
    $scope.popConfirmationMsgModal = function (header, content, ashtml) {
        var msgdialog
        if (ashtml != undefined && ashtml == true) {
            msgdialog = $mdDialog.confirm().title(header).htmlContent(content).ariaLabel('msndialoglabel').ok('Ok').cancel('Cancel');
        } else {
            msgdialog = $mdDialog.confirm().title(header).textContent(content).ariaLabel('msndialoglabel').ok('Ok').cancel('Cancel');
        }
        return ($mdDialog.show(msgdialog));
    }

    //////////////////////////Not used /////////////////////////
    $scope.pricelistAutoFixModal = function (debugVatNullArray) {
        var checkModel = {
            vatNullArray: debugVatNullArray,
            vatEnum: $scope.vatDescEnum,
            taxEnum: $scope.taxDescEnum,
            pricelistEnum: $scope.pricelistsEnum
        }
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
        $mdDialog.show({
            controller: 'PricelistAutoFix', templateUrl: '../app/scripts/directives/gridDirectives/product-prices-pricelistfix-modal.html',
            parent: angular.element('#wrapper'),//document.body),//targetEvent: ev,
            clickOutsideToClose: true, fullscreen: useFullScreen,
            resolve: {
                checkModel: function () { return checkModel; },
            }
        }).then(function (data) { });
    };

    function checkNullVatId(entity) {
        angular.forEach(entity.ProductPricesModelDetails, function (value) {
            if (value.VatId === null || value.VatId === undefined) {
            }
        });
    }


}

//Factory for product validation actions over details and overview provides an extra entity on product object
//This obj charecterizes valid entities of details    and overview  
//Factory is also responsible to get unique code for the object that manages or use it as an independent functionality
function validationEntitiesFactory(DynamicApiService, $q, tosterFactory) {
    var vf = {};
    //action validate by type
    vf.validate = function (type, data) {
        var ret;
        switch (type) {
            case 'Product': ret = ProductValidation(data); return ret; break;
            default: break;
        }
    }
    //------------------------ Product Validation ------------------------
    function ProductValidation(prod) {
        var uniquepf = true;
        var formCheck = checkForm(prod); prod = formCheck.model;
        var recCheck = checkRecipes(prod.ProductRecipe); prod.ProductRecipe = recCheck.model;
        var extraCheck = checkExtras(prod.ProductExtras); prod.ProductExtras = extraCheck.model;
        var barCheck = checkBarcodes(prod.ProductBarcodes); prod.ProductBarcodes = barCheck.model;
        var priceCheck = checkPrices(prod.ProductPrices); prod.ProductPrices = priceCheck.model;
        //an Apply feature product property that indicates if overview and details of product are  valid to save through Front-End Ui
        var vmodel = { Overview: formCheck.state, Recipes: recCheck.state, Extras: extraCheck.state, Barcodes: barCheck.state, Prices: priceCheck.state, }

        prod['vmodel'] = vmodel;
        //console.log('Validation Result:'); console.log(vmodel);
        return prod;
    }
    //a function that corrects field by dropdown or input that is string ''null'' to null object
    function clearnull(entfield) {
        if (entfield == 'null')
            return null;
        return entfield;
    }

    function checkForm(obj) {
        //console.log('Validation over Form:');
        var valid = true;
        // !!! repeat feature has to be before if check cause elements that has drop downs has to auto correct fron 'null' -> null
        angular.forEach(["UnitId", "PreparationTime", "KdsId", "KitchenId", "KitchenRegionId", "ProductCategoryId"], function (ent) {
            obj[ent] = clearnull(obj[ent]);
        })
        if (obj.ProductCategoryId == null) valid = false;
        if (obj.Description == null || obj.Description.length <= 0) valid = false;
        if (obj.ExtraDescription == null || obj.ExtraDescription.length <= 0) valid = false;
        if (obj.SalesDescription == null || obj.SalesDescription.length <= 0) valid = false;
        if (obj.Code == null || obj.Code.length <= 0) valid = false;

        var ret = { state: valid, model: obj };
        return ret;
    }
    function checkRecipes(arr) {
        //console.log('Validation over Recipes:');
        var valid = true;
        if (arr.length == 0) return { state: true, model: arr };

        angular.forEach(arr, function (item) {
            // !!! repeat feature has to be before if check cause elements that has drop downs has to auto correct fron 'null' -> null
            angular.forEach(["UnitId", "IngredientId"], function (ent) {
                item[ent] = clearnull(item[ent]);
            })
            if (item.IsDeleted != true && item.EntityStatus != 2) {
                //if (item.Qty == null || item.Qty < 0) valid = false;
                if (item.UnitId == null || item.UnitId == 'null') valid = false;
                if (item.IngredientId == null || item.IngredientId == 'null') valid = false;
                //if (item.DefaultQty == null || item.DefaultQty < 0) valid = false;
                //if (item.MinQty == null || item.MinQty < 0) valid = false;
                //if (item.MaxQty == null || item.MinQty < 0) valid = false;
            }

        })
        var ret = { state: valid, model: arr }
        return ret;
    }
    function checkExtras(arr) {
        //console.log('Validation over Extras:');
        if (arr.length == 0) return { state: true, model: arr };
        var valid = true;
        angular.forEach(arr, function (item) {
            // !!! repeat feature has to be before if check cause elements that has drop downs has to auto correct fron 'null' -> null
            angular.forEach(["UnitId", "IngredientId"], function (ent) {
                item[ent] = clearnull(item[ent]);
            })
            if (item.IsDeleted != true && item.EntityStatus != 2) {
                if (item.UnitId == null || item.UnitId == 'null') valid = false;
                if (item.IngredientId == null || item.IngredientId == 'null') valid = false;
                //if (item.MinQty == null || item.MinQty < 0) valid = false;
                //if (item.MaxQty == null || item.MinQty < 0) valid = false;
            }

        })
        var ret = { state: valid, model: arr }
        return ret;
    }
    function checkBarcodes(arr) {
        //console.log('Validation over Barcodes:');
        if (arr.length == 0) return { state: true, model: arr };
        var valid = true;
        angular.forEach(arr, function (item) {
            if (item.EntityStatus != 2 && (item.Barcode == null || item.Barcode.length <= 0)) valid = false;
        })
        var ret = { state: valid, model: arr }
        return ret;
    }
    function checkPrices(arr) {
        //console.log('Validation over Prices:');
        var valid = true;
        angular.forEach(arr, function (item) {
            // !!! repeat feature has to be before if check cause elements that has drop downs has to auto correct fron 'null' -> null
            angular.forEach(["VatId", "TaxId"], function (ent) { item[ent] = clearnull(item[ent]); });
            if (item.VatId == null) valid = false;
            if (Number(item.Price) == null || Number(item.Price) < 0) valid = false;

        })
        var ret = { state: valid, model: arr }
        return ret;
    };
    //this is a Rest call action of product
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
        }).catch(function () {
            tosterFactory.showCustomToast('Error on checking unique code of product.', 'error'); return false;
        }));
    }
    return vf;
}