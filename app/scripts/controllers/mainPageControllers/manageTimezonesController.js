'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:ManageTimezonesCtrl
 * @description
 * Table res Controller is main controller of module table reservation
 * Handles Table res Components and loaded on each parent state
 * provides functionality of components and modules on top lvl of table reservation
 * Controller of the posBOApp / Table reservation Module 
 */

angular.module('posBOApp')
    .controller('ManageTimezonesCtrl', [
        'tosterFactory', '$stateParams', '$scope', '$rootScope', '$q', '$interval', '$uibModal', '$mdDialog', '$mdMedia', 'DynamicApiService', 'dataUtilFactory', 'DAResService', 'tmznFactory',
        function (tosterFactory, $stateParams, $scope, $rootScope, $q, $interval, $uibModal, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, DAResService, tmznFactory) {
            debugger
            $scope.idlestate = false; //this is a var to disable actions as idle state
            $scope.initView = function () {
                $scope.viewTitle = DAResService.getcontainerTitle($scope.editingEntity);
                $rootScope.stateName = $scope.viewTitle;
            }
        }

    ]).service('DAResService', ['$http', 'config', 'tosterFactory', 'tmznFactory', function ($http, config, tosterFactory, tmznFactory) {
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
            'Timezones': 'Manage Timezones',
            'errorLoad': 'Invalid Manage Allowed Timezones Module'
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