'use strict';

/**
 * @ngdoc directive
 * @name directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('posBOApp')
    .directive('stateHeader', function () {
        return {
            templateUrl: 'app/scripts/directives/header/state-header.html',
            restrict: 'E',
            controller: ["$scope", "$rootScope", function ($scope, $rootScope) {
                $rootScope.$watch('stateName', function (newValue, oldValue) {
                    if (newValue != null && typeof $rootScope.stateName == 'string' && newValue.length > 0) {
                        applyHeaderName(newValue);
                    } else {
                        applyHeaderName(null)
                    }
                }, true);


                // function to apply header ref
                function applyHeaderName(value) {
                    if (value != null) {
                        $scope.fullStateName = ' / ' + $rootScope.stateName;
                        $scope.visible = true;
                    } else {
                        $scope.fullStateName = '';
                        $scope.visible = false;
                    }
                }
            }],
            replace: true,
        }
    });


