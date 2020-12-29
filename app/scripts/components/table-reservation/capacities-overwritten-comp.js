'use strict';

angular.module('posBOApp')
    .controller('CapacitiesOverwrittenCompCTRL', ['$scope', '$state', '$filter', '$http', '$q', '$mdDialog', 'trFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', 'config', 'MaterialCalendarData',
        function CapacitiesCompCTRL($scope, $state, $filter, $http, $q, $mdDialog, trFactory, dataUtilFactory, tosterFactory, DynamicApiService, config, MaterialCalendarData) {
            var ctrl = this;
            ctrl.viewoptions = this.viewoptions;
            ctrl.svops = Object.getOwnPropertyNames(ctrl.viewoptions)[0];
            ctrl.shortViewOpSelected = ctrl.viewoptions[ctrl.svops];

            ctrl.devAccess = (config.workPolicy == 'dev') ? true : false;
            var dtu = dataUtilFactory;

            // Values of busy rest and Error functionallity 
            ctrl.restbusy = false; ctrl.hasError = false;
            // Enumerator over capacities Type
            // This has to be loaded from Api (Update: Loaded from api)
            ctrl.CapacitiesTypeEnum = {
                //0: 'AllDay', 1: 'Lunch', 2: 'Dinner',
            };
            // Initiallizes view 
            // Loads restaurants and Excluded Capacities 
            // Groups by Data and create exclutions for Calendar Components
            ctrl.initView = function (clearData) {
                ctrl.hasError = false; ctrl.restbusy = true;
                $q.all({
                    getret: ctrl.apiActions.GetReservationTypes(),
                    getres: ctrl.apiActions.GetRestaurants(),
                    getcap: ctrl.apiActions.GetCapacities(),
                    getovercap: ctrl.apiActions.GetOverwrittenCapacities(),
                }).then(function (d) {
                    try {
                        // Reservation Types
                        if (d.getret.data != -1) {
                            angular.forEach(d.getret.data, function (r) {
                                ctrl.CapacitiesTypeEnum[r.Type] = r.Description;
                            });
                        } else {
                            ctrl.hasError = true;
                            tosterFactory.showCustomToast('Loading reservation types failed', 'fail');
                        }
                        //Restaurants
                        if (d.getres.data != -1) {
                            ctrl.restaurants = d.getres.data;
                            ctrl.enumRest = dtu.createEnumObjs(ctrl.restaurants, {}, 'Id');
                        } else { ctrl.hasError = true; tosterFactory.showCustomToast('Loading Restaurants Failed', 'fail'); }
                        // Capacities
                        if (d.getcap.data != -1) {
                            ctrl.capacities = d.getcap.data;
                            ctrl.enumCap = dtu.groupTo(ctrl.capacities, 'RestId');
                            
                            ctrl.enumCap2lvl = dtu.groupLvl2(ctrl.capacities, 'RestId', 'Id');
                            // groupArray by Restaurant ID
                        } else { ctrl.hasError = true; tosterFactory.showCustomToast('Loading capacities Failed', 'fail'); }
                        // OverwrittenCapacities
                        if (d.getovercap.data != -1) {
                            ctrl.overwrittenCaps = d.getovercap.data;
                            ctrl.overwrittenCapsByDate = dtu.groupDateField3lvl(ctrl.overwrittenCaps, 'Date');
                            
                        } else { ctrl.hasError = true; tosterFactory.showCustomToast('Loading OverwrittenCapacities Failed', 'fail'); }
                    } catch (e) {
                        ctrl.hasError = true;
                        console.log('Init on TR - Overwritten Capacities failed due to : ');
                        console.warn(e);
                    }
                }).finally(function () {
                    if (ctrl.hasError != true && clearData) {
                        //ctrl.appendD
                        var d = new Date();
                        ctrl.ms = d.getMonth();
                        ctrl.ys = d.getFullYear();
                        // To select a single date, make sure the ngModel is not an array.
                        ctrl.selectedDate = null;
                        // If you want multi-date select, initialize it as an array.
                        //ctrl.selectedDate = [];
                        ctrl.firstDayOfWeek = 0;
                        // First day of the week, 0 for Sunday, 1 for Monday, etc.
                        ctrl.dayFormat = "d";
                        ctrl.setDirection('vertical');
                        //ctrl.setDirection('horizontal');
                        ctrl.tooltips = true;
                    }
                    ctrl.restbusy = false;
                })
            };
            //ctrl.direction = 'horizontal';
            ctrl.setDirection = function (direction) {
                ctrl.direction = direction;
                ctrl.dayFormat = ctrl.direction === "vertical" ? "EEEE, MMMM d" : "d";
            };

            ctrl.dayClick = function (date) { ctrl.msg = "You clicked " + $filter("date")(date, "MMM d, y h:mm:ss a Z"); };
            ctrl.prevMonth = function (data) { ctrl.msg = "You clicked (prev) month " + data.month + ", " + data.year; };
            ctrl.nextMonth = function (data) { ctrl.msg = "You clicked (next) month " + data.month + ", " + data.year; };

            // You would inject any HTML you wanted for
            // that particular date here.
            ctrl.setDayContent = function (date) {
                var y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
                var info = ctrl.CreateExcludedContent(y, m, d);
                var cont = (info != null) ? info : '';
                var containerclass = ''
                if (ctrl.direction == 'horizontal') {
                    containerclass = 'hor-calendar-container';
                } else if (ctrl.direction == 'vertical') {
                    containerclass = 'ver-calendar-container';
                }
                return '<div class="' + containerclass + '">' + cont + '</div>';
            };

            ctrl.setSelectedContent = function () { MaterialCalendarData.setDayContent(ctrl.selectedDate, '<span> ' + ctrl.contentToAdd + ' </span>') }
            ctrl.logGroups = function () { console.log(ctrl.overwrittenCapsByDate); }

            ctrl.CreateExcludedContent = function (y, m, d) {
                if (ctrl.overwrittenCapsByDate[y] != null && ctrl.overwrittenCapsByDate[y][m] != null && ctrl.overwrittenCapsByDate[y][m][d] != null) {
                    var arr = ctrl.overwrittenCapsByDate[y][m][d];
                    var htmltxt = '';
                    var list = '';
                    angular.forEach(arr, function (item) {
                        if (ctrl.enumCap2lvl[item.RestId] == null || ctrl.enumCap2lvl[item.RestId][item.CapacityId] == null || ctrl.enumCap2lvl[item.RestId][item.CapacityId][0] == null) {
                            tosterFactory.showCustomToast('Cant display Restaurant:' + item.RestId + ' with Capacity:' + item.CapacityId , 'fail'); 
                            console.log('item.RestId:' + item.RestId + ' item.CapacityId:' + item.CapacityId);
                            return;
                        }
                        var t = ctrl.enumCap2lvl[item.RestId][item.CapacityId][0];

                        if (ctrl.direction == 'horizontal') {
                            list += '<div class="calendar-tr-list-item">'
                                + ctrl.enumRest[item.RestId][ctrl.shortViewOpSelected.Name] + ' <strong style="padding:0px;">Capacity:</strong> '
                                + item.Capacity + ' <strong>Time:</strong> '
                                + ctrl.escape(t.Time) + ' <strong>Type:</strong> '// + t.Capacity + ' '
                                + ctrl.CapacitiesTypeEnum[t.Type]
                                + '</div>';

                        } else if (ctrl.direction == 'vertical') {
                            list += '<div class="calendar-tr-list-item">'
                                + ctrl.enumRest[item.RestId][ctrl.shortViewOpSelected.Name] + '  <strong style="padding:0px;">Capacity:</strong> '
                                + item.Capacity + ' <strong>Time:</strong> '
                                + ctrl.escape(t.Time) + ' <strong>Type:</strong> '// + t.Capacity + ' '
                                + ctrl.CapacitiesTypeEnum[t.Type]
                                + '</div>';
                        }
                    })
                    htmltxt = `
                                <h5 class="calendar-info-header">Overwrites `+ arr.length + `</h5>
                                <div class="calendar-tr-list">` + list + `</div>`
                    return htmltxt;
                }
            }
            ctrl.escape = function (s) {
                if (s == null) return; 
                var regexp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/g;
                var ret = s.match(regexp);
                return (ret.length > 0) ? ret[0] : s;
            };
            ctrl.editOnModal = function (type) {
                //ctrl.enumRest ctrl. ctrl.overwrittenCapsByDate
                var lookups = {
                    enumRestaurants: ctrl.enumRest,
                    enumCapacities: ctrl.enumCap,
                    enumCap2lvl: ctrl.enumCap2lvl,
                    CapacitiesTypeEnum: ctrl.CapacitiesTypeEnum,
                    dispRName: ctrl.shortViewOpSelected.Name
                }
                var groupDateCapacities = ctrl.overwrittenCapsByDate;
                $mdDialog.show({
                    controller: 'OverwrittenCapacitiesModalCtrl',
                    controllerAs: 'moc',
                    templateUrl: 'capacities-overw-modal',
                    parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                    resolve: {
                        lookups: function () { return lookups; },
                        groupDateCapacities: function () { return groupDateCapacities; },
                        selectedDate: function () { return ctrl.selectedDate; },
                        apiActions: function () { return ctrl.apiActions; }
                    }
                }).then(function (data) {
                    ctrl.initView();
                });
            }
        }
    ])
    .component('capacitiesOverwrittenComp', {
        templateUrl: 'app/scripts/components/table-reservation/templates/capacities-overwritten-comp.html',
        controller: 'CapacitiesOverwrittenCompCTRL',
        bindings: {
            viewoptions: '<',
            apiActions: '=',
            //onUpdate: '&'
        }
    })

    .controller('OverwrittenCapacitiesModalCtrl', function ($scope, $q, $mdDialog, lookups, groupDateCapacities, selectedDate, apiActions, tosterFactory, trFactory, DynamicApiService, dataUtilFactory) {
        var dtu = dataUtilFactory;
        var moc = this;
        // Rest Obj  , Enum RestRestrict , RestDisplayName
        moc.lookups = lookups;
        // Rest of ext capacities group by group to date oobj 
        moc.Group = groupDateCapacities;
        // Parent components Api calls funs
        moc.apiActions = apiActions;
        // Rest Action busy to modal proccecing functionallity
        moc.restbusy = false; moc.hasError = false;
        // Mode to switch on basic view option
        moc.mode = 'edit';
        // Obj to complete with form 
        moc.data = {
            Id: 0,
            RestId: null,
            CapacityId: null,
            Capacity: null,
            Date: new Date()
        };

        // fun to switch moe by literal 
        moc.switchmode = function (mode) {
            moc.mode = mode;
        }

        moc.init = function () {
            moc.exclutionsArray = [];
            try {
                var d
                if (selectedDate != null) {
                    d = new Date(selectedDate);
                } else {
                    d = new Date();
                }
                moc.data['Date'] = d;
                moc.viewDay = d;

            } catch (e) {
                moc.data['Date'] = new Date();
                moc.viewDay = new Date();
            }
            moc.onChangeViewDate(moc.viewDay);

        }
        moc.onChangeViewDate = function (date) {
            
            moc.viewDay = new Date(date);
            moc.DMR = {
                y: date.getFullYear(),
                m: date.getMonth(),
                d: date.getDate()
            }
            moc.manageViewArr(moc.DMR.y, moc.DMR.m, moc.DMR.d)
        }
        // Based on y, m, d  switches array to repeat registers of exclution on right display list
        moc.manageViewArr = function (y, m, d) {
            if (moc.Group[y] != null && moc.Group[y][m] != null && moc.Group[y][m][d] != null) {
                moc.exclutionsArray = moc.Group[y][m][d];
            } else {
                moc.exclutionsArray = [];
            }
        }
        // Clears selected Entity to avoid
        moc.clearSelection = function () {
            moc.processExt = null;
        }

        // UI list Action triggers mode delete 
        // switches view to delete for confirm
        moc.delete = function (m) {
            moc.processExt = m;
            moc.switchmode('remove');
        }
        // UI list Action triggers mode edit 
        // clones vars to data allows edit 
        moc.edit = function (m) {
            try {
                moc.processExt = m;
                moc.data.RestId = moc.processExt.RestId;
                moc.data.Date = new Date(moc.processExt.Date);
                moc.data.CapacityId = moc.processExt.CapacityId;
                moc.data.Capacity = moc.processExt.Capacity;
            } catch (e) { console.warn(e); moc.hasError = true; }
        }

        // Rest Action to delete ent
        moc.deleteConf = function () {
            var gt = moc.processExt;
            moc.apiActions.DeleteOverwrittenCapacity(gt.Id).then(function (res) {
                if (res != -1 && res != undefined) {
                    tosterFactory.showCustomToast('Overwritten Capacity deleted Successfully', 'success');
                    try {
                        var y = gt.dateObj.year, m = gt.dateObj.month, d = gt.dateObj.day;
                        moc.Group[y][m][d] = moc.Group[y][m][d].filter(function (item) { return item.Id != gt.Id; });
                        moc.onChangeViewDate(moc.viewDay); moc.processExt = null; moc.switchmode('edit');
                    } catch (e) { console.warn(e); moc.hasError = true; }
                } else {
                    tosterFactory.showCustomToast('OverwrittenCapacity Restriction delete Failed', 'error');
                }
            }).finally(function () {
                moc.restbusy = false;
            });
        }

        // Rest Action to Add
        moc.add = function () {
            moc.restbusy = true;
            var ado = angular.copy(moc.data);
            ado.Id = 0, ado.Date = ado.Date.toLocaleDateString("en-US");
            moc.apiActions.InsertOverwrittenCapacity(ado).then(function (res) {
                if (res != -1 && res != undefined) {
                    tosterFactory.showCustomToast('Overwritten Capacity added Successfully', 'success');
                    moc.loadAndAppend(res.data);//<-- Id
                } else {
                    tosterFactory.showCustomToast('Overwritten Capacity add Failed', 'error');
                }
            }).finally(function () {
                moc.restbusy = false;
            });
        }
        // loads by Id entity 
        // Creates group Obj extends main obj load arr 
        moc.loadAndAppend = function (Idload) {
            moc.restbusy = true;
            moc.apiActions.GetOverwrittenCapacityById(Idload).then(function (res) {
                if (res != -1 && res != undefined) {
                    try {

                        tosterFactory.showCustomToast('Overwritten Capacity loaded Successfully', 'success');
                        var gt = dtu.createDateObj(res.data, new Date(res.data['Date']));
                        var y = gt.dateObj.year, m = gt.dateObj.month, d = gt.dateObj.day;
                        if (moc.Group[y] == null) { moc.Group[y] = {}; }
                        if (moc.Group[y][m] == null) { moc.Group[y][m] = {}; }
                        if (moc.Group[y][m][d] == null) {
                            moc.Group[y][m][d] = [gt];
                        } else {
                            moc.Group[y][m][d] = moc.Group[y][m][d].concat([gt]);
                        }
                        moc.onChangeViewDate(moc.viewDay);
                    } catch (e) { console.warn(e); moc.hasError = true; }
                } else {
                    tosterFactory.showCustomToast('Overwritten Capacity load Failed', 'error');
                }
            }).finally(function () {
                moc.restbusy = false;
            });
        }

        // Rest action to edit selected model
        moc.update = function () {
            moc.restbusy = true;
            var updo = angular.copy(moc.data);
            updo.Id = moc.processExt.Id;
            updo.Date = updo.Date.toLocaleDateString("en-US");
            moc.apiActions.UpdateExcludeRestriction(updo).then(function (res) {
                if (res != -1 && res != undefined) {
                    try {
                        tosterFactory.showCustomToast('Overwritten Capacity updated Successfully', 'success');
                        var gt = dtu.createDateObj(res.data, new Date(res.data['Date']));
                        var y = gt.dateObj.year, m = gt.dateObj.month, d = gt.dateObj.day;
                        if (moc.Group[y] == null) { moc.Group[y] = {}; }
                        if (moc.Group[y][m] == null) { moc.Group[y][m] = {}; }
                        if (moc.Group[y][m][d] == null) {
                            moc.Group[y][m][d] = [gt];
                        } else {
                            moc.Group[y][m][d] = moc.Group[y][m][d].map(function (item) {
                                if (item.Id == gt.Id) {
                                    moc.edit(gt);
                                    return gt;
                                }
                                return item;
                            });
                        }
                        moc.onChangeViewDate(moc.viewDay);
                        //moc.loadAndAppend(res.data.Id);//<-- Id
                    } catch (e) { console.warn(e); moc.hasError = true; }
                } else {
                    tosterFactory.showCustomToast('Overwritten Capacity update Failed', 'error');
                }
            }).finally(function () {
                moc.restbusy = false;
            });
        }
        moc.log = function (exc) {
            console.log(exc);
        }
        moc.escape = function (s) {
            if (s == null) return;
            var regexp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/g;
            var ret = s.match(regexp);
            return (ret.length > 0) ? ret[0] : s;
        };

        moc.displayCapacity = function (exc) {
            var t = moc.lookups.enumCap2lvl[exc.RestId][exc.CapacityId];
            var d = (t.length > 0) ? t[0] : null;
            if (d != null) {
                var htmltxt =
                                    'Capacity: ' + d.Capacity
                    + ' Time: ' + moc.escape(d.Time)
                    + ' Type: ' + moc.lookups.CapacitiesTypeEnum[d.Type];
                    //'<md-icon md-svg-icon="action:supervisor_account"></md-icon>' + d.Capacity
                    //+ ' <md-icon md-svg-icon="device:access_time"></md-icon>' + d.Time
                    //+ ' <md-icon md-svg-icon="maps:local_restaurant"></md-icon>' + moc.lookups.CapacitiesTypeEnum[d.Type];
                return htmltxt;
            }
            else {
                return 'Unknown Property on Restriction';
            }

            //moc.lookups.restrictionsAssoc[exc.RestId]['N']
            //moc.lookups.enumRestrictions[moc.lookups.restrictionsAssoc[exc.RestId]['RestrictId']]
        }
        //Close button with cancel or X top modal
        moc.cancel = function () { $mdDialog.hide(); };

        moc.init();
    })
