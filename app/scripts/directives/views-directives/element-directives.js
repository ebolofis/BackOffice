'use strict';
/**
 * @ngdoc directive
 * @name element-directives-handler:posBOApp_directive_Creator
 * @Includes Commonly Used Directives
 * # posBOApp
 */
angular.module('posBOApp')
    //drop downlist with search header filter select/unselect and action button 
    .directive('listRepeatElement', function () {
        return {
            controller: 'ListRepeatElementCtrl',
            restrict: 'EC',
            scope: {
                header: '=',
                displayField: '=',
                mainlist: '=',

                containerClass:"=?",
                loopItemClass:"=",
                loopItemSelectedClass:"=",
                searchPlaceholder:"=",
                extraFilter: '=?',

                actionFun: '&',
                actionDesc: '=',
                actionDisable: '&',
                actionIcon: '=',
            },
            templateUrl: 'app/scripts/directives/views-directives/list-repeat-element.html',

        };
    })
    .controller("ListRepeatElementCtrl", function ($scope) {
        ($scope.header === undefined || $scope.header === null || $scope.header == '') ? $scope.displayHeader = false : $scope.displayHeader = true;
        if ($scope.extraFilter === undefined || $scope.extraFilter === null) {
            $scope.extraFilter = function (item) {
                return true;
            };

        }
        ($scope.actionDesc === undefined && $scope.actionDisable.name == "" && $scope.actionFun.name == "" && $scope.actionIcon === undefined) ?  $scope.hideABbutton = true :  $scope.hideABbutton = false;
           

        $scope.selectAll = false;
        $scope.toggleSelection= function() {
            ($scope.selectAll == true) ? $scope.selectAll = false : $scope.selectAll = true;
            angular.forEach($scope.mainlist, function (item) {
                item.selected = $scope.selectAll;
            })
        }
    })

    //directive of draggable buttons used in Pages
    .directive('draggablePageButton', function () {
        return {
            controller: 'DraggablePageButtonCtrl',
            restrict: 'EC',
            scope: {
                pageButton: '=',
                selectButtonFun: '=',
                deleteButtonFun : '='
            },
            templateUrl: 'app/scripts/directives/views-directives/draggable-page-button.html',

        };
    }).controller('DraggablePageButtonCtrl', ['$scope', '$locale', function ($scope, $locale) {

        //$scope.clickOnButton = function () {
        //    $scope.selectPageButton = pageButtonClick
        //}


    }])