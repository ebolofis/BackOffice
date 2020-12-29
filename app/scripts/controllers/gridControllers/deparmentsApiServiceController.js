'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:DeparmentsServiceController
 * @description
 * # DepartmentsController
 * Controller of the posBOApp
 */

angular.module('posBOApp')
.controller('DeparmentsServiceController', ['tosterFactory', '$stateParams', '$scope', '$filter', '$http', '$log', '$timeout', '$q', '$interval', '$uibModal', '$mdDialog', 'uiGridConstants', 'uiGridGroupingConstants', 'DynamicApiService', 'GridInitiallization', 'uiGridFactory', 'dataUtilFactory',
   function (tosterFactory, $stateParams, $scope, $filter, $http, $log, $timeout, $q, $interval, $uibModal, $mdDialog, uiGridConstants, uiGridGroupingConstants, DynamicApiService, GridInitiallization, uiGridFactory, dataUtilFactory) {
       $scope.selectedHotel = null;
       $scope.selectedDeparment = null; $scope.deparmentEnumOptions = {}; $scope.deparmentArrayOptions = []; //var <select> form Department //depEnum { ID:DESC} //depArray [{Id: ... , Desc: ...}]
       $scope.productCategories = []; $scope.productCategoriesEnum = {}; $scope.productCategoriesEnumObjects = {}; //depEnum { ID:DESC} //productCategoriesArray [{...},{...}]
       $scope.vats = []; $scope.vatEnum = {}; $scope.vatEnumObjects = {};
       $scope.pricelists = []; $scope.pricelistEnumOptions = {}; $scope.pricelistArrayOptions = [];
       $scope.pmsLookUpResults = []; $scope.pmsLookUpEnum = {}; $scope.pmsLookUpEnumObjects = {};

       $scope.tmpPricelists; $scope.tmpPmsLookUpResults; $scope.tmpProductCategories;
       $scope.transferMappingResults = []; //Results in pages Called from Server //used to display in Table of Details
       $scope.tmGroupField = 'VatCode'; //CAUTION CHANGE THIS TO MASTER GROUP TRANSFER MAPPINGS ROWS
       $scope.reactionArrayObj = []; //array contain all object actions by models to save and type "insert / delete"
       $scope.maxGId = 0; //used to push next GId on MAster Grouping  Category <Test on VateCode>
       $scope.allPricelistsUsed = []; $scope.allCatsInSelectedGroup = []; $scope.allPmsInSelectedGroup = []; //id arrays of included vars
       $scope.selectedContainerObject; $scope.selectedPmsObject; //master Obj selection  || pms id selected
       $scope.containerObjects = []; //array of contentObjs
       $scope.transferObjectHandleArray = []; //array of obj with status  3 unmodified 2 to del  [LOADED]
       $scope.transferObjectInsertArray = []; // array of obj with status 1 to insert            [INSERTED]

       $scope.loadedPlsSuccess = true; $scope.loadedPmsSuccess = true; $scope.loadedCatsSuccess = true; $scope.loadedPromises = false; $scope.dirtyView = false;
       $scope.displayView = function (obj) {
           var displayObject = {
               mainModel: $scope.containerObjects,
               enums: {
                   dep: $scope.deparmentEnumOptions,
                   pl: $scope.pricelistEnumOptions,
                   pms: $scope.pmsLookUpEnum,
                   cat: $scope.productCategoriesEnum,
               },
               selected: {
                   mainObj: $scope.selectedContainerObject,
                   dep: $scope.selectedDeparment,
                   pms: $scope.selectedPmsObject,

               },
               insertedArr: $scope.transferObjectInsertArray,
               modifiedArr: $scope.transferObjectHandleArray,
               transferMappingsLoaded: $scope.transferMappingResults,
               reactArr: $scope.reactionArrayObj
           };

           var modalInstance = $uibModal.open({
               backdrop: "static", width: '1500px', animation: true,
               templateUrl: '../app/scripts/directives/modal-directives/displayTransferMappings.html', controller: 'DisplayTransferMappingsyCtrl', controllerAs: 'dtm',
               windowClass: 'app-manage-pls-modal-window',
               resolve: {
                   displayObject: function () { return displayObject; },
               }
           });
           modalInstance.result.then(function (data) { }, function (reason) { });
       }
       //InitView Actions
       $scope.initView = function () {
           //get pagged Results of TransferMappings
           var deparmentsPromise = $scope.getDropDownLookUps('Department');
           var productCategoriesPromise = $scope.getDropDownLookUps('ProductCategories');
           //var lookUpPmsPromise = $scope.getDropDownLookUps('PmsDepartments');
           var PricelistPromise = $scope.getDropDownLookUps('Pricelist');
           var HotelInfoPromise = $scope.getDropDownLookUps('HotelInfo');
           //var vatPromise = $scope.getDropDownLookUps('Vat');
           //When all lookUps finished loading 
           $q.all([deparmentsPromise, productCategoriesPromise, PricelistPromise, HotelInfoPromise]).then(function () {
               //$q.all([deparmentsPromise, productCategoriesPromise, lookUpPmsPromise, PricelistPromise, vatPromise]).then(function () {
               //create obj  { PricelistId: { id : desc } , VatDescription: { id : desc } , PmsDepartmentId: { id : desc } }
               $scope.initSelectionLists(true, false, true);
           });
       }
       $scope.initSelectionLists = function (pl, pms, pc) {
           if (pl) $scope.tmpPricelists = angular.copy($scope.pricelists);
           if (pms) {
               $scope.tmpPmsLookUpResults = [];
               var arr = [];
               angular.forEach($scope.pmsLookUpResults, function (value) {
                   var tmp = angular.copy(value); tmp.DepartmentId = parseInt(tmp.DepartmentId);
                   arr.push(tmp);
               });

               $scope.tmpPmsLookUpResults = arr;
           }

           if (pc) $scope.tmpProductCategories = angular.copy($scope.productCategories);
       }
       $scope.$watch('pricelists.length', function (newValue, oldValue) {
           if (newValue > 0) {
               $scope.loadedPlsSuccess = true;
           }
       }, true);
       $scope.$watch('pmsLookUpResults.length', function (newValue, oldValue) {
           if (newValue > 0) {
               $scope.loadedPmsSuccess = true;
           } else if (newValue == 0 && $scope.pmsloadedwithlengthzero == true) {
               $scope.loadedPmsSuccess = true;
           }
       }, true);
       $scope.$watch('productCategories.length', function (newValue, oldValue) {
           if (newValue > 0) {
               $scope.loadedCatsSuccess = true;
           }
       }, true);
       $scope.$watchGroup(['loadedPlsSuccess', 'loadedPmsSuccess', 'loadedCatsSuccess'], function (newValues, oldValues, scope) { //, 'isGridRowDirty'
           if (newValues[0] == newValues[1] == newValues[2] == true)
               $scope.loadedPromises = true;
           else {
               $scope.loadedPromises = false;
           }
       });
       $scope.reloadEntity = function (type) {
           alert(type);
       }
       //Rest GETALL Departments ProductCategories for DropDownLists
       //Create Enum Object Of deparmentOptions = { Id : Desciption } && array of Objs [{Id : .. , Description : .. }]
       $scope.getDropDownLookUps = function (entity) {
           switch (entity) {
               case 'Department': return (
                   DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                       $scope.deparmentArrayOptions = []; $scope.deparmentEnumOptions = {};
                       var dpsLoaded = result.data;
                       $scope.deparmentArrayOptions = dpsLoaded.map(function (item) {
                           var ret = { Id: item.Id, Description: item.Description }; return ret;
                       })
                       $scope.deparmentEnumOptions = dataUtilFactory.createEnums(result.data, {}, 'Id', 'Description');
                   }, function (reason) {
                       tosterFactory.showCustomToast('Loading Departments failed', 'fail');
                       console.log('Fail Load'); console.log(reason);
                   }, function (error) {
                       tosterFactory.showCustomToast('Loading Departments error', 'error');
                       console.log('Error Load'); console.log(error);
                   })
                   ); break;
               case 'Pricelist': return (
                   DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                       var arr = result.data;
                       $scope.pricelists = dataUtilFactory.quicksort(arr, 'Description');
                       $scope.pricelistEnumOptions = {}; $scope.pricelistArrayOptions = [];
                       var dpsLoaded = dataUtilFactory.createEnumsAndEnumObjs($scope.pricelists, $scope.pricelistEnumOptions, $scope.pricelistArrayOptions, 'Id', 'Description');
                       $scope.pricelistEnumOptions = dpsLoaded.retEnum;
                       $scope.pricelistArrayOptions = dpsLoaded.retEnumObj;
                   }, function (reason) {
                       tosterFactory.showCustomToast('Loading Pricelists failed', 'fail');
                       console.log('Fail Load'); console.log(reason);
                   }, function (error) {
                       tosterFactory.showCustomToast('Loading Pricelists error', 'error');
                       console.log('Error Load'); console.log(error);
                   })
                   ); break;
               case 'ProductCategories':
                   return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                       $scope.productCategories = result.data;
                       var dpsLoaded = dataUtilFactory.createEnumsAndEnumObjs($scope.productCategories, $scope.productCategoriesEnum, $scope.productCategoriesEnumObjects, 'Id', 'Description');
                       $scope.productCategoriesEnum = dpsLoaded.retEnum;
                       $scope.productCategoriesEnumObjects = dpsLoaded.retEnumObj;
                   }, function (reason) {
                       tosterFactory.showCustomToast('Loading ProductCategories failed', 'fail');
                       console.log('Fail Load'); console.log(reason);
                   }, function (error) {
                       tosterFactory.showCustomToast('Loading ProductCategories error', 'error');
                       console.log('Error Load'); console.log(error);
                   })
                   ); break;
               case 'PmsDepartments':
                   $scope.pmsloadedwithlengthzero = false;
                   if ($scope.selectedHotel.HotelId === undefined || $scope.selectedHotel.HotelId === null) {
                       alert('Selected HotelId:' + $scope.selectedHotel.HotelId + ' please check hotelInfo register from Store Info');
                       console.log($scope.selectedHotel);
                       $scope.pmsLookUpResults = [];
                       return;
                   } else {
                       switch ($scope.selectedHotel.Type) {
                           case 0:
                               if ($scope.selectedHotel.HotelUri === undefined || $scope.selectedHotel.HotelUri === null) {
                                   alert("Selected Hotel's HotelUri incorect. Please check hotelInfo register from Store Info");
                                   console.log($scope.selectedHotel); $scope.pmsLookUpResults = []; return;
                               }
                               break;
                           case 4:
                               if ($scope.selectedHotel.DBUserName === undefined || $scope.selectedHotel.DBUserName === null ||
                                   $scope.selectedHotel.DBPassword === undefined || $scope.selectedHotel.DBPassword === null ||
                                   $scope.selectedHotel.ServerName === undefined || $scope.selectedHotel.ServerName === null) {

                                   alert("Selected Hotel's  ServerName or DBUserName or DBPassword incorect. Please check hotelInfo register from Store Info");
                                   console.log($scope.selectedHotel); $scope.pmsLookUpResults = []; return;
                               }
                               break;
                           default:
                               alert("Selected Hotel's  ServerName or DBUserName or DBPassword incorect. Please check hotelInfo register from Store Info");
                               console.log($scope.selectedHotel); $scope.pmsLookUpResults = []; return;
                               break;
                       }
                       return (
                           DynamicApiService.getDynamicObjectData('LookUp', 'hotelid=' + $scope.selectedHotel.HotelId + '&pmsDepartments=' + true).then(function (result) { //Rest Get call for data using Api service to call Webapi
                               //array used to display pms on grid and dropdownfilters
                               if (result.data === null) {
                                   $scope.pmsLookUpResults = [];
                               } else { $scope.pmsLookUpResults = result.data; }

                               if ($scope.pmsLookUpResults.length == 0) $scope.pmsloadedwithlengthzero = true;
                               //column defs for drow down on cell edit 
                               var dpsLoaded = dataUtilFactory.createEnumsAndEnumObjs($scope.pmsLookUpResults, $scope.pmsLookUpEnum, $scope.pmsLookUpEnumObjects, 'DepartmentId', 'Description');
                               $scope.pmsLookUpEnum = dpsLoaded.retEnum;
                               $scope.pmsLookUpEnumObjects = dpsLoaded.retEnumObj;
                               tosterFactory.showCustomToast('PmsDepartments loaded successfully', 'success');
                           }, function (reason) {
                               tosterFactory.showCustomToast('Loading PmsDepartments LookUp failed', 'fail');
                               console.log('Fail Load'); console.log(reason);
                           }, function (error) {
                               tosterFactory.showCustomToast('Loading PmsDepartments LookUp error', 'error');
                               console.log('Error Load'); console.log(error);
                           })
                           );
                   }
                   break;
               case 'Vat':
                   return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                       $scope.vats = result.data;
                       var dpsLoaded = dataUtilFactory.createEnumsAndEnumObjs($scope.vats, $scope.vatEnum, $scope.vatEnumObjects, 'Id', 'Description');
                       $scope.vatEnum = dpsLoaded.retEnum;
                       $scope.vatEnumObjects = dpsLoaded.retEnumObj;
                   }, function (reason) {
                       tosterFactory.showCustomToast('Loading Vats failed', 'fail');
                       console.log('Fail Load'); console.log(reason);
                   }, function (error) {
                       tosterFactory.showCustomToast('Loading Vats error', 'error');
                       console.log('Error Load'); console.log(error);
                   })
                   ); break;
               case 'HotelInfo': return (DynamicApiService.getAttributeRoutingData('HotelInfo', 'HotelInfoEntities' ,'','').then(function (result) {
                   var loaded = result.data
                   $scope.hotelInfo = loaded.map(function (item) {
                       var ret = {
                           Id: item.Id,
                           Description: item.HotelName,
                           HotelUri: item.HotelUri,
                           DBUserName: item.DBUserName,
                           DBPassword: item.DBPassword,
                           ServerName: item.ServerName,
                           HotelId: item.HotelId,
                           Type: item.Type
                       }; return ret;
                   })
                   console.log($scope.hotelInfo);
               }, function (reason) {
                   tosterFactory.showCustomToast('Loading Hotel Info failed', 'fail');
                   console.log('Fail Load'); console.log(reason);
               }, function (error) {
                   tosterFactory.showCustomToast('Loading Hotel Info error', 'error');
                   console.log('Error Load'); console.log(error);
               })
                   ); break;
               default: break;
           }
       }

       //var selected = document.getElementById('sel').value;
       $scope.hotelChanged = function (item) {
           if ($scope.dirtyView == true) {
               var confirm = $mdDialog.confirm()
                  .title('Selected Hotel Changed').textContent('You have unsaved changes on' + $scope.selectedHotel.Description + '. Change will discard any changes.')
                  .ariaLabel('hotelchangemodal').ok('Discard').cancel('Cancel');
               $mdDialog.show(confirm).then(function () {
                   confirmActionFun();
               }, function () { $scope.hotelOnSelect = $scope.selectedHotel; });
           } else {
               confirmActionFun();
           }
           function confirmActionFun() {
               $scope.dirtyView = false;
               $scope.selectedHotel = $scope.hotelOnSelect;
               $scope.selectedDeparment = null; $scope.depOnSelect = null;

               if ($scope.selectedHotel.Type == 0 || $scope.selectedHotel.Type == 4) {
                   document.getElementById("departmentSelection").disabled = false;
               } else {
                   document.getElementById("departmentSelection").disabled = true;
               }

               $scope.loadedPmsSuccess = false;
               $scope.selectedContainerObject = null; $scope.selectedPmsObject = null;  //selected ContOBJ,PMS to null  
               $scope.transferMappingResults = []; $scope.containerObjects = [];
               var lookUpPmsPromise = $scope.getDropDownLookUps('PmsDepartments');
               $q.all([lookUpPmsPromise]).then(function () {
                   $scope.initSelectionLists(false, true, false);
               });
           }
       }

       //Function Triggered when <select> Department dropDown changed
       //STEP MUST BE SELECTED
       $scope.departmentChanged = function (pre) {
           if ($scope.dirtyView == true) {
               var confirm = $mdDialog.confirm()
                  .title('Selected Department Changed').textContent('You have unsaved changes on' + $scope.selectedDeparment.Description + '. Change will discard any changes.')
                  .ariaLabel('hotelchangemodal').ok('Discard').cancel('Cancel');
               $mdDialog.show(confirm).then(function () {
                   confirmActionFun();
               }, function () { $scope.depOnSelect = $scope.selectedDeparment; });
           } else {
               confirmActionFun();
           }

           function confirmActionFun() {
               $scope.dirtyView = false;
               $scope.selectedDeparment = $scope.depOnSelect;
               //set current Department
               $scope.selectedContainerObject = null; $scope.selectedPmsObject = null;  //selected ContOBJ,PMS to null  
               //InitSelection Lists
               $scope.transferMappingResults = [];
               //Get lookUps for selected Department
               $scope.getTransferMappingsByDepartment();
           }
       }
       $scope.getTransferMappingsByDepartment = function () {
           var params = 'posDepartmentId=' + $scope.selectedDeparment.Id;
           var transferMappingPromise = DynamicApiService.getDynamicObjectData('TransferMappings', params).then(function (result) { //Rest Get call for data using Api service to call Webapi
               var hotelFilteres = result.data.filter(function (item) {
                   return (item.HotelId == $scope.selectedHotel.HotelId);
               })
               $scope.transferMappingResults = hotelFilteres;
               $scope.containerObjects = []; //empty cont objs
               $scope.allPricelistsUsed = []; // plsued to  []
               $scope.transferObjectHandleArray = [];//empty Cat->Id array <-- all transferMAppings
               $scope.maxGId = 0;

               var tgroups = dataUtilFactory.groupTo($scope.transferMappingResults, $scope.tmGroupField); //group results by mastergroup Entity
               angular.forEach(tgroups, function (value, key) {  //[ objs of rows ] //masterPrimary Panel Entities f.e. Value
                   var tmpObj = { gId: "", currentPls: [], currentPms: [], currentCats: {}, catRefs: {} }
                   tmpObj.gId = parseInt(key); //Key of Grouping
                   if (tmpObj.gId >= $scope.maxGId) $scope.maxGId = tmpObj.gId + 1;

                   angular.forEach(value, function (vv) { //loop to create pls
                       //objects on handle array <--- entities to be deleted where Status == 2   [remember status 3 == unhandle]
                       var handleObj = {
                           Id: vv.Id,
                           ProductCategoryId: vv.ProductCategoryId,
                           PriceListId: vv.PriceListId,
                           PosDepartmentId: vv.PosDepartmentId,
                           PmsDepartmentId: vv.PmsDepartmentId,
                           PmsDepDescription: $scope.pmsLookUpEnum[vv.PmsDepartmentId],
                           Status: 3 // new, 1 Inserted, 2 Deleted, 3 unmodified
                       }
                       handleObj[$scope.tmGroupField] = tmpObj.gId; //master group Field

                       $scope.transferObjectHandleArray.push(handleObj);

                       var index = tmpObj.currentPls.indexOf(vv.PriceListId);
                       if (index == -1) {
                           tmpObj.currentPls.push(vv.PriceListId); //insert to ContObj unique reg of pricelist
                           //enum{ProductCatId : [idrefs] }
                           (tmpObj.catRefs[vv.ProductCategoryId] == undefined || tmpObj.catRefs[vv.ProductCategoryId].length == 0) ? tmpObj.catRefs[vv.ProductCategoryId] = [vv.Id] : tmpObj.catRefs[vv.ProductCategoryId].push(vv.Id);
                           //pricelistused
                           $scope.allPricelistsUsed.push(vv.PriceListId);
                       }
                       else {
                           //enum{ProductCatId : [idrefs] }
                           (tmpObj.catRefs[vv.ProductCategoryId] == undefined || tmpObj.catRefs[vv.ProductCategoryId].length == 0) ? tmpObj.catRefs[vv.ProductCategoryId] = [vv.Id] : tmpObj.catRefs[vv.ProductCategoryId].push(vv.Id);
                       }
                   })
                   var tPmsgroups = dataUtilFactory.groupTo(value, 'PmsDepartmentId');
                   var PmsArray = []; //array of Pms Ids
                   var CatEnum = {};
                   angular.forEach(tPmsgroups, function (value, key) { //key=PmsDepartmentId
                       var tkey = parseInt(key); var tCatArray = [];
                       PmsArray.push(tkey);
                       angular.forEach(value, function (vv) { //key=PmsDepartmentId
                           var index = tCatArray.indexOf(vv.ProductCategoryId);
                           if (index == -1) {
                               tCatArray.push(vv.ProductCategoryId);
                               CatEnum[parseInt(tkey)] = tCatArray;
                           }
                       })
                   })
                   tmpObj.currentPms = PmsArray; tmpObj.currentCats = CatEnum;
                   $scope.containerObjects.push(tmpObj);
               });
               var pause;
           }, function (reason) {
               tosterFactory.showCustomToast('Loading Transfer Mappings for ' + $scope.selectedDeparment.Description + ' failed', 'fail');
               console.log('Fail Load'); console.log(reason);
           }, function (error) {
               tosterFactory.showCustomToast('Loading Transfer Mappings for ' + $scope.selectedDeparment.Description + ' failed error', 'error');
               console.log('Error Load'); console.log(error);
           });
       }
       //click row of component
       //select row com
       //reinit SelectedPms and Categories for filters


       $scope.clickSelectContainerObject = function (comp) {
           ($scope.selectedContainerObject == comp) ? $scope.selectedContainerObject = null : $scope.selectedContainerObject = comp; //toggle or select
           $scope.selectedPmsObject = null; //empty selected Pms
           $scope.allCatsInSelectedGroup = []; //empty Category  filter
           $scope.allPmsInSelectedGroup = [];  //empty Pms filter
           //manage Array filters 
           if ($scope.selectedContainerObject != null || $scope.selectedContainerObject != undefined) { //if line selected filter cats , pmss
               $scope.allPmsInSelectedGroup = angular.copy($scope.selectedContainerObject.currentPms);
               var tempCats = $scope.selectedContainerObject.currentCats; //in current Selection
               for (var key in tempCats) { //Categories used on Tempcat
                   var tmc = angular.copy(tempCats[key]); //tmc : Array [catId , catId2, catId3, .. ]
                   ($scope.allCatsInSelectedGroup.length == 0) ? $scope.allCatsInSelectedGroup = tmc : $scope.allCatsInSelectedGroup = $scope.allCatsInSelectedGroup.concat(tmc);
               }
           }
       }
       //click on Pms
       $scope.clickSelectPmsObject = function (cpms, cObj) {
           //toggle only selection
           if ($scope.selectedContainerObject == cObj) { ($scope.selectedPmsObject == cpms) ? $scope.selectedPmsObject = null : $scope.selectedPmsObject = cpms; }
               //manage new Container Selection
           else { $scope.clickSelectContainerObject(cObj); $scope.selectedPmsObject = cpms; }
       }
       //$scope.allPricelistsUsed        $scope.allPmsInSelectedGroup         $scope.allCatsInSelectedGroup        
       //$scope.tmpPricelists;           $scope.tmpPmsLookUpResults;          $scope.tmpProductCategories;

       //arrow add panel pricelists
       $scope.insertNewPriceLists = function () {
           $scope.dirtyView = true;
           //pricelists
           var fPricelists = $filter('selectedFiltered')($scope.tmpPricelists, $scope.allPricelistsUsed, 'Id'); //filter Selected Category 
           $scope.tmpPricelists = $scope.tmpPricelists.filter(function (item) { item.selected = false; return item; })
           //var index = $scope.tmpPmsLookUpResults.indexOf(value);  $scope.tmpPmsLookUpResults.selected = false;
           var selectedPlsIds = [];
           angular.forEach(fPricelists, function (value, key) {
               selectedPlsIds.push(value.Id);
               $scope.allPricelistsUsed.push(value.Id);
           });

           var contentObj = { gId: $scope.maxGId, currentPls: selectedPlsIds, currentPms: [], currentCats: {}, catRefs: {} };
           $scope.containerObjects.push(contentObj); //new Obj to display 

           $scope.maxGId += 1; //new master Group Entry 
           $scope.clickSelectContainerObject(contentObj);
       };
       //array add panel Pms 
       $scope.insertNewPmsDeps = function () {
           //pmsLookUpResults
           if ($scope.selectedContainerObject == null) {
               tosterFactory.showCustomToast('No PriceList group Selected. Please select a PriceList Group then add your Pms', 'info');
           } else {
               $scope.dirtyView = true;
               var fPmsLookUps = $filter('selectedFiltered')($scope.tmpPmsLookUpResults, $scope.allPmsInSelectedGroup, 'DepartmentId'); //filter Selected Pms and not included in filter 
               $scope.tmpPmsLookUpResults = $scope.tmpPmsLookUpResults.filter(function (item) { item.selected = false; return item; })
               angular.forEach(fPmsLookUps, function (value, key) {
                   $scope.selectedContainerObject.currentPms.push(value.DepartmentId); //push Pms Ids to Obj.currentPms
                   var tmpObj = {}; tmpObj[parseInt(value.DepartmentId)] = []; //create obj.currentCats { pmsId: [cat ids array] }
                   angular.extend($scope.selectedContainerObject.currentCats, tmpObj); //Extend Obj.currentCats with enum { PmsId: []  }
                   $scope.allPmsInSelectedGroup.push(value.DepartmentId); //manage filter
               });
           }
       };
       $scope.insertNewProdCats = function () {  //productCategories
           if ($scope.selectedPmsObject == null || $scope.selectedContainerObject.currentPms.indexOf($scope.selectedPmsObject) == -1) {
               tosterFactory.showCustomToast('Please select a pms from selected Pricelist Group', 'info');
           } else {
               $scope.dirtyView = true;
               var fProductCategories = $filter('selectedFiltered')($scope.tmpProductCategories, $scope.allCatsInSelectedGroup, 'Id'); //filter Selected Category 
               $scope.tmpProductCategories = $scope.tmpProductCategories.filter(function (item) { item.selected = false; return item; })

               //var index = $scope.tmpProductCategories.indexOf(value);                   $scope.tmpProductCategories.selected = false;
               angular.forEach(fProductCategories, function (value, key) { //for selected categories
                   //create currentCats :   PmsId : [ cat ids]
                   if ($scope.selectedContainerObject.currentCats[$scope.selectedPmsObject] != undefined) {
                       var tmp = angular.copy($scope.selectedContainerObject.currentCats[$scope.selectedPmsObject]);
                       tmp.push(value.Id)
                       $scope.selectedContainerObject.currentCats[$scope.selectedPmsObject] = angular.copy(tmp);
                   } else {
                       var tmp = [value.Id];
                       $scope.selectedContainerObject.currentCats[$scope.selectedPmsObject] = angular.copy(tmp);
                   }
                   $scope.manageReact(value.Id, $scope.selectedPmsObject, $scope.selectedContainerObject, 'insert');
                   //angular.forEach($scope.selectedContainerObject.currentPls, function (cpl) {//for each cat to be inserted //loop selected Object Pricelists // under currentPMS
                   //    //for each category inserted we need rejisters equal to number of pricelists in currentObj
                   //    var handleObj = { //create handle Obj 
                   //        gId: $scope.selectedContainerObject.gId,
                   //        ProductCategoryId: value.Id,
                   //        PriceListId: cpl,
                   //        PosDepartmentId: $scope.selectedDeparment.Id,
                   //        PmsDepartmentId: $scope.selectedPmsObject,
                   //    }

                   //})
                   //$scope.allCatsInSelectedGroup.push(value.Id);
               });
               $scope.allCatsInSelectedGroup = [];
               var tempCats = $scope.selectedContainerObject.currentCats; //in current Selection
               for (var key in tempCats) { //Categories used on Tempcat
                   var tmc = angular.copy(tempCats[key]); //tmc : Array [catId , catId2, catId3, .. ]
                   ($scope.allCatsInSelectedGroup.length == 0) ? $scope.allCatsInSelectedGroup = tmc : $scope.allCatsInSelectedGroup = $scope.allCatsInSelectedGroup.concat(tmc);
               }
           }
       };

       $scope.indexToUpdateMainOBJ = -1; //used to modify container Obj action Clicked

       $scope.updateGroupPricelist = function (obj) {
           //var contentObj = { gId: $scope.maxGId, currentPls: selectedPlsIds, currentPms: [], currentCats: {}, catRefs: {} };
           $scope.indexToUpdateMainOBJ = $scope.containerObjects.indexOf(obj); $scope.selectedPmsObject = null;
           var availablePls = angular.copy($scope.tmpPricelists);
           for (var i = 0; i < $scope.containerObjects.length; i++) {
               if (i == $scope.indexToUpdateMainOBJ) continue;
               availablePls = availablePls.filter(function (item) {
                   var ind = $scope.containerObjects[i].currentPls.indexOf(item.Id);
                   if (ind == -1) return item; else return null;
               })

           }
           var originalObj = angular.copy(obj);
           var modalInstance = $uibModal.open({
               backdrop: "static", width: '1500px', animation: true,
               templateUrl: '../app/scripts/directives/modal-directives/manageTransferMappingsPriceLists.html', controller: 'ManageTMPricelistsModalCtrl', controllerAs: 'tmm',
               windowClass: 'app-manage-pls-modal-window',
               resolve: {
                   tmpPricelists: function () { return availablePls; },
                   containerObject: function () { return obj; },
                   pricelistEnumOptions: function () { return $scope.pricelistEnumOptions; },
                   //mainModel: function () { return $scope.containerObjects; }
               }
           });

           modalInstance.result.then(function (data) { //{ incPls: incPls, arrIns: toInsert, arrDel: toDel }
               $scope.dirtyView = true;
               var fakeObj = angular.copy(originalObj);
               if (data.arrDel.length > 0) { //delete fake obj to manage Handle array  
                   fakeObj.currentPls = data.arrDel;
                   $scope.groupDeleteAction(fakeObj);
               }
               if (data.arrIns.length > 0) { //insert new regs to handle Array 
                   fakeObj.currentPls = data.arrIns;
                   angular.forEach(fakeObj.currentPms, function (cpms) { //loop pricelists
                       angular.forEach(fakeObj.currentCats[cpms], function (cCat) { //loop pms
                           $scope.manageReact(cCat, cpms, fakeObj, 'insert');
                       });
                   });
               }
               if (data.incPls.length > 0) { //manage container
                   fakeObj.currentPls = data.incPls;
                   if ($scope.indexToUpdateMainOBJ != -1) {
                       $scope.containerObjects[$scope.indexToUpdateMainOBJ].currentPls = data.incPls;
                   } else { alert("Obj not found in container after Modal save "); }
               }
               //manage pl filters from returned vars 
               angular.forEach(data.arrDel, function (li) { var ind = $scope.allPricelistsUsed.indexOf(li); (ind != -1) ? $scope.allPricelistsUsed.splice(ind, 1) : console.log('To del plFilt not found'); })
               angular.forEach(data.arrIns, function (li) { var ind = $scope.allPricelistsUsed.indexOf(li); (ind == -1) ? $scope.allPricelistsUsed.push(li) : console.log('To ins plFilt found'); })
               $scope.indexToUpdateMainOBJ = -1;
           }, function (reason) {
               $scope.indexToUpdateMainOBJ = -1;//modal exited with close function
           });
       }


       //DELETE Action Functions
       //Delete Category Entry //manageSave arrays for results 
       //delete Containing Categories from filters
       $scope.categoryDeleteAction = function (cat, pms, obj) {
           $scope.dirtyView = true;
           $scope.selectedContainerObject = obj; $scope.selectedPmsObject = pms;
           $scope.manageReact(cat, pms, obj, 'delete');
           var ind = obj.currentCats[pms].indexOf(cat); obj.currentCats[pms].splice(ind, 1); //delete category 
           var index = $scope.allCatsInSelectedGroup.indexOf(cat);
           if (index > -1) {
                $scope.allCatsInSelectedGroup.splice(index, 1); //manage filter
           }
       }
       //Delete Pms and Categories Entry  //manageSave arrays for results
       //delete Containing Pms & Categories from filters
       $scope.pmsDeleteAction = function (pms, obj) {
           $scope.dirtyView = true;
           $scope.selectedContainerObject = obj; $scope.selectedPmsObject = pms;
           angular.forEach(obj.currentCats[pms], function (cCat) { //loop pricelists
               $scope.manageReact(cCat, pms, obj, 'delete');
               var index = $scope.allCatsInSelectedGroup.indexOf(cCat);
               if (index > -1) {
                   $scope.allCatsInSelectedGroup.splice(index, 1);// manage categories filters
               }
           })
           delete obj.currentCats[pms]; //delete Pms:withCats
           var ind = obj.currentPms.indexOf(pms); obj.currentPms.splice(ind, 1); //delete Pms from obj.pms
           var index = $scope.allPmsInSelectedGroup.indexOf(pms); $scope.allPmsInSelectedGroup.splice(index, 1); // manage pms filters

       }
       //Delete Price List Group //manageSave arrays for results
       //delete Containing Pricelists Pms and Categories from filters
       $scope.groupDeleteAction = function (obj) {
           $scope.dirtyView = true;
           angular.forEach(obj.currentPms, function (cpms) { //loop pricelists
               angular.forEach(obj.currentCats[cpms], function (cCat) { //loop pms
                   $scope.manageReact(cCat, cpms, obj, 'delete');
                   var index = $scope.allCatsInSelectedGroup.indexOf(cCat);
                   if (index > -1) {
                       $scope.allCatsInSelectedGroup.splice(index, 1);  // manage categories filters
                   }
               })
               var index = $scope.allPmsInSelectedGroup.indexOf(cpms); $scope.allPmsInSelectedGroup.splice(index, 1);  // manage pms filters
           })
           angular.forEach(obj.currentPls, function (cpl) {
               var index = $scope.allPricelistsUsed.indexOf(cpl); $scope.allPricelistsUsed.splice(index, 1); // manage pricelist filters
           });
           var index = $scope.containerObjects.indexOf(obj); if (index == -1) { console.log("gDelA not found on container"); console.log(obj); } else { $scope.containerObjects.splice(index, 1); } //Delete current Obj from Container
       }


       //on Action insert or delete manage react
       //input car /pms /obj / action
       $scope.manageReact = function (cCat, cpms, obj, action) {
           //action insert , delete
           angular.forEach(obj.currentPls, function (cplid) {
               var newObj = {
                   PosDepartmentId: $scope.selectedDeparment.Id,
                   gId: obj.gId,
                   PriceListId: cplid,
                   PmsDepartmentId: cpms,
                   ProductCategoryId: cCat,
                   actionType: action
               }
               newObj[$scope.tmGroupField] = newObj.gId;
               $scope.printReact(newObj, "mR:Before CHECK Action");
               var ret = $scope.checkReact(newObj);
               switch (ret.action) {
                   case 'noAct': console.log('error no Act current MReact with d2d or i2i'); console.log(newObj); break;
                   case 'i2d': $scope.reactionArrayObj[ret.index].actionType = 'delete'; console.log('Act: i2d '); console.log(newObj); break;
                   case 'd2i': $scope.reactionArrayObj[ret.index].actionType = 'insert'; console.log('Act: d2i '); console.log(newObj); break;
                   case 'notFound': $scope.reactionArrayObj.push(newObj); console.log('Act: not found pushed '); console.log(newObj); break;
                   default: break;
               }
           })
       };
       //takes an Obj search reaction Array return action type and Index found
       $scope.checkReact = function (Obj) {
           var cObj = Obj, ret = { action: 'notFound', index: -1 }, exit = false;
           for (var i = 0; i < $scope.reactionArrayObj.length; i++) {
               var item = $scope.reactionArrayObj[i], key = i;
               //exactly the same 
               if (item.gId == cObj.gId && item.ProductCategoryId == cObj.ProductCategoryId && item.PriceListId == cObj.PriceListId && item.PosDepartmentId == cObj.PosDepartmentId && item.PmsDepartmentId == cObj.PmsDepartmentId) {
                   //insert - insert  //delete - delete
                   if (item.actionType == cObj.actionType) { ret = { action: 'noAct', index: -1 }; break; }
                   //insert - delete
                   if (item.actionType == 'insert' && cObj.actionType == 'delete') { ret = { action: 'i2d', index: key }; break; }
                   //delete - insert
                   if (item.actionType == 'delete' && cObj.actionType == 'insert') { ret = { action: 'd2i', index: key }; break; }
               }
           }
           return ret;
       }

       //function used by Delete to manage arrays used 4 save and Delete RestCalls
       $scope.checkTransferMappings = function () {
           angular.forEach($scope.reactionArrayObj, function (ritem) {
               var found = false;
               for (var i = 0; i < $scope.transferObjectHandleArray.length; i++) {
                   var mitem = $scope.transferObjectHandleArray[i]; //PmsDepartmentId: "1" parseInt it
                   if (ritem.ProductCategoryId == mitem.ProductCategoryId
                        && ritem.PmsDepartmentId == parseInt(mitem.PmsDepartmentId)
                            && ritem.PriceListId == mitem.PriceListId
                                    && ritem.PosDepartmentId == mitem.PosDepartmentId
                                        && ritem.gId == mitem[$scope.tmGroupField]) {
                       //founded in [i]
                       if (ritem.actionType == 'delete') { $scope.transferObjectHandleArray[i].Status = 2; }
                       found = true; break;
                   }
               }
               if (found == false) {
                   ritem.PmsDepDescription = $scope.pmsLookUpEnum[ritem.PmsDepartmentId];
                   $scope.transferObjectInsertArray.push(ritem);
               }
           })
           $scope.printReactionArray()
           //Id: 72609            //PmsDepDescription: "Room Charge 6 %"           //PmsDepartmentId: "1"           //PosDepartmentId: 1           //PriceListId: 1           //ProductCategoryId: 54           //Status: 3           //VatCode: 0
           //ritem.PmsDepartmentId           //ritem.PosDepartmentId           //ritem.PriceListId           //ritem.ProductCategoryId           //ritem.actionType           //ritem.gId
       }

       $scope.saveTransferMappings = function () {
           $scope.savingProcess = true;
           $scope.transferObjectInsertArray = [];
           $scope.checkTransferMappings();
           var saveModelsArray = []; var arrayToDel = [];
           angular.forEach($scope.transferObjectHandleArray, function (item) { if (item.Status == 2) arrayToDel.push(item.Id); })
           //help to display deleted //$scope.displayToSaveArrays($scope.transferObjectHandleArray, 'Handle');           //$scope.displayToSaveArrays($scope.transferObjectInsertArray, 'Insert');
           //arrayToDel = $filter('filter')($scope.transferObjectHandleArray, function (item) { if (item.Status == 2) return item; });

           console.log($scope.transferObjectInsertArray);
           console.log(arrayToDel);
           saveModelsArray = $filter('filter')($scope.transferObjectInsertArray, function (item) { if (item.actionType != 'delete') return item; })
           var postPromise, deletePromise;
           if (saveModelsArray.length > 0) {
               saveModelsArray = saveModelsArray.filter(function (item) {
                   item.HotelId = $scope.selectedHotel.HotelId;
                   return item;
               })
               console.log(saveModelsArray);
               postPromise = DynamicApiService.postMultiple('TransferMappings', saveModelsArray).then(function (result) {
                   tosterFactory.showCustomToast('All entries of TransferMappings saved successfully.', 'success');
               }, function (reason) {
                   tosterFactory.showCustomToast('Creating Transfer Mappings failed', 'fail');
                   console.log('Fail Create'); console.log(reason);
               }, function (error) {
                   tosterFactory.showCustomToast('Creating Transfer Mappings error', 'error');
                   console.log('Error Create'); console.log(error);
               })
           } else { postPromise = $q.resolve(); }

           if (arrayToDel.length > 0) {
               deletePromise = DynamicApiService.deleteMultiple('TransferMappings', arrayToDel).then(function (result) {
                   tosterFactory.showCustomToast('All entries of TransferMappings deleted successfully.', 'success');
               }, function (reason) {
                   tosterFactory.showCustomToast('Deleting Transfer Mappings failed', 'fail');
                   console.log('Fail Delete'); console.log(reason);
               }, function (error) {
                   tosterFactory.showCustomToast('Deleting Transfer Mappings error', 'error');
                   console.log('Error Delete'); console.log(error);
               })
           } else { deletePromise = $q.resolve(); }
           $q.all([postPromise, deletePromise]).then(function () {
               $scope.savingProcess = false;
               $scope.dirtyView = false;
               $scope.departmentChanged($scope.selectedDeparment);
           });
       }
       $scope.validateModel = function () {
           angular.forEach($scope.containerObjects, function (item) {
               var tmpObj = { validGID: false, validPls: false, validPms: false, invalidPms: {} };
               (item.gId === null || item.gId === undefined || item.gId == NaN) ? tmpObj.validGID = false : tmpObj.validGID = true;
               (item.currentPls == undefined || item.currentPls == undefined || item.currentPls.length <= 0) ? tmpObj.validPls = false : tmpObj.validPls = true;
               (item.currentPms == undefined || item.currentPms == undefined || item.currentPms.length <= 0) ? tmpObj.validPms = false : tmpObj.validPms = true;
               if (tmpObj.validPms == true) {
                   angular.forEach(item.currentPms, function (value) {
                       if (item.currentCats[value] === undefined || item.currentCats[value].length == 0) {
                           tmpObj.validPms = false;
                           tmpObj.invalidPms[value] = false;
                       }
                   })
               }
               item.validModelObj = tmpObj
               (tmpObj.validGID == true && tmpObj.validPls == true && tmpObj.validPms == true) ? (item.validModel = true) : (item.validModel = true);
           })
       }

       //function to filter display of drop down Pricelists 
       $scope.filterPLS = function (pls) {
           if ($scope.containerObjects.length == 0) return true;
           var index = $scope.allPricelistsUsed.indexOf(pls.Id); return (index == -1) ? true : false;
       }
       //function to filter display of drop down Pms 
       $scope.filterPMS = function (pms) {
           if ($scope.containerObjects.length == 0 || $scope.selectedContainerObject == undefined || $scope.selectedContainerObject == null) return true;
           var index = $scope.allPmsInSelectedGroup.indexOf(parseInt(pms.DepartmentId)); return (index == -1) ? true : false;
       }
       //function to filter display of drop down categories 
       $scope.filterCATS = function (cat) {
           if ($scope.containerObjects.length == 0 || $scope.selectedContainerObject == undefined || $scope.selectedContainerObject == null) return true;
           var index = $scope.allCatsInSelectedGroup.indexOf(parseInt(cat.Id)); return (index == -1) ? true : false;
       }
       //tooltip on panel to displai all pricelists in badges 
       $scope.masterPanelTooltip = function (obj) {
           var retStr = "";
           angular.forEach(obj.currentPls, function (item) { (retStr.length != 0) ? retStr += "\n " + $scope.pricelistEnumOptions[item] : retStr += $scope.pricelistEnumOptions[item]; });
           return retStr;
       }
       //helper function to log Array of Changes and  insert Array
       $scope.displayToSaveArrays = function (array, exp) {
           console.log('Displaying ' + exp + ' :');
           angular.forEach(array, function (vv) {
               if (exp == 'Filtered') { console.log('ON ID: ' + vv.Id); }
               console.log("G:" + vv[$scope.tmGroupField] + " S:" + vv.Status + " |Prl: " + $scope.pricelistEnumOptions[vv.PriceListId] + " |Pms: " + $scope.pmsLookUpEnum[vv.PmsDepartmentId] + " |PCat: " + $scope.productCategoriesEnum[vv.ProductCategoryId] + " |Dep: " + $scope.deparmentEnumOptions[vv.PosDepartmentId]);
           });
       }
       $scope.displaylogs = function () {
           console.log("selectedContainerObject:"); console.log($scope.selectedContainerObject);
           console.log("insert array"); console.log($scope.transferObjectInsertArray);
       }
       $scope.printReact = function (obj, funN) {
           if (funN.length > 0) console.log(funN);
           console.log("D:" + $scope.deparmentEnumOptions[obj.PosDepartmentId]
               + " " + obj.gId
               + " PL:" + $scope.pricelistEnumOptions[obj.PriceListId]
               + " PMS:" + $scope.pmsLookUpEnum[obj.PmsDepartmentId]
               + " PC:" + $scope.productCategoriesEnum[obj.ProductCategoryId]
               + " Act:" + obj.actionType
           );
       };
       $scope.printReactionArray = function () {
           console.log("React Array");
           angular.forEach($scope.reactionArrayObj, function (item) {
               $scope.printReact(item, "");
           })
       }
   }])
    .directive('myCurrentCategory', [function () {
        return {
            restrict: 'A',
            template: '<div class="thumbnail" style="cursor:pointer;">' +
                '<span ng-click="$parent.transferCategoryClick(component)">{{component.Description}}</span>' +
                '<i ng-click="$parent.transferCategoryDelete(component)" style="float:right;" class="fa fa-sm fa-times" ng-class="{deliconhover: hover}" ng-mouseenter="hover = true" ng-mouseleave="hover = false"></i></div>',
            transclude: true,
            scope: { component: '=' },
            link: function ($scope, $element, attrs) { }
        };
    }])
    .filter('range', function () { return function (input, total) { total = parseInt(total); for (var i = 0; i < total; i++) input.push(i); return input; }; })
    .filter('selectedFiltered', function () {
        return function (arrayToFilt_, arrayToExclude_, field) {
            var arrayToExclude = angular.copy(arrayToExclude_);
            var arrayToFilt = angular.copy(arrayToFilt_);
            var retArr = [];
            angular.forEach(arrayToFilt, function (value) {
                var index; (angular.isString(value[field])) ? index = arrayToExclude.indexOf(parseInt(value[field])) : index = arrayToExclude.indexOf(value[field]);
                index = arrayToExclude.indexOf(value[field]);
                if (value.selected == true && index == -1) { retArr.push(value); value.selected = false; }
            })
            return retArr;
        }
    })
    .filter('getById', function () { return function (input, id) { var i = 0, len = input.length; for (; i < len; i++) { if (+input[i].Id == +id) { return input[i]; } } return null; } })
    .filter('filterInsertedEntries', function () {
        return function (array, obj, gfield, gvalue) {
            var ret = [];
            angular.forEach(array, function (value) {
                var index = obj.cpls.indexOf(value.PriceListId);
                if (value.PmsDepartmentId == obj.cpms && value.ProductCategoryId == obj.ccat && value[gfield] == gvalue && index != -1) {

                } else { ret.push(value); }
            })
            return ret;
        }
    })
