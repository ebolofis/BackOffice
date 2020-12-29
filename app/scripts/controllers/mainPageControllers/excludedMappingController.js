'use strict';
/**
 * @ngdoc function
 * @name ExcludedMappingCtrl
 * @description
 * # ExcludedMappingCtrl used to manage Excluded Accounts && Excluded Pricelist
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .controller('ExcludedMappingCtrl', ['tosterFactory', '$stateParams', '$scope', '$http', '$log', '$timeout', '$q', '$interval', '$uibModal', 'uiGridConstants', 'uiGridGroupingConstants', 'DynamicApiService', 'GridInitiallization', 'uiGridFactory', 'dataUtilFactory',
        function (tosterFactory, $stateParams, $scope, $http, $log, $timeout, $q, $interval, $uibModal, uiGridConstants, uiGridGroupingConstants, DynamicApiService, GridInitiallization, uiGridFactory, dataUtilFactory) {
            $scope.initView = function () {
                $scope.masterGroupObjects = {}; $scope.currentLoadedContainer = null; $scope.selectedPosInfo = null;
                $scope.posInfoDetail = []; $scope.posInfoDetailsNestedObjects = {};
                $scope.transferList = null; $scope.transferListLoaded = null;
                $scope.excludedEntities = {};
                $scope.selectedContainer = null;
                $scope.selectedObj = null;
                $scope.tabSelected = null;
                var posInfoDetailPromise = $scope.getDropDownLookUps('PosInfoDetail');
                var posInfoPromise = $scope.getDropDownLookUps('PosInfo');
                var transferListPromise = $scope.getDropDownLookUps('transferList');
                var excludedEntities = $scope.getDropDownLookUps('ExcludedEntities'); //get pagged Results of Products
                //When all lookUps finished loading 
                $q.all([posInfoPromise, posInfoDetailPromise, transferListPromise, excludedEntities]).then(function () {
                    tosterFactory.showCustomToast('All lookup entities resolved', 'success');
                    runInitDisplayValues();
                    //GET api/{storeId}/ExcludedPricelists/GetAll
                });
            }
            //Function switched by entity called with External Params 
            //Fills LookUps Data and grids Data rows
            $scope.getDropDownLookUps = function (entity, customparams) {
                switch (entity) {
                    case 'PosInfo': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                        $scope.posInfo = result.data;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Loading posInfo lookups failed', 'fail');
                        console.log('Error Load'); console.log(reason);
                    })); break;

                    case 'PosInfoDetail': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                        $scope.posInfoDetail = result.data;
                        $scope.posInfoDetailsNestedObjects = createGroupRefs(result.data);

                    }, function (reason) {
                        tosterFactory.showCustomToast('Loading posInfoDetail lookups failed', 'fail');
                        console.log('Error Load'); console.log(reason);
                    })); break;

                    case 'transferList':
                        var ctrlName = $scope.transferListEntity;
                        return (DynamicApiService.getDynamicObjectData(ctrlName, '').then(function (result) {
                            $scope.transferList = result.data;
                            $scope.transferListLoaded = angular.copy($scope.transferList);
                            $scope.transferListEnum = dataUtilFactory.createEnums(result.data, {}, 'Id', 'Description');;
                        }, function (reason) {
                            tosterFactory.showCustomToast('Loading transferList "' + $scope.transferListEntity + '" lookups failed.', 'fail');
                            console.log('Error Load'); console.log(reason);
                        })); break;

                    case 'ExcludedEntities':
                        var ctrlName = $scope.transferListController; //<-- dynamic use of this 
                        return (DynamicApiService.getAttributeRoutingData(ctrlName, "GetAll", "", "").then(function (result) {
                            $scope.excludedEntities = createGroupRefs(result.data); console.log($scope.excludedEntities);
                        }, function (reason) {
                            tosterFactory.showCustomToast('Loading ExcludedEntities lookups failed.', 'fail');
                            console.log('Error Load'); console.log(reason);
                        })); break;
                    default: break;
                }
            }
            function createGroupRefs(array) {
                var pigroups = dataUtilFactory.groupTo(array, $scope.transferListMastergroup); //'PosInfoId' //group results by mastergroup Entity
                var res = {}
                angular.forEach(pigroups, function (value, key) {
                    var tmp = dataUtilFactory.groupTo(value, $scope.transferListSecondGroup); //'GroupId' //group results by SecondGroup Entity
                    res[key] = tmp;
                })
                return res;
            }
            function runInitDisplayValues() {
                $scope.masterGroupObjects = {}
                angular.forEach($scope.posInfoDetailsNestedObjects, function (value, key) {
                    var tmpObj = {
                        PosInfoId: Number(key),
                        EntriesByGroupId: value,
                        ExcludedEntities: {},
                        FilterList: [],
                        TabsEnum: [],
                        TabArray: [],
                        IsEdited: false
                    }
                    //create tab
                    angular.forEach(value, function (item, gid) {
                        var ctab = {
                            tabId: Number(gid), tabDesc: item[0].Abbreviation,
                            display: true, filtered: false
                        }
                        tmpObj.TabArray.push(ctab);
                        var enm = {}; enm[gid] = item[0].Abbreviation;
                        tmpObj.TabsEnum = angular.extend(tmpObj.TabsEnum, enm);
                    })
                    //create all b Enums
                    angular.forEach(tmpObj.TabsEnum, function (tc, teId) {
                        var gto = {}; gto[teId] = [];
                        tmpObj.ExcludedEntities = angular.extend(tmpObj.ExcludedEntities, gto);
                    })
                    tmpObj.ExcludedEntities = angular.extend(tmpObj.ExcludedEntities, $scope.excludedEntities[tmpObj.PosInfoId]);
                    tmpObj.FilterList = createExcludedFilters(tmpObj.ExcludedEntities);
                    var ext = {}; ext[key] = tmpObj
                    $scope.masterGroupObjects = angular.extend($scope.masterGroupObjects, ext);
                })
            }
            function createExcludedFilters(objCall) {
                var ret = {}
                angular.forEach(objCall, function (value, key) {
                    //Key == tab id
                    //Value  == array of registers
                    if (ret[key] === undefined) {
                        ret[key] = [];
                        var exGroup = dataUtilFactory.groupTo(value, $scope.transferListField);
                        angular.forEach(exGroup, function (mull, mkey) {
                            var tmp = {
                                Id: Number(mkey), //PricelistId
                                Description: $scope.transferListEnum[mkey],
                                Loaded: true
                            }
                            ret[key].push(tmp);
                        });
                    }
                    else {
                        tosterFactory.showCustomToast('Error on createExcludedFilters', 'warning');
                        console.log('Error on createExcludedFilters');
                    }
                })
                return ret;
            }
            $scope.clickSelectPosInfo = function (cpos) {
                if ($scope.currentLoadedContainer !== undefined && $scope.currentLoadedContainer !== null && $scope.currentLoadedContainer.IsEdited == true) {
                    tosterFactory.showCustomToast('Current POS "' + $scope.selectedPosInfo.Description + '" has unsaved changes.', 'warning');
                    return;
                }
                $scope.selectedPosInfo = cpos;
                $scope.currentLoadedContainer = $scope.masterGroupObjects[$scope.selectedPosInfo.Id]; //masterGroupOBJ init
                $scope.selectedContainer = $scope.currentLoadedContainer//$scope.excludedEntities[$scope.selectedPosInfo.Id];
            }
            //Excluded Loaded VS selected Container Action
            $scope.tabChange = function (tkey) {
                $scope.tabSelected = tkey;
            }
            //event to redisplay TransferModel array by filter 
            $scope.$watch('tabSelected', function (newValue, oldValue) {
                if ($scope.transferListLoaded !== undefined && $scope.selectedContainer !== null && $scope.selectedContainer.FilterList !== undefined) {
                    $scope.selectedObj = $scope.selectedContainer.FilterList[newValue];
                    $scope.transferList = $scope.availablePlsFilter();
                }
            });
            $scope.availablePlsFilter = function () {
                var ret = angular.copy($scope.transferListLoaded)
                if ($scope.selectedObj === undefined || $scope.selectedObj === null || $scope.selectedObj.length == 0)
                    return ret;
                ret = ret.filter(function (item) {
                    var indexes = $scope.selectedObj.filter(function (ind) { return (ind.Id == item.Id); })
                    if (indexes.length == 0) return item;
                    if (indexes.length > 1) {
                        alert('Critical Error double excluded found on availablePlsFilter. Desc:Impossible');
                        return null;
                    }
                })
                return ret;
            }
            //Include Entity from Loaded Drop Down
            $scope.includeEntity = function () {
                var selected = $scope.transferList.filter(function (item) { return (item.selected == true); });
                angular.forEach(selected, function (value) {
                    var excludedObj = {
                        Id: value.Id,
                        Description: value.Description,
                        selected: false
                    }
                    $scope.selectedObj.push(excludedObj);
                })
                if (selected.length > 0)
                    $scope.currentLoadedContainer.IsEdited = true;
                $scope.transferList = $scope.availablePlsFilter();
            }
            //Excluded Action Button 
            $scope.removeEntity = function () {
                //var selected = $scope.transferList;
                if ($scope.selectedObj.length > 0)
                    $scope.currentLoadedContainer.IsEdited = true;
                var filtered = $scope.selectedObj.filter(function (item) { return (item.selected != true); });
                $scope.selectedObj = $scope.currentLoadedContainer.FilterList[$scope.tabSelected] = filtered;
                $scope.transferList = $scope.availablePlsFilter();
            }
            $scope.savePosInfoAssocs = function () {
                if ($scope.currentLoadedContainer === undefined || $scope.currentLoadedContainer === null) {
                    tosterFactory.showCustomToast('Select a valid POS info to manage.', 'info');
                    return;
                }

                //running FilterList
                var saveArray = [];
                var cContainer = $scope.currentLoadedContainer;
                if (cContainer === undefined || cContainer === null || cContainer.TabsEnum === undefined || cContainer.TabsEnum === null) {
                    tosterFactory.showCustomToast('Can not manage current container or tab', 'warning');
                    return;
                }
                $scope.savingProcess = true;
                angular.forEach(cContainer.TabsEnum, function (abbr, tab) {
                    var lists = cContainer.FilterList[tab].map(function (it) { return it.Id; });
                    //mark is deleted
                    var toBeDelete = []
                    toBeDelete = cContainer.ExcludedEntities[tab].filter(function (item) {
                        var foundOnlist = lists.indexOf(item[$scope.transferListField]);
                        if (foundOnlist == -1) {
                            item.IsDeleted = true;
                            return item;
                        }
                    })
                    //exlist to Add  ==  allExcluded - regs in Use for this exEntities
                    var listToAdd = lists.filter(function (currentId) {
                        var regs = cContainer.ExcludedEntities[tab].filter(function (entity) {
                            return (entity[$scope.transferListField] == currentId);
                        })
                        if (regs.length == 0) return currentId;
                    })
                    var tmpObj = {
                        Id: 0,
                        IsDeleted: false,
                        GroupId: tab,
                        PosInfoId: cContainer.PosInfoId,
                        PosInfoDetailId: null,
                    }
                    var entriesToAdd = [];
                    angular.forEach(listToAdd, function (exId) {
                        var toAddEx = angular.copy(tmpObj);
                        toAddEx[$scope.transferListField] = exId;
                        angular.forEach(cContainer.EntriesByGroupId[tab], function (value) {
                            var newEntry = angular.copy(toAddEx);
                            newEntry.PosInfoDetailId = value.Id //<--current posInfoId
                            entriesToAdd.push(newEntry);
                        })
                    })
                    saveArray = saveArray.concat(toBeDelete);
                    saveArray = saveArray.concat(entriesToAdd);
                })
                if (saveArray.length > 0) {
                    DynamicApiService.putAttributeRoutingData($scope.transferListController, 'Update', saveArray).then(function (result) {
                        $scope.savingProcess = false;
                        tosterFactory.showCustomToast('Excluded Entities saved successfully', 'success');
                        $scope.initView();
                    }, function (result) {
                        tosterFactory.showCustomToast('Save Excluded entities failed', 'fail');
                        console.log('Error Load'); console.log(reason);
                        $scope.savingProcess = false;
                    });
                } else {
                    tosterFactory.showCustomToast('No entries to Save', 'info');
                    $scope.savingProcess = false;
                }
            }
        }]);