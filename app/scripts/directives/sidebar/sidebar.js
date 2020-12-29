'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */

angular.module('posBOApp').factory('mofac', mainMenuOpts)
    .directive('sidebar', sidebar)
    .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function () {
            $mdSidenav('left').close()
                .then(function () {
                    //$log.debug("close LEFT is done");
                });
        };
    }).filter('menuStateFilter', function () {
        return function (arr, searchstring) {
            if (searchstring == undefined || searchstring == '')
                return arr;
            console.log('statefilter actions');
            var sstr = angular.lowercase(searchstring), ret = arr.filter(function (state) {
                alert('Implement 3rd lvl search')
                console.log('***** REMEMBER TO IMPLEMENT 3RD LVL FILTER 4 KITCHEN*****')
                var options = state.Options.filter(function (oi) {
                    return (angular.lowercase(oi.Name).indexOf(sstr) >= 0)
                })
                if (angular.lowercase(state.OptionName).indexOf(sstr) >= 0 || options.length > 0) {
                    state.Options = options;
                    return state;
                }
            })
            return ret;
        };
    })

function sidebar() {
    return {
        templateUrl: 'app/scripts/directives/sidebar/sidebar.html',
        restrict: 'E',
        replace: true,
        controller: function ($scope, $rootScope, $timeout, $mdSidenav, $log, $state, config, mofac) {
            $scope.menuOptions = [];
            $scope.init = function () {
                //Load from File apply
                //var loadModelPromise = $http.get('json-files/entity-models/main-menu-options.json').then(function (result) {
                //var arr = result.data;
                var arr = mofac.options;
                $scope.menuOptions = arr.filter(function (mi) {
                    return (mi.visible == undefined || (mi.visible == "dev" && config.workPolicy == 'dev'))
                });
                //console.log('Menu options loaded');console.log($scope.menuOptions);
                //}, function (error) { });
            }();

            $scope.navigate = function (ref) {
                if (ref != undefined) {
                    $mdSidenav('left').toggle().then(function () { $state.go(ref); });
                } else {
                    $mdSidenav('left').toggle().then(function () { });
                }
            }
            $scope.projectVersion = config.Version + '.' + config.Features;
            $scope.fullVersion = config.Version + '.' + config.Features + '.' + config.Minor + '.' + config.External;
            $scope.selectedMenu = 'dashboard.home'; $scope.collapseVar = 0; $scope.multiCollapseVar = 0;
            $scope.sideCollapse = $rootScope.sideCollapse;

            $scope.check = function (x) {
                if (x == $scope.collapseVar) $scope.collapseVar = 0;
                else $scope.collapseVar = x;
            };

            $scope.multiCheck = function (y) {
                if (y == $scope.multiCollapseVar) $scope.multiCollapseVar = 0;
                else $scope.multiCollapseVar = y;
            };
        }
    }
}

function mainMenuOpts() {
    var IsDA = localStorage.getItem("isDa");
    var IsDaClient = localStorage.getItem("isDaClient");
    if (IsDA == "true" && IsDaClient == "false") {
        this.options = [
            { "OptionName": "Store Info", "Icon": "fa fa-home fa-fw", "CollapseValue": "home", "StateRef": "dashboard.home", "Options": [] },
            {
                "OptionName": "Products", "Icon": "fa fa-file-powerpoint-o fa-fw",
                "CollapseValue": "products", "StateRef": null,
                "Options": [
                    { "Name": "Categories", "StateRef": "dashboard.SetupCategories" },
                    { "Name": "Product Categories", "StateRef": "dashboard.SetupProductCategories" },
                    { "Name": "Products", "StateRef": "dashboard.ManageProducts" },
                    { "Name": "Ingredient Categories", "StateRef": "dashboard.SetupIngredientCategories" },
                    { "Name": "Ingredients", "StateRef": "dashboard.SetupIngredients" },
                    { "Name": "Combo", "StateRef": "dashboard.SetupCombo" },
                    { "Name": "External Products", "StateRef": "dashboard.ManageExternalProducts" },
                    { "Name": "Locker Products", "StateRef": "dashboard.ManageRegionLockerProduct" },
                    { "Name": "Items", "StateRef": "dashboard.SetupItems" },
                    { "Name": "Units", "StateRef": "dashboard.SetupUnits" },
                    { "Name": "KitchenRegion", "StateRef": "dashboard.SetupKitchenRegion" },
                    { "Name": "Vat", "StateRef": "dashboard.SetupInvoiceVat" },
                    { "Name": "Tax", "StateRef": "dashboard.SetupInvoiceTax" }
                ]
            },
            {
                "OptionName": "Promotions", "Icon": "fa fa-users fa-fw",
                "CollapseValue": "Promotions", "StateRef": null,
                "Options": [
                    { "Name": "Promotions", "StateRef": "dashboard.Promotions" },
                ]
            },
            {
                "OptionName": "Vodafone Promos", "Icon": "fa fa-users fa-fw",
                "CollapseValue": "vodafonepromos", "StateRef": null,
                "Options": [
                    { "Name": "HeaderDetailsPromos", "StateRef": "dashboard.HeaderDetailsPromos" },
                ]
            },
            {
                "OptionName": "Pricelists", "Icon": "fa fa-sitemap fa-fw", "CollapseValue": "pricelists", "StateRef": null,
                "Options": [
                    { "Name": "Pricelist Master", "StateRef": "dashboard.SetupPricelistMaster" },
                    { "Name": "Pricelist", "StateRef": "dashboard.SetupPricelist" },
                    { "Name": "Product Prices", "StateRef": "dashboard.SetupProductPrices" },
                    { "Name": "Ingredient Prices", "StateRef": "dashboard.SetupIngredientPrices" },
                    { "Name": "Discounts", "StateRef": "dashboard.SetupDiscount" }
                ]

            },
            { "OptionName": "Pages", "Icon": "fa fa-clipboard fa-fw", "CollapseValue": "pages", "StateRef": "dashboard.SetupPages", "Options": [] },
            { "OptionName": "Tables", "Icon": "fa fa-table fa-fw", "CollapseValue": "tables", "StateRef": "dashboard.SetupTables", "Options": [] },
            {
                "OptionName": "Staff Options", "Icon": "fa fa-users fa-fw", "CollapseValue": "staffoptions", "StateRef": null,
                "Options": [
                    { "Name": "Edit Staff", "StateRef": "dashboard.EditStaff" },
                    { "Name": "Staff Positions", "StateRef": "dashboard.StaffPositions" },
                    { "Name": "Authorization Groups", "StateRef": "dashboard.SetupAuthorizedGroup" },
                    { "Name": "Auth Group Actions", "StateRef": "dashboard.AuthGroupActions" },
                    { "Name": "Payroll", "StateRef": "dashboard.payroll" },
                    //{ "Name": "Payrole", "StateRef": "dashboard.PayroleOverview" },
                    //{ "Name": "Payroll", "StateRef": "dashboard.payroll" },
                ]
            },
            {
                "OptionName": "Hotel", "Icon": "fa fa-building-o fa-fw", "CollapseValue": "hotelconnection", "StateRef": null,
                "Options": [
                    { "Name": "Department Mapping", "StateRef": "dashboard.SetupDeparmentsMapping" },
                    { "Name": "Board Meal", "StateRef": "dashboard.SetupBoardMeals" },
                    { "Name": "Account Mappings", "StateRef": "dashboard.SetupAccountMapping" }
                ]
            },
            {
                "OptionName": "Exclusions", "Icon": "fa fa-random fa-fw", "CollapseValue": "exclusions", "StateRef": null,
                "Options": [
                    { "Name": "Excluded Accounts", "StateRef": "dashboard.SetupExcludedAccounts" },
                    { "Name": "Excluded Pricelists", "StateRef": "dashboard.SetupPosInfoDetailPricelistAssoc" }
                ]
            },
            {
                "OptionName": "Modules Configuration", "Icon": "fa fa-fax fa-fw", "CollapseValue": "moduleconf", "StateRef": null,
                "Options": [
                    { "Name": "Departments", "StateRef": "dashboard.SetupDeparments" },
                    { "Name": "POS Devices", "StateRef": "dashboard.SetupModules" },
                    { "Name": "PDA Modules", "StateRef": "dashboard.SetupPdaModules" },
                    { "Name": "KDS", "StateRef": "dashboard.SetupKds" },
                    { "Name": "NFC Device", "StateRef": "dashboard.NFCdevice" },
                    { "Name": "Client POS", "StateRef": "dashboard.SetupClientPos" },
                    {
                        "Name": "Kichen Configuration", "CollapseValue2": "kichenconf", "StateRef": null,
                        "Options": [
                            { "Name": "Kitchen", "StateRef": "dashboard.SetupKitchen" },
                            { "Name": "Kitchen Instruction", "StateRef": "dashboard.SetupKitchenInstructions" }
                        ]
                    }
                ]
            },
            {
                "OptionName": "Transactions", "Icon": "fa fa-exchange fa-fw", "CollapseValue": "transactions", "StateRef": null,
                "Options": [
                    { "Name": "Accounts", "StateRef": "dashboard.SetupAccounts" },
                    { "Name": "Invoice Types", "StateRef": "dashboard.SetupInvoiceTypes" },
                    { "Name": "Transaction Types", "StateRef": "dashboard.SetupTransactionTypes" },
                    { "Name": "Suppliers", "StateRef": "dashboard.SetupSuppliers" },
                    { "Name": "Sales Types", "StateRef": "dashboard.SetupSalesType" },
                    { "Name": "Vouchers-Credits", "StateRef": "dashboard.SetupPredefinedCredits" }
                ]
            },
            {
                "OptionName": "Associations", "Icon": "fa fa-link fa-fw", "CollapseValue": "associations", "StateRef": null,
                "Options": [
                    { "Name": "POS Associations", "StateRef": "dashboard.SetupModulesAssocs" },
                    { "Name": "Ingredient Associations", "StateRef": "dashboard.SetupIngredientAssocs" },
                    { "Name": "Combo Detail", "StateRef": "dashboard.SetupComboDetail" }
                ]
            },
            {
                "OptionName": "Manage Receipts", "Icon": "fa fa-print fa-fw", "CollapseValue": "receiptsPolicy", "StateRef": null,
                "Options": [
                    { "Name": "Manage Receipts", "StateRef": "dashboard.ManageReceipts" },
                    { "Name": "Closing Year", "StateRef": "dashboard.CloseYear" }
                ]
            },
            {
                "OptionName": "Table Reservation", "Icon": "fa fa-glass fa-fw", "CollapseValue": "troptions", "StateRef": null,
                "Options": [
                    {
                        "Name": "Restaurants Options", "CollapseValue2": "tr_rest_options", "StateRef": null,
                        "Options": [
                            { "Name": "Restaurants", "StateRef": "dashboard.tableResRestaurants" },
                            { "Name": "Restaurant Restrictions", "StateRef": "dashboard.tableResRestrictionsAssocs" },
                            { "Name": "Excluded Restrictions", "StateRef": "dashboard.tableResExcludedRestrictions" },
                            { "Name": "TradingHours", "StateRef": "dashboard.tableResTradingHours" },
                        ]
                    },

                    //{ "Name": "Restrictions", "StateRef": "dashboard.tableResRestrictions" },
                    {
                        "Name": "Capacity Options", "CollapseValue2": "tr_cap_options", "StateRef": null,
                        "Options": [
                            { "Name": "Capacities", "StateRef": "dashboard.tableResCapacities" },
                            { "Name": "Overwritten Capacities", "StateRef": "dashboard.tableResOverwrittenCapacities" },
                            { "Name": "Excluded Days", "StateRef": "dashboard.tableResExcludedDays" },
                        ]
                    },


                    { "Name": "Reservations", "StateRef": "dashboard.tableResReservations" },
                ]
            },
            {
                "OptionName": "Delivery Agent", "Icon": "fa fa-truck", "CollapseValue": "dAgent", "StateRef": null,
                "Options": [
                    { "Name": "Polygons", "StateRef": "dashboard.polygons" },
                    { "Name": "Loyalty", "StateRef": "dashboard.loyalty" },
                    { "Name": "Manage DA Stores", "StateRef": "dashboard.HandleDaStores" },
                    { "Name": "Manage DA Requests", "StateRef": "dashboard.Messages" },
                    { "Name": "Manage DA Shortages", "StateRef": "dashboard.ManageDaShortages" },
                    { "Name": "Manage DA Opening Hours", "StateRef": "dashboard.ManageDaOpeningHours" },
                ]
            },
            {
                "OptionName": "Settings", "Icon": "fa fa-cogs fa-fw", "CollapseValue": "settings", "StateRef": null,
                "Options": [
                    { "Name": "Main Configuration", "StateRef": "dashboard.MainConfiguration" },
                    { "Name": "Remote Control", "StateRef": "dashboard.RemoteQueries" },
                    { "Name": "Email Config", "StateRef": "dashboard.mailconfig" },
                ]
            },

            {
                "OptionName": "Development", "Icon": "fa fa-cogs fa-fw", "CollapseValue": "develop", "visible": "dev", "StateRef": null,
                "Options": [
                    { "Name": "New POS Modules", "StateRef": "dashboard.PosModules" },
                    { "Name": "Dev Products", "StateRef": "dashboard.ManageProducts" },
                    { "Name": "New Pages", "StateRef": "dashboard.ManagePages" },
                    { "Name": "Test View", "StateRef": "dashboard.test" },
                    { "Name": "404 Page", "StateRef": "dashboard.notFound" },
                    { "Name": "Closing Year", "StateRef": "dashboard.CloseYear" },
                ]
            }
        ]
    }
    else if (IsDA == "false" && IsDaClient == "true") {
        this.options = [
            { "OptionName": "Store Info", "Icon": "fa fa-home fa-fw", "CollapseValue": "home", "StateRef": "dashboard.home", "Options": [] },
            {
                "OptionName": "Products", "Icon": "fa fa-file-powerpoint-o fa-fw",
                "CollapseValue": "products", "StateRef": null,
                "Options": [
                    { "Name": "Categories", "StateRef": "dashboard.SetupCategories" },
                    { "Name": "Product Categories", "StateRef": "dashboard.SetupProductCategories" },
                    { "Name": "Products", "StateRef": "dashboard.ManageProducts" },
                    { "Name": "Ingredient Categories", "StateRef": "dashboard.SetupIngredientCategories" },
                    { "Name": "Ingredients", "StateRef": "dashboard.SetupIngredients" },
                    { "Name": "Combo", "StateRef": "dashboard.SetupCombo" },
                    { "Name": "External Products", "StateRef": "dashboard.ManageExternalProducts" },
                    { "Name": "Locker Products", "StateRef": "dashboard.ManageRegionLockerProduct" },
                    { "Name": "Items", "StateRef": "dashboard.SetupItems" },
                    { "Name": "Units", "StateRef": "dashboard.SetupUnits" },
                    { "Name": "KitchenRegion", "StateRef": "dashboard.SetupKitchenRegion" },
                    { "Name": "Vat", "StateRef": "dashboard.SetupInvoiceVat" },
                    { "Name": "Tax", "StateRef": "dashboard.SetupInvoiceTax" }
                ]
            },
            {
                "OptionName": "Promotions", "Icon": "fa fa-users fa-fw",
                "CollapseValue": "Promotions", "StateRef": null,
                "Options": [
                    { "Name": "Promotions", "StateRef": "dashboard.Promotions" },
                ]
            },
            {
                "OptionName": "Pricelists", "Icon": "fa fa-sitemap fa-fw", "CollapseValue": "pricelists", "StateRef": null,
                "Options": [
                    { "Name": "Pricelist Master", "StateRef": "dashboard.SetupPricelistMaster" },
                    { "Name": "Pricelist", "StateRef": "dashboard.SetupPricelist" },
                    { "Name": "Product Prices", "StateRef": "dashboard.SetupProductPrices" },
                    { "Name": "Ingredient Prices", "StateRef": "dashboard.SetupIngredientPrices" },
                    { "Name": "Discounts", "StateRef": "dashboard.SetupDiscount" }
                ]

            },
            { "OptionName": "Pages", "Icon": "fa fa-clipboard fa-fw", "CollapseValue": "pages", "StateRef": "dashboard.SetupPages", "Options": [] },
            { "OptionName": "Tables", "Icon": "fa fa-table fa-fw", "CollapseValue": "tables", "StateRef": "dashboard.SetupTables", "Options": [] },
            {
                "OptionName": "Staff Options", "Icon": "fa fa-users fa-fw", "CollapseValue": "staffoptions", "StateRef": null,
                "Options": [
                    { "Name": "Edit Staff", "StateRef": "dashboard.EditStaff" },
                    { "Name": "Staff Positions", "StateRef": "dashboard.StaffPositions" },
                    { "Name": "Authorization Groups", "StateRef": "dashboard.SetupAuthorizedGroup" },
                    { "Name": "Auth Group Actions", "StateRef": "dashboard.AuthGroupActions" },
                    //{ "Name": "Payrole", "StateRef": "dashboard.PayroleOverview" },
                    { "Name": "Payroll", "StateRef": "dashboard.payroll" },
                ]
            },
            {
                "OptionName": "Hotel", "Icon": "fa fa-building-o fa-fw", "CollapseValue": "hotelconnection", "StateRef": null,
                "Options": [
                    { "Name": "Department Mapping", "StateRef": "dashboard.SetupDeparmentsMapping" },
                    { "Name": "Board Meal", "StateRef": "dashboard.SetupBoardMeals" },
                    { "Name": "Account Mappings", "StateRef": "dashboard.SetupAccountMapping" }
                ]
            },
            {
                "OptionName": "Exclusions", "Icon": "fa fa-random fa-fw", "CollapseValue": "exclusions", "StateRef": null,
                "Options": [
                    { "Name": "Excluded Accounts", "StateRef": "dashboard.SetupExcludedAccounts" },
                    { "Name": "Excluded Pricelists", "StateRef": "dashboard.SetupPosInfoDetailPricelistAssoc" }
                ]
            },
            {
                "OptionName": "Modules Configuration", "Icon": "fa fa-fax fa-fw", "CollapseValue": "moduleconf", "StateRef": null,
                "Options": [
                    { "Name": "Departments", "StateRef": "dashboard.SetupDeparments" },
                    { "Name": "POS Devices", "StateRef": "dashboard.SetupModules" },
                    { "Name": "PDA Modules", "StateRef": "dashboard.SetupPdaModules" },
                    { "Name": "KDS", "StateRef": "dashboard.SetupKds" },
                    { "Name": "NFC Device", "StateRef": "dashboard.NFCdevice" },
                    { "Name": "Client POS", "StateRef": "dashboard.SetupClientPos" },
                    {
                        "Name": "Kichen Configuration", "CollapseValue2": "kichenconf", "StateRef": null,
                        "Options": [
                            { "Name": "Kitchen", "StateRef": "dashboard.SetupKitchen" },
                            { "Name": "Kitchen Instruction", "StateRef": "dashboard.SetupKitchenInstructions" }
                        ]
                    }
                ]
            },
            {
                "OptionName": "Transactions", "Icon": "fa fa-exchange fa-fw", "CollapseValue": "transactions", "StateRef": null,
                "Options": [
                    { "Name": "Accounts", "StateRef": "dashboard.SetupAccounts" },
                    { "Name": "Invoice Types", "StateRef": "dashboard.SetupInvoiceTypes" },
                    { "Name": "Transaction Types", "StateRef": "dashboard.SetupTransactionTypes" },
                    { "Name": "Suppliers", "StateRef": "dashboard.SetupSuppliers" },
                    { "Name": "Sales Types", "StateRef": "dashboard.SetupSalesType" },
                    { "Name": "Vouchers-Credits", "StateRef": "dashboard.SetupPredefinedCredits" }
                ]
            },
            {
                "OptionName": "Associations", "Icon": "fa fa-link fa-fw", "CollapseValue": "associations", "StateRef": null,
                "Options": [
                    { "Name": "POS Associations", "StateRef": "dashboard.SetupModulesAssocs" },
                    { "Name": "Ingredient Associations", "StateRef": "dashboard.SetupIngredientAssocs" },
                    { "Name": "Combo Detail", "StateRef": "dashboard.SetupComboDetail" }
                ]
            },
            {
                "OptionName": "Manage Receipts", "Icon": "fa fa-print fa-fw", "CollapseValue": "receiptsPolicy", "StateRef": null,
                "Options": [
                    { "Name": "Manage Receipts", "StateRef": "dashboard.ManageReceipts" },
                    { "Name": "Closing Year", "StateRef": "dashboard.CloseYear" }
                ]
            },
            {
                "OptionName": "Table Reservation", "Icon": "fa fa-glass fa-fw", "CollapseValue": "troptions", "StateRef": null,
                "Options": [
                    {
                        "Name": "Restaurants Options", "CollapseValue2": "tr_rest_options", "StateRef": null,
                        "Options": [
                            { "Name": "Restaurants", "StateRef": "dashboard.tableResRestaurants" },
                            { "Name": "Restaurant Restrictions", "StateRef": "dashboard.tableResRestrictionsAssocs" },
                            { "Name": "Excluded Restrictions", "StateRef": "dashboard.tableResExcludedRestrictions" },
                            { "Name": "TradingHours", "StateRef": "dashboard.tableResTradingHours" },
                        ]
                    },

                    //{ "Name": "Restrictions", "StateRef": "dashboard.tableResRestrictions" },
                    {
                        "Name": "Capacity Options", "CollapseValue2": "tr_cap_options", "StateRef": null,
                        "Options": [
                            { "Name": "Capacities", "StateRef": "dashboard.tableResCapacities" },
                            { "Name": "Overwritten Capacities", "StateRef": "dashboard.tableResOverwrittenCapacities" },
                            { "Name": "Excluded Days", "StateRef": "dashboard.tableResExcludedDays" },
                        ]
                    },


                    { "Name": "Reservations", "StateRef": "dashboard.tableResReservations" },
                ]
            },
            {
                "OptionName": "Manage Store", "Icon": "fa fa-bars", "CollapseValue": "mStore", "StateRef": "dashboard.stores", "Options": []
            },
            {
                "OptionName": "Settings", "Icon": "fa fa-cogs fa-fw", "CollapseValue": "settings", "StateRef": null,
                "Options": [
                    { "Name": "Main Configuration", "StateRef": "dashboard.MainConfiguration" },
                    { "Name": "Remote Control", "StateRef": "dashboard.RemoteQueries" },
                    { "Name": "Email Config", "StateRef": "dashboard.mailconfig" },
                ]
            },

            {
                "OptionName": "Development", "Icon": "fa fa-cogs fa-fw", "CollapseValue": "develop", "visible": "dev", "StateRef": null,
                "Options": [
                    { "Name": "New POS Modules", "StateRef": "dashboard.PosModules" },
                    { "Name": "Dev Products", "StateRef": "dashboard.ManageProducts" },
                    { "Name": "New Pages", "StateRef": "dashboard.ManagePages" },
                    { "Name": "Test View", "StateRef": "dashboard.test" },
                    { "Name": "404 Page", "StateRef": "dashboard.notFound" },
                    { "Name": "Closing Year", "StateRef": "dashboard.CloseYear" },
                ]
            }
        ]
    }
    else {
        this.options = [
            { "OptionName": "Store Info", "Icon": "fa fa-home fa-fw", "CollapseValue": "home", "StateRef": "dashboard.home", "Options": [] },
            {
                "OptionName": "Products", "Icon": "fa fa-file-powerpoint-o fa-fw",
                "CollapseValue": "products", "StateRef": null,
                "Options": [
                    { "Name": "Categories", "StateRef": "dashboard.SetupCategories" },
                    { "Name": "Product Categories", "StateRef": "dashboard.SetupProductCategories" },
                    { "Name": "Vat Updater", "StateRef": "dashboard.VatUpdater" },
                    { "Name": "Update Transfer Mappings", "StateRef": "dashboard.UpdateTransferMappings" },
                    { "Name": "Products", "StateRef": "dashboard.ManageProducts" },
                    { "Name": "Ingredient Categories", "StateRef": "dashboard.SetupIngredientCategories" },
                    { "Name": "Ingredients", "StateRef": "dashboard.SetupIngredients" },
                    { "Name": "Combo", "StateRef": "dashboard.SetupCombo" },
                    { "Name": "External Products", "StateRef": "dashboard.ManageExternalProducts" },
                    { "Name": "Locker Products", "StateRef": "dashboard.ManageRegionLockerProduct" },
                    { "Name": "Items", "StateRef": "dashboard.SetupItems" },
                    { "Name": "Units", "StateRef": "dashboard.SetupUnits" },
                    { "Name": "KitchenRegion", "StateRef": "dashboard.SetupKitchenRegion" },
                    { "Name": "Vat", "StateRef": "dashboard.SetupInvoiceVat" },
                    { "Name": "Tax", "StateRef": "dashboard.SetupInvoiceTax" }
                ]
            },
            {
                "OptionName": "Promotions", "Icon": "fa fa-users fa-fw",
                "CollapseValue": "Promotions", "StateRef": null,
                "Options": [
                    { "Name": "Promotions", "StateRef": "dashboard.Promotions" },
                ]     
            },
            {
                "OptionName": "Pricelists", "Icon": "fa fa-sitemap fa-fw", "CollapseValue": "pricelists", "StateRef": null,
                "Options": [
                    { "Name": "Pricelist Master", "StateRef": "dashboard.SetupPricelistMaster" },
                    { "Name": "Pricelist", "StateRef": "dashboard.SetupPricelist" },
                    { "Name": "Product Prices", "StateRef": "dashboard.SetupProductPrices" },
                    { "Name": "Ingredient Prices", "StateRef": "dashboard.SetupIngredientPrices" },
                    { "Name": "Discounts", "StateRef": "dashboard.SetupDiscount" }
                ]

            },
            { "OptionName": "Pages", "Icon": "fa fa-clipboard fa-fw", "CollapseValue": "pages", "StateRef": "dashboard.SetupPages", "Options": [] },
            { "OptionName": "Tables", "Icon": "fa fa-table fa-fw", "CollapseValue": "tables", "StateRef": "dashboard.SetupTables", "Options": [] },
            {
                "OptionName": "Staff Options", "Icon": "fa fa-users fa-fw", "CollapseValue": "staffoptions", "StateRef": null,
                "Options": [
                    { "Name": "Edit Staff", "StateRef": "dashboard.EditStaff" },
                    { "Name": "Staff Positions", "StateRef": "dashboard.StaffPositions" },
                    { "Name": "Authorization Groups", "StateRef": "dashboard.SetupAuthorizedGroup" },
                    { "Name": "Auth Group Actions", "StateRef": "dashboard.AuthGroupActions" },
                    { "Name": "Payroll", "StateRef": "dashboard.payroll" },
                ]
            },
            {
                "OptionName": "Hotel", "Icon": "fa fa-building-o fa-fw", "CollapseValue": "hotelconnection", "StateRef": null,
                "Options": [
                    { "Name": "Department Mapping", "StateRef": "dashboard.SetupDeparmentsMapping" },
                    { "Name": "Board Meal", "StateRef": "dashboard.SetupBoardMeals" },
                    { "Name": "Account Mappings", "StateRef": "dashboard.SetupAccountMapping" },
                    { "Name": "Hotel Macros", "StateRef": "dashboard.AllowedMeals" },
                    { "Name": "Timezones", "StateRef": "dashboard.Timezones" },
                    { "Name": "Hotel Custom Messages", "StateRef": "dashboard.HotelCustomMessages" },
                      { "Name": "Hotel Customer Configuration", "StateRef": "dashboard.HotelCustomerDataConfig" }
                ]
            },
            {
                "OptionName": "Exclusions", "Icon": "fa fa-random fa-fw", "CollapseValue": "exclusions", "StateRef": null,
                "Options": [
                    { "Name": "Excluded Accounts", "StateRef": "dashboard.SetupExcludedAccounts" },
                    { "Name": "Excluded Pricelists", "StateRef": "dashboard.SetupPosInfoDetailPricelistAssoc" }
                ]
            },
            {
                "OptionName": "Modules Configuration", "Icon": "fa fa-fax fa-fw", "CollapseValue": "moduleconf", "StateRef": null,
                "Options": [
                    { "Name": "Departments", "StateRef": "dashboard.SetupDeparments" },
                    { "Name": "POS Devices", "StateRef": "dashboard.SetupModules" },
                    { "Name": "PDA Modules", "StateRef": "dashboard.SetupPdaModules" },
                    { "Name": "KDS", "StateRef": "dashboard.SetupKds" },
                    { "Name": "NFC Device", "StateRef": "dashboard.NFCdevice" },
                    { "Name": "Client POS", "StateRef": "dashboard.SetupClientPos" },
                    {
                        "Name": "Kichen Configuration", "CollapseValue2": "kichenconf", "StateRef": null,
                        "Options": [
                            { "Name": "Kitchen", "StateRef": "dashboard.SetupKitchen" },
                            { "Name": "Kitchen Instruction", "StateRef": "dashboard.SetupKitchenInstructions" }
                        ]
                    }
                ]
            },
            {
                "OptionName": "Transactions", "Icon": "fa fa-exchange fa-fw", "CollapseValue": "transactions", "StateRef": null,
                "Options": [
                    { "Name": "Accounts", "StateRef": "dashboard.SetupAccounts" },
                    { "Name": "Invoice Types", "StateRef": "dashboard.SetupInvoiceTypes" },
                    { "Name": "Transaction Types", "StateRef": "dashboard.SetupTransactionTypes" },
                    { "Name": "Suppliers", "StateRef": "dashboard.SetupSuppliers" },
                    { "Name": "Sales Types", "StateRef": "dashboard.SetupSalesType" },
                    { "Name": "Vouchers-Credits", "StateRef": "dashboard.SetupPredefinedCredits" }
                ]
            },
            {
                "OptionName": "Associations", "Icon": "fa fa-link fa-fw", "CollapseValue": "associations", "StateRef": null,
                "Options": [
                    { "Name": "POS Associations", "StateRef": "dashboard.SetupModulesAssocs" },
                    { "Name": "Ingredient Associations", "StateRef": "dashboard.SetupIngredientAssocs" },
                    { "Name": "Combo Detail", "StateRef": "dashboard.SetupComboDetail" }
                ]
            },
            {
                "OptionName": "Manage Receipts", "Icon": "fa fa-print fa-fw", "CollapseValue": "receiptsPolicy", "StateRef": null,
                "Options": [
                    { "Name": "Manage Receipts", "StateRef": "dashboard.ManageReceipts" },
                    { "Name": "Closing Year", "StateRef": "dashboard.CloseYear" }
                ]
            },
            {
                "OptionName": "Table Reservation", "Icon": "fa fa-glass fa-fw", "CollapseValue": "troptions", "StateRef": null,
                "Options": [
                    {
                        "Name": "Restaurants Options", "CollapseValue2": "tr_rest_options", "StateRef": null,
                        "Options": [
                            { "Name": "Restaurants", "StateRef": "dashboard.tableResRestaurants" },
                            { "Name": "Restaurant Restrictions", "StateRef": "dashboard.tableResRestrictionsAssocs" },
                            { "Name": "Excluded Restrictions", "StateRef": "dashboard.tableResExcludedRestrictions" },
                            { "Name": "TradingHours", "StateRef": "dashboard.tableResTradingHours" },
                        ]
                    },

                    //{ "Name": "Restrictions", "StateRef": "dashboard.tableResRestrictions" },
                    {
                        "Name": "Capacity Options", "CollapseValue2": "tr_cap_options", "StateRef": null,
                        "Options": [
                            { "Name": "Capacities", "StateRef": "dashboard.tableResCapacities" },
                            { "Name": "Overwritten Capacities", "StateRef": "dashboard.tableResOverwrittenCapacities" },
                            { "Name": "Excluded Days", "StateRef": "dashboard.tableResExcludedDays" },
                        ]
                    },


                    { "Name": "Reservations", "StateRef": "dashboard.tableResReservations" },
                ]
            },
            {
                "OptionName": "Settings", "Icon": "fa fa-cogs fa-fw", "CollapseValue": "settings", "StateRef": null,
                "Options": [
                    { "Name": "Main Configuration", "StateRef": "dashboard.MainConfiguration" },
                    { "Name": "Remote Control", "StateRef": "dashboard.RemoteQueries" },
                    { "Name": "Email Config", "StateRef": "dashboard.mailconfig" },
                ]
            },

            {
                "OptionName": "Development", "Icon": "fa fa-cogs fa-fw", "CollapseValue": "develop", "visible": "dev", "StateRef": null,
                "Options": [
                    { "Name": "New POS Modules", "StateRef": "dashboard.PosModules" },
                    { "Name": "Dev Products", "StateRef": "dashboard.ManageProducts" },
                    { "Name": "New Pages", "StateRef": "dashboard.ManagePages" },
                    { "Name": "Test View", "StateRef": "dashboard.test" },
                    { "Name": "404 Page", "StateRef": "dashboard.notFound" },
                    { "Name": "Closing Year", "StateRef": "dashboard.CloseYear" },
                ]
            }
        ]
    }

    return this;
}
