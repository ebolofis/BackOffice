
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('manageMessagesFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            Messages: {
                GET: {
                    GetMainMessages: 'GetAllMessages',
                    GetMessages:'GetMessageByMainMessageId/id',
                    GetMessagesDetails: "GetMessageDetailsMessageId/id",
                    GetMessagesLookups: "GetMessagesLookups/id",
                    GetMessagesLookupsDetails: "GetMessagesLookupsDetails/id",
                },
                POST: {
                   CreateMainMessage: 'InsertMainMessage',
                   CreateMessage: 'InsertMessage',
                   CreateMessageDetail:'InsertMessageDetail',

                   DeleteMainMessage: "DeleteMainMessage/Id",
                   DeleteMessage: "DeleteMessage/Id",
                   DeleteMessageDetail:"DeleteMessageDetail/Id",

                   UpdateMainMessage:'UpdateMainMessage',
                    UpdateMessage:'UpdateMessage',
                    UpdateMessageDetail:'UpdateMessageDetail',


                    InsertPayroll: "InsertPayroll",
                    DeletePayroll: 'Delete/Ιd/',
                    UpdatePayroll: "Update",
                    UpdateCombo: "UpdateCombo",
                    UpdateDiscount: "UpdateDiscount",
                    DeleteCombo: "DeleteCombo/Ιd/",
                    DeleteDiscount: "DeleteDiscount/Ιd/"

                },
            }
        };

        fac.controllers = ['Messages'];
        return fac;
    }])