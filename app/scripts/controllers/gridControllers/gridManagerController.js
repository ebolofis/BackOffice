'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:GridManagerController
 * @description
 * # GridManagerController
 * Controller of the posBOApp
 */

angular.module('posBOApp')
.controller('GridManagerController', ['tosterFactory', '$stateParams', '$scope', '$filter', '$http', '$log', '$timeout', '$q', '$interval', '$uibModal', 'uiGridConstants', 'uiGridGroupingConstants', 'DynamicApiService', 'GridInitiallization', 'uiGridFactory', 'dataUtilFactory', 'VariousModelsFactory',
   function (tosterFactory, $stateParams, $scope, $filter, $http, $log, $timeout, $q, $interval, $uibModal, uiGridConstants, uiGridGroupingConstants, DynamicApiService, GridInitiallization, uiGridFactory, dataUtilFactory, VariousModelsFactory) {
       $scope.initView = function () {
           $scope.gridColumnModel = VariousModelsFactory.uigridColumnModel();
       }
       //View and Actions of manager View 
       //Array of choices - Option Panel selected - function to initPanels dependencies
       $scope.editViewOptions = ['Main', 'Options', 'Columns'];
       $scope.selectedEditViewOption = 'Main';
       $scope.selectedViewOptionChanged = function (option) {
           $scope.selectedEditViewOption = option;
           switch (option) {
               case 'Columns': $scope.initGridColumns(); break;
               default: break;
           }
       }
       //action functions of entity change in drop down select
       //use is as init function 
       $scope.selectedEntiyChanged = function (entitySelected) {
           $scope.gridColumnsLoaded = GridInitiallization.getGridParams($scope.selectedGridEntity);
       }
       //Possible Grid Entities
       $scope.gridEntityNames = ['InvoiceTypes', 'Vat', 'Tax', 'PricelistGroup', 'PosInfoDetail_Pricelist_Assoc', 'Accounts', 'PosInfoDetail_Excluded_Accounts', 'AccountMapping',
           'TransactionTypes', 'Discount', 'PredefinedCredits', 'AuthorizedGroupDetail', 'StaffPosition', 'ClientPos', 'PdaModule', 'Kitchen', 'KitchenRegion', 'KitchenInstruction', 'Kds', 'SalesType',
           'Units', 'ProductCategories', 'Categories', 'Items', 'PosInfo', 'PosInfoDetail', 'Products', 'Payrole','ChangeTransferMappins'];
       $scope.selectedGridEntity = '';

       //function used to initiallize [Columns] tab
       $scope.initGridColumns = function () {

           $scope.gridColumnsLoaded = GridInitiallization.getGridParams($scope.selectedGridEntity);
           console.log('gridColumnModel');
           console.log($scope.gridColumnModel);
           console.log('gridColumnsLoaded');
           console.log($scope.gridColumnsLoaded);
       }
       $scope.clickSelectColObject = function (col) {
           $scope.selectedCol = col;
       }
       $scope.selectedCol = null;
       $scope.displayColFieldPlaceHolder = function (key) {
           if ($scope.selectedCol == undefined || $scope.selectedCol == null ||
               $scope.selectedCol[key] == undefined || $scope.selectedCol[key] == null || $scope.selectedCol[key] == '')
               return '';
           return $scope.selectedCol[key];
       }

   }])
.directive('ngPlaceholder', function ($document) {
    return {
        restrict: 'A',
        scope: {
            placeholder: '=ngPlaceholder'
        },
        link: function (scope, elem, attr) {
            scope.$watch('placeholder', function () {
                elem[0].placeholder = scope.placeholder;
            });
        }
    }
});
