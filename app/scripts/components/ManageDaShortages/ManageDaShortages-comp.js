/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />
angular.module('posBOApp')
    .component('dashortagescomp', {
        templateUrl: 'app/scripts/components/ManageDaShortages/templates/ManageDaShortages-comp.html',
        controller: 'managedashortagescompCTRL',
        controllerAs: 'ShortMain'
    })
    .controller('managedashortagescompCTRL', ['$scope', '$mdDialog', '$mdMedia', 'dasFactory', 'dataUtilFactory', 'tosterFactory', '$q', 'DynamicApiService', function ($scope, $mdDialog, $mdMedia, dasFactory, dataUtilFactory, tosterFactory, $q, DynamicApiService) {
        var ShortMain = this;
        var dtu = dataUtilFactory;
        ShortMain.restbusy = false; ShortMain.hasError = false;
        ShortMain.$onInit = function () { };

        ShortMain.initView = function () {
            ShortMain.shortages = [];
            ShortMain.stores = [];
            ShortMain.selectedshortages = [];
            ShortMain.GetStores();
            ShortMain.GetShortages();
        };
        $scope.searchText = ' ';

        $scope.searchText = '';
        $scope.Lookups = {};
        //Resources obj over api promises
        $scope.test = function () {
            //GetSetupStores
            var nameType = 'SetupStores';
            DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.Lookups.StoreList = result.data.LookUpEntities.StoreId;
                console.log('LookUps loaded'); console.log(result);
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Lookups failed', 'fail');
                console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection);
                return null;
            })
        };

        $scope.hide = function () { $mdDialog.hide(); };
        $scope.cancel = function () { $mdDialog.cancel(); };
        $scope.test();


        ShortMain.GetStores = function () {
            var url = dasFactory.apiInterface.ManageDaShortages.GET.GetStores;
            DynamicApiService.getDAV3('Stores', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Stores List Loaded', 'success');
                    ShortMain.stores = result.data;
                    //PolMain.createMap();
                } else {
                    tosterFactory.showCustomToast('No Stores Loaded', 'success');
                    ShortMain.stores = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Stores List failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                ShortMain.hasError = true; ShortMain.stores = [];
                return -1;
            }).finally(function () {
                ShortMain.restbusy = false;
            });
        }

  

        //Get Shortages
        ShortMain.GetShortages = function () {
            var url = dasFactory.apiInterface.ManageDaShortages.GET.GetShortagesList;
            DynamicApiService.getDAV3('Shortages', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Shortages List Loaded', 'success');
                    ShortMain.shortages = result.data;                    
                } else {
                    tosterFactory.showCustomToast('NoShortages List Loaded', 'success');
                    ShortMain.shortages = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Shortages List failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                ShortMain.hasError = true; ShortMain.shortages = [];
                return -1;
            }).finally(function () {
                ShortMain.restbusy = false;
            });
        }
        $scope.removeShortage = function (row) {
            ShortMain.selectedshortages = ShortMain.selectedshortages.filter(function (item) { return item.Id !== row.Id });
            var url = dasFactory.apiInterface.ManageDaShortages.POST.DeleteShortages;
            deletedShortageId = row.Id;
            DynamicApiService.deleteShortageDAV3('Shortages', url, deletedShortageId).then(function (result) {
                tosterFactory.showCustomToast('Shortage Deleted succesfully', 'success');
                var url = dasFactory.apiInterface.ManageDaShortages.GET.GetShortagesList;
                DynamicApiService.getDAV3('Shortages', url).then(function (result) {
                    if (result != null && result.data != null) {
                        //  tosterFactory.showCustomToast('Promos Headers Loaded', 'success');
                        ShortMain.shortages = result.data;
                    } else {
                        //tosterFactory.showCustomToast('No Promos Headers Loaded', 'success');
                        ShortMain.shortages = [];
                    }
                }).catch(function (rejection) {
                }).finally(function () {
                });

            }, function (reason) {
                tosterFactory.showCustomToast('Shortage Delete failed', 'fail');
                console.log('Fail update'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Shortage Delete error', 'error');
                console.log('Error update'); console.log(reason);
            })
        };

        $scope.viewStoreShortages = function (selectedStore) {
            var Id = selectedStore.Id;
            ShortMain.selectedshortages = ShortMain.shortages.filter(function (item) { return item.StoreId === Id });

            
        }



        //Add SHORTAGE
        $scope.addShortages = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var url = dasFactory.apiInterface.ManageDaShortages.GET.GetProducts;
            DynamicApiService.getV3('Product', url).then(function (resultProducts) {
                if (resultProducts != null && resultProducts.data != null) {
                    $scope.Lookups.ProductList = resultProducts.data;

                    var formModel = { entityIdentifier: type, dropDownObject: $scope.Lookups, title: 'Managing ' + type };
                    var dataEntry = {};
                    if (action == 'edit' && data !== undefined && data !== null) {
                        formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                        dataEntry = angular.copy(data);
                    }
                    var actionname = {
                        type: type,
                        action: action
                    };
                    $mdDialog.show({
                        controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                        resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
                    })
                        .then(function (retdata) {
                            var url = dasFactory.apiInterface.ManageDaShortages.POST.InsertShortages;
                            DynamicApiService.postDAV3('Shortages', url, retdata).then(function (result) {
                                tosterFactory.showCustomToast('Shortage Inserted succesfully', 'success');

                                //Update UI 
                                ShortMain.shortages = [];
                                var url = dasFactory.apiInterface.ManageDaShortages.GET.GetShortagesList;
                                DynamicApiService.getDAV3('Shortages', url).then(function (resultShortages) {
                                    if (resultShortages != null && resultShortages.data != null) {
                                        resultShortages.data.forEach(function (details) {
                                            ShortMain.shortages.push(details);
                                        });
                                    } else {
                                        ShortMain.shortages = [];
                                    }
                                }).catch(function (rejection) {
                                    ShortMain.shortages = [];
                                }).finally(function () {
                                });

                            }, function (reason) {
                                tosterFactory.showCustomToast('Shortage Insert failed', 'fail');
                                console.log('Fail update'); console.log(reason);
                            }, function (error) {
                                tosterFactory.showCustomToast('Shortage Insert error', 'error');
                                console.log('Error update'); console.log(reason);
                            })
                        }, function () { });
                    $scope.$watch(function () {
                        return $mdMedia('xs') || $mdMedia('sm');
                    }, function (wantsFullScreen) {
                        $scope.customFullscreen = (wantsFullScreen === true);
                    });

                } else {
                    console.warn('No Product Loaded');
                }
            }).catch(function (rejection) {
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
            }).finally(function () {
            });
        };


        //edit Shortage

        $scope.editShortage = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var url = dasFactory.apiInterface.ManageDaShortages.GET.GetProducts;
            DynamicApiService.getV3('Product', url).then(function (resultProducts) {
                if (resultProducts != null && resultProducts.data != null) {
                    $scope.Lookups.ProductList = resultProducts.data;

                    var formModel = { entityIdentifier: type, dropDownObject: $scope.Lookups, title: 'Managing ' + type };
                    var dataEntry = {};
                    if (action == 'edit' && data !== undefined && data !== null) {
                        formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                        dataEntry = angular.copy(data);
                    }
                    var actionname = {
                        type: type,
                        action: action
                    };
                    $mdDialog.show({
                        controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                        resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
                    })
                        .then(function (retdata) {
                            var url = dasFactory.apiInterface.ManageDaShortages.POST.UpdateShortages;
                            DynamicApiService.postDAV3('Shortages', url, retdata).then(function (result) {
                                tosterFactory.showCustomToast('Shortage Updated succesfully', 'success');

                                //Update UI 
                                ShortMain.shortages = [];
                                var url = dasFactory.apiInterface.ManageDaShortages.GET.GetShortagesList;
                                DynamicApiService.getDAV3('Shortages', url).then(function (resultShortages) {
                                    if (resultShortages != null && resultShortages.data != null) {
                                        resultShortages.data.forEach(function (details) {
                                            ShortMain.shortages.push(details);
                                        });
                                    } else {
                                        ShortMain.shortages = [];
                                    }
                                }).catch(function (rejection) {
                                    ShortMain.shortages = [];
                                }).finally(function () {
                                });

                            }, function (reason) {
                                tosterFactory.showCustomToast('Shortage Insert failed', 'fail');
                                console.log('Fail update'); console.log(reason);
                            }, function (error) {
                                tosterFactory.showCustomToast('Shortage Insert error', 'error');
                                console.log('Error update'); console.log(reason);
                            })
                        }, function () { });
                    $scope.$watch(function () {
                        return $mdMedia('xs') || $mdMedia('sm');
                    }, function (wantsFullScreen) {
                        $scope.customFullscreen = (wantsFullScreen === true);
                    });

                } else {
                    console.warn('No Product Loaded');
                }
            }).catch(function (rejection) {
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
            }).finally(function () {
            });
        };




        $scope.applyFilter = function () {
            var resfilter = {}, lookups = {};
            if ($scope.receiptFilter != undefined) resfilter = $scope.receiptFilter;
            if ($scope.Lookups != undefined) lookups = $scope.Lookups;
            $mdDialog.show({
                controller: 'DaShortagesFilter',
                templateUrl: '../app/scripts/directives/modal-directives/Da-Shortages-Filter.html',
                parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: {
                    resfilter: function () { return resfilter; },
                    lookups: function () { return lookups; }
                }
            }).then(function (data) {
                console.log('This is data filter return from selection filter modal');
                if (data != undefined) {
                    //extend receipt filter by data returned then call psize that changes also current page to 1
                    angular.extend($scope.receiptFilter, data);
                    //console.log(data); console.log($scope.resfilter);
                    $scope.psizeChanged();
                }
            }).catch(function () { console.log('This is data filter return from selection filter modal'); });
        };

    }])
    .controller('DaShortagesFilter', function ($scope, $mdDialog, resfilter, lookups) {
        //console.log('Popup result filter modal');
        $scope.filter = angular.copy(resfilter); //{  page: 0, pageSize: 50, filters: {} }
        $scope.mfilt = angular.extend($scope.filter, {});
        //$scope.mfilt = angular.copy($scope.Lookups);
        $scope.lookupslists = angular.copy($scope.Lookups);

        //a function to reinitiallize filter of filter
        ////return filter entity to its default state and re-initiallizes date 
        $scope.clearfilter = function () {
            var def = angular.copy(defaultReceiptPredicate);
            $scope.mfilt = angular.extend(def, {});
            //initdate();
        }
        $scope.hide = function () { $mdDialog.hide(); };
        $scope.cancel = function () { $mdDialog.cancel(); };
        $scope.confirm = function (answer) {
            //console.log('consolas');
            if ($scope.mfilt.usedate != true)
                $scope.mfilt.FromDate = null;
            //    manageReturnFilter();
            $mdDialog.hide($scope.mfilt);
        }
        $scope.logdate = function (date) {
            console.log(date);
            var addHours = -1 * new Date().getTimezoneOffset() / 60;
            var zax = moment(date).startOf('hour').add(addHours, 'hours');
            console.log(zax);
            console.log(zax.toISOString());
        }
        var defaultReceiptPredicate = {
            Id: null,
            Product: null,
            StoreId: null,
            ShortType: null,
            Page: 1,
            PageSize: 20,
            //PosList: [], //StaffList: [], //PricelistsList: [], //FODay  //EodId   //TableCodes  //UseEod  //UsePeriod 
        }
    }).filter("date", function () {
        //moment.lang("ru");
        return function (date) {
            return moment(new Date(date)).format('DD/MM/YYYY hh:mm');
        };
    });
