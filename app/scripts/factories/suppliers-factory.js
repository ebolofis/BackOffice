
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('suppliersFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            Suppliers: {
                GET: {
                    GetSuppliers: 'GetAll',
                    DeleteSupplier: 'Delete/Ιd/'
                },
                POST: {
                    InsertSupplier: "Insert",
                    UpdateSupplier: 'Update'
                },
            }
        };

        fac.controllers = ['Suppliers'];
        return fac;
    }])