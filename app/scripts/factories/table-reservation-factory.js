'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('trFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            ReservationTypes: {
                GET: {
                    GetReservationTypes: 'GetAll',
                },
            },
            Capacities: {
                GET: {
                    GetCapacities: 'GetList',
                    GetCapacityById: 'Get/Id/{Id}',
                    GetCapacitiesByRestId: 'GetList/RestId/{RestId}',
                },
                POST: {
                    InsertCapacity: 'Insert',
                    UpdateCapacity: 'Update',
                    DeleteCapacity: 'Delete/Id/{Id}',
                },
            },
            EmailConfig: {},

            ExcludeDays: {
                GET: {
                    GetExcludeDays: 'GetList',
                    GetExcludeDayById: 'Get/Id/{Id}',
                },
                POST: {
                    InsertExcludeDay: 'Insert',
                    UpdateExcludeDay: 'Update',
                    DeleteExcludeDay: 'Delete/Id/{Id}',
                    DeleteOldExcludeDays: 'DeleteOld'
                },
            },

            ExcludeRestrictions: {
                GET: {
                    GetExcludeRestrictions: 'GetList',
                    GetExcludeRestrictionById: 'Get/Id/{Id}'
                },
                POST: {
                    InsertExcludeRestriction: 'Insert',
                    UpdateExcludeRestriction: 'Update',
                    DeleteExcludeRestriction: 'Delete/Id/{Id}',
                    DeleteOldExcludeRestrictions: 'DeleteOld'
                },
            },
            OverwrittenCapacities: {
                GET: {
                    GetOverwrittenCapacities: 'GetList',
                    GetOverwrittenCapacityById: 'Get/Id/{Id}'
                },
                POST: {
                    InsertOverwrittenCapacity: 'Insert',
                    UpdateOverwrittenCapacity: 'Update',
                    DeleteOverwrittenCapacity: 'Delete/Id/{Id}',
                },
            },

            Reservations: {
                GET: {
                    GetReservations: 'GetList'
                },
                POST: {
                    GetFilteredReservations :'GetReservationsFiltered',
                    Update:'Update'
                }
            },
            ReservationCustomers: {
                GET: {
                    GetReservationCustomers: 'GetList'
                }
            },
            Restaurants: {
                GET: {
                    GetRestaurants: 'GetList',
                    GetRestaurantById: 'Get/Id/{Id}',
                    GetComboList: 'GetComboList/{language}',
                },
                POST: {
                    InsertRestaurant: 'Insert',
                    UpdateRestaurant: 'Update',
                    DeleteRestaurant: 'Delete/Id/{Id}',
                }
            },
            Restrictions: {
                GET: {
                    GetRestrictions: 'GetList',
                    GetRestrictionById: 'Get/Id/{Id}',
                },
                POST: {
                    InsertRestriction: 'Insert',
                    UpdateRestriction: 'Update',
                    DeleteRestriction: 'Delete/Id/{Id}',
                }
            },
            RestrictionsRestaurantsAssoc: {
                GET: {
                    GetRestrictionsRestaurantsAssoc: 'GetList',
                    GetRestrictionsRestaurantsAssocId: 'Get/Id/{Id}'
                },
                POST: {
                    InsertRestrictionsRestaurantsAssoc: 'Insert',
                    UpdateRestrictionsRestaurantsAssoc: 'Update',
                    DeleteRestrictionsRestaurantsAssoc: 'Delete/Id/{Id}'
                }
            },

            TradingHours: {
                GET: {
                    GetTradingHours: 'GetTradingHours',
                },
                POST: {
                    UpdateTradingHours: 'UpdateTradingHours',
                }
            },

        };

        fac.controllers = ['Reservations', 'Restaurants', 'Restrictions', 'RestrictionsRestaurantsAssoc', 'ExcludeRestrictions',];
        return fac;
    }])