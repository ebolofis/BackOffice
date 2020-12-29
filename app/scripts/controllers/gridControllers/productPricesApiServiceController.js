'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:ProductsPricesController
 * @description
 * # ProductsPricesController
 * Controller of the posBOApp
 */
angular.module('posBOApp')
.controller('ProductsPricesController', ['$rootScope', 'tosterFactory', '$stateParams', '$scope', '$filter', '$http', '$window', '$log', '$timeout', '$q', '$interval', '$uibModal', 'uiGridConstants', 'uiGridGroupingConstants', 'DynamicApiService', 'GridInitiallization', 'uiGridFactory', 'dataUtilFactory', 'FileUploader',
function ($rootScope, tosterFactory, $stateParams, $scope, $filter, $http, $window, $log, $timeout, $q, $interval, $uibModal, uiGridConstants, uiGridGroupingConstants, DynamicApiService, GridInitiallization, uiGridFactory, dataUtilFactory, FileUploader) {
    $scope.entityIdentifier;
    $scope.gridPaginationOptions = { pageNumber: 1, pageSize: 20, sort: null };
    $scope.showgrid = false;
    $scope.searchFilter = {
        Description: '',
        ProductCode: '',
        ProductCategoryId: null,
        ProductId: null,
    }

    $scope.isIng = ($scope.entityIdentifier == 'Ingredient') ? true : false;

    $scope.initView = function () {
        var VatPromise = $scope.getDropDownLookUps('Vat');
        var TaxPromise = $scope.getDropDownLookUps('Tax');
        var PriceListPromise = $scope.getDropDownLookUps('PriceList');
        var PricelistMasterPromise = $scope.getDropDownLookUps('PricelistMaster');
        var ProductCategoriesPromise = $scope.getDropDownLookUps('ProductCategories');
        $scope.activeSaveButton = true;
        //When all lookUps finished loading 
        $q.all([VatPromise, PriceListPromise]).then(function () {
            tosterFactory.showCustomToast('All lookup entities resolved', 'success');
            var ProductPricesPromise = $scope.getDropDownLookUps('ProductPrices'); //get pagged Results of Products
            $scope.showgrid = true;
        });
    }

    //Function switched by entity called with External Params 
    //Fills LookUps Data and grids Data rows
    $scope.getDropDownLookUps = function (entity, customparams) {
        switch (entity) {
            case 'Vat': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.vats = result.data;
                $scope.vatsEnum = dataUtilFactory.createEnums($scope.vats, {}, 'Id', 'Description');
                $scope.percentVatEnum = dataUtilFactory.createEnums($scope.vats, {}, 'Id', 'Percentage');
                $scope.vatSFEDropDown = $scope.createMapDropdown($scope.percentVatEnum);
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Vat Lookups failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            })); break;

            case 'Tax': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.taxs = result.data;
                $scope.taxsEnum = dataUtilFactory.createEnums($scope.taxs, {}, 'Id', 'Description');
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Tax Lookups failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            })); break;

            case 'PriceList': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.priceLists = result.data;
                angular.forEach($scope.priceLists, function (item) {
                    item.selected = true;
                })
                var ret = dataUtilFactory.createEnumsAndEnumObjs($scope.priceLists, {}, {}, 'Id', 'Description');
                $scope.priceListsEnum = ret.retEnum;
                $scope.priceListsEnumObj = ret.retEnumObj;
            }, function (reason) {
                tosterFactory.showCustomToast('Loading PriceList Lookups failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            })); break;

            case 'PricelistMaster': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.pricelistMasters = result.data;
                $scope.pricelistMastersEnum = dataUtilFactory.createEnums($scope.pricelistMasters, {}, 'Id', 'Description');
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Pricelist Master Lookups failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            })); break;

            case 'ProductCategories': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.productCategories = result.data;
                $scope.productCategoriesEnum = dataUtilFactory.createEnums($scope.productCategories, {}, 'Id', 'Description');
                $scope.productCategoryOptions = [];
                angular.forEach($scope.productCategories, function (value) {
                    var tmpObj = { Id: value.Id, Description: value.Description }; $scope.productCategoryOptions.push(tmpObj);//create array of Deparment Objects
                });
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Product Categories Lookups failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            })); break;

            case 'ProductPrices':
                var parameters;
                var isIng = ($scope.entityIdentifier == 'Product') ? false : true;
                if (customparams == undefined || customparams == null || customparams == '')
                    parameters = 'page=' + $scope.gridPaginationOptions.pageNumber + '&pageSize=' + $scope.gridPaginationOptions.pageSize + '&isIngredient=' + isIng;
                else parameters = customparams;
                $scope.loadingState = true;
                return (DynamicApiService.getDynamicObjectData(entity, parameters).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    $scope.productPrices = angular.copy(result.data.Results);
                    checkNulls();
                    $scope.productPricesEnum = dataUtilFactory.createEnums($scope.productPrices, {}, 'Id', 'Description');
                    $scope.manageGridData();
                    $scope.currentPage = result.data.CurrentPage;
                    $scope.numPages = result.data.PageCount;
                    $scope.gridPaginationOptions.pageSize = $scope.pageSize = result.data.PageSize;
                    $scope.bigTotalItems = result.data.RowCount;
                    $scope.loadingState = false;

                }, function (reason) {
                    tosterFactory.showCustomToast('Loading Product Prices failed', 'fail');
                    console.log('Fail Load'); console.log(reason);
                    $scope.loadingState = false;
                })); break;
            default: break;
        }
    }
    $scope.manageGridData = function () {
        angular.forEach($scope.productPrices, function (item, key) {
            var tmpEobj = dataUtilFactory.createEnumObjs(item.ProductPricesModelDetails, {}, 'PriceListId');
            item.ProductPricesModelDetails = tmpEobj;

            angular.forEach($scope.priceLists, function (cpl) {
                if (item.ProductPricesModelDetails[cpl.Id] === undefined) {
                    item.edited = true;
                    var vatId2Ins;
                    var nullLookUp = (cpl.LookUpPriceListId !== undefined && cpl.LookUpPriceListId !== null) ? true : false
                    if (nullLookUp) {
                        var arr = angular.copy(item.ProductPricesModelDetails);
                        var ppmd = []
                        angular.forEach(arr, function (citem) {
                            if (citem.PriceListId == cpl.LookUpPriceListId)
                                ppmd.push(citem);
                            //return (citem.PriceListId ==cpl.LookUpPriceListId);
                        })
                        vatId2Ins = (ppmd.length > 0) ? ppmd[0].VatId : $scope.vats[0]['Id'];
                    }
                    var tmpObj = {
                        LookUpPriceListId: (nullLookUp) ? cpl.LookUpPriceListId : null,
                        PriceListId: cpl.Id,
                        PriceWithout: null,
                        PricelistDetailId: 0, // to insert
                        PricelistMasterId: (nullLookUp) ? cpl.PricelistMasterId : null,   //cpl.PricelistMasterId
                        TaxId: (nullLookUp) ? $scope.priceListsEnumObj[cpl.LookUpPriceListId]['TaxId'] : null,
                        VatId: (nullLookUp && vatId2Ins !== undefined) ? vatId2Ins : $scope.vats[0]['Id'],
                        //VatId: (nullLookUp) ? $scope.priceListsEnumObj[cpl.LookUpPriceListId]['VatId'] : $scope.priceListsEnumObj[1]['VatId'],
                        Percentage: $scope.priceListsEnumObj[cpl.Id].Percentage,
                        Price: (nullLookUp
                            && item.ProductPricesModelDetails[cpl.LookUpPriceListId]['Price'] !== undefined
                            && item.ProductPricesModelDetails[cpl.LookUpPriceListId]['Price'] !== null) ? (($scope.priceListsEnumObj[cpl.Id].Percentage / 100) * item.ProductPricesModelDetails[cpl.LookUpPriceListId]['Price']).toFixed(2) : 0,
                    }
                    item.ProductPricesModelDetails[cpl.Id] = tmpObj;
                }

            })
        })
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
    //fix if a price or Pricewithout when ingredient is false
    function checkNulls() {
        var mesg = false;
        $scope.productPrices = $scope.productPrices.map(function (item) {
            var ied = false;
            angular.forEach(item.ProductPricesModelDetails, function (value) {
                //if price || priceWithout NAN assign to zero(0)
                if (value.Price === null || value.Price === undefined) {
                    value.Price = 0;
                    ied = true;
                }
                if (value.PriceWithout === null || value.PriceWithout === undefined && $scope.isIng == true) {
                    value.PriceWithout = 0;
                    ied = true;
                }
                //if vatId == null give 1rst
                if (value.VatId === undefined || value.VatId === null) { 
                    value.VatId = $scope.vats[0].Id
                    ied = true;
                };

            })
            if (ied == true) {
                if (mesg == false) {
                    tosterFactory.showCustomToast('Project will auto manage them on save if no user action performed. Default:(0 ,' + $scope.vats[0].Percentage + '%).\nEntries with null price or vat. ', 'info');
                    mesg = true;
                }
                item.edited = true;
            }
            return item;
        });
    }

    $scope.saveGridChanges = function () {
        $scope.savingProcess = true;
        checkNulls();

        var saveArr = $filter('filter')($scope.productPrices, function (item) { if (item.edited == true) return item; });
        var entriesArr = [];
        angular.forEach(saveArr, function (row) {
            angular.forEach(row.ProductPricesModelDetails, function (value) {
                value.Id = value.PricelistDetailId;
                //value.ProductId = row.ProductId,
                ($scope.entityIdentifier == 'Product') ? value.ProductId = row.ProductId : value.IngredientId = row.ProductId;
                entriesArr = entriesArr.concat(value);
            })
        })
        if (entriesArr.length > 0) {
            var savePromise = DynamicApiService.putMultiple('ProductPrices', entriesArr).then(function (result) {
                $scope.savingProcess = false;
                angular.forEach($scope.productPrices, function (item) { item.edited = false })
                tosterFactory.showCustomToast('Changes saved successfully. Reloading entries..', 'success');
                $scope.pageChanged();
            }, function (reason) {
                tosterFactory.showCustomToast('Updating failed', 'fail');
                console.log('Fail Update'); console.log(reason);
            });
            $q.all([savePromise]).then(function () {
                $scope.savingProcess = false;
            })

        } else {
            $scope.savingProcess = false;
            tosterFactory.showCustomToast('No modified Entries to save.', 'fail');
        }
        //console.log(saveArr);

    }

    //var to manipulate collapse filter window
    $scope.filterPlsCollapsed = false;
    //multicheckuncheck var 
    //$scope.plsAll = true;
    ////action on multicheck
    //$scope.toggleAll = function () {
    //    $scope.plsAll = !$scope.plsAll;
    //    var Check = angular.copy($scope.plsAll);
    //    angular.forEach($scope.priceLists, function (item) {
    //        item.selected = Check;
    //    });
    //}
    //Filter fun to match notices on pricelist Filter
    $scope.plIsSelected = function (item) {
        if (item.selected == true)
            return true;
        return false;
    }

    //FILTERED REST PRODUCT Procedures
    //Collapse panel filters button action $$tip: move this to a directive on this controller
    $scope.togglePricelistFilter = function () {
        $window.onclick = null;
        $scope.filterPlsCollapsed = !$scope.filterPlsCollapsed;
        if ($scope.filterPlsCollapsed == true) {
            $window.onclick = function (event) {
                var target = $(event.target);
                if (target.parents('div#collapseFilterSearch').length < 1) {
                    if (target[0].getAttribute('id') == 'collapseFilterSearch') {
                        return;
                    } else {
                        $scope.filterPlsCollapsed = false;
                        $scope.$apply();
                    }
                }
            };
        }
    };
    //Table paggination Vars and Functions 
    $scope.maxSize = 5; //size of buttons in pag 
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;
    $scope.totalItems = 64; //all items 
    $scope.currentPage = 4; //current page
    $scope.numPages = -1;
    $scope.pageSize = 20;
    $scope.setPage = function (pageNo) {

    };
    //Checks View to see if is valid for redirect and paggination Actions
    $scope.validToChange = function () {
        if ($scope.productPrices === undefined) return false;
        var saveArr = $filter('filter')($scope.productPrices, function (item) { if (item.edited == true) return item; });
        if (saveArr.length > 0)
            return false;
        else
            return true;
    }
    $scope.pageSizeChanged = function () {
        if ($scope.gridPaginationOptions.pageSize !== $scope.pageSize) {
            if ($scope.validToChange() == false) {
                if ($scope.productPrices !== undefined)
                    tosterFactory.showCustomToast('Line(s) with unsaved changes. Please Save or Discard your changes.', 'warning');
                $scope.gridPaginationOptions.pageSize = $scope.pageSize; return;
            } else {
                $scope.pageSize = $scope.gridPaginationOptions.pageSize;
                $scope.gridPaginationOptions.pageNumber = $scope.bigCurrentPage = 1;
                if (filtersUsed) { $scope.filteredSearch(true); } else { $scope.getDropDownLookUps('ProductPrices'); }
            }
        }
    }
    //Paggination Mapping on Event  number Click 
    $scope.pageChanged = function () {
        if ($scope.validToChange() == false) {
            if ($scope.productPrices !== undefined)
                tosterFactory.showCustomToast('Line(s) with unsaved changes. Please Save or Discard your changes.', 'warning');
            $scope.bigCurrentPage = $scope.gridPaginationOptions.pageNumber;
            return;
        } else {
            $scope.gridPaginationOptions.pageNumber = $scope.bigCurrentPage;
            if (filtersUsed) {
                $scope.filteredSearch(true);
            } else {
                $scope.getDropDownLookUps('ProductPrices');
            }
        }
    };
    //help function check if filters != empty and return true || false
    function filtersUsed() {
        if ($scope.searchFilter.Description != '' || $scope.searchFilter.ProductCode != '' || $scope.searchFilter.ProductCategoryId != null || $scope.searchFilter.ProductId != null)
            return true;
        return false;
    }
    $scope.enterKeyAction = function (keyEvent) {
        if (keyEvent.which === 13)
            $scope.filteredSearch(false);
    }
    //Action [Search] in filtered Search
    //Creates filter Obj and Call lookups
    //Input (pagEvent) true, false used to drive Lookup on Products load
    $scope.filteredSearch = function (pagEvent) {
        var filterObj = {}
        angular.forEach($scope.searchFilter, function (value, key) {
            if (value != null && value != '') {
                filterObj[key] = value;
            }
        })
        console.log(filterObj);
        if ($scope.validToChange() == false) {
            if ($scope.productPrices !== undefined) {
                tosterFactory.showCustomToast('Line(s) with unsaved changes. Please Save or Discard your changes.', 'warning');
            }

        } else {
            if (pagEvent == false)
                $scope.gridPaginationOptions.pageNumber = 1;
            var isIng = ($scope.entityIdentifier == 'Product') ? false : true;
            var params = 'filters=' + JSON.stringify(filterObj) + '&page=' + $scope.gridPaginationOptions.pageNumber + '&pageSize=' + $scope.gridPaginationOptions.pageSize + '&isIngredient=' + isIng;
           // console.log(params);
            var ProductPricesPromise = $scope.getDropDownLookUps('ProductPrices', params);
        }
    }
    //Action [Clear] in filtered Search
    $scope.clearSearchFilters = function () {
        $scope.searchFilter = { Description: '', ProductCode: '', ProductCategoryId: null, ProductId: null }
    }
    $scope.priceChanged = function (row, pls, modelValue, ref) {
        row.edited = true;
        if (ref == 'Price') {
            var num = Number(modelValue.toFixed(2));
            row.ProductPricesModelDetails[pls.Id].Price = num;
            //console.log(row.ProductPricesModelDetails);
            var plsTochange = $scope.priceLists.filter(function (item) {
                return (item.LookUpPriceListId == pls.Id)
            })
            //osa product sto loop exoun lookupPlId = me auto pou allakse 
            //timh = timh toy lookup Pricelist me to current %
            angular.forEach(plsTochange, function (item) {
                var sitem = row.ProductPricesModelDetails[item.Id];
                //console.log(sitem);
                if (sitem.LookUpPriceListId == pls.Id && sitem.PricelistId != sitem.LookUpPriceListId) {
                    var cPercent = (sitem.Percentage / 100);
                    var tnum = num * cPercent;
                    sitem.Price = Number(tnum.toFixed(2));
                    row.ProductPricesModelDetails[item.Id] = sitem;
                } else {
                    alert('Error on updating row Lookup pricelist:' + item.Description);
                }
            })
            //if (percentObj !== null && percentObj !== undefined && percentObj.length == 1) {
            //    angular.forEach($scope.loop, function (item) {
            //        if (item.LookUpPriceListId == modelValue.PricelistId && item.PricelistId != item.LookUpPriceListId) {
            //            var cPercent = (item.Percentage / 100);
            //            var tnum = num * cPercent;
            //            item.Price = Number(tnum.toFixed(2));
            //            item.IsEdited = true;
            //        }
            //    })
            //} else if (percentObj.length > 1) {
            //    alert('CRITICAL ERROR.\nMore than one pricelist found with same Id!\nAvoid saving');
            //}
        }
    }

}])
function ProductPricesCellCtrl($scope, $locale, $rootScope) {

    var pause;
    //$scope.applyAll = function (type) {
    //    $scope.data['isPricelistEdited'] = true;
    //    $scope.loop = $scope.loop.filter(function (item) {
    //        item.IsEdited = true;
    //        if (type == 'vat') item.VatId = $scope.vatToAll;
    //        //if (type == 'price') item.Price = $scope.priceToAll;
    //        return item;
    //    })
    //}
    //$scope.priceChanged = function (modelValue, ref) {
    //    $scope.data['isPricelistEdited'] = true;
    //    modelValue.IsEdited = true;
    //    var num = Number(modelValue.Price.toFixed(2));
    //    modelValue.Price = num;
    //    if (ref == 'Price') {
    //        var percentObj = $scope.pricelistsLoaded.filter(function (item) { return (item.Id == modelValue.PricelistId) })
    //        //osa product sto loop exoun lookupPlId = me auto pou allakse 
    //        //timh = timh toy lookup Pricelist me to current %
    //        if (percentObj !== null && percentObj !== undefined && percentObj.length == 1) {
    //            angular.forEach($scope.loop, function (item) {
    //                if (item.LookUpPriceListId == modelValue.PricelistId && item.PricelistId != item.LookUpPriceListId) {
    //                    var cPercent = (item.Percentage / 100);
    //                    var tnum = num * cPercent;
    //                    item.Price = Number(tnum.toFixed(2));
    //                    item.IsEdited = true;
    //                }
    //            })
    //        } else if (percentObj.length > 1) {
    //            alert('CRITICAL ERROR.\nMore than one pricelist found with same Id!\nAvoid saving');
    //        }
    //    }
    //}
    //$scope.$watch('priceToAll', function (newValue, oldValue) {
    //    if (newValue != oldValue) {
    //        var num = Number(newValue.toFixed(2))
    //        $scope.priceToAll = num
    //    }
    //});
}


