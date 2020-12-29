'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:ManageAllowedMealsCtrl
 * @description
 * Table res Controller is main controller of module table reservation
 * Handles Table res Components and loaded on each parent state
 * provides functionality of components and modules on top lvl of table reservation
 * Controller of the posBOApp / Table reservation Module 
 */

angular.module('posBOApp')
    .controller('ManageAllowedMealsCtrl', [
        'tosterFactory', '$stateParams', '$scope', '$rootScope', '$q', '$interval', '$uibModal', '$mdDialog', '$mdMedia', 'DynamicApiService', 'dataUtilFactory', 'DAResService', 'mamFactory',
        function (tosterFactory, $stateParams, $scope, $rootScope, $q, $interval, $uibModal, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, DAResService, mamFactory) {
            $scope.idlestate = false; //this is a var to disable actions as idle state
            $scope.initView = function () {
                $scope.viewTitle = DAResService.getcontainerTitle($scope.editingEntity);
                $rootScope.stateName = $scope.viewTitle;
            }
        }

    ]).service('DAResService', ['$http', 'config', 'tosterFactory', 'mamFactory', function ($http, config, tosterFactory, mamFactory) {
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
            'AllowedMeals': 'Manage AllowedMeals',
            'errorLoad': 'Invalid Manage Allowed Meals Module'
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