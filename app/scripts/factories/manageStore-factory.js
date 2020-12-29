
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('msFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            Stores: {
                GET: {
                    GetStoreBystaffId: 'GetStoreBystaffId',
                    GetShortagesByStore: 'GetShortagesByStore',
                    GetPolygons: 'GetPolygons/StoreId',
                    GetProducts: 'GetComboListDA'
                },
                POST: {
                    delete: 'delete/id',
                    insert: 'insert'
                },
            }
        };

        fac.controllers = ['Store'];
        return fac;
    }])