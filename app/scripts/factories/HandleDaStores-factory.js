
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('handleDaStoresfactory', [function () {
        var fac = this;
        fac.apiInterface = {
            HandleDaStores: {
                GET: {
                    GetDaStores: 'GetBOStores',
                    updateStoreTables:'updateStoreTables/StoreId/'
                    //GetVodafone11: 'vodafone11',
                    //GetOneOffVodafone11Promos: 'OneOffVodafone11/Id/{Id}',
                    //GetVodafone11HeaderPromos: 'vodafone11headers',
                    //GetVodafone11Details: 'vodafone11details',
                    //GetVodafone11AllDetails: 'vodafone11alldetails'
                },
                POST: {
                    InsertStore: 'addBOStores',
                    DeleteStore: 'BOdelete/id/',
                    UpdateStores:'BOupdate',
                    //InsertVodafone11Details: 'InsertVodafone11Details',
                    //DeleteVodafone11: 'DeleteVodafone11/Id/',
                    //DeleteVodafone11Detail: 'DeleteVodafone11Details/Id/',
                    //UpdateVodafone11Promos: 'UpdateVodafone11Headers',
                    //UpdateVodafone11DetailsPromos: 'UpdateVodafone11Details'
                },
            }
        };

        fac.controllers = ['HandleDaStores'];
        return fac;
    }])