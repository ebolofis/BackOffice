'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:masterSlaveGridController
 * @description
 * # masterSlaveGridController
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .controller('MasterSlaveGridController', MasterSlaveGridController)
    .directive('customMultiselectCell', ['$document', 'uiGridConstants', 'uiGridEditConstants', function ($document, uiGridConstants, uiGridEditConstants) {
        return {
            scope: {
                dropArray: '=',
                toSelectModel: '=',
                matchProperty: '@',
                modarr: '=?'
            },
            template: '<div><isteven-multi-select input-model="modarr" output-model="model" on-item-click="print()" button-label="Description" item-label="Description" on-close="funcClose()" tick-property="ticked"></isteven-multi-select></div>',
            //controller: 'CustomMultiselectCellCtrl',
            restrict: 'AE',
            require: ['?^uiGrid', '?^uiGridRenderContainer'],
            compile: function (tElement, tAttrs, transclude) {
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) {
                        var prep;
                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        scope.modarr = markeSelected();
                        scope.model = angular.copy(scope.toSelectModel);

                        function markeSelected() {
                            var retarr = []
                            angular.forEach(scope.dropArray, function (value) {
                                var fil = scope.toSelectModel.filter(function (item) {
                                    return value.Id == item[scope.matchProperty];
                                });
                                (fil.length > 0) ? value.ticked = true : value.ticked = false;
                                var obj = angular.copy(value);
                                retarr.push(obj);
                            })
                            return retarr;
                        }
                        scope.print = function () {
                            console.log(scope.model);
                        }
                        scope.funcClose = function () {
                            //scope.toSelectModel = [];
                            //scope.toSelectModel = angular.copy(scope.model);
                            //scope.$apply();
                            //scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                        }
                        var uiGridCtrl = controller[0];
                        var onWindowClick = function (evt) {
                            var classNamed = angular.element(evt.target).attr('class');
                            var inDirective = (classNamed.indexOf('msDropdownCell') > -1);
                            if (!inDirective) {
                                scope.stopEdit(evt);
                            }
                        };

                        var onCellClick = function (evt) {
                            console.log('click')
                            angular.element(document.querySelectorAll('.msDropdownCell')).off('click', onCellClick);
                            scope.stopEdit(evt);
                        };

                        scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                            if (uiGridCtrl.grid.api.cellNav) {
                                uiGridCtrl.grid.api.cellNav.on.navigate(scope, function (newRowCol, oldRowCol) {
                                    //scope.funcClose();
                                    scope.stopEdit();
                                });
                            } else {
                                angular.element(document.querySelectorAll('.msDropdownCell')).on('click', onCellClick);
                            }
                            //angular.element(window).on('click', onWindowClick);
                        });

                        //scope.$on('$destroy', function () {
                        //    angular.element(window).off('click', onWindowClick);
                        //});

                        scope.stopEdit = function (evt) {
                            scope.toSelectModel = [];
                            scope.toSelectModel = angular.copy(scope.model);
                            scope.$apply();
                            scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                        };
                    }
                }
            },
            link: function ($scope, $elm, $attr) {
                $document.on('click', docClick);

                function docClick(evt) {
                    if ($(evt.target).closest('.msDropdownCell').size() === 0) {
                        //alert('bam');
                        $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                        $document.off('click', docClick);
                    }
                }
            },
            replace: true
        }
    }])
function MasterSlaveGridController(tosterFactory, $stateParams, $scope, $http, $log, $timeout, $q, $mdDialog, $mdMedia, $interval, $uibModal, uiGridConstants, uiGridGroupingConstants, DynamicApiService, GridInitiallization, uiGridFactory, uiGridActionManagerFactory, dataUtilFactory) {
    $scope.masterGridTitle = "Manage Your Modules"; $scope.slaveGridTitle = "Manage Module Details";
    $scope.initView = function () {

        $scope.masterGrid = {}; $scope.slaveGrid = {};
        //master & slave schemas, forms, entities
        $scope.masterSFModel = {}; $scope.slaveSFModel = {};
        // master & slave Action Info
        $scope.masterActionInfo; $scope.slaveActionInfo;
        // master & slave Action Info
        $scope.masterHandledActions; $scope.slaveHandledActions;
        //unique Lookups object //slave not used yet
        $scope.dynamicEnumObjMaster = {}; $scope.dynamicEnumObjSlave = {};
        //suppose to have object of { dependencyName , data } related to Column  //= $scope.masterFiltersObjArray; $scope.slaveFiltersObjArray;
        $scope.filtersObjArray = []; $scope.masterFiltersObjArray = []; $scope.slaveFiltersObjArray = [];//<--- add all filters from lookups here
        //= Object.getOwnPropertyNames(result.data.LookUpEntities);
        $scope.entityArray = []; $scope.masterEntityArray = []; $scope.slaveEntityArray = [];
        $scope.initializedMaster = false;
        $scope.initializedSlave = false;


        //grid last row selections //used to remove selected rows and actions on gridApi functions
        $scope.lastMasterSelectedRow = null; $scope.lastSlaveSelectedRow = null;
        $scope.masterPaginationOptions = { pageNumber: 1, pageSize: 25, sort: null }; $scope.slavePaginationOptions = { pageNumber: 1, pageSize: 25, sort: null };

        $scope.stepWizardFormArray = [];
        $scope.stepWizardModel = {
            modelStep: 0, modelStepName: '', modelEntity: '', //dbtable/controllerref
            gridOwner: 'master', //master / slave
            modelFormName: 'formPosInfoStep1',//<-- this is going to be an element form Entity via modal name="modelFormName"
            schema: null, form: null, entity: null,
        }
        $scope.singleFormModel = {};

        //dependency of Master (selected) --> Slave getDataBy(masterSlaveDep) field
        $scope.masterSlaveDep = "PosInfoId";
        //used to Slave's Controller Singature 
        $scope.slaveGetParam = "posInfoId";
        //slave Data to Array due to rowSelection Get on master grid // temp store of slaveGrid Data to manupulate actions between grids
        $scope.slaveDataLoaded = [];
        $scope.columnMasterDependencies = []; $scope.columnSlaveDependencies = [];
        $scope.columnDependencies = [];
        $scope.masterGridParams = [];//dynamic grid params //array of  objs { key:"" , value:""}

    }()

    $scope.handleException = function (grid, rowEntity, colDef, newValue, oldValue) {
        if (grid == 'slave' && colDef.field == 'InvoicesTypeId' && $scope.masterEntityIdentifier == 'PosInfo' && $scope.slaveEntityIdentifier == 'PosInfoDetail') {
            var toUp = $scope.slaveFiltersObjArray[colDef.field].filter(function (item) {
                return item.Key == newValue;
            });
            if (toUp.length > 1) alert('Impossible Error.\n InvoiceTypes with multiple Id regs.')
            else rowEntity['GroupId'] = toUp[0].Type;
        }
        return rowEntity;
    }

    //init function calls all functions to create a grid
    $scope.initGrid = function (tableType, apiControllerName, parameters) {
        //init master Grid 
        //initView();
        var masterGridGenerated = GridInitiallization.initMSGridParams($scope.masterEntityIdentifier); //TEMP  pseydo obj from factory to manage columns 
        //extend gris with params && columns
        angular.extend($scope.masterGrid, masterGridGenerated.gParams, masterGridGenerated.gColumns);
        $scope.masterSFModel = masterGridGenerated.gSFModel;
        $scope.masterActionInfo = masterGridGenerated.gEditModel;
        //Prevent header actions of grid
        angular.forEach($scope.masterGrid.columnDefs, function (value) {
            var tmp = { groupingShowAggregationMenu: false, groupingShowGroupingMenu: false, enableHiding: false }
            angular.extend(value, tmp);
        });

        var slaveGridGenerated = GridInitiallization.initMSGridParams($scope.slaveEntityIdentifier);
        angular.extend($scope.slaveGrid, slaveGridGenerated.gParams, slaveGridGenerated.gColumns);
        $scope.slaveSFModel = slaveGridGenerated.gSFModel;
        $scope.slaveActionInfo = slaveGridGenerated.gEditModel;
        angular.forEach($scope.slaveGrid.columnDefs, function (value) {
            var tmp = { groupingShowAggregationMenu: false, groupingShowGroupingMenu: false, enableHiding: false }
            angular.extend(value, tmp);
        });
        //init master Grid 
        var masterchain = DynamicApiService.getDynamicGridModel($scope.masterEntityIdentifier).then(function (result) { //Rest Get call for data using Api service to call Webapi
            if (result.data.SimpleGrid == null || result.data.LookUpEntities == null) {
                console.log('managing master ended'); return;
            }
            (result.data.SimpleGrid.ColumnDependencies == undefined || result.data.SimpleGrid.ColumnDependencies == null || result.data.SimpleGrid.ColumnDependencies == "") ?
                $scope.columnMasterDependencies = [] : $scope.columnMasterDependencies = JSON.parse(result.data.SimpleGrid.ColumnDependencies);

            if (result.data.LookUpEntities != null && result.data.LookUpEntities != undefined) {
                $scope.masterFiltersObjArray = result.data.LookUpEntities; //<--- add all filters from lookups here
                $scope.masterEntityArray = Object.getOwnPropertyNames($scope.masterFiltersObjArray);
                $scope.manageDependencies('master');
            }   //possible error on loading lookups ... check ColumnDependencies.enumIdentifier with EntitiesForLookUpFactoryEnum.enumIdentifier and lookup Funs
            else {
                tosterFactory.showCustomToast('Failed to load Master lookup entities', 'fail');
            }
            //fill select form totalMAPS (dropdown fields  , multiselect , etc dependencies)
            angular.forEach($scope.masterSFModel, function (value) {
                value.form = uiGridFactory.transformDropDownSelect($scope.masterFiltersObjArray, value.form);
            });
        })
        //init slave grid
        var slavechain = DynamicApiService.getDynamicGridModel($scope.slaveEntityIdentifier).then(function (result) { //Rest Get call for data using Api service to call Webapi
            if (result.data.SimpleGrid == null || result.data.LookUpEntities == null) { console.log('managing slave ended'); return; }
            (result.data.SimpleGrid.ColumnDependencies == undefined || result.data.SimpleGrid.ColumnDependencies == null || result.data.SimpleGrid.ColumnDependencies == "") ?
                $scope.columnSlaveDependencies = [] : $scope.columnSlaveDependencies = JSON.parse(result.data.SimpleGrid.ColumnDependencies);

            if (result.data.LookUpEntities != null && result.data.LookUpEntities != undefined) {
                $scope.slaveFiltersObjArray = result.data.LookUpEntities; //<--- add all filters from lookups here

                if ($scope.slaveEntityIdentifier == 'PosInfoDetail') {
                    var extend = { InvoiceId: angular.copy($scope.slaveFiltersObjArray['InvoicesTypeId']) }
                    $scope.slaveFiltersObjArray = angular.extend($scope.slaveFiltersObjArray, extend);
                }

                $scope.slaveEntityArray = Object.getOwnPropertyNames($scope.slaveFiltersObjArray);
                $scope.manageDependencies('slave');
            }//possible error on loading lookups ... check ColumnDependencies.enumIdentifier with EntitiesForLookUpFactoryEnum.enumIdentifier and lookup Funs
            else {
                tosterFactory.showCustomToast('Failed to load Slavel lookup entities', 'fail');
            }
            angular.forEach($scope.slaveSFModel, function (value) {
                value.form = uiGridFactory.transformDropDownSelect($scope.slaveFiltersObjArray, value.form);
            });
            console.log('managing slave ended');
        })

        //    then(success), twochain = two.promise.then(success), threechain = three.promise.then(success).then(success).then(success);
        $q.all([masterchain, slavechain]).then(function () {
            //$scope.columnMasterDependencies = $scope.columnMasterDependencies; //$scope.columnSlaveDependencies;

            $scope.filtersObjArray = $scope.filtersObjArray.concat($scope.masterFiltersObjArray);
            $scope.filtersObjArray = $scope.filtersObjArray.concat($scope.slaveFiltersObjArray);
            $scope.entityArray = $scope.entityArray.concat($scope.masterEntityArray);
            $scope.entityArray = $scope.entityArray.concat($scope.slaveEntityArray);
            //fill select form totalMAPS (dropdown fields  , multiselect , etc dependencies)
            //CAUTION mind EDITROW MANAGER FOR FORMS
            var acts = uiGridActionManagerFactory.gridActionManager($scope.masterActionInfo, $scope.masterSFModel, $scope.slaveActionInfo, $scope.slaveSFModel);
            //refer actions to  master and slave 
            $scope.masterHandledActions = acts.master, $scope.slaveHandledActions = acts.slave;
            var gatMasterDataChain = $scope.getData();
            console.log("All promises resolved");
        });
    };
    //mastergrid Register API  initialization
    $scope.masterGrid.onRegisterApi = function (gridMasterApi) {
        //set gridApi on scope
        $scope.gridMasterApi = gridMasterApi;
        //on sort change sort grid 
        //$scope.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
        //    if (sortColumns.length == 0) { paginationOptions.sort = null; } 
        //    else { paginationOptions.sort = sortColumns[0].sort.direction; }
        //    //$scope.getData('/InvoiceTypes', '&page=' + paginationOptions.pageNumber + '&pageSize=' + paginationOptions.pageSize); 
        //});
        gridMasterApi.core.on.rowsRendered($scope, () => {
            if (!$scope.initializedMaster && $scope.masterGrid.data.length > 0) {
                //$scope.gridMasterApi.treeBase.expandAllRows();
                $scope.initializedMaster = true;
            }
        });

        //load new page Data  // change selected row to null , empty Slave Data
        gridMasterApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            //if master has dirty rows modal to save the 
            var masterGridDirtyRows = $scope.gridMasterApi.rowEdit.getDirtyRows($scope.gridMasterApi.grid);
            //if slave has dirty rows modal to save them
            var slaveGridDirtyRows = $scope.gridSlaveApi.rowEdit.getDirtyRows($scope.gridSlaveApi.grid);
            if (masterGridDirtyRows.length > 0 || slaveGridDirtyRows.length > 0) {
                if (masterGridDirtyRows.length > 0 && slaveGridDirtyRows.length == 0) { //only master save
                    console.log('Saving Master data from pagination changed action. Dirty rows: ' + masterGridDirtyRows.length)
                    saveRows($scope.gridMasterApi.grid, masterGridDirtyRows, 'master');

                } else if (masterGridDirtyRows.length == 0 && slaveGridDirtyRows.length > 0) { //only slave save
                    console.log('Saving Slave data from pagination changed action. Dirty rows: ' + slaveGridDirtyRows.length)
                    saveRows($scope.gridSlaveApi.grid, slaveGridDirtyRows, 'slave');

                } else { //both master and slave save 
                    var promise = saveRows($scope.gridMasterApi.grid, masterGridDirtyRows, 'master');
                    promise.then(function (greeting) {
                        tosterFactory.showCustomToast('Successfully saved POS Info data', 'success');
                        saveRows($scope.gridSlaveApi.grid, slaveGridDirtyRows, 'slave');
                    }, function (reason) {
                        tosterFactory.showCustomToast('Fail on saving POS Info data ', 'fail');
                        console.log('Fail Save'); console.log(reason);
                    });
                }

            } else {
                //No dirty Rows manage pagination Settings and get new Data
                $scope.masterPaginationOptions.pageNumber = newPage;
                $scope.masterPaginationOptions.pageSize = pageSize;
                //Check DATA CHANGED THEN SAVE on success get..
                $scope.getData();
            }
        });
        //select row from master -- > display slaveData of master Row selected
        gridMasterApi.selection.on.rowSelectionChanged($scope, function (row) {
            $scope.lastMasterSelectedRow = row;

            var gridRows = $scope.gridSlaveApi.rowEdit.getDirtyRows();
            if (gridRows.length > 0) {
                tosterFactory.showCustomToast('Detail Changes discarded', 'info');
                var dataRows = gridRows.map(function (rr) { return rr.entity; });
                $scope.gridSlaveApi.rowEdit.setRowsClean(dataRows);
            }


            $scope.getSlaveData($scope.slaveEntityIdentifier, 'page=' + $scope.slavePaginationOptions.pageNumber + '&pageSize=' + $scope.slavePaginationOptions.pageSize + '&' + $scope.slaveGetParam + '=' + $scope.lastMasterSelectedRow.entity['Id']);
            //$scope.slaveGrid.data = bsArray($scope.slaveDataLoaded, $scope.masterSlaveDep, $scope.lastMasterSelectedRow.entity['Id']);
            var msg = 'row selected ' + row.isSelected;
        });
        gridMasterApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
            var msg = 'rows changed ' + rows.length;
            $log.log(msg);
        });
        //on begin cell edit change selectedRow  && load Slave Data for selected row
        gridMasterApi.edit.on.beginCellEdit($scope, function (rowEntity, colDef) {
            var row = $scope.gridMasterApi.grid.getRow(rowEntity);
            row.isSelected = true;
            if ($scope.lastMasterSelectedRow === undefined || $scope.lastMasterSelectedRow === null || $scope.lastMasterSelectedRow.entity === undefined) {
                $scope.lastMasterSelectedRow = row;
            } else if ($scope.masterGrid.getRowIdentity(rowEntity) != $scope.masterGrid.getRowIdentity($scope.lastMasterSelectedRow.entity)) {
                $scope.lastMasterSelectedRow.isSelected = false;
                $scope.lastMasterSelectedRow = row;
                $scope.getSlaveData($scope.slaveEntityIdentifier, 'page=' + $scope.slavePaginationOptions.pageNumber + '&pageSize=' + $scope.slavePaginationOptions.pageSize + '&' + $scope.slaveGetParam + '=' + $scope.lastMasterSelectedRow.entity['Id']);
            }

        });
        gridMasterApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
            //validate field given to insert  in grid
            //make row selected to avoid conflicts

            ////var row = $scope.gridMasterApi.grid.getRow(rowEntity);                     ////$scope.gridMasterApi.selection.selectRow(row);
            //VALIDATE INPUT GIVEN 
            //$scope.msg.lastCellEdited = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue;
        });
        //gridMasterApi.rowEdit.on.saveRows($scope, saveRows.bind(gridMasterApi.grid, gridMasterApi));
        //gridMasterApi.rowEdit.on.saveRows($scope, $scope.saveRows);
    };

    //slavegrid Register API  initialization
    $scope.slaveGrid.onRegisterApi = function (gridSlaveApi) {
        //set gridSlaveApi on scope
        $scope.gridSlaveApi = gridSlaveApi;
        //on sort change sort grid 
        //$scope.gridSlaveApi.core.on.sortChanged($scope, function (grid, sortColumns) {
        //    if (sortColumns.length == 0) { paginationOptions.sort = null; }                 //    else { paginationOptions.sort = sortColumns[0].sort.direction; }
        //    //$scope.getData('/InvoiceTypes', '&page=' + paginationOptions.pageNumber + '&pageSize=' + paginationOptions.pageSize);                 //    // create params using dynamic Object { getParams: ""  ,postParams: "" , putParams: ""}
        //});
        gridSlaveApi.core.on.rowsRendered($scope, () => {
            if (!$scope.initializedSlave && $scope.slaveGrid.data.length > 0) {
                //$scope.gridSlaveApi.treeBase.expandAllRows();
                $scope.initializedSlave = true;
            }
        });
        gridSlaveApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            //check for changed vars
            var slaveGridDirtyRows = $scope.gridSlaveApi.rowEdit.getDirtyRows($scope.gridSlaveApi.grid);
            if (slaveGridDirtyRows.length > 0) {
                console.log('Saving Slave data from pagination changed action. Dirty rows: ' + slaveGridDirtyRows.length);
                saveRows($scope.gridSlaveApi.grid, slaveGridDirtyRows, 'slave');
                //check PROMISE RETURNED OF SAVE
                $scope.getSlaveData($scope.slaveEntityIdentifier, 'page=' + $scope.slavePaginationOptions.pageNumber + '&pageSize=' + $scope.slavePaginationOptions.pageSize + '&' + $scope.slaveGetParam + '=' + $scope.lastMasterSelectedRow.entity['Id']);

            } else {
                $scope.slavePaginationOptions.pageNumber = newPage;
                $scope.slavePaginationOptions.pageSize = pageSize;
                $scope.getSlaveData($scope.slaveEntityIdentifier, 'page=' + $scope.slavePaginationOptions.pageNumber + '&pageSize=' + $scope.slavePaginationOptions.pageSize + '&' + $scope.slaveGetParam + '=' + $scope.lastMasterSelectedRow.entity['Id']);
            }
        });
        gridSlaveApi.selection.on.rowSelectionChanged($scope, function (row) {
            $scope.lastSlaveSelectedRow = row;
        });
        gridSlaveApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
            var msg = 'rows changed ' + rows.length; $log.log(msg);
        });
        gridSlaveApi.edit.on.beginCellEdit($scope, function (rowEntity, colDef) {
            var row = $scope.gridSlaveApi.grid.getRow(rowEntity); row.isSelected = true;
            if ($scope.lastSlaveSelectedRow === undefined || $scope.lastSlaveSelectedRow === null || $scope.lastSlaveSelectedRow.entity === undefined) {
                $scope.lastSlaveSelectedRow = row;
            } else if ($scope.slaveGrid.getRowIdentity(rowEntity) != $scope.slaveGrid.getRowIdentity($scope.lastSlaveSelectedRow.entity)) { $scope.lastSlaveSelectedRow.isSelected = false; $scope.lastSlaveSelectedRow = row; }
        });
        gridSlaveApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
            rowEntity = $scope.handleException('slave', rowEntity, colDef, newValue, oldValue);

        });
        //gridSlaveApi.rowEdit.on.saveRows($scope, saveRows.bind(gridSlaveApi.grid, gridSlaveApi));
        //gridSlaveApi.rowEdit.on.saveRows($scope, $scope.saveRows);
    };
    $scope.getData = function (apiControllerName, parameters) {
        if (parameters == undefined || parameters == null || parameters == '') {
            parameters = 'page=' + $scope.masterPaginationOptions.pageNumber + '&pageSize=' + $scope.masterPaginationOptions.pageSize;
        }
        if (apiControllerName == undefined || apiControllerName == null || apiControllerName == '') {
            apiControllerName = $scope.masterEntityIdentifier; //remember this functions load master data 
        }
        $scope.initializedMaster = false;

        DynamicApiService.getDynamicObjectData(apiControllerName, parameters).then(function (result) { //Rest Get call for data using Api service to call Webapi
            if (result.data.length < 1) {
                tosterFactory.showCustomToast('No Results found for ' + $scope.masterEntityIdentifier + ' array', 'info');
            }
            //inits master data and pagination totalitems: used to manage useExternalPagination: true, option on grid
            $scope.masterGrid.data = result.data.Results;
            $scope.gridMasterApi.grid.options.totalItems = result.data.RowCount;
        });
    };
    //load Slave Grids Data
    $scope.getSlaveData = function (apiControllerName, parameters) {
        $scope.initializedSlave = false;
        DynamicApiService.getDynamicObjectData(apiControllerName, parameters).then(function (result) { //Rest Get call for data using Api service to call Webapi
            if (result.data.length < 1) {
                tosterFactory.showCustomToast('No Results found for ' + $scope.slaveEntityIdentifier + ' array', 'info');
            }
            //init slave data
            $scope.slaveGrid.data = result.data.Results;
            $scope.gridSlaveApi.grid.options.totalItems = result.data.RowCount;
        });
    }

    //Step wizard save
    $scope.addData = function (refGrid) {
        switch (refGrid) {
            case "master":
                if ($scope.masterHandledActions.addAct.type == 'StepWizard') {
                    $scope.stepWizardFormArray = $scope.masterHandledActions.addAct.arrayFormModel;
                    var stepArr = [];
                    for (var i = 0; i < $scope.stepWizardFormArray.length; i++) {
                        //here we are
                        if ($scope.stepWizardFormArray[i].modelFormName == "formPosInfoStep5" && $scope.stepWizardFormArray[i].entriesArray !== undefined) {
                            var defaultValue = angular.copy($scope.stepWizardFormArray[i].form[0].titleMap[0].value);
                            var ents = $scope.slaveFiltersObjArray.InvoicesTypeId.map(function (cnt) {
                                var tmpObj = {
                                    Id: cnt.Key,
                                    Code: cnt.Code,
                                    Description: cnt.Value,
                                    Abbreviation: cnt.Abbr,
                                    Type: cnt.Type,
                                }
                                var ret = {
                                    InvoiceType: tmpObj,
                                    TransactionType: null
                                }
                                return ret;
                            })
                            angular.forEach(ents, function (item) {
                                item.TransactionType = defaultValue;
                            })
                            $scope.stepWizardFormArray[i].entriesArray = ents;
                        }
                        stepArr.push($scope.stepWizardFormArray[i].modelStepName);
                    }
                    stepWizardAdd($scope.stepWizardFormArray, stepArr, "master");
                }
                if ($scope.masterHandledActions.addAct.type == 'SingleModal') {
                    var singleFormModel = {
                        entityIdentifier: $scope.masterEntityIdentifier,
                        schema: $scope.masterHandledActions.addAct.arrayFormModel[0].schema,
                        form: $scope.masterHandledActions.addAct.arrayFormModel[0].form,
                        entity: $scope.masterHandledActions.addAct.arrayFormModel[0].entity
                    }
                    simpleModalAdd(singleFormModel);
                }
                break;
            case "slave":
                if ($scope.slaveHandledActions.addAct.type == 'StepWizard') {
                    $scope.stepWizardFormArray = $scope.slaveHandledActions.addAct.arrayFormModel;
                    var stepArr = [];
                    for (var i = 0; i < $scope.stepWizardFormArray.length; i++) { stepArr.push($scope.stepWizardFormArray[i].modelStepName); }
                    stepWizardAdd($scope.stepWizardFormArray, stepArr, "slave");
                }
                if ($scope.slaveHandledActions.addAct.type == 'SingleModal') {
                    var singleFormModel = {
                        entityIdentifier: $scope.slaveEntityIdentifier,
                        schema: $scope.slaveHandledActions.addAct.arrayFormModel[0].schema,
                        form: $scope.slaveHandledActions.addAct.arrayFormModel[0].form,
                        entity: $scope.slaveHandledActions.addAct.arrayFormModel[0].entity
                    }
                    simpleModalAdd(singleFormModel);
                }
                break;
            default: break;

        }
    };
    function stepWizardAdd(stepWizardArr, stepArr, caller) {
        var modalInstance = $uibModal.open({
            // minWidth: '80vw',
            backdrop: "static", width: '1500px', animation: true,
            templateUrl: '../app/views/setupSettings/setupModals/stepWizardInsertModal.html',
            controller: 'StepWizardFormInsertModalCtrl', controllerAs: 'modal',
            resolve: {
                stepWizardFormArray: function () { return stepWizardArr; },
                steps: function () { return stepArr; }
            }
        });

        modalInstance.result.then(function (data) {
            var ctrlName = ""
            if (caller == "master") { ctrlName = $scope.masterEntityIdentifier; }
            if (caller == "slave") { ctrlName = $scope.masterEntityIdentifier; }
            //http://localhost:61964/api/2623fe8e-cb11-4591-b953-bc070b6a5f56/PosInfo/Add
            DynamicApiService.postAttributeRoutingData(ctrlName, 'Add', data.master).then(function (result) {
                tosterFactory.showCustomToast('New entry of ' + $scope.masterEntityIdentifier + ' saved successfully.', 'success');
                var dirtyDetail = $scope.gridSlaveApi.rowEdit.getDirtyRows();
                var dataRows = dirtyDetail.map(function (gridRow) { return gridRow.entity; });
                $scope.gridSlaveApi.rowEdit.setRowsClean(dataRows); $scope.slaveGrid.data = [];

                $scope.lastMasterSelectedRow = null; $scope.lastSlaveSelectedRow = null;
                $scope.getData();
            }), (function (result) {
                tosterFactory.showCustomToast($scope.masterEntityIdentifier + ' entry failed to save.', 'fail');
                console.log('Fail save'); console.log(reason);
            });
            //use data return to save models using Rest  Call 
        }, function (reason) {
            //modal exited with close function
        });

    }
    //used for single form insert Modal
    function simpleModalAdd(singleFModel) {
        //http://angularscript.com/fully-customizable-fuelux-wizard-angular-directive/
        var ctrlName = singleFModel.entityIdentifier;
        var modalInstance = $uibModal.open({
            // minWidth: '80vw',
            backdrop: "static", width: '1500px', animation: true,
            template: function (element, attrs) {
                var html1 = '<div><div class="modal-header"><h3 class="modal-title">Add new register</h3></div><div class="modal-body">';
                var html2 = '<form name="createRowEntryForm" sf-schema="si_modal.schema" sf-form="si_modal.form" sf-model="si_modal.entity" ng-submit="save(createRowEntryForm)"></form>';
                var html3 = '</div><div class="modal-footer"><button class="hvr-fade hvr-warning" style="text-decoration:none; height: inherit;" ng-click="si_modal.dismiss()">Cancel</button><button class="hvr-fade hvr-success" style="text-decoration:none; height: inherit;" ng-click="si_modal.save()">Save</button></div></div>';
                var html = html1 + html2 + html3;
                return html;
            },
            //templateUrl: '../app/views/setupSettings/setupModals/rowInsertModal.html',
            controller: 'SingleFormInsertModalCtrl', controllerAs: 'si_modal',
            resolve: {
                filtersObjArray: function () { return $scope.filtersObjArray; },
                singleFormModel: function () { return singleFModel; }
            }
        });


        modalInstance.result
            .then(function (data) {
                $scope.savingProcess = true;
                //on save button confirm 
                if (data['PosInfoId'] !== undefined)
                    data['PosInfoId'] = $scope.lastMasterSelectedRow.entity['Id'];
                //external manage InvoicesTypeId - GroupId - of enum type
                if ($scope.masterEntityIdentifier == 'PosInfo' && $scope.slaveEntityIdentifier == 'PosInfoDetail') {
                    var toUp = $scope.slaveFiltersObjArray['InvoicesTypeId'].filter(function (item) {
                        return item.Key == data['InvoicesTypeId'];
                    });
                    if (toUp.length > 1) alert('Impossible Error.\n InvoiceTypes with multiple Id regs.')
                    else data['GroupId'] = toUp[0].Type;
                }
                else {
                    tosterFactory.showCustomToast('Manage your Details to Pos Dependency', 'fail');
                }
                DynamicApiService.postSingle(ctrlName, data).then(function (result) {
                    $scope.savingProcess = false;
                    tosterFactory.showCustomToast('New entry of ' + $scope.slaveEntityIdentifier + ' saved successfully.', 'success');
                    $scope.getSlaveData($scope.slaveEntityIdentifier, 'page=' + $scope.slavePaginationOptions.pageNumber + '&pageSize=' + $scope.slavePaginationOptions.pageSize + '&' + $scope.slaveGetParam + '=' + $scope.lastMasterSelectedRow.entity['Id']);
                }), (function (result) {
                    $scope.savingProcess = false;
                    tosterFactory.showCustomToast($scope.slaveEntityIdentifier + ' entry failed to save.', 'fail');
                    console.log('Fail save'); console.log(reason);
                });
            }, function (reason) {
                //modal closed with action close button or [X] modify your actions here
            });
    };


    $scope.removeMasterRowObject = function () {  //KEEP IN CONTRACT THAT LAST ROW EDITED IS SELECTED
        if ($scope.lastMasterSelectedRow == undefined || $scope.lastMasterSelectedRow.entity == null || $scope.lastMasterSelectedRow.entity == undefined) {
            tosterFactory.showCustomToast('No POS Info line selected.', 'info');
            return;
        }
        else {
            var modalmsg = "You are about to delete a master Register. Proceeding to deletion all slave Details referred to current row is going to be Deleted. \n Are you sure ? ";
            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: '../app/scripts/directives/gridDirectives/simpleMessageModal.html',
                controller: 'SimpleMessageModalCtrl',
                controllerAs: 'smm',
                resolve: { message: function () { return modalmsg; } }
            });
            modalInstance.result.then(function (data) {
                $scope.savingProcess = true;
                var dataToDel = $scope.lastMasterSelectedRow.entity;
                //user react on Confim of deletion 
                // run service of single del  to master row.entity == model
                DynamicApiService.deleteAttributeRoutingData($scope.masterEntityIdentifier, 'DeleteRange', [dataToDel.Id]).then(function (result) {
                    // DynamicApiService.deleteSingle($scope.masterEntityIdentifier, dataToDel.Id).then(function (result) {
                    //if master row  deleted  ????? delete slave 
                    $scope.savingProcess = false;
                    $scope.lastMasterSelectedRow = null; $scope.lastSlaveSelectedRow = null;
                    $scope.slaveGrid.data = [];
                    $scope.getData($scope.masterEntityIdentifier, 'page=' + $scope.masterPaginationOptions.pageNumber + '&pageSize=' + $scope.masterPaginationOptions.pageSize);
                }), (function (result) { alert(result); $scope.savingProcess = false; });
            }, function (reason) {
                //alert('MODAL RET CANCEL CANCEL !!!');
            });
        }
    }
    $scope.removeSlaveRowObject = function () {
        //KEEP IN CONTRACT THAT LAST ROW EDITED IS SELECTED

        if ($scope.lastSlaveSelectedRow == undefined || $scope.lastSlaveSelectedRow.entity == null || $scope.lastSlaveSelectedRow.entity == undefined) {
            tosterFactory.showCustomToast('No POS Info details line selected.', 'info');
            return;
        }
        else {
            var modalmsg = "You are about to delete a slave Register. Are you sure ? ";
            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: '../app/scripts/directives/gridDirectives/simpleMessageModal.html',
                controller: 'SimpleMessageModalCtrl',
                controllerAs: 'smm',
                resolve: { message: function () { return modalmsg; } }
            });
            modalInstance.result.then(function (data) {
                $scope.savingProcess = true;
                var dataToDel = $scope.lastSlaveSelectedRow.entity;
                //user react on Confim of deletion 
                // run service of single del  to master row.entity == model
                DynamicApiService.deleteSingle($scope.slaveEntityIdentifier, dataToDel.Id).then(function (result) {
                    $scope.savingProcess = false;
                    if ($scope.lastMasterSelectedRow != null) {
                        $scope.lastSlaveSelectedRow = null;
                        $scope.getSlaveData($scope.slaveEntityIdentifier, 'page=' + $scope.slavePaginationOptions.pageNumber + '&pageSize=' + $scope.slavePaginationOptions.pageSize + '&' + $scope.slaveGetParam + '=' + $scope.lastMasterSelectedRow.entity['Id']);
                    } else {
                        tosterFactory.showCustomToast('No POS Info selected', 'warning');
                        $scope.slaveGrid.data = [];
                    }
                }), (function (result) { alert(result); $scope.savingProcess = false; });
            }, function (reason) {
                //alert('MODAL RET CANCEL CANCEL !!!');
            });

        }

    }

    //Save master Grid row Changes
    $scope.saveMasterGridChanges = function () {
        var masterGridDirtyRows = $scope.gridMasterApi.rowEdit.getDirtyRows($scope.gridMasterApi.grid);
        if (masterGridDirtyRows.length > 0) {
            console.log(masterGridDirtyRows);
            saveRows($scope.gridMasterApi.grid, masterGridDirtyRows, 'master');
        } else {
            tosterFactory.showCustomToast('No changes on POS Info grid to save', 'info');
        }

    };
    //Save slave Grid row Changes
    $scope.saveSlaveGridChanges = function () {
        var slaveGridDirtyRows = $scope.gridSlaveApi.rowEdit.getDirtyRows($scope.gridSlaveApi.grid);
        if (slaveGridDirtyRows.length > 0) {
            console.log(slaveGridDirtyRows);
            saveRows($scope.gridSlaveApi.grid, slaveGridDirtyRows, 'slave');
        } else {
            tosterFactory.showCustomToast('No Changes on Master Grid To Save', 'info');
        }
    }
    function saveRows(gridApi, gridDirtyRows, type) {
        if (!gridDirtyRows.length > 0) {
            switch (type) {
                case 'master': gridDirtyRows = $scope.gridMasterApi.rowEdit.getDirtyRows($scope.gridMasterApi.grid); break;
                case 'slave': gridDirtyRows = $scope.gridSlaveApi.rowEdit.getDirtyRows($scope.gridSlaveApi.grid); break;
                default: break;
            }
            if (!gridDirtyRows > 0) {
                tosterFactory.showCustomToast('Saving Rows will not proceed : no Dirty Rows for ' + type + ' grid Yet!!', 'warning');
                return;
            }
        }
        //rowEntitiesArray here are the objects to post.. 
        var rowEntitiesArray = gridDirtyRows.map(function (gridRow) { return gridRow.entity; });
        //multi post objects through dynApiService
        switch (type) {
            case 'master':
                $scope.savingProcess = true;
                var promise = DynamicApiService.putMultiple($scope.masterEntityIdentifier, rowEntitiesArray).then(function (result) {
                    $scope.savingProcess = false;
                    $scope.gridMasterApi.rowEdit.setRowsClean(rowEntitiesArray);
                    tosterFactory.showCustomToast('POS Info grid changes saved successfully', 'success');
                }, function (reason) {
                    tosterFactory.showCustomToast('Saving POS Info grid data failed', 'fail');
                    console.log('Error save'); console.log(reason);
                    $scope.savingProcess = false;
                });
                break;
            case 'slave':
                var promise = DynamicApiService.putMultiple($scope.slaveEntityIdentifier, rowEntitiesArray).then(function (result) {
                    $scope.savingProcess = false;
                    $scope.gridSlaveApi.rowEdit.setRowsClean(rowEntitiesArray);
                    tosterFactory.showCustomToast('Details grid data saved successfully', 'success');
                }, function (reason) {
                    tosterFactory.showCustomToast('Saving Details grid data failed', 'fail');
                    console.log('Error save'); console.log(reason);
                    $scope.savingProcess = false;
                });
                break;
            default: break;
        }
        // create a fake promise - normally you'd use the promise returned by $http or $resource
        // gridMasterApi.rowEdit.setSavePromise(rowEntity, promise.promise);
    };

    $scope.manageDependencies = function (gridCaller) {
        var ent_array; var filtObjArray;
        switch (gridCaller) {
            case 'master': ent_array = $scope.masterEntityArray; filtObjArray = $scope.masterFiltersObjArray; break;
            case 'slave': ent_array = $scope.slaveEntityArray; filtObjArray = $scope.slaveFiltersObjArray; break;
            default: break;
        }

        for (var a in ent_array) {
            var tmpobj = {};
            if (ent_array[a] == "Configuration") {
                tmpobj = Object.assign({}, filtObjArray[ent_array[a]]);
            }
            else {
                var cmax = -1;
                for (var c in filtObjArray[ent_array[a]]) { if (cmax < filtObjArray[ent_array[a]][c].Key) { cmax = filtObjArray[ent_array[a]][c].Key; } }
                var b = 0; var cnt = 0;
                for (b = 0; b <= cmax; b++) {
                    if (b == filtObjArray[ent_array[a]][cnt].Key) { tmpobj[b.toString()] = filtObjArray[ent_array[a]][cnt].Value; cnt++; }
                    else { tmpobj[b.toString()] = 'NoEnumMatch'; }
                }
            }

            //interation to init column array dependencies
            if (gridCaller == 'master') {
                $scope.dynamicEnumObjMaster[ent_array[a]] = tmpobj;
                for (var j = 0; j < ent_array.length; j++) {
                    for (var i = 0; i < $scope.masterGrid.columnDefs.length; i++) {
                        if ($scope.masterGrid.columnDefs[i].field == ent_array[j]) { //match column.Field VS OBJ{entityname : []} from LookUpFactoryRepository.GetLookUpsForEntity
                            if (ent_array[j] == "Configuration") {
                                var tmpArray = [];
                                for (var u = filtObjArray[ent_array[j]].length - 1; u >= 0; u--) {
                                    tmpArray.push({ Value: filtObjArray[ent_array[j]][u] })
                                }
                                $scope.masterGrid.columnDefs[i][$scope.columnMasterDependencies.dependType] = tmpArray;
                            }
                            else {
                                $scope.masterGrid.columnDefs[i][$scope.columnMasterDependencies.dependType] = filtObjArray[ent_array[j]];
                            }
                        }
                    }
                }
            } else if (gridCaller == 'slave') {
                $scope.dynamicEnumObjSlave[ent_array[a]] = tmpobj;
                for (var j = 0; j < ent_array.length; j++) {
                    for (var i = 0; i < $scope.slaveGrid.columnDefs.length; i++) {
                        if ($scope.slaveGrid.columnDefs[i].field == ent_array[j]) { //match column.Field VS OBJ{entityname : []} from LookUpFactoryRepository.GetLookUpsForEntity
                            $scope.slaveGrid.columnDefs[i][$scope.columnSlaveDependencies.dependType] = filtObjArray[ent_array[j]];
                        }
                    }
                }
            }

        }
    }

    $scope.colorPickerModal = function (row) {
        debugger;
        $mdDialog.show({
            controller: function ($scope, $mdDialog, dataUtilFactory, config, auth, rowEntity) {
                $scope.data = rowEntity;
                $scope.entity = { Color: ($scope.data.Color != null) ? $scope.data.Color : 'black', Background: ($scope.data.Background != null) ? $scope.data.Background : '#dae0e0' };
                $scope.form = [
                    {
                        type: "section", htmlClass: "inlineFormDisplay", feedback: false,
                        items: [
                            {
                                type: "section", feedback: false, items: [{
                                    fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', feedback: false, key: "Background", onChange: "valueChanged(form.key,modelValue)", type: 'colorpicker', colorFormat: 'rgb',
                                    spectrumOptions: { preferredFormat: 'rgb', showInput: true, showAlpha: true, showPalette: true, showSelectionPalette: true, palette: [['black', 'white', 'blanchedalmond', 'rgb(255, 128, 0);', 'hsv 100 70 50'], ['red', 'yellow', 'green', 'blue', 'violet']] }
                                }]
                            },
                            {
                                type: "section", items: [{
                                    fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', feedback: false, key: "Color", type: 'colorpicker', colorFormat: 'rgb',
                                    spectrumOptions: { preferredFormat: 'rgb', showInput: true, showAlpha: true, showPalette: true, showSelectionPalette: true, onChange: "valueChanged(form.key,modelValue)", palette: [['black', 'white'], ['red', 'green']] }
                                }]
                            }
                        ]
                    }
                ];
                $scope.schema = { type: 'object', title: "Comment", properties: { Background: { type: 'string', title: 'Background', format: "color" }, Color: { type: 'string', title: 'Text', format: "color" } }, required: [] };

                $scope.hide = function () { $mdDialog.hide(); };
                $scope.cancel = function () { $mdDialog.cancel(); };
                $scope.confirm = function (answer) {
                    $mdDialog.hide($scope.entity);
                }
            },
            template: '<md-dialog aria-label="tableModel" ng-cloak style="min-width: 35vw; min-height: 41vh;" layout="column" layout-align="space-between stretch"><div ng-include src="\'colorEditIngrModal\'"></div></md-dialog>',
            parent: angular.element('#wrapper'),
            clickOutsideToClose: true,
            fullscreen: $mdMedia('sm'),
            resolve: {
                rowEntity: function () { return row.entity; },
            }
        }).then(function (retdata) {
            row.entity.Color = retdata.Color;
            row.entity.Background = retdata.Background;
            $scope.gridSlaveApi.selection.selectRow(row);
            $scope.gridSlaveApi.rowEdit.setRowsDirty([row.entity]);
        })
    }
}
