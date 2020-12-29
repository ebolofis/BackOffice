'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the posBOApp
 */
angular.module('posBOApp')
  .controller('MainCtrl', ['tosterFactory', '$scope', '$q', 'config', 'auth', 'DynamicApiService', 'dataUtilFactory', '$mdDialog', '$mdMedia','ConfigService',
function (tosterFactory, $scope, $q, config, auth, DynamicApiService, dataUtilFactory, $mdDialog, $mdMedia,ConfigService) {
    var authSpecs = auth.getLoggedSpecs();
    $scope.initView = function () {
        var storePromise = $scope.getDropDownLookUps('Store');
        var storeMessagesPromise = $scope.getDropDownLookUps('StoreMessages');
        var storeHotelInfoPromise = $scope.getDropDownLookUps('HotelInfo');
        var customerPolicyPromise = $scope.getDropDownLookUps('LookupEnum');
        //When all lookUps finished loading 
        $q.all([storePromise, storeMessagesPromise, storeHotelInfoPromise, customerPolicyPromise]).then(function () {
            tosterFactory.showCustomToast('All lookup entities resolved', 'success');
        });
    }
    $scope.storeInfo = {};
    $scope.getDropDownLookUps = function (entity, customparams) {
        switch (entity) {
            case 'Store': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                $scope.storeInfo = result.data[0];
                if (result.data[0] === undefined) {
                    $scope.storeInfo = { Id: 0 };
                }
                $scope.storeInfo = angular.extend($scope.storeInfo, { StoreKitchenInstructionBool: ($scope.storeInfo.StoreKitchenInstruction == 1) ? true : false });
                //$scope.storeInfo.LogoUri = 'http:\/\/poswebapi.hitweb.com.gr\/images\/2623fe8e-cb11-4591-b953-bc070b6a5f56\/store\/logo.png'
                $scope.storeInfo.DisplayStoreId = angular.copy(authSpecs.storeId);
                $scope.storeInfo.loadedFileName = "";
                $scope.storeInfo.UploadedLogoPrefix = config.WebApiURL.slice(0, -1) + '/images/' + authSpecs.storeId + '/store/';
                $scope.storeInfo.UploadedLogoUri = angular.copy($scope.storeInfo.LogoUri);
                //$scope.storeInfo.LogoUri = config.WebApiURL.slice(0, -1) + $scope.storeInfo.LogoUri;
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Store Info failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Loading Store Info error', 'error');
                console.log('Fail error'); console.log(reason);
            })
            ); break;

            case 'StoreMessages': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                $scope.storeMessages = result.data;
                angular.forEach($scope.storeMessages, function (item) {
                    item.DPShowFrom = new Date(item.ShowFrom);
                    item.DPShowTo = new Date(item.ShowTo);
                })
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Store Messages failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            })); break;

            case 'HotelInfo': return (DynamicApiService.getAttributeRoutingData('HotelInfo', 'HotelInfoEntities' ,'','').then(function (result) {
                $scope.hotelInfo = result.data;
            }, function (reason) {
                tosterFactory.showCustomToast('Loading Hotel Info failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Loading Hotel Info error', 'error');
                console.log('Fail error'); console.log(reason);
            })
            ); break;

                //http://localhost:61964/api/LookupEnum?storeid=3007eeec-752a-45cf-a214-1a868731f088&enumName=CustomerPolicyEnum
            case 'LookupEnum': return (DynamicApiService.getDynamicObjectData(entity, 'enumName=CustomerPolicyEnum').then(function (result) {
                $scope.customerPolicyEnum = {};
                $scope.customerPolicy = result.data.map(function (ic) {
                    ic.Id = Number(ic.Id);
                    var tmp = {}; tmp[ic.Id] = ic.Descr;
                    $scope.customerPolicyEnum = angular.extend($scope.customerPolicyEnum, tmp);
                    ic.Desctiption = ic.Descr;
                    return ic;
                })
            }, function (reason) {
                tosterFactory.showCustomToast('Loading customer lookup failed', 'fail');
                console.log('Fail Load'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Loading customer lookup error', 'error');
                console.log('Error Load'); console.log(reason);
            })
            ); break;

            default: break;

        }
    }
    $scope.removeEntry = function (ev, type, data) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
              .title('Delete')
              .textContent('Would you like to delete current ' + type + '?')
              .ariaLabel('remove' + type)
              .targetEvent(ev)
              .ok('Remove')
              .cancel('Cancel');
        $mdDialog.show(confirm).then(function () {
            if (type == 'message') {
                //DELETE api/StoreMessages/{id}?storeid={storeid}	
                DynamicApiService.deleteAttributeRoutingDataParamStoreId('StoreMessages', data.Id).then(function (result) {
                    tosterFactory.showCustomToast('Message deleted succesfully', 'success');
                    $scope.getDropDownLookUps('StoreMessages');
                }, function (reason) {
                    tosterFactory.showCustomToast('Message delete failed', 'fail'); console.log('Fail Load'); console.log(reason);
                }, function (error) {
                    tosterFactory.showCustomToast('Message delete error', 'error'); console.log('Error Delete'); console.log(reason);
                })
            } else if (type == 'hotel info') {
                //api/HotelInfo/{id}?storeid={storeid}
                DynamicApiService.deleteAttributeRoutingDataParamStoreId('HotelInfo', data.Id).then(function (result) {
                    tosterFactory.showCustomToast('HotelInfo deleted succesfully', 'success');
                    $scope.getDropDownLookUps('HotelInfo');
                }, function (reason) {
                    tosterFactory.showCustomToast('HotelInfo delete failed', 'fail'); console.log('Fail Load'); console.log(reason);
                }, function (error) {
                    tosterFactory.showCustomToast('HotelInfo delete error', 'error'); console.log('Error Delete'); console.log(reason);
                })

            }
        }, function () {
        });
    };
    $scope.filtersObjArray = {};
    $scope.editStore = function (ev, type, data, action) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        if (type == 'hotel') {
            if (data.allHotels !== undefined && data.allHotels == 1) {
                data.allHotels = true;
            }
            $scope.filtersObjArray['customerPolicy'] = ($scope.customerPolicy !== undefined && $scope.customerPolicy !== null) ? $scope.customerPolicy : [];
        }
        var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing '+type }; 
        var dataEntry = {};
        if (action == 'edit' && data !== undefined && data !== null) {
            formModel = angular.extend({ forceTitle: 'Edit '+ type }, formModel);
            dataEntry = angular.copy(data);
        }
        if (type == 'store') {
            $scope.uploadModel = {
                controllerName: 'Upload',
                actionName: 'store',
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
            console.log('Dynamic ins form ret')
            switch (actionname.type) {
                case 'store':
                    //PUT api/Store/{id}?storeid={storeid}	
                    //http://localhost:61964/api/PosInfo/UpdatePage?storeId=2623fe8e-cb11-4591-b953-bc070b6a5f56
                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    $scope.storeInfo = retdata;
                    if ($scope.storeInfo.Id == 0) {
                        //api/Store?storeid={storeid}
                        DynamicApiService.postSingle('Store', retdata).then(function (result) {
                            tosterFactory.showCustomToast('StoreInfo updated succesfully', 'success');
                            $scope.getDropDownLookUps('Store');
                        }, function (reason) {
                            tosterFactory.showCustomToast('StoreInfo updated failed', 'fail');
                            console.log('Fail update'); console.log(reason);
                        }, function (error) {
                            tosterFactory.showCustomToast('StoreInfo update error', 'error');
                            console.log('Error update'); console.log(reason);
                        })
                    } else {
                        DynamicApiService.putAttributeRoutingDataParamStoreId('Store', $scope.storeInfo.Id, retdata).then(function (result) {
                            tosterFactory.showCustomToast('StoreInfo updated succesfully', 'success');
                            $scope.getDropDownLookUps('Store');
                        }, function (reason) {
                            tosterFactory.showCustomToast('StoreInfo updated failed', 'fail');
                            console.log('Fail update'); console.log(reason);
                        }, function (error) {
                            tosterFactory.showCustomToast('StoreInfo update error', 'error');
                            console.log('Error update'); console.log(reason);
                        })
                        break;
                    }
                case 'message':
                    retdata.storeId = $scope.storeInfo.Id;
                    if (actionname.action == 'edit') {
                        //PUT api/StoreMessages/{id}?storeid={storeid}	
                        DynamicApiService.putAttributeRoutingDataParamStoreId('StoreMessages', retdata.Id, retdata).then(function (result) {
                            tosterFactory.showCustomToast('Messages updated succesfully', 'success');
                            $scope.getDropDownLookUps('StoreMessages');
                        }, function (reason) {
                            tosterFactory.showCustomToast('Messages updated failed', 'fail');
                            console.log('Fail update'); console.log(reason);
                        }, function (error) {
                            tosterFactory.showCustomToast('Messages update error', 'error');
                            console.log('Error update'); console.log(reason);
                        })
                    } else if (actionname.action == 'insert') {
                        //POST api/StoreMessages?storeid={storeid}	
                        DynamicApiService.postSingle('StoreMessages', retdata).then(function (result) {
                            tosterFactory.showCustomToast('New message added succesfully', 'success');
                            $scope.getDropDownLookUps('StoreMessages');
                        }, function (reason) {
                            tosterFactory.showCustomToast('Messages updated failed', 'fail');
                            console.log('Fail update'); console.log(reason);
                        }, function (error) {
                            tosterFactory.showCustomToast('Messages update error', 'error');
                            console.log('Error update'); console.log(reason);
                        })
                    } break;

                case 'hotel':
                    retdata.storeId = $scope.storeInfo.Id;
                    if (actionname.action == 'edit') {
                        //PUT api/StoreMessages/{id}?storeid={storeid}	
                        DynamicApiService.putAttributeRoutingDataParamStoreId('HotelInfo', retdata.Id, retdata).then(function (result) {
                            tosterFactory.showCustomToast('Hotel Info updated succesfully', 'success');
                            $scope.getDropDownLookUps('HotelInfo');
                        }, function (reason) {
                            tosterFactory.showCustomToast('Hotel Info update failed', 'fail');
                            console.log('Fail update'); console.log(reason);
                        }, function (error) {
                            tosterFactory.showCustomToast('Hotel Info update failed', 'error');
                            console.log('Error update'); console.log(reason);
                        })

                    } else if (actionname.action == 'insert') {
                        DynamicApiService.postSingle('HotelInfo', retdata).then(function (result) {
                            tosterFactory.showCustomToast('Hotel Info inserted succesfully', 'success');
                            $scope.getDropDownLookUps('HotelInfo');
                        }, function (reason) {
                            tosterFactory.showCustomToast('Hotel Info insert failed', 'fail');
                            console.log('Fail insert'); console.log(reason);
                        },
                        function (error) {
                            tosterFactory.showCustomToast('Hotel Info update error', 'error');
                            console.log('Error insert'); console.log(reason);
                        })
                    }
                    //var hinfos = $scope.hotelInfo.map(function (item) { if (item.Id == retdata.Id) item = retdata; return item; })
                    //$scope.hotelInfo = hinfos; break;
                default: break;
            }
        }, function () { });
        $scope.$watch(function () {
            return $mdMedia('xs') || $mdMedia('sm');
        }, function (wantsFullScreen) {
            $scope.customFullscreen = (wantsFullScreen === true);
        });
    };

    $scope.checkHotelInfo = function (ev, type, data) {
        if (type == 'Hotel') {
            var url = data.HotelUri + "/Public/GetReservationInfo?"
            url += "hotelid=" + data.HotelId + "&pageNo=0&pagesize=10";
            console.log(url);
            DynamicApiService.getDynamicUrl(url).then(function (result) {
                tosterFactory.showCustomToast('Hotel Interface respond Correctly', 'success');
                $scope.displayResultCheckHotelInfo(data, type, 'Success', result);
            }, function (reason) {
                tosterFactory.showCustomToast('Interface responce failed', 'fail');
                console.log('Fail responce'); console.log(reason);
                $scope.displayResultCheckHotelInfo(data, type, 'Success', result);
            }, function (error) {
                tosterFactory.showCustomToast('Interface responce error', 'error');
                console.log('Error response'); console.log(reason);
            })
        }
        if (type == 'Api') {
            var parameters = "Id=" + data.HotelId + "room=&name=&customerPolicy=1&page=1&pagesize=10&_=1463061689869";
            DynamicApiService.getDynamicObjectData('Customer', parameters).then(function (result) {
                tosterFactory.showCustomToast('Customer call ended succesfully ', 'success');
                $scope.displayResultCheckHotelInfo(data, type, 'Success', result);
                //FirstName//LastName //Room //ProfileNo //ReservationCode
                //Departure: "2015-12-30T22:00:00Z" //Arrival:"2015-04-23T21:00:00Z"
            }, function (reason) {
                tosterFactory.showCustomToast('Customer call failed', 'fail');
                console.log('Fail responce'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Customer call error', 'error');
                console.log('Error responce'); console.log(reason);
            })
        }
    }
    $scope.displayResultCheckHotelInfo = function (data, type, restPromise, restResult) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
            controller: DisplayDialogController,
            templateUrl: '../app/scripts/directives/views-directives/StoreInfoDisplayModal.html',
            parent: angular.element('#wrapper'),//document.body),
            //targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: useFullScreen,
            resolve: {
                dataEntity: function () { return data; },
                templateOption: function () { return type; },
                promise: function () { return restPromise; },
                result: function () { return restResult; }
            }
        })
        .then(function (retdata) {

        }, function () { });

    }

}])
.config(function ($mdThemingProvider) {
    // Configure a dark theme with primary foreground yellow
    $mdThemingProvider.theme('docs-dark', 'default')
      .primaryPalette('yellow')
      .dark();
})
.directive('apsUploadFile', ['tosterFactory', 'DynamicApiService', '$q', function (tosterFactory, DynamicApiService, $q) {
    var directive = {
        restrict: 'E',
        scope: {
            storeInfo: '='
        },
        template: '<input id="fileInput" type="file" class="ng-hide">' +
                '<md-button id="uploadButton" class="md-raised md-primary" aria-label="attach_file">Choose file </md-button>' +
                '<md-input-container  md-no-float>' +
                    '<input id="textInput" ng-model="fileName" type="text" placeholder="No file chosen" ng-readonly="true">' +
                '</md-input-container>'
                ,
        link: function (scope, element, attrs) {
            var input = $(element[0].querySelector('#fileInput')); var button = $(element[0].querySelector('#uploadButton'));
            var textInput = $(element[0].querySelector('#textInput'));

            if (input.length && button.length && textInput.length) {
                button.click(function (e) { input.click(); });
                textInput.click(function (e) { input.click(); });
            }

            input.on('change', function (e) {
                var files = e.target.files;
                if (files[0]) {
                    var uploadPromise = DynamicApiService.uploadImage('Upload', 'store', scope.storeInfo.Id, files[0]).then(function (result) {
                        scope.fileName = files[0].name;
                        scope.storeInfo.loadedFileName = scope.fileName;
                        scope.storeInfo.UploadedLogoUri = angular.copy(scope.storeInfo.UploadedLogoPrefix + scope.fileName);
                        tosterFactory.showCustomToast('Image uploaded successfully', 'success');
                    }, function (reason) {
                        scope.fileName = "";
                        tosterFactory.showCustomToast('Uploading Image failed', 'fail');
                        console.log('Fail responce'); console.log(reason);
                    }, function (error) {
                        scope.fileName = "";
                        tosterFactory.showCustomToast('Uploading Image error', 'error');
                        console.log('Error responce'); console.log(error);
                    })
                    //upload(files[0]);
                } else { scope.fileName = null; }
                scope.$apply();
            });
        }
    };
    return directive;
}]);

function DisplayDialogController($scope, $mdDialog, dataEntity, templateOption, promise, result) {
    $scope.data = angular.copy(dataEntity);
    $scope.templateOption = templateOption;
    $scope.promise = promise;
    $scope.result = angular.copy(result);
    $scope.hide = function () {
        $mdDialog.hide();
    };
    formFieldsFormater()
    function formFieldsFormater() {
        switch ($scope.templateOption) {
            case 'Api':
                if ($scope.result.data !== undefined && $scope.promise == 'Success') {
                    var def = $scope.result.data.map(function (item) {
                        item.DPDeparture = new Date(item.Departure);
                        item.DPArrival = new Date(item.Arrival);
                        return item;
                    })
                    $scope.result.data = def;
                }
                break;
            default:
        }
    }

}



function DialogController($scope, $mdDialog, dataEntity, templateOption, action, customerPolicy) {
    $scope.hide = function () {
        $mdDialog.hide();
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    $scope.confirm = function (answer) {
        var ret = {
            data: $scope.data,
            option: $scope.templateOption,
            action: $scope.action
        }
        $mdDialog.hide(ret);
    };
    $scope.data = angular.copy(dataEntity);
    $scope.templateOption = templateOption;
    $scope.action = action;
    $scope.customerPolicy = customerPolicy;
    formFieldsFormater()
    function formFieldsFormater() {
        switch ($scope.templateOption) {
            case 'message':
                $scope.data.DPShowFrom = new Date($scope.data.ShowFrom);
                $scope.data.DPShowTo = new Date($scope.data.ShowTo);
                break;
            default: break;

        }
    }
}

//Id
//Message
//CreationDate
//Title
//StoreId
//ShowFrom
//ShowTo
//ImageUri
//Status


//Description:    null //ExtDescription:    null
//Address :    "Paparigopoulou Street, 99"
//Email:    "theo@theodosirestaurant.com"


//HotelInfo:    Array[0]
//Id:    1
//ImageUri:    null
//Latitude:    "35.507799"
//LogoUri:    "/Images/67e6e3a9-d251-4814-aa27-9e641414e8e8/logo.png"
//Longtitude:    "23.998532"
//Notifications:    Array[0]
//Phone1:    "28210 93733"
//Phone2:    null
//Phone3:    null
//Status:    null
//StoreKitchenInstruction:    null
//StoreMapId:    null
//StoreMessages:    Array[0]


//GET api/Store?storeid={storeid}	
//GET api/Store/{id}?storeid={storeid}	
//GET api/Store/{Id}?room={room}&name={name}	
//PUT api/Store/{id}?storeid={storeid}	
//POST api/Store?storeid={storeid}	
//DELETE api/Store/{id}?storeid={storeid}	
//OPTIONS api/Store	


//StoreMessages

//GET api/StoreMessages?storeid={storeid}	
//GET api/StoreMessages?storeid={storeid}&filtered={filtered}	
//GET api/StoreMessages/{id}?storeid={storeid}	
//PUT api/StoreMessages/{id}?storeid={storeid}	
//POST api/StoreMessages?storeid={storeid}	
//DELETE api/StoreMessages/{id}?storeid={storeid}	
//OPTIONS api/StoreMessages	

//HotelInfo

//GET api/HotelInfo?storeid={storeid}	
//GET api/HotelInfo/{id}?storeid={storeid}	
//GET api/HotelInfo?storeid={storeid}&forhotelinfo={forhotelinfo}	
//PUT api/HotelInfo/{id}?storeid={storeid}	
//POST api/HotelInfo?storeid={storeid}	
//DELETE api/HotelInfo/{id}?storeid={storeid}	
//OPTIONS api/HotelInfo	