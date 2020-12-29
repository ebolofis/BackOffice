'use strict';

angular.module('posBOApp')
    .controller('CapacitiesCompCTRL', ['$scope', '$state', '$q', '$mdDialog', 'trFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', 'config',
        function CapacitiesCompCTRL($scope, $state, $q, $mdDialog, trFactory, dataUtilFactory, tosterFactory, DynamicApiService, config) {
            var ctrl = this;
            ctrl.viewoptions = this.viewoptions;
            ctrl.svops = Object.getOwnPropertyNames(ctrl.viewoptions)[0];
            ctrl.shortViewOpSelected = ctrl.viewoptions[ctrl.svops];

            ctrl.devAccess = (config.workPolicy === 'dev') ? true : false;
            var dtu = dataUtilFactory;

            // Values of busy rest and Error functionallity 
            ctrl.restbusy = false; ctrl.hasError = false;
            // Main components oninit procedural function
            // Caution this fun trigered twice on life cycle of component 
            ctrl.$onInit = function () { };

            // Aciton to trigger navigation 
            // ex. restaurants empty 
            ctrl.navigate = function (ref) {
                if (ref != undefined) {
                    $state.go(ref);
                }
            };
            // Enumerator over capacities Type
            // This has to be loaded from Api (Update: Loaded from api)
            ctrl.CapacitiesTypeEnum = {
                //0: 'AllDay',
                //1: 'Lunch',
                //2: 'Dinner',
            };
            // Filter on name selected contained string 
            // Selected attribute of restaurant and other obj difined on selected Option
            ctrl.nameFilter = function (res) {
                var lowercaseQuery = angular.lowercase(ctrl.searchStr);
                if (lowercaseQuery == null) return res;
                var lowercaseName = angular.lowercase(res[ctrl.shortViewOpSelected.Name]);
                var pos = lowercaseName.indexOf(lowercaseQuery);
                return (pos >= 0);
            };

            // Initiallizes view loads restaurants , capacities 
            // Create Group of capacities by restaurant 
            // Manages main loading var and error promises var 
            // Calls Master Controller of api calls provided by components 2-way bindings
            ctrl.initView = function () {
                ctrl.hasError = false; ctrl.restbusy = true;
                $q.all({
                    getret: ctrl.apiActions.GetReservationTypes(),
                    getres: ctrl.apiActions.GetRestaurants(),
                    getcap: ctrl.apiActions.GetCapacities()
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

                        } else {
                            ctrl.hasError = true;
                            tosterFactory.showCustomToast('Loading restaurants Failed', 'fail');
                        }
                        if (d.getcap.data != -1) {
                            ctrl.capacities = d.getcap.data;
                            ctrl.capacitiesByResId = dtu.groupTo(ctrl.capacities, 'RestId');
                        } else {
                            ctrl.hasError = true;
                            tosterFactory.showCustomToast('Loading capacities Failed', 'fail');
                        }
                    }
                    catch (e) {
                        ctrl.hasError = true;
                        console.log('Init on TR - Capacities failed due to : ');
                        console.warn(e);
                    }
                }).finally(function () {
                    ctrl.restbusy = false;
                })
            };

            // Capacity edit switch functionality based on  
            // On upsert calls edit on modal 
            // On delete triggers msg confirmation modal to  delete capacity selected 
            // Inputs is type choice  , restaurant  and data as capacity obj 
            // type : 'add , edit , delete' 
            // rest : restaurant primary obj 
            // data : current capacity or null 

            ctrl.editCapacity = function (type, rest, data) {
                switch (type) {
                    case 'add':
                        ctrl.EditOnModal(type, rest, data);
                        break;
                    case 'edit':
                        ctrl.EditOnModal(type, rest, data);
                        break;
                    case 'delete':
                        ctrl.DeleteConfModal(rest, data);
                        break;

                    default: tosterFactory.showCustomToast('Not valid action', 'info');
                        break;
                }
            };
            ctrl.DeleteConfModal = function (rest, data) {
                var htmlmsg = `<div>
                                    <md-icon md-svg-icon="action:supervisor_account"></md-icon>
                                    <span>`+ data.Capacity + `</span>
                                    <md-icon md-svg-icon="device:access_time"></md-icon>
                                    <span>`+ data.Time + `</span>
                                    <md-icon md-svg-icon="maps:local_restaurant"></md-icon>
                                    <span>`+ ctrl.CapacitiesTypeEnum[data.Type] + `</span>
                                </div>`

                var deleteDialog = $mdDialog.confirm().title('Delete Restaurant').htmlContent('You have selected "' + rest[ctrl.shortViewOpSelected.Name] + '" capacity entry <br/>' + htmlmsg + 'to delete.\n Would you like to proceed and delete current capacity?')
                    .ariaLabel('deletingRestaurant').ok('Delete').cancel('Cancel');
                $mdDialog.show(deleteDialog).then(function () {

                })
            };
            // Single Edit or Add capacity on provided restaurant 
            // Triggers Modal of edit by Dynamic Form 
            // On callback confirmation switches functionality based on type to edit or add 
            ctrl.EditOnModal = function (type, rest, data) {
                var formModel = {
                    entityIdentifier: 'TRCapacities', title: 'Managing - ' + type + ' ' + rest[ctrl.shortViewOpSelected.Name] + ' Capacity',
                    dropDownObject: {
                        Type: ctrl.CapacitiesTypeEnum
                    }
                }, dataEntry = {};

                if (type == 'edit' && data != null) {
                    formModel = angular.extend({ forceTitle: 'Edit "' + rest[ctrl.shortViewOpSelected.Name] + '" Capacity' }, formModel);
                    dataEntry = angular.copy(data);
                } else if (type == 'add' && data == null) {
                    // default obj 
                    data = {
                        Id: 0, RestId: rest.Id,
                        Time: new Date(), Type: null, Capacity: null,
                    };
                    formModel = angular.extend({ forceTitle: 'Add "' + rest[ctrl.shortViewOpSelected.Name] + '" Capacity' }, formModel);
                    dataEntry = angular.copy(data);
                }

                $mdDialog.show({
                    controller: 'DynamicSingleFormInsertCtrl',
                    templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html',
                    parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                    resolve: {
                        formModel: function () { return formModel; },
                        dataEntry: function () { return dataEntry; }
                    }
                }).then(function (data) {
                    
                    //important step to match ids that is number in this entity
                    var d = new Date(data.Time);
                    var rr = d.getHours() + ':' + d.getMinutes();
                    data.Time = rr;
                    if (type == 'add') {
                        ctrl.InsertCapacity(rest, data);
                    } else if (type == 'edit') {
                        ctrl.UpdateCapacity(rest, data);
                    }
                }).catch(function (error) { }).finally(function () { })

            };

            // Return from Edit on modal with null ins and model created
            // Inserts a new register and calls load by restaurant to update component
            ctrl.InsertCapacity = function (rest, data) {
                ctrl.apiActions.InsertCapacity(data).then(function (res) {
                    if (res != -1 && res != null) {
                        tosterFactory.showCustomToast('Capacity Created Successfully', 'success');
                        ctrl.LoadRestaurantCapacities(rest);
                    } else {
                        tosterFactory.showCustomToast('Capacity Creation Failed', 'error');
                    }
                });
            };

            // Return from Edit on modal with null ins and model created
            // Updates register and load by restaurant id capacities to update component 
            ctrl.UpdateCapacity = function (rest, data) {
                ctrl.apiActions.UpdateCapacity(data).then(function (res) {
                    if (res != -1 && res != undefined) {
                        tosterFactory.showCustomToast('Capacity Updated Successfully', 'success');
                        ctrl.LoadRestaurantCapacities(rest);

                    } else {
                        tosterFactory.showCustomToast('Capacity Update Failed', 'error');
                    }
                });
            };
            // Return from Msg Delete conf modal and model provided to 
            // Updates register and load by restaurant id capacities to update component 
            ctrl.DeleteCapacity = function (rest, data) {
                ctrl.apiActions.DeleteCapacity(data).then(function (res) {
                    if (res != -1 && res != undefined) {
                        tosterFactory.showCustomToast('Capacity Deleted Successfully', 'success');
                        ctrl.LoadRestaurantCapacities(rest);

                    } else {
                        tosterFactory.showCustomToast('Deleting Capacity Failed', 'error');
                    }
                });
            };

            // Function to load capacities by restaurant id and update list component
            ctrl.LoadRestaurantCapacities = function (r) {
                var restaurantId = r.Id
                ctrl.apiActions.GetCapacitiesByRestId(restaurantId).then(function (res) {
                    if (res != -1 && res != undefined) {
                        tosterFactory.showCustomToast('Restaurant Capacities loaded', 'success');
                        ctrl.capacitiesByResId[restaurantId] = res.data;
                    } else {
                        tosterFactory.showCustomToast('Restaurant Capacities Failed', 'error');
                    }
                });
            };

            ctrl.logGroups = function () {
                console.log(ctrl.capacitiesByResId);
            }

            ctrl.logRestaurants = function () {
                console.log(ctrl.restaurants);
            }

            ctrl.logCapacities = function () {
                console.log(ctrl.capacities);
            };

            // regex time filter
            ctrl.escape = function (s) {
                var regexp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/g;
                var ret = s.match(regexp);
                return (ret.length > 0) ? ret[0] : s;
            };






        }
    ])


    .component('capacitiesComp', {
        templateUrl: 'app/scripts/components/table-reservation/templates/capacities-comp.html',
        controller: 'CapacitiesCompCTRL',
        bindings: {
            viewoptions: '<',
            apiActions: '=',
            //onUpdate: '&'
        }
    })