/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />
angular.module('posBOApp')
    .component('handleDaStores', {
        templateUrl: 'app/scripts/components/HandleDaStores/templates/handle-stores.html',
        controller: 'HandleStoresMainCTRL',
        controllerAs: 'HandleStoresMain'
    })
    .controller('HandleStoresMainCTRL', ['$scope', '$mdDialog', '$mdMedia', 'handleDaStoresfactory', 'dataUtilFactory', 'tosterFactory', '$q', 'DynamicApiService', function ($scope, $mdDialog, $mdMedia, handleDaStoresfactory, dataUtilFactory, tosterFactory, $q, DynamicApiService) {
        var HandleStoresMain = this;
        var dtu = dataUtilFactory;
        HandleStoresMain.restbusy = false; HandleStoresMain.hasError = false;
        HandleStoresMain.$onInit = function () { };

        HandleStoresMain.initView = function () {
            HandleStoresMain.stores = [];
            HandleStoresMain.GetStores();
            HandleStoresMain.spinner = false;
        };

        $scope.searchText = '';
        HandleStoresMain.spinner = false;
        
        $scope.GetSetupStoresLookUps = function () {
            
            var nameType = 'SetupStores';
            DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.filtersObjArray = result.data.LookUpEntities;
                console.log('LookUps loaded'); console.log(result);
                
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Lookups failed', 'fail');
                console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection);
                return null;
            })
        };
        $scope.GetSetupStoresLookUps();

        $scope.cancel = function () { $mdDialog.cancel(); };

        // addHeader
        $scope.addStore = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
        
            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'HandleDaStores') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'HandleDaStores',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
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
                    //Add api/Headers
                    //retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    var url = handleDaStoresfactory.apiInterface.HandleDaStores.POST.InsertStore;
                    DynamicApiService.postV3Stores('Stores', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {

                            //Reload Stores in order to refresh page
                            var url = handleDaStoresfactory.apiInterface.HandleDaStores.GET.GetDaStores;
                            DynamicApiService.getV3stores('Stores', url).then(function (result) {
                                if (result != null && result.data != null) {
                                    HandleStoresMain.stores = result.data;
                                } else {
                                    HandleStoresMain.stores = [];
                                }
                            }).catch(function (rejection) {
                                HandleStoresMain.stores = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Store Inserted', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Store Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Inserting Store failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };


        //Edit Headers 
        $scope.editStore = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'HandleDaStores') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'HandleDaStores',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
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
                    //Update api/Stores
                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    var url = handleDaStoresfactory.apiInterface.HandleDaStores.POST.UpdateStores;
                    DynamicApiService.postV3Stores('Stores', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            //Reload Stores in order to refresh page
                            var url = handleDaStoresfactory.apiInterface.HandleDaStores.GET.GetDaStores;
                            DynamicApiService.getV3stores('Stores', url).then(function (result) {
                                if (result != null && result.data != null) {
                                    HandleStoresMain.stores = result.data;
                                } else {
                                    HandleStoresMain.stores = [];
                                }
                            }).catch(function (rejection) {
                                HandleStoresMain.stores = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Store Updated', 'success');
                        } else {
                            tosterFactory.showCustomToast('Store was not Updated', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Updating Store failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };



        $scope.UpdateStoreTables = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'UpdateStoreTables') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'UpdateStoreTables',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
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
                    //Update api/Stores
                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    HandleStoresMain.spinner = true;

                    for (i = 0; i < retdata.StoreId.length; i++) {                       

                        var url = handleDaStoresfactory.apiInterface.HandleDaStores.GET.updateStoreTables;

                        var StoreId = retdata.StoreId[i];
                     //   tosterFactory.showCustomToast('Store Tables Update is ongoing please Check Logs for further information ', 'success');
                        
                        DynamicApiService.updateStoreTables('Stores', url, StoreId).then(function (result) {
                          
                            HandleStoresMain.spinner = false;
                            if (result != null && result.data != null) {
                                setTimeout(() => {
                                    //this.UpdateStoreTables
                                }, 7000);
                                tosterFactory.showCustomToast('Store Tables Update is ongoing please Check Logs for further information ', 'success');
                                
                            } else {
                                
                            }
                        }).catch(function (rejection) {
                            tosterFactory.showCustomToast('Store Tables Update failed please Check Logs for further information ', 'failure');
                        }).finally(function () {
                        });


                    }
                    var url = handleDaStoresfactory.apiInterface.HandleDaStores.GET.GetDaStores;
                    DynamicApiService.getV3stores('Stores', url).then(function (result) {
                    if (result != null && result.data != null) {
                        var url = handleDaStoresfactory.apiInterface.HandleDaStores.GET.GetDaStores;
                        DynamicApiService.getV3stores('Stores', url).then(function (result) {
                            if (result != null && result.data != null) {
                                HandleStoresMain.stores = result.data;
                                HandleStoresMain.spinner = true;
                            } else {
                                HandleStoresMain.stores = [];
                                HandleStoresMain.spinner = true;
                            }
                        }).catch(function (rejection) {
                            HandleStoresMain.stores = [];
                        }).finally(function () {
                        });

                        tosterFactory.showCustomToast('Store Updated', 'success');
                    } else {
                        tosterFactory.showCustomToast('Store was not Updated', 'success');
                    }
                }).catch(function (rejection) {
                    tosterFactory.showCustomToast('Updating Store failed', 'fail');
                    console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                }).finally(function () {
                })
                } , function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };



        //$scope.spinner = false;






       //// updateStoreTables
       // $scope.updateStoreTables = function (row) {
       //     var url = handleDaStoresfactory.apiInterface.HandleDaStores.GET.updateStoreTables;
       //     StoreId = row.Id;
       //     DynamicApiService.updateStoreTables('Stores', url, StoreId).then(function (result) {
       //         tosterFactory.showCustomToast('Store Tables Update is ongoing please Check Logs for further information ', 'success');

       //         var url = handleDaStoresfactory.apiInterface.HandleDaStores.GET.GetDaStores;
       //         DynamicApiService.getV3stores('Stores', url).then(function (result) {
       //             if (result != null && result.data != null) {
       //                 HandleStoresMain.stores = result.data;
       //             } else {
       //                 HandleStoresMain.stores = [];
       //             }
       //         }).catch(function (rejection) {
       //         }).finally(function () {
       //         });

       //     }, function (reason) {
       //         tosterFactory.showCustomToast('Store Tables Update failed', 'fail');
       //         console.log('Fail update'); console.log(reason);
       //     }, function (error) {
       //         tosterFactory.showCustomToast('Store Tables Update error', 'error');
       //         console.log('Error update'); console.log(reason);
       //     })
       // };

        $scope.DeleteStore = function (row) {
            var url = handleDaStoresfactory.apiInterface.HandleDaStores.POST.DeleteStore;
            deletedStoreId = row.Id;
            DynamicApiService.DeleteStore('Stores', url, deletedStoreId).then(function (result) {
                tosterFactory.showCustomToast('Store Deleted succesfully', 'success');

                var url = handleDaStoresfactory.apiInterface.HandleDaStores.GET.GetDaStores;
                DynamicApiService.getV3stores('Stores', url).then(function (result) {
                    if (result != null && result.data != null) {
                        //  tosterFactory.showCustomToast('Promos Headers Loaded', 'success');
                        HandleStoresMain.stores = result.data;
                    } else {
                        //tosterFactory.showCustomToast('No Promos Headers Loaded', 'success');
                        HandleStoresMain.stores = [];
                    }
                }).catch(function (rejection) {
                }).finally(function () {
                });

            }, function (reason) {
                tosterFactory.showCustomToast('Store Delete failed', 'fail');
                console.log('Fail update'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Store Delete error', 'error');
                console.log('Error update'); console.log(reason);
            })
        };


       // Get All available DA Stores
        HandleStoresMain.GetStores = function () {
            var url = handleDaStoresfactory.apiInterface.HandleDaStores.GET.GetDaStores;
            DynamicApiService.getDAV3('Stores', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('All Da Stores  Loaded', 'success');
                    HandleStoresMain.stores = result.data;
                } else {
                    tosterFactory.showCustomToast('No Da Stores  Loaded', 'success');
                    HandleStoresMain.stores = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Da  Stores failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                HandleStoresMain.hasError = true; HandleStoresMain.stores = [];
                return -1;
            }).finally(function () {
                HandleStoresMain.restbusy = false;
            });
        }

        $scope.viewHeaderDetails = function (data) {
            //Get Details From Api
            var details = {};
            var header = {};
            var url = promosFactory.apiInterface.HeaderDetailsPromos.GET.GetVodafone11Details;
            DynamicApiService.getV3('promos', url, data.Id).then(function (result) {
                if (result != null && result.data != null) {
                    VodMain.promosdetails = result.data;
                    details = VodMain.promosdetails;
                    details = angular.copy(result.data);
                    header = angular.copy(data);
                    $mdDialog.show({
                        controller: 'VodafonepromosDetailsCompCTRL',
                        templateUrl: '../app/scripts/directives/modal-directives/Vodafone-manage-details-modal-template.html',
                        parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                        resolve: {
                            details: function () { return details; },
                            header: function () { return header; }
                        }
                    }).then(function (data) {
                        if (data != undefined) {
                            proceedCancel(data);
                        }
                    }).catch(function () { });
                } else {
                    VodMain.promosdetails = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Promos Details failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                VodMain.hasError = true; VodMain.promosdetails = [];
                return -1;
            }).finally(function () {
                VodMain.restbusy = false;
            });
        };

    }])
    .controller('VodafonepromosDetailsCompCTRL', function ($scope, $mdDialog, $mdMedia, $q, dataUtilFactory, promosFactory, details, header, tosterFactory, DynamicApiService) {
        $scope.header = angular.copy(header);
        $scope.details = angular.copy(details);
        if ($scope.details.length == 0) {
            tosterFactory.showCustomToast('There are no Details Results!', 'warning');
        }

        //getProdCategoriesLookups
        $scope.test = function () {
            //GetSetupProductCatLookUps
            var nameType = 'SetupProductCat';
            DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.filtersObjArray = result.data.LookUpEntities;
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
        //removeDetails
        $scope.removeDetails = function (detail) {
            var url = promosFactory.apiInterface.HeaderDetailsPromos.POST.DeleteVodafone11Detail;
            deletedDetailsId = detail.Id;
            DynamicApiService.DeleteHeader('promos', url, deletedDetailsId).then(function (result) {
                tosterFactory.showCustomToast('Detail Deleted succesfully', 'success');
                var url = promosFactory.apiInterface.HeaderDetailsPromos.GET.GetVodafone11Details;
                DynamicApiService.getV3('promos', url, header.Id).then(function (resultDetail) {
                    if (resultDetail != null && resultDetail.data != null) {
                        //  tosterFactory.showCustomToast('Promos Headers Loaded', 'success');
                        // VodMain.promosdetails = result.data;
                        $scope.details = resultDetail.data;
                    } else {
                        //tosterFactory.showCustomToast('No Promos Headers Loaded', 'success');
                        VodMain.promosdetails = [];
                    }
                }).catch(function (rejection) {
                }).finally(function () {
                });
            }, function (reason) {
                tosterFactory.showCustomToast('Header Delete failed', 'fail');
                console.log('Fail update'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Header Delete error', 'error');
                console.log('Error update'); console.log(reason);
            })
        };

        //Edit Details 
        $scope.editDetails = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            var random = data;
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'Details') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'Details',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
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
                    //Update api/Headers
                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    var url = promosFactory.apiInterface.HeaderDetailsPromos.POST.UpdateVodafone11DetailsPromos;
                    DynamicApiService.postV3('promos', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {

                            //Reload Headers in order to refresh page
                            var url = promosFactory.apiInterface.HeaderDetailsPromos.GET.GetVodafone11AllDetails;
                            DynamicApiService.getV3('promos', url).then(function (resultDetails) {
                                if (resultDetails != null && resultDetails.data != null) {
                                    $scope.details = resultDetails.data;
                                } else {
                                    $scope.details = [];
                                }
                            }).catch(function (rejection) {
                                $scope.details = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Details Updated', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Details Updated', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Updating Details failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };


        // add Detail
        $scope.addDetail = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
                dataEntry.HeaderId = data.Id;
            }
            if (type == 'Details') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'Details',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
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
                    //retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    var url = promosFactory.apiInterface.HeaderDetailsPromos.POST.InsertVodafone11Details;
                    DynamicApiService.postV3('promos', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {

                            //Reload Details in order to refresh page
                            var url = promosFactory.apiInterface.HeaderDetailsPromos.GET.GetVodafone11AllDetails;
                            DynamicApiService.getV3('promos', url).then(function (resultDetails) {
                                if (resultDetails != null && resultDetails.data != null) {
                                    $scope.details = resultDetails.data;
                                } else {
                                    $scope.details = [];
                                }
                            }).catch(function (rejection) {
                                $scope.details = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Detail Inserted', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Detail Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Inserting Detail failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        $scope.hide = function () { $mdDialog.hide(); };
        $scope.cancel = function () { $mdDialog.cancel(); };
        //addHeaderDetail
        $scope.addHeaderDetail = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'Details') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'Details',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
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
                    //retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    var url = promosFactory.apiInterface.HeaderDetailsPromos.POST.InsertVodafone11Details;
                    DynamicApiService.postV3('promos', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            //Reload Details in order to refresh page
                            var url = promosFactory.apiInterface.HeaderDetailsPromos.GET.GetVodafone11AllDetails;
                            DynamicApiService.getV3('promos', url).then(function (resultDetails) {
                                if (resultDetails != null && resultDetails.data != null) {
                                    $scope.details = resultDetails.data;
                                } else {
                                    $scope.details = [];
                                }
                            }).catch(function (rejection) {
                                $scope.details = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Detail Inserted', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Detail Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Inserting Detail failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        $scope.init = function () {

        }()
    });
