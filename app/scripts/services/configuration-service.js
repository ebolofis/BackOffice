'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */
angular.module('posBOApp')
       .service('ConfigService', ConfigService)

function ConfigService($http, config, auth) {
    var urlBase = config.WebApiURL + 'api/';

    this.checkHotelInfo = function (protelConModel) {
        var authSpecs = auth.getLoggedSpecs();
        $http.defaults.headers.common['Authorization'] = authSpecs.auth;
        var callUrl = urlBase + authSpecs.storeId + '/ConnectionService/CheckProtelSql';
        console.log(callUrl); console.log(JSON.stringify(protelConModel));
        return $http({ url: callUrl, method: "POST", dataType: 'JSON', data: JSON.stringify(protelConModel) });

    }
}