'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:ManageProductsController
 * @description
 * # DepartmentsController
 * Controller of the posBOApp to manage productDTO and its DTO entities including Recipe , Extras , Barcodes , PricelistDetails
 */

angular.module('posBOApp')
    .controller('ManagePagesController', ['$scope', '$filter', '$http', '$q', '$mdDialog', '$mdMedia', 'DynamicApiService', 'dataUtilFactory', 'tosterFactory', 'pageManageFactory',
        function ($scope, $filter, $http, $q, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, tosterFactory, pageManageFactory) {

            $scope.init = function () {
                $scope.mainTemplate = 'select-pageset-template';
                $scope.loadingProccess = true;
                $q.all({
                    lookupPromise: $scope.RestPromice.lookups('ManagePages'),            //[Kds,Kitchen,KitchenRegion,ProductCategories,Units,Ingredient_ProdCategoryAssoc,Pricelist,Vat,Tax,Ingredients] lookups for Products management
                    pagesetPromise: $scope.RestPromice.AttributeRouting("BOPageSets", "GetAllPageSets", "", "")
                }).then(function (d) {
                    if (d.lookupPromise.data != null) {
                        $scope.lookups = d.lookupPromise.data.LookUpEntities;
                        console.log(d.lookupPromise.data);
                    }
                    if (d.pagesetPromise.data != null) {
                        //manage activation and deactivation dates to DP entities for view perposes
                        $scope.pagesets = $scope.manageDate(d.pagesetPromise.data, 'pagesets');
                        console.log(d.pagesetPromise.data);
                    } else { $scope.pagesets = []; }
                }).finally(function () {
                    $scope.loadingProccess = false;
                })
            }

            $scope.RestPromice = {
                //Resource of lookups needed to manage lockers and side entities of forms
                'lookups': function (nameType) {
                    return DynamicApiService.getLookupsByEntityName(nameType).then(function (result) {
                        return result;
                    }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Lookups failed', 'fail'); console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection); return null; });
                },
                'AttributeRouting': function (controllerName, actionName, extraData, parameters) {
                    return DynamicApiService.getAttributeRoutingData(controllerName, actionName, extraData, parameters).then(function (result) {
                        return result;
                    }).catch(function (rejection) { tosterFactory.showCustomToast('Loading routing failed', 'fail'); console.warn('Get with attribute route on server failed. Reason:'); console.warn(rejection); return null; });
                },
                'DeleteAttributeRouting': function (controllerName, actionName, parameters) {
                    return DynamicApiService.deleteAttributeRoutingDataForce(controllerName, actionName, parameters).then(function (result) {
                        return result;
                    }).catch(function (rejection) { tosterFactory.showCustomToast('Delete on server failed', 'fail'); console.warn('Delete action on server failed. Reason:'); console.warn(rejection); return null; })
                }
            }

            $scope.managePages = function (ps) {
                if (ps == undefined) {
                    $scope.pages = [];
                    $scope.mainTemplate = 'select-page-template';
                    return;
                }
                $scope.selectedPageset = angular.extend({}, ps);
                $scope.mainTemplate = 'select-page-template';
                $scope.reloadPages(ps);
            }

            //a function that triggers reload on pages
            $scope.reloadPages = function (set) {
                var controllerName = "BOPageSets", actionName = "GetAllPages", extraFields = set.Id;
                $scope.loadingProccess = true;
                $q.all({
                    pagesetPromise: $scope.RestPromice.AttributeRouting(controllerName, actionName, extraFields, "")
                }).then(function (d) {
                    if (d.pagesetPromise.data != null) {
                        $scope.pages = [];
                        $scope.pages = angular.extend([], d.pagesetPromise.data);//$scope.manageDate(, 'pagesets');
                        console.log('Pages Loaded');
                        console.log($scope.pages);
                        //manage activation and deactivation dates to DP entities for view perposes S
                        //var sort = dataUtilFactory.createEnums(result.data, {}, 'Sort', 'Id'); $scope.possibleSorts = [], $scope.maxPageSort = -1;
                        //for (var i = 0; i < result.data.length; i++) {
                        //    if (result.data[i]['Sort'] > $scope.maxPageSort)
                        //        $scope.maxPageSort = result.data[i]['Sort'];
                        //}
                        //angular.forEach(result.data, function (item) { if (item.Sort === null || item.Sort === undefined) { $scope.maxPageSort += 1; item.Sort = $scope.maxPageSort; } })
                        //$scope.pagesLoaded = $scope.pagesDropDownArray = dataUtilFactory.quicksort(result.data, 'Sort'); //result.data;
                        //console.log(d.pagesetPromise.data);
                    } else { $scope.pages = []; }
                }).finally(function () { $scope.loadingProccess = false; })
            }
            //a function that triggers reload on pagesets
            $scope.reloadPagesets = function () {
                $scope.loadingProccess = true;
                $q.all({
                    pagesetPromise: $scope.RestPromice.AttributeRouting("BOPageSets", "GetAllPageSets", "", "")
                }).then(function (d) {
                    if (d.pagesetPromise.data != null) {
                        //manage activation and deactivation dates to DP entities for view perposes S
                        $scope.pagesets = $scope.manageDate(d.pagesetPromise.data, 'pagesets');
                        console.log(d.pagesetPromise.data);
                    } else { $scope.pagesets = []; }
                }).finally(function () { $scope.loadingProccess = false; })
            }

            $scope.manageDate = function (arr, type) {
                var ret = [];
                angular.forEach(arr, function (item) {
                    item['DPActivationDate'] = new Date(item.ActivationDate);
                    item['DPDeactivationDate'] = new Date(item.DeactivationDate);
                    ret.push(item);
                })
                return ret;
            }
            $scope.deleteEntity = function (type, datamodel) {
                if (datamodel == null || datamodel === undefined) {
                    tosterFactory.showCustomToast('Invalid selection of ' + type, 'info');
                    return;
                }
                var entitytodel = {}, delCtrl = '', delFun = ''
                switch (type) {
                    case 'pageset': entitytodel = angular.extend({}, datamodel); delCtrl = 'BOPageSets'; delFun = 'DeletePageSet'; break;
                    case 'page': entitytodel = angular.extend({}, datamodel); break;
                    default:
                }
                //console.log('Deleting PageSet:'); console.log($scope.selectedPageSet);
                var deletePageDialog =
                    $mdDialog.confirm().title('Deleting "' + entitytodel.Description + '" ' + type + '')
                        .htmlContent('<br><br>You are about to delete selected ' + type + '. Are you sure you want to continue?<br><br>'
                        + '<small>*Changes will affect any mapped POS associated on pageset, pages and page buttons and will send an update signal on current online maps.</small>')
                        .ariaLabel('deleting-selected-pageentity').ok('Delete').cancel('Cancel');
                $mdDialog.show(deletePageDialog).then(function () {
                    $q.all({ deletePromice: $scope.RestPromice.DeleteAttributeRouting(delCtrl, delFun, entitytodel.Id) }).then(function (d) {
                        if (d.deletePromice.data != null) {
                            $scope.reloadPagesets();
                        }
                    })
                });
            }




            //Autocomplete Functions 
            $scope.querySearch = querySearch; $scope.selectedItemChange = selectedItemChange; $scope.searchTextChange = void (0);//searchTextChange;
            //obj of functions to parse in dynamic autocomplete directive
            $scope.autoCompleteObjFun = { 'querySearch': $scope.querySearch, 'selectedItemChange': $scope.selectedItemChange, 'searchTextChange': $scope.searchTextChange, }

            //function binded to search text over results
            function querySearch(query) {
                //var tmp = { Description: query }; var params = 'page=1&pageSize=250' + '&filters=' + JSON.stringify(tmp); var results = [], deferred;
                var results = query ? $scope.pagesets.filter(createFilterFor(query)) : $scope.pagesets;
                if ($scope.simulateQuery) {
                    deferred = $q.defer();
                    deferred.resolve(results);
                    //$scope.RestPromice.searchFilteredProducts(params).then(function (result) {
                    //    results = result.data.Results; deferred.resolve(results);
                    //}).catch(function (fail) { console.warn('Products failed on description or code search'); deferred.resolve([]); })
                    return deferred.promise;
                } else { return results; }
            }
            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);
                return function filterFn(pageset) {
                    return (pageset.Description.indexOf(lowercaseQuery) === 0);
                };

            }
            function searchTextChange(text) { console.info('Text changed to ' + text); }
            function selectedItemChange(selectedItem, mapvar, entHandle) {
                console.log('selected entity change trigger');
                if (selectedItem == undefined || selectedItem === null || selectedItem == -1) {
                    //return;
                }
                var managingEnt = angular.copy(entHandle);
                var providedVar = angular.copy(selectedItem);
                $scope.managePages(selectedItem);
                //$scope.externalProducts = $scope.externalProducts.filter(function (item) {
                //    if (item['Id'] == managingEnt['Id']) {
                //        item.ProductId = providedVar.Id;
                //        item.Product = providedVar;
                //        $scope.checkDirty(item);
                //    }
                //    return item;
                //})
            }
        }])
    .factory('pageManageFactory', function ($http, $rootScope) { //maps ID with VALUE in select form  to display in drop down ui-grid CELL
        return {
            getDefaultModels: function (type) {
                if (type == undefined || defaultModels[type] == undefined)
                    return defaultModels;
                else {
                    return defaultModels[type];
                }
            }
        }
        var defaultModels = {
            'pageset': {
                Id: 0,
                Description: '',
                ActivationDate: new Date(),
                DeactivationDate: new Date(),
                PosInfoId: null,
                PdaModuleId: null,
                Pages: [],
                AssosiatedPos: [],
            },
            'AssosiatedPos': {
                Id: 0,
                PageSetId: null,
                PosInfoId: null,
                PosInfoDescription: '',
                IsDeleted: false
            },
            'page': {
                Id: 0,
                Description: '',
                ExtendedDesc: '',
                DefaultPriceListId: null,
                PageSetId: null,
                Sort: null,
                Status: null,
                IsDeleted: false,
                PageButtons: []
            },
            'pageButton': {
                Id: 0,
                Sort: null,
                PageId: null,
                Color: null,//:'',
                Background: null,//:'',
                ProductId: null,
                Description: '',
                SalesDescritpion: '',
                Type: null,
                SetDefaultPriceListId: null,
                SetDefaultSalesType: null,
                NavigateToPage: null,
                PriceListId: null,
                IsDeleted: false,
            }
        }
    })
