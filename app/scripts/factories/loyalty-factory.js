
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('loyalFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            Loyalty: {
                GET: {
                    GetLoyaltyConfig: 'GetLoyaltyConfig',
                    GetProducts: 'GetComboList',
                    GetProductCategories: 'GetComboList'
                },
                POST: {
                    SetLoyaltyConfig: 'SetLoyaltyConfig',
                    InsertGainAmountRange: 'InsertGainAmountRange',
                    DeleteRangeRow: 'DeleteRangeRow',
                    DeleteGainAmountRange: 'DeleteGainAmountRange',
                    InsertRedeemFreeProduct: 'InsertRedeemFreeProduct',
                    DeleteRedeemFreeProductRow: 'DeleteRedeemFreeProductRow',
                    DeleteRedeemFreeProduct: 'DeleteRedeemFreeProduct'
                },
            }
        };

        fac.controllers = ['Loyalty'];
        return fac;
    }])