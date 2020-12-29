
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('managepayrollFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            Payroll: {
                GET: {
                    GetPayroll: 'Get'
                },
                POST: {
                    InsertPayroll: "InsertPayroll",
                    UpdatePayroll: "Update",
                    DeletePayroll: 'Delete/Ιd/'
                },
            }
        };

        fac.controllers = ['Payroll'];
        return fac;
    }])