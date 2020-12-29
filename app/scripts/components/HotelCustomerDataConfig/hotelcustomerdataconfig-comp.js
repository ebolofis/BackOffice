/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />
angular.module('posBOApp')
    .component('handleHotelCustomerDataConfig', {
        templateUrl: 'app/scripts/components/HotelCustomerDataConfig/templates/main-ManageHotelCustomerDataConfig.html',
        controller: 'HotelCustomerDataConfigCTRL',
        controllerAs: 'HotelCustomerDataConfigMain'
    })
    .filter("DateRange", function () {
        return function (datefrom, dateto) {
        }

    })
    .controller('HotelCustomerDataConfigCTRL', ['$scope', '$mdDialog', '$mdMedia', 'hcdcFactory', 'dataUtilFactory', 'tosterFactory', '$q', 'DynamicApiService', function ($scope, $mdDialog, $mdMedia, hcdcFactory, dataUtilFactory, tosterFactory, $q, DynamicApiService) {
        var HotelCustomerDataConfigMain = this;
        var dtu = dataUtilFactory;
        HotelCustomerDataConfigMain.$onInit = function () { };

        HotelCustomerDataConfigMain.initView = function () {

            HotelCustomerDataConfigMain.restbusy = false;
            HotelCustomerDataConfigMain.params = [];
            HotelCustomerDataConfigMain.selected = [];
            HotelCustomerDataConfigMain.tempselected = [];
            HotelCustomerDataConfigMain.configs = [];
            HotelCustomerDataConfigMain.csdata = [];
            HotelCustomerDataConfigMain.GetHotelCustomerDataConfig();

        };

        HotelCustomerDataConfigMain.removeEntry = function (ev, type, data) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .textContent('Would you like to delete current ' + type + '?')
                .ariaLabel('remove' + type)
                .targetEvent(ev)
                .ok('Remove')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                $scope.removeid(data);
            }, function () {
            });
        };

        var Priority = 1000;


        DeleteAll = function () {
            HotelCustomerDataConfigMain.csdata = [];
        }

        $scope.HigherPriority = function (row) {
            var flag = 0;
            angular.forEach(HotelCustomerDataConfigMain.csdata, function (value, temp) {

                if (value.Priority == row.Priority + 1 && flag == 0) {
                    var temp1 = row.Priority;
                    temp2 = value.Priority;
                    row.Priority = temp2;
                    value.Priority = temp1;
                    flag = 1;
                }
            });

        }
        $scope.LowerPriority = function (row) {


            if (row.Priority == 1000) {
                angular.forEach(HotelCustomerDataConfigMain.csdata, function (value, temp) {
                    if (value.Priority == 999) {
                        value.Priority = row.Priority;
                        row.Priority = 999;
                    }
                });
                return;
            }
            var flag = 0;

            angular.forEach(HotelCustomerDataConfigMain.csdata, function (value, temp) {
                if (value.Priority == row.Priority - 1 && flag==0) {
                    var temp1 = row.Priority;
                    row.Priority = value.Priority;
                    value.Priority = temp1;
                    flag = 1;
                    return;
                }

            });
            return;

        }


        $scope.addId = function (row) {
            var obj = [];
            var temp = row.Id;
            var flag = 0;
            angular.forEach(HotelCustomerDataConfigMain.csdata, function (value, temp) {
                if (value.Id == row.Id) {
                    flag = 1;
                }
            });

            if (flag == 0) {
                obj.Id = row.Id;
                obj.Property = row.Description;
                obj.FieldType = row.FieldType;
                obj.Description = row.Description;
                obj.Priority = Priority - HotelCustomerDataConfigMain.csdata.length;

                HotelCustomerDataConfigMain.csdata.push(obj);
                var obj2 = [];
                obj2.push(row);
                HotelCustomerDataConfigMain.params.splice(obj2, 1);

            }

        }
        $scope.addToSelected = function () {


            HotelCustomerDataConfigMain.selected = HotelCustomerDataConfigMain.tempselected;
        }

        $scope.removeid = function (row) {
            //debugger
            var obj = [];
            var temp = row.Property;
            var idtobedeleted = 0;
            var flag = 0;
            angular.forEach(HotelCustomerDataConfigMain.params, function (value, temp) {
                if (value.Description == row.Property) {
                    flag = 1;
                    idtobedeleted = value.Id
                }
            });

            if (flag == 0) {
                obj.Id = row.Id;

                if (row.Description == undefined)
                    obj.Description = row.Property;
                else
                    obj.Description = row.Description;

                obj.FieldType = row.FieldType;
                HotelCustomerDataConfigMain.params.push(obj);
                var obj2 = [];
                obj2.push(row);

                angular.forEach(HotelCustomerDataConfigMain.csdata, function (value, obj2) {
                    if (value.Property == row.Property) {
                        HotelCustomerDataConfigMain.csdata.splice(HotelCustomerDataConfigMain.csdata.indexOf(value), 1);
                    }
                });



                HotelCustomerDataConfigMain.params.sort((a, b) => a.Description.localeCompare(b.Description))

            }
            else {
                angular.forEach(HotelCustomerDataConfigMain.csdata, function (value, temp) {
                    if (value.Property == row.Property) {
                        HotelCustomerDataConfigMain.csdata.splice(HotelCustomerDataConfigMain.csdata.indexOf(value), 1);
                    }
                });

            }


        }

        $scope.RemoveFromSelected = function (row) {
            HotelCustomerDataConfigMain.selected = [];
        }

        $scope.deleteHotelCustomerDataConfigMain = function (row) {
            var lkp = hcdcFactory.apiInterface.HotelCustomMessages.GET.deleteHotelCustomerDataConfigMain;
            DynamicApiService.getV3('Hotel', lkp, row.Id).then(function (result) {
                $scope.filtersObjArray = result;
                HotelCustomMessagesMain.GetHotelCustomerDataConfig();

            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Hotel Customer Data Config Lookup failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                HotelCustomMessagesMain.csdata = [];
                return -1;
            }).finally(function () {
            });
        };

        $scope.addHotelCustomerDataConfig = function (data) {


            const Hotel__CustomerDataConfigModel = {};
            Hotel__CustomerDataConfigModel.Id                           = data[0].Id;
            Hotel__CustomerDataConfigModel.Description              = data[0].Description;
            Hotel__CustomerDataConfigModel.Property             = data[0].Property;
            Hotel__CustomerDataConfigModel.FieldType            = data[0].FieldType;
            Hotel__CustomerDataConfigModel.Priority                     = data[0].Priority;

            var models = [];
            angular.forEach(data, function (value, temp) {
                var Hotel__CustomerDataConfigModel = {};
                Hotel__CustomerDataConfigModel.Id = value.Id;
                if (value.Description != undefined)
                    Hotel__CustomerDataConfigModel.Description = value.Description;
                if (value.Description == undefined)
                    Hotel__CustomerDataConfigModel.Description = value.Property;
                Hotel__CustomerDataConfigModel.Property = value.Property;
                Hotel__CustomerDataConfigModel.FieldType = value.FieldType;
                Hotel__CustomerDataConfigModel.Priority = value.Priority;       
                models.push(Hotel__CustomerDataConfigModel);

            });
            //debugger
            var lkp = hcdcFactory.apiInterface.HotelCustomerDataConfig.POST.HandleHotelCustomerDataConfig;
  

            DynamicApiService.postV3('Hotel', lkp, models).then(function (result) {
                tosterFactory.showCustomToast('Saving Hotel Customer Data Config  succeded', 'success');
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Saving Hotel Customer Data Config  failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                HotelCustomerDataConfigMain.csdata = [];
                return -1;
            }).finally(function () {
            });

            
        }


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

        HotelCustomerDataConfigMain.GetHotelCustomerDataConfig = function () {
            var url = hcdcFactory.apiInterface.HotelCustomerDataConfig.GET.GetCustomerDataConfig;


            DynamicApiService.getV3('Hotel', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Hotel Customer Data Configurations  Loaded', 'success');
                    HotelCustomerDataConfigMain.csdata = result.data;
                } else {
                    tosterFactory.showCustomToast('Hotel Customer Data Configurations failed to Load  ', 'success');
                    HotelCustomerDataConfigMain.csdata = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Hotel Customer Data Configurations failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                HotelCustomerDataConfigMain.hasError = true; HotelCustomerDataConfigMain.csdata = [];
                return -1;
            }).finally(function () {
            });

            var url = hcdcFactory.apiInterface.HotelCustomerDataConfig.GET.GetParams;
            DynamicApiService.getV3('Hotel', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Params  Loaded', 'success');
                    $scope.filtersObjArray = {};
                    HotelCustomerDataConfigMain.params = result.data;
                    HotelCustomerDataConfigMain.params.sort((a, b) => a.Description.localeCompare(b.Description))
                } else {
                    tosterFactory.showCustomToast('Params not Loaded  ', 'success');
                    HotelCustomerDataConfigMain.params = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Params failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                HotelCustomerDataConfigMain.hasError = true; HotelCustomerDataConfigMain.params = [];
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
