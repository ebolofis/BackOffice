
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('hcmFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            HotelCustomMessages: {
                GET: {
                    GetParams: 'GetParams',
                    GetCustomMessages: 'GetCustomMessages',
                    GetCustomMessage: 'GetCustomMessage/',
                    DeleteCustomMessage: 'DeleteCustomMessage/',
                },
                POST: {
                    InsertCustomMessage: 'InsertCustomMessage',
                 
                    UpdateCustomMessage: 'UpdateCustomMessage'
                },
            }
        };

        fac.controllers = ['HotelCustomMessages'];
        return fac;
    }])