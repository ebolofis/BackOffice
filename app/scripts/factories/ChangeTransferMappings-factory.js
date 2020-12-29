
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('ChangeTransferMappingsFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            ChangeTransferMappings: {
                GET: {
                   // GetAllAvailableVatValues: '/get',
                    GetAllEnabledProductCategories: '/get/{enabled=1}',
                    GetAllHotelInfo: 'GetHotelInfo',
                   

                },
                POST: {
                    GetPMSDepartments: 'GetPMSDepartments',
                    GetTransferMappings: 'GetTransferMappings',
                    UpdateTransferMappings: 'UpdateTransferMappings'
                },
            }
        };

        fac.controllers = ['ChangeTransferMappings'];
        return fac;
    }])

