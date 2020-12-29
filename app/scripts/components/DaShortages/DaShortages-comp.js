/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />
angular.module('posBOApp')
    .component('dashortagescomp', {
        templateUrl: 'app/scripts/components/DaShortages/templates/DaShortages-comp.html',
        controller: 'dashortagescompCTRL',
        controllerAs: 'ShortMain'
    })
    .controller('dashortagescompCTRL', ['$scope', '$mdDialog', '$mdMedia', 'dsFactory', 'dataUtilFactory', 'tosterFactory', '$q', 'DynamicApiService', function ($scope, $mdDialog, $mdMedia, dsFactory, dataUtilFactory, tosterFactory, $q, DynamicApiService) {
        var ShortMain = this;
        var dtu = dataUtilFactory;
        ShortMain.restbusy = false; ShortMain.hasError = false;
        ShortMain.$onInit = function () { };

        ShortMain.initView = function () {
            ShortMain.shortages = [];
          //  ShortMain.promosdetails = [];
            ShortMain.GetShortages();
        };
        $scope.searchText = ' ';
        //$scope.search = function (item)
        //{
        //    if ($scope.searchText == undefined)
        //    { return true; }
        //    else
        //    {
        //        if ($scope.searchText == 0 || $scope.searchText ==1)
        //        //if (item.ProductDescr.toLowerCase().indexOf($scope.searchText.toLowerCase()) != -1 || item.StoreDescr.toLowerCase().indexOf($scope.searchText.toLowerCase()) != -1 || item.ShortType.toLowerCase().indexOf($scope.searchText.toLowerCase()) != -1 )
        //        //{
        //        //    return true;
        //        //}
        //    }
        //    //tosterFactory.showCustomToast('Loading Lookups failed', 'fail');
        //    return false;
        //}
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

   
        //Get Shortages
        ShortMain.GetShortages = function () {
            var url = dsFactory.apiInterface.DaShortages.GET.GetShortagesList;
            DynamicApiService.getDAV3('Shortages', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Shortages List Loaded', 'success');
                    ShortMain.shortages = result.data;
                    //PolMain.createMap();
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
            var url = dsFactory.apiInterface.DaShortages.POST.DeleteShortages;
            deletedShortageId = row.Id;
            DynamicApiService.deleteShortageDAV3('Shortages', url, deletedShortageId).then(function (result) {
                tosterFactory.showCustomToast('Shortage Deleted succesfully', 'success');
                var url = dsFactory.apiInterface.DaShortages.GET.GetShortagesList;
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
        //Add SHORTAGE
        $scope.addShortages = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var url = dsFactory.apiInterface.DaShortages.GET.GetProducts;
            DynamicApiService.getV3('Product', url).then(function (resultProducts) {
                if (resultProducts != null && resultProducts.data != null) {
                    $scope.Lookups.ProductList = resultProducts.data;

                    var formModel = { entityIdentifier: type, dropDownObject: $scope.Lookups, title: 'Managing ' + type };
                    var dataEntry = {};
                    if (action == 'edit' && data !== undefined && data !== null) {
                        formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                        dataEntry = angular.copy(data);
                    }
                   //scope.ProductId = 
                    //$scope.StoreId = StoreMain.store.Id;
                    //$scope.ShortType = 0;
                    //dataEntry['StoreId'] = $scope.StoreId;
                    //dataEntry['ShortType'] = $scope.ShortType;

                    //variable to handle 3 entities and 2 modes of edit and add
                    var actionname = {
                        type: type,
                        action: action
                    };
                    $mdDialog.show({
                        controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                        resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
                    })
                        .then(function (retdata) {
                            var url = dsFactory.apiInterface.DaShortages.POST.InsertShortages;
                            DynamicApiService.postDAV3('Shortages', url, retdata).then(function (result) {
                                tosterFactory.showCustomToast('Shortage Inserted succesfully', 'success');

                                //Update UI 
                                ShortMain.shortages = [];
                                var url = dsFactory.apiInterface.DaShortages.GET.GetShortagesList;
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
    //.controller('StoresCompCTRL', ['$scope', '$mdDialog', 'msFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', '$mdDialog', '$mdMedia', function ($scope, $mdDialog, msFactory, dataUtilFactory, tosterFactory, DynamicApiService, $mdDialog, $mdMedia) {
    //    var StoreMain = this;
    //    var dtu = dataUtilFactory;
    //    StoreMain.restbusy = false; StoreMain.hasError = false;
    //    StoreMain.$onInit = function () { };

    //    StoreMain.initView = function () {
    //        StoreMain.store = [];
    //        StoreMain.shortages = [];
    //        StoreMain.polygons = [];
    //        StoreMain.GetStore();
    //    };

    //    $scope.showModal = false;
    //    $scope.open = function (row) {
    //        $scope.shortRow = row;
    //        $scope.showModal = !$scope.showModal;
    //    };

    //    //API CALL rest get Store By StaffId
    //    StoreMain.GetStore = function () {
    //        var url = msFactory.apiInterface.Stores.GET.GetStoreBystaffId;
    //        DynamicApiService.getDAV3('Stores', url).then(function (resultStore) {
    //            if (resultStore != null && resultStore.data != null) {
    //                tosterFactory.showCustomToast('Store Loaded', 'success');
    //                if (resultStore.data.StoreStatus == 0) {
    //                    resultStore.data.StoreStatusDescr = "Closed";
    //                }
    //                else if (resultStore.data.StoreStatus == 1) {
    //                    resultStore.data.StoreStatusDescr = "Delivery Only";
    //                }
    //                else if (resultStore.data.StoreStatus == 2) {
    //                    resultStore.data.StoreStatusDescr = "Take Out Only";
    //                }
    //                else {
    //                    resultStore.data.StoreStatusDescr = "Full Operational";
    //                }
    //                StoreMain.store = resultStore.data;
    //                //API CALL rest Get a List of Polygons (Header/details) by StoreId.
    //                var url = msFactory.apiInterface.Stores.GET.GetPolygons;
    //                DynamicApiService.getDAV3('Polygons', url, resultStore.data.Id).then(function (resultPolygons) {
    //                    if (resultPolygons != null && resultPolygons.data != null) {
    //                        tosterFactory.showCustomToast('Polygons Loaded', 'success');
    //                        StoreMain.polygons = resultPolygons.data;
    //                        StoreMain.createMap();
    //                        //API CALL rest get Get a List of Shortages for a store based on staffId (a virtual staff assigned to a store). 
    //                        var url = msFactory.apiInterface.Stores.GET.GetShortagesByStore;
    //                        DynamicApiService.getDAV3('Shortages', url).then(function (resultShortages) {
    //                            if (resultShortages != null && resultShortages.data != null) {
    //                                tosterFactory.showCustomToast('Shortages Loaded', 'success');
    //                                resultShortages.data.forEach(function (details) {
    //                                    if (details.ShortType == 0) {
    //                                        StoreMain.shortages.push(details);
    //                                    }
    //                                });
    //                                //StoreMain.shortages = resultShortages.data;
    //                            } else {
    //                                tosterFactory.showCustomToast('No Shortages Loaded', 'success');
    //                                StoreMain.shortages = [];
    //                            }
    //                        }).catch(function (rejection) {
    //                            tosterFactory.showCustomToast('Loading Shortages failed', 'fail');
    //                            console.warn('Get action on server failed. Reason:'); console.warn(rejection);
    //                            StoreMain.shortages = [];
    //                        }).finally(function () {
    //                        });

    //                    } else {
    //                        tosterFactory.showCustomToast('No Polygons Loaded', 'success');
    //                        StoreMain.polygons = [];
    //                    }
    //                }).catch(function (rejection) {
    //                    tosterFactory.showCustomToast('Loading Polygons failed', 'fail');
    //                    console.warn('Get action on server failed. Reason:'); console.warn(rejection);
    //                    StoreMain.polygons = [];
    //                }).finally(function () {
    //                });
    //            } else {
    //                tosterFactory.showCustomToast('No Store Loaded', 'success');
    //                StoreMain.store = [];
    //            }
    //        }).catch(function (rejection) {
    //            tosterFactory.showCustomToast('Loading Store failed', 'fail');
    //            console.warn('Get action on server failed. Reason:'); console.warn(rejection);
    //            StoreMain.store = [];
    //        }).finally(function () {
    //        });
    //    }

    //    //Edit STORE
    //    $scope.editStore = function (ev, type, data, action) {
    //        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

    //        var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
    //        var dataEntry = {};
    //        if (action == 'edit' && data !== undefined && data !== null) {
    //            formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
    //            dataEntry = angular.copy(data);
    //        }
    //        if (type == 'store') {
    //            $scope.uploadModel = {
    //                controllerName: 'Upload',
    //                actionName: 'store',
    //                extraData: 1,//represents storeinfo.Id
    //                externalDirectory: 'region'
    //            };
    //            dataEntry['uploadModel'] = $scope.uploadModel;
    //            dataEntry['loadingImage'] = false;
    //        }
    //        //variable to handle 3 entities and 2 modes of edit and add
    //        var actionname = {
    //            type: type,
    //            action: action
    //        };
    //        $mdDialog.show({
    //            controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
    //            resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
    //        })
    //            .then(function (retdata) {
    //                //Update api/Store
    //                retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)

    //                if (retdata.StoreStatus == "0") {
    //                    retdata.StoreStatusDescr = "Closed";
    //                }
    //                else if (retdata.StoreStatus == "1") {
    //                    retdata.StoreStatusDescr = "Delivery Only";
    //                }
    //                else if (retdata.StoreStatus == "2") {
    //                    retdata.StoreStatusDescr = "Take Out Only";
    //                }
    //                else {
    //                    retdata.StoreStatusDescr = "Full Operational";
    //                }
    //                StoreMain.store = retdata;

    //                DynamicApiService.postDAV3('Stores', 'update', retdata).then(function (result) {
    //                    tosterFactory.showCustomToast('Store updated succesfully', 'success');
    //                    //$scope.getDropDownLookUps('Store');
    //                }, function (reason) {
    //                    tosterFactory.showCustomToast('Store updated failed', 'fail');
    //                    console.log('Fail update'); console.log(reason);
    //                }, function (error) {
    //                    tosterFactory.showCustomToast('StoreInfo update error', 'error');
    //                    console.log('Error update'); console.log(reason);
    //                })
    //            }, function () { });
    //        $scope.$watch(function () {
    //            return $mdMedia('xs') || $mdMedia('sm');
    //        }, function (wantsFullScreen) {
    //            $scope.customFullscreen = (wantsFullScreen === true);
    //        });
    //    };

    //    //Edit POLYGONS 
    //    $scope.editPolygons = function (ev, type, data, action) {
    //        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

    //        var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
    //        var dataEntry = {};
    //        if (action == 'edit' && data !== undefined && data !== null) {
    //            formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
    //            dataEntry = angular.copy(data);
    //        }
    //        if (type == 'store') {
    //            $scope.uploadModel = {
    //                controllerName: 'Upload',
    //                actionName: 'store',
    //                extraData: 1,//represents storeinfo.Id
    //                externalDirectory: 'region'
    //            };
    //            dataEntry['uploadModel'] = $scope.uploadModel;
    //            dataEntry['loadingImage'] = false;
    //        }
    //        //variable to handle 3 entities and 2 modes of edit and add
    //        var actionname = {
    //            type: type,
    //            action: action
    //        };
    //        $mdDialog.show({
    //            controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
    //            resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
    //        })
    //            .then(function (retdata) {
    //                //Update api/Polygons
    //                retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)

    //                var url = 'UpdateStatus/Id/' + retdata.Id + '/IsActive/' + retdata.IsActive;
    //                DynamicApiService.getPolygonsIsActiveV3('Polygons', url).then(function (result) {
    //                    if (result != null && result.data != null) {

    //                        //Reload Polygons in order to refresh page
    //                        var url = msFactory.apiInterface.Stores.GET.GetPolygons;
    //                        DynamicApiService.getDAV3('Polygons', url, StoreMain.store.Id).then(function (resultPolygons) {
    //                            if (resultPolygons != null && resultPolygons.data != null) {
    //                                StoreMain.polygons = resultPolygons.data;
    //                                $scope.initialize();
    //                            } else {
    //                                StoreMain.polygons = [];
    //                            }
    //                        }).catch(function (rejection) {
    //                            StoreMain.polygons = [];
    //                        }).finally(function () {
    //                        });

    //                        tosterFactory.showCustomToast('Polygons Updated', 'success');
    //                    } else {
    //                        tosterFactory.showCustomToast('No Polygons Updated', 'success');
    //                    }
    //                }).catch(function (rejection) {
    //                    tosterFactory.showCustomToast('Updating Polygons failed', 'fail');
    //                    console.warn('Get action on server failed. Reason:'); console.warn(rejection);
    //                }).finally(function () {
    //                })
    //            }, function () { });
    //        $scope.$watch(function () {
    //            return $mdMedia('xs') || $mdMedia('sm');
    //        }, function (wantsFullScreen) {
    //            $scope.customFullscreen = (wantsFullScreen === true);
    //        });
    //    };

    //    //Add SHORTAGE
    //    $scope.addShortages = function (ev, type, data, action) {
    //        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

    //        var url = msFactory.apiInterface.Stores.GET.GetProducts;
    //        DynamicApiService.getV3('Product', url).then(function (resultProducts) {
    //            if (resultProducts != null && resultProducts.data != null) {
    //                $scope.filtersObjArray = resultProducts;

    //                var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };

    //                var dataEntry = {};
    //                if (action == 'edit' && data !== undefined && data !== null) {
    //                    formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
    //                    dataEntry = angular.copy(data);
    //                }

    //                $scope.StoreId = StoreMain.store.Id;
    //                $scope.ShortType = 0;
    //                dataEntry['StoreId'] = $scope.StoreId;
    //                dataEntry['ShortType'] = $scope.ShortType;

    //                //variable to handle 3 entities and 2 modes of edit and add
    //                var actionname = {
    //                    type: type,
    //                    action: action
    //                };
    //                $mdDialog.show({
    //                    controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
    //                    resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
    //                })
    //                    .then(function (retdata) {

    //                        DynamicApiService.postDAV3('Shortages', 'insert', retdata).then(function (result) {
    //                            tosterFactory.showCustomToast('Shortage Inserted succesfully', 'success');

    //                            //Update UI 
    //                            StoreMain.shortages = [];
    //                            var url = msFactory.apiInterface.Stores.GET.GetShortagesByStore;
    //                            DynamicApiService.getDAV3('Shortages', url).then(function (resultShortages) {
    //                                if (resultShortages != null && resultShortages.data != null) {
    //                                    resultShortages.data.forEach(function (details) {
    //                                        if (details.ShortType == 0) {
    //                                            StoreMain.shortages.push(details);
    //                                        }
    //                                    });
    //                                } else {
    //                                    StoreMain.shortages = [];
    //                                }
    //                            }).catch(function (rejection) {
    //                                StoreMain.shortages = [];
    //                            }).finally(function () {
    //                            });

    //                        }, function (reason) {
    //                            tosterFactory.showCustomToast('Shortage Insert failed', 'fail');
    //                            console.log('Fail update'); console.log(reason);
    //                        }, function (error) {
    //                            tosterFactory.showCustomToast('Shortage Insert error', 'error');
    //                            console.log('Error update'); console.log(reason);
    //                        })
    //                    }, function () { });
    //                $scope.$watch(function () {
    //                    return $mdMedia('xs') || $mdMedia('sm');
    //                }, function (wantsFullScreen) {
    //                    $scope.customFullscreen = (wantsFullScreen === true);
    //                });

    //            } else {
    //                console.warn('No Product Loaded');
    //            }
    //        }).catch(function (rejection) {
    //            console.warn('Get action on server failed. Reason:'); console.warn(rejection);
    //        }).finally(function () {
    //        });
    //    };


    //    //Delete SHORTAGE
    //    $scope.DeleteShortage = function (row) {
    //        var url = msFactory.apiInterface.Stores.POST.delete;
    //        DynamicApiService.deleteShortageDAV3('Shortages', url, row.Id).then(function (result) {
    //            tosterFactory.showCustomToast('Shortage Deleted succesfully', 'success');
    //            $scope.showModal = !$scope.showModal;
    //            StoreMain.shortages = [];
    //            var url = msFactory.apiInterface.Stores.GET.GetShortagesByStore;
    //            DynamicApiService.getDAV3('Shortages', url).then(function (resultShortages) {
    //                if (resultShortages != null && resultShortages.data != null) {
    //                    resultShortages.data.forEach(function (details) {
    //                        if (details.ShortType == 0) {
    //                            StoreMain.shortages.push(details);
    //                        }
    //                    });
    //                } else {
    //                }
    //            }).catch(function (rejection) {
    //            }).finally(function () {
    //            });

    //        }, function (reason) {
    //            tosterFactory.showCustomToast('Shortage Delete failed', 'fail');
    //            console.log('Fail update'); console.log(reason);
    //        }, function (error) {
    //            tosterFactory.showCustomToast('Shortage Delete error', 'error');
    //            console.log('Error update'); console.log(reason);
    //        })
    //    };


    //    StoreMain.createMap = function CustomMap() {
    //        var self = this;
    //        var GoogleMapsApiKey = "AIzaSyDjWwtf-0-BkZhPX_eTrA5SGDhPVnGuxBI";
    //        self.map = null;
    //        self.markers = [];
    //        self.polygonsArray = [];
    //        self.polygonLocations = [];
    //        $scope.selectedRow = null;

    //        //Create Polygons
    //        $scope.InitializePolygons = function () {
    //            StoreMain.polygons.forEach(function (entry) {
    //                entry.Details.forEach(function (details) {
    //                    var obj = {};
    //                    obj.lat = details.Latitude;
    //                    obj.lng = details.Longtitude;
    //                    self.polygonLocations.push(obj);
    //                });
    //                self.CreatePolygon(entry);
    //            });
    //        };

    //        $scope.initialize = function () {
    //            var startPoint = { lat: StoreMain.store.Latitude, lng: StoreMain.store.Longtitude };
    //            self.map = new google.maps.Map(document.getElementById('map'), { zoom: 12.5, center: startPoint });
    //            $scope.InitializePolygons();
    //        }

    //        self.PlaceMarker = function (location) {
    //            var marker = new google.maps.Marker({
    //                position: location,
    //                map: self.map,
    //                animation: google.maps.Animation.DROP
    //            });
    //            self.markers.push(marker);
    //            self.polygonLocations.push(location);
    //        };

    //        self.CreatePolygon = function (polModel) {
    //            if (polModel.IsActive == true) {
    //                var polygon = new google.maps.Polygon({
    //                    paths: self.polygonLocations,
    //                    strokeColor: "black",
    //                    strokeOpacity: 0.8,
    //                    strokeWeight: 2,
    //                    fillColor: polModel.PolygonsColor,
    //                    fillOpacity: 0.35,
    //                    Id: polModel.Id,
    //                    label: 'test'
    //                });
    //            }
    //            else {
    //                var polygon = new google.maps.Polygon({
    //                    paths: self.polygonLocations,
    //                    strokeColor: "black",
    //                    strokeOpacity: 0.8,
    //                    strokeWeight: 2,
    //                    fillColor: "gray",
    //                    fillOpacity: 0.20,
    //                    Id: polModel.Id
    //                });
    //            }
    //            polygon.setMap(self.map);
    //            var storePoint = { lat: polModel.Latitude, lng: polModel.Longtitude };
    //            self.PlaceMarker(storePoint);
    //            self.polygonsArray.push(polygon);

    //            self.polygonLocations = [];
    //        };

    //        // Call Map
    //        $scope.initialize();

    //        //Focus on chosen Polygon
    //        $scope.ChoosePolygon = function ChoosePolygon(row) {
    //            row.Details.forEach(function (details) {
    //                var obj = {};
    //                obj.lat = details.Latitude;
    //                obj.lng = details.Longtitude;
    //                self.polygonLocations.push(obj);
    //            });
    //            self.focusPolygon(row);
    //            $scope.selectedRow = row.Id;
    //        }

    //        self.focusPolygon = function (Model) {
    //            for (var i = 0; i < self.polygonsArray.length; i++) {
    //                if (self.polygonsArray[i].Id == Model.Id) {
    //                    self.polygonsArray[i].setOptions({ fillOpacity: 3.35, strokeWeight: 8 });
    //                    self.polygonsArray[i].setMap(self.map);
    //                    self.polygonLocations = [];
    //                }
    //                else {
    //                    self.polygonsArray[i].setOptions({ fillOpacity: 0.35, strokeWeight: 2 });
    //                    self.polygonsArray[i].setMap(self.map);
    //                    self.polygonLocations = [];
    //                }
    //            }
    //        };
    //    }

    //}]);
