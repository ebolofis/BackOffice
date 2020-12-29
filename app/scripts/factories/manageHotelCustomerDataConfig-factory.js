
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('hcdcFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            HotelCustomerDataConfig: {
                GET: {
                    GetParams: 'GetParams',
                    GetCustomerDataConfig: 'GetCustomerDataConfig',
                    DeleteCustomerDataConfigField: 'DeleteCustomerDataConfigField/',
                },
                POST: {
                    HandleHotelCustomerDataConfig: 'HandleHotelCustomerDataConfig',

                    UpdateCustomerDataConfig: 'UpdateCustomerDataConfig'
                },
            }
        };

        fac.controllers = ['HotelCustomerDataConfig'];
        return fac;
    }])