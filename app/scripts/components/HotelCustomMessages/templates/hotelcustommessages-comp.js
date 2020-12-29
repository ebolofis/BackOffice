/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />
angular.module('posBOApp')
    .component('handleHotelCustomMessages', {
        templateUrl: 'app/views/Timezones/main-manageTimezones-manager.html',
        controller: 'HotelCustomMessagesCTRL',
        controllerAs: 'HotelCustomMessagesMain'
    })
    .filter("DateRange", function () {
        return function (datefrom, dateto) {
        }

    })
    .controller('HotelCustomMessagesCTRL', ['$scope', '$mdDialog', '$mdMedia', 'hcmFactory', 'dataUtilFactory', 'tosterFactory', '$q', 'DynamicApiService', function ($scope, $mdDialog, $mdMedia, hcmFactory, dataUtilFactory, tosterFactory, $q, DynamicApiService) {
        var HotelCustomMessagesMain = this;
        var dtu = dataUtilFactory;
        HotelCustomMessagesMain.$onInit = function () { };

        HotelCustomMessagesMain.initView = function () {

            HotelCustomMessagesMain.restbusy = false;
            HotelCustomMessagesMain.params = [];
            HotelCustomMessagesMain.messages = [];
            HotelCustomMessagesMain.GetHotelCustomMessages();

        };

        HotelCustomMessagesMain.removeEntry = function (ev, type, data) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .textContent('Would you like to delete current ' + type + '?')
                .ariaLabel('remove' + type)
                .targetEvent(ev)
                .ok('Remove')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                $scope.deleteHotelCustomMessage(data);
            }, function () {
            });
        };


        $scope.deleteHotelCustomMessage = function (row) {
            var lkp = hcmFactory.apiInterface.HotelCustomMessages.GET.DeleteCustomMessage;
            DynamicApiService.getV3('Hotel', lkp, row.Id).then(function (result) {

                $scope.filtersObjArray = result;
                HotelCustomMessagesMain.GetHotelCustomMessages();

            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Hotel Custom Message Lookup failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                HotelCustomMessagesMain.macros = [];
                return -1;
            }).finally(function () {
            });
        };
        //AllowedMealsMain.searchGroup = function (searchTerm, mpehotel) {

        //    if (searchTerm.length > 2 && mpehotel != undefined) {

        //        var mpe = mpehotel[0];
        //        var url = mamFactory.apiInterface.AllowedMeals.GET.GetFilteredProtelGroupList;
        //        DynamicApiService.getV3('Hotel', url, mpe + '/' + searchTerm).then(function (result) {
        //            if (result != null && result.data != null) {
        //                if (result.data.length > 0) {
        //                    AllowedMealsMain.grouplist = result.data;
        //                }
        //                else {
        //                    tosterFactory.showCustomToast('No matching Search of Group  Loaded', 'fail');
        //                    AllowedMealsMain.grouplist = [];
        //                }
        //            } else {
        //                tosterFactory.showCustomToast('Group List  not Loaded  ', 'success');
        //                AllowedMealsMain.grouplist = [];
        //            }
        //        }).catch(function (rejection) {
        //            tosterFactory.showCustomToast('Loading Group List failed', 'fail');
        //            console.warn('Get action on server failed. Reason:'); console.warn(rejection);
        //            AllowedMealsMain.grouplist = [];
        //            return -1;
        //        }).finally(function () {
        //        });
        //    }

        //}
      
        //AllowedMealsMain.searchProduct = function (searchTerm) {

        //    if (searchTerm.length >= 2) {
        //        var url = mamFactory.apiInterface.AllowedMeals.GET.GetFilteredProduct;
        //        DynamicApiService.getV3('Hotel', url, searchTerm).then(function (result) {
        //            if (result != null && result.data != null) {
        //                if (result.data.length > 0) {
        //                    AllowedMealsMain.productlist = result.data;
        //                }
        //                else {
        //                    tosterFactory.showCustomToast('No matching Product List  Loaded', 'fail');
        //                    AllowedMealsMain.productlist = [];
        //                }
        //            } else {
        //                tosterFactory.showCustomToast(' Product List not Loaded  ', 'success');
        //                AllowedMealsMain.productlist = [];
        //            }
        //        }).catch(function (rejection) {
        //            tosterFactory.showCustomToast('Loading  Product List failed', 'fail');
        //            console.warn('Get action on server failed. Reason:'); console.warn(rejection);
        //            AllowedMealsMain.productlist = [];
        //            return -1;
        //        }).finally(function () {
        //        });
        //    }

        

        $scope.addHotelCustomMessage = function (ev, type, data, action) {
            
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xl')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            HotelCustomMessagesMain.params.sort((a, b) => a.Description.localeCompare(b.Description))
            $scope.filtersObjArray.params = HotelCustomMessagesMain.params;
         

            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'HotelCustomMessages') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'HotelCustomMessages',
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

                    var url = hcmFactory.apiInterface.HotelCustomMessages.POST.InsertCustomMessage;
                    DynamicApiService.postV3('Hotel', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {

                            var url = hcmFactory.apiInterface.HotelCustomMessages.GET.GetCustomMessages;
                            DynamicApiService.getV3('Hotel', url).then(function (result) {
                                if (result != null && result.data != null) {
                                    HotelCustomMessagesMain.messages = result.data;
                                } else {
                                    HotelCustomMessagesMain.messages = [];
                                }
                            }).catch(function (rejection) {
                                HotelCustomMessagesMain.messages = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Hotel Custom Message Inserted', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Hotel Custom Message Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Inserting Hotel Custom Message failed', 'fail');
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
        $scope.cancel = function () {
            HotelCustomMessagesMain.restbusy = false;
            $mdDialog.cancel();

        };
        $scope.hide = function () {
            $mdDialog.hide();
            HotelCustomMessagesMain.restbusy = false;
        };

        // $scope.searchText = '';
        $scope.flag = false;

        $scope.GetSetupComboLookUps = function () {
            var nameType = 'SetupCombo';

            DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi

                $scope.filtersObjArray = result.data.LookUpEntities;
                $scope.filtersObjArray.params = [];

                console.log('  LookUps loaded'); console.log(result);
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast(' Lookups failed', 'fail');
                console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection);
                return null;
            })
        };

        
    
        HotelCustomMessagesMain.GetHotelCustomMessages = function () {
            var url = hcmFactory.apiInterface.HotelCustomMessages.GET.GetCustomMessages;
            DynamicApiService.getV3('Hotel', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Macros  Loaded', 'success');
                    HotelCustomMessagesMain.messages = result.data;
                } else {
                    tosterFactory.showCustomToast('Macros not Loaded  ', 'success');
                    HotelCustomMessagesMain.messages = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Macros failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                HotelCustomMessagesMain.hasError = true; HotelCustomMessagesMain.messages = [];
                return -1;
            }).finally(function () {
                });

            var url = hcmFactory.apiInterface.HotelCustomMessages.GET.GetParams;
            DynamicApiService.getV3('Hotel', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Params  Loaded', 'success');
                    $scope.filtersObjArray = {};
                    HotelCustomMessagesMain.params = result.data;;
                } else {
                    tosterFactory.showCustomToast('Params not Loaded  ', 'success');
                    HotelCustomMessagesMain.params = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Params failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                HotelCustomMessagesMain.hasError = true; HotelCustomMessagesMain.params = [];
                return -1;
            }).finally(function () {
            });

          

        }

        $scope.editHotelMacroMessage = function (ev, type, data, action) {
            HotelCustomMessagesMain.restbusy = true;
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            HotelCustomMessagesMain.params.sort((a, b) => a.Description.localeCompare(b.Description))
            $scope.filtersObjArray.params = HotelCustomMessagesMain.params;

            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + 'Macros' }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'HotelCustomMessages') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'HotelCustomMessages',
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

                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    var url = hcmFactory.apiInterface.HotelCustomMessages.POST.UpdateCustomMessage;
                    // $scope.GetSetupMainMessagesLookUps();
                    DynamicApiService.postV3('Hotel', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            //Reload Stores in order to refresh page
                            var url = hcmFactory.apiInterface.HotelCustomMessages.GET.GetCustomMessages;
                            DynamicApiService.getV3('Hotel', url).then(function (result) {
                                if (result != null && result.data != null) {
                                    HotelCustomMessagesMain.messages = result.data;
                                } else {
                                    HotelCustomMessagesMain.messages = [];
                                }
                            }).catch(function (rejection) {
                                HotelCustomMessagesMain.messages = [];
                            }).finally(function () {
                                HotelCustomMessagesMain.restbusy = false;
                            });

                            tosterFactory.showCustomToast('Hotel Custom Message was Updated', 'success');
                        } else {
                            tosterFactory.showCustomToast('Hotel Custom Message was not Updated', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Updating Hotel Custom Message failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                        HotelCustomMessagesMain.restbusy = false;
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });

        };

        $scope.editMessageDetails = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'MessagesDetail') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'MessagesDetails',
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


                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)


                    var url = manageMessagesFactory.apiInterface.Messages.POST.UpdateMessageDetail;
                    //$scope.GetSetupMainMessagesLookUps();
                    DynamicApiService.postDAV3('CustomerMessages', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            //Reload Stores in order to refresh page
                            var url = manageMessagesFactory.apiInterface.Messages.GET.GetMessagesDetails;
                            DynamicApiService.getDAV3('CustomerMessages', url, obj.headerid).then(function (result) {
                                if (result != null && result.data != null) {
                                    MessagesMain.messagesdetails = result.data;
                                } else {
                                    MessagesMain.messagesdetails = [];
                                }
                            }).catch(function (rejection) {
                                MessagesMain.messagesdetails = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast(' Message was Updated', 'success');
                        } else {
                            tosterFactory.showCustomToast(' Message was not Updated', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Updating  Message failed', 'fail');
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


        $scope.editMessage = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'Messages') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'Messages',
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
                    var obj = new Object();

                    obj.Id = retdata.MainDAMessagesID;

                    var url = manageMessagesFactory.apiInterface.Messages.POST.UpdateMessage;
                    DynamicApiService.postDAV3('CustomerMessages', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            //Reload Stores in order to refresh page
                            var url = manageMessagesFactory.apiInterface.Messages.GET.GetMessages;

                            DynamicApiService.getDAV3('CustomerMessages', url, obj.Id).then(function (result) {
                                if (result != null && result.data != null) {
                                    MessagesMain.messages = result.data;
                                    MessagesMain.messagesdetails = [];
                                } else {
                                    MessagesMain.messages = [];
                                }
                            }).catch(function (rejection) {
                                MessagesMain.messages = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast(' Message was Updated', 'success');
                        } else {
                            tosterFactory.showCustomToast(' Message was not Updated', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Updating  Message failed', 'fail');
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
