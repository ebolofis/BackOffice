'use strict';
(function (window, angular) {
  var ngSpectrum = angular.module('ngSpectrum', []);
  ngSpectrum.directive('spectrum', function () {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: { options: '=options' },
      replace: true,
      template: '<span><input class="input-color" /></span>',
      link: function (scope, element, attrs, ngModel) {
        var $input = element.find('.input-color');
        scope.onChange = function (color) {
          scope.$apply(function () {
            ngModel.$setViewValue(color ? color.toString() : '');
          });
        };
        var options = {
            change: scope.onChange,
            showInput: true
          };
        scope.$watch('options', function (ops) {
          angular.extend(options, ops);
          $input.spectrum(options);
        }, true);
        scope.$watch(function () {
          return ngModel.$modelValue;
        }, function (color) {
          $input.spectrum('set', color ? color.toString() : '');
        });
        scope.onToggle = function () {
          $input.spectrum('toggle');
          return false;
        };
        //noinspection JSUnresolvedVariable
        if (attrs.triggerElement) {
          //noinspection JSUnresolvedVariable
          angular.element(document.body).on('click', attrs.triggerElement, scope.onToggle);
        }
        scope.$on('$destroy', function () {
          $input.spectrum('destroy');
        });
      }
    };
  });
}(window, window.angular));