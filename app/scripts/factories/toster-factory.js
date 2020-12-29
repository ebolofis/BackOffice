'use strict';
/**
 * @ngdoc function
 * @name posBOApp.tosterFactory
 * @description 
 * # It is a factory of dynamic toaster pop up by defined models and template
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('tosterFactory', ['$http', '$mdToast', function ($http, $mdToast) {
        var factory = {}
        factory.showCustomToast = function (message, calltype, delay, vposition, intmpl) {
            var vpos, vdelay;
            (vposition === undefined || vposition === null) ? vpos = 'bottom right' : vpos = vposition;
            (delay === undefined || delay === null || !angular.isNumber(delay)) ? vdelay = 1000 : vdelay = delay;

            $mdToast.show({
                hideDelay: vdelay,
                position: vpos,
                controller: 'ToastCtrl',
                templateUrl: '../app/views/global-used-templates/dynamic-toaster-template.html',
                locals: { msg: message, type: calltype, innerTmpl: intmpl }
            });
        };
        return factory;
    }]).controller('ToastCtrl', function ($scope, $mdToast, $mdDialog, msg, type, innerTmpl) {
        (innerTmpl === undefined || innerTmpl === null) ? $scope.innerTmpl = 'simple-dynamic-default-toster' : $scope.innerTmpl = innerTmpl;
        var isDlgOpen;

        $scope.message = msg;
        $scope.icons = {
            info: { icon: 'action:info', color: '#03a9f4' },
            error: { icon: 'content:report', color: 'red' },
            warning: { icon: 'alert:warning', color: '#ff9800' },
            fail: { icon: 'navigation:cancel', color: '#d32f2f' },
            success: { icon: 'navigation:check', color: '#4caf50' },
            empty: { icon: '', color: '' },
            debug: { icon: 'action:settings', color: 'greenyellow' }
        }
       $scope.svgIcon = $scope.icons[type];
       

        $scope.closeToast = function () {
            if (isDlgOpen) return;
            $mdToast.hide().then(function () {
                  isDlgOpen = false;
              });
        };

        $scope.openMoreInfo = function (e) {
            if (isDlgOpen) return;
            isDlgOpen = true;

            $mdDialog.show(
                $mdDialog.alert().title('More info goes here.')
                .textContent('Something witty.').ariaLabel('More info').ok('Got it').targetEvent(e)).then(function () {
                  isDlgOpen = false;
                })
        };
    });
