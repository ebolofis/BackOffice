'use strict';
/**
 * @ngdoc function
 * @name posBOApp.service:gridInitiallization
 * @description 
 * # Calls  DB Entities to init Grids with Required Params
 */
//angular.module('posBOApp')

angular.module('posBOApp')
       .service('GridInitiallization', ['$http', 'config', 'auth', 'DynamicTypeGrid', 'MSDynamicTypeGrid', 'ProductsTypeGrid','ProductPricesGrid', function ($http, config, auth, DynamicTypeGrid, MSDynamicTypeGrid, ProductsTypeGrid, ProductPricesGrid) {

           var urlBase = config.WebApiURL + '/api/';
           //used to get DynamicGridEntities and Prefs
           this.initGridParams = function (gridType) {
               var authSpecs = auth.getLoggedSpecs();

               var gridParams = DynamicTypeGrid.getGridParams(gridType);
               var gridColumns = DynamicTypeGrid.getColumns(gridType);
               var gridSchema = DynamicTypeGrid.geteditRowSchema(gridType);
               var gridForm = DynamicTypeGrid.geteditRowForm(gridType);
               return {
                   gParams: gridParams,
                   gColumns: gridColumns,
                   gSchema: gridSchema,
                   gForm: gridForm
               }
           }
           this.initMSGridParams = function (gridType) {
               var authSpecs = auth.getLoggedSpecs();
               var gridEditModel = MSDynamicTypeGrid.getMSEditModel(gridType);
               var gridParams = MSDynamicTypeGrid.getMSGridParams(gridType);
               var gridColumns = MSDynamicTypeGrid.getMSColumns(gridType);
               var gridSFModel = MSDynamicTypeGrid.getMSeditRowModel(gridType);

               return {
                   gParams: gridParams,
                   gColumns: gridColumns,
                   gEditModel: gridEditModel,
                   gSFModel: gridSFModel
               }
           }
           this.initProductSFEParams = function (type, tmap) {
               var authSpecs = auth.getLoggedSpecs();
               var overviewSFE = ProductsTypeGrid.getOverviewSFE(type, tmap);
               return { productsOverviewSFE: overviewSFE, }
           }
           this.initProductGridParams = function () {
               var authSpecs = auth.getLoggedSpecs();
               var gridParams = ProductsTypeGrid.getGridParams();

               return { gridParams: gridParams }
           }
           this.initProductPricesGridParams = function () {
               var authSpecs = auth.getLoggedSpecs();
               var gridParams = ProductPricesGrid.getPricesGridParams();
               return { gridParams: gridParams }
           }
           //not used ...
           this.initColumnDependencies = function (columnName) {
               var authSpecs = auth.getLoggedSpecs();
               var enumType = this.getColumnEnumerator(columnName);
               $http.defaults.headers.common['Authorization'] = authSpecs.auth;
               return $http.get(urlBase + 'EntitiesLookUp?entityEnum=' + enumType);
           }
           //this Enum Switcher equals WebAPI_ProjectData/Enumerators/BasicEnums.cs
           //Used to init Object Of columns 
           this.getColumnEnumerator = function (columnName) {
               switch (columnName) {
                   case "SetupProductCategories": return 0; break;
                   case "SetupInvoiceTypes": return 2; break;
                   case "SetupAccounts": return 3; break;
                   case "SetupTransactionTypes": return 4; break;
                   case "SetupDiscount": return 5; break;
                   case "SetupPredefinedCredits": return 6; break;
                   case "SetupKitchenInstruction": return 7; break;
                   case "SetupAccountMapping": return 8; break;
                   case "SetupAuthorizedGroupDetail": return 9; break;
                   case "HeaderDetailsPromos": return 10; break;
                   case "OnlyDetails": return 11; break;
                   case "ChangeProductCategoriesVat": return 12; break;

                   default:
               }

           }
           this.getGridParams = function (entityName) {
               switch (entityName) {
                  
                   case 'InvoiceTypes': case 'Vat': case 'Tax': case 'PricelistGroup': case 'PosInfoDetail_Pricelist_Assoc':
                   case 'Accounts': case 'PosInfoDetail_Excluded_Accounts': case 'AccountMapping': 
                   case 'TransactionTypes': case 'Discount': case 'PredefinedCredits': case 'AuthorizedGroupDetail': case 'StaffPosition': 
                   case 'ClientPos': case 'PdaModule' : case 'Kitchen': case 'KitchenRegion': case 'KitchenInstruction': case 'Kds': case 'SalesType': 
                   case 'Units': case 'ProductCategories': case 'Categories': case 'Items':
                       return (DynamicTypeGrid.getColumns(entityName)); break;
                   case 'PosInfo': case 'PosInfoDetail':
                       return (MSDynamicTypeGrid.getMSColumns(entityName)); break;
                   case 'Products':
                       var ret = ProductsTypeGrid.getGridParams();
                       return (ret.productGrid.columnDefs); break;
                   default: break;
               }
           }
       }])