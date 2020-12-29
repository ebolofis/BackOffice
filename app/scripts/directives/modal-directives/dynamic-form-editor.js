'use strict';
/**
 * @ngdoc directive
 * @info: Dynamic form editor is a modal that loads templates with 
 * common-used-modules / loadDynamicTemplate directive and provide
 * single modal actions on form success 
 * ******** remember to manage return results on caller controller ********
 * ******** remember to manage templates with ng-Controller on top element  or provide a controller in master controller********
 * #posBOApp
 */
angular.module('posBOApp')
.controller('DynamicFormEditorCtrl', function ($uibModalInstance, $filter, templateOptions) {
    $scope.templateOptions =templateOptions
    $scope.hide = function () { $mdDialog.hide(); };
    $scope.cancel = function () { $mdDialog.cancel(); };
    $scope.confirm = function (answer) {
        var ret = { data: $scope.dataModel}
        $mdDialog.hide(ret);
    }

})