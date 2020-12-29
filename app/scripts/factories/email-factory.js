
'use strict';

angular.module('posBOApp')
    .factory('emailFactory', [function () {
        var fac = this;
        fac.apiInterface = {
            EmailConfig: {
                GET: {
                    GetEmailConfig: "Get"
                },
                POST: {
                    InsertEmailConfig: "Insert",
                    UpdateEmailConfig: "Update",
                    DeleteEmailConfig: "Delete/Id/"
                },
            }
        };

        fac.controllers = ['EmailConfig'];
        return fac;
    }])