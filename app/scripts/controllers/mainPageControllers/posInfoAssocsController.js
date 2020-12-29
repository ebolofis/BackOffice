'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:PosInfoAssocsController
 * @description
 * # PosInfoAssocsController
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .controller('PosInfoAssocsController', ['$stateParams', '$scope', '$http', '$log', '$timeout', '$q', '$interval', '$uibModal', 'uiGridConstants', 'uiGridGroupingConstants', 'DynamicApiService', 'uiGridFactory', 'uiGridActionManagerFactory', 'dataUtilFactory', 'tosterFactory',
        function ($stateParams, $scope, $http, $log, $timeout, $q, $interval, $uibModal, uiGridConstants, uiGridGroupingConstants, DynamicApiService, uiGridFactory, uiGridActionManagerFactory, dataUtilFactory, tosterFactory) {
            $scope.initView = function () {
                $scope.selectedPos = null;
                $scope.tabSelected = 'Pricelists';
                var KdsPromise = $scope.getDropDownLookUps('Kds');
                var PriceListPromise = $scope.getDropDownLookUps('PriceList');
                var StaffPositionPromise = $scope.getDropDownLookUps('StaffPosition');
                var RegionPromise = $scope.getDropDownLookUps('Region');
                var RegionPromise = $scope.getDropDownLookUps('KitchenInstruction');
                //When all lookUps finished loading 
                $q.all([KdsPromise, PriceListPromise, StaffPositionPromise, RegionPromise]).then(function () {
                    var PosInfoPromise = $scope.getDropDownLookUps('PosInfo'); //get pagged Results of Products
                    tosterFactory.showCustomToast('lookup entities resolved successfully', 'success');
                    $scope.showgrid = true;
                });
            }
            //Function switched by entity called with External Params 
            //Fills LookUps Data and grids Data rows
            $scope.getDropDownLookUps = function (entity, customparams) {
                switch (entity) {
                    case 'Kds': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                        $scope.kds = result.data;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Loading Kds Lookups failed', 'fail'); console.log('Error Load'); console.log(reason);
                    })); break;

                    case 'PriceList': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                        $scope.priceLists = result.data;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Loading PriceList Lookups failed', 'fail'); console.log('Error Load'); console.log(reason);
                    })); break;

                    case 'StaffPosition': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                        $scope.staffPositions = result.data;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Loading StaffPosition Lookups failed', 'fail'); console.log('Error Load'); console.log(reason);
                    })); break;

                    case 'Region': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                        $scope.regions = result.data;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Loading Region Lookups failed', 'fail'); console.log('Error Load'); console.log(reason);
                    })); break;
                    case 'KitchenInstruction': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                        $scope.kitchenInstructions = result.data;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Loading KitchenInstruction Lookups failed', 'fail'); console.log('Error Load'); console.log(reason);
                    })); break;

                    case 'PosInfo': return (
                        //DynamicApiService.getDynamicObjectData("PosInfo", '')
                        DynamicApiService.getAttributeRoutingData("PosInfo", "GetAll", "", "")
                            .then(function (result) {
                                tosterFactory.showCustomToast('Pos Info  loaded successfully', 'success');
                                $scope.posInfo = result.data;
                                var ret = dataUtilFactory.createEnumsAndEnumObjs($scope.staffPositions, {}, {}, 'Id', 'Description');
                                $scope.posInfoEnum = ret.retEnum;
                                $scope.posInfoEnumObj = ret.retEnumObj;
                            }, function (reason) {
                                tosterFactory.showCustomToast('Loading posInfo Lookups failed', 'fail'); console.log('Error Load'); console.log(reason);
                            })); break;
                    default: break;
                }
            }

            $scope.includeOptions = function (option) {
                var res = [], selected = [];
                var insObj = {
                    Id: 0,
                    PosInfoId: $scope.selectedPos.Id,
                    PosInfoDescription: $scope.selectedPos.Description,
                    IsDeleted: false
                }
                switch (option) {
                    case 'Pricelists':
                        selected = $scope.priceLists.filter(function (it) { return (it.selected == true); })
                        $scope.priceLists = $scope.priceLists.filter(function (it) { it.selected = false; return it; })

                        angular.forEach(selected, function (item) {
                            res = $scope.selectedPos.AssosiatedPricelists.filter(function (value) { return (value.PricelistId == item.Id); });
                            if (res.length == 0) {
                                var tmp = angular.copy(insObj);
                                tmp.PricelistId = item.Id; tmp.PricelistDescription = item.Description;

                                tmp.IsEdited = true; $scope.selectedPos.IsEdited = true;
                                $scope.selectedPos.AssosiatedPricelists.push(tmp);
                            } //insert  new entry
                            if (res.length == 1) {
                                if (res[0].IsDeleted == true) {
                                    res[0].IsEdited = true; res[0].IsDeleted = false;
                                    $scope.selectedPos.IsEdited = true;
                                } else { alert('res.length == 1  && res[0].IsDeleted != true  in ' + option) }
                            }
                            if (res.length > 1) {
                                console.log('Res.length > 1 on ' + option); console.log(res);
                            };
                        })
                        break;
                    case 'StaffPositions':
                        selected = $scope.staffPositions.filter(function (it) { return (it.selected == true); })
                        $scope.staffPositions = $scope.staffPositions.filter(function (it) { it.selected = false; return it; })
                        angular.forEach(selected, function (item) {
                            res = $scope.selectedPos.AssosiatedStaffPositions.filter(function (value) { return (value.StaffPositionId == item.Id); })
                            if (res.length == 0) {
                                var tmp = angular.copy(insObj);
                                tmp.StaffPositionId = item.Id; tmp.StaffPositionDescription = item.Description;
                                tmp.IsEdited = true; $scope.selectedPos.IsEdited = true;
                                $scope.selectedPos.AssosiatedStaffPositions.push(tmp);
                            } //insert  new entry
                            if (res.length == 1) {
                                if (res[0].IsDeleted == true) {
                                    res[0].IsEdited = true; res[0].IsDeleted = false;
                                    $scope.selectedPos.IsEdited = true;
                                } else { alert('res.length == 1  && res[0].IsDeleted != true  in ' + option) }
                            }
                            if (res.length > 1) {
                                console.log('Res.length > 1 on ' + option); console.log(res);
                            };
                        })
                        break;
                    case 'Kds':
                        selected = $scope.kds.filter(function (it) { return (it.selected == true); })
                        $scope.kds = $scope.kds.filter(function (it) { it.selected = false; return it; })
                        angular.forEach(selected, function (item) {
                            res = $scope.selectedPos.AssosiatedKDS.filter(function (value) { return (value.KdsId == item.Id); })
                            if (res.length == 0) {
                                var tmp = angular.copy(insObj);
                                tmp.KdsId = item.Id; tmp.KdsDescription = item.Description;
                                tmp.IsEdited = true; $scope.selectedPos.IsEdited = true;
                                $scope.selectedPos.AssosiatedKDS.push(tmp);
                            } //insert  new entry
                            if (res.length == 1) {
                                if (res[0].IsDeleted == true) {
                                    res[0].IsEdited = true; res[0].IsDeleted = false;
                                    $scope.selectedPos.IsEdited = true;
                                }
                            }
                            if (res.length > 1) {
                                console.log('Res.length > 1 on ' + option); console.log(res);
                            };
                        })
                        break;
                    case 'Regions':
                        selected = $scope.regions.filter(function (it) { return (it.selected == true); })
                        $scope.regions = $scope.regions.filter(function (it) { it.selected = false; return it; })
                        angular.forEach(selected, function (item) {
                            res = $scope.selectedPos.AssosiatedRegions.filter(function (value) { return (value.RegionId == item.Id); })
                            if (res.length == 0) {
                                var tmp = angular.copy(insObj);
                                tmp.RegionId = item.Id; tmp.RegionDescription = item.Description;

                                tmp.IsEdited = true; $scope.selectedPos.IsEdited = true;
                                $scope.selectedPos.AssosiatedRegions.push(tmp);
                            } //insert  new entry
                            if (res.length == 1) {
                                if (res[0].IsDeleted == true) {
                                    res[0].IsEdited = true; res[0].IsDeleted = false;
                                    $scope.selectedPos.IsEdited = true;
                                }
                            }
                            if (res.length > 1) {
                                console.log('Res.length > 1 on ' + option); console.log(res);
                            };
                        })
                        break;
                    case 'KitchenInstruction':
                        selected = $scope.kitchenInstructions.filter(function (it) { return (it.selected == true); })
                        $scope.kitchenInstructions = $scope.kitchenInstructions.filter(function (it) { it.selected = false; return it; })
                        angular.forEach(selected, function (item) {
                            res = $scope.selectedPos.AssosiatedKitchenInstructions.filter(function (value) { return (value.KitchenInstructionId == item.Id); })
                            if (res.length == 0) {
                                var tmp = angular.copy(insObj);
                                tmp.KitchenInstructionId = item.Id; tmp.KitchenInstructionDescription = item.Description;
                                tmp.IsEdited = true; $scope.selectedPos.IsEdited = true;
                                $scope.selectedPos.AssosiatedKitchenInstructions.push(tmp);
                            } //insert  new entry
                            if (res.length == 1) {
                                if (res[0].IsDeleted == true) {
                                    res[0].IsEdited = true; res[0].IsDeleted = false;
                                    $scope.selectedPos.IsEdited = true;
                                }
                            }
                            if (res.length > 1) {
                                console.log('Res.length > 1 on ' + option); console.log(res);
                            };
                        })
                        break;
                    default: alert('Error on Including options entity not found'); break;

                }
            }
            $scope.excludeOptions = function (option) {
                switch (option) {
                    case 'Pricelists':
                        $scope.selectedPos.AssosiatedPricelists = $scope.selectedPos.AssosiatedPricelists.filter(function (it) {
                            if (it.selected == true) {
                                it.IsDeleted = true; it.IsEdited = true; $scope.selectedPos.IsEdited = true; it.selected = false;
                            }
                            return it;
                        })
                        break;

                    case 'StaffPositions':
                        $scope.selectedPos.AssosiatedStaffPositions = $scope.selectedPos.AssosiatedStaffPositions.filter(function (it) {
                            if (it.selected == true) {
                                it.IsDeleted = true; it.IsEdited = true; $scope.selectedPos.IsEdited = true; it.selected = false;
                            }
                            return it;
                        })
                        break;

                    case 'Kds':
                        $scope.selectedPos.AssosiatedKDS = $scope.selectedPos.AssosiatedKDS.filter(function (it) {
                            if (it.selected == true) {
                                it.IsDeleted = true; it.IsEdited = true; $scope.selectedPos.IsEdited = true; it.selected = false;
                            }
                            return it;
                        })
                        break;
                    case 'Regions':
                        $scope.selectedPos.AssosiatedRegions = $scope.selectedPos.AssosiatedRegions.filter(function (it) {
                            if (it.selected == true) {
                                it.IsDeleted = true; it.IsEdited = true; $scope.selectedPos.IsEdited = true; it.selected = false;
                            }
                            return it;
                        })
                        break;
                    case 'KitchenInstruction':
                        $scope.selectedPos.AssosiatedKitchenInstructions = $scope.selectedPos.AssosiatedKitchenInstructions.filter(function (it) {
                            if (it.selected == true) {
                                it.IsDeleted = true; it.IsEdited = true; $scope.selectedPos.IsEdited = true; it.selected = false;
                            }
                            return it;
                        })
                        break;
                    default: alert('Error on Including options entity not found'); break;
                }
            }
            $scope.clickSelectPosInfo = function (item) {
                $scope.selectedPos = item;
            }
            $scope.includedFilter = function (item) {
                return (item.IsDeleted == true) ? false : true;
            }
            $scope.availablePlsFilter = function (item) {
                if ($scope.selectedPos === undefined || $scope.selectedPos === null) return true;
                var res = $scope.selectedPos.AssosiatedPricelists.filter(function (value) { return (value.PricelistId == item.Id); })
                return commonFilter(res);
            }
            $scope.availableStpFilter = function (item) {
                if ($scope.selectedPos === undefined || $scope.selectedPos === null) return true;
                var res = $scope.selectedPos.AssosiatedStaffPositions.filter(function (value) { return (value.StaffPositionId == item.Id); })
                return commonFilter(res);
            }
            $scope.availableKdsFilter = function (item) {
                if ($scope.selectedPos === undefined || $scope.selectedPos === null) return true;
                var res = $scope.selectedPos.AssosiatedKDS.filter(function (value) { return (value.KdsId == item.Id); })
                return commonFilter(res);
            }
            $scope.availableRegFilter = function (item) {
                if ($scope.selectedPos === undefined || $scope.selectedPos === null) return true;
                var res = $scope.selectedPos.AssosiatedRegions.filter(function (value) { return (value.RegionId == item.Id); })
                return commonFilter(res);
            }
            $scope.availableKinstFilter = function (item) {
                if ($scope.selectedPos === undefined || $scope.selectedPos === null) return true;
                var res = $scope.selectedPos.AssosiatedKitchenInstructions.filter(function (value) { return (value.KitchenInstructionId == item.Id); })
                return commonFilter(res);
            }
            function commonFilter(res) {
                if (res.length == 0) return true;
                else if (res.length == 1) {
                    if (res[0].IsDeleted == true) return true;
                    else return false;
                } else alert('Critical Filter Error');
            }
            $scope.savePosInfoAssocs = function () {
                var editedEntries = $scope.posInfo.filter(function (item) { return (item.IsEdited == true) })
                if (editedEntries.length > 0) {
                    $scope.savingProcess = true;
                    var modifiedObjs = editedEntries.filter(function (item) {
                        item.AssosiatedKDS = editedAssosiatedFilter(item.AssosiatedKDS);
                        item.AssosiatedKitchenInstructions = editedAssosiatedFilter(item.AssosiatedKitchenInstructions);
                        item.AssosiatedPricelists = editedAssosiatedFilter(item.AssosiatedPricelists);
                        item.AssosiatedRegions = editedAssosiatedFilter(item.AssosiatedRegions);
                        item.AssosiatedStaffPositions = editedAssosiatedFilter(item.AssosiatedStaffPositions);
                        return item;
                    })
                    DynamicApiService.putAttributeRoutingDataParamStoreId('PosInfo', 'UpdatePage', modifiedObjs).then(function (result) { //Rest Get call for data using Api service to call Webapi
                        $scope.savingProcess = false;
                        tosterFactory.showCustomToast('Pos Info updated successfully. Loading PosInfo..', 'success');
                        $scope.getDropDownLookUps('PosInfo'); $scope.selectedPos = null;
                    }, function (reason) {
                        $scope.savingProcess = false;
                        tosterFactory.showCustomToast('Updating Pos Info failed.', 'fail');
                    });
                } else {
                    tosterFactory.showCustomToast('No changes to save.', 'info');
                }
            }
            function editedAssosiatedFilter(arr) {
                var ret = arr.filter(function (item) {
                    if (((item.Id == 0 && item.IsDeleted != true) || (item.Id != 0 && item.IsDeleted == true)) && item.IsEdited == true)
                        return item;
                })
                return ret;
            }
            $scope.badgeLength = function (arr, edited) {
                var ret = arr.filter(function (item) { return (item.IsDeleted != true); });
                return ret.length;
            }

        }])
