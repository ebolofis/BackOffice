'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */
angular.module('posBOApp')
       .service('HeaderActionsService', ['$http', '$rootScope', 'tosterFactory', function ($http, $rootScope, tosterFactory) {
           this.toggleSideBar = function (value) {
               if (value !== undefined)
                   $rootScope.sideCollapse = value;
               else  
                   ($rootScope.sideCollapse == true) ? $rootScope.sideCollapse= false : $rootScope.sideCollapse = true;
           }
       }])