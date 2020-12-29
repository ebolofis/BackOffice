/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />
angular.module('posBOApp')
    .component('handleTimezones', {
        templateUrl: 'app/scripts/components/Timezones/templates/timezonescomp.html',
        controller: 'TimezonesMainCTRL',
        controllerAs: 'TimezonesMain'
    })
    .filter("DateRange", function () {
        return function (datefrom, dateto) {

        }

    })
    .controller('TimezonesMainCTRL', ['$scope', '$mdDialog', '$mdMedia', 'tmznFactory', 'dataUtilFactory', 'tosterFactory', '$q', 'DynamicApiService', function ($scope, $mdDialog, $mdMedia, tmznFactory, dataUtilFactory, tosterFactory, $q, DynamicApiService) {

        var TimezonesMain = this;
        var dtu = dataUtilFactory;
        TimezonesMain.restbusy = false; TimezonesMain.hasError = false;
        TimezonesMain.$onInit = function () { };

         TimezonesMain.initView = function () {
             TimezonesMain.timezones = [];
             TimezonesMain.lookups = [];
          TimezonesMain.GetTimezones();
        };

         $scope.GetSetupComboLookUps = function () {
             var nameType = 'SetupCombo';
             DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi
                 $scope.filtersObjArray = result.data.LookUpEntities;
                 TimezonesMain.lookups = $scope.filtersObjArray.mpehoteld;
                 console.log(' LookUps loaded'); console.log(result);
                 return result;
             }).catch(function (rejection) {
                 tosterFactory.showCustomToast(' Lookups failed', 'fail');
                 console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection);
                 return null;
             })
         };
         $scope.GetSetupComboLookUps();

         TimezonesMain.GetTimezones= function () {
             
                var url = tmznFactory.apiInterface.Timezones.GET.GetTimezones;
                DynamicApiService.getV3('Hotel', url).then(function (result) {
                    if (result != null && result.data != null) {
                        tosterFactory.showCustomToast('Timezones  Loaded', 'success');
                        $scope.GetSetupComboLookUps();
                        TimezonesMain.timezones = result.data;
                    } else {
                        tosterFactory.showCustomToast('Timezones not Loaded  ', 'success');
                        TimezonesMain.timezones = [];
                    }
                }).catch(function (rejection) {
                    tosterFactory.showCustomToast('Loading Timezones failed', 'fail');
                    console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    TimezonesMain.hasError = true; TimezonesMain.timezones = [];
                    return -1;
                }).finally(function () {
                    TimezonesMain.restbusy = false;
                });
            }

         

         TimezonesMain.removeEntry = function (ev, type, data) {
             // Appending dialog to document.body to cover sidenav in docs app
             var confirm = $mdDialog.confirm()
                 .title('Delete')
                 .textContent('Would you like to delete current ' + type + '?')
                 .ariaLabel('remove' + type)
                 .targetEvent(ev)
                 .ok('Remove')
                 .cancel('Cancel');
             $mdDialog.show(confirm).then(function () {
                 $scope.deleteTimezone(data);
             }, function () {
             });
         };
         $scope.hotelnames = function (mpe) {

           
             angular.forEach($scope.filtersObjArray.mpehotel, function (mpe) {

                 
                 // PayrollMain.staffDynLookUps.push({ Key: payroll.StaffId, Value: payroll.StaffDesc })
             });
         }
        $scope.searchText = '';
        $scope.flag = false;

        $scope.GetSetupMainMessagesLookUps = function () {

            var nameType = 'SetupMainMessages';
            DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.filtersObjArray = result.data.LookUpEntities;
                console.log(' Main Messages LookUps loaded'); console.log(result);
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Main Messages Lookups failed', 'fail');
                console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection);
                return null;
            })
        };

        //$scope.GetSetupMainMessagesLookUps();
        TimezonesMain.GetMacros = function () {
            var url = mamFactory.apiInterface.AllowedMeals.GET.GetMacros;
            DynamicApiService.getV3('Hotel', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Macros  Loaded', 'success');
                    AllowedMealsMain.macros = result.data;

                } else {
                    tosterFactory.showCustomToast('Macros not Loaded  ', 'success');
                    AllowedMealsMain.macros = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Macros failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                AllowedMealsMain.hasError = true; AllowedMealsMain.macros = [];
                return -1;
            }).finally(function () {
                AllowedMealsMain.restbusy = false;
            });
        }
        TimezonesMain.GetMessages = function () {


            AllowedMealsMain.mainmessages = {
                "employees": [
                    { "firstName": "John", "lastName": "Doe" },
                    { "firstName": "Anna", "lastName": "Smith" },
                    { "firstName": "Peter", "lastName": "Jones" }
                ]
            };
            $scope.clearEditList = function () {
                window.location.reload();
            }
            $scope.returnToStartList = function () {

                var first = AllowedMealsMain.messages[0];
                if (first != undefined) {
                    AllowedMealsMain.messages.splice(first, 1);
                    AllowedMealsMain.mainmessages.employees.push(first);
                }
            }
            $scope.addToManageList = function () {

                var first = AllowedMealsMain.mainmessages.employees[0];
                if (first != undefined) {
                    AllowedMealsMain.mainmessages.employees.splice(first, 1);
                    AllowedMealsMain.messages.push(first);
                }
            }
        }

        $scope.GetMessageById = function (row) {

            MessagesMain.SelectedMainMessage = row;
            //  GetMessagesLookups
            var lkp = manageMessagesFactory.apiInterface.Messages.GET.GetMessagesLookups;
            DynamicApiService.getDAV3('CustomerMessages', lkp, MessagesMain.SelectedMainMessage).then(function (result) {

                $scope.filtersObjArray = result;

            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Messages Lookup failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                MessagesMain.hasError = true; MessagesMain.mainmessages = [];
                return -1;
            }).finally(function () {
                MessagesMain.restbusy = false;
            });

            var url = manageMessagesFactory.apiInterface.Messages.GET.GetMessages;
            DynamicApiService.getDAV3('CustomerMessages', url, row).then(function (result) {

                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Messages  Loaded', 'success');
                    MessagesMain.messages = result.data;
                    MessagesMain.messagesdetails = [];
                } else {
                    tosterFactory.showCustomToast('Messages not Found ', 'success');
                    MessagesMain.messages = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Messages failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                MessagesMain.hasError = true; MessagesMain.mainmessages = [];
                return -1;
            }).finally(function () {
                MessagesMain.restbusy = false;
            });
        };

        //$scope.GetSetupMainMessagesLookUps();
        $scope.GetMessageDetailsById = function (row) {

            MessagesMain.SelectedMessage = row;

            //  GetMessagesDetailsLookups
            var lkp = manageMessagesFactory.apiInterface.Messages.GET.GetMessagesLookupsDetails;
            DynamicApiService.getDAV3('CustomerMessages', lkp, MessagesMain.SelectedMessage).then(function (result) {

                $scope.filtersObjArray.data2 = result.data;

            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Messages Lookup failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                MessagesMain.hasError = true; MessagesMain.mainmessages = [];
                return -1;
            }).finally(function () {
                MessagesMain.restbusy = false;
            });






            var url = manageMessagesFactory.apiInterface.Messages.GET.GetMessagesDetails;
            DynamicApiService.getDAV3('CustomerMessages', url, row).then(function (result) {

                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Message Details  Loaded', 'success');
                    MessagesMain.messagesdetails = result.data;

                } else {
                    tosterFactory.showCustomToast('Message Details not Found ', 'success');
                    MessagesMain.messagesdetails = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Message Details failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                MessagesMain.hasError = true; MessagesMain.mainmessages = [];
                return -1;
            }).finally(function () {
                MessagesMain.restbusy = false;
            });
        };

        function ValidCode(str) {
            if (str.length > 1)
                return false;

            var isalpharethmetic = /^[A-Z ]+$/.test(str);

            if (isalpharethmetic == true)
                return true;
            else
                return false;
        }
        function Validations(str) {
            var isalpharethmetic= /^[0-9a-zA-Z]+$/.test(str);
            var isnumeric = /^[0 - 9][A - Za - z0 - 9 -]* $/.test(str);
            var inclDot = str.includes('.');
            var inclPar = str.includes(')') || str.includes('(');
            var inclSpac = str.includes(' ');
            var n = str.length;
            if (n > 1)
                return false;

            if (inclSpac == true)
                return false;

            if (isalpharethmetic == true || isnumeric == true || inclDot == true || inclPar==true)
                return true;
            else
                return false;
        }

        ////////////////////////////////////////////////////////////////////////// INSERTS//////////////////////////////////////////////////////////////////

        $scope.addTimezone = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};

            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'Timezones') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'Timezones',
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
                    var obj = new Object();
                    //Date Handling
                    var dStart = new Date(retdata.TimeFrom);
                    var dEnd = new Date(retdata.TimeTo);
                    dStart.setSeconds(0);
                    dEnd.setSeconds(59);
                    retdata["TimeFrom"] = dStart;
                    retdata["TimeTo"] = dEnd;
                    obj.Description = retdata.Description;
                    obj.HotelId = retdata.HotelId;
                    obj.Code = retdata.Code;
                    obj.TimeFrom = retdata.TimeFrom;
                    obj.TimeTo = retdata.TimeTo;
               
                    var res = ValidCode(obj.Code);

                    if (res == false) {
                        tosterFactory.showCustomToast('Code must be a Single Capital Latin Letter ,Code insertion failed', 'fail');
                        return;
                    }

                    var url = tmznFactory.apiInterface.Timezones.POST.InsertTimezones;
                    DynamicApiService.postV3('Hotel', url, obj).then(function (result) {
                        if (result != null && result.data != null) {

                            var url = tmznFactory.apiInterface.Timezones.GET.GetTimezones;
                            DynamicApiService.getV3('Hotel', url).then(function (result) {
                                if (result != null && result.data != null) {
                                    TimezonesMain.timezones = result.data;
                                } else {
                                    TimezonesMain.timezones = [];
                                }
                            }).catch(function (rejection) {
                                TimezonesMain.timezones = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Timezone Inserted', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Timezone Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Timezone Overlaps ', 'fail');
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

        // $scope.GetSetupMainMessagesLookUps();


        $scope.addMessage = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};

            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
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

                    var obj = new Object();
                    obj.Description = retdata.Description;
                    obj.IsDeleted = false;
                    obj.MainDAMessagesID = MessagesMain.SelectedMainMessage;
                    obj.Email = retdata.Email;
                    obj.OnOrderCreate = retdata.OnOrderCreate;
                    obj.OnOrderUpdate = retdata.OnOrderUpdate;

                    var kob = new Object();
                    var lob = new Object();
                    var tob = new Object();
                    lob = MessagesMain.messages;
                    tob = MessagesMain.messagesdetails;
                    kob = $scope.filtersObjArray;



                    var url = manageMessagesFactory.apiInterface.Messages.POST.CreateMessage;
                    DynamicApiService.postDAV3('CustomerMessages', url, obj).then(function (result) {
                        if (result != null && result.data != null) {

                            //  $scope.GetSetupMainMessagesLookUps();



                            //Reload Stores in order to refresh page
                            var url = manageMessagesFactory.apiInterface.Messages.GET.GetMessages;

                            DynamicApiService.getDAV3('CustomerMessages', url, obj.MainDAMessagesID).then(function (result) {
                                if (result != null && result.data != null) {
                                    MessagesMain.messages = result.data;
                                } else {
                                    MessagesMain.messages = [];
                                }
                            }).catch(function (rejection) {
                                MessagesMain.messages = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Message Inserted', 'success');
                        } else {
                            tosterFactory.showCustomToast('No  Message Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Inserting  Message failed', 'fail');
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

        $scope.addMessageDetail = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};

            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'MessagesDetails') {
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

                    var obj = new Object();
                    obj.Description = retdata.Description;
                    obj.ToOrder = retdata.ToOrder;
                    obj.IsDeleted = false;
                    obj.HeaderId = MessagesMain.SelectedMessage;
                    obj.Email = retdata.Email;
                    obj.OnOrderCreate = retdata.OnOrderCreate;
                    obj.OnOrderUpdate = retdata.OnOrderUpdate;


                    var url = manageMessagesFactory.apiInterface.Messages.POST.CreateMessageDetail;
                    DynamicApiService.postDAV3('CustomerMessages', url, obj).then(function (result) {
                        if (result != null && result.data != null) {

                            // $scope.GetSetupMainMessagesLookUps();
                            //Reload Stores in order to refresh page
                            var url = manageMessagesFactory.apiInterface.Messages.GET.GetMessagesDetails;

                            DynamicApiService.getDAV3('CustomerMessages', url, obj.HeaderId).then(function (result) {

                                if (result != null && result.data != null) {
                                    MessagesMain.messagesdetails = result.data;
                                } else {
                                    MessagesMain.messagesdetails = [];
                                }
                            }).catch(function (rejection) {
                                MessagesMain.messagesdetails = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Message Inserted', 'success');
                        } else {
                            tosterFactory.showCustomToast('No  Message Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Inserting  Message failed', 'fail');
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












        ////////////////////////////////////////////////////////////////////////////////////////////////////////DELETES



        $scope.DeleteMainMessage = function (row) {
            var url = manageMessagesFactory.apiInterface.Messages.POST.DeleteMainMessage;

            DynamicApiService.deleteShortageDAV3('CustomerMessages', url, row.Id).then(function (result) {
                tosterFactory.showCustomToast('Main Message and its details Deleted succesfully', 'success');

                var url = manageMessagesFactory.apiInterface.Messages.GET.GetMainMessages;
                DynamicApiService.getV3stores('CustomerMessages', url).then(function (result) {
                    if (result != null && result.data != null) {
                        MessagesMain.mainmessages = result.data;
                        MessagesMain.messages = [];
                        MessagesMain.messagesdetails = [];
                        $scope.flag = true;
                    } else {

                        MessagesMain.mainmessages = [];
                    }
                }).catch(function (rejection) {
                }).finally(function () {
                });

            }, function (reason) {
                tosterFactory.showCustomToast('Main Message Deletion failed', 'fail');
                console.log('Fail update'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Main Message Deletion error', 'error');
                console.log('Error update'); console.log(reason);
            })
        };


        $scope.deleteTimezone = function (row) {
       
            var url = tmznFactory.apiInterface.Timezones.GET.DeleteTimezones;

            DynamicApiService.getV3('Hotel', url, row.Id + '/' + row.Code).then(function (result) {
                tosterFactory.showCustomToast(' Timezone  Deleted succesfully', 'success');

                var url = tmznFactory.apiInterface.Timezones.GET.GetTimezones;
                DynamicApiService.getV3('Hotel', url).then(function (result) {
         
                    if (result != null && result.data != null) {
                        TimezonesMain.timezones = result.data;
                        $scope.flag = true;
                    } else {
                        TimezonesMain.timezones = [];
                    }
                }).catch(function (rejection) {
                }).finally(function () {
                });

            }, function (reason) {
                tosterFactory.showCustomToast('Timezone Deletion failed', 'fail');
                console.log('Fail update'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Timezone Deletion error', 'error');
                console.log('Error update'); console.log(reason);
            })
        };


        $scope.DeleteMessageDetail = function (row) {
            var url = manageMessagesFactory.apiInterface.Messages.POST.DeleteMessageDetail;

            DynamicApiService.deleteShortageDAV3('CustomerMessages', url, row.Id).then(function (result) {
                tosterFactory.showCustomToast(' Message Detail Deleted succesfully', 'success');

                var url = manageMessagesFactory.apiInterface.Messages.GET.GetMessagesDetails;
                DynamicApiService.getDAV3('CustomerMessages', url, row.HeaderId).then(function (result) {
                    if (result != null && result.data != null) {
                        MessagesMain.messagesdetails = result.data;
                        $scope.flag = true;
                    } else {

                        MessagesMain.messagesdetails = [];
                    }
                }).catch(function (rejection) {
                }).finally(function () {
                });

            }, function (reason) {
                tosterFactory.showCustomToast('Message Detail Deletion failed', 'fail');
                console.log('Fail update'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Message Detail Deletion error', 'error');
                console.log('Error update'); console.log(reason);
            })
        };

        $scope.cancel = function () { $mdDialog.cancel(); };

        /////////////////////////////////////////////////////////////////////////////////// UPDATE

        $scope.getDatetime = function () {
            return (new Date).toLocaleFormat("%A, %B %e, %Y");
        };

      







        $scope.editTimezone = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
                if (data.TimeFrom != null && data.TimeFrom == null) {
                    var dStart = new Date(data.DateFrom);
                    data["TimeFrom"] = dStart;
                }
                else if (data.TimeFrom == null && data.TimeTo != null) {
                    var dEnd = new Date(data.TimeTo);
                    data["TimeTo"] = dEnd;
                }
                else {
                    var dStart = data.TimeFrom;
                    var dEnd = data.TimeTo;
                    //dStart.setSeconds(0);
                   // dEnd.setSeconds(59);
                    data["TimeFrom"] = dStart;
                    data["TimeTo"] = dEnd;
                }
                dataEntry = angular.copy(data);
            }
            if (type == 'Timezones') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'Timezones',
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
                    var res = ValidCode(retdata.Code);
                    if (res == false) {
                        tosterFactory.showCustomToast('Code must be a Single Capital Latin Letter ,Code update failed', 'fail');
                        return;
                    }
                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    var url = tmznFactory.apiInterface.Timezones.POST.UpdateTimezones;
                    // $scope.GetSetupMainMessagesLookUps();
                    DynamicApiService.postV3('Hotel', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            //Reload Stores in order to refresh page
                            var url = tmznFactory.apiInterface.Timezones.GET.GetTimezones;
                            DynamicApiService.getV3('Hotel', url).then(function (result) {
                                if (result != null && result.data != null) {
                                    TimezonesMain.timezones = result.data;
                                } else {
                                    TimezonesMain.timezones = [];
                                }
                            }).catch(function (rejection) {
                                TimezonesMain.timezones = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Timezone was Updated', 'success');
                        } else {
                            tosterFactory.showCustomToast('Timezone was not Updated', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Timezone Overlapped while updating', 'fail');
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
                    //Update api/Stores
                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    var obj = new Object();
                    obj.headerid = retdata.HeaderId;

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
