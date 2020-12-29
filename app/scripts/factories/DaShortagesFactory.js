
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('dsFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            DaShortages: {
                GET: {
                  GetShortagesList: 'GetList',
                    GetShortagesByStore: 'GetShortagesByStore',
                    GetStoreBystaffId: 'GetStoreBystaffId',
                    GetShortagesByStore: 'GetShortagesByStore',
                    GetPolygons: 'GetPolygons/StoreId',
                    GetProducts: 'GetComboList',
                //  GetProducts:'Product'
                },
                POST: {
                    DeleteShortages: 'delete/id',
                    InsertShortages: 'insert'
                },
            }
        };

        fac.controllers = ['DaShortages'];
        return fac;
    }])