'use strict';

angular.module('posBOApp')
    .controller('RestrictionsExcludedAssocsCompCTRL', ['$scope', '$state', '$filter', '$http', '$q', '$mdDialog', 'trFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', 'config', 'MaterialCalendarData',
        function CapacitiesCompCTRL($scope, $state, $filter, $http, $q, $mdDialog, trFactory, dataUtilFactory, tosterFactory, DynamicApiService, config, MaterialCalendarData) {
            var ctrl = this;
            ctrl.viewoptions = this.viewoptions;
            ctrl.svops = Object.getOwnPropertyNames(ctrl.viewoptions)[0];
            ctrl.shortViewOpSelected = ctrl.viewoptions[ctrl.svops];

            ctrl.devAccess = (config.workPolicy == 'dev') ? true : false;
            var dtu = dataUtilFactory;

            // Values of busy rest and Error functionallity 
            ctrl.restbusy = false; ctrl.hasError = false;

            // Initiallizes view 
            // Loads restaurants and Excluded Capacities 
            // Groups by Data and create exclutions for Calendar Components
            ctrl.initView = function (clearData) {
                ctrl.hasError = false; ctrl.restbusy = true;
                $q.all({
                    getres: ctrl.apiActions.GetRestaurants(),
                    getexrestr: ctrl.apiActions.GetExcludeRestrictions(),
                    getrestrs: ctrl.apiActions.GetRestrictions(),
                    getrestassocs: ctrl.apiActions.GetRestrictionsRestaurantsAssoc(),
                }).then(function (d) {
                    try {
                        //Restaurants
                        if (d.getres.data != -1) {
                            ctrl.restaurants = d.getres.data;
                            ctrl.enumRest = dtu.createEnumObjs(ctrl.restaurants, {}, 'Id');
                        } else {  ctrl.hasError = true; tosterFactory.showCustomToast('Loading Restaurants Failed', 'fail'); }
                        // Restrictions
                        if (d.getrestrs.data != -1) {
                            ctrl.restrictions = d.getrestrs.data;
                            ctrl.enumRestrictions = dtu.createEnums(ctrl.restrictions, {}, 'Id', 'Description');
                        } else { ctrl.hasError = true; tosterFactory.showCustomToast('Loading Restrictions Failed', 'fail'); }
                        // Excluded restrictions main edit entity grouped by date
                        if (d.getexrestr.data != -1) {
                            ctrl.excludedRestrictions = d.getexrestr.data;
                            ctrl.excludedRestrictionsByDate = dtu.groupDateField3lvl(ctrl.excludedRestrictions, 'Date');
                        } else { ctrl.hasError = true; tosterFactory.showCustomToast('Loading Excluded Restrictions Failed', 'fail'); }
                        // Restriction Assocs
                        if (d.getrestassocs.data != -1) {
                            ctrl.restrictionsAssoc = d.getrestassocs.data;
                            // groupArray by Restaurant ID
                            ctrl.enumRestrictionsAssoc = dtu.groupTo(ctrl.restrictionsAssoc, 'RestId');
                            ctrl.enumRestrictionsAssoc2lvl = dtu.groupLvl2(ctrl.restrictionsAssoc,'RestId','Id');
                        } else { ctrl.hasError = true; tosterFactory.showCustomToast('Loading Excluded Restrictions Failed', 'fail'); }
                    }
                    catch (e) {
                        ctrl.hasError = true;
                        console.log('Init on TR - Excluded Restrictions failed due to : ');
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

            ctrl.deleteOld = function () {
                var deleteDialog = $mdDialog.confirm().title('Delete Older Exclutions').htmlContent('Confirm action to delete older exclutions of Restrictions. Confirm and Proceed?')
                    .ariaLabel('deletingExcludedDaysRestrictions').ok('Delete').cancel('Cancel');
                $mdDialog.show(deleteDialog).then(function () {
                    ctrl.restbusy = true;
                    ctrl.apiActions.DeleteOldExcludeRestrictions().then(function (res) {
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

            ctrl.setSelectedContent = function () {  MaterialCalendarData.setDayContent(ctrl.selectedDate, '<span> ' + ctrl.contentToAdd + ' </span>') }
            ctrl.logGroups = function () { console.log(ctrl.excludedRestrictionsByDate); }

            ctrl.CreateExcludedContent = function (y, m, d) {
                if (ctrl.excludedRestrictionsByDate[y] != null && ctrl.excludedRestrictionsByDate[y][m] != null && ctrl.excludedRestrictionsByDate[y][m][d] != null) {
                    var arr = ctrl.excludedRestrictionsByDate[y][m][d];
                    var htmltxt = '';
                    var list = '';
                    angular.forEach(arr, function (item) {
                        //var r = mera.lookups.enumRestrictions[d.RestrictId];
                        //var n = d.N;
                        //return r + ' ' + n;
                        // ctrl.enumRestrictions,
                        // groupArray by Restaurant ID
                        var t = ctrl.enumRestrictionsAssoc2lvl[item.RestId][item.RestRestrictAssocId][0];
                        if (ctrl.direction == 'horizontal') {
                            list += '<div class="calendar-tr-list-item">' + ctrl.enumRest[item.RestId][ctrl.shortViewOpSelected.Name] + ' <br\> ' + ctrl.enumRestrictions[t.RestrictId] + '  N=' + t.N + '</div> <br\>'
                        } else if (ctrl.direction == 'vertical') {
                            list += '<div class="calendar-tr-list-item">' + ctrl.enumRest[item.RestId][ctrl.shortViewOpSelected.Name] + ' : ' + ctrl.enumRestrictions[t.RestrictId] + '  N=' + t.N +'</div>'
                        }
                    })
                    htmltxt = `
                                <h5 class="calendar-info-header">Exclutions `+ arr.length + `</h5>
                                <div class="calendar-tr-list">` + list + `</div >`
                    return htmltxt;
                }
            }

            ctrl.editOnModal = function (type) {

                var lookups = {
                    enumRestaurants: ctrl.enumRest,
                    enumRestrictions: ctrl.enumRestrictions,
                    // groupArray by Restaurant ID
                    restrictionsAssoc : ctrl.enumRestrictionsAssoc,
                    dispRName: ctrl.shortViewOpSelected.Name
                }
                var groupDateRestrictions = ctrl.excludedRestrictionsByDate;
                $mdDialog.show({
                    controller: 'ExcludedRestrictionAssocsCtrl',
                    controllerAs: 'mera',
                    templateUrl: 'excluded-resstr-modal',
                    parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                    resolve: {
                        lookups: function () { return lookups; },
                        groupDateRestrictions: function () { return groupDateRestrictions; },
                        selectedDate: function () { return ctrl.selectedDate; },
                        apiActions: function () { return ctrl.apiActions; }
                    }
                }).then(function (data) {
                    ctrl.initView();
                });
            }

        }
    ])
    .component('restrictionsExcludedAssocsComp', {
        templateUrl: 'app/scripts/components/table-reservation/templates/restriction-excluded-assoc-comp.html',
        controller: 'RestrictionsExcludedAssocsCompCTRL',
        bindings: {
            viewoptions: '<',
            apiActions: '=',
            //onUpdate: '&'
        }
    })

    .controller('ExcludedRestrictionAssocsCtrl', function ($scope, $q, $mdDialog, lookups, groupDateRestrictions, selectedDate, apiActions, tosterFactory, trFactory, DynamicApiService, dataUtilFactory) {
        var dtu = dataUtilFactory;
        var mera = this;
        // Rest Obj  , Enum RestRestrict , RestDisplayName
        mera.lookups = lookups;
        // Rest of ext capacities group by group to date oobj 
        mera.Group = groupDateRestrictions;
        // Parent components Api calls funs
        mera.apiActions = apiActions;
        // Rest Action busy to modal proccecing functionallity
        mera.restbusy = false; mera.hasError = false;
        // Mode to switch on basic view option
        mera.mode = 'edit';
        // Obj to complete with form 
        mera.data = {
            Id: 0,
            RestId: null,
            RestRestrictAssocId: null,
            Date: new Date()
        };

        // fun to switch moe by literal 
        mera.switchmode = function (mode) {
            mera.mode = mode;
        }

        mera.init = function () {
            mera.exclutionsArray = [];
            try {
                var d
                if (selectedDate != null) {
                    d = new Date(selectedDate);
                } else {
                    d = new Date();
                }
                mera.data['Date'] = d;
                mera.viewDay = d;

            } catch (e) {
                mera.data['Date'] = new Date();
                mera.viewDay = new Date();
            }
            mera.onChangeViewDate(mera.viewDay);

        }
        mera.onChangeViewDate = function (date) {
            mera.viewDay = new Date(date);
            mera.DMR = {
                y: date.getFullYear(),
                m: date.getMonth(),
                d: date.getDate()
            }
            mera.manageViewArr(mera.DMR.y, mera.DMR.m, mera.DMR.d)
        }
        // Based on y, m, d  switches array to repeat registers of exclution on right display list
        mera.manageViewArr = function (y, m, d) {
            if (mera.Group[y] != null && mera.Group[y][m] != null && mera.Group[y][m][d] != null) {
                mera.exclutionsArray = mera.Group[y][m][d];
            } else {
                mera.exclutionsArray = [];
            }
        }
        // Clears selected Entity to avoid
        mera.clearSelection = function () {
            mera.processExt = null;
        }

        // UI list Action triggers mode delete 
        // switches view to delete for confirm
        mera.delete = function (m) {
            mera.processExt = m;
            mera.switchmode('remove');
        }

        // UI list Action triggers mode edit
        // clones vars to data allows edit 
        mera.edit = function (m) {
            try {
                mera.processExt = m;
                mera.data.RestId = mera.processExt.RestId;
                mera.data.Date = new Date(mera.processExt.Date);
                mera.data.RestRestrictAssocId = mera.processExt.RestRestrictAssocId;
            } catch (e) { console.warn(e); mera.hasError = true; }
        }

        // Rest Action to delete ent
        mera.deleteConf = function () {
            var gt = mera.processExt;
            mera.apiActions.DeleteExcludeRestriction(gt.Id).then(function (res) {
                if (res != -1 && res != undefined) {
                    tosterFactory.showCustomToast('Exclution deleted Successfully', 'success');
                    try {
                        var y = gt.dateObj.year, m = gt.dateObj.month, d = gt.dateObj.day;
                        mera.Group[y][m][d] = mera.Group[y][m][d].filter(function (item) { return item.Id != gt.Id; });
                        mera.onChangeViewDate(mera.viewDay); mera.processExt = null; mera.switchmode('edit');
                    } catch (e) { console.warn(e); mera.hasError = true; }
                } else {
                    tosterFactory.showCustomToast('Excluted Restriction add Failed', 'error');
                }
            }).finally(function () {
                mera.restbusy = false;
            });
        }

        // Rest Action to Add
        mera.add = function () {
            mera.restbusy = true;
            var ado = angular.copy(mera.data);
            ado.Id = 0, ado.Date = ado.Date.toLocaleDateString("en-US");
            mera.apiActions.InsertExcludeRestriction(ado).then(function (res) {
                if (res != -1 && res != undefined) {
                    tosterFactory.showCustomToast('Exclution added Successfully', 'success');
                    mera.loadAndAppend(res.data);//<-- Id
                } else {
                    tosterFactory.showCustomToast('Excluted Restriction add Failed', 'error');
                }
            }).finally(function () {
                mera.restbusy = false;
            });
        }

        // loads by Id entity
        // Creates group Obj extends main obj load arr 
        mera.loadAndAppend = function (Idload) {
            mera.restbusy = true;
            mera.apiActions.GetExcludeRestrictionById(Idload).then(function (res) {
                if (res != -1 && res != undefined) {
                    try {

                        tosterFactory.showCustomToast('Exclution loaded Successfully', 'success');
                        var gt = dtu.createDateObj(res.data, new Date(res.data['Date']));
                        var y = gt.dateObj.year, m = gt.dateObj.month, d = gt.dateObj.day;
                        if (mera.Group[y] == null) { mera.Group[y] = {}; }
                        if (mera.Group[y][m] == null) { mera.Group[y][m] = {}; }
                        if (mera.Group[y][m][d] == null) {
                            mera.Group[y][m][d] = [gt];
                        } else {
                            mera.Group[y][m][d] = mera.Group[y][m][d].concat([gt]);
                        }
                        mera.onChangeViewDate(mera.viewDay);
                    } catch (e) { console.warn(e); mera.hasError = true; }
                } else {
                    tosterFactory.showCustomToast('Exclution load Failed', 'error');
                }
            }).finally(function () {
                mera.restbusy = false;
            });
        }

        // Rest action to edit selected model
        mera.update = function () {
            mera.restbusy = true;
            var updo = angular.copy(mera.data);
            updo.Id = mera.processExt.Id;
            updo.Date = updo.Date.toLocaleDateString("en-US");
            mera.apiActions.UpdateExcludeRestriction(updo).then(function (res) {
                if (res != -1 && res != undefined) {
                    try {

                        tosterFactory.showCustomToast('Exclution updated Successfully', 'success');
                        var gt = dtu.createDateObj(res.data, new Date(res.data['Date']));
                        var y = gt.dateObj.year, m = gt.dateObj.month, d = gt.dateObj.day;
                        if (mera.Group[y] == null) { mera.Group[y] = {}; }
                        if (mera.Group[y][m] == null) { mera.Group[y][m] = {}; }
                        if (mera.Group[y][m][d] == null) {
                            mera.Group[y][m][d] = [gt];
                        } else {
                            mera.Group[y][m][d] = mera.Group[y][m][d].map(function (item) {
                                if (item.Id == gt.Id) {
                                    mera.edit(gt);
                                    return gt;
                                }
                                return item;
                            });
                        }
                        mera.onChangeViewDate(mera.viewDay);
                        //mera.loadAndAppend(res.data.Id);//<-- Id
                    } catch (e) { console.warn(e); mera.hasError = true; }
                } else {
                    tosterFactory.showCustomToast('Excluted Restriction update Failed', 'error');
                }
            }).finally(function () {  mera.restbusy = false; });
        }
        mera.log = function (exc) {
            console.log(exc);
        }

        mera.displayRestriction = function (exc) {
            var t = mera.lookups.restrictionsAssoc[exc.RestId].filter(function (item) { return item.Id == exc.RestRestrictAssocId; })
            var d = (t.length > 0) ? t[0] : null;
            if (d != null) {
                var r = mera.lookups.enumRestrictions[d.RestrictId];
                var n = d.N;
                return r + ' ' + n;
            }
            else {
                return 'Unknown Property on Restriction';
            } 

        //mera.lookups.restrictionsAssoc[exc.RestId]['N']
        //mera.lookups.enumRestrictions[mera.lookups.restrictionsAssoc[exc.RestId]['RestrictId']]
        }
        //Close button with cancel or X top modal
        mera.cancel = function () {
            $mdDialog.hide();
        };

        mera.init();
    })