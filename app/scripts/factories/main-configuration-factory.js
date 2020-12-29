
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('mcFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            MainConfiguration: {
                GET: {
                    GetConfiguration: 'GetAllConfiguration',
                    GetDescriptors: 'GetAllDescriptors',
                    AddFile: 'AddPosConfig/posJsonFile',
                    DeleteFile: 'DeletePosConfig/PosConfigFile'
                },
                POST: {
                    SaveAllChanges: 'SaveAllChanges',
                    SaveSpecificPos: 'SaveSpecificPos'
                },
            }
        };

        fac.controllers = ['MainConfiguration'];
        return fac;
    }])