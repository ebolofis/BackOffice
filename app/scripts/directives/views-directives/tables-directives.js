'use strict';
/**
 * @ngdoc directive
 * @name tables-directives :posBOApp_directive_Creator
 * @Includes Commonly Used Directives in tables view
 * # posBOApp
 */
angular.module('posBOApp')
    .directive('widgetChoiceMenu', function () {
        return {
            template: '<div class="quicklrm" style="position:absolute;" ng-style="{left: options.left, top: options.top}"><md-fab-speed-dial md-open="widget.isMenuOpen" md-direction="\'left\'" ng-class="\'md-scale\'">' +
                    '<md-fab-trigger style="width:20px; min-height:20px;">' +
                    '</md-fab-trigger>' +
                    '<md-fab-actions mg-theme="fabActions">' +
                    '<md-button ng-repeat="choice in actionChoices" aria-label="{{choice.desc}}" class="md-fab rcmofab md-raised md-mini" ng-click="choiceClicked(choice)">' +
                        '<i class="{{choice.iconClass}}"></i>' +
                        '<md-tooltip md-direction="right">{{choice.desc}}</md-tooltip>' +
                    '</md-button></md-fab-actions></md-fab-speed-dial></div>',
            controller: function ($scope) {
                $scope.choiceClicked = function (choice) {
                    $scope.choiceSelected = choice;
                }
            },
            restrict: 'E',
            scope: {
                widget: '=',
                actionChoices: '=',
                options: '=',
                choiceSelected:'=' 
            },

        }
    })
