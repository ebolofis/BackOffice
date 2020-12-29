'use strict';

angular.module('posBOApp')
    .controller('CapacitiesExcludedDaysCompCTRL', ['$scope', '$state', '$filter', '$http', '$q', '$mdDialog', 'trFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', 'config', 'MaterialCalendarData',
        function CapacitiesCompCTRL($scope, $state, $filter, $http, $q, $mdDialog, trFactory, dataUtilFactory, tosterFactory, DynamicApiService, config, MaterialCalendarData) {
            var ctrl = this;
            ctrl.viewoptions = this.viewoptions;
            ctrl.svops = Object.getOwnPropertyNames(ctrl.viewoptions)[0];
            ctrl.shortViewOpSelected = ctrl.viewoptions[ctrl.svops];

            //if workpolicy is dev then allow some features for develop 
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
                    getexcap: ctrl.apiActions.GetExcludeDays()
                }).then(function (d) {
                    try {
                        if (d.getret.data != -1) {
                            angular.forEach(d.getret.data, function (r) {
                                ctrl.CapacitiesTypeEnum[r.Type] = r.Description;
                            });
                        } else {
                            ctrl.hasError = true;
                            tosterFactory.showCustomToast('Loading reservation types failed', 'fail');
                        }
                        if (d.getres.data != -1) {
                            ctrl.restaurants = d.getres.data;
                            ctrl.enumRest = dtu.createEnumObjs(ctrl.restaurants, {}, 'Id')
                        } else {
                            ctrl.hasError = true; tosterFactory.showCustomToast('Loading Restaurants Failed', 'fail');
                        }
                        if (d.getexcap.data != -1) {
                            ctrl.excludedCapacities = d.getexcap.data;
                            ctrl.excludedCapacitiesByDate = dtu.groupDateField3lvl(ctrl.excludedCapacities, 'Date');
                        } else {
                            ctrl.hasError = true; tosterFactory.showCustomToast('Loading Excluded Capacities Failed', 'fail');
                        }
                    }
                    catch (e) {
                        ctrl.hasError = true;
                        console.log('Init on TR - Excluded Capacities failed due to : ');
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

            // Event on click on calendar date
            ctrl.dayClick = function (date) { ctrl.msg = "You clicked " + $filter("date")(date, "MMM d, y h:mm:ss a Z"); };
            // event on select prev month 
            ctrl.prevMonth = function (data) { ctrl.msg = "You clicked (prev) month " + data.month + ", " + data.year; };
            // event on select next month 
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

            // provides html content for calendar date 
            ctrl.CreateExcludedContent = function (y, m, d) {
                if (ctrl.excludedCapacitiesByDate[y] != null && ctrl.excludedCapacitiesByDate[y][m] != null && ctrl.excludedCapacitiesByDate[y][m][d] != null) {
                    var arr = ctrl.excludedCapacitiesByDate[y][m][d];
                    var htmltxt = '';
                    var list = '';
                    angular.forEach(arr, function (item) {
                        list += '<div class="calendar-tr-list-item">' + ctrl.enumRest[item.RestId][ctrl.shortViewOpSelected.Name] + ' : ' + ctrl.CapacitiesTypeEnum[item.Type] + '</div>'
                    })
                    htmltxt = `
                                <h5 class="calendar-info-header">Exclutions `+ arr.length + `</h5>
                                <div class="calendar-tr-list">` + list + `</div >`
                    return htmltxt;
                }
            }
            // action to trigger modal management
            ctrl.editOnModal = function (type) {
                var lookups = {
                    enumRestaurants: ctrl.enumRest,
                    enumCapacityTypes: ctrl.CapacitiesTypeEnum,
                    dispRName: ctrl.shortViewOpSelected.Name
                }
                var groupDateCapacities = ctrl.excludedCapacitiesByDate;
                $mdDialog.show({
                    controller: 'ExcludedDaysCtrl',
                    controllerAs: 'mced',
                    templateUrl: 'excluded-days-modal',
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

            ctrl.deleteOld = function () {
                var deleteDialog = $mdDialog.confirm().title('Delete Older Exclutions').htmlContent('Confirm action to delete older exclutions of Capacities. Confirm and Proceed?')
                    .ariaLabel('deletingExcludedDaysCapacities').ok('Delete').cancel('Cancel');
                $mdDialog.show(deleteDialog).then(function () {
                    ctrl.restbusy = true;
                    ctrl.apiActions.DeleteOldExcludeDays().then(function (res) {
                        
                        ctrl.restbusy = false;
                        if (res != -1 && res != undefined) {
                            tosterFactory.showCustomToast('Older Exclutions deleted Successfully', 'success');
                            ctrl.initView();
                        } else {
                            tosterFactory.showCustomToast('Older Exclutions delete Failed', 'error');
                        }
                    }).catch(function () {
                        ctrl.restbusy = false;
                    });
                })
            }

            // Dev fun log group object
            ctrl.logGroups = function () { console.log(ctrl.excludedCapacitiesByDate); }
            ctrl.contentToAdd = 'araoza';
            ctrl.setSelectedContent = function () {
                MaterialCalendarData.setDayContent(ctrl.selectedDate, '<span> ' + ctrl.contentToAdd + ' </span>')
            }
        }
    ])
    .component('capacitiesExcludedDaysComp', {
        templateUrl: 'app/scripts/components/table-reservation/templates/capacities-excluded-days-comp.html',
        controller: 'CapacitiesExcludedDaysCompCTRL',
        bindings: {
            viewoptions: '<',
            apiActions: '=',
            //onUpdate: '&'
        }
    })
    // Excluded DAys modal controller 
    .controller('ExcludedDaysCtrl', function ($scope, $q, $mdDialog, lookups, groupDateCapacities, selectedDate, apiActions, tosterFactory, trFactory, DynamicApiService, dataUtilFactory) {
        var dtu = dataUtilFactory;
        var mced = this;
        // Rest Obj  , Enum Type , RestDisplayName
        mced.lookups = lookups;
        // Rest of ext capacities group by group to date oobj 
        mced.Group = groupDateCapacities;
        // Parent components Api calls funs
        mced.apiActions = apiActions;
        // Rest Action busy to modal proccecing functionallity
        mced.restbusy = false; mced.hasError = false;
        // Mode to switch on basic view option
        mced.mode = 'edit';
        // Obj to complete with form 
        mced.data = {
            Id: 0,
            RestId: null,
            Type: null,
            Date: new Date()
        };

        // fun to switch moe by literal 
        mced.switchmode = function (mode) {
            mced.mode = mode;
        }

        mced.init = function () {
            mced.exclutionsArray = [];
            try {
                var d
                if (selectedDate != null) {
                    d = new Date(selectedDate);
                } else {
                    d = new Date();
                }
                mced.data['Date'] = d;
                mced.viewDay = d;

            } catch (e) {
                mced.data['Date'] = new Date();
                mced.viewDay = new Date();
            }
            mced.onChangeViewDate(mced.viewDay);

        }
        mced.onChangeViewDate = function (date) {
            mced.viewDay = new Date(date);
            mced.DMR = {
                y: date.getFullYear(),
                m: date.getMonth(),
                d: date.getDate()
            }
            mced.manageViewArr(mced.DMR.y, mced.DMR.m, mced.DMR.d)
        }
        // Based on y, m, d  switches array to repeat registers of exclution on right display list
        mced.manageViewArr = function (y, m, d) {
            if (mced.Group[y] != null && mced.Group[y][m] != null && mced.Group[y][m][d] != null) {
                mced.exclutionsArray = mced.Group[y][m][d];
            } else {
                mced.exclutionsArray = [];
            }
        }
        // Clears selected Entity to avoid
        mced.clearSelection = function () {
            mced.processExt = null;
        }

        // UI list Action triggers mode delete 
        // switches view to delete for confirm
        mced.delete = function (m) {
            mced.processExt = m;
            mced.switchmode('remove');
        }
        // UI list Action triggers mode edit 
        // clones vars to data allows edit 
        mced.edit = function (m) {
            try {

                mced.processExt = m;
                mced.data.RestId = mced.processExt.RestId;
                mced.data.Date = new Date(mced.processExt.Date);
                mced.data.Type = mced.processExt.Type;
            } catch (e) { console.warn(e); mced.hasError = true; }
        }

        // Rest Action to delete ent
        mced.deleteConf = function () {
            var gt = mced.processExt;
            mced.apiActions.DeleteExcludeDay(gt.Id).then(function (res) {
                if (res != -1 && res != undefined) {
                    tosterFactory.showCustomToast('Exclution deleted Successfully', 'success');
                    try {
                        var y = gt.dateObj.year, m = gt.dateObj.month, d = gt.dateObj.day;
                        mced.Group[y][m][d] = mced.Group[y][m][d].filter(function (item) { return item.Id != gt.Id; });
                        mced.onChangeViewDate(mced.viewDay); mced.processExt = null; mced.switchmode('edit');
                    } catch (e) { console.warn(e); mced.hasError = true; }
                } else {
                    tosterFactory.showCustomToast('Excluted Capacity add Failed', 'error');
                }
            }).finally(function () {
                mced.restbusy = false;
            });
        }

        // Rest Action to Add
        mced.add = function () {
            mced.restbusy = true;
            var ado = angular.copy(mced.data);
            ado.Id = 0, ado.Date = ado.Date.toLocaleDateString("en-US");
            mced.apiActions.InsertExcludeDay(ado).then(function (res) {
                if (res != -1 && res != undefined) {
                    tosterFactory.showCustomToast('Exclution added Successfully', 'success');
                    mced.loadAndAppend(res.data);//<-- Id
                } else {
                    tosterFactory.showCustomToast('Excluted Capacity add Failed', 'error');
                }
            }).finally(function () {
                mced.restbusy = false;
            });
        }
        // loads by Id entity 
        // Creates group Obj extends main obj load arr 
        mced.loadAndAppend = function (Idload) {
            mced.restbusy = true;
            mced.apiActions.GetExcludeDayById(Idload).then(function (res) {
                if (res != -1 && res != undefined) {
                    try {

                        tosterFactory.showCustomToast('Exclution loaded Successfully', 'success');
                        var gt = dtu.createDateObj(res.data, new Date(res.data['Date']));
                        var y = gt.dateObj.year, m = gt.dateObj.month, d = gt.dateObj.day;
                        if (mced.Group[y] == null) { mced.Group[y] = {}; }
                        if (mced.Group[y][m] == null) { mced.Group[y][m] = {}; }
                        if (mced.Group[y][m][d] == null) {
                            mced.Group[y][m][d] = [gt];
                        } else {
                            mced.Group[y][m][d] = mced.Group[y][m][d].concat([gt]);
                        }
                        mced.onChangeViewDate(mced.viewDay);
                    } catch (e) { console.warn(e); mced.hasError = true; }
                } else {
                    tosterFactory.showCustomToast('Exclution load Failed', 'error');
                }
            }).finally(function () {
                mced.restbusy = false;
            });
        }

        // Rest action to edit selected model
        mced.update = function () {
            mced.restbusy = true;
            var updo = angular.copy(mced.data);
            updo.Id = mced.processExt.Id;
            updo.Date = updo.Date.toLocaleDateString("en-US");
            mced.apiActions.UpdateExcludeDay(updo).then(function (res) {
                if (res != -1 && res != undefined) {
                    try {

                        tosterFactory.showCustomToast('Exclution updated Successfully', 'success');
                        var gt = dtu.createDateObj(res.data, new Date(res.data['Date']));
                        var y = gt.dateObj.year, m = gt.dateObj.month, d = gt.dateObj.day;
                        if (mced.Group[y] == null) { mced.Group[y] = {}; }
                        if (mced.Group[y][m] == null) { mced.Group[y][m] = {}; }
                        if (mced.Group[y][m][d] == null) {
                            mced.Group[y][m][d] = [gt];
                        } else {
                            mced.Group[y][m][d] = mced.Group[y][m][d].map(function (item) {
                                if (item.Id == gt.Id) {
                                    mced.edit(gt);
                                    return gt;
                                }
                                return item;
                            });
                        }
                        mced.onChangeViewDate(mced.viewDay);
                        //mced.loadAndAppend(res.data.Id);//<-- Id
                    } catch (e) { console.warn(e); mced.hasError = true; }
                } else {
                    tosterFactory.showCustomToast('Excluted Capacity update Failed', 'error');
                }
            }).finally(function () {
                mced.restbusy = false;
            });
        }


        //Close button with cancel or X top modal
        mced.cancel = function () { $mdDialog.hide(); };

        mced.init();
    })