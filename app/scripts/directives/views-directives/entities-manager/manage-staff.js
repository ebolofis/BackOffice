'use strict';
angular.module('posBOApp')
    .directive('staffManager', function () {
        return {
            controller: 'StaffManagerCtrl',
            restrict: 'E',
            scope: {},
            templateUrl: 'app/scripts/directives/views-directives/entities-manager/manage-staff-template.html',

        };
    })
    .controller('StaffManagerCtrl', function ($scope, $mdDialog) {

    })