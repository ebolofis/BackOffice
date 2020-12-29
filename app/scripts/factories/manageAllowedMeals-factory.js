
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('mamFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            AllowedMeals: {
                GET: {
                    GetMacros: 'GetMacros',
                    DeleteMacros: 'DeleteMacros/',
                    GetProtelTravelAgentList: 'GetProtelTravelAgentList/',
                    GetProtelRoomNo: 'GetProtelRoomNo/',
                    GetSource: 'GetSource/',
                    GetRoomType: 'GetRoomType/',
                    GetBookedRoomType: 'GetBookedRoomType/',
                    GetNationalityCode: 'GetNationalityCode/',
                    GetBoards: 'GetBoards/',
                    GetVip: 'GetVip/',
                    GetGroups: 'GetGroups',
                    GetFilteredProtelTravelAgentList: 'GetFilteredProtelTravelAgentList/',
                    GetFilteredProtelGroupList: 'GetFilteredProtelGroupList/',
                    GetFilteredProduct: 'GetFilteredProduct',
                    GetHotelPricelists: 'GetHotelPricelists/',
                    GetMemberships: 'GetMemberships/',
                    GetSubmemberships:'GetSubmemberships/'

                },
                POST: {
                    UpdateMacros:'UpdateMacros',
                    delete: 'delete/id',
                    InsertMacros: 'InsertMacros',
                    ValidateTimezoneExpression:'ValidateTimezoneExpression',
                },
            }
        };

        fac.controllers = ['AllowedMeals'];
        return fac;
    }])