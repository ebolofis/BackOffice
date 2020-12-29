var app = angular.module('ui.grid.edit');

app.directive('uiGridEditDatetimepicker', ['$timeout', '$document', 'uiGridConstants', 'uiGridEditConstants', function ($timeout, $document, uiGridConstants, uiGridEditConstants) {
    return {
        template: function (element, attrs) {
            var html = '<input name="datePickerValue" mdc-datetime-picker date="true" time="true" minutes="true" seconds="false" minute-steps="1" format="DD MMM YYYY HH:mm" ng-model-options="{timezone: \'utc\'}" short-time="true" type="text" today-text="Now" ng-model="datePickerValue" ng-change="changeDate($event)" class="md-input">';
            return html;
        },
        require: ['?^uiGrid', '?^uiGridRenderContainer'],
        scope: true,
        compile: function () {
            return {
                pre: function ($scope, $elm, $attrs) {

                },
                post: function ($scope, $elm, $attrs, controllers) {
                    $scope.datePickerValue = new Date($scope.row.entity[$scope.col.field]);
                    var uiGridCtrl = controllers[0];
                    var renderContainerCtrl = controllers[1];

                    var onWindowClick = function (evt) {

                    };

                    $scope.changeDate = function (evt) {
                        $scope.row.entity[$scope.col.field] = $scope.datePickerValue.format("DD MMM YYYY HH:mm");
                        $scope.stopEdit(evt);
                    };

                    $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                        if (uiGridCtrl.grid.api.cellNav) {
                            uiGridCtrl.grid.api.cellNav.on.navigate($scope, function (newRowCol, oldRowCol) {
                                $scope.stopEdit();
                            });
                        }
                        angular.element(window).on('click', onWindowClick);
                    });

                    $scope.$on('$destroy', function () {
                        angular.element(window).off('click', onWindowClick);
                    });

                    $scope.stopEdit = function (evt) {
                        $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                    };

                }
            };
        }
    };
}]);
