'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:DeliveryAgentCtrl
 * @description
 * Table res Controller is main controller of module table reservation
 * Handles Table res Components and loaded on each parent state
 * provides functionality of components and modules on top lvl of table reservation
 * Controller of the posBOApp / Table reservation Module 
 */

angular.module('posBOApp')
    .controller('DeliveryAgentCtrl', [
        'tosterFactory', '$stateParams', '$scope', '$rootScope', '$q', '$interval', '$uibModal', '$mdDialog', '$mdMedia', 'DynamicApiService', 'dataUtilFactory', 'DAResService', 'daFactory',
        function (tosterFactory, $stateParams, $scope, $rootScope, $q, $interval, $uibModal, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, DAResService, daFactory) {
            $scope.idlestate = false; //this is a var to disable actions as idle state
            $scope.initView = function () {
                $scope.viewTitle = DAResService.getcontainerTitle($scope.editingEntity);
                $rootScope.stateName = $scope.viewTitle;
            }
            $scope.TRViewOps = {
                GR: { Name: 'NameGR', Description: 'DescriptionGR' },
                En: { Name: 'NameEn', Description: 'DescriptionEn' },
                Ru: { Name: 'NameRu', Description: 'DescriptionRu' },
                Fr: { Name: 'NameFr', Description: 'DescriptionFr' },
                De: { Name: 'NameDe', Description: 'DescriptionDe' },
            }

            $scope.apiActions = {
                
                'GetRestaurants': function () {
                    var url = trFactory.apiInterface.Restaurants.GET.GetRestaurants;
                    return DynamicApiService.getV3('Restaurants', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetCapacities'); });
                },
                'GetRestrictions': function () {
                    var url = trFactory.apiInterface.Restrictions.GET.GetRestrictions;
                    return DynamicApiService.getV3('Restrictions', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetCapacities'); });
                },
                //Reservations
                'GetReservations': function () {
                    var url = trFactory.apiInterface.Reservations.GET.GetReservations;
                    return DynamicApiService.getV3('Reservations', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetReservations'); });
                },
                'GetFilteredReservations': function (filter) {
                    var url = trFactory.apiInterface.Reservations.POST.GetFilteredReservations;
                    return DynamicApiService.postV3('Reservations', url, filter)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetFilteredReservations'); });
                },
                'UpdateReservation': function (model) {
                    var url = trFactory.apiInterface.Reservations.POST.Update;

                    return DynamicApiService.postV3('Reservations', url, model)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'UpdateReservation'); });
                },

                //Restrictions Restaurants Assoc
                'GetRestrictionsRestaurantsAssoc': function () {
                    var url = trFactory.apiInterface.RestrictionsRestaurantsAssoc.GET.GetRestrictionsRestaurantsAssoc;
                    return DynamicApiService.getV3('RestrictionsRestaurantsAssoc', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetRestrictionsRestaurantsAssoc'); });
                },
                'GetRestrictionsRestaurantsAssocId': function (cId) {
                    var url = trFactory.apiInterface.RestrictionsRestaurantsAssoc.GET.GetRestrictionsRestaurantsAssocId;
                    url = DynamicApiService.regexUrl(url, { Id: cId });
                    return DynamicApiService.getV3('RestrictionsRestaurantsAssoc', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetRestrictionsRestaurantsAssocId'); });
                },
                'InsertRestrictionsRestaurantsAssoc': function (model) {
                    var url = trFactory.apiInterface.InsertRestrictionsRestaurantsAssoc.POST.InsertRestrictionsRestaurantsAssoc;
                    return DynamicApiService.postV3('RestrictionsRestaurantsAssoc', url, model)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'InsertRestrictionsRestaurantsAssoc'); });
                },
                'UpdateRestrictionsRestaurantsAssoc': function (model) {
                    var url = trFactory.apiInterface.RestrictionsRestaurantsAssoc.POST.UpdateRestrictionsRestaurantsAssoc;
                    return DynamicApiService.postV3('RestrictionsRestaurantsAssoc', url, model)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'UpdateRestrictionsRestaurantsAssoc'); });
                },
                'DeleteRestrictionsRestaurantsAssoc': function (cId) {
                    var url = trFactory.apiInterface.DeleteRestrictionsRestaurantsAssoc.POST.DeleteExcludeRestriction;
                    url = DynamicApiService.regexUrl(url, { Id: cId });
                    return DynamicApiService.postV3('RestrictionsRestaurantsAssoc', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'DeleteRestrictionsRestaurantsAssoc'); });
                },

                // Excluded Restrictions
                'GetExcludeRestrictions': function () {
                    var url = trFactory.apiInterface.ExcludeRestrictions.GET.GetExcludeRestrictions;
                    return DynamicApiService.getV3('ExcludeRestrictions', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetExcludeRestrictions'); });
                },
                'GetExcludeRestrictionById': function (cId) {
                    var url = trFactory.apiInterface.ExcludeRestrictions.GET.GetExcludeRestrictionById;
                    url = DynamicApiService.regexUrl(url, { Id: cId });
                    return DynamicApiService.getV3('ExcludeRestrictions', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetExcludeRestrictionById'); });
                },
                'InsertExcludeRestriction': function (model) {
                    var url = trFactory.apiInterface.ExcludeRestrictions.POST.InsertExcludeRestriction;
                    return DynamicApiService.postV3('ExcludeRestrictions', url, model)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'InsertExcludeRestriction'); });
                },
                'UpdateExcludeRestriction': function (model) {
                    var url = trFactory.apiInterface.ExcludeRestrictions.POST.UpdateExcludeRestriction;
                    return DynamicApiService.postV3('ExcludeRestrictions', url, model)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'UpdateExcludeRestriction'); });
                },
                'DeleteOldExcludeRestrictions': function (model) {
                    var url = trFactory.apiInterface.ExcludeRestrictions.POST.DeleteOldExcludeRestrictions;
                    return DynamicApiService.postV3('ExcludeRestrictions', url, model)
                        .then(function (result) {
                            return result;
                        }).catch(function (rejection) { $scope.exHandler(rejection, 'DeleteOldExcludeRestrictions'); });
                },
                'DeleteExcludeRestriction': function (cId) {
                    var url = trFactory.apiInterface.ExcludeRestrictions.POST.DeleteExcludeRestriction;
                    url = DynamicApiService.regexUrl(url, { Id: cId });
                    return DynamicApiService.postV3('ExcludeRestrictions', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'DeleteExcludeRestriction'); });
                },
                // Capacities 
                'GetCapacities': function () {
                    var url = trFactory.apiInterface.Capacities.GET.GetCapacities;
                    return DynamicApiService.getV3('Capacities', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetCapacities'); });
                },
                'GetCapacitiesByRestId': function (restId) {
                    var url = trFactory.apiInterface.Capacities.GET.GetCapacitiesByRestId;
                    url = DynamicApiService.regexUrl(url, { RestId: restId });
                    return DynamicApiService.getV3('Capacities', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetCapacities'); });
                },
                'InsertCapacity': function (model) {
                    var url = trFactory.apiInterface.Capacities.POST.InsertCapacity;
                    return DynamicApiService.postV3('Capacities', url, model)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'InsertCapacity'); });
                },
                'UpdateCapacity': function (model) {
                    var url = trFactory.apiInterface.Capacities.POST.UpdateCapacity;
                    return DynamicApiService.postV3('Capacities', url, model)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'UpdateCapacity'); });
                },
                'DeleteCapacity': function (model) {
                    var url = trFactory.apiInterface.Capacities.GET.DeleteCapacity;
                    url = DynamicApiService.regexUrl(url, model);
                    return DynamicApiService.getV3('Capacities', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'DeleteCapacity'); });
                },
                // Capacities OverWritten
                'GetOverwrittenCapacities': function () {
                    var url = trFactory.apiInterface.OverwrittenCapacities.GET.GetOverwrittenCapacities;
                    return DynamicApiService.getV3('OverwrittenCapacities', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetOverwrittenCapacities'); });
                },
                'GetOverwrittenCapacityById': function (cId) {
                    var url = trFactory.apiInterface.OverwrittenCapacities.GET.GetOverwrittenCapacityById;
                    url = DynamicApiService.regexUrl(url, { Id: cId });
                    return DynamicApiService.getV3('OverwrittenCapacities', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetOverwrittenCapacityById'); });
                },
                'InsertOverwrittenCapacity': function (model) {
                    var url = trFactory.apiInterface.OverwrittenCapacities.POST.InsertOverwrittenCapacity;
                    return DynamicApiService.postV3('OverwrittenCapacities', url, model)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'InsertOverwrittenCapacity'); });
                },
                'UpdateOverwrittenCapacity': function (model) {
                    var url = trFactory.apiInterface.OverwrittenCapacities.POST.UpdateOverwrittenCapacity;
                    return DynamicApiService.postV3('OverwrittenCapacities', url, model)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'UpdateOverwrittenCapacity'); });
                },
                'DeleteOverwrittenCapacity': function (cId) {
                    var url = trFactory.apiInterface.OverwrittenCapacities.POST.DeleteOverwrittenCapacity;
                    url = DynamicApiService.regexUrl(url, { Id: cId });
                    return DynamicApiService.postV3('OverwrittenCapacities', url).then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'DeleteOverwrittenCapacity'); });
                },

                // Excluded Days
                'GetExcludeDays': function () {
                    var url = trFactory.apiInterface.ExcludeDays.GET.GetExcludeDays;
                    return DynamicApiService.getV3('ExcludeDays', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetExcludeDays'); });
                },
                'GetExcludeDayById': function (cId) {
                    var url = trFactory.apiInterface.ExcludeDays.GET.GetExcludeDayById;
                    url = DynamicApiService.regexUrl(url, { Id: cId });
                    return DynamicApiService.getV3('ExcludeDays', url)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'GetExcludeDays'); });
                },
                'InsertExcludeDay': function (model) {
                    var url = trFactory.apiInterface.ExcludeDays.POST.InsertExcludeDay;
                    return DynamicApiService.postV3('ExcludeDays', url, model)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'InsertExcludeDay'); });
                },
                'UpdateExcludeDay': function (model) {
                    var url = trFactory.apiInterface.ExcludeDays.POST.UpdateExcludeDay;
                    return DynamicApiService.postV3('ExcludeDays', url, model)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'UpdateExcludeDay'); });
                },
                'DeleteOldExcludeDays': function (model) {
                    var url = trFactory.apiInterface.ExcludeDays.POST.DeleteOldExcludeDays;
                    return DynamicApiService.postV3('ExcludeDays', url, model)
                        .then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'UpdateExcludeDay'); });
                },
                'DeleteExcludeDay': function (cId) {
                    var url = trFactory.apiInterface.ExcludeDays.POST.DeleteExcludeDay;
                    url = DynamicApiService.regexUrl(url, { Id: cId });
                    return DynamicApiService.postV3('ExcludeDays', url).then(function (result) { return result; }).catch(function (rejection) { $scope.exHandler(rejection, 'DeleteExcludeDay'); });
                },

            }

            $scope.exHandler = function (rejection, actionName) {
                console.warn('Api Action ' + actionName + ' Failed. Reason:');
                console.warn(rejection); return -1;
            }
        }

    ]).service('DAResService', ['$http', 'config', 'tosterFactory', 'daFactory', function ($http, config, tosterFactory, daFactory) {
        var templates = {
        };
        this.getcontainerTemplate = function (type) {
            var ret = null;
            if (templates[type] !== undefined && templates[type] !== null) {
                ret = templates[type];
            } else {
                console.log('Invalid template match or error on matching template of type:' + type);
                ret = templates['errorLoad'];
            }
            return ret;
        };

        var titles = {
            'Polygons': 'Polygons',
            'errorLoad': 'Invalid Delivery Agent Module'
        };
        this.getcontainerTitle = function (type) {
            var ret = null;
            if (titles[type] !== undefined && titles[type] !== null) {
                ret = titles[type];
            } else {
                console.log('Invalid template header match or error on matching title of type:' + type);
                ret = titles['errorLoad'];
            }
            return ret;
        }
    }])