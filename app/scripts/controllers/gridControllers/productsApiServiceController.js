'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:DeparmentsServiceController
 * @description
 * # DepartmentsController
 * Controller of the posBOApp
 */

angular.module('posBOApp')
.controller('ProductsServiceController', ['$rootScope', 'tosterFactory', '$stateParams', '$scope', '$filter', '$http', '$window', '$log', '$timeout', '$q', '$interval', '$uibModal', '$mdDialog', '$mdMedia', 'uiGridConstants', 'uiGridGroupingConstants', 'DynamicApiService', 'GridInitiallization', 'uiGridFactory', 'dataUtilFactory', 'FileUploader',
function ($rootScope, tosterFactory, $stateParams, $scope, $filter, $http, $window, $log, $timeout, $q, $interval, $uibModal, $mdDialog, $mdMedia, uiGridConstants, uiGridGroupingConstants, DynamicApiService, GridInitiallization, uiGridFactory, dataUtilFactory, FileUploader) {
    $scope.uploader;// = new FileUploader();

    $scope.units = []; $scope.unitsEnum = {};
    $scope.productCategories = []; $scope.productCategoriesEnum = {}; $scope.productCategoriesEnumObect = [];
    $scope.ingredients = []; $scope.ingredientsEnum = {};
    $scope.kitchenRegion = []; $scope.kitchenRegionEnum = {};
    $scope.kitchen = []; $scope.kitchenEnum = {};
    $scope.kds = []; $scope.kdsEnum = {};
    $scope.products = []; $scope.productsEnum = {}; $scope.productsEnumObject = [];
    $scope.filterCatCollapsed = true;
    $scope.gridPaginationOptions = { pageNumber: 1, pageSize: 20, sort: null };
    $scope.tmap = { UnitId: [], KitchenId: [], KdsId: [], KitchenRegionId: [], ProducProductCategoryId: [] }
    $scope.selectedRowProducts = { entity: {}, asdf: true }; $scope.haveSelectedRow = false;
    $scope.showDivSelection = 'overview'; //var to display  tabs  used for animation to show each tab 
    $scope.selectedRowExtras = null; $scope.selectedRowBarcodes = null; $scope.selectedRowRecipes = null;
    $scope.recipesGrid = {}; $scope.extrasGrid = {}; $scope.productGrid = {};
    //boolean vars check if subgrids has dirty rows
    $scope.dirtyRecipes = false, $scope.dirtyBarcodes = false, $scope.dirtyExtras = false; $scope.dirtyOverview = false; $scope.isGridRowDirty = false; $scope.ableChangeRow = true;
    $scope.dirtyPrices = false;
    //Empty Objects used for insertion on each grid
    $scope.emptyProductObj = {
        Id: 0, Description: '', ExtraDescription: '', SalesDescription: '', Qty: 0, UnitId: null, PreparationTime: null, KdsId: null, KitchenId: null,
        ImageUri: '', ProductCategoryId: null, Code: '', IsReturnItem: false, IsCustom: false, KitchenRegionId: null, IsDeleted: null, EntityStatus: 0, ProductPricesModelDetails: []
    };
    $scope.emptyRecipesObj = { Id: 0, ProductId: 0, Qty: 0, UnitId: 0, IngredientId: 0, DefaultQty: 0, MinQty: 0, MaxQty: 1, Action: '<div class="ui-grid-cell-contents"><button type="button"class="btn btn-xs btn-danger" ng-click="grid.appScope.removeRecipe(row)"><i class="fa fa-trash-o"></i></button></div>', EntityStatus: 0 };
    $scope.emptyExtrasObj = { Id: 0, ProductId: 0, UnitId: 0, IngredientId: 0, IsRequired: false, MinQty: 0, MaxQty: 1, Sort: null, Action: '<div class="ui-grid-cell-contents"><button type="button"class="btn btn-xs btn-danger" ng-click="grid.appScope.removeExtras(row)"><i class="fa fa-trash-o"></i></button></div>', EntityStatus: 0 };
    $scope.emptyBarcodesObj = { Id: 0, ProductId: 0, Barcode: "", Action: '<div class="ui-grid-cell-contents"><button type="button"class="btn btn-xs btn-danger" ng-click="grid.appScope.removeBarcode(row)"><i class="fa fa-trash-o"></i></button></div>', EntityStatus: 0 };
    //var used to Create Predicate on Back-End used in collapse directive for specified Search
    $scope.selectedFilters = { fpcat: null, fcode: "", fdesc: "" };
    //Array to save Registers loaded from server and deleted in Sub grids
    $scope.arrToDel = { recipesEntities: [], extrasEntities: [], barcodesEntities: [] };
    $scope.filterCatCollapsed = false;
    $scope.overviewEntity = [];
    ////////////////////////////////////////////////////////////////
    /////////////////INITIALLIZATION DEFINITIONS////////////////////
    ////////////////////////////////////////////////////////////////
    //Grids initiallization 
    $scope.gridLoadedParams = GridInitiallization.initProductGridParams();
    $scope.productGrid = $scope.gridLoadedParams.gridParams.productGrid;
    $scope.productGrid.cellEditableCondition = function (gridscope) {
        var drows = $scope.gridProdApi.rowEdit.getDirtyRows();
        var boolvar = ($scope.selectedRowProducts.uid === undefined || drows.length == 0 || gridscope.row.uid == $scope.selectedRowProducts.uid);
        // put your enable-edit code here, using values from $scope.row.entity and/or $scope.col.colDef as you desire
        console.log('dirtyOverview: ' + $scope.dirtyOverview + ' dirtyRecipes: ' + $scope.dirtyRecipes + ' dirtyBarcodes: ' + $scope.dirtyBarcodes
        + ' dirtyExtras: ' + $scope.dirtyExtras + ' dirtyPrices: ' + $scope.dirtyPrices + ' isGridRowDirty ' + $scope.isGridRowDirty + ' ableChangeRow: ' + $scope.ableChangeRow);
        console.log($scope.selectedRowProducts);
        if (boolvar == false) {
            //tosterFactory.showCustomToast('Selected line unreachable uid of  undefined  || Dirty Product Rows > 0 || row doesnt match selected row.', 'warning');
            tosterFactory.showCustomToast('Selected product is modified. Save or discard to continue.', 'warning');
            console.log('Selected line unreachable uid:' + $scope.selectedRowProducts.uid + ' row doesnt' + gridscope.row.uid + ' match selectedRowProductsuid:' + $scope.selectedRowProducts.uid);
            console.log('Dirty product Rows > 0:');
            console.log(drows);
        }
        return boolvar;
    }
    $scope.extrasGrid = $scope.gridLoadedParams.gridParams.extrasGrid;
    $scope.recipesGrid = $scope.gridLoadedParams.gridParams.recipesGrid;
    $scope.barcodesGrid = $scope.gridLoadedParams.gridParams.barcodesGrid;

    //Grid Initiallization Functions
    $scope.initProdGrid = function () { }; $scope.initRecipeGrid = function () { }; $scope.initExtrasGrid = function () { }; $scope.initBarcodesGrid = function () { };
    //Initiallization view Function
    $scope.initGrid = function () {
        $scope.uploader = new FileUploader(); //used to upload an image via angular-file-upload

        var KdsPromise = $scope.getDropDownLookUps('Kds');
        var KitchenPromise = $scope.getDropDownLookUps('Kitchen');
        var KitchenRegionPromise = $scope.getDropDownLookUps('KitchenRegion');
        var ProductCategoriesPromise = $scope.getDropDownLookUps('ProductCategories');
        var UnitPromise = $scope.getDropDownLookUps('Units');
        var ingrPromise = $scope.getDropDownLookUps('Ingredient_ProdCategoryAssoc');
        var pricelistPromise = $scope.getDropDownLookUps('Pricelist');
        var vatPromise = $scope.getDropDownLookUps('Vat');
        var taxPromise = $scope.getDropDownLookUps('Tax');
        //When all lookUps finished loading 
        $q.all([KdsPromise, KitchenPromise, KitchenRegionPromise, ProductCategoriesPromise, UnitPromise, ingrPromise, pricelistPromise, vatPromise, taxPromise]).then(function () {
            tosterFactory.showCustomToast('All lookup entities resolved', 'success');
            var ProductsPromise = $scope.getDropDownLookUps('Product'); //get pagged Results of Products
            var ingredientsPromise = $scope.getDropDownLookUps('Ingredients');
            $scope.productGrid.columnDefs[3].editDropdownOptionsArray = $scope.productCategoryLookupResults;
            $scope.productGrid.columnDefs[3].filter.selectOptions = $scope.productCategoryLookupResults.map(function (item) {
                var tmp = { value: item.Id, label: item.Description }
                return tmp;
            });
            $scope.initDropDowns();
        });
    }

    //tmap scope has all dropdown Arrays to initiallize SchemaForm select Arrays
    //load OverviewSchemaForm with dropdowns from GridInitialization Factory 
    $scope.initDropDowns = function () {
        var objSFE = GridInitiallization.initProductSFEParams('overview', $scope.tmap)
        $scope.overviewSchema = angular.copy(objSFE.productsOverviewSFE.overviewSchema);
        $scope.overviewEntity =  angular.copy(objSFE.productsOverviewSFE.overviewEntity);
        $scope.overviewForm =  angular.copy(objSFE.productsOverviewSFE.overviewForm);

    }

    //mastergrid Register API  initialization
    //https://github.com/angular-ui/ui-grid/tree/master/misc/tutorial
    $scope.productGrid.onRegisterApi = function (gridProdApi) {
        $scope.gridProdApi = gridProdApi;
        //on sort change sort grid 
        //$scope.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {           //    if (sortColumns.length == 0) { paginationOptions.sort = null; }            //    else { paginationOptions.sort = sortColumns[0].sort.direction; }           //    //$scope.getData('/InvoiceTypes', '&page=' + paginationOptions.pageNumber + '&pageSize=' + paginationOptions.pageSize);            //});

        //load new page Data  // change selected row to null , empty Slave Data
        gridProdApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            //check for changed vars
            if ($scope.ableChangeRow) { //<-- if valid to change ...
                $scope.gridPaginationOptions.pageNumber = newPage;
                $scope.gridPaginationOptions.pageSize = pageSize;
                $scope.categoryfiltersChanged($scope.selectedFilters); //<-- if selected filters 
            }
            else {
                tosterFactory.showCustomToast('Trere are unsaved changes. Please save to interact', 'warning');
                $scope.productGrid.paginationPageSize = $scope.gridPaginationOptions.pageSize;
                $scope.productGrid.paginationCurrentPage = $scope.gridPaginationOptions.pageNumber;
            }
        });
        //select row from master -- > display slaveData of master Row selected
        gridProdApi.selection.on.rowSelectionChanged($scope, function (row) {
            if ($scope.productGrid.getRowIdentity(row.entity) != $scope.productGrid.getRowIdentity($scope.selectedRowProducts.entity) && $scope.haveSelectedRow == true) { //if selected row differ from last selected check
                if ($scope.ableChangeRow) {
                    $scope.selectedRowProducts = row;
                } else {
                    $scope.gridProdApi.selection.selectRow($scope.selectedRowProducts.entity);
                }
            } else {
                $scope.selectedRowProducts = row;
            }
        });
        gridProdApi.selection.on.rowSelectionChangedBatch($scope, function (rows) { });
        //on begin cell edit change selectedRow  && load Slave Data for selected row
        gridProdApi.edit.on.beginCellEdit($scope, function (rowEntity, colDef) {
            if ($scope.productGrid.getRowIdentity($scope.selectedRowProducts.entity) === undefined || $scope.haveSelectedRow == false) {
                $scope.gridProdApi.selection.selectRow(rowEntity);
            } else if ($scope.productGrid.getRowIdentity(rowEntity) != $scope.productGrid.getRowIdentity($scope.selectedRowProducts.entity)) {
                // else if an other row is selected make it unselected and select the newOne
                if ($scope.ableChangeRow) { //
                    $scope.gridProdApi.selection.selectRow(rowEntity);
                } else {
                    $scope.gridProdApi.selection.selectRow($scope.selectedRowProducts.entity);
                }
            }
        });
        gridProdApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
            if (colDef.field == 'Code' || colDef.field == 'ProductCategoryId' || colDef.field == 'SalesDescription')
                $scope.overviewEntity[colDef.field] = newValue
            if (rowEntity.EntityStatus != 0 && newValue !== oldValue)
                rowEntity.EntityStatus = 1;
            $scope.isGridRowDirty = checkGridRowFieldsChanges();
        });
    }

    //Sub-grid of Extras API Register 
    $scope.extrasGrid.onRegisterApi = function (gridExtrasApi) {
        $scope.gridExtrasApi = gridExtrasApi;
        gridExtrasApi.selection.on.rowSelectionChanged($scope, function (row) {
            $scope.selectedRowExtras = row;
        });
        gridExtrasApi.selection.on.rowSelectionChangedBatch($scope, function (rows) { });
        gridExtrasApi.edit.on.beginCellEdit($scope, function (rowEntity, colDef) {
            if ($scope.selectedRowExtras == null || $scope.selectedRowExtras == undefined || $scope.selectedRowExtras.entity === undefined) {
                $scope.gridExtrasApi.selection.selectRow(rowEntity);
            } else if ($scope.recipesGrid.getRowIdentity(rowEntity) != $scope.recipesGrid.getRowIdentity($scope.selectedRowExtras.entity)) {
                $scope.gridExtrasApi.selection.selectRow(rowEntity);
            }
        });
        gridExtrasApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
            if ($scope.selectedRowProducts.entity.EntityStatus != 0)
                $scope.selectedRowProducts.entity.EntityStatus = 1;
            $scope.gridProdApi.rowEdit.setRowsDirty([$scope.selectedRowProducts.entity]);
            //if not inserted
            if (rowEntity.EntityStatus != 0) {
                if (rowEntity.Id === undefined || rowEntity.Id == 0 || rowEntity.EntityStatus == 2)
                    alert('Selected Extras row entity has a Conflict.\n Call on aftercellEdit gridExtrasApi.')
                rowEntity.EntityStatus = 1;
                $scope.dirtyExtras = true;
            } else { //case inserted obj 
                $scope.dirtyExtras = true;
            }
        });
    }
    //Sub-grid of Recipes API Register 
    $scope.recipesGrid.onRegisterApi = function (gridRecipesApi) {
        $scope.gridRecipesApi = gridRecipesApi;
        gridRecipesApi.selection.on.rowSelectionChanged($scope, function (row) { $scope.selectedRowRecipes = row; });
        gridRecipesApi.selection.on.rowSelectionChangedBatch($scope, function (rows) { });
        gridRecipesApi.edit.on.beginCellEdit($scope, function (rowEntity, colDef) {
            if ($scope.selectedRowRecipes == null || $scope.selectedRowRecipes == undefined || $scope.selectedRowRecipes.entity === undefined) {
                $scope.gridRecipesApi.selection.selectRow(rowEntity);
            } else if ($scope.recipesGrid.getRowIdentity(rowEntity) != $scope.recipesGrid.getRowIdentity($scope.selectedRowRecipes.entity)) {
                $scope.gridRecipesApi.selection.selectRow(rowEntity);
            }
        });
        gridRecipesApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
            if ($scope.selectedRowProducts.entity.EntityStatus != 0)
                $scope.selectedRowProducts.entity.EntityStatus = 1;
            $scope.gridProdApi.rowEdit.setRowsDirty([$scope.selectedRowProducts.entity]);
            //if not inserted
            if (rowEntity.EntityStatus != 0) {
                if (rowEntity.Id === undefined || rowEntity.Id == 0 || rowEntity.EntityStatus == 2)
                    alert('Selected Recipe row entity has a Conflict.\n Call on aftercellEdit gridRecipesApi.')
                rowEntity.EntityStatus = 1;
                $scope.dirtyRecipes = true;
            } else { //case inserted obj 
                $scope.dirtyRecipes = true;
            }
        });
    }
    //Sub-grid of Barcodes API Register 
    $scope.barcodesGrid.onRegisterApi = function (gridBarcodeApi) {
        $scope.gridBarcodeApi = gridBarcodeApi;
        gridBarcodeApi.selection.on.rowSelectionChanged($scope, function (row) {
            $scope.selectedRowBarcodes = row;
        });
        gridBarcodeApi.selection.on.rowSelectionChangedBatch($scope, function (rows) { });
        gridBarcodeApi.edit.on.beginCellEdit($scope, function (rowEntity, colDef) {
            if ($scope.selectedRowBarcodes == null || $scope.selectedRowBarcodes == undefined || $scope.selectedRowBarcodes.entity === undefined) {
                $scope.gridBarcodeApi.selection.selectRow(rowEntity);
            } else if ($scope.barcodesGrid.getRowIdentity(rowEntity) != $scope.barcodesGrid.getRowIdentity($scope.selectedRowBarcodes.entity)) {
                $scope.gridBarcodeApi.selection.selectRow(rowEntity);
            }
        });
        gridBarcodeApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
            if ($scope.selectedRowProducts.entity.EntityStatus != 0)
                $scope.selectedRowProducts.entity.EntityStatus = 1;
            $scope.gridProdApi.rowEdit.setRowsDirty([$scope.selectedRowProducts.entity]);
            //if not inserted
            if (rowEntity.EntityStatus != 0) {
                if (rowEntity.Id === undefined || rowEntity.Id == 0 || rowEntity.EntityStatus == 2)
                    alert('Selected Barcode row entity has a Conflict.\n Call on aftercellEdit gridBarcodeApi.')
                rowEntity.EntityStatus = 1;
                $scope.dirtyBarcodes = true;
            } else { //case inserted obj 
                $scope.dirtyBarcodes = true;
            }
        });
    }
    //fun used to return true if row entity matches loaded
    function checkSubGridRowVSLoaded(gridCaller, entity) {
        var propertyArray = Object.getOwnPropertyNames(entity);
        switch (gridCaller) {
            case 'Extras': for (var i = 0; i < propertyArray.length; i++) {
                var key = propertyArray[i];
                if ($scope.enumExtrasMap[entity.Id][key] === undefined)
                    continue;
                if (entity[key] != $scope.enumExtrasMap[entity.Id][key])
                    return false;
            }
                return true; break;
            case 'Recipes': for (var i = 0; i < propertyArray.length; i++) {
                var key = propertyArray[i];
                if ($scope.enumRecipeMap[entity.Id][key] === undefined)
                    continue;
                if (entity[key] != $scope.enumRecipeMap[entity.Id][key])
                    return false;
            }
                return true; break;
            case 'Barcodes': for (var i = 0; i < propertyArray.length; i++) {
                var key = propertyArray[i];
                if ($scope.enumBarcodesMap[entity.Id][key] === undefined)
                    continue;
                if (entity[key] != $scope.enumBarcodesMap[entity.Id][key])
                    return false;
            }
                return true; break;
            default: break;
        }
    }

    //FILTERED REST PRODUCT Procedures
    //Collapse panel filters button action $$tip: move this to a directive on this controller
    $scope.toggleSearch = function () {
        $window.onclick = null;
        $scope.filterCatCollapsed = !$scope.filterCatCollapsed;
        if ($scope.filterCatCollapsed == true) {
            $window.onclick = function (event) {
                var target = $(event.target);
                if (target.parents('div#collapseFilterSearch').length < 1) {
                    if (target[0].getAttribute('id') == 'collapseFilterSearch') {
                        return;
                    } else {
                        $scope.filterCatCollapsed = false;
                        $scope.$apply();
                    }
                }
            };
        }
    };
    //Collapse panel Filtered Category button Action [GO]
    //Used only by Category Change
    //CAUTION make this to work with Description && other fields
    $scope.categoryfiltersChanged = function (selfilts) {
        $scope.filterCatCollapsed = false;
        if ($scope.ableChangeRow) {

            if (selfilts.fpcat == null && selfilts.fcode == "" && selfilts.fdesc == "") {
                var ProductsPromise = $scope.getDropDownLookUps('Product'); return;
            } else {
                var ProductsPromise = $scope.getDropDownLookUps('Product', selfilts); return;
            }
        } else {
            tosterFactory.showCustomToast('Trere are unsaved changes. Please save to interact', 'warning');
            $scope.clearCatFilters();
        }
    }
    //Collapse panel Filtered Category button Action [Clear]
    $scope.clearCatFilters = function () {
        $scope.selectedFilters = { fpcat: null, fcode: "", fdesc: "" };
        //$scope.filterCatCollapsed = false;
    }

    $scope.searchBarcodeInput = '';
    $scope.enterKeyBarcodeEvent = function (keyEvent) {
        if (keyEvent.which === 13) {
            if ($scope.ableChangeRow) {
                $scope.barcodeSearch();
            } else {
                tosterFactory.showCustomToast('Selected line has unsaved changes. Please Save or Discard your changes.', 'warning');
            }
        }
    }
    $scope.barcodeSearch = function () {
        DynamicApiService.getDynamicObjectData('Product', 'barcode=' + $scope.searchBarcodeInput).then(function (result) { //Rest Get call for data using Api service to call Webapi
            if (result.data.length < 1) {
                tosterFactory.showCustomToast('No Results found for Products array', 'info');
            }
            $scope.products = angular.copy(result.data);
            var dpsLoaded = dataUtilFactory.createEnumsAndEnumObjs($scope.products, $scope.productsEnum, $scope.productsEnumObject, 'Id', 'Description');
            $scope.productsEnum = dpsLoaded.retEnum; $scope.productsEnumObject = angular.copy(dpsLoaded.retEnumObj);
            var datas = result.data.filter(function (item) { item.isPricelistEdited = false; return item; })
            $scope.productGrid.data = angular.copy(result.data);
            $scope.gridProdApi.grid.options.totalItems = result.data.length;
        }, function (reason) {
            tosterFactory.showCustomToast('Loading Product failed', 'fail');
            console.log('Fail Load'); console.log(reason);
        }, function (error) {
            tosterFactory.showCustomToast('Loading Product error', 'error');
            console.log('Error Load'); console.log(error);
        });
    }
    /////////////////////////////////////////////////////////////////
    //////////////////// GRID BUTTON ACTIONS ////////////////////////
    /////////////////////////////////////////////////////////////////

    //Master Grid ( Product ) Action Buttons [Add row] [Delete Selected]
    $scope.addProduct = function () {
        if ($scope.ableChangeRow == true) {
            var extraObj = angular.copy($scope.emptyProductObj, {}); //extraObj.ProductId = $scope.selectedRowProducts.entity.Id;
            $scope.productGrid.data.unshift(extraObj);
            $scope.gridProdApi.grid.modifyRows($scope.productGrid.data);

            $scope.gridProdApi.selection.selectRow($scope.productGrid.data[0]);
            $scope.gridProdApi.rowEdit.setRowsDirty([$scope.productGrid.data[0]]);

            $scope.gridProdApi.core.scrollTo($scope.productGrid.data.indexOf($scope.selectedRowProducts.entity), 1); //scroll to inserted row
            $scope.dirtyOverview = true; $scope.ableChangeRow = false; $scope.isGridRowDirty = true;
        }

    }
    $scope.removeProduct = function () {
        var deleteProductDialog = $mdDialog.confirm().title('Deleting product')
            .textContent('You have selected "' + $scope.overviewEntity.Description + '" product to delete.\n Proceed and delete current entry?')
            .ariaLabel('removeselectedproduct').ok('Delete').cancel('Cancel');
        $mdDialog.show(deleteProductDialog).then(function () {
            if ($scope.selectedRowProducts.entity.Id === undefined || $scope.selectedRowProducts.entity.Id === null || $scope.selectedRowProducts.entity.Id === 0) {
                removeProductGridData();

                return;
            } else {
                DynamicApiService.deleteSingle('Product', $scope.selectedRowProducts.entity.Id).then(function (result) {
                    removeProductGridData();
                    tosterFactory.showCustomToast('Product Entry deleted successfully', 'success');
                }, function (reason) {
                    tosterFactory.showCustomToast('Delete Product failed', 'fail');
                    console.log('Fail Delete'); console.log(reason);
                }, function (error) {
                    tosterFactory.showCustomToast('Delete Product error', 'error');
                    console.log('Error Delete'); console.log(error);
                });
            }
        });

    }
    function removeProductGridData() {

        $scope.gridProdApi.rowEdit.setRowsClean([$scope.selectedRowProducts.entity]);
        $scope.productGrid.data.splice($scope.productGrid.data.indexOf($scope.selectedRowProducts.entity), 1);
        var gridRows = $scope.gridProdApi.rowEdit.getDirtyRows();
        if (gridRows.length > 0) {
            var dataRows = gridRows.map(function (row) { return row.entity; });
            $scope.gridProdApi.rowEdit.setRowsClean(dataRows);
        }
        $scope.reInitViewDeps();

    }

    //Actions of add new row Delete current register of sub grids 
    $scope.addBarcode = function () { $scope.addSubGridEntity('Barcodes'); }
    $scope.addRecipe = function () { $scope.addSubGridEntity('Recipes'); }
    $scope.addExtras = function () { $scope.addSubGridEntity('Extras'); }
    $scope.addSubGridEntity = function (entityCall, extendedObj) {
        var tmpGridApi, tmpGrid, tmpObj, extended = false;
        if (extendedObj !== undefined && extendedObj !== null) extended = true;
        switch (entityCall) {
            case 'Extras': tmpGridApi = $scope.gridExtrasApi; tmpGrid = $scope.extrasGrid;
                if (extended == true) {
                    tmpObj = angular.copy(extendedObj, {});
                } else {
                    tmpObj = angular.copy($scope.emptyExtrasObj, {});
                } break;
            case 'Recipes': tmpGridApi = $scope.gridRecipesApi; tmpGrid = $scope.recipesGrid;
                if (extended == true) {
                    tmpObj = angular.copy(extendedObj, {});
                } else {
                    tmpObj = angular.copy($scope.emptyRecipesObj, {});
                } break;
            case 'Barcodes': tmpGridApi = $scope.gridBarcodeApi; tmpGrid = $scope.barcodesGrid;
                if (extended == true) {
                    tmpObj = angular.copy(extendedObj, {});
                } else {
                    tmpObj = angular.copy($scope.emptyBarcodesObj, {});
                } break;
            default: alert('Insert new item Switch failed to init.\n Critical Error please rerfesh window.'); return; break;
        }
        //Add new Empty entity row 
        tmpObj.ProductId = $scope.selectedRowProducts.entity.Id;
        //Manage Sub Grid  Actions
        tmpGrid.data.unshift(tmpObj);
        tmpGridApi.grid.modifyRows(tmpGrid.data); //signal modify rows
        tmpGridApi.selection.selectRow(tmpGrid.data[0]);
        tmpGridApi.rowEdit.setRowsDirty([tmpGrid.data[0]]);
        tmpGridApi.core.scrollTo(tmpGrid.data[0], tmpGrid.columnDefs[2]); //scroll to inserted row
        switch (entityCall) {
            case 'Extras': $scope.dirtyExtras = true; break;
            case 'Recipes': $scope.dirtyRecipes = true; break;
            case 'Barcodes': $scope.dirtyBarcodes = true; break;
            default: break;
        }
        if ($scope.selectedRowProducts.entity.EntityStatus != 0)
            $scope.selectedRowProducts.entity.EntityStatus = 1;
        $scope.gridProdApi.rowEdit.setRowsDirty([$scope.selectedRowProducts.entity]);//set selected Product Grid row to dirty

    }

    //Funs to manupulate row delete Actions on sub-grids 
    $scope.removeBarcode = function (row) {
        var index = $scope.barcodesGrid.data.indexOf(row.entity);
        if (index == -1) { alert('Remove Barcode index not found'); return; }
        else {
            var msg = "You are about to delete current Barcode selected. Proceed to delete action?";
            $scope.popConfirmationMsgModal(msg).result.then(function (data) {
                if (row.entity.Id != 0 && row.entity.Id != null && row.entity.Id != undefined) { //
                    row.entity.EntityStatus = 2;
                    ($scope.selectedRowProducts.entity.EntityStatus != 0) ? $scope.selectedRowProducts.entity.EntityStatus = 1 : '';
                    $scope.arrToDel.barcodesEntities.push(row.entity);
                    $scope.gridProdApi.rowEdit.setRowsDirty([$scope.selectedRowProducts.entity]);
                }
                $scope.gridBarcodeApi.rowEdit.setRowsClean([row.entity]);
                $scope.barcodesGrid.data.splice(index, 1);

                var dBarcodes = $scope.gridBarcodeApi.rowEdit.getDirtyRows();
                (dBarcodes.length == 0 && $scope.arrToDel.barcodesEntities.length == 0) ? $scope.dirtyBarcodes = false : $scope.dirtyBarcodes = true;
            }, function (reason) { });
        }
    }
    $scope.removeRecipe = function (row) {
        var index = $scope.recipesGrid.data.indexOf(row.entity)
        if (index == -1) { alert('Remove Recipe index not found'); return; }
        else {
            var msg = "You are about to delete current Recipe selected. Proceed to delete action?";
            $scope.popConfirmationMsgModal(msg).result.then(function (data) {
                if (row.entity.Id != 0 && row.entity.Id != null && row.entity.Id != undefined) { //if register  loaded from db
                    row.entity.EntityStatus = 2; //update status
                    ($scope.selectedRowProducts.entity.EntityStatus != 0) ? $scope.selectedRowProducts.entity.EntityStatus = 1 : '';
                    $scope.arrToDel.recipesEntities.push(row.entity); //manage delete Entity Array
                    $scope.gridProdApi.rowEdit.setRowsDirty([$scope.selectedRowProducts.entity]); //setselected row dirty only when a loaded row is deleted
                }
                $scope.gridRecipesApi.rowEdit.setRowsClean([row.entity]); //set subgrid row to clean so check can get displayed dirty rows 
                $scope.recipesGrid.data.splice(index, 1); // remove from data 
                var dRecipes = $scope.gridRecipesApi.rowEdit.getDirtyRows(); //manage bool var to watch
                (dRecipes.length == 0 && $scope.arrToDel.recipesEntities.length == 0) ? $scope.dirtyRecipes = false : $scope.dirtyRecipes = true;
            }, function (reason) { });
        }
    }
    $scope.removeExtras = function (row) {
        var index = $scope.extrasGrid.data.indexOf(row.entity)
        if (index == -1) { alert('RemoveExtras row index not found '); return; }
        else {
            var msg = "You are about to delete current Extra selected. Proceed to delete action?";
            $scope.popConfirmationMsgModal(msg).result.then(function (data) {
                if (row.entity.Id != 0 && row.entity.Id != null && row.entity.Id != undefined) {
                    row.entity.EntityStatus = 2;
                    ($scope.selectedRowProducts.entity.EntityStatus != 0) ? $scope.selectedRowProducts.entity.EntityStatus = 1 : '';
                    $scope.arrToDel.extrasEntities.push(row.entity);
                    $scope.gridProdApi.rowEdit.setRowsDirty([$scope.selectedRowProducts.entity]);
                }
                //use this to change delete rows dirty cause after splice
                $scope.gridExtrasApi.rowEdit.setRowsClean([row.entity]);
                $scope.extrasGrid.data.splice(index, 1);
                var dExtras = $scope.gridExtrasApi.rowEdit.getDirtyRows();
                (dExtras.length == 0 && $scope.arrToDel.extrasEntities.length == 0) ? $scope.dirtyExtras = false : $scope.dirtyExtras = true;
            }, function (reason) { });
        }

    }

    //Action Button [Refresh] on sub grids rows to refresh current Line
    //This Action will not be Triggered when Product Line is new
    $scope.refreshRow = function (entity, row) {
        switch (entity) {
            case 'extras':
                var index = $scope.extrasGrid.data.indexOf(row.entity);
                var originalObj = angular.copy($scope.enumExtrasMap[row.entity.Id]); //load unchanged register from Extras loaded
                if (originalObj === undefined) { alert('Critical error on refresh Extras plz refresh to avoid Conficts.\n Refresh row call.'); return; }
                originalObj.EntityStatus = null;
                if (index != -1) {
                    angular.extend(row.entity, originalObj);
                    $scope.extrasGrid.data[index] = row.entity;
                    $scope.gridExtrasApi.selection.selectRow(row.entity);
                    $scope.gridExtrasApi.rowEdit.setRowsClean([row.entity]);
                    $scope.gridExtrasApi.grid.modifyRows($scope.extrasGrid.data);

                } else {
                    alert('Index not fount on subGrid Extras.\nCritical ERROR plz refresh.'); break;
                }
                var dExtras = $scope.gridExtrasApi.rowEdit.getDirtyRows();
                if ($scope.arrToDel.extrasEntities.length == 0 && dExtras.length == 0)
                    $scope.dirtyExtras = false;
                break;
            case 'recipe':
                var index = $scope.recipesGrid.data.indexOf(row.entity);
                var originalObj = angular.copy($scope.enumRecipeMap[row.entity.Id]); //load unchanged register from recipes loaded
                if (originalObj === undefined) { alert('Critical error on refresh Recipe plz refresh to avoid Conficts.\nRefresh row call.'); return; }
                //originalObj.Action = $scope.emptyRecipesObj.Action;
                originalObj.EntityStatus = null;
                if (index != -1) {
                    angular.extend(row.entity, originalObj);
                    $scope.recipesGrid.data[index] = row.entity;
                    $scope.gridRecipesApi.selection.selectRow(row.entity);
                    $scope.gridRecipesApi.rowEdit.setRowsClean([row.entity]);
                    $scope.gridRecipesApi.grid.modifyRows($scope.recipesGrid.data);
                } else {
                    alert('Index not fount on subGrid Recipes.\nCritical ERROR plz refresh.'); break;
                }
                var dRecipes = $scope.gridRecipesApi.rowEdit.getDirtyRows();
                if ($scope.arrToDel.recipesEntities.length == 0 && dRecipes.length == 0)
                    $scope.dirtyRecipes = false;
                break;
            case 'barcode':
                var index = $scope.barcodesGrid.data.indexOf(row.entity)
                var originalObj = angular.copy($scope.enumBarcodesMap[row.entity.Id]); //load unchanged register from barcodes loaded
                if (originalObj === undefined) { alert('Critical error on refresh Barcode plz refresh to avoid Conficts.\nRefresh row call.'); return; }
                originalObj.Action = $scope.emptyBarcodesObj.Action; originalObj.EntityStatus = null;
                if (index != -1) {
                    angular.extend(row.entity, originalObj);
                    $scope.barcodesGrid.data[index] = row.entity;
                    $scope.gridBarcodeApi.selection.selectRow([row.entity]);
                    $scope.gridBarcodeApi.rowEdit.setRowsClean([row.entity]);
                    $scope.gridBarcodeApi.grid.modifyRows($scope.barcodesGrid.data);
                } else {
                    alert('Index not fount on subGrid Barcodes.\nCritical ERROR plz refresh.'); break;
                }
                var dBarcodes = $scope.gridBarcodeApi.rowEdit.getDirtyRows();
                if ($scope.arrToDel.barcodesEntities.length == 0 && dBarcodes.length == 0)
                    $scope.dirtyBarcodes = false;
                break;
            default: alert('Refresh row Action called an undefiened Entity.\n Default state triggered.\n\n No action Performed'); break;
        }
    }

    //Function switched by entity called with External Params 
    //Fills LookUps Data and grids Data rows
    $scope.getDropDownLookUps = function (entity, customparams) {
        switch (entity) {
            case 'Product': //main Grid Load
                $scope.searchingProcess = true;

                var parameters = 'page=' + $scope.gridPaginationOptions.pageNumber + '&pageSize=' + $scope.gridPaginationOptions.pageSize
                var extr = '';
                if (customparams == "" || customparams == undefined)
                    extr = "&filters={}";//+JSON.stringify({});
                else {
                    var tmp = {};
                    if (customparams.fdesc !== undefined && customparams.fdesc !== null && customparams.fdesc !== '')
                        tmp.Description = customparams.fdesc;
                    if (customparams.fcode !== undefined && customparams.fcode !== null && customparams.fcode !== '')
                        tmp.Code = customparams.fcode;
                    if (customparams.fpcat !== undefined && customparams.fpcat !== null)
                        tmp.ProductCategoryId = customparams.fpcat.Id;
                    extr = "&filters=" + JSON.stringify(tmp);
                }
                parameters += extr;
                console.log(parameters);

                return (
                DynamicApiService.getDynamicObjectData(entity, parameters).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    $scope.searchingProcess = false;

                    if (result.data.length < 1) {
                        tosterFactory.showCustomToast('No Results found for Products array', 'info');
                    }
                    $scope.products = angular.copy(result.data.Results);
                    var dpsLoaded = dataUtilFactory.createEnumsAndEnumObjs($scope.products, $scope.productsEnum, $scope.productsEnumObject, 'Id', 'Description');
                    $scope.productsEnum = dpsLoaded.retEnum; $scope.productsEnumObject = angular.copy(dpsLoaded.retEnumObj);

                    $scope.productGrid.data = angular.copy(result.data.Results);
                    $scope.gridProdApi.grid.options.totalItems = result.data.RowCount;
                }, function (reason) {
                    tosterFactory.showCustomToast('Loading Product failed', 'fail');
                    console.log('Fail Load'); console.log(reason);
                }, function (error) {
                    tosterFactory.showCustomToast('Loading Product error', 'error');
                    console.log('Error Load'); console.log(error);
                })
                );
                //Lookups for view 
            case 'ProductCategories': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.productCategories = result.data;
                var qpc = dataUtilFactory.quicksort($scope.productCategories, 'Description');
                $scope.productCategories = qpc;


                $scope.productCategoriesEnum = dataUtilFactory.createEnums($scope.productCategories, $scope.productCategoriesEnum, 'Id', 'Description');
                $scope.productCategoryLookupResults = [];
                angular.forEach($scope.productCategories, function (value) {
                    var tmpObj = { Id: value.Id, Description: value.Description }; $scope.productCategoryLookupResults.push(tmpObj);//create array of Deparment Objects
                });
                var sorted = dataUtilFactory.quicksort($scope.productCategoryLookupResults, 'Description');
                $scope.productCategoryLookupResults = sorted;
                $scope.tmap.ProductCategoryId = $scope.createMapDropdown($scope.productCategoriesEnum);
                var sor = dataUtilFactory.quicksort($scope.tmap.ProductCategoryId, 'name');
                $scope.tmap.ProductCategoryId = sor;

            }, function (reason) {
                tosterFactory.showCustomToast('Loading ProductCategories failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Loading ProductCategories error', 'error');
                console.log('Error Load'); console.log(error);
            })); break;

            case 'Kds': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.kds = result.data;
                $scope.kdsEnum = dataUtilFactory.createEnums($scope.kds, $scope.kdsEnum, 'Id', 'Description');
                $scope.tmap.KdsId = $scope.createMapDropdown($scope.kdsEnum);
                $scope.tmap.KdsId.unshift({ value: null, name: "--" });

            }, function (reason) {
                tosterFactory.showCustomToast('Loading Kds failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Loading Kds error', 'error');
                console.log('Error Load'); console.log(error);
            })); break;

            case 'Kitchen': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.kitchen = result.data;
                $scope.kitchenEnum = dataUtilFactory.createEnums($scope.kitchen, $scope.kitchenEnum, 'Id', 'Description');
                $scope.tmap.KitchenId = $scope.createMapDropdown($scope.kitchenEnum);
                $scope.tmap.KitchenId.unshift({ value: null, name: "--" });
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Kitchen failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Loading Kitchen error', 'error');
                console.log('Error Load'); console.log(error);
            })); break;
            case 'KitchenRegion': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.kitchenRegion = result.data;
                $scope.kitchenRegionEnum = dataUtilFactory.createEnums($scope.kitchenRegion, $scope.kitchenRegionEnum, 'Id', 'ItemRegion');
                $scope.tmap.KitchenRegionId = $scope.createMapDropdown($scope.kitchenRegionEnum);
                $scope.tmap.KitchenRegionId.unshift({ value: null, name: "--" });
            }, function (reason) {
                tosterFactory.showCustomToast('Loading KitchenRegion failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Loading KitchenRegion error', 'error');
                console.log('Error Load'); console.log(error);
            })); break;
            case 'Units': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.units = angular.copy(result.data);
                $scope.unitsEnum = dataUtilFactory.createEnums($scope.units, $scope.unitsEnum, 'Id', 'Description');
                $scope.tmap.UnitId = $scope.createMapDropdown($scope.unitsEnum);
                $scope.tmap.UnitId.unshift({ value: null, name: "--" });
                $scope.unitsLookupResults = [];
                angular.forEach($scope.units, function (value) {
                    var tmpObj = { Id: value.Id, Description: value.Description };
                    $scope.unitsLookupResults.push(tmpObj);//create array of Deparment Objects
                });
                $scope.extrasGrid.columnDefs[2].PayroleOvervieweditDropdownOptionsArray = angular.copy($scope.unitsLookupResults);
                $scope.recipesGrid.columnDefs[3].editDropdownOptionsArray = angular.copy($scope.unitsLookupResults);
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Units failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Loading Units error', 'error');
                console.log('Error Load'); console.log(error);
            })); break;
            case 'Ingredients': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.ingredients = result.data;
                var objRes = dataUtilFactory.createEnumsAndEnumObjs($scope.ingredients, {}, [], 'Id', 'Description');
                $scope.ingredientsEnum = objRes.retEnum;
                $scope.ingredientsEnumObjs = objRes.retEnumObj;

                $scope.ingredientsLookupResults = [];
                angular.forEach($scope.ingredients, function (value) {
                    var tmpObj = { Id: value.Id, Description: value.Description };
                    $scope.ingredientsLookupResults.push(tmpObj);//create array of Deparment Objects
                });
                $scope.extrasGrid.columnDefs[3].editDropdownOptionsArray = angular.copy($scope.ingredientsLookupResults);
                $scope.recipesGrid.columnDefs[4].editDropdownOptionsArray = angular.copy($scope.ingredientsLookupResults);
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Ingredients failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Loading Ingredients error', 'error');
                console.log('Error Load'); console.log(error);
            })); break;
            case 'Ingredient_ProdCategoryAssoc': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                var dpsLoaded = angular.copy(result.data);
                var containerObjects = angular.copy(dataUtilFactory.groupTo(result.data, 'ProductCategoryId'));
                $scope.databaseLoadedAssocs = angular.copy(containerObjects);
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Ingredient_ProdCategoryAssoc failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Loading Ingredient_ProdCategoryAssoc error', 'error');
                console.log('Error Load'); console.log(error);
            })); break;
            case 'Pricelist': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.pricelists = result.data;
                $scope.pricelistsEnum = dataUtilFactory.createEnums($scope.pricelists, {}, 'Id', 'Description');
                var ppArr = [];
                angular.forEach($scope.pricelists, function (value) {
                    var tmpObj = {
                        Id: 0,
                        PricelistId: value.Id,
                        ProductId: $scope.selectedRowProducts.entity.Id,
                        LookUpPriceListId: value.LookUpPriceListId,
                        PricelistMasterId: value.PricelistMasterId,
                        Percentage: value.Percentage,
                        Price: 0,
                        VatId: null,
                        TaxId: null,
                        IsEdited: true
                    }
                    ppArr.push(tmpObj);
                })
                $scope.emptyProductObj.ProductPricesModelDetails = ppArr;
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Pricelist failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Loading Pricelist error', 'error');
                console.log('Error Load'); console.log(error);
            })); break;
            case 'Vat': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.vats = result.data;
                var enums = dataUtilFactory.createEnums($scope.vats, {}, 'Id', 'Description');
                $scope.vatDescEnum = angular.copy(enums);
                $scope.vatsEnum = dataUtilFactory.createMapDropdown(enums);
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Vat failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Loading Vat error', 'error');
                console.log('Error Load'); console.log(error);
            })); break;
            case 'Tax': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.taxs = result.data;
                var enums = {null:'--'};
                var dde = dataUtilFactory.createEnumsExtend($scope.taxs, {}, 'Id', ['Description', 'Percentage']);
                angular.extend(enums, dde);
                $scope.taxDescEnum = angular.copy(enums);
                $scope.taxsEnum = dataUtilFactory.createMapDropdown(enums);
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Vat failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Loading Vat error', 'error');
                console.log('Error Load'); console.log(error);
            })); break;
                //load SubGrids Entities
            case 'ProductRecipe': return (
                ($scope.selectedRowProducts == null) ? null :
                DynamicApiService.getDynamicObjectData(entity, 'pid=' + $scope.selectedRowProducts.entity.Id).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    $scope.productRecipe = angular.copy(result.data);
                    $scope.enumRecipeMap = dataUtilFactory.createEnumObjs($scope.productRecipe, {}, 'Id')
                    $scope.recipesGrid.data = angular.copy(result.data);
                }, function (reason) {
                    tosterFactory.showCustomToast('Loading ProductRecipes failed', 'fail');
                    console.log('Fail Load'); console.log(reason);
                }, function (error) {
                    tosterFactory.showCustomToast('Loading ProductRecipes error', 'error');
                    console.log('Error Load'); console.log(error);
                })); break;
            case 'ProductExtras': return (
                ($scope.selectedRowProducts == null) ? null :
                DynamicApiService.getDynamicObjectData(entity, 'pid=' + $scope.selectedRowProducts.entity.Id).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    $scope.productExtras = angular.copy(result.data);
                    $scope.enumExtrasMap = dataUtilFactory.createEnumObjs($scope.productExtras, {}, 'Id')
                    $scope.extrasGrid.data = angular.copy(result.data);
                }, function (reason) {
                    tosterFactory.showCustomToast('Loading ProductExtras failed', 'fail');
                    console.log('Fail Load'); console.log(reason);
                }, function (error) {
                    tosterFactory.showCustomToast('Loading ProductExtras error', 'error');
                    console.log('Error Load'); console.log(error);
                })); break;
            case 'ProductBarcodes': return (
                ($scope.selectedRowProducts == null) ? null :
                DynamicApiService.getDynamicObjectData(entity, 'pid=' + $scope.selectedRowProducts.entity.Id).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    $scope.productBarcodes = angular.copy(result.data);
                    $scope.enumBarcodesMap = dataUtilFactory.createEnumObjs($scope.productBarcodes, {}, 'Id')
                    $scope.barcodesGrid.data = angular.copy(result.data);
                }, function (reason) {
                    tosterFactory.showCustomToast('Loading ProductBarcodes failed', 'fail');
                    console.log('Fail Load'); console.log(reason);
                }, function (error) {
                    tosterFactory.showCustomToast('Loading ProductBarcodes error', 'error');
                    console.log('Error Load'); console.log(error);
                })); break;
            case 'ProductPrices':
                var filterObj = { ProductId: $scope.selectedRowProducts.entity.Id };
                var params = 'filters=' + JSON.stringify(filterObj) + '&page=1&pageSize=1&isIngredient=false';
                return (
                ($scope.selectedRowProducts == null) ? null :
                DynamicApiService.getDynamicObjectData(entity, params).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    if (result.data.Results.length > 1) alert('Critical Error. \nMore Than 1 Products with same Id.');
                    (result.data.Results.length > 0) ?
                    $scope.productPrices = angular.copy(result.data.Results[0].ProductPricesModelDetails) : $scope.productPrices = [];
                    var ppArr = [];
                    var grpdPlsbyId = angular.copy(dataUtilFactory.groupTo($scope.pricelists, 'Id'));
                    $scope.debugVatNullArray = [];
                    angular.forEach($scope.pricelists, function (value) {
                        var tmpObj = {
                            Id: 0,
                            PricelistId: value.Id,
                            ProductId: $scope.selectedRowProducts.entity.Id,
                            LookUpPriceListId: value.LookUpPriceListId,
                            PricelistMasterId: value.PricelistMasterId,
                            Percentage: value.Percentage,
                            Price: 0,
                            VatId: null,
                            TaxId: null,
                            IsEdited: true
                        }
                        var f = $scope.productPrices.filter(function (item) {
                            return (value.Id == item.PriceListId);
                        })
                        //if (f.length > 1) alert('Critical Error. \nMore Than 1 pricelists appended to selected Obj.');
                        if (f !== undefined && f !== null && f.length > 0) {
                            tmpObj.Id = f[0].PricelistDetailId,
                            tmpObj.LookUpPriceListId = f[0].LookUpPriceListId,
                            tmpObj.PricelistMasterId = f[0].PricelistMasterId,
                            tmpObj.Percentage = f[0].Percentage,
                            tmpObj.Price = f[0].Price,
                            tmpObj.VatId = f[0].VatId,
                            tmpObj.TaxId = f[0].TaxId,
                            tmpObj.IsEdited = false
                        }
                        //find vat of lookup productpricesmodeldetails
                        //if this has no null vat init current dependency with this vat else init first vat
                        //search product prices where pricelistid == tmpObj.LookUpPriceListId
                        if (tmpObj.VatId === null || tmpObj.VatId === undefined) {
                            tmpObj.IsEdited = true
                            $scope.dirtyPrices = true;
                            $scope.isGridRowDirty = true;
                            $scope.gridProdApi.rowEdit.setRowsDirty([$scope.selectedRowProducts.entity]);

                            var notnull = $scope.productPrices.filter(function (item) {
                                if (tmpObj.LookUpPriceListId == item.PriceListId)
                                    return item.VatId;
                            })
                            var vat2Fix = $scope.vats[0].Id;
                            if (notnull.length > 0) alert('Error handling Pricelists. Manage Pricelists Tab');
                            else if (notnull.length == 1) {
                                vat2Fix = notnull[0];
                            } else {
                                vat2Fix = $scope.vats[0].Id;
                            }
                            var debug = {
                                plId: tmpObj.PricelistId,
                                lookupPlId: tmpObj.LookUpPriceListId,
                                looupVatid: vat2Fix
                                //(tmpObj.LookUpPriceListId !== undefined && tmpObj.LookUpPriceListId !== null) ? grpdPlsbyId[tmpObj.LookUpPriceListId].VatId : $scope.vats[0].Id
                            }
                            $scope.debugVatNullArray.push(debug);
                            // grpdPlsbyId[tmpObj.LookUpPriceListId].VatId;
                            //console.log('Null vat id'); console.log(debug);
                            tmpObj.VatId = vat2Fix;
                            //(tmpObj.LookUpPriceListId !== undefined && tmpObj.LookUpPriceListId !== null) ? grpdPlsbyId[tmpObj.LookUpPriceListId].VatId : $scope.vats[0].Id;
                        }
                        ppArr.push(tmpObj);
                    })
                    if ($scope.debugVatNullArray.length > 0 && $scope.selectedRowProducts.entity.Id != 0) {
                        $scope.pricelistAutoFixModal($scope.debugVatNullArray);
                        $scope.selectedRowProducts.entity.EntityStatus = 1;
                    }
                    $scope.selectedRowProducts.entity.ProductPricesModelDetails = ppArr;


                    //add productprices check for vatId null
                    checkNullVatId($scope.selectedRowProducts.entity);
                }, function (reason) {
                    tosterFactory.showCustomToast('Loading ProductPrices failed', 'fail');
                    console.log('Fail Load'); console.log(reason);
                }, function (error) {
                    tosterFactory.showCustomToast('Loading ProductPrices error', 'error');
                    console.log('Error Load'); console.log(error);
                })); break;

            default: break;
        }
    }
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
            parent: angular.element('#wrapper'),//document.body),
            //targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: useFullScreen,
            resolve: {
                checkModel: function () { return checkModel; },
            }
        }).then(function (data) { });
    };

    function checkNullVatId(entity) {

        angular.forEach(entity.ProductPricesModelDetails, function (value) {
            if (value.VatId === null || value.VatId === undefined) {
                $scope.dirtyPrices = true;
                $scope.isGridRowDirty = true;
                $scope.gridProdApi.rowEdit.setRowsDirty([$scope.selectedRowProducts.entity]);
            }
        });
    }
    //Grid Fields witch uses drop down list uses this
    $scope.createMapDropdown = function (enumVar) {
        var arr = [];
        angular.forEach(enumVar, function (cnt, key) {
            var tmpobj = { value: parseInt(key), name: cnt };
            arr.push(tmpobj);
        });
        return arr;
    }

    ////////////////////////////////////////////////////////////////
    //////////////////////BASE VIEW ACTIONS ////////////////////////
    ////////////////////////////////////////////////////////////////

    //this is a function that loads any products with filter search resource to take products existed by the same barcode
    //the only param is the code inserting and return is a bool value if 
    function checkSameCode(ent) {
        $scope.savingProcess = true; $scope.searchingProcess = true;
        var cprod = angular.copy(ent);
        var parameters = "uniqueCode=" + cprod.Code;
        return (DynamicApiService.getDynamicObjectData('Product', parameters).then(function (result) {
            var ddar = angular.copy(result.data);
            //if no results allow save
            if (ddar.length < 1) {
                //$scope.$broadcast('schemaForm.error.Code', 'allready', true);
                return true;
            }
            //filter those with actual same code and diff ID loaded and not string included as promise filter returned 
            var funique = ddar.filter(function (item) { return (item.Code == cprod.Code && item.Id != cprod.Id) })
            //if no result on filter then it is unique
            if (funique.length == 0) {
                //$scope.$broadcast('schemaForm.error.Code', 'allready', true);
                return true;
            } else { //else not a valid Code to save
                //$scope.$broadcast('schemaForm.error.Code', 'allready', false);
                (cprod.Code == undefined || cprod.Code == '') ? tosterFactory.showCustomToast('#' + funique.length + ' with null or empty Code found.', 'warning')
                : tosterFactory.showCustomToast('#' + funique.length + ' products with same Code found. Provide unique code to save current product.', 'warning');
                return false;
            }
        }).catch(function () { tosterFactory.showCustomToast('Error on checking unique code of product.', 'error'); return false; }).finally(function () { $scope.searchingProcess = false; $scope.savingProcess = false; })
        );
    }
    //variables to disable action buttons and Users actions
    $scope.searchingProcess = false; $scope.savingProcess = false;

    //this is a function to change tab view on products details
    //which does not work
    function changeView(type) {
        var t = angular.copy(type);
        $scope.showDivSelection = t;
        return;
    }
    //a function that is called on save changes 
    $scope.saveGridChanges = function () {
        //$q.all({
        //    checkCodePromise: checkSameCode($scope.selectedRowProducts.entity)
        //}).then(function (res) {
        //    if (res.checkCodePromise != true) {

        //        return changeView('overview');
        //    } else {
                $scope.$broadcast('schemaFormValidate', 'overviewRowEntryForm'); var formvalid = $scope.overviewRowEntryForm.$valid; $scope.dirtyOverview = formvalid;
                //External  Check on vatid and price on saving product
                angular.forEach($scope.selectedRowProducts.entity.ProductPricesModelDetails, function (item) {
                    if (item.VatId == null || item.VatId === undefined || item.VatId == null || item.Price === null || item.Price === undefined) {
                        $scope.showDivSelection = 'pricelists'; tosterFactory.showCustomToast('Error on pricelistMapping. Manage Pricelist Tab', 'error'); return;
                    }
                })
                if (formvalid == false) {
                    tosterFactory.showCustomToast('Invalid product OverviewForm', 'info'); $scope.showDivSelection = 'overview'; return;
                } else {
                    //Call Rest API Service to save obj 
                    var model = $scope.createSaveObj();
                    console.log('Model to save :'); console.log(model); console.log('Models to del :'); console.log($scope.arrToDel);
                    if (model.EntityStatus == 0) {
                        $scope.savingProcess = true;
                        var postPromise = DynamicApiService.postSingle('Product', model).then(function (result) {
                            //reload obj with id  //replace it in loaded products , gridData and enum // //clear vars//select row //load subgrids
                            $scope.reInitViewDeps();
                            if ($scope.ableChangeRow) {
                                if ($scope.selectedFilters.fpcat == null && $scope.selectedFilters.fcode != "" && $scope.selectedFilters.fdesc != "") {
                                    $scope.getDropDownLookUps('Product'); return;
                                } else { $scope.getDropDownLookUps('Product', $scope.selectedFilters); return; }
                            }
                            tosterFactory.showCustomToast('All entries of Product saved successfully.', 'success');
                        }).catch(function (reason) {
                            tosterFactory.showCustomToast('Creating Product failed', 'fail'); console.log('Fail Create'); console.log(reason);
                        }).finally(function () { $scope.savingProcess = false; })

                    } else if (model.EntityStatus == 1) {
                        $scope.savingProcess = true;
                        var putPromise = DynamicApiService.putSingle('Product', '', model).then(function (result) {
                            $scope.gridProdApi.rowEdit.setRowsClean([$scope.selectedRowProducts.entity]);
                            $scope.reInitViewDeps();
                            if ($scope.ableChangeRow) {
                                if ($scope.selectedFilters.fpcat == null && $scope.selectedFilters.fcode == "" && $scope.selectedFilters.fdesc == "") {
                                    $scope.getDropDownLookUps('Product'); return;
                                } else { $scope.getDropDownLookUps('Product', $scope.selectedFilters); return; }
                            }
                            tosterFactory.showCustomToast('All entries of Product updated successfully.', 'success');
                        }).catch(function (reason) {
                            tosterFactory.showCustomToast('Updating Product failed', 'fail'); console.log('Fail Create'); console.log(reason);
                        }).finally(function () { $scope.savingProcess = false; })
                    }
                }
        //    }
        //});
    }

    $scope.createSaveObj = function () {
        var saveObj = angular.copy($scope.selectedRowProducts.entity, {});
        //Modify Overview Fields to save obj
        var propertyArray = Object.getOwnPropertyNames($scope.overviewSchema.properties)
        angular.forEach(propertyArray, function (key) {
            saveObj[key] = $scope.overviewEntity[key];
        })
        //Extend Save obj with DTO models to add
        var dExtras = $scope.gridExtrasApi.rowEdit.getDirtyRows();
        dExtras = dExtras.map(function (gridRow) { return gridRow.entity; });
        saveObj.ProductExtras = (dExtras.length > 0) ? dExtras : [];
        $scope.arrToDel.extrasEntities = $scope.arrToDel.extrasEntities.filter(function (item) { item.IsDeleted = true; return item; })
        saveObj.ProductExtras = saveObj.ProductExtras.concat($scope.arrToDel.extrasEntities);

        var dRecipes = $scope.gridRecipesApi.rowEdit.getDirtyRows();
        dRecipes = dRecipes.map(function (gridRow) { return gridRow.entity; });
        saveObj.ProductRecipe = (dRecipes.length > 0) ? dRecipes : [];
        $scope.arrToDel.recipesEntities = $scope.arrToDel.recipesEntities.filter(function (item) { item.IsDeleted = true; return item; })

        saveObj.ProductRecipe = saveObj.ProductRecipe.concat($scope.arrToDel.recipesEntities);

        var dBarcodes = $scope.gridBarcodeApi.rowEdit.getDirtyRows();
        dBarcodes = dBarcodes.map(function (gridRow) { return gridRow.entity; });
        saveObj.ProductBarcodes = (dBarcodes.length > 0) ? dBarcodes : [];
        $scope.arrToDel.barcodesEntities = $scope.arrToDel.barcodesEntities.filter(function (item) { item.IsDeleted = true; return item; })
        saveObj.ProductBarcodes = saveObj.ProductBarcodes.concat($scope.arrToDel.barcodesEntities);


        saveObj.ProductPrices = saveObj.ProductPricesModelDetails.filter(function (item) {
            return (item.IsEdited == true);

        });
        console.log(saveObj.ProductPrices);
        return saveObj;
    }
    $scope.discardGridChanges = function () {
        //Call Rest API Service to save obj 
        //$scope.gridBarcodeApi.rowEdit.setRowsClean([$scope.selectedRowProducts]);
        var index = $scope.productGrid.data.indexOf($scope.selectedRowProducts.entity)
        var originalObj = $filter('filter')($scope.products, function (item) { if (item.Id == $scope.selectedRowProducts.entity.Id) return item; });
        if (originalObj.length > 1) { alert('Critical error on discarding changes plz refresh to avoid Conficts'); return; }
        //manage new entry del 
        if ($scope.selectedRowProducts.entity.EntityStatus != 0) {
            $scope.selectedRowProducts.entity = angular.copy(originalObj[0]);//($scope.productsEnumObject[$scope.selectedRowProducts.entity.Id]);
            if (index != -1) {
                $scope.productGrid.data[index] = $scope.selectedRowProducts.entity;
                $scope.gridProdApi.grid.modifyRows($scope.productGrid.data);
                $scope.gridProdApi.selection.selectRow($scope.productGrid.data[index]);
            }
            $scope.overviewEntity = angular.copy($scope.productsEnumObject[$scope.selectedRowProducts.entity.Id]);

            $scope.cleanSubGrid();
            $scope.gridProdApi.rowEdit.setRowsClean([$scope.selectedRowProducts.entity]);
            $scope.gridProdApi.selection.clearSelectedRows();
            $scope.reInitViewDeps();
        } else {
            //just remove row on product Id of null will handle  the case
            $scope.removeProduct();
        }
    }
    $scope.cleanSubGrid = function () {
        var dataRows; var gridRows;
        gridRows = $scope.gridExtrasApi.rowEdit.getDirtyRows();
        if (gridRows.length > 0) {
            dataRows = gridRows.map(function (gridRow) { return gridRow.entity; });
            $scope.gridExtrasApi.rowEdit.setRowsClean(dataRows);
        }
        gridRows = $scope.gridRecipesApi.rowEdit.getDirtyRows();
        if (gridRows.length > 0) {
            dataRows = gridRows.map(function (gridRow) { return gridRow.entity; });
            $scope.gridRecipesApi.rowEdit.setRowsClean(dataRows);
        }
        gridRows = $scope.gridBarcodeApi.rowEdit.getDirtyRows();
        if (gridRows.length > 0) {
            dataRows = gridRows.map(function (gridRow) { return gridRow.entity; });
            $scope.gridBarcodeApi.rowEdit.setRowsClean(dataRows);
        }
        var gridRows = $scope.gridProdApi.rowEdit.getDirtyRows();
        if (gridRows.length > 0) {
            var dataRows = gridRows.map(function (row) { return row.entity; });
            $scope.gridProdApi.rowEdit.setRowsClean(dataRows);
        }
    }

    //Function to initiallize View Control functions
    $scope.reInitViewDeps = function () {
        $scope.cleanSubGrid();
        $scope.arrToDel = { recipesEntities: [], extrasEntities: [], barcodesEntities: [] };
        $scope.dirtyRecipes = false, $scope.dirtyBarcodes = false, $scope.dirtyExtras = false; $scope.dirtyOverview = false; $scope.dirtyPrices = false;
        $scope.isGridRowDirty = false; $scope.ableChangeRow = true; $scope.haveSelectedRow = false;
        $scope.selectedRowProducts = { entity: {}, asdf: true };
    }
    ////////////////////////////////////////////////////////////////
    //////////////////VALIDATION ACTIONS & WATCHERS/////////////////
    ////////////////////////////////////////////////////////////////
    //Events to validate state and change row 
    //Function Loaded in overview entity( load Factory ) triggered by change of fields
    $scope.overviewChanged = function (key, modelValue) {
        var defer = false;
        if (key == 'Description')
            $scope.overviewEntity['SalesDescription'] = $scope.overviewEntity['ExtraDescription'] = modelValue;
        if ($scope.selectedRowProducts.entity.EntityStatus != 0)
            ($scope.selectedRowProducts.entity.EntityStatus = 1);
        if ($scope.selectedRowProducts.entity.Id != 0) { //entity loaded from server
            defer = $scope.checkFormVsEntity();
            if (defer == false) {
                $scope.dirtyOverview = false;
                return;
            }
        }
        $scope.gridProdApi.rowEdit.setRowsDirty([$scope.selectedRowProducts.entity]);
        $scope.dirtyOverview = true;
        //if (key == 'Code') {
        //    var t = angular.copy($scope.overviewEntity);
        //    $scope.selectedRowProducts.entity.Code = angular.copy(modelValue);

            //checkSameCode(t).then(function (res) {
            //    if (res == true) {
            //        $scope.$broadcast('schemaForm.error.Code', 'allready', true);
            //        $scope.$broadcast('schemaFormValidate', 'overviewRowEntryForm');
            //    } else {
            //        $scope.$broadcast('schemaForm.error.Code', 'allready', false);
            //        $scope.$broadcast('schemaFormValidate', 'overviewRowEntryForm');
            //    }
            //}).finally(function () {
            //    if ($scope.selectedRowProducts.entity.Id != 0) { //entity loaded from server
            //        defer = $scope.checkFormVsEntity();
            //        if (defer == false) {
            //            $scope.dirtyOverview = false;
            //            return;
            //        }
            //    }
            //    $scope.gridProdApi.rowEdit.setRowsDirty([$scope.selectedRowProducts.entity]);
            //    $scope.dirtyOverview = true;
            //    return;
            //})
        //} else {
        //    if ($scope.selectedRowProducts.entity.Id != 0) { //entity loaded from server
        //        defer = $scope.checkFormVsEntity();
        //        if (defer == false) {
        //            $scope.dirtyOverview = false;
        //            return;
        //        }
        //    }
        //    $scope.gridProdApi.rowEdit.setRowsDirty([$scope.selectedRowProducts.entity]);
        //    $scope.dirtyOverview = true;
        //}

    }
    //Implemented to validate overview fields vs Product Loaded to validate Dirtyness Of row selected
    //returns true if overview fields matches Loaded Obj 
    $scope.checkFormVsEntity = function () {
        var defer = false;
        var loadedEntity = angular.copy($scope.productsEnumObject[$scope.selectedRowProducts.entity.Id])
        if (loadedEntity === undefined) {
            alert('Checking form Entity Failed to ref on Products Enum.');
            return;
        }
        var propertyArray = Object.getOwnPropertyNames($scope.overviewSchema.properties)
        for (var i = 0; i < propertyArray.length; i++) {
            var key = propertyArray[i];
            if (key == 'IsCustom' && $scope.overviewEntity[key] != true && loadedEntity[key] == null) {
                $scope.overviewEntity[key] = null;
                $scope.selectedRowProducts.entity.IsCustom = null;
            }

            if (loadedEntity[key] != $scope.overviewEntity[key]) {
                defer = true;
                return defer;
            }
        }
        return defer;
    }
    $scope.onNewInsertIngrs = function (newValue, oldValue) {
        var catMatchIngrs = [], catId = newValue;
        if ($scope.databaseLoadedAssocs[catId] === undefined || $scope.databaseLoadedAssocs[catId] === null) {
            tosterFactory.showCustomToast('No Ingredients mapped in selected Product Category.', 'info');
            return;
        }

        angular.forEach($scope.databaseLoadedAssocs[catId], function (value) {
            var ingrId = value.IngredientId, cobj = $scope.ingredientsEnumObjs[ingrId];
            if (cobj.Id !== ingrId)
                tosterFactory.showCustomToast('Ingredient Association does not match current Id', 'error');
            var newobj = {
                IngredientId: ingrId,
                UnitId: cobj.UnitId,
                Description: cobj.Description,
                selected: true
            }
            catMatchIngrs.push(newobj);
        })
        $scope.popIngredientsInsertionModal('Insert also selected category Ingredients(' + catMatchIngrs.length + ') in extras grid ?').result.then(function (data) {
            if ($scope.extrasGrid.data.length > 0) {
                //delete oldvalue regs
                $scope.gridExtrasApi.rowEdit.setRowsClean($scope.extrasGrid.data);
                $scope.extrasGrid.data = [];
            }
            //insert new Extras regs
            var copy = angular.copy($scope.emptyExtrasObj);
            angular.forEach(catMatchIngrs, function (item) {
                copy.IngredientId = item.IngredientId;
                copy.UnitId = item.UnitId;
                $scope.addSubGridEntity('Extras', copy);
            })
        }, function (reason) { });
    }
    $scope.popIngredientsInsertionModal = function (modalmsg) {
        return ($uibModal.open({
            animation: false, backdrop: "static",
            templateUrl: '../app/scripts/directives/gridDirectives/simpleMessageModal.html',
            controller: 'SimpleMessageModalCtrl', controllerAs: 'smm',
            resolve: { message: function () { return modalmsg; } }
        })
        );
    }
    $scope.$watch('overviewEntity.SalesDescription', function (newValue, oldValue) {
        $scope.selectedRowProducts.entity.SalesDescription = newValue;
    }, true);
    $scope.$watch('overviewEntity.Code', function (newValue, oldValue) {
        $scope.selectedRowProducts.entity.Code = angular.copy(newValue);
    }, true);
    $scope.$watch('overviewEntity.ProductCategoryId', function (newValue, oldValue) {
        $scope.selectedRowProducts.entity.ProductCategoryId = newValue;
        if ($scope.selectedRowProducts.entity.Id == 0)
            $scope.onNewInsertIngrs(newValue, oldValue);
    }, true);
    $scope.$watch('selectedRowProducts.uid', function (newValue, oldValue) {
        if (newValue != undefined) $scope.haveSelectedRow = true;
        if ($scope.selectedRowProducts.entity.Id != undefined) {
            if ($scope.selectedRowProducts.entity.Id != 0) {
                if ($scope.selectedRowProducts.entity.IsCustom != true && $scope.selectedRowProducts.entity.IsCustom != false) {
                    tosterFactory.showCustomToast('Product has isCustom not bool.', 'warning');
                    $scope.selectedRowProducts.entity.IsCustom = false;
                    $scope.productsEnumObject[$scope.selectedRowProducts.entity.Id]['IsCustom'] = false;
                }

                $scope.overviewEntity = angular.copy($scope.productsEnumObject[$scope.selectedRowProducts.entity.Id])
            } else {
                $scope.overviewEntity = angular.copy(GridInitiallization.initProductSFEParams('overview', $scope.tmap).productsOverviewSFE.overviewEntity);
            }

            $scope.getDropDownLookUps('ProductExtras'); $scope.getDropDownLookUps('ProductRecipe'); $scope.getDropDownLookUps('ProductBarcodes'); $scope.getDropDownLookUps('ProductPrices');
            $scope.dirtyRecipes = false, $scope.dirtyBarcodes = false, $scope.dirtyExtras = false; $scope.dirtyOverview = false; $scope.dirtyPrices = false;
        }
    }, true);
    $scope.$watch('isGridRowDirty', function (newValue, oldValue) {
        if (newValue == true && $scope.ableChangeRow == true) {
            $scope.ableChangeRow = false;
        }
    }, true);
    $scope.$watchGroup(['dirtyRecipes', 'dirtyBarcodes', 'dirtyExtras', 'dirtyOverview', 'dirtyPrices'], function (newValues, oldValues, scope) { //, 'isGridRowDirty'
        console.log('drec:' + $scope.dirtyRecipes + ' dbar:' + $scope.dirtyBarcodes + ' dex:' + $scope.dirtyExtras + ' dover:' + $scope.dirtyOverview + " prices:" + $scope.dirtyPrices);
        if ($scope.dirtyRecipes == false && $scope.dirtyBarcodes == false && $scope.dirtyExtras == false && $scope.dirtyOverview == false && $scope.dirtyPrices == false) {
            //&& $scope.isGridRowDirty == false) {
            if ($scope.selectedRowProducts.entity.Id == 0) {
                $scope.ableChangeRow = false;
                return;
            }
            $scope.checkViewState();
            //This control is required cause checkviewState could change isGridRowDirty due to form  validation
            if ($scope.isGridRowDirty == false) {
                $scope.ableChangeRow = true;
                if ($scope.selectedRowProducts.uid != null && $scope.selectedRowProducts.uid != undefined) {
                    $scope.selectedRowProducts.entity.EntityStatus = null;
                    var gridRows = $scope.gridProdApi.rowEdit.getDirtyRows();
                    if (gridRows.length > 0) {
                        var dataRows = gridRows.map(function (row) { return row.entity; });
                        $scope.gridProdApi.rowEdit.setRowsClean(dataRows);
                    }
                    $scope.gridProdApi.rowEdit.setRowsClean([$scope.selectedRowProducts.entity]); $scope.ableChangeRow = true;
                }
            } else if ($scope.isGridRowDirty == true) { $scope.ableChangeRow = false; }
        } else { $scope.ableChangeRow = false; }
    });
    //Function to check if selected row Product entity is dirty or not 
    $scope.checkViewState = function () {
        if ($scope.selectedRowProducts.uid == null || $scope.selectedRowProducts.uid == undefined) {
            $scope.dirtyOverview = false;
            return true; //no selected line return no dirty grid
        }
        $scope.$broadcast('schemaFormValidate', 'overviewRowEntryForm');
        var formvalid = $scope.overviewRowEntryForm.$valid;
        $scope.dirtyOverview = formvalid;
        $scope.isGridRowDirty = checkGridRowFieldsChanges();

        if ($scope.selectedRowProducts.isDirty == true || formvalid == false
            || $scope.arrToDel.recipesEntities.length > 0 || $scope.arrToDel.extrasEntities.length > 0 || $scope.arrToDel.barcodesEntities.length > 0
            || $scope.gridRecipesApi.rowEdit.getDirtyRows().length > 0 || $scope.gridExtrasApi.rowEdit.getDirtyRows().length > 0 || $scope.gridBarcodeApi.rowEdit.getDirtyRows().length > 0) {
            return false;
        } else {
            return true;
        }
    }
    //Returns True if changes have been performed based on loaded Obj
    //Checkes if grid Row id Dirty 
    function checkGridRowFieldsChanges() {
        if ($scope.selectedRowProducts.uid == null || $scope.selectedRowProducts.uid == undefined || $scope.selectedRowProducts.entity.Id == 0) {
            return false;
        }
        if ($scope.selectedRowProducts.entity['SalesDescription'] != $scope.productsEnumObject[$scope.selectedRowProducts.entity.Id]['SalesDescription'])
            return true;
        if ($scope.selectedRowProducts.entity['Code'] != $scope.productsEnumObject[$scope.selectedRowProducts.entity.Id]['Code'])
            return true;
        if ($scope.selectedRowProducts.entity['ProductCategoryId'] != $scope.productsEnumObject[$scope.selectedRowProducts.entity.Id]['ProductCategoryId'])
            return true;
        //if ($scope.dirtyPrices == true) return true;
        return false;
    }
    $scope.$watch('selectedRowProducts.entity.isPricelistEdited', function (newValue, oldValue) {
        if (newValue == true && oldValue !== true) {
            if ($scope.selectedRowProducts.entity.EntityStatus != 0)
                $scope.selectedRowProducts.entity.EntityStatus = 1;
            $scope.gridProdApi.rowEdit.setRowsDirty([$scope.selectedRowProducts.entity]);
            //$scope.isGridRowDirty = true;
            $scope.dirtyPrices = true;
        }
    }, true);

    //modal to perform confirmation action in deletion
    $scope.popConfirmationMsgModal = function (modalmsg) {
        return ($uibModal.open({
            animation: false, backdrop: "static",
            templateUrl: '../app/scripts/directives/gridDirectives/simpleMessageModal.html',
            controller: 'SimpleMessageModalCtrl', controllerAs: 'smm',
            resolve: { message: function () { return modalmsg; } }
        })
        );
    }
    $scope.print = function () {
        console.log($scope.selectedRowProducts.entity.ProductPricesModelDetails);
    }
}])

    .controller('ProductPricesTabCtrl', ['$scope', '$locale', '$rootScope', function ($scope, $locale, $rootScope) {
        $scope.applyAll = function (type) {
            $scope.data['isPricelistEdited'] = true;
            $scope.loop = $scope.loop.filter(function (item) {
                item.IsEdited = true;
                if (type == 'vat') item.VatId = $scope.vatToAll;
                //if (type == 'price') item.Price = $scope.priceToAll;
                return item;
            })
        }
        $scope.priceChanged = function (modelValue, ref) {
            $scope.data['isPricelistEdited'] = true;
            modelValue.IsEdited = true;
            var num = Number(modelValue.Price.toFixed(2));
            modelValue.Price = num;
            if (ref == 'Price') {
                var percentObj = $scope.pricelistsLoaded.filter(function (item) { return (item.Id == modelValue.PricelistId) })
                //osa product sto loop exoun lookupPlId = me auto pou allakse 
                //timh = timh toy lookup Pricelist me to current %
                if (percentObj !== null && percentObj !== undefined && percentObj.length == 1) {
                    angular.forEach($scope.loop, function (item) {
                        if (item.LookUpPriceListId == modelValue.PricelistId && item.PricelistId != item.LookUpPriceListId) {
                            var cPercent = (item.Percentage / 100);
                            var tnum = num * cPercent;
                            item.Price = Number(tnum.toFixed(2));
                            item.IsEdited = true;
                        }
                    })
                } else if (percentObj.length > 1) {
                    alert('CRITICAL ERROR.\nMore than one pricelist found with same Id!\nAvoid saving');
                }
            }
        }
        $scope.$watch('priceToAll', function (newValue, oldValue) {
            if (newValue != oldValue) {
                var num = Number(newValue.toFixed(2))
                $scope.priceToAll = num
            }
        });
    }])
    .directive('productPricesTabRow', function () {
        return {
            controller: 'ProductPricesTabCtrl', restrict: 'E',
            scope: { data: '=', vatEnum: '=', taxEnum: '=', pricelistEnum: '=', dp: '=', dataEntity: '=', loop: '=', plenum: '=', pricelistsLoaded: '=' },
            template: '<div><br />'
                    + '<div style="display:flex; width:100%;"><label style="margin:auto 1%;">Multi action:</label>'
                    + '<select style="max-width: 40%;"class="form-control" ng-model="vatToAll" ng-options="item.value as item.name for item in vatEnum" ng-init="vatToAll=vatEnum[0].value"></select>'
                    //+ '<button class="hvr-fade" style="text-decoration:none; height: inherit;" ><i class="fa fa-share-square-o fa-fw"></i></button>'
                    + '<md-button class="md-icon-button md-primary" type="button" aria-label="EditMultivats" ng-click="applyAll(\'vat\')">'
                    + '<i class="fa fa-edit fa-fw ng-scope" aria-label="EditMultivats">'
                    + '<md-tooltip md-direction="top">Apply vat to all</md-tooltip></i></md-button>'
                    + '<div class="md-ripple-container"></div>'

                    + '</div><br />'
                + '<div class="notice" style="border:0;">'
                     + '<div style="display:inline-flex; width:100%;max-height: 4vh;">'
                        + '<strong class="col-md-4 col-xs-4">Pricelist Description</strong>'
                        + '<div class="col-md-8 col-xs-8" style="display:flex;" >'
                            + '<strong style="width: 30%; text-align: center;">Tax</strong>'
                            + '<strong style="width: 30%; text-align: center;">Vat</strong>'
                            + '<strong style="width: 40%; text-align: center;">Price</strong>'
                        + '</div>'
                    + '</div>'
                + '</div>'
                + '<div style="max-height:50vh; min-height:50vh; overflow-y:auto; padding: 0 10px;">'
                    + '<div class="notice " ng-class="(pls.IsEdited == true) ? \'notice-info\' :\'\'" ng-repeat="pls in loop" >'
                        + '<div style="display:inline-flex; width:100%;max-height: 4vh;">'
                            + '<strong class="col-md-4 col-xs-4"><span>{{plenum[pls.PricelistId]}}</span></strong>'
                            + '<div class="col-md-8 col-xs-8" style="display:flex;" >'
                                + '<select style="max-width: 30%;"class="form-control" ng-model="pls.TaxId" ng-options="item.value as item.name for item in taxEnum" ng-change="priceChanged(pls,\'tax\')"></select>'
                                + '<select style="max-width: 30%;"class="form-control" ng-model="pls.VatId" ng-options="item.value as item.name for item in vatEnum" ng-change="priceChanged(pls,\'vat\')"></select>'
                                + '<input style="width: 40%; text-align:right;" type="number" ng-model="pls.Price" ng-change="priceChanged(pls,\'Price\')"/>'
                            + '</div>'
                        + '</div>'
                    + '</div>'
                + '</div>'
                + '</div>',
            replace: true
        };
    })
