'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:masterSlaveGridController
 * @description
 * # masterSlaveGridController
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .controller('PosModulesCtrl', ['tosterFactory', '$stateParams', '$scope', '$q', 'DynamicApiService', 'dataUtilFactory', '$mdDialog', '$mdMedia',
        function (tosterFactory, $stateParams, $scope, $q, DynamicApiService, dataUtilFactory, $mdDialog, $mdMedia) {
            $scope.lookupEntities = {};
            $scope.initView = function () {
                var masterlookup = DynamicApiService.getDynamicGridModel($scope.masterEntityIdentifier).then(function (result) {
                    $scope.lookupEntities = angular.extend($scope.lookupEntities, result.data.LookUpEntities);
                })
                var slavelookup = DynamicApiService.getDynamicGridModel($scope.slaveEntityIdentifier).then(function (result) {
                    $scope.lookupEntities = angular.extend($scope.lookupEntities, result.data.LookUpEntities);
                })
                var posModules = getPosModules();
                $q.all([masterlookup, slavelookup, posModules]).then(function () {
                    //extend lookups for groupId relation witch is InvType.Type - Desc
                    var newType = angular.copy($scope.lookupEntities.InvoicesTypeId);
                    var arr = newType.map(function (item) {
                        var obj = { Key: item.Type, Value: item.Value };
                        return obj;
                    })
                    $scope.lookupEntities.InvoicesTypeByType = arr;

                    $scope.lookupEntitiesEnum = {};
                    angular.forEach($scope.lookupEntities, function (value, key) {
                        var tmpObj = {};
                        tmpObj[key] = dataUtilFactory.createEnums(value, {}, 'Key', 'Value')
                        $scope.lookupEntitiesEnum = angular.extend($scope.lookupEntitiesEnum, tmpObj);
                        var sv = dataUtilFactory.quicksort(value, 'Value');
                        value = sv;
                    })
                    //console.log($scope.lookupEntities); console.log($scope.PosInfo); console.log($scope.lookupEntitiesEnum);
                });
            }
            //Get PosInfoModules
            function getPosModules() {
                $scope.loadingPosInfo = true;
                return (DynamicApiService.getDynamicObjectData($scope.masterEntityIdentifier, 'page=1&pageSize=200').then(function (result) {
                    if (result.data.length < 1) {
                        tosterFactory.showCustomToast('No Results found for ' + $scope.masterEntityIdentifier + ' array', 'info');
                    }
                    angular.forEach(result.data.Results, function (item) { item.viewFODay = new Date(item.FODay); })
                    $scope.PosInfo = result.data.Results;
                    $scope.groupedPosInfo = dataUtilFactory.groupTo($scope.PosInfo, 'Type');
                    $scope.loadingPosInfo = false;
                }, function (fail) {
                    $scope.loadingPosInfo = false;
                }, function (error) {
                    $scope.loadingPosInfo = false;
                }))
            }

            //Action click and select Pos Module
            $scope.selectPosInfo = function (pi) {
                if ($scope.selectedPosInfo !== undefined && $scope.selectedPosInfo !== null && pi.Id == $scope.selectedPosInfo.Id) return;
                $scope.selectedPosInfo = pi;
                $scope.getPosInfoDetails($scope.slaveEntityIdentifier, 'page=1&pageSize=200&posInfoId=' + $scope.selectedPosInfo.Id);
                tosterFactory.showCustomToast('Getting POS INFO page=1 size=200 BY DEFAULT', 'info');
                //$scope.getPosInfoDetails($scope.slaveEntityIdentifier, 'page=' + $scope.slavePaginationOptions.pageNumber + '&pageSize=' + $scope.slavePaginationOptions.pageSize + '&posInfoId=' + $scope.selectedPosInfo.Id);
            }

            //Get Selected Pos Module Details 
            $scope.getPosInfoDetails = function (apiControllerName, parameters) {
                $scope.loadingPosInfoDetails = true;
                DynamicApiService.getDynamicObjectData(apiControllerName, parameters).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    if (result.data.length < 1) {
                        tosterFactory.showCustomToast('No Results found for ' + $scope.slaveEntityIdentifier + ' array', 'info');
                    }
                    var res = angular.copy(result.data.Results);
                    //$scope.posInfoDetail = dataUtilFactory.quicksort(res, 'GroupId');
                    $scope.groupedPosInfoDetail = dataUtilFactory.groupTo(res, 'GroupId');
                    $scope.loadingPosInfoDetails = false;
                }, function (failr) { $scope.loadingPosInfoDetails = false; }, function (errorr) { $scope.loadingPosInfoDetails = false; });
            }
            //Edit posInfo && posInfoDetail(Add && Edit)
            $scope.openEditPosInfoModal = function (caller, model) {
                //disabled button failed check selectedPOS
                if (caller == 'posinfodetail' && ($scope.selectedPosInfo === null || $scope.selectedPosInfo === undefined || $scope.selectedPosInfo == {})) {
                    tosterFactory.showCustomToast('Selected Pos is undefined. Please select a POS', 'info');
                }
                var editModel = {};
                if (model !== undefined && model !== null) {
                    editModel = model;
                } else {
                    if (caller == 'posinfodetail')
                        editModel = angular.copy(initPosInfoDetailModel);
                    editModel.PosInfoId = $scope.selectedPosInfo.Id;
                }

                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
                var formModel = { entityIdentifier: caller, dropDownObject: $scope.lookupEntities, model: editModel }
                $mdDialog.show({
                    controller: 'EditPosInfoCtrl', templateUrl: '../app/scripts/directives/views-directives/pos-modules/edit-form-modal.html',
                    parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: useFullScreen,
                    resolve: { formModel: function () { return formModel; }, }
                }).then(function (data) {
                    switch (caller) {
                        case 'posinfo': updatePosInfo(data); break;
                        case 'posinfodetail': updatePosInfoDetail(data); break;
                        default:
                    }
                    //$scope.selectedPosInfo = data;
                }, function (fail) { })
            }
            //Function to update PosInfo after edit modal
            function updatePosInfo(model) {
                $scope.loadingPosInfo = true;
                DynamicApiService.putMultiple($scope.masterEntityIdentifier, [model]).then(function (result) {
                    tosterFactory.showCustomToast('New POS "' + model.Description + '" updated successfully.', 'success');
                    cleanDisplayEntities('newModule'); getPosModules();
                }, function (reason) {
                    $scope.loadingPosInfo = false;
                    tosterFactory.showCustomToast($scope.slaveEntityIdentifier + ' entry failed to update.', 'fail');
                    console.log('Fail Load'); console.log(reason);
                }, function (error) {
                    $scope.loadingPosInfo = false;
                    tosterFactory.showCustomToast($scope.slaveEntityIdentifier + ' entry failed to update.', 'error');
                    console.log('Error Load'); console.log(error);
                });
            }
            //Function to update || insert PosInfoDetail after edit modal
            function updatePosInfoDetail(model) {
                $scope.loadingPosInfoDetails = true;
                if (model.Id == 0) {
                    DynamicApiService.postSingle('PosInfoDetail', model).then(function (result) {
                        $scope.getPosInfoDetails($scope.slaveEntityIdentifier, 'page=1&pageSize=200&posInfoId=' + $scope.selectedPosInfo.Id);
                        //$scope.selectPosInfo($scope.selectedPosInfo); //Actually get posinfo details of allready selected as update on view
                        tosterFactory.showCustomToast('New entry "' + model.Description + '" saved successfully.', 'success');
                    }, function (reason) {
                        $scope.loadingPosInfoDetails = false;
                        tosterFactory.showCustomToast(model.Description + ' entry failed to save.', 'fail');
                        console.log('Fail Load'); console.log(reason);
                    }, function (error) {
                        $scope.loadingPosInfoDetails = false;
                        tosterFactory.showCustomToast(model.Description + ' entry errored on save.', 'error');
                        console.log('Error Load'); console.log(error);
                    });
                } else {
                    DynamicApiService.putMultiple('PosInfoDetail', [model]).then(function (result) {
                        $scope.getPosInfoDetails($scope.slaveEntityIdentifier, 'page=1&pageSize=200&posInfoId=' + $scope.selectedPosInfo.Id);
                        //$scope.selectPosInfo($scope.selectedPosInfo); //Actually get posinfo details of allready selected as update on view
                        tosterFactory.showCustomToast('Entry "' + model.Description + '" updated successfully.', 'success');
                    }, function (reason) {
                        $scope.loadingPosInfoDetails = false;
                        tosterFactory.showCustomToast(model.Description + ' entry failed to update.', 'fail');
                        console.log('Fail Load'); console.log(reason);
                    }, function (error) {
                        $scope.loadingPosInfoDetails = false;
                        tosterFactory.showCustomToast(model.Description + ' entry errored on update.', 'error');
                        console.log('Error Load'); console.log(error);
                    });
                }
            }

            //Add new Posinfo Entry via stepWizard
            $scope.setupNewPos = function () {
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
                var formModel = { entityIdentifier: 'posinfo', dropDownObject: $scope.lookupEntities, model: {} }
                $mdDialog.show({
                    controller: 'SetupNewPosCtrl', templateUrl: '../app/scripts/directives/views-directives/pos-modules/setup-new-pos.html',
                    parent: angular.element('#wrapper'),
                    clickOutsideToClose: true,
                    fullscreen: true,
                    resolve: {
                        formModel: function () { return formModel; },
                    }
                }).then(function (data) {
                    DynamicApiService.postAttributeRoutingData($scope.masterEntityIdentifier, 'Add', data).then(function (result) {
                        tosterFactory.showCustomToast('New entry of ' + $scope.masterEntityIdentifier + ' saved successfully.', 'success');
                        cleanDisplayEntities('newModule'); getPosModules();
                    }, function (reason) {
                        $scope.loadingPosInfoDetails = false;
                        tosterFactory.showCustomToast('Failed to insert new ' + $scope.masterEntityIdentifier + ' entry.', 'fail');
                        console.log('Fail Load'); console.log(reason);
                    }, function (error) {
                        $scope.loadingPosInfoDetails = false;
                        tosterFactory.showCustomToast('Error inserting ' + $scope.masterEntityIdentifier + ' entry.', 'error');
                        console.log('Error Load'); console.log(error);
                    });
                }, function (fail) { })
            }
            function cleanDisplayEntities(type) {
                switch (type) {
                    case 'newModule': //$scope.setupNewPos() success call 
                        $scope.PosInfo = []; $scope.groupedPosInfo = {}; $scope.posInfoDetail = {}; $scope.selectedPosInfo = null;
                        break;
                    default:
                        break;
                }
            }
            $scope.deletePosInfo = function (caller, model) {
                var deleteDialog = $mdDialog.confirm().title('Delete ' + ((caller == 'posinfo') ? 'Module' : 'Detail') + ' entry')
                    .textContent('You are about to delete "' + model.Description + '" entry.\n Are you sure ?')
                    .ariaLabel('dynamicrm' + $scope.entityIdentifier).ok('Delete').cancel('Cancel');
                $mdDialog.show(deleteDialog).then(function () {
                    if (caller == 'posinfo') {
                        $scope.loadingPosInfo = true;
                        DynamicApiService.deleteAttributeRoutingData($scope.masterEntityIdentifier, 'DeleteRange', [model.Id]).then(function (result) {
                            tosterFactory.showCustomToast('Pos Info has been deleted Succesfully', 'success');
                            var index = $scope.groupedPosInfo[model.Type].indexOf(model);
                            $scope.groupedPosInfo[model.Type].splice(index, 1);
                            $scope.loadingPosInfo = false;
                        }, function (reason) {
                            $scope.loadingPosInfoDetails = false;
                            tosterFactory.showCustomToast('Deleting Pos Info failed', 'fail');
                            console.log('Fail Load'); console.log(reason);
                        }, function (error) {
                            $scope.loadingPosInfoDetails = false;
                            tosterFactory.showCustomToast('Deleting Pos Info error', 'error');
                            console.log('Error Load'); console.log(error);
                        });
                    } else if (caller == 'posinfodetail') {
                        $scope.loadingPosInfoDetails = true;
                        DynamicApiService.deleteSingle($scope.slaveEntityIdentifier, model.Id).then(function (result) {
                            tosterFactory.showCustomToast('Pos Info Detail has been deleted Succesfully', 'success');
                            var index = $scope.groupedPosInfoDetail[model.GroupId].indexOf(model);
                            $scope.groupedPosInfoDetail[model.GroupId].splice(index, 1);
                            $scope.loadingPosInfoDetails = false;
                        }, function (reason) {
                            $scope.loadingPosInfoDetails = false;
                            tosterFactory.showCustomToast('Deleting Pos Info Detail failed', 'fail');
                            console.log('Fail Load'); console.log(reason);
                        }, function (error) {
                            $scope.loadingPosInfoDetails = false;
                            tosterFactory.showCustomToast('Deleting Pos Info Detail error', 'error');
                            console.log('Error Load'); console.log(error);
                        });
                    }
                });
            }

            $scope.dontDisplaySelected = function (item) {
                if ($scope.selectedPosInfo === undefined || $scope.selectedPosInfo === null) return true;
                else {
                    if (item.Id == $scope.selectedPosInfo.Id) return false;
                }
                return true;

            }
            var initPosInfoDetailModel = {
                "Id": 0, "PosInfoId": null, "Counter": null,
                "Abbreviation": null, "Description": null, "ResetsAfterEod": false,
                "InvoiceId": null, "ButtonDescription": null, "Status": true,
                "CreateTransaction": false, "FiscalType": null, "IsInvoice": false,
                "IsCancel": false, "GroupId": null, "InvoicesTypeId": null, "IsDeleted": false,
                "IsPdaHidden": false, "SendsVoidToKitchen": false,
            }
        }])
