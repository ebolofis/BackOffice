/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />
angular.module('posBOApp')
    .component('handleAllowedMeals', {
        templateUrl: 'app/scripts/components/manage-AllowedMeals/templates/handle-allowedmeals.html',
        controller: 'AllowedMealsMainCTRL',
        controllerAs: 'AllowedMealsMain'
    })
    .filter("DateRange", function () {
        return function (datefrom, dateto) {

        }

    })
    .controller('AllowedMealsMainCTRL', ['$scope', '$mdDialog', '$mdMedia', 'mamFactory', 'dataUtilFactory', 'tosterFactory', '$q', 'DynamicApiService', function ($scope, $mdDialog, $mdMedia, mamFactory, dataUtilFactory, tosterFactory, $q, DynamicApiService) {
        var AllowedMealsMain = this;
        var dtu = dataUtilFactory;
        AllowedMealsMain.$onInit = function () { };

        AllowedMealsMain.initView = function () {

            AllowedMealsMain.restbusy = false;
            AllowedMealsMain.macros = [];
            AllowedMealsMain.messages = [];
            AllowedMealsMain.messagesdetails = [];
            AllowedMealsMain.selectedMacros = [];
            AllowedMealsMain.selectedHotel = [];
            AllowedMealsMain.GetMacros();
            AllowedMealsMain.GetMessages();
            AllowedMealsMain.Mpehotel = [];
            AllowedMealsMain.Validations = [];

            //Protel Data//
            AllowedMealsMain.ProtelTravelAgentList = [];
            AllowedMealsMain.ProtelRoomNo = [];
            AllowedMealsMain.Source = [];
            AllowedMealsMain.RoomType = [];
            AllowedMealsMain.BookedRoomType = [];
            AllowedMealsMain.NationalityCode = [];
            AllowedMealsMain.Boards = [];
            AllowedMealsMain.Vip = [];
            AllowedMealsMain.Groups = [];
            AllowedMealsMain.productlist = [];
            AllowedMealsMain.HotelPricelists = [];
            AllowedMealsMain.Membership = [];
            AllowedMealsMain.SubMembership = [];

        };

        AllowedMealsMain.checkGroup = function (row) {
            AllowedMealsMain.grouplist = [];
            AllowedMealsMain.grouplist.push(row);
        }
        AllowedMealsMain.checkTravel = function (row) {
            AllowedMealsMain.travellist = [];
            AllowedMealsMain.travellist.push(row);
        }



        AllowedMealsMain.searchGroup = function (searchTerm, mpehotel) {

            if (searchTerm.length > 2 && mpehotel != undefined) {

                var mpe = mpehotel[0];
                var url = mamFactory.apiInterface.AllowedMeals.GET.GetFilteredProtelGroupList;
                DynamicApiService.getV3('Hotel', url, mpe + '/' + searchTerm).then(function (result) {
                    if (result != null && result.data != null) {
                        if (result.data.length > 0) {
                            AllowedMealsMain.grouplist = result.data;
                        }
                        else {
                            tosterFactory.showCustomToast('No matching Search of Group  Loaded', 'fail');
                            AllowedMealsMain.grouplist = [];
                        }
                    } else {
                        tosterFactory.showCustomToast('Group List  not Loaded  ', 'success');
                        AllowedMealsMain.grouplist = [];
                    }
                }).catch(function (rejection) {
                    tosterFactory.showCustomToast('Loading Group List failed', 'fail');
                    console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    AllowedMealsMain.grouplist = [];
                    return -1;
                }).finally(function () {
                });
            }

        }

        AllowedMealsMain.searchProduct = function (searchTerm) {

            if (searchTerm.length >= 2) {
                var url = mamFactory.apiInterface.AllowedMeals.GET.GetFilteredProduct;
                DynamicApiService.getV3('Hotel', url, searchTerm).then(function (result) {
                    if (result != null && result.data != null) {
                        if (result.data.length > 0) {
                            AllowedMealsMain.productlist = result.data;
                        }
                        else {
                            tosterFactory.showCustomToast('No matching Product List  Loaded', 'fail');
                            AllowedMealsMain.productlist = [];
                        }
                    } else {
                        tosterFactory.showCustomToast(' Product List not Loaded  ', 'success');
                        AllowedMealsMain.productlist = [];
                    }
                }).catch(function (rejection) {
                    tosterFactory.showCustomToast('Loading  Product List failed', 'fail');
                    console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    AllowedMealsMain.productlist = [];
                    return -1;
                }).finally(function () {
                });
            }

        }


        AllowedMealsMain.searchTravelAgent = function (searchTerm, mpehotel) {
            if (searchTerm.length > 2 && mpehotel != undefined) {
                var mpe = mpehotel[0];
                var url = mamFactory.apiInterface.AllowedMeals.GET.GetFilteredProtelTravelAgentList;
                DynamicApiService.getV3('Hotel', url, mpe + '/' + searchTerm).then(function (result) {
                    if (result != null && result.data != null) {
                        if (result.data.length > 0) {
                            AllowedMealsMain.travellist = result.data;

                        }
                        else {
                            tosterFactory.showCustomToast('No matching Search of Travel Agent  Loaded', 'fail');
                            AllowedMealsMain.travellist = [];
                        }
                    } else {
                        tosterFactory.showCustomToast('ProtelTravelAgentList not Loaded  ', 'success');
                        AllowedMealsMain.travellist = [];
                    }
                }).catch(function (rejection) {
                    tosterFactory.showCustomToast('Loading ProtelTravelAgentList failed', 'fail');
                    console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    AllowedMealsMain.travellist = [];
                    return -1;
                }).finally(function () {
                });

            }


        }
        AllowedMealsMain.removeEntry = function (ev, type, data) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .textContent('Would you like to delete current ' + type + '?')
                .ariaLabel('remove' + type)
                .targetEvent(ev)
                .ok('Remove')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                $scope.deleteMacro(data);
            }, function () {
            });
        };

        $scope.cancel = function () {
            AllowedMealsMain.restbusy = false;
            $mdDialog.cancel();

        };
        $scope.hide = function () {
            $mdDialog.hide();
            AllowedMealsMain.restbusy = false;
        };

        // $scope.searchText = '';
        $scope.flag = false;

        $scope.GetSetupComboLookUps = function () {
            var nameType = 'SetupCombo';

            DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi

                $scope.filtersObjArray = result.data.LookUpEntities;
                AllowedMealsMain.Mpehotel = $scope.filtersObjArray.mpehoteld; 
                console.log(' Departments LookUps loaded'); console.log(result);
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Departments Lookups failed', 'fail');
                console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection);
                return null;
            })
        };

        $scope.GetSetupComboLookUps();


        AllowedMealsMain.GetMacros = function () {

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
            });
        }



        AllowedMealsMain.search = function () {
            var lngth = AllowedMealsMain.searchText.length;
            if (lngth < 3) {
                return;
            }
            if (AllowedMealsMain.searchText == undefined) {
                tosterFactory.showCustomToast('No Input for travel Agent Search', 'fail');
            }

        }
        AllowedMealsMain.ShortByDescription = function () {
            AllowedMealsMain.macros
        }
        AllowedMealsMain.clearSearchText = function () {
            AllowedMealsMain.searchText = [];
        }

        function getCharsBefore(str, chr) {
            var index = str.indexOf(chr);
            if (index != -1) {
                return (str.substring(0, index));
            }
            return ("");
        }
        AllowedMealsMain.GetProtelLists = function () {
            AllowedMealsMain.restbusy = false;
            var Id = AllowedMealsMain.selectedHotel;
            Id = Id.split("+").pop();
            $scope.filtersObjArray.travelagenthotelid = Id;
            var mpehotel = getCharsBefore(AllowedMealsMain.selectedHotel, '+');
            $scope.filtersObjArray.travelagentmpehotel = mpehotel;
            if (mpehotel == undefined)
                return;

            var url = mamFactory.apiInterface.AllowedMeals.GET.GetMemberships;
            DynamicApiService.getV3('Hotel', url, Id + '/' + mpehotel).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Membership List  Loaded', 'success');
                    AllowedMealsMain.Membership = result.data;
                    $scope.filtersObjArray.Membership = AllowedMealsMain.Membership;
                } else {
                    tosterFactory.showCustomToast('Membership List not Loaded  ', 'success');
                    AllowedMealsMain.Membership = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Membership List failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                AllowedMealsMain.hasError = true; AllowedMealsMain.Membership = [];
                return -1;
            }).finally(function () {
            });

            var url = mamFactory.apiInterface.AllowedMeals.GET.GetSubmemberships;
            DynamicApiService.getV3('Hotel', url, Id + '/' + mpehotel).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('SubMembership List  Loaded', 'success');
                    AllowedMealsMain.SubMembership = result.data;
                    $scope.filtersObjArray.SubMembership = AllowedMealsMain.SubMembership;
                } else {
                    tosterFactory.showCustomToast('SubMembership List not Loaded  ', 'success');
                    AllowedMealsMain.SubMembership = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading SubMembership List failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                AllowedMealsMain.hasError = true; AllowedMealsMain.SubMembership = [];
                return -1;
            }).finally(function () {
            });

            var url = mamFactory.apiInterface.AllowedMeals.GET.GetVip;
            DynamicApiService.getV3('Hotel', url, Id + '/' + mpehotel).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('ProtelTravelAgentList  Loaded', 'success');
                    AllowedMealsMain.Vip = result.data;
                    $scope.filtersObjArray.Vip = AllowedMealsMain.Vip;
                } else {
                    tosterFactory.showCustomToast('Vip not Loaded  ', 'success');
                    AllowedMealsMain.Vip = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Vip failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                AllowedMealsMain.hasError = true; AllowedMealsMain.Vip = [];
                return -1;
            }).finally(function () {
            });

            var url = mamFactory.apiInterface.AllowedMeals.GET.GetHotelPricelists;
            DynamicApiService.getV3('Hotel', url, Id + '/' + mpehotel).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Hotel Pricelist:   Loaded', 'success');
                    AllowedMealsMain.HotelPricelists = result.data;
                    $scope.filtersObjArray.HotelPricelists = AllowedMealsMain.HotelPricelists;
                } else {
                    tosterFactory.showCustomToast('Hotel Pricelist:  not Loaded  ', 'success');
                    AllowedMealsMain.HotelPricelists = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Hotel Pricelist:  failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                AllowedMealsMain.HotelPricelists = [];
                return -1;
            }).finally(function () {
            });



            var url = mamFactory.apiInterface.AllowedMeals.GET.GetProtelRoomNo;
            DynamicApiService.getV3('Hotel', url, Id + '/' + mpehotel).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('ProtelRoomNo:   Loaded', 'success');
                    AllowedMealsMain.ProtelRoomNo = result.data;
                    $scope.filtersObjArray.ProtelRoomNo = AllowedMealsMain.ProtelRoomNo;
                } else {
                    tosterFactory.showCustomToast('ProtelRoomNo:  not Loaded  ', 'success');
                    AllowedMealsMain.ProtelRoomNo = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading ProtelRoomNo:  failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                AllowedMealsMain.ProtelRoomNo = [];
                return -1;
            }).finally(function () {
            });

            var url = mamFactory.apiInterface.AllowedMeals.GET.GetSource;
            DynamicApiService.getV3('Hotel', url, Id + '/' + mpehotel).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Source:   Loaded', 'success');
                    AllowedMealsMain.Source = result.data;
                    $scope.filtersObjArray.Source = AllowedMealsMain.Source;
                } else {
                    tosterFactory.showCustomToast('Source:  not Loaded  ', 'success');
                    AllowedMealsMain.Source = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Source:  failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                AllowedMealsMain.Source = [];
                return -1;
            }).finally(function () {
            });

            var url = mamFactory.apiInterface.AllowedMeals.GET.GetRoomType;
            DynamicApiService.getV3('Hotel', url, Id + '/' + mpehotel).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('RoomType:   Loaded', 'success');
                    AllowedMealsMain.RoomType = result.data;
                    $scope.filtersObjArray.RoomType = AllowedMealsMain.RoomType;

                } else {
                    tosterFactory.showCustomToast('RoomType:  not Loaded  ', 'success');
                    AllowedMealsMain.RoomType = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading RoomType:  failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                AllowedMealsMain.GetRoomType = [];
                return -1;
            }).finally(function () {
            });


            var url = mamFactory.apiInterface.AllowedMeals.GET.GetBookedRoomType;
            DynamicApiService.getV3('Hotel', url, Id + '/' + mpehotel).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('BookedRoomType:   Loaded', 'success');
                    AllowedMealsMain.BookedRoomType = result.data;
                    $scope.filtersObjArray.BookedRoomType = AllowedMealsMain.BookedRoomType;
                } else {
                    tosterFactory.showCustomToast('BookedRoomType:  not Loaded  ', 'success');
                    AllowedMealsMain.BookedRoomType = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading BookedRoomType:  failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                AllowedMealsMain.BookedRoomType = [];
                return -1;
            }).finally(function () {
            });

            var url = mamFactory.apiInterface.AllowedMeals.GET.GetNationalityCode;
            DynamicApiService.getV3('Hotel', url, Id + '/' + mpehotel).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('NationalityCode:   Loaded', 'success');
                    AllowedMealsMain.NationalityCode = result.data;
                    $scope.filtersObjArray.NationalityCode = AllowedMealsMain.NationalityCode;
                } else {
                    tosterFactory.showCustomToast('NationalityCode:  not Loaded  ', 'success');
                    AllowedMealsMain.NationalityCode = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading NationalityCode:  failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                AllowedMealsMain.NationalityCode = [];
                return -1;
            }).finally(function () {
            });

            var url = mamFactory.apiInterface.AllowedMeals.GET.GetBoards;
            DynamicApiService.getV3('Hotel', url, Id + '/' + mpehotel).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Boards:   Loaded', 'success');
                    AllowedMealsMain.Boards = result.data;
                    $scope.filtersObjArray.Boards = AllowedMealsMain.Boards;
                } else {
                    tosterFactory.showCustomToast('Boards:  not Loaded  ', 'success');
                    AllowedMealsMain.Boards = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Boards:  failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                AllowedMealsMain.Boards = [];
                return -1;
            }).finally(function () {
            });
        }
        $scope.deleteMacro = function (row) {

            var lkp = mamFactory.apiInterface.AllowedMeals.GET.DeleteMacros;
            DynamicApiService.getV3('Hotel', lkp, row.Id).then(function (result) {

                $scope.filtersObjArray = result;
                AllowedMealsMain.GetMacros();
                $scope.GetSetupComboLookUps();

            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Macros Lookup failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                AllowedMealsMain.macros = [];
                return -1;
            }).finally(function () {
            });
        };



        AllowedMealsMain.GetMessages = function () {
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
                MessagesMain.mainmessages = [];
                return -1;
            }).finally(function () {
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
                MessagesMain.mainmessages = [];
                return -1;
            }).finally(function () {
            });
        };

        //$scope.GetSetupMainMessagesLookUps();
        $scope.GetMessageDetailsById = function (row) {

            MessagesMain.SelectedMessage = row;

            var lkp = manageMessagesFactory.apiInterface.Messages.GET.GetMessagesLookupsDetails;
            DynamicApiService.getDAV3('CustomerMessages', lkp, MessagesMain.SelectedMessage).then(function (result) {

                $scope.filtersObjArray.data2 = result.data;

            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Messages Lookup failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                MessagesMain.mainmessages = [];
                return -1;
            }).finally(function () {
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
                MessagesMain.mainmessages = [];
                return -1;
            }).finally(function () {
            });
        };


        ////////////////////////////////////////////////////////////////////////// INSERTS//////////////////////////////////////////////////////////////////

        $scope.addMainMessage = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xl')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};

            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'MainMessages') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'MainMessages',
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
                    obj.Email = retdata.Email;
                    obj.OnOrderCreate = retdata.OnOrderCreate;
                    obj.OnOrderUpdate = retdata.OnOrderUpdate;
                    obj.IsDeleted = 0;


                    var url = manageMessagesFactory.apiInterface.Messages.POST.CreateMainMessage;
                    DynamicApiService.postDAV3('CustomerMessages', url, obj).then(function (result) {
                        if (result != null && result.data != null) {

                            //$scope.GetSetupMainMessagesLookUps();
                            //Reload Stores in order to refresh page
                            var url = manageMessagesFactory.apiInterface.Messages.GET.GetMainMessages;
                            DynamicApiService.getV3stores('CustomerMessages', url).then(function (result) {
                                if (result != null && result.data != null) {
                                    MessagesMain.mainmessages = result.data;
                                } else {
                                    MessagesMain.mainmessages = [];
                                }
                            }).catch(function (rejection) {
                                MessagesMain.mainmessages = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Main Message Inserted', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Main Message Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Inserting Main Message failed', 'fail');
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


        $scope.addMacro = function (ev, type, data, action) {

            AllowedMealsMain.restbusy = true;
            var useFullScreen = ($mdMedia('xl') || $mdMedia('xl')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};

            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + 'Macro' }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'AllowedMeals') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'AllowedMeals',
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
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } },
                fullscreen: true,

            })
                .then(function (retdata) {


                   


                    if (retdata.Monday == undefined)
                        retdata.Monday = 1;
                    if (retdata.Tuesday == undefined)
                        retdata.Tuesday = 1;
                    if (retdata.Wednesday == undefined)
                        retdata.Wednesday = 1;
                    if (retdata.Thursday == undefined)
                        retdata.Thursday = 1;
                    if (retdata.Friday == undefined)
                        retdata.Friday = 1;
                    if (retdata.Saturday == undefined)
                        retdata.Saturday = 1;
                    if (retdata.Sunday == undefined)
                        retdata.Sunday = 1;                    

                    retdata.MacroRules.ActiveDays = [];
                    retdata.MacroRules.ActiveDays[0] = retdata.Monday;
                    retdata.MacroRules.ActiveDays[1] = retdata.Tuesday;
                    retdata.MacroRules.ActiveDays[2] = retdata.Wednesday;
                    retdata.MacroRules.ActiveDays[3] = retdata.Thursday;
                    retdata.MacroRules.ActiveDays[4] = retdata.Friday;
                    retdata.MacroRules.ActiveDays[5] = retdata.Saturday;
                    retdata.MacroRules.ActiveDays[6] = retdata.Sunday;

                    if (retdata.ActiveFrom == 'Thu Jan 01 1970 02:00:00 GMT+0200 (Eastern European Standard Time)' || retdata.ActiveTo == 'Thu Jan 01 1970 02:00:00 GMT+0200 (Eastern European Standard Time)') {
                        retdata.ActiveFrom = null;
                        retdata.ActiveTo = null;
                    }

                    if (retdata.MacroResults == null) {
                        retdata.MacroResults = {};
                        retdata.MacroResults.ItemDiscountFlag = 0;
                        retdata.MacroResults.GroupDiscountFlag = 0;
                        retdata.MacroResults.OrderDiscountFlag = 0;
                        retdata.MacroResults.AllowanceDiscountFlag = 0;
                        retdata.MacroResults.PricelistFlag = 0;
                        retdata.MacroResults.DiscountItems = 0;
                        retdata.MacroResults.DiscountGroups = 0;
                    }
                    var dStart = new Date(retdata.ActiveFrom);
                    var dEnd = new Date(retdata.ActiveTo);
                    dStart.setSeconds(0);
                    dEnd.setSeconds(0);
                    retdata["ActiveFrom"] = dStart;
                    retdata["ActiveTo"] = dEnd;


                    if (retdata.MacroResults.ItemDiscountFlag == true) {
                        if (retdata.MacroResults.ItemDiscount == undefined && retdata.MacroResults.ItemDiscountPercentage == undefined) {
                            tosterFactory.showCustomToast('Please select a Discount or a Discount Percentage alongside with the Item Discount Flag', 'fail');
                            return;
                        }
                    }
                    else {
                        retdata.MacroResults.ItemDiscount = 0;
                        retdata.MacroResults.ItemDiscountPercentage = 0;
                    }



                    if (retdata.MacroResults.GroupDiscountFlag == true) {
                        if (retdata.MacroResults.GroupDiscount == undefined && retdata.MacroResults.GroupDiscountPercentage == undefined) {
                            tosterFactory.showCustomToast('Please select a Discount or a Discount Percentage alongside with the Group Discount Flag', 'fail');
                            return;
                        }
                    }
                    else {
                        retdata.MacroResults.GroupDiscount = 0;
                        retdata.MacroResults.GroupDiscountPercentage = 0;
                    }

                    if (retdata.MacroResults.OrderDiscountFlag == true) {
                        if (retdata.MacroResults.OrderDiscount == undefined && retdata.MacroResults.OrderDiscountPercentage == undefined) {
                            tosterFactory.showCustomToast('Please select a Discount or a Discount Percentage alongside with the Order Discount Flag', 'fail');
                            return;
                        }
                    }
                    else {
                        retdata.MacroResults.OrderDiscount = 0;
                        retdata.MacroResults.OrderDiscountPercentage = 0;
                    }

                    if (retdata.MacroResults.AllowanceDiscountFlag == true) {
                        if (retdata.MacroResults.AllowanceAdultDiscount == 0 && retdata.MacroResults.AllowanceAdultDiscountPercentage == 0 && retdata.MacroResults.AllowanceChildDiscount == 0 && retdata.MacroResults.AllowanceChildDiscountPercentage == 0) {
                            tosterFactory.showCustomToast('Please select an Adult or Child Discount or a Discount Percentage alongside with the Allowance DiscountFlag ', 'fail');
                            return;
                        }
                    }
                    else {
                        retdata.MacroResults.AllowanceAdultDiscount = 0;
                        retdata.MacroResults.AllowanceAdultDiscountPercentage = 0;
                        retdata.MacroResults.AllowanceChildDiscount = 0;
                        retdata.MacroResults.AllowanceChildDiscountPercentage = 0;
                    }

                    if (retdata.MacroResults.PricelistFlag == true) {
                        if (retdata.MacroResults.Pricelist == undefined) {
                            tosterFactory.showCustomToast('Please select a Pricelist', 'fail');
                            return;
                        }
                    }
                    else {
                        retdata.Pricelist = null;
                    }

                    var TimezoneExpressionModel = {};
                    TimezoneExpressionModel.timezoneExpression = retdata.MacroRules.TimeZones;
                    var url = mamFactory.apiInterface.AllowedMeals.POST.ValidateTimezoneExpression;
                    DynamicApiService.postV3('Hotel', url, TimezoneExpressionModel).then(function (result) {
                        if (result != null && result.data != null) {
                            AllowedMealsMain.Validations = result.data;
                            if (AllowedMealsMain.Validations.length == 0)
                            {
                                tosterFactory.showCustomToast("Timezone Validation success", 'success');
                            }
                            else
                                tosterFactory.showCustomToast(result.data[0], 'fail');
                            return;
                        } else {
                            tosterFactory.showCustomToast('No Timezone Validation Errors', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Timezone Validation failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                        AllowedMealsMain.hasError = true;
                        return -1;
                    }).finally(function () {
                        });

                    var url = mamFactory.apiInterface.AllowedMeals.POST.InsertMacros;
                    if (AllowedMealsMain.Validations.length > 0)
                        tosterFactory.showCustomToast('Timezone Field was not updated', 'fail');

                    if (AllowedMealsMain.Validations.length == 0)
                        DynamicApiService.postV3('Hotel', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            //Reload Stores in order to refresh page
                            var url = mamFactory.apiInterface.AllowedMeals.GET.GetMacros;

                            DynamicApiService.getV3('Hotel', url).then(function (result) {
                                if (result != null && result.data != null) {
                                    AllowedMealsMain.macros = result.data;
                                    AllowedMealsMain.restbusy = false;
                                } else {
                                    AllowedMealsMain.macros = [];
                                }
                            }).catch(function (rejection) {
                                AllowedMealsMain.macros = [];
                            }).finally(function () {
                                AllowedMealsMain.restbusy = false;
                            });
                            debugger

                            tosterFactory.showCustomToast('Macro Inserted', 'success');
                        } else {
                            tosterFactory.showCustomToast('No  Macro Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Macro Validations failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                        AllowedMealsMain.restbusy = false;
                    })
                }, function () {
                    AllowedMealsMain.restbusy = false;
                });
            $scope.$watch(function () {

                return $mdMedia('xl') || $mdMedia('xl');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = true;
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


        $scope.DeleteMessage = function (row) {
            var url = manageMessagesFactory.apiInterface.Messages.POST.DeleteMessage;

            DynamicApiService.deleteShortageDAV3('CustomerMessages', url, row.Id).then(function (result) {
                tosterFactory.showCustomToast(' Message and its details Deleted succesfully', 'success');

                var url = manageMessagesFactory.apiInterface.Messages.GET.GetMessages;
                DynamicApiService.getDAV3('CustomerMessages', url, row.MainDAMessagesID).then(function (result) {
                    if (result != null && result.data != null) {

                        MessagesMain.messages = result.data;
                        MessagesMain.messagesdetails = [];
                        $scope.flag = true;
                    } else {

                        MessagesMain.messages = [];
                    }
                }).catch(function (rejection) {
                }).finally(function () {
                });

            }, function (reason) {
                tosterFactory.showCustomToast('Message Deletion failed', 'fail');
                console.log('Fail update'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Message Deletion error', 'error');
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


        /////////////////////////////////////////////////////////////////////////////////// UPDATE


        function ValidCode(str) {
            if (str.length > 1)
                return false;

            if (str.includes('B') || str.includes('L') || str.includes('D'))
                return true;
            else
                return false;
        }
        function Validations(str) {
            var isalpharethmetic = /^[0-9a-zA-Z]+$/.test(str);
            var isnumeric = /^[0 - 9][A - Za - z0 - 9 -]* $/.test(str);
            var inclDot = str.includes('.');
            var inclPar = str.includes(')') || str.includes('(');
            var inclSpac = str.includes(' ');
            var n = str.length;
            if (n > 1)
                return false;

            if (inclSpac == true)
                return false;

            if (isalpharethmetic == true || isnumeric == true || inclDot == true || inclPar == true)
                return true;
            else
                return false;
        }









        $scope.editMacro = function (ev, type, data, action) {
            AllowedMealsMain.restbusy = true;
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                if (data.ActiveFrom != null && data.ActiveTo == null) {
                    var dStart = new Date(data.ActiveFrom);
                    data["ActiveFrom"] = dStart;
                }
                else if (data.ActiveFrom == null && data.ActiveTo != null) {
                    var dEnd = new Date(data.ActiveTo);
                    data["ActiveTo"] = dEnd;
                }
                else {
                    var dStart = new Date(data.ActiveFrom);
                    var dEnd = new Date(data.ActiveTo);
                    dStart.setSeconds(0);
                    dEnd.setSeconds(0);
                    data["ActiveFrom"] = dStart;
                    data["ActiveTo"] = dEnd;
                }
                dataEntry = angular.copy(data);
            }
            if (type == 'AllowedMeals') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'AllowedMeals',
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

                    var TimezoneExpressionModel = {};
                    TimezoneExpressionModel.timezoneExpression = retdata.MacroRules.TimeZones;
                    var url = mamFactory.apiInterface.AllowedMeals.POST.ValidateTimezoneExpression;
                    DynamicApiService.postV3('Hotel', url, TimezoneExpressionModel).then(function (result) {
                        if (result != null && result.data != null) {
                            AllowedMealsMain.Validations = result.data;
                            if (AllowedMealsMain.Validations.length == 0)
                                tosterFactory.showCustomToast("Timezone Validation success", 'success');
                            else
                                tosterFactory.showCustomToast(result.data[0], 'fail');
                            return;
                        } else {
                            tosterFactory.showCustomToast('No Timezone Validation Errors', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Timezone Validation failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                        AllowedMealsMain.hasError = true; 
                        return -1;
                    }).finally(function () {
                    });

                  

                    if (retdata.Monday == undefined)
                        retdata.Monday = 1;
                    if (retdata.Tuesday == undefined)
                        retdata.Tuesday = 1;
                    if (retdata.Wednesday == undefined)
                        retdata.Wednesday = 1;
                    if (retdata.Thursday == undefined)
                        retdata.Thursday = 1;
                    if (retdata.Friday == undefined)
                        retdata.Friday = 1;
                    if (retdata.Saturday == undefined)
                        retdata.Saturday = 1;
                    if (retdata.Sunday == undefined)
                        retdata.Sunday = 1;     

                    retdata.MacroRules.ActiveDays = [];
                    retdata.MacroRules.ActiveDays[0] = retdata.Monday;
                    retdata.MacroRules.ActiveDays[1] = retdata.Tuesday;
                    retdata.MacroRules.ActiveDays[2] = retdata.Wednesday;
                    retdata.MacroRules.ActiveDays[3] = retdata.Thursday;
                    retdata.MacroRules.ActiveDays[4] = retdata.Friday;
                    retdata.MacroRules.ActiveDays[5] = retdata.Saturday;
                    retdata.MacroRules.ActiveDays[6] = retdata.Sunday;


                    if (retdata.ActiveFrom == 'Thu Jan 01 1970 02:00:00 GMT+0200 (Eastern European Standard Time)' || retdata.ActiveTo == 'Thu Jan 01 1970 02:00:00 GMT+0200 (Eastern European Standard Time)') {
                        retdata.ActiveFrom = null;
                        retdata.ActiveTo = null;
                    }

                    if (retdata.MacroResults.ItemDiscountFlag == true) {
                        if (retdata.MacroResults.ItemDiscount == undefined && retdata.MacroResults.ItemDiscountPercentage == undefined || retdata.MacroResults.DiscountItems.length == 0) {
                            tosterFactory.showCustomToast('Please select a Discount or a Discount Percentage alongside with the Item Discount Flag', 'fail');
                            return;
                        }
                    }
                    else {
                        retdata.MacroResults.ItemDiscount = 0;
                        retdata.MacroResults.ItemDiscountPercentage = 0;
                    }

                    if (retdata.MacroResults.GroupDiscountFlag == true) {
                        if (retdata.MacroResults.GroupDiscount == undefined && retdata.MacroResults.GroupDiscountPercentage == undefined || retdata.MacroResults.DiscountGroups.length == 0) {
                            tosterFactory.showCustomToast('Please select a Discount or a Discount Percentage alongside with the Group Discount Flag', 'fail');
                            return;
                        }

                    }
                    else {
                        retdata.MacroResults.GroupDiscount = 0;
                        retdata.MacroResults.GroupDiscountPercentage = 0;
                    }

                    if (retdata.MacroResults.OrderDiscountFlag == true) {
                        if (retdata.MacroResults.OrderDiscount == undefined && retdata.MacroResults.OrderDiscountPercentage == undefined) {
                            tosterFactory.showCustomToast('Please select a Discount or a Discount Percentage alongside with the Order Discount Flag', 'fail');
                            return;
                        }
                    }
                    else {
                        retdata.MacroResults.OrderDiscount = 0;
                        retdata.MacroResults.OrderDiscountPercentage = 0;
                    }

                    if (retdata.MacroResults.AllowanceDiscountFlag == true) {
                        if (retdata.MacroResults.AllowanceAdultDiscount == 0 && retdata.MacroResults.AllowanceAdultDiscountPercentage == 0 && retdata.MacroResults.AllowanceChildDiscount == 0 && retdata.MacroResults.AllowanceChildDiscountPercentage == 0) {
                            tosterFactory.showCustomToast('Please select an Adult or Child Discount or a Discount Percentage alongside with the Allowance DiscountFlag ', 'fail');
                            return;
                        }
                    }
                    else {
                        retdata.MacroResults.AllowanceAdultDiscount = 0;
                        retdata.MacroResults.AllowanceAdultDiscountPercentage = 0;
                        retdata.MacroResults.AllowanceChildDiscount = 0;
                        retdata.MacroResults.AllowanceChildDiscountPercentage = 0;
                    }
                    if (retdata.MacroResults.PricelistFlag == true) {
                        if (retdata.MacroResults.Pricelist == undefined) {
                            tosterFactory.showCustomToast('Please select a Pricelist', 'fail');
                            return;
                        }
                    }
                    else {
                        retdata.Pricelist = null;
                    }

                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
            
                    
                        var url = mamFactory.apiInterface.AllowedMeals.POST.UpdateMacros;
                   
                    // $scope.GetSetupMainMessagesLookUps();
                    DynamicApiService.postV3('Hotel', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            //Reload Stores in order to refresh page
                            var url = mamFactory.apiInterface.AllowedMeals.GET.GetMacros;
                            DynamicApiService.getV3('Hotel', url).then(function (result) {
                                if (result != null && result.data != null) {
                                    if (AllowedMealsMain.Validations.length > 0) {
                                        AllowedMealsMain.macros = AllowedMealsMain.macros;
                                    }
                                    else{
                                    AllowedMealsMain.macros = result.data;
                                    AllowedMealsMain.restbusy = false;
                                    }
                                } else {
                                    AllowedMealsMain.macros = [];
                                    AllowedMealsMain.restbusy = false;
                                }
                            }).catch(function (rejection) {
                                AllowedMealsMain.macros = [];
                                AllowedMealsMain.restbusy = false;
                            }).finally(function () {
                                AllowedMealsMain.restbusy = false;
                            });

                            tosterFactory.showCustomToast('Macro was Updated', 'success');
                        } else {
                            tosterFactory.showCustomToast('Macro was not Updated', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast(' Macro Validations failed while updating', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                        AllowedMealsMain.restbusy = false;
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


        //Edit Details 
        $scope.askForDeletion = function (ev, type, data, action) {
            AllowedMealsMain.restbusy = true;
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                if (data.ActiveFrom != null && data.ActiveTo == null) {
                    var dStart = new Date(data.ActiveFrom);
                    data["ActiveFrom"] = dStart;
                }
                else if (data.ActiveFrom == null && data.ActiveTo != null) {
                    var dEnd = new Date(data.ActiveTo);
                    data["ActiveTo"] = dEnd;
                }
                else {
                    var dStart = new Date(data.ActiveFrom);
                    var dEnd = new Date(data.ActiveTo);
                    dStart.setSeconds(0);
                    dEnd.setSeconds(0);
                    data["ActiveFrom"] = dStart;
                    data["ActiveTo"] = dEnd;
                }
                dataEntry = angular.copy(data);
            }
            if (type == 'AllowedMeals') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'AllowedMeals',
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
                    var url = mamFactory.apiInterface.AllowedMeals.POST.UpdateMacros;
                    // $scope.GetSetupMainMessagesLookUps();
                    DynamicApiService.postV3('Hotel', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            //Reload Stores in order to refresh page
                            var url = mamFactory.apiInterface.AllowedMeals.GET.GetMacros;
                            DynamicApiService.getV3('Hotel', url).then(function (result) {
                                if (result != null && result.data != null) {
                                    AllowedMealsMain.macros = result.data;
                                    AllowedMealsMain.restbusy = false;
                                } else {
                                    AllowedMealsMain.macros = [];
                                    AllowedMealsMain.restbusy = false;
                                }
                            }).catch(function (rejection) {
                                AllowedMealsMain.macros = [];
                                AllowedMealsMain.restbusy = false;
                            }).finally(function () {
                                AllowedMealsMain.restbusy = false;
                            });

                            tosterFactory.showCustomToast('Macro was Updated', 'success');
                        } else {
                            tosterFactory.showCustomToast('Macro was not Updated', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Updating Macro failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                        AllowedMealsMain.restbusy = false;
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
