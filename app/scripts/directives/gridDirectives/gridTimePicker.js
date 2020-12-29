var app = angular.module('ui.grid.edit');

app.directive('uiGridEditTimePicker', ['$timeout', '$document', 'uiGridConstants', 'uiGridEditConstants', function ($timeout, $document, uiGridConstants, uiGridEditConstants) {
    return {
        template: function (element, attrs) {
            var html = '<input name="timePickerValue" mdc-datetime-picker date="false" time="true" minutes="true" seconds="false" minute-steps="1" format="hh:mm a" ng-model-options="{timezone: \'utc\'}" short-time="true" type="text" today-text="Now" ng-model="timePickerValue" ng-change="changeDate($event)" class="md-input">';
            return html;
        },
        require: ['?^uiGrid', '?^uiGridRenderContainer'],
        scope: true,
        compile: function () {
            return {
                pre: function ($scope, $elm, $attrs) {

                },
                post: function ($scope, $elm, $attrs, controllers) {
                    $scope.timePickerValue = new Date($scope.row.entity[$scope.col.field]);
                    var uiGridCtrl = controllers[0];
                    var renderContainerCtrl = controllers[1];

                    var onWindowClick = function (evt) {

                    };

                    $scope.changeDate = function (evt) {
                        $scope.row.entity[$scope.col.field] = $scope.timePickerValue.format("hh:mm A");
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
