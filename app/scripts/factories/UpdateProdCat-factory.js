
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('ChangeProductCategoriesVatFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            UpdateProdCat: {
                GET: {
                    GetProductCategories:'get/{enabled=1}',
                    GetAllAvailableVatValues: 'get',
             
                },
                POST: {
                    //InsertVodafone11: 'insertVodafone11',
                    UpdateProdCatVat: 'UpdateProductCategoriesVat'
                },
            }
        };

        fac.controllers = ['UpdateProdCat'];
        return fac;
    }])