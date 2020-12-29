
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('dasFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            ManageDaShortages: {
                GET: {
                    GetStores:'GetStores',
                    GetShortagesList: 'GetList',
                    GetShortagesByStore: 'GetShortagesByStore',
                    GetStoreBystaffId: 'GetStoreBystaffId',
                    GetShortagesByStore: 'GetShortagesByStore',
                    GetPolygons: 'GetPolygons/StoreId',
                    GetProducts: 'GetComboList',
                    // GetProducts:'Product'
                },
                POST: {
                    DeleteShortages: 'delete/id',
                    InsertShortages: 'insert',
                    UpdateShortages:'update'
                
                },
            }
        };

        fac.controllers = ['ManageDaShortages'];
        return fac;
    }])