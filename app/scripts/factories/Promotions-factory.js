
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('managepromosFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            Promotions: {
                GET: {
                    GetPromos: 'Get',
                    GetPromotionDetails: "Get/Ιd",
                    GetPromoPriceLists: "GetPromoPriceLists"
                },
                POST: {
                    InsertPromotion: 'Insert',
                    InsertCombo: "InsertCombo",
                    InsertDiscount: "InsertDiscount",
                    DeletePromotion: 'Delete/Ιd/',
                    UpdatePromotions: "Update",
                    UpdateCombo: "UpdateCombo",
                    UpdateDiscount: "UpdateDiscount",
                    DeleteCombo: "DeleteCombo/Ιd/",
                    DeleteDiscount: "DeleteDiscount/Ιd/",
                    UpsertPromotionPricelists: "UpsertPromotionPricelists"
                },
            }
        };

        fac.controllers = ['Promotions'];
        return fac;
    }])