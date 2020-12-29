
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('mohFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            ManageDaOpeningHours: {
                GET: {
                    GetStores: 'GetStores',
                    GetOpeningHours:'GetHours'
                  
                },
                POST: {
                    SaveForStore: 'SaveForStore',
                    SaveForAllStores:'SaveForAllStores'

                },
            }
        };

        fac.controllers = ['ManageDaOpeningHours'];
        return fac;
    }])