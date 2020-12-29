'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:HandleDaStoresCtrl
 * @description
 * Table res Controller is main controller of module table reservation
 * Handles Table res Components and loaded on each parent state
 * provides functionality of components and modules on top lvl of table reservation
 * Controller of the posBOApp / Table reservation Module 
 */

angular.module('posBOApp')
    .controller('ManageMessagesCtrl', [
        'tosterFactory', '$stateParams', '$scope', '$rootScope', '$q', '$interval', '$uibModal', '$mdDialog', '$mdMedia', 'DynamicApiService', 'dataUtilFactory', 'DAResService', 'manageMessagesFactory',
        function (tosterFactory, $stateParams, $scope, $rootScope, $q, $interval, $uibModal, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, DAResService, manageMessagesFactory) {
            $scope.idlestate = false; // this is a var to disable actions as idle state
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

            $scope.exHandler = function (rejection, actionName) {
                console.warn('Api Action ' + actionName + ' Failed. Reason:');
                console.warn(rejection); return -1;
            }

        }]).service('DAResService', ['$http', 'config', 'tosterFactory', 'manageMessagesFactory', function ($http, config, tosterFactory, manageMessagesFactory) {
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
                'Messages': 'Manage Messages',
                'errorLoad': 'Invalid Delivery Agent Module',
                // 'OnlyDetails': 'Vodafone11Details'
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