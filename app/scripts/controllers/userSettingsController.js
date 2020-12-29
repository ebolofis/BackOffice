'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:UserSettingsCtrl
 * @description
 * # UserSettingsCtrl
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .controller('UserSettingsCtrl', ['$scope', 'auth', 'tosterFactory', '$mdDialog', '$mdMedia', function ($scope, auth, tosterFactory, $mdDialog, $mdMedia) {
        $scope.userPrefs = function () {
            //var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var userSettings = {}
            $mdDialog.show({
                controller: function ($scope, $mdDialog) {
                    //$scope.tableModels = tableSizeOptions.map(function (item) { item.selected = false; return item; });
                    //$scope.modelToIns = null;
                    $scope.hide = function () { $mdDialog.hide(); };
                    $scope.cancel = function () { $mdDialog.cancel(); };
                    $scope.confirm = function (answer) {
                        var ret = { data: $scope.modelToIns }
                        $mdDialog.hide(ret);
                    }
                    $scope.datePref = new Date();
                },
                templateUrl: '/app/scripts/directives/user-settings/user-settings-templates.html',
                parent: angular.element('#wrapper'),
                clickOutsideToClose: true,
                //fullscreen: useFullScreen,
                resolve: {
                    //tableSizeOptions: function () {
                    //    return $scope.tableSizeOptions;
                }
            }).then(function (retdata) {

            })
        }
    }]);