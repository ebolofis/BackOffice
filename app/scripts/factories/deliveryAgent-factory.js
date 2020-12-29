
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('daFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            Polygons: {
                GET: {
                    GetPolygons: 'GetList',
                    GetPolygonsColor:'GetColor/Id',
                },
                POST: {
                    InsertRestaurant: 'Insert',
                    UpdateRestaurant: 'Update',
                    DeleteRestaurant: 'Delete/Id/{Id}',
                    GenerateShapes:'GenerateShapes',
                },
            }
        };

        fac.controllers = ['Polygons'];
        return fac;
    }])