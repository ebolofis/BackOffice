'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # loginController
 * Controller of the sbAdminApp
 */

angular.module('posBOApp')
    .controller('SingleGridController', SingleGridController).filter('mapDropdown', function (uiGridFactory) { return uiGridFactory.getMapDrowdownFilter() })

    .directive('customMultiselectCell', ['$document', 'uiGridConstants', 'uiGridEditConstants', function ($document, uiGridConstants, uiGridEditConstants) {
        return {
            scope: { dropArray: '=', toSelectModel: '=', matchProperty: '@', modarr: '=?' },
            template: '<div><isteven-multi-select input-model="modarr" output-model="model" on-item-click="print()" button-label="Description" item-label="Description" on-close="funcClose()" tick-property="ticked"></isteven-multi-select></div>',
            restrict: 'AE', require: ['?^uiGrid', '?^uiGridRenderContainer'],
            compile: function (tElement, tAttrs, transclude) {
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) { var prep; },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        scope.modarr = markeSelected(); scope.model = angular.copy(scope.toSelectModel);
                        function markeSelected() {
                            var retarr = []
                            angular.forEach(scope.dropArray, function (value) {
                                var fil = scope.toSelectModel.filter(function (item) { return value.Id == item[scope.matchProperty]; });
                                (fil.length > 0) ? value.ticked = true : value.ticked = false; var obj = angular.copy(value); retarr.push(obj);
                            })
                            return retarr;
                        }
                        scope.print = function () { console.log(scope.model); }
                        scope.funcClose = function () {
                            //scope.toSelectModel = []; //scope.toSelectModel = angular.copy(scope.model); //scope.$apply(); //scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                        }
                        var uiGridCtrl = controller[0];
                        var onWindowClick = function (evt) {
                            var classNamed = angular.element(evt.target).attr('class'); var inDirective = (classNamed.indexOf('msDropdownCell') > -1); if (!inDirective) { scope.stopEdit(evt); }
                        };
                        var onCellClick = function (evt) { console.log('click'); angular.element(document.querySelectorAll('.msDropdownCell')).off('click', onCellClick); scope.stopEdit(evt); };
                        scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                            if (uiGridCtrl.grid.api.cellNav) {
                                uiGridCtrl.grid.api.cellNav.on.navigate(scope, function (newRowCol, oldRowCol) { //scope.funcClose();
                                    scope.stopEdit();
                                });
                            } else { angular.element(document.querySelectorAll('.msDropdownCell')).on('click', onCellClick); }
                            //angular.element(window).on('click', onWindowClick);
                        });
                        //scope.$on('$destroy', function () { angular.element(window).off('click', onWindowClick); });

                        scope.stopEdit = function (evt) { scope.toSelectModel = []; scope.toSelectModel = angular.copy(scope.model); scope.$apply(); scope.$emit(uiGridEditConstants.events.END_CELL_EDIT); };
                    }
                }
            },
            link: function ($scope, $elm, $attr) {
                $document.on('click', docClick);
                function docClick(evt) {
                    if ($(evt.target).closest('.msDropdownCell').size() === 0) {
                        $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                        $document.off('click', docClick);
                    }
                }
            },
            replace: true
        }
    }])
function SingleGridController(tosterFactory, $stateParams, $scope, $http, $q, $mdDialog, $mdMedia, uiGridConstants, uiGridGroupingConstants, DynamicApiService, GridInitiallization, uiGridFactory, dataUtilFactory) {
    $scope.refreshView = function () {
        $scope.gridApi.core.refresh();
    }
    $scope.entityIdentifier;// = $state.current.data.entityIdentifier;
    //external search filter vvariabls on ingredients
    $scope.externalDataFilter = {};
    $scope.clearSearchFilters = function () { $scope.externalDataFilter = {}; }
    $scope.loadingState = true; $scope.addIsEditedField = true;
    $scope.gridParams = [];    //dynamic grid params //array of  objs { key:"" , value:""}
    $scope.dataLoaded = [];                                     //array to Rest dataloaded
    $scope.columns = [];                                        //dynamic colums loaded from Jsonremove
    $scope.groupPriorityEntityArray = [];
    $scope.arrayOfDynamicGrids = [];                            //array to store more than 1 grids in a single view
    $scope.gridTitle = "";
    $scope.dynamicEditRowSchema;
    //init filters dropdowns and other arrays to work
    $scope.filtersObjArray = [];        //suppose to have object of { dependencyName , data } related to Column 
    $scope.dynamicEnumObj = {};
    $scope.columnDependencies;          //array of objs that has Relation to Columns with Filters and external Features
    $scope.lastSelectedRow;                                     //keep this value informed in  
    $scope.dynObjKeyRef = 'Id';                                 //var loaded from model loaded to identify the unique key to EDIT/REMOVE 
    var paginationOptions = { pageNumber: 1, pageSize: 25, sort: null };
    //UNCOMMENT THIS WHEN EXPORT IS IMPLEMENTED AS A SERVICE
    // $scope.dynamicGrid = {};  //dynamic grid for all  grid entities
    $scope.dynamicGrid = {
        enablePaging: true, paginationPageSizes: [20, 50, 75], paginationPageSize: 20,
        useExternalPaging: true, useExternalPagination: true, //useExternalSorting: true,
        //exporterLinkLabel: 'TESTCSV LABEL', exporterPdfDefaultStyle: { fontSize: 9 }, exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        //exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
        //exporterPdfOrientation: 'portrait', exporterPdfPageSize: 'LETTER', exporterPdfMaxGridWidth: 500,
        //exporterHeaderFilter: function (displayName) { if (displayName === 'Name') { return 'Person Name'; } else { return displayName; } },
        //exporterFieldCallback: function (grid, row, col, input) {
        //    if (col.name == 'gender') { switch (input) { case 1: return 'female'; break; case 2: return 'male'; break; default: return 'unknown'; break; } } else { return input; }
        //},
    };
    //init function calls all functions to create a grid
    $scope.initGrid = function () {
        $scope.loadingState = true;
        var gridGenerated = GridInitiallization.initGridParams($scope.entityIdentifier); //TEMP  pseydo obj from factory to manage columns 
        var initPromice = DynamicApiService.getDynamicGridModel($scope.entityIdentifier).then(function (result) { //Rest Get call for data using Api service to call Webapi
            $scope.dynObjKeyRef = result.data.SimpleGrid.dynObjKeyRef; //string as key to dynamic dependencies
            $scope.gridTitle = result.data.SimpleGrid.ModalTitle;
            if ($scope.entityIdentifier == "AuthorizedGroupDetail"
                || $scope.entityIdentifier == "PosInfoDetail_Excluded_Accounts"
                || $scope.entityIdentifier == "PdaModule"
                || $scope.entityIdentifier == "Payrole"
                || $scope.entityIdentifier == "Items"
                || $scope.entityIdentifier == "ClientPos"
                || $scope.entityIdentifier == "Ingredients"
                || $scope.entityIdentifier == "Combo"
                || $scope.entityIdentifier == "ComboDetail"
                || $scope.entityIdentifier == "Staff"
                || $scope.entityIdentifier == "Department"
                || $scope.entityIdentifier == "Accounts"
                || $scope.entityIdentifier == "PricelistMaster"
                || $scope.entityIdentifier == "ChangeProductCategoriesVat"
                || $scope.entityIdentifier == "ChangeTransferMappins")
                {
                $scope.gridParams = gridGenerated.gParams;
                if ($scope.entityIdentifier == "Ingredients") {
                    $scope.externalDataFilter = { Description: '' };
                }
            } else {
                $scope.gridParams = JSON.parse(result.data.SimpleGrid.GridParams);
            }
            // for (var i = 0; i < $scope.gridParams.length; i++) { $scope.dynamicGrid[$scope.gridParams[i].key] = $scope.gridParams[i].value; }
            $scope.modifyDynamicParams();  //from gridParams parsed change grid options
            $scope.columns = gridGenerated.gColumns;               // JSON.parse(result.data.SimpleGrid.Columns);

            //Disable column header Actions menu 
            angular.forEach($scope.columns, function (value) {
                var tmp = { groupingShowAggregationMenu: false, groupingShowGroupingMenu: false, enableHiding: false }
                angular.extend(value, tmp);
            });

            //Group Grids uses this to manipulate sort for grouping
            $scope.dynamicEditRowSchema = gridGenerated.gSchema;   //JSON.parse(result.data.SimpleGrid.RowSchema);
            $scope.dynamicEditRowForm = gridGenerated.gForm;       // JSON.parse(result.data.SimpleGrid.RowForm);
            $scope.dynamicEditRowEntity = JSON.parse(result.data.SimpleGrid.RowEntity);
            if (result.data.SimpleGrid.ColumnDependencies == undefined || result.data.SimpleGrid.ColumnDependencies == null || result.data.SimpleGrid.ColumnDependencies == "") {
                $scope.columnDependencies = [];
            } else {
                $scope.columnDependencies = JSON.parse(result.data.SimpleGrid.ColumnDependencies);
            }
            if ($scope.columnDependencies.length == 0) {
                $scope.dynamicGrid.columnDefs = $scope.columns;
                // $scope.getData(apiControllerName, parameters);
            } else {
                // filter, dropdown object dependencies { type ,columnName ,dependType }
                //force inject column dependencies after columns loaded 
                if (result.data.LookUpEntities != null && result.data.LookUpEntities != undefined) {
                    $scope.filtersObjArray = result.data.LookUpEntities;
                    var entityArray = Object.getOwnPropertyNames(result.data.LookUpEntities);
                    //interation to create dynamic object of Enum_objects
                    for (var a in entityArray) {
                        var tmpobj = {};
                        var cmax = -1;
                        for (var c in $scope.filtersObjArray[entityArray[a]]) {
                            if (cmax < $scope.filtersObjArray[entityArray[a]][c].Key) {
                                cmax = $scope.filtersObjArray[entityArray[a]][c].Key;
                            }
                        }
                        var b = 0; var cnt = 0;
                        for (b = 0; b <= cmax; b++) {
                            if (b == $scope.filtersObjArray[entityArray[a]][cnt].Key) {
                                tmpobj[b.toString()] = $scope.filtersObjArray[entityArray[a]][cnt].Value;
                                cnt++;
                            } else {
                                tmpobj[b.toString()] = 'NoEnumMatch';
                            }
                        }
                        $scope.dynamicEnumObj[entityArray[a]] = tmpobj;
                    }
                    //interation to init column array dependencies
                    for (var j = 0; j < entityArray.length; j++) {
                        for (var i = 0; i < $scope.columns.length; i++) {
                            if ($scope.columns[i].field == entityArray[j]) { //match column.Field VS OBJ{entityname : []} from LookUpFactoryRepository.GetLookUpsForEntity
                                $scope.columns[i][$scope.columnDependencies.dependType] = $scope.filtersObjArray[entityArray[j]];
                            }
                        }
                    };
                    //!Filterrs object array Handle null dropdown lookups for no Required fields
                    $scope.filtersObjArray = $scope.handleNullDropDownExtender($scope.filtersObjArray);

                    $scope.dynamicEditRowForm = uiGridFactory.transformDropDownSelect($scope.filtersObjArray, $scope.dynamicEditRowForm);
                }
                //possible error on loading lookups ... check ColumnDependencies.enumIdentifier with EntitiesForLookUpFactoryEnum.enumIdentifier and lookup Funs
                else {
                    tosterFactory.showCustomToast('Loading lookup entities failed', 'fail');
                }
                $scope.dynamicGrid.columnDefs = $scope.columns;
            }
        });
        if ($scope.entityIdentifier == "Ingredients") {
            $scope.RestPromice.lookups('BusinessIntelligence').then(function (d) {
                if (d != null && d.data != null && d.data.LookUpEntities.BIPolicy.Ingredients != undefined) {
                    $scope.BIconf = d.data.LookUpEntities;
                    //$scope.BIconf.BIPolicy.Ingredients.UniqueCode = false;
                }
                $scope.getData();
            })
        }
        if ($scope.entityIdentifier == 'PricelistMaster') {
            var salesTypesPromice = $scope.getDropDownLookUps('SalesType');
            $q.all([salesTypesPromice]).then(function () {
                var salesTypesDTO = [];
                angular.forEach($scope.salesTypesEnum, function (value, key) {
                    var tmp = { value: Number(key), name: value }
                    salesTypesDTO.push(tmp);
                })
                angular.forEach($scope.dynamicEditRowForm, function (value) {
                    if (value.key !== undefined && value.key == 'AssociatedSalesTypes') {
                        value.titleMap = salesTypesDTO;
                    }
                })
                $scope.getData();
            });
        }
        if ($scope.entityIdentifier == 'Staff') {
            var authGroupPromice = $scope.getDropDownLookUps('AuthorizedGroup');
            var staffPosPromice = $scope.getDropDownLookUps('StaffPosition');
            var StaffStoresPromice = $scope.getDropDownLookUps('StaffDaStores');
            $q.all([initPromice, authGroupPromice, staffPosPromice]).then(function () {
                var staffPositionsDTO = [], authorizedGroupsDTO = [], StaffDaStoresDTO = [];
                angular.forEach($scope.staffPositionsEnum, function (value, key) {
                    var tmp = { value: Number(key), name: value }
                    staffPositionsDTO.push(tmp);
                })

                angular.forEach($scope.authorizedGroupsEnum, function (value, key) {
                    var tmp = { value: Number(key), name: value }
                    authorizedGroupsDTO.push(tmp);
                })
                angular.forEach($scope.StaffDaStoresEnum, function (value, key) {
                    var tmp = { value: Number(key), name: value }
                    StaffDaStoresDTO.push(tmp);
                })
                var tmp = {
                    StaffPositions: staffPositionsDTO,
                    StaffAuthorization: authorizedGroupsDTO,
                    StaffDaStores: StaffDaStoresDTO
                }
                $scope.filtersObjArray = angular.extend({}, tmp);
                angular.forEach($scope.dynamicEditRowForm, function (value) {
                    if (value.key !== undefined && (value.key == 'StaffAuthorization' || value.key == 'StaffPositions' /*|| value.key == 'StaffDaStores'*/)) {
                        (value.key == 'StaffAuthorization') ? value.titleMap = authorizedGroupsDTO : value.titleMap = staffPositionsDTO;/*value.titleMap = StaffDaStoresDTO : value.titleMap = StaffDaStoresDTO;*/                       
                    }
                })
                $scope.getData();
            });
        } else {
            $q.all([initPromice]).then(function () { $scope.getData(); });
        }
    }
    $scope.handleNullDropDownExtender = function (objArray) {
        var entity = $scope.entityIdentifier; var exNull = { Key: null, Value: " --- " };
        switch (entity) {
            case 'Pricelist':
                var tmpArr = objArray.LookUpPriceListId;
                if (tmpArr.length > 0) { tmpArr.unshift(exNull); }
                objArray.LookUpPriceListId = tmpArr;
                break;
            default: break;
        };
        return objArray;
    }
    $scope.validateChangeOnCell = function (rowEntity, colDef, newValue, oldValue) {
        var entity = $scope.entityIdentifier;
        switch (entity) {
            case 'Pricelist':
                if (colDef.field == 'LookUpPriceListId') {
                    if (rowEntity.Id == rowEntity.LookUpPriceListId) {
                        tosterFactory.showCustomToast('Invalid change. Pricelist can not have lookup of its own.', 'info');
                        return false;
                    } else { return true; }
                }
                break;
            case 'Ingredients':
                if (colDef.field == 'Code' && $scope.BIconf != null) {
                    if ($scope.BIconf.BIPolicy.Ingredients.UniqueCode != true) {
                        return true;
                    } else {
                        return $scope.RestPromice.checkUniqueCodes(rowEntity);
                        //var deferred = $q.defer(); $scope.RestPromice.checkUniqueCodes(rowEntity).then(function (data) {  deferred.resolve(data);  });  return deferred.promise;
                    }
                }
                break;
            default: break;
        };
        return true;
    }

    $scope.getDropDownLookUps = function (entity) {
        switch (entity) {
            case "StaffPosition":
                return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                    $scope.staffPositions = result.data; $scope.staffPositionsEnum = dataUtilFactory.createEnums(result.data, {}, 'Id', 'Description');
                }, function (reason) { tosterFactory.showCustomToast('Loading StaffPosition failed', 'fail'); console.log('Error Load'); console.log(reason); })); break;
                break;
            case "AuthorizedGroup":
                return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                    $scope.authorizedGroups = result.data; $scope.authorizedGroupsEnum = dataUtilFactory.createEnums(result.data, {}, 'Id', 'Description');
                }, function (reason) { tosterFactory.showCustomToast('Loading AuthorizedGroup failed', 'fail'); console.log('Error Load'); console.log(reason); })); break;
                break;
            case "SalesType": 
                return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                    $scope.salesTypes = result.data; $scope.salesTypesEnum = dataUtilFactory.createEnums(result.data, {}, 'Id', 'Description');
                }, function (reason) { tosterFactory.showCustomToast('Loading SalesTypes failed', 'fail'); console.log('Error Load'); console.log(reason); })); break;
                break;
            case "StaffDaStore": 
                return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                    $scope.StaffDaStores = result.data; $scope.StaffDaStoresEnum = dataUtilFactory.createEnums(result.data, {}, 'Id', 'Description');
                }, function (reason) { tosterFactory.showCustomToast('Loading SalesTypes failed', 'fail'); console.log('Error Load'); console.log(reason); })); break;
                break;
            case "Payrole":
                return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                    $scope.payrole = result.data; $scope.payroleEnum = dataUtilFactory.createEnums(result.data, {}, 'Id', 'Description');
                }, function (reason) { tosterFactory.showCustomToast('Loading Payrole failed', 'fail'); console.log('Error Load'); console.log(reason); })); break;
                break;

            default: break;
        }
    }
    //add parameters prefered to ui-grid from call to factory
    $scope.modifyDynamicParams = function () {
        for (var i = 0; i < $scope.gridParams.length; i++) {
            //switch (typeof $scope.gridParams[i].value) {  case 'string': case 'number': case 'boolean':
            $scope.dynamicGrid[$scope.gridParams[i].key] = $scope.gridParams[i].value;
            //    break; //default: break; }
        }
    }
    $scope.initialized = false;
    //Registered Functions

    function createSaveArrayStaff(entities) {
        //for all entities
        angular.forEach(entities, function (value) {
            value.StaffPositions = manageDTO(value.StaffPositions, value.BUStaffPositions, value.Id, 'Positions');
            value.StaffAuthorization = manageDTO(value.StaffAuthorization, value.BUStaffAuthorization, value.Id, 'Authorization');
        })
        return entities;
    }
    function manageDTO(currStaff, buStaffArr, idObj, type) {
        var array = angular.copy(currStaff);
        var toDell = [], toAdd = [];
        //from old refs filter array by not changed
        angular.forEach(buStaffArr, function (value) {
            var found = false;
            if (type == 'Positions') { for (var i = 0; i < array.length; i++) { if (array[i].StaffPositionId == value.StaffPositionId) { found = true; array.splice(i, 1); break; } } }
            if (type == 'Authorization') { for (var i = 0; i < array.length; i++) { if (array[i].AuthorizedGroupId == value.AuthorizedGroupId) { found = true; array.splice(i, 1); break; } } }
            if (found == false) { value.IsDeleted = true; toDell.push(value); }
        })
        angular.forEach(array, function (item) {
            var DTO = {}
            if (type == 'Positions') DTO = { Id: 0, StaffId: idObj, IsDeleted: false, StaffPositionId: item.StaffPositionId, Description: $scope.staffPositionsEnum[item.StaffPositionId] };
            if (type == 'Authorization') DTO = { Id: 0, StaffId: idObj, IsDeleted: false, AuthorizedGroupId: item.AuthorizedGroupId, Description: $scope.authorizedGroupsEnum[item.AuthorizedGroupId] };
            toAdd.push(DTO);
        })
        return toDell.concat(toAdd);
    }

    //http://ui-grid.info/docs/#!/api#%2Fapi%2Fui.grid.class:GridApi
    $scope.dynamicGrid.onRegisterApi = function (gridApi) {
        //set gridApi on scope
        $scope.gridApi = gridApi;
        gridApi.core.on.rowsRendered($scope, () => { if (!$scope.initialized && $scope.dynamicGrid.data.length > 0) { $scope.gridApi.treeBase.expandAllRows(); $scope.initialized = true; } });
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            //check for changed vars
            paginationOptions.pageNumber = newPage;
            paginationOptions.pageSize = pageSize;
            //Check DATA CHANGED THEN SAVE on success get..
            if ($scope.externalDataFilter != {} && $scope.externalDataFilter.Description != '') {
                $scope.getData('/' + $scope.entityIdentifier, '&page=' + paginationOptions.pageNumber + '&pageSize=' + paginationOptions.pageSize, '&filters=' + JSON.stringify($scope.externalDataFilter));
            } else {
                $scope.getData('/' + $scope.entityIdentifier, '&page=' + paginationOptions.pageNumber + '&pageSize=' + paginationOptions.pageSize);
            } // create params using dynamic Object { getParams: ""  ,postParams: "" , putParams: ""} or push line
        });
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            $scope.lastSelectedRow = row;
            var msg = 'row selected ' + row.isSelected; console.log(row);
        });
        //gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {var msg = 'rows changed ' + rows.length;$log.log(msg);});
        gridApi.edit.on.beginCellEdit($scope, function (rowEntity, colDef) {
            var row = $scope.gridApi.grid.getRow(rowEntity);
            row.isSelected = true;

            if ($scope.lastSelectedRow === undefined || $scope.lastSelectedRow.entity === undefined) {
                $scope.lastSelectedRow = row;
            } else if ($scope.dynamicGrid.getRowIdentity(rowEntity) != $scope.dynamicGrid.getRowIdentity($scope.lastSelectedRow.entity)) {
                $scope.lastSelectedRow.isSelected = false;
                $scope.lastSelectedRow = row;
            }
        });
        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
            //validate field given to insert  in grid 
            //make row selected to avoid conflicts
            var row = $scope.gridApi.grid.getRow(rowEntity);
            $scope.gridApi.selection.selectRow(row);
            if (row.entity.IsEdited == 'L' && newValue != oldValue) { //value chamgerd here pend Actions..
                row.entity.IsEdited = 'M';
            }
            //VALIDATE INPUT GIVEN 
            //https://github.com/angular-ui/ui-grid/issues/4152
            //$scope.msg.lastCellEdited = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue;
            var validChange = $scope.validateChangeOnCell(rowEntity, colDef, newValue, oldValue);
            if (validChange != true) {
                rowEntity[colDef.field] = oldValue;
            }
        });
        //gridApi.rowEdit.on.saveRow($scope, saveRow.bind(gridApi.grid, gridApi));
    };
    $scope.saveGridChanges = function () {
        //get dirty rows  //validate input 
        //splice Stated I with  M into 2 arrays 
        //call Save row with Promise 
        var gridDirtyRows = $scope.gridApi.rowEdit.getDirtyRows($scope.gridApi.grid);
        if (gridDirtyRows.length > 0) {
            saveRow($scope.gridApi.grid, gridDirtyRows);
        } else {
            tosterFactory.showCustomToast('No changes to save', 'info');
        }
    };
    function saveRow(gridApi, gridDirtyRows) {
        $scope.savingProcess = true;
        if (!gridDirtyRows.length > 0) {
            gridDirtyRows = $scope.gridApi.rowEdit.getDirtyRows($scope.gridApi.grid);
            if (!gridDirtyRows > 0) {
                tosterFactory.showCustomToast('Save row calling : No dirty rows found', 'info');
                $scope.savingProcess = false;
                return;
            }
        }
        //rowEntitiesArray here are the objects to post.. 
        var rowEntitiesArray = gridDirtyRows.map(function (gridRow) { return gridRow.entity; });
        if ($scope.entityIdentifier == 'Staff') {
            var saveArr = createSaveArrayStaff(rowEntitiesArray);
            var promise = DynamicApiService.putAttributeRoutingData("Staff", "UpdateRange", saveArr).then(function (result) {
                tosterFactory.showCustomToast('Saved successfully', 'success');
                var gridRows = $scope.gridApi.rowEdit.getDirtyRows();
                if (gridRows.length > 0) {
                    var dataRows = gridRows.map(function (row) { return row.entity; });
                    $scope.gridApi.rowEdit.setRowsClean(dataRows);
                }
                $scope.getData();
                $scope.savingProcess = false;
            }, function (result) {
                console.log('Multi put on ' + $scope.entityIdentifier + ' failed with result:'); console.log(result);
                $scope.savingProcess = false;
            });
        } else {
            //multi post objects through dynApiService
            var promise = DynamicApiService.putMultiple($scope.entityIdentifier, rowEntitiesArray).then(function (result) {
                tosterFactory.showCustomToast('Saved changes successfully', 'success');
                //$scope.gridApi.rowEdit.setRowsClean(rowEntitiesArray);
                var gridRows = $scope.gridApi.rowEdit.getDirtyRows();
                if (gridRows.length > 0) {
                    var dataRows = gridRows.map(function (row) { return row.entity; });
                    $scope.gridApi.rowEdit.setRowsClean(dataRows);
                }
                $scope.getData();
                $scope.savingProcess = false;
            }, function (result) {
                tosterFactory.showCustomToast('Update failed', 'fail');
                console.log('Error put'); console.log(result);
                $scope.savingProcess = false;
            });
        }
    };

    $scope.filteredSearch = function () {
        paginationOptions.pageNumber = 1;
        var filterparams = '&filters=' + JSON.stringify($scope.externalDataFilter);
        $scope.getData($scope.entityIdentifier, {}, filterparams);
    }
    //Dynamic get  function to get Data vy ( controller , parameters)
    $scope.getData = function (apiControllerName, parameters, extfilt) {
        $scope.initialized = false;
        parameters = 'page=' + paginationOptions.pageNumber + '&pageSize=' + paginationOptions.pageSize;
        if (extfilt != undefined && extfilt != '')
            parameters += extfilt;
        apiControllerName = $scope.entityIdentifier; // this is "String from state ... manage to obj returnesfrom initiallization"
        //$scope.modifyDynamicParams();           //from gridParams parsed change grid options
        if ($scope.entityIdentifier == 'Staff') {
            //GET api/{storeId}/Staff/GetPaged?filters={filters}&page={page}&pageSize={pageSize}
            var params = 'filters={}' + '&page=' + paginationOptions.pageNumber + '&pageSize=' + paginationOptions.pageSize;
            DynamicApiService.getAttributeRoutingData('Staff', 'GetPaged', '', params).then(function (result) { //Rest Get call for data using Api service to call Webapi
                if (result.data.length < 1) {
                    tosterFactory.showCustomToast('No Results found', 'info');
                }
                angular.forEach(result.data.Results, function (res) {
                    res.BUStaffAuthorization = angular.copy(res.StaffAuthorization);
                    res.BUStaffPositions = angular.copy(res.StaffPositions);
                    angular.forEach(res.StaffAuthorization, function (item) {
                        item.Description = $scope.authorizedGroupsEnum[item.AuthorizedGroupId];
                    })
                    angular.forEach(res.StaffPositions, function (item) {
                        item.Description = $scope.staffPositionsEnum[item.StaffPositionId];
                    })
                })
                $scope.authorizedGroups = $scope.authorizedGroups.map(function (obj) {
                    obj.AuthorizedGroupId = obj.Id;
                    //obj.ticked = false;
                    return obj;
                });
                $scope.staffPositions = $scope.staffPositions.map(function (obj) {
                    obj.StaffPositionId = obj.Id;
                    //obj.ticked = false;
                    return obj;
                });
                //ticked: false
                angular.forEach($scope.dynamicGrid.columnDefs, function (cd) {
                    if (cd.field == 'StaffAuthorization') { cd.editDropdownOptionsArray = angular.copy($scope.authorizedGroups); }
                    if (cd.field == 'StaffPositions') { cd.editDropdownOptionsArray = angular.copy($scope.staffPositions); }
                })
                //check for columns group priority 
                $scope.dynamicGrid.data = $scope.dataLoaded = result.data.Results; //apply loaded Data
                $scope.gridApi.grid.options.totalItems = result.data.RowCount; //used to display paggination toal
                $scope.gridApi.grid.modifyRows($scope.dynamicGrid.data);
                $scope.loadingState = false;
            });
        } else {
            DynamicApiService.getDynamicObjectData(apiControllerName, parameters).then(function (result) { //Rest Get call for data using Api service to call Webapi
                if (result.data.Results.length < 1) {
                    tosterFactory.showCustomToast('No Results found', 'info');
                }
                if ($scope.entityIdentifier == 'PricelistMaster') {
                    $scope.salesTypes = $scope.salesTypes.map(function (obj) {
                        obj.SalesTypeId = obj.Id;
                        //obj.SalesTypeDescription = obj.Description;//obj.ticked = false;
                        return obj;
                    });

                    angular.forEach($scope.dynamicGrid.columnDefs, function (cd) {
                        if (cd.field == 'AssociatedSalesTypes') { cd.editDropdownOptionsArray = angular.copy($scope.salesTypes); }
                    })
                }
                //check for columns group priority 
                $scope.dynamicGrid.data = $scope.dataLoaded = result.data.Results; //apply loaded Data
                $scope.gridApi.grid.options.totalItems = result.data.RowCount; //used to display paggination toal
                $scope.gridApi.grid.modifyRows($scope.dynamicGrid.data);
                $scope.loadingState = false;
            });
        }
    };
    $scope.uploadModel = {
        controllerName: 'Upload',
        actionName: 'staff',
        extraData: 1,//represents storeinfo.Id
        externalDirectory: 'region'
    };
    $scope.updateStaffPicture = function (row) {
        $mdDialog.show({
            controller: function ($scope, $mdDialog, dataUtilFactory, config, auth, rowEntity, uploadModel) {
                $scope.selectedImg = {};
                $scope.selectedImg.ImageUri = rowEntity.ImageUri;
                $scope.uploadModel = uploadModel;

                $scope.hide = function () { $mdDialog.hide(); };
                $scope.cancel = function () { $mdDialog.cancel(); };
                $scope.confirm = function (answer) {
                    $mdDialog.hide($scope.selectedImg.ImageUri);
                }
            },
            template: '<md-dialog aria-label="tableModel" ng-cloak style="min-width: 35vw; min-height: 41vh;" layout="column" layout-align="space-between stretch"><div ng-include src="\'loadStaffImageModal\'"></div></md-dialog>',
            parent: angular.element('#wrapper'),
            clickOutsideToClose: true,
            fullscreen: $mdMedia('sm'),
            resolve: {
                rowEntity: function () { return row.entity; },
                uploadModel: function () { return $scope.uploadModel; }
            }
        }).then(function (retdata) {
            row.entity.ImageUri = retdata;
            $scope.gridApi.selection.selectRow(row);
            $scope.gridApi.rowEdit.setRowsDirty([row.entity]);
        })
    }
    //add new row on Dynamic grid with Id to 0 
    $scope.addData = function () {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        var formModel = {
            entityIdentifier: $scope.entityIdentifier,
            dropDownObject: $scope.filtersObjArray,
            title: 'Zavara'
        }
        if ($scope.entityIdentifier == 'Ingredients') {
            formModel = angular.extend(formModel, { codeChanged: ($scope.BIconf.BIPolicy.Ingredients.UniqueCode != true) ? null : $scope.RestPromice.checkUniqueCodes });
        }
        var dataEntry = {};
        $mdDialog.show({
            controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html',
            parent: angular.element('#wrapper'),//document.body),
            //targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: useFullScreen,
            resolve: {
                formModel: function () { return formModel; },
                dataEntry: function () { return dataEntry; },
            }
        }).then(function (data) {
            $scope.savingProcess = true;
            if ($scope.entityIdentifier == 'Staff') {
                data.Id = 0; data.IsDeleted = false;
                data.FullName = data.FirstName + ' ' + data.LastName;
                var arr = [];
                angular.forEach(data.StaffAuthorization, function (value) {
                    var authDTO = { Id: 0, StaffId: 0, IsDeleted: false, AuthorizedGroupId: value, Description: $scope.authorizedGroupsEnum[value] };
                    arr.push(authDTO);
                })
                data.StaffAuthorization = arr;
                arr = [];
                angular.forEach(data.StaffPositions, function (value) {
                    var posDTO = { Id: 0, StaffId: 0, IsDeleted: false, StaffPositionId: value, Description: $scope.staffPositionsEnum[value] };
                    arr.push(posDTO);
                })
                data.StaffPositions = arr;
                //Id	 Code FirstName	 LastName	ImageUri	Password	 FullName	IsDeleted StaffAuthorization StaffPositions	
                DynamicApiService.postAttributeRoutingData("Staff", "Add", data).then(function (result) {
                    tosterFactory.showCustomToast('New entry inserted successfully.', 'success');
                    $scope.getData();
                    $scope.savingProcess = false;
                }), function (result) {
                    tosterFactory.showCustomToast('Inserting new row failed', 'fail');
                    console.log('Error Load'); console.log(reason);
                    $scope.savingProcess = false;
                };
            } else {
                if ($scope.entityIdentifier == 'ClientPos') {
                    if (typeof data.Status == 'boolean') {
                        data.Status = (data.Status == true) ? 1 : 0;
                    }
                    else {
                        data.Status = 0;
                    }
                }
                if ($scope.entityIdentifier == 'PricelistMaster') {
                    var arr = [];
                    angular.forEach(data.AssociatedSalesTypes, function (value) {
                        var salesDTO = { Id: 0, PricelistMasterId: 0, IsDeleted: false, SalesTypeId: value, SalesTypeDescription: $scope.salesTypesEnum[value] };
                        arr.push(salesDTO);
                    })
                    data.AssociatedSalesTypes = arr;
                }
                //on save button confirm 
                DynamicApiService.postSingle($scope.entityIdentifier, data).then(function (result) {
                    tosterFactory.showCustomToast('New entry inserted successfully.', 'success');
                    $scope.getData(); $scope.savingProcess = false;
                }).catch(function (result) {
                    tosterFactory.showCustomToast('Inserting new row failed', 'fail');
                    console.log('Error Load'); console.log(reason);
                    $scope.getData();
                    $scope.savingProcess = false;
                });
            }
        });
    }
    //Single DEL triggers simple modal on confirm REST by row.Identifier
    $scope.removeModel = function () {
        if ($scope.lastSelectedRow == undefined || $scope.lastSelectedRow.entity == undefined) {
            tosterFactory.showCustomToast('No line selected. Please select a line to delete.', 'warning');
        }
        else {
            var deleteDialog = $mdDialog.confirm().title('Deleting table row')
                .textContent('You have selected a(n) "' + $scope.entityIdentifier + '" entry to delete.\n Proceed and delete item ?')
                .ariaLabel('dynamicrm' + $scope.entityIdentifier).ok('Delete').cancel('Cancel');
            $mdDialog.show(deleteDialog).then(function () {
                var dataToDel = $scope.lastSelectedRow.entity.Id;
                if ($scope.entityIdentifier == 'Staff') {
                    $scope.savingProcess = true;
                    DynamicApiService.deleteAttributeRoutingData("Staff", "DeleteRange", [dataToDel]).then(function (result) {
                        tosterFactory.showCustomToast('Entry deleted successfully.', 'success');
                        $scope.lastSelectedRow = null; $scope.getData();
                        $scope.savingProcess = false;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Delete failed', 'fail');
                        console.log('Fail delete'); console.log(reason);
                        $scope.savingProcess = false;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Delete failed', 'error');
                        console.log('Error delete'); console.log(reason);
                        $scope.savingProcess = false;
                    });
                } else {
                    $scope.savingProcess = true;
                    //user react on Confim of deletion // run service of single del  to master row.entity.Id == model.Id
                    DynamicApiService.deleteSingle($scope.entityIdentifier, dataToDel).then(function (result) {
                        tosterFactory.showCustomToast('Entry deleted successfully.', 'success');
                        $scope.lastSelectedRow = null; $scope.getData();
                        $scope.savingProcess = false;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Delete failed', 'fail');
                        console.log('Fail delete'); console.log(reason);
                        $scope.savingProcess = false;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Delete failed', 'error');
                        console.log('Error delete'); console.log(reason);
                        $scope.savingProcess = false;
                    });
                }
            });
        }
    }
    // $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
    //used to init cellfilter Arrays for dropDown Etc
    //NOT USED REMOVE  ..
    $scope.getArrayType = function (dyntype) { return $scope.filtersObjArray[dyntype]; }

    //A function that can be accessed only when view is on AccountMapping
    $scope.cloneAccountMappings = function () {
        if ($scope.entityIdentifier != 'AccountMapping') {
            alert('Trying to use account mapping clone functionality where edit option does not match.'); return;
        } else if ($scope.lastSelectedRow == undefined || $scope.lastSelectedRow.entity == undefined) {
            tosterFactory.showCustomToast('No selected row please select a row first', 'info'); return;
        } else {
            console.log($scope.lastSelectedRow);
            var cloneEnt = angular.extend({}, $scope.lastSelectedRow.entity);
            var formModel = { entityIdentifier: $scope.entityIdentifier, dropDownObject: $scope.filtersObjArray } //,title: 'Zavara'
            $mdDialog.show({
                controller: 'CloneAccountMappingModalCtrl', templateUrl: '../app/scripts/directives/gridDirectives/clone-accountmaping-template.html',
                parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true, //targetEvent: ev,
                resolve: { formModel: function () { return formModel; }, cloneEnt: function () { return cloneEnt; }, }
            }).then(function (data) {
                if (data == undefined || data.length <= 0) {
                    tosterFactory.showCustomToast('No Changes to apply', 'info'); return;
                } else {
                    $scope.postRange(data);
                }
            })
        }
    }

    $scope.postRange = function (arr) {
        $scope.savingProcess = true;
        var postPromise = DynamicApiService.postAttributeRoutingData('AccountMappings', 'AddRange', arr).then(function (result) {
            tosterFactory.showCustomToast($scope.entityIdentifier + ' saved successfully', 'success');
        }).catch(function (result) { tosterFactory.showCustomToast('Ingredient association failed', 'fail'); console.log('Multi insert Error multi vars'); console.log(result); }).finally(function () {
            $scope.savingProcess = false; $scope.getData();
        });

    }
    //used to export Document
    //Export Vars and Function
    $scope.export_format = "csv";            //$scope.export_format;
    $scope.export_row_type = 'all';            //$scope.export_row_type;
    $scope.export_column_type = 'visible';            //$scope.export_column_type;
    $scope.export = function () {
        if ($scope.export_format == 'csv') {
            var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
            $scope.gridApi.exporter.csvExport($scope.export_row_type, $scope.export_column_type, myElement);
        } else if ($scope.export_format == 'pdf') {
            $scope.gridApi.exporter.pdfExport($scope.export_row_type, $scope.export_column_type);
        };
    };
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
            $scope.gridApi.selection.selectRow(row);
            $scope.gridApi.rowEdit.setRowsDirty([row.entity]);
        })
    }


    $scope.checkUniqueIngrCode = function () {
        //if ($scope.BIconf.BIPolicy.Ingredients.UniqueCode != true) {
        //    return true;
        //}
        //$scope.gridProdApi.selection.selectRow($scope.selectedRowProducts.entity);
    }
    $scope.RestPromice = {
        //Resource of lookups needed to manage lockers and side entities of forms
        'lookups': function (nameType) {
            return DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { return result; }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Lookups failed', 'fail');
                console.warn('Get lookups functionality on server failed. Reason:');
                console.warn(rejection); return null;
            });
        },
        'checkUniqueCodes': function (ing) {
            return DynamicApiService.getDynamicObjectData('Ingredients', "uniqueCode=" + ing.Code).then(function (result) {
                //if no results allow save
                if (result.data.Results.length < 1) { return true; }
                var ddar = angular.copy(result.data.Results);
                //filter those with actual same code and diff ID loaded and not string included as promise filter returned 
                var funique = ddar.filter(function (item) { return (item.Code == ing.Code && item.Id != ing.Id) })
                //if no result on filter then it is unique
                if (funique.length == 0) {
                    return true;
                } else { //else not a valid Code to save
                    (ing.Code == undefined || ing.Code == '') ?
                        tosterFactory.showCustomToast('#' + funique.length + ' with null or empty Code found.', 'warning')
                        : tosterFactory.showCustomToast('#' + funique.length + ' ingredient with same Code:"' + ing.Code + '" found. Provide unique code to save current Ingredient.', 'warning');
                    return false;
                }
            }).catch(function () {
                tosterFactory.showCustomToast('Error on checking unique code of Ingredient.', 'error'); return false;
            });
        },
    };
}

function getButtonSFE() {

    return { schema: schema, form: form, entity: entity };
}



