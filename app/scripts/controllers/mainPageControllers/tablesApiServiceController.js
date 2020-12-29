'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:TablesController
 * @description
 * # TablesController
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .controller('TablesController', ['tosterFactory', '$stateParams', '$scope', '$http', '$log', '$timeout', '$q', '$interval', 'auth', 'DynamicApiService', 'dataUtilFactory', 'tablesFactory', '$mdSidenav', '$mdDialog', '$mdMedia', 'gridsterConfig',
        function (tosterFactory, $stateParams, $scope, $http, $log, $timeout, $q, $interval, auth, DynamicApiService, dataUtilFactory, tablesFactory, $mdSidenav, $mdDialog, $mdMedia, gridsterConfig) {
            $scope.initView = function () {
                initViewVars();
                var regionPromise = $scope.getDropDownLookUps('Region');
                var posInfoPromise = $scope.getDropDownLookUps('PosInfo');
                $q.all([regionPromise, posInfoPromise]).then(function () {
                    // regionChanged($scope.regions[1]);
                });
            }
            $scope.lockSettingsBar = false;
            $scope.togglePanelSettings = buildDelayedToggler('tableSettingsPanel');
            function buildDelayedToggler(navID) {
                return debounce(function () {
                    // Component lookup should always be available since we are not using `ng-if`
                    $mdSidenav(navID)
                        .toggle()
                        .then(function () {
                        });
                }, 200);
            }
            function debounce(func, wait, context) {
                var timer;
                return function debounced() {
                    var context = $scope,
                        args = Array.prototype.slice.call(arguments);
                    $timeout.cancel(timer);
                    timer = $timeout(function () {
                        timer = undefined;
                        func.apply(context, args);
                    }, wait || 10);
                };
            }

            function initViewVars() {
                //init lookups
                $scope.regions = []; $scope.posInfo = []; $scope.tables = [];
                $scope.tableSizeOptions = tablesFactory.models();
                $scope.selectedRegion = null;
                $scope.sRegionTables = [];
                $scope.panelOption = 'Table Settings'; //'Multiselect Settings';
                //rightPanel Vars
                //$scope.numInsTables = 1; $scope.fromCodeIns = 0; $scope.toCodeIns = 1; //$scope.prefixNameIns = '';
                $scope.searchText = '';
                $scope.selectedWidget = angular.copy(tablesFactory.defaultWidgetModel);

                $scope.multiAddTablesFromWidget = []; $scope.erroredCodes = [];
                $scope.choiceSelected = null; $scope.rightClickedWidget = null; $scope.rightClickedTable = null;
            }

            //Function switched by entity called with External Params 
            //Fills LookUps Data and grids Data rows
            $scope.getDropDownLookUps = function (entity, customparams) {
                switch (entity) {
                    case 'Region': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                        $scope.regions = angular.copy(result.data); //loadedRegions
                        var propertyArr = Object.getOwnPropertyNames(tablesFactory.defaultTableModel);
                        angular.forEach($scope.regions, function (region) {
                            region.Table = dataUtilFactory.transformArrModels(region.Table, propertyArr);
                            region.Table = tablesFactory.createwidgetTables(region.Table, false, $scope.gridsterOpts, $scope.containerDisplaySize);
                        })
                    }, function (reason) {
                        tosterFactory.showCustomToast('Loading Region lookups failed', 'fail');
                        console.log('Fail Load'); console.log(reason);
                    })); break;

                    case 'PosInfo': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                        $scope.posInfo = result.data;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Loading PosInfo lookups failed', 'fail');
                        console.log('Fail Load'); console.log(reason);
                    })); break;

                    //GET api/Table?storeid={storeid}&regionId={regionId}
                    case 'Table': return (DynamicApiService.getDynamicObjectData(entity, customparams).then(function (result) {
                        $scope.tables = result.data;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Loading Table lookups failed', 'fail');
                        console.log('Fail Load'); console.log(reason);
                    })); break;
                    default: break;
                }
            }
            //DropDown functions 
            $scope.simulateQuery = false; $scope.isDisabled = false;
            // list of `state` value/display objects
            $scope.querySearch = querySearch;
            $scope.selectedItemChange = regionChanged;
            $scope.searchTextChange = searchTextChange;
            function searchTextChange(text) { $log.info('Text changed to ' + text); }
            /*** Search for regions... use $timeout to simulate* remote dataservice call.
             */
            function querySearch(query) {
                var results = query ? $scope.regions.filter(function (item) {
                    var smallDesc = angular.lowercase(item.Description);
                    return (smallDesc.indexOf(angular.lowercase(query)) !== -1);
                }) : $scope.regions,
                    deferred;
                if ($scope.simulateQuery) {
                    deferred = $q.defer();
                    $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
                    return deferred.promise;
                } else {
                    return results;
                }
            }

            function regionChanged(item) {
                if (item === undefined || item == null)
                    return;
                $scope.selectedRegion = item;
                if ($scope.selectedRegion.Table == [])
                    tosterFactory.showCustomToast('No tables on current Region', 'info');
            }
            $scope.containerfilter = function (item) {
                return (item.IsDeleted == true) ? false : true;
            }

            $scope.containerDisplaySize = { width: 1024, height: 768 };
            //GridSTER  Functions
            gridsterConfig.width = $scope.containerDisplaySize.width;
            $scope.gridsterOpts = {
                columns: 40,//(gridsterConfig.width / 25).toFixed(0), // the width of the grid, in columns
                pushing: false, // whether to push other items out of the way on move or resize
                floating: false, // whether to automatically float items up so they stack (you can temporarily disable if you are adding unsorted items with ng-repeat)
                swapping: false, // whether or not to have items of the same size switch places instead of pushing down if they are the same size
                width: '1024px', // can be an integer or 'auto'. 'auto' scales gridster to be the full width of its containing element
                colWidth: 25, // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
                rowHeight: 25, // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
                margins: [1, 1], // the pixel distance between each widget
                outerMargin: true, // whether margins apply to outer edges of the grid
                isMobile: false, // stacks the grid items if true
                mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
                mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
                minColumns: 1, // the minimum columns the grid must have
                minRows: 2, // the minimum height of the grid, in rows
                maxRows: ($scope.containerDisplaySize.height / 25).toFixed(0),
                //maxRows: 1000,//($scope.containerDisplaySize.height / 25).toFixed(0),
                defaultSizeX: 2, // the default width of a gridster item, if not specifed
                defaultSizeY: 2, // the default height of a gridster item, if not specified
                minSizeX: 1, // minimum column width of an item
                maxSizeX: null, // maximum column width of an item
                minSizeY: 1, // minumum row height of an item
                maxSizeY: null, // maximum row height of an item
                resizable: {
                    enabled: false,
                    handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
                    start: function (event, $element, widget) {
                        var stp;
                    }, // optional callback fired when resize is started,
                    resize: function (event, $element, widget) {
                        var rsz;
                    }, // optional callback fired when item is resized,
                    stop: function (event, $element, widget) {
                        var stp;
                    } // optional callback fired when item is finished resizing
                },
                draggable: {
                    enabled: true, // whether dragging items is supported
                    handle: '.widget-display-content', // optional selector for drag handle
                    start: function (event, $element, widget) {
                        var draggingTable = $scope.selectedRegion.Table.filter(function (item) {
                            var val = [item.widget].indexOf(widget);
                            if (val != -1) { return item; }
                        })
                        if (draggingTable.length > 1)
                            alert('Error on multi dragging:\n Unselected Draggable component not unique!\n Default attribute will based on' + draggingTable[0].Code);
                        if ($scope.enableMultiSelect == true && $scope.allowMultiSelectionCheck == false && draggingTable[0].multiselected == true) {
                            for (var i = 0; i < $scope.selectedRegion.Table.length; i++) {
                                var item = $scope.selectedRegion.Table[i];
                                if (item.multiselected == true) {
                                    $scope.selectedLength++;
                                    var obj = {
                                        Code: item.widget.Code,
                                        row: item.widget.row,
                                        col: item.widget.col,
                                        rowDiff: widget.row - item.widget.row,
                                        colDiff: widget.col - item.widget.col
                                    }
                                    $scope.assocsDrag[i] = obj;
                                }
                            }
                        }
                    }, // optional callback fired when drag is started,
                    drag: function (event, $element, widget) {
                        if ($scope.selectedLength > 1 && $scope.stickyMultiDrag == false) {
                            angular.forEach($scope.assocsDrag, function (value, key) {
                                if ($scope.selectedRegion.Table[Number(key)] === undefined || $scope.selectedRegion.Table[Number(key)] === null ||
                                    $scope.selectedRegion.Table[Number(key)].Code !== value.Code || $scope.selectedRegion.Table[Number(key)].multiselected != true) {
                                    alert('Error missmatch on multi drag state: drag');
                                    console.log($scope.selectedRegion.Table[Number(key)]);
                                }
                                $scope.selectedRegion.Table[Number(key)].widget.row = widget.row - value.rowDiff;
                                $scope.selectedRegion.Table[Number(key)].widget.col = widget.col - value.colDiff;
                            })
                        }
                    }, // optional callback fired when item is moved,
                    stop: function (event, $element, widget) {
                        if ($scope.selectedLength > 1) {
                            angular.forEach($scope.assocsDrag, function (value, key) {
                                if ($scope.selectedRegion.Table[Number(key)] === undefined || $scope.selectedRegion.Table[Number(key)] === null ||
                                    $scope.selectedRegion.Table[Number(key)].Code !== value.Code || $scope.selectedRegion.Table[Number(key)].multiselected != true) {
                                    alert('Error missmatch on multi drag state: drag');
                                    console.log($scope.selectedRegion.Table[Number(key)]);
                                }
                                $scope.selectedRegion.Table[Number(key)].widget.row = widget.row - value.rowDiff;
                                $scope.selectedRegion.Table[Number(key)].widget.col = widget.col - value.colDiff;
                            })
                        }
                        $scope.selectedLength = 0;
                        $scope.assocsDrag = {};
                    } // optional callback fired when item is finished dragging
                }
            };
            $scope.selectedLength = 0;
            $scope.assocsDrag = {};
            $scope.$watchGroup(['enableMultiSelect', 'allowMultiSelectionCheck'], function (newValues, oldValues, scope) {
                if (newValues[0] == true && newValues[1] == true) {
                    $scope.gridsterOpts.draggable.enabled = false; //multi select mode
                } else {
                    $scope.gridsterOpts.draggable.enabled = true; //noselect mode
                }
            });
            //ClearAllTables
            $scope.clear = function (ev) {
                var confirm = $mdDialog.confirm()
                    .title('Remove region tables').textContent('You are about to delete "' + $scope.selectedRegion.Description + '\'s" Tables. Action will perform on save proceed?')
                    .ariaLabel('remove' + $scope.selectedRegion.Description).targetEvent(ev)
                    .ok('Proceed').cancel('Cancel');
                $mdDialog.show(confirm).then(function () {
                    $scope.selectedRegion.isEdited = true;
                    angular.forEach($scope.selectedRegion.Table, function (item) {
                        item.IsDeleted = true;
                    })
                    $scope.selectedRegion.Table = $scope.selectedRegion.Table.filter(function (item) {
                        if (item.Id == 0 && item.IsDeleted == true)
                            return;
                        return item;
                    })
                }, function () {
                });
                //$scope.selectedRegion.Table = [];
            };
            //functions used in img upload
            $scope.uploadImgTeplate = '<i class="fa fa-image fa-fw"></i>';
            $scope.uploadModel = {
                controllerName: 'Upload',
                actionName: 'storeregion',
                extraData: 1, //represents storeinfo.Id
                externalDirectory: 'region'
            };
            //function to manage multi insert tables
            $scope.manageMultiaddVars = function (value, type) {
                $scope[type] = value;
                var tmp = $scope.numInsTables - 1 + $scope.fromCodeIns;
                $scope.toCodeIns = tmp;
            }
            //add button action of rightpanel Tables/addWidget
            $scope.addWidget = function () {
                if ($scope.numInsTables === undefined || $scope.numInsTables === null || $scope.numInsTables < 0) {
                    tosterFactory.showCustomToast('Number of insertions seams to be empty', 'info');
                    return;
                }
                if ($scope.selectedRegion === undefined || $scope.selectedRegion === null) {
                    tosterFactory.showCustomToast('Select a region to add', 'info');
                    return;
                }
                var checkType = ($scope.numInsTables == 1) ? 'single' : 'multi';
                if (checkValidCode(checkType)) {
                    if (checkType == 'single') {
                        var newTable = tablesFactory.createTableFromWidget($scope.selectedWidget);
                        insertTable(newTable);
                    }
                    if (checkType == 'multi') {
                        angular.forEach($scope.multiAddTablesFromWidget, function (preCode) {
                            var tmp = angular.copy($scope.selectedWidget);
                            tmp.Code = tmp.name = preCode;
                            tmp.row = null; tmp.col = null;
                            var newTable = tablesFactory.createTableFromWidget(tmp);
                            insertTable(newTable);
                        })
                    }

                }
            };
            //helper function of ass widget
            function insertTable(newTable) {
                $scope.selectedRegion.Table.push(newTable);
                $scope.selectedRegion.isEdited = true;
                var newWidget = angular.copy(newTable.widget);
                newWidget.Code = null;
                $scope.selectedWidget = angular.copy(newWidget);
            }
            //function to check if Code is unique for inserting
            function checkValidCode(type) {
                if (type == 'single') {
                    var searchCode = angular.copy($scope.selectedWidget.Code);
                    var res = []; res = $scope.selectedRegion.Table.filter(function (item) {
                        return (item.Code == searchCode);
                    })
                    if (res.length > 0) {
                        alert("Selected Code:" + searchCode + " allready exists in current region");
                        return false;
                    }
                    return true;
                }
                if (type == 'multi') {
                    $scope.multiAddTablesFromWidget = []; $scope.erroredCodes = [];
                    //create all codes by prefix-Code
                    for (var i = $scope.fromCodeIns; i <= $scope.toCodeIns; i++) {
                        var tmp = ($scope.prefixNameIns !== undefined && $scope.prefixNameIns !== null && $scope.prefixNameIns != '') ? $scope.prefixNameIns + i : i.toString();
                        $scope.multiAddTablesFromWidget.push(tmp);
                    }
                    //check Existing
                    var objOfCodes = dataUtilFactory.groupTo($scope.selectedRegion.Table, 'Code');
                    angular.forEach($scope.multiAddTablesFromWidget, function (item) {
                        if (objOfCodes[item] !== undefined) { $scope.erroredCodes.push(item); }
                    })
                    if ($scope.erroredCodes.length > 0) {
                        var displaytxt = 'Codes on current region allready exist:'
                        for (var i = 0; i < $scope.erroredCodes.length; i++) {
                            var txt = $scope.erroredCodes[i];
                            displaytxt += ' "' + txt + '"';
                        }
                        alert(displaytxt);

                    }
                    return ($scope.erroredCodes.length > 0) ? false : true;
                }
            }

            $scope.selectImageForWidget = function () {
                $mdDialog.show({
                    controller: 'ImageModalCtrl',
                    template: '<md-dialog class="fullscreen-dialog" aria-label="tableModel" ng-cloak style="min-width: 70vw; min-height:80vh;"><div ng-include src="\'loadImageModal\'"></div></md-dialog>',
                    parent: angular.element('#wrapper'),
                    clickOutsideToClose: true,
                    fullscreen: $mdMedia('sm'),
                    resolve: {
                        tableSizeOptions: function () { return $scope.tableSizeOptions; },
                        uploadModel: function () { return $scope.uploadModel; }
                    }
                }).then(function (retdata) {
                    $scope.selectedWidget.ImageUri = retdata.URI;
                })
            }

            //'Region Settings','Table Settings','Multi action properties'
            $scope.display = function (choice) {
                console.log($scope.selectedRegion.Table);
            }
            //predifined Table models
            $scope.openTableModelsModal = function () {
                var widget = null;
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
                $mdDialog.show({
                    controller: function ($scope, $mdDialog, tableSizeOptions) {
                        var mapped = tableSizeOptions.map(function (item) { item.selected = false; return item; });
                        $scope.tableModels = dataUtilFactory.groupTo(mapped, 'imgType');
                        $scope.modelTypes = Object.getOwnPropertyNames($scope.tableModels);
                        $scope.modelToIns = null;

                        var defaultFilter = { name: null, sizeX: null, sizeY: null, Capacity: null, imgType: 'All' }//'Graphics','Linear','Special','All'
                        $scope.samplefilter = angular.copy(defaultFilter);
                        $scope.clearsamplefilter = function () { $scope.samplefilter = angular.copy(defaultFilter); }

                        //drop select Type filter
                        $scope.imgTypeDropFilter = function (item) {
                            if ($scope.samplefilter.imgType == 'All') return true;
                            if (item == $scope.samplefilter.imgType) return true;
                            return false;
                        }
                        //img property filters
                        $scope.imgPropFilter = function (img) {
                            var vals = Object.getOwnPropertyNames($scope.samplefilter);
                            var notNull = vals.filter(function (item) {
                                if ($scope.samplefilter[item] !== undefined && $scope.samplefilter[item] !== null && item != 'imgType')
                                    return item;
                            })
                            for (var i = 0; i < notNull.length; i++) {
                                var filt = notNull[i];
                                if (filt == 'name') {
                                    if ($scope.samplefilter[filt] !== null && $scope.samplefilter[filt] != '') {
                                        var smallDescf = angular.lowercase($scope.samplefilter[filt]);
                                        var ind = img[filt].indexOf(angular.lowercase(smallDescf));
                                        if (ind == -1) return false;
                                    }
                                } else {
                                    if (img[filt] !== $scope.samplefilter[filt] && filt != 'imgType' && $scope.samplefilter[filt] !== null)
                                        return false;
                                }
                            }
                            return true;
                        }

                        $scope.imageSelectionAction = function (type, img) {
                            $scope.selectedImg.sampleImageUri = img.ImageUri;
                            $scope.selectedImg.sampleImgName = img.ImageName;
                        }
                        ///////////////////

                        $scope.modelToIns = null;
                        $scope.hide = function () { $mdDialog.hide(); };
                        $scope.cancel = function () { $mdDialog.cancel(); };
                        $scope.confirm = function (answer) {
                            var ret = { data: $scope.modelToIns }
                            $mdDialog.hide(ret);
                        }
                        $scope.selectModel = function (model) {
                            angular.forEach($scope.tableModels, function (value, key) {
                                value = value.filter(function (item) {
                                    item.selected = false; return item;
                                })
                            })
                            model.selected = true;
                            $scope.modelToIns = model;
                        }
                    },
                    template: '<md-dialog class="fullscreen-dialog" aria-label="tableModel" style="min-width: 80vw;"><div ng-include src="\'predifinedTablesModal\'"></div></md-dialog>',
                    parent: angular.element('#wrapper'),
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen,
                    resolve: {
                        tableSizeOptions: function () {
                            return $scope.tableSizeOptions;
                        }
                    }
                }).then(function (retdata) {
                    $scope.selectedWidget = angular.copy(retdata.data);
                })
            }
            $scope.openRegionModal = function (region) {
                var action = region, regionToEdit = {};
                if (action == 'edit') {
                    regionToEdit = angular.copy($scope.selectedRegion);
                    if ($scope.selectedRegion === null || $scope.selectedRegion === undefined) {
                        tosterFactory.showCustomToast('Please select a region to Edit', 'info');
                        return;
                    }
                }
                if (action == 'add') {
                    if ($scope.selectedRegion !== null && $scope.selectedRegion !== undefined && $scope.selectedRegion.isEdited == true) {
                        tosterFactory.showCustomToast('Save current region to proceed creating a new one', 'info');
                    }
                    regionToEdit = {};
                }

                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));// && $scope.customFullscreen;
                $mdDialog.show({
                    controller: function ($scope, $mdDialog, region) {
                        $scope.loadingImage = false;
                        $scope.region = angular.copy(region);
                        $scope.hide = function () { $mdDialog.hide(); };
                        $scope.cancel = function () { $mdDialog.cancel(); };
                        $scope.confirm = function (answer) {
                            var ret = { data: $scope.region }
                            $mdDialog.hide(ret);
                        }
                        $scope.uploadModel = {
                            controllerName: 'Upload',
                            actionName: 'storeregion',
                            extraData: 1, //represents storeinfo.Id
                            externalDirectory: 'region'
                        };
                        $scope.loadingImage = false;
                        $scope.$watch('loadingImage', function (newValue, oldValue) {
                            if (newValue != true) {
                                $scope.percentProccess = 0;
                                return;
                            }
                            $scope.step = 10;
                            $scope.percentProccess = $interval(function () {
                                if ($scope.percentProccess > 100) {
                                    $scope.percentProccess = 0;
                                } else {
                                    $scope.percentProccess += $scope.step;
                                }
                            }, 1);

                        });
                    },
                    template: '<md-dialog aria-label="tableModel" ng-cloak style="min-width: 50vw;"><div ng-include src="\'regionFormModal\'"></div></md-dialog>',
                    parent: angular.element('#wrapper'), clickOutsideToClose: true,
                    fullscreen: useFullScreen,
                    resolve: {
                        region: function () { return regionToEdit; }
                    }
                }).then(function (retdata) {
                    if (action == 'edit') {
                        $scope.selectedRegion = angular.extend($scope.selectedRegion, retdata.data);
                        $scope.selectedRegion.isEdited = true;
                        $scope.searchText = $scope.selectedRegion.Description;
                        //$scope.searchTextChange($scope.selectedRegion.Description);
                    }
                    if (action == 'add') {
                        var newR = angular.copy(retdata.data);
                        newR.Id = 0; newR.isEdited = true;
                        newR.Table = [];
                        $scope.regions.push(newR);
                        regionChanged(newR);
                    }
                })
                var authSpecs = auth.getLoggedSpecs();
            }
            $scope.deleteRegion = function () {
                if ($scope.selectedRegion === undefined || $scope.selectedRegion === null) {
                    tosterFactory.showCustomToast('Select a region to delete', 'info');
                    return;
                }
                var confirm = $mdDialog.confirm().title('Delete Region').textContent('Are you sure you want to delete region: ' + $scope.selectedRegion.Description + '?')
                    .ariaLabel('removing region' + $scope.selectedRegion.Description)
                    //.targetEvent(ev)
                    .ok('Remove')
                    .cancel('Cancel');
                $mdDialog.show(confirm).then(function () {
                    if ($scope.selectedRegion.Id == 0) {
                        $scope.initView();
                        ///alert('Just remove from regions');
                    } else if ($scope.selectedRegion.Id > 0) {
                        DynamicApiService.deleteAttributeRoutingData('Region', 'DeleteRange', [$scope.selectedRegion.Id]).then(function (result) {
                            tosterFactory.showCustomToast('Region updated succesfully', 'success');
                            $scope.initView();
                        }, function (reason) {
                            tosterFactory.showCustomToast('Region\'s update failed', 'fail');
                            console.log('Error update'); console.log(reason);
                        }, function (error) {
                            tosterFactory.showCustomToast('Error on Region\'s update', 'error');
                            console.log('Error update'); console.log(error);
                        })
                    }
                });
            }

            $scope.enableMultiSelect = false;
            $scope.allowMultiSelectionCheck = true;
            $scope.stickyMultiDrag = false;
            $scope.$watch('panelOption', function (newVal, oldVal) {
                if (newVal != 'Multiselect Settings') {
                    $scope.enableMultiSelect = false;
                    if ($scope.backupGridsterModel !== undefined && $scope.backupGridsterModel != null) {
                        $scope.gridsterOpts = angular.extend($scope.backupGridsterModel, $scope.gridsterOpts);
                    }
                }
                if (newVal == 'Multiselect Settings') {
                    $scope.enableMultiSelect = true;
                    $scope.backupGridsterModel = angular.copy($scope.gridsterOpts);
                    manageDefaultMultiGridOptions();
                }
            });

            function manageDefaultMultiGridOptions() {
                $scope.gridsterOpts.pushing = false; $scope.gridsterOpts.floating = false; $scope.gridsterOpts.swapping = false;
                $scope.gridsterOpts.resizable.enabled = false;
            }
            $scope.containerLeftClick = function (event, table) {
                if ($scope.enableMultiSelect == true && $scope.allowMultiSelectionCheck == true) {
                    if (table !== undefined && table !== null)
                        table.multiselected = (table.multiselected != true) ? true : false;
                }
            }
            $scope.multiAction = function (action, mvmodel) {
                switch (action) {
                    case 'resize':
                        
                        angular.forEach($scope.selectedRegion.Table, function (item) {
                            if (item.multiselected == true) {
                                item.widget.sizeX = mvmodel.sizeX;
                                item.widget.sizeY = mvmodel.sizeY;
                                $scope.selectedRegion.isEdited = true;
                            }
                        });
                        manageDefaultMultiGridOptions();
                        break;
                    case 'space':
                        break;
                    case 'image':
                        $mdDialog.show({
                            controller: 'ImageModalCtrl',
                            template: '<md-dialog class="fullscreen-dialog" aria-label="tableModel" ng-cloak style="min-width: 70vw; min-height:80vh;"><div ng-include src="\'loadImageModal\'"></div></md-dialog>',
                            parent: angular.element('#wrapper'),
                            clickOutsideToClose: true,
                            fullscreen: $mdMedia('sm'),
                            resolve: {
                                tableSizeOptions: function () { return $scope.tableSizeOptions; },
                                uploadModel: function () { return $scope.uploadModel; }
                            }
                        }).then(function (retdata) {
                            angular.forEach($scope.selectedRegion.Table, function (item) {
                                if (item.multiselected == true) {
                                    item.widget.ImageUri = retdata.URI;
                                    $scope.selectedRegion.isEdited = true;
                                }
                            });
                        })
                        break;
                    case 'image-clear':
                        angular.forEach($scope.selectedRegion.Table, function (item) {
                            if (item.multiselected == true) {
                                item.widget.ImageUri = null;
                                $scope.selectedRegion.isEdited = true;
                            }
                        });
                        break;
                    case 'delete':
                        var selectedTables = $scope.selectedRegion.Table.filter(function (item) {
                            return (item.multiselected == true);
                        })
                        var confirm = $mdDialog.confirm().title('Multiple Delete Tables').textContent('You have selected (' + selectedTables.length + ') table to delete.\n Proceed and delete them ?')
                            .ariaLabel('removeMultiSelectedTables').ok('Remove').cancel('Cancel');
                        $mdDialog.show(confirm).then(function () {
                            $scope.selectedRegion.Table = $scope.selectedRegion.Table.filter(function (item) {
                                if (item.multiselected == true) {
                                    item.IsDeleted = true;
                                    $scope.selectedRegion.isEdited = true;
                                }
                                return item;
                            })
                        });
                        break;
                    case 'toggle':
                        $scope.toggleSelection(mvmodel);
                        break;
                    case 'rearrange':
                        var tablebu = [];
                        tablebu = angular.copy($scope.selectedRegion.Table);
                        $scope.selectedRegion.Table = [];
                        tablebu = dataUtilFactory.quicksort(tablebu, 'Id');
                        $scope.selectedRegion.Table = tablebu.map(function (ti) { ti.widget.row = null; ti.widget.col = null; return ti; })
                        //$scope.selectedRegion.Table = tablesFactory.createwidgetTables(tablebu, true, $scope.gridsterOpts, $scope.containerDisplaySize);
                        $scope.selectedRegion.isEdited = true;
                        break;
                    default:
                        tosterFactory.showCustomToast('Not a valid multi action', 'info');
                }


            }
            $scope.toggleSelection = function (choice) {
                angular.forEach($scope.selectedRegion.Table, function (value) {
                    value.multiselected = choice;
                })
            }
            //SAVE MANAGEMENT
            $scope.saveChanges = function () {
                if ($scope.selectedRegion == null || $scope.selectedRegion === undefined)
                    return;
                var saveModel = {
                    Id: $scope.selectedRegion.Id,
                    Description: $scope.selectedRegion.Description,
                    StartTime: ($scope.selectedRegion.StartTime !== undefined) ? $scope.selectedRegion.StartTime : null,
                    EndTime: ($scope.selectedRegion.EndTime !== undefined) ? $scope.selectedRegion.EndTime : null,
                    BluePrintPath: ($scope.selectedRegion.BluePrintPath !== undefined) ? $scope.selectedRegion.BluePrintPath : null,
                    MaxCapacity: $scope.selectedRegion.MaxCapacity,
                    PosInfoId: ($scope.selectedRegion.PosInfoId !== undefined) ? $scope.selectedRegion.PosInfoId : null,
                    IsLocker: ($scope.selectedRegion.IsLocker !== undefined) ? $scope.selectedRegion.IsLocker : null,
                    AssociatedPos: [],
                    AssociatedTables: []
                }

                var tables = tablesFactory.algorithm.manageTablesToSave($scope.selectedRegion.Table, $scope.gridsterOpts, $scope.containerDisplaySize)
                tables = tables.map(function (item) { item.RegionId = saveModel.Id; return item; })
                saveModel.AssociatedTables = tables;
                if (saveModel.Id == 0) {
                    DynamicApiService.postAttributeRoutingData('Region', 'Add', saveModel).then(function (result) {
                        tosterFactory.showCustomToast('Region updated succesfully', 'success');
                        $scope.initView();
                    }, function (reason) {
                        tosterFactory.showCustomToast('Region\'s update failed', 'fail');
                        console.log('Fail update'); console.log(reason);
                    }, function (error) {
                        tosterFactory.showCustomToast('Error on Region\'s update', 'error');
                        console.log('Fail update'); console.log(error);
                    })
                } else if (saveModel.Id != 0) {
                    DynamicApiService.putAttributeRoutingData('Region', 'UpdateRange', [saveModel]).then(function (result) {
                        tosterFactory.showCustomToast('Region updated succesfully', 'success');
                        $scope.initView();
                    }, function (reason) {
                        tosterFactory.showCustomToast('Region\'s update failed', 'fail');
                        console.log('Fail update'); console.log(reason);
                    }, function (error) {
                        tosterFactory.showCustomToast('Error on Region\'s update', 'error');
                        console.log('Fail update'); console.log(error);
                    })
                } else {
                    alert('Error on saving savemodelId:' + saveModel.Id)
                }

            }
            /////////////////////////////////////////////////////// MENU ACTIONS /////////////////////////////////////
            //rightclick menu  initiallizations
            $scope.menuOptions = {
                top: 0, bottom: 215.5,
                left: 0, right: 132,
                height: 18, width: 29,
            }
            //rClick Table menu choices
            $scope.actionChoices = [
                { action: 'edit', desc: 'Edit', iconClass: 'fa fa-edit fa-fw' },
                { action: 'remove', desc: 'Delete', iconClass: 'fa fa-trash fa-fw' },
                { action: 'copy', desc: 'Copy', iconClass: 'fa fa-copy fa-fw' },
            ];

            //rightClick Handler used to fix absolute top and bottom menu according to object caller
            $scope.containerRightClick = function ($event, table) {
                $scope.rightClickedTable = table;
                $scope.rightClickedTable.widget.isMenuOpen = true;
                $scope.rightClickedWidget = $scope.rightClickedTable.widget;

                $scope.menuOptions = angular.element($event.target)[0].getBoundingClientRect();

            }
            $scope.$watch('choiceSelected', function (newVal, oldVal) {
                if (newVal == null) return;
                $scope.menuActionPressed(newVal);
            });
            $scope.menuActionPressed = function (choice) {
                $scope.choiceSelected = null;
                //DO NOT delete this ... It is watchers handler
                $scope.rightClickedTable.widget.isMenuOpen = false;
                $scope.rightClickedWidget.isMenuOpen = false;
                switch (choice.action) {
                    case 'edit': $scope.openSettings($scope.rightClickedTable); break;
                    case 'remove': $scope.remove($scope.rightClickedTable.widget); break;
                    case 'copy': $scope.copySelectedTable($scope.rightClickedTable.widget); break;
                    default: break;
                }
            }
            $scope.copySelectedTable = function (widget) {
                $scope.selectedWidget = angular.copy(widget);
                $scope.selectedWidget.Id = 0;
                $scope.selectedWidget.Code = null;
            }
            $scope.remove = function (widget) {
                var confirm = $mdDialog.confirm().title('Delete').textContent('Remove table: ' + widget.Code + '?').ariaLabel('removing item' + widget.Code).ok('Remove').cancel('Cancel');
                $mdDialog.show(confirm).then(function () {
                    $scope.selectedRegion.Table = $scope.selectedRegion.Table.filter(function (item) {
                        var val = [item.widget].indexOf(widget);
                        if (val != -1) {
                            item.IsDeleted = true;
                            $scope.selectedRegion.isEdited = true;
                        }
                        return item;
                    })
                });
            };
            $scope.openSettings = function (callerTable) {
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
                $mdDialog.show({
                    controller: function (tosterFactory, $scope, $mdDialog, calledtable, sRegion, uploadModel) {
                        $scope.uploadModel = angular.copy(uploadModel)
                        $scope.ctable = angular.copy(calledtable);
                        $scope.sRegion = sRegion;

                        $scope.hide = function () { $mdDialog.hide(); };
                        $scope.cancel = function () { $mdDialog.cancel(); };
                        $scope.confirm = function (answer) {
                            if (isCodeValid() == true) {
                                var tcode = $scope.ctable.Code;
                                $scope.ctable.Description = tcode; $scope.ctable.SalesDescription = tcode;
                                var ret = { data: $scope.ctable }
                                $mdDialog.hide(ret);
                            }
                            else { $scope.ctable.Code = null; }
                        };
                        function isCodeValid(table) {
                            var searchCode = $scope.ctable.Code;
                            var res = []; res = $scope.sRegion.Table.filter(function (item) {
                                return (item.Code == searchCode && item.Id != $scope.ctable.widget.Id);
                            })
                            if (res.length > 0) {
                                tosterFactory.showCustomToast('Code: ' + searchCode + ' allready exists in current region', 'warning');
                                return false;
                            }
                            return true;
                        }
                    },
                    template: '<md-dialog aria-label="SettingsModal" ng-cloak style="min-width: 50vw;"><div ng-include src="\'tableModal\'"></div></md-dialog>',
                    parent: angular.element('#wrapper'),
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen,
                    resolve: {
                        calledtable: function () { return callerTable; },
                        sRegion: function () { return $scope.selectedRegion; },
                        uploadModel: function () { return $scope.uploadModel; },
                    }
                }).then(function (retdata) {
                    var mapped = $scope.mapTableWidget(retdata.data);
                    callerTable = angular.extend(callerTable, mapped);
                    callerTable.widget.ImageUri = callerTable.ImageUri;
                    $scope.selectedRegion.isEdited = true;
                })

            };
            //manages table widget after edit on modal
            $scope.mapTableWidget = function (item) {
                item.Angle = (item.Angle !== undefined && item.Angle !== null && item.Angle !== '') ? Number(item.Angle) : 0;
                if (item.ImageUri === undefined || item.ImageUri === null || item.ImageUri == '')
                    item.ImageUri = null;
                var tmpWid = {
                    Id: item.Id,
                    name: item.Description,
                    Code: item.Code,
                    ImageUri: (item.ImageUri === undefined || item.ImageUri === null || item.ImageUri == '') ? null : item.ImageUri,
                    Angle: item.Angle,
                    Capacity: item.MaxCapacity
                }
                item.widget = angular.extend(item.widget, tmpWid);
                return item;
            }
        }])
    .controller('ImageModalCtrl', ['$scope', '$mdDialog', 'dataUtilFactory', 'config', 'auth', 'tableSizeOptions', 'uploadModel', function ($scope, $mdDialog, dataUtilFactory, config, auth, tableSizeOptions, uploadModel) {
        $scope.tableModels = dataUtilFactory.groupTo(tableSizeOptions, 'imgType');
        $scope.selectedImg = {
            uploadedImageUri: null,
            sampleImageUri: null,
            sampleImgName: null
        }
        $scope.uploadModel = uploadModel;
        $scope.modelTypes = Object.getOwnPropertyNames($scope.tableModels);
        $scope.loadingImage = false;
        $scope.modelToIns = null;
        $scope.choiceUse = 'sample';

        var defaultFilter = { name: null, sizeX: null, sizeY: null, Capacity: null, imgType: 'All' }//'Graphics','Linear','Special','All'
        $scope.samplefilter = angular.copy(defaultFilter);
        $scope.clearsamplefilter = function () { $scope.samplefilter = angular.copy(defaultFilter); }

        //drop select Type filter
        $scope.imgTypeDropFilter = function (item) {
            if ($scope.samplefilter.imgType == 'All') return true;
            if (item == $scope.samplefilter.imgType)
                return true;
            return false;
        }
        //img property filters
        $scope.imgPropFilter = function (img) {
            var vals = Object.getOwnPropertyNames($scope.samplefilter);
            var notNull = vals.filter(function (item) {
                if ($scope.samplefilter[item] !== undefined && $scope.samplefilter[item] !== null && item != 'imgType')
                    return item;
            })
            for (var i = 0; i < notNull.length; i++) {
                var filt = notNull[i];
                if (filt == 'name') {
                    if ($scope.samplefilter[filt] !== null && $scope.samplefilter[filt] != '') {
                        var smallDescf = angular.lowercase($scope.samplefilter[filt]);
                        var ind = img[filt].indexOf(angular.lowercase(smallDescf));
                        if (ind == -1) return false;
                    }
                } else {
                    if (img[filt] !== $scope.samplefilter[filt] && filt != 'imgType' && $scope.samplefilter[filt] !== null)
                        return false;
                }
            }
            return true;
        }

        $scope.imageSelectionAction = function (type, img) {
            if (type == 'sample') {
                $scope.choiceUse = 'sample';
                $scope.selectedImg.sampleImageUri = img.ImageUri;
                $scope.selectedImg.sampleImgName = img.ImageName;
            }
        }

        $scope.retUriConstructed = null;
        $scope.hide = function () { $mdDialog.hide(); };
        $scope.cancel = function () { $mdDialog.cancel(); };
        $scope.confirm = function (answer) {
            if (answer == 'no-image')
                $scope.choiceUse = null;
            switch ($scope.choiceUse) {
                case 'sample':
                    var authSpecs = auth.getLoggedSpecs();
                    var UploadedImgPrefix = config.WebApiURL.slice(0, -1) + '/images/DefaultTables/'
                    //FROM NAME CREATE URI
                    if ($scope.selectedImg.sampleImgName == null) {
                        $scope.retUriConstructed = null;
                    } else {
                        $scope.retUriConstructed = UploadedImgPrefix + $scope.selectedImg.sampleImgName;
                    }
                    break;
                case 'uploaded':
                    $scope.retUriConstructed = $scope.selectedImg.uploadedImageUri;
                    break; //created from uploader
                default: $scope.retUriConstructed = null; break;
            }
            var ret = { URI: $scope.retUriConstructed };
            $mdDialog.hide(ret);
        }
    }])
    .controller('WidgetSettingsCtrl', ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget', 'ngRightClick',
        function ($scope, $timeout, $rootScope, $modalInstance, widget, ngRightClick) {
            $scope.widget = widget;

            $scope.form = {
                name: widget.name,
                sizeX: widget.sizeX, sizeY: widget.sizeY,
                col: widget.col, row: widget.row
            };
            $scope.sizeOptions = [{ id: '1', name: '1' }, { id: '2', name: '2' }, { id: '3', name: '3' }, { id: '4', name: '4' }];
            $scope.dismiss = function () { $modalInstance.dismiss(); };

            $scope.remove = function () {
                $scope.standardItems.splice($scope.standardItems.indexOf(widget), 1);
                $modalInstance.close();
            };
            $scope.submit = function () {
                angular.extend(widget, $scope.form);
                $modalInstance.close(widget);
            };

        }
    ])





