'use strict';

angular.module('posBOApp')
    .controller('ReservationsCompCTRL', ['$scope', '$state', '$filter', '$http', '$q', '$mdDialog', 'trFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', 'config', 'MaterialCalendarData',
        function CapacitiesCompCTRL($scope, $state, $filter, $http, $q, $mdDialog, trFactory, dataUtilFactory, tosterFactory, DynamicApiService, config, MaterialCalendarData) {
            var ctrl = this;
            ctrl.viewoptions = this.viewoptions;
            ctrl.svops = Object.getOwnPropertyNames(ctrl.viewoptions)[0];
            ctrl.shortViewOpSelected = ctrl.viewoptions[ctrl.svops];
            ctrl.displayType = 'restaurant';
            ctrl.devAccess = (config.workPolicy == 'dev') ? true : false;
            ctrl.groupDisp = {};
            var dtu = dataUtilFactory;

            // Initiallizes view
            // Loads restaurants and Excluded Capacities 
            // Groups by Data and create exclutions for Calendar Components
            ctrl.initView = function (clearData) {
                ctrl.hasError = false; ctrl.restbusy = true;
                ctrl.initFilters(); //init filter vars 
                var f = ctrl.manageFilter();
                $q.all({
                    getres: ctrl.apiActions.GetRestaurants(),
                    getreserv: ctrl.apiActions.GetFilteredReservations(f),
                    //getreserv: ctrl.apiActions.GetReservations(),
                }).then(function (d) {
                    try {
                        //Restaurants
                        if (d.getres.data != -1) {

                            ctrl.restaurants = d.getres.data;
                            ctrl.enumRest = dtu.createEnumObjs(ctrl.restaurants, {}, 'Id');
                        } else { ctrl.hasError = true; tosterFactory.showCustomToast('Loading Restaurants Failed', 'fail'); }

                        //Reservations
                        if (d.getreserv.data != -1) {
                            
                            ctrl.reservations = d.getreserv.data.ReservationsModelList.map(function (item) { item.BoolStatus = (item.Status == 1 || item.Status == true) ? true : false; return item; });
                            ctrl.resCustomers = dtu.groupTo(d.getreserv.data.ReservationsCustomerModelList,'ReservationId'); 
                            ctrl.enumReserv = dtu.createEnumObjs(ctrl.reservations, {}, 'Id');
                            ctrl.groupByDisplay(ctrl.reservations);
                        } else { ctrl.hasError = true; tosterFactory.showCustomToast('Loading Reservations Failed', 'fail'); }
                    } catch (e) { ctrl.hasError = true; console.log('Init on TR - Reservations failed due to : '); console.warn(e); }

                }).finally(function () {
                    ctrl.restbusy = false;
                    if (ctrl.hasError != true && clearData) { }
                })
            }

            // Method to load by filter Reservations
            ctrl.searchFilters = function () {
                ctrl.restbusy = true;
                var filter = ctrl.manageFilter(); filter.ToDate = filter.ToDate.toLocaleDateString("en-US"), filter.FromDate = filter.FromDate.toLocaleDateString("en-US");
                ctrl.apiActions.GetFilteredReservations(filter).then(function (res) {
                    try {
                        if (res.data != -1) {
                            
                            ctrl.reservations = res.data.ReservationsModelList.map(function (item) { item.BoolStatus = (item.Status == 1 || item.Status == true) ? true : false; return item; });
                            ctrl.resCustomers = dtu.groupTo(res.data.ReservationsCustomerModelList, 'ReservationId'); 
                            ctrl.enumReserv = dtu.createEnumObjs(ctrl.reservations, {}, 'Id');
                            ctrl.groupByDisplay(ctrl.reservations);
                        } else {
                            ctrl.hasError = true; tosterFactory.showCustomToast('Loading Reservations Failed', 'fail');
                        }
                    } catch (e) { ctrl.hasError = true; console.log('Init on TR - Reservations failed due to : '); console.warn(e); }
                }).finally(function () { ctrl.restbusy = false; })
            }

            // Gets filters from variables and parse them sto resFilter for api call use
            ctrl.manageFilter = function () {
                if (ctrl.toDate == null) ctrl.toDate = new Date();
                if (ctrl.fromDate == null) ctrl.fromDate = new Date();
                if (ctrl.toDate < ctrl.fromDate) {
                    alert('To Date filter is smaller than from date.\nTo Date will auto fix to min value of From Date.');
                    ctrl.toDate = new Date(ctrl.fromDate);
                }
                var ids = ctrl.selectedRestaurants.map(function (r) { return r.Id; });

                var f = {
                    Restaurants: ids,
                    ToDate: ctrl.toDate,
                    FromDate: ctrl.fromDate
                };
                ctrl.lastFilter = angular.extend({}, f);
               
                return f;
            }

            // Neutralize all filters to todays date and selection of restaurants to none
            ctrl.clearFilters = function () {
                var msgdialog = $mdDialog.confirm().title('Clear Filters').htmlContent('Are you sure you want to clear all filters?').ariaLabel('EnableDisableReservation').ok('Clear').cancel('Cancel');
                $mdDialog.show(msgdialog).then(function () {
                    ctrl.initFilters();
                });
            }

            // Initiallize filters of date and restaurants
            ctrl.initFilters = function () {
                ctrl.fromDate = new Date();
                ctrl.toDate = new Date();
                ctrl.selectedRestaurants = [];
            }

            // Regex time filter
            ctrl.escape = function (s) {
                var regexp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/g;
                var ret = s.match(regexp);
                return (ret.length > 0) ? ret[0] : s;
            };

            // Display string template
            ctrl.monthNames = [
                "January", "February", "March",
                "April", "May", "June", "July",
                "August", "September", "October",
                "November", "December"
            ];
            ctrl.formatDate = function (date) {
                var day = date.getDate();
                var monthIndex = date.getMonth();
                var year = date.getFullYear();
                return day + ' ' + ctrl.monthNames[monthIndex] + ' ' + year;
            }

            // Single rest call to update de-actiation of a reservation
            ctrl.updateReload = function (model) {
                ctrl.hasError = false; ctrl.restbusy = true;
                ctrl.apiActions.UpdateReservation(model).then(function (res) {
                    try {
                        if (res.data != -1) {
                            ctrl.searchFilters();
                        } else {
                            ctrl.hasError = true;
                            tosterFactory.showCustomToast('Updating Reservation Failed', 'fail');
                        }
                    } catch (e) {
                        ctrl.hasError = true;
                        console.log('Update Reservation catch error: ');
                        console.warn(e);
                    }
                }).finally(function (i) {
                    ctrl.restbusy = false;
                })
            };

            // Pop up modal to manage reservation Activation - Deactivation
            ctrl.manageReservationStatus = function (res) {
                
                var ctext = 'Disable';
                if (res.Status != true) {
                    ctext = 'Enable';
                }
                var customersStr = '';
                angular.forEach(ctrl.resCustomers[res.Id] , function (item) { 
                    if(customersStr.length > 0 ) {
                      customersStr+= ', '+item.ReservationName;
                    }else {
                      customersStr+= item.ReservationName;
                    }
                });

                var htmlmsg = `<div>
                                    <span>Reservation at `+ ctrl.enumRest[res.RestId][ctrl.shortViewOpSelected.Name] + ` is for ` + res.Couver + ` persons</span><br\>
                                    <span>On `+ ctrl.formatDate(new Date(res.ReservationDate)) + ` </span><span>At `+ ctrl.escape(res.ReservationTime) + ` </span><br\>
                                    <span> For Customers: `+customersStr+`</span><br\>
                                    <span>Do you want to `+ ctext + ` it ?</span>
                                </div>`;
                var msgdialog = $mdDialog.confirm().title(ctext + ' Reservation').htmlContent(htmlmsg).ariaLabel('EnableDisableReservation').ok(ctext).cancel('Cancel');
                $mdDialog.show(msgdialog).then(function () {
                    if (res.Status == 0) res.Status = 1;
                    else if (res.Status == 1) res.Status = 0;
                    ctrl.updateReload(res);
                })
            }

            // Gets 1-0 and return true or false apply val
            ctrl.booleanEval = function (s) { return (s == true || s == 1) ? true : false; }

            // Based on displayfilter created var of group entities 
            ctrl.groupByDisplay = function (ress) {
                if (ctrl.displayType == 'restaurant') {
                    var g = dtu.groupTo(ress, 'RestId');
                    ctrl.groupDisp = g;
                    
                    return g;

                };

                if (ctrl.displayType == 'date') {
                    var g = dtu.groupDateField3lvl(ress, 'ReservationDate');
                    ctrl.groupDisp = g;
                    
                return g;
                };
            }

            ctrl.reform = function () {
                ctrl.groupByDisplay(ctrl.reservations);
            }
        }
    ])
    .component('reservationsComp', {
        templateUrl: 'app/scripts/components/table-reservation/templates/reservations-comp.html',
        controller: 'ReservationsCompCTRL',
        bindings: {
            viewoptions: '<',
            apiActions: '=',
            //onUpdate: '&'
        }
    })
    .controller('ReservationModalCtrl', function ($scope, $q, $mdDialog, lookups, reservation, apiActions, tosterFactory, trFactory, DynamicApiService, dataUtilFactory) {
        var eres = this;
        eres.lookups = lookups;
        eres.apiActions = apiActions;
        eres.reservation = reservation;
        eres.cancel = function () {
            $mdDialog.hide();
        }
    })
    ;