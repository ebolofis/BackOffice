'use strict';

angular.module('posBOApp')
    .controller('SuppliersCtrl', [
        'tosterFactory', '$stateParams', '$scope', '$rootScope', '$q', '$interval', '$uibModal', '$mdDialog', '$mdMedia', 'DynamicApiService', 'dataUtilFactory', 'DAResService', 'suppliersFactory',
        function (tosterFactory, $stateParams, $scope, $rootScope, $q, $interval, $uibModal, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, DAResService, suppliersFactory) {
            $scope.idlestate = false;
            $scope.initView = function () {
                $scope.viewTitle = DAResService.getcontainerTitle($scope.editingEntity);
                $rootScope.stateName = $scope.viewTitle;
            }

            $scope.exHandler = function (rejection, actionName) {
                console.warn('Api Action ' + actionName + ' Failed. Reason:');
                console.warn(rejection); return -1;
            }

        }]).service('DAResService', ['$http', 'config', 'tosterFactory', 'suppliersFactory', function ($http, config, tosterFactory, suppliersFactory) {
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
                'Suppliers': 'Manage Suppliers',
                'errorLoad': 'Invalid Suppliers Module',
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