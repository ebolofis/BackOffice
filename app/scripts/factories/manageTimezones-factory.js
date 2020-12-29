
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('tmznFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            Timezones: {
                GET: {
                    GetTimezones: 'GetTimezones',
                    DeleteTimezones:'DeleteTimezones/'
                },
                POST: {
                    InsertTimezones: 'InsertTimezones',
                    UpdateTimezones:'UpdateTimezones'

                },
            }
        };

        fac.controllers = ['Timezones'];
        return fac;
    }])