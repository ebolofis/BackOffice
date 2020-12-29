/// <reference path="directives/common-used-directives/action-effects-directives.js" />
angular.module('posBOApp', ['posBOApp.config', 'posBOApp.loginAuth', 'ui.bootstrap', 'ui.router', 'ngAnimate', 'ui.sortable',// 'ngDraggable',
    'angular-loading-bar', 'oc.lazyLoad',
    //custom material templates
    'ngSpectrum', 'angularSpectrumColorpicker', //SFE color picker add
    'ngAria', 'ngMaterial', 'ngMessages', "materialCalendar",
    'md.data.table', 'md-steppers', 'md.chips.select', //'ngMdIcons',
    //ui grid adds 
    'ui.grid', 'ui.grid.grouping', 'ui.grid.autoResize', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav', 'ui.grid.resizeColumns', 'ui.grid.pinning', 'ui.grid.selection', 'ui.grid.moveColumns', 'ui.grid.pagination', 'ui.grid.exporter', 'ui.grid.importer', 'ui.grid.grouping',// 'ui.grid.validate',
    'ngSanitize', 'schemaForm',
    'angularjs-dropdown-multiselect', 'isteven-multi-select',
    // 'schemaForm-datepicker', 'schemaForm-timepicker', 'schemaForm-datetimepicker',
    'multipleSelection', 'multipleDrag', 'ui.select',
    'ui.highlight', 'pascalprecht.translate',
    'mgcrea.ngStrap', 'mgcrea.ngStrap.modal', 'mgcrea.ngStrap.select', 'ngMaterialDatePicker', //'autofields',
    'toggle-switch', 'dndLists', 'mgcrea.ngStrap', 'gridster', 'ngFileSaver', 'base64', 'angularFileUpload', 'ngCsv', 'ngCsvImport', 'SignalR'

])
    .config(function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $provide) {
        // Lazyloader Initiallization
        $ocLazyLoadProvider.config({ debug: false, events: true, });
        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise("login");
        // Now set up the states
        $stateProvider
            .state('notfound', { url: '/notfound', templateUrl: 'app/views/NotFound.html' })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'app/views/dashboard/main.html',
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load(
                            {
                                name: 'posBOApp',
                                files: [
                                    'app/scripts/services/headerActionsService.js', 'app/scripts/directives/header/state-header.js', 'app/scripts/directives/header/header-notification/header-notification.js',
                                    'app/scripts/directives/common-used-directives/ngscrollbar.js',
                                    'app/scripts/directives/common-used-directives/common-used-modules.js',
                                    'app/scripts/directives/common-used-directives/file-handling-directives.js',

                                    'app/scripts/directives/sidebar/sidebar.js',
                                    //'app/scripts/directives/sidebar/sidebar-search/sidebar-search.js',
                                    'app/scripts/controllers/loginController.js', 'app/scripts/services/configuration-service.js', //'app/scripts/factories/loginFactory.js',
                                    'app/scripts/controllers/userSettingsController.js',
                                    'app/scripts/services/dynamicApiService.js',
                                    'app/scripts/controllers/gridControllers/singleGridController.js',
                                    'app/scripts/factories/bo-data-models.js',
                                    'app/scripts/factories/dynamicApiFactory.js',
                                    'app/scripts/factories/uiGridFactory.js', 'app/scripts/factories/uiGridActionManagerFactory.js', //manages Filters in grids
                                    'app/scripts/directives/gridDirectives/gridDirectives.js',

                                    'app/scripts/directives/views-directives/element-directives.js',
                                    'app/scripts/directives/common-used-directives/action-effects-directives.js',
                                    'app/scripts/directives/common-used-directives/reusable-dynamic-components.js',

                                    'app/scripts/directives/modal-directives/views-modals.js',
                                    'app/scripts/factories/dataUtilFactory.js',
                                    'app/scripts/factories/filters-general-factory.js',
                                    'app/scripts/factories/toster-factory.js',
                                    'app/scripts/factories/signalR-factories.js',
                                ]
                            })
                        //$ocLazyLoad.load({ name: 'toggle-switch', files: ["Scripts/angular-toggle-switch.min.js", "Content/angular-toggle-switch.css"] })
                        $ocLazyLoad.load({ name: 'ngAnimate', files: ['Scripts/angular-animate.js'] }); $ocLazyLoad.load({ name: 'ngCookies', files: ['Scripts/angular-cookies.js'] });
                        $ocLazyLoad.load({ name: 'ngResource', files: ['Scripts/angular-resource.js'] }); $ocLazyLoad.load({ name: 'ngSanitize', files: ['Scripts/angular-sanitize.js'] })
                        $ocLazyLoad.load({ name: 'ngTouch', files: ['Scripts/angular-touch.js'] })
                        //$ocLazyLoad.load(
                        //{
                        //    name: 'posBOApp',
                        //    files: ['app/scripts/directives/gridExport/gridExport.js']
                        //})
                    }
                }
            })

            //MAIN CONFIGURATION
            .state('dashboard.MainConfiguration', {
                url: '/MainConfiguration',
                templateUrl: 'app/views/MainConfiguration/main-configuration-view.html',
                controller: ('MainConfigutrationCtrl', ['$scope', function ($scope) { }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/configurationCtrls/main-configuration-controller.js',
                                'app/scripts/components/MainConfiguration/main-configuration-comp.js',
                                'app/scripts/factories/main-configuration-factory.js'
                            ]
                        })
                    }
                }
            })

            .state('dashboard.RemoteQueries', {
                url: '/RemoteControl',
                templateUrl: 'app/views/handle-views/remote-actions-view.html',
                controller: ('RemoteControlCtrl', ['$scope', function ($scope) { }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/configurationCtrls/remote-control-controller.js']
                        })
                    }
                }
            })
            .state('dashboard.SetupCombo', {
                url: '/Combo',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Combo'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })
            .state('dashboard.SetupComboDetail', {
                url: '/ComboDetail',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'ComboDetail'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })
            .state('dashboard.SetupIngredientCategories', {
                url: '/IngredientCategories',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'IngredientCategories'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })
            .state('dashboard.SetupIngredients', {
                url: '/Ingredients',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Ingredients'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })
            // TABLE RESERVATION
            .state('dashboard.tableResRestaurants', {
                url: '/Restaurants', templateUrl: 'app/views/table-reservation/main-reservation-manager.html', controller: ('TableReservationCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'Restaurants'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [
                                'app/scripts/controllers/mainPageControllers/table-reservation-controller.js',
                                'app/scripts/components/table-reservation/restaurant-comp.js',
                                'app/scripts/factories/table-reservation-factory.js',
                            ]
                        })
                    }
                }
            })

            .state('dashboard.tableResRestrictionsAssocs', {
                url: '/RestrictionAssocs', templateUrl: 'app/views/table-reservation/main-reservation-manager.html',
                controller: ('TableReservationCtrl',
                    ['$scope',
                        function ($scope) {
                            $scope.editingEntity = 'RestrictionAssocs';
                        }
                    ]
                ),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/table-reservation-controller.js',
                                'app/scripts/components/table-reservation/restriction-assoc-comp.js',
                                'app/scripts/factories/table-reservation-factory.js',
                            ]
                        })
                    }
                }
            }).state('dashboard.tableResExcludedRestrictions', {
                url: '/ExcludedRestrictions', templateUrl: 'app/views/table-reservation/main-reservation-manager.html', controller: ('TableReservationCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'ExcludedRestrictions'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/mainPageControllers/table-reservation-controller.js',
                                'app/scripts/components/table-reservation/restriction-excluded-assoc-comp.js',
                                'app/scripts/factories/table-reservation-factory.js']
                        })
                    }
                }
            })
            //Capacities
            .state('dashboard.tableResCapacities', {
                url: '/Capacities', templateUrl: 'app/views/table-reservation/main-reservation-manager.html', controller: ('TableReservationCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'Capacities'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: ['app/scripts/controllers/mainPageControllers/table-reservation-controller.js',
                                'app/scripts/components/table-reservation/capacities-comp.js',
                                'app/scripts/factories/table-reservation-factory.js',
                            ]
                        })
                    }
                }
            })

            .state('dashboard.tableResOverwrittenCapacities', {
                url: '/OverwrittenCapacities', templateUrl: 'app/views/table-reservation/main-reservation-manager.html', controller: ('TableReservationCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'OverwrittenCapacities'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [
                                'app/scripts/controllers/mainPageControllers/table-reservation-controller.js',
                                'app/scripts/components/table-reservation/capacities-overwritten-comp.js',
                                'app/scripts/factories/table-reservation-factory.js',
                            ]
                        })
                    }
                }
            })
            .state('dashboard.tableResExcludedDays', {
                url: '/ExcludedDays', templateUrl: 'app/views/table-reservation/main-reservation-manager.html', controller: ('TableReservationCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'ExcludedDays'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: ['app/scripts/controllers/mainPageControllers/table-reservation-controller.js',
                                'app/scripts/components/table-reservation/capacities-excluded-days-comp.js',
                                'app/scripts/factories/table-reservation-factory.js',]
                        })
                    }
                }
            })

            .state('dashboard.tableResRestaurantConfig', {
                url: '/RestaurantConfig', templateUrl: 'app/views/table-reservation/main-reservation-manager.html', controller: ('TableReservationCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'RestaurantConfig'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({ name: 'posBOApp', files: ['app/scripts/controllers/mainPageControllers/table-reservation-controller.js',] })
                    }
                }
            })
            .state('dashboard.tableResReservations', {
                url: '/Reservations', templateUrl: 'app/views/table-reservation/main-reservation-manager.html', controller: ('TableReservationCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'Reservations';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/table-reservation-controller.js',
                                'app/scripts/components/table-reservation/reservations-comp.js',
                                'app/scripts/factories/table-reservation-factory.js'
                            ]
                        })
                    }
                }
            }).state('dashboard.tableResCustomers', {
                url: '/Customers', templateUrl: 'app/views/table-reservation/main-reservation-manager.html', controller: ('TableReservationCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'Customers'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({ name: 'posBOApp', files: ['app/scripts/controllers/mainPageControllers/table-reservation-controller.js',] })
                    }
                }
            })

            .state('dashboard.mailconfig', {
                url: '/EmailConfig',
                templateUrl: 'app/views/EmailSetUp/emailConfig.html',
                controller: ('EmailConfigCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'EmailConfig'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [
                                'app/scripts/controllers/configurationCtrls/emailConfigController.js',
                                'app/scripts/components/EmailConfig/email-comp.js',
                                'app/scripts/factories/email-factory.js',
                            ]
                        })
                    }
                }
            })

            .state('dashboard.tableResTradingHours', {
                url: '/TradingHours',
                templateUrl: 'app/views/table-reservation/main-reservation-manager.html',
                controller: ('TableReservationCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'TradingHours'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [
                                'app/scripts/controllers/mainPageControllers/table-reservation-controller.js',
                                'app/scripts/components/table-reservation/trading-hours-comp.js',
                                'app/scripts/factories/table-reservation-factory.js',
                            ]
                        })
                    }
                }
            })

            //DELIVERY AGENT
            .state('dashboard.polygons', {
                url: '/Polygons',
                templateUrl: 'app/views/deliveryAgent/main-deliveryAgent-manager.html',
                controller: ('DeliveryAgentCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'Polygons';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/deliveryAgentController.js',
                                'app/scripts/components/delivery-agent/polygons-comp.js',
                                'app/scripts/factories/deliveryAgent-factory.js'
                            ]
                        })
                    }
                }
            })

            //VODAFONE PROMOS
            .state('dashboard.HeaderDetailsPromos', {
                url: '/HeaderDetailsPromos',
                templateUrl: 'app/views/vodafone-promos/VodafonePromos.html',
                controller: ('VodafonePromosCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'HeaderDetailsPromos';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/VodafonePromosCtrl.js',
                                'app/scripts/components/vodafone-promos/promos-comp.js',
                                'app/scripts/factories/Vodafone-Promos-factory.js'
                            ]
                        })
                    }
                }
            })

            // CHANGE PRODUCT CATEGORIES VAT
            .state('dashboard.VatUpdater', {
                url: '/VatUpdater',
                templateUrl: 'app/views/UpdateProdCat/main-UpdateProdCat-Manager.html',
                controller: ('VatUpdaterCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'UpdateProdCat';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/UpdateProdCatCtrl.js',
                                'app/scripts/components/UpdateProdCat/UpdateProdCat-comp.js',
                                'app/scripts/factories/UpdateProdCat-factory.js'
                            ]
                        })
                    }
                }
            })
            // CHANGE TRANSFER MAPPINGS
            .state('dashboard.UpdateTransferMappings', {
                url: '/UpdateTransferMappings',
                templateUrl: 'app/views/ChangeTransferMappings/main-ChangeTransferMappings-Manager.html',
                controller: ('ChangeTransferMappingsCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'ChangeTransferMappings';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/ChangeTransferMappingsCtrl.js',
                                'app/scripts/components/ChangeTransferMappings/ChangeTransferMappings-comp.js',
                                'app/scripts/factories/ChangeTransferMappings-factory.js'
                            ]
                        })
                    }
                }
            })

            // MANAGE DA STORES
            .state('dashboard.HandleDaStores', {
                url: '/HandleDaStores',
                templateUrl: '/app/views/ManageDaStores/Manage-DaStores.html',
                controller: ('HandleDaStoresCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'HandleDaStores';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                '/app/scripts/controllers/mainPageControllers/HandleDaStoresCtrl.js',
                                '/app/scripts/components/HandleDaStores/HandleDaStores-comp.js',
                                '/app/scripts/factories/HandleDaStores-factory.js'
                            ]
                        })
                    }
                }
            })

            // Promotions
            .state('dashboard.Promotions', {
                url: '/Promotions',
                templateUrl: '/app/views/Promotions/Manage-Promotions.html',
                controller: ('PromotionsCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'Promotions';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                '/app/scripts/controllers/mainPageControllers/PromotionsCtrl.js',
                                '/app/scripts/components/Promotions/ManagePromotions-comp.js',
                                '/app/scripts/factories/Promotions-factory.js'
                            ]
                        })
                    }
                }
            })
            .state('dashboard.Shortages', {
                url: '/DaShortages',
                templateUrl: 'app/views/DaShortages/DaShortages.html',
                controller: ('DaShortagesCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'DaShortages';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/DaShortagesController.js',
                                'app/scripts/components/DaShortages/DaShortages-comp.js',
                                'app/scripts/factories/DaShortagesFactory.js'
                            ]
                        })
                    }
                }
            })


            //ManageDaOpeningHours

            .state('dashboard.ManageDaOpeningHours', {
                url: '/ManageDaOpeningHours',
                templateUrl: 'app/views/ManageDaOpeningHours/ManageDaOpeningHours.html',
                controller: ('ManageDaOpeningHoursCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'ManageDaOpeningHours';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/ManageDaOpeningHoursController.js',
                                'app/scripts/components/ManageDaOpeningHours/ManageDaOpeningHours-comp.js',
                                'app/scripts/factories/ManageDaOpeningHoursFactory.js'
                            ]
                        })
                    }
                }
            })


            // MANAGE DA SHORTAGES

            .state('dashboard.ManageDaShortages', {
                url: '/ManageDaShortages',
                templateUrl: 'app/views/ManageDaShortages/ManageDaShortages.html',
                controller: ('ManageDaShortagesCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'ManageDaShortages';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/ManageDaShortagesController.js',
                                'app/scripts/components/ManageDaShortages/ManageDaShortages-comp.js',
                                'app/scripts/factories/ManageDaShortagesFactory.js'
                            ]
                        })
                    }
                }
            })

       


            //MANAGE STORE
            .state('dashboard.stores', {
                url: '/Store',
                templateUrl: 'app/views/manageStore/main-manageStore-manager.html',
                controller: ('ManageStoreCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'Store';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/manageStoreController.js',
                                'app/scripts/components/manage-store/stores-comp.js',
                                'app/scripts/factories/manageStore-factory.js'
                            ]
                        })
                    }
                }
            })

   
            // New Payroll
            .state('dashboard.payroll', {
                url: '/Payroll',
                templateUrl: 'app/views/Payroll/main-payroll-manager.html',
                controller: ('ManagePayrollCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'Payroll';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/managePayrollController.js',
                                'app/scripts/components/Payroll/payroll-comp.js',
                                'app/scripts/factories/manage-Payroll-factory.js'
                            ]
                        })
                    }
                }
            })
            //
            .state('dashboard.Messages', {
                url: '/Messages',
                templateUrl: 'app/views/Messages/main-messages-manager.html',
                controller: ('ManageMessagesCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'Messages';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/manageMessagesController.js',
                                'app/scripts/components/Messages/messages-comp.js',
                                'app/scripts/factories/manage-Messages-factory.js'
                            ]
                        })
                    }
                }
            })
            .state('dashboard.AllowedMeals', {
                url: '/AllowedMeals',
                templateUrl: 'app/views/AllowedMeals/main-manageAllowedMeals-manager.html',
                controller: ('ManageAllowedMealsCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'AllowedMeals';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/manageAllowedMealsController.js',
                                'app/scripts/components/AllowedMeals/allowedmeals-comp.js',
                                'app/scripts/factories/manageAllowedMeals-factory.js'
                            ]
                        })
                    }
                }
            })


            .state('dashboard.HotelCustomMessages', {
                url: '/HotelCustomMessages',
                templateUrl: 'app/views/HotelCustomMessages/main-manageHotelCustomMessages-manager.html',
                controller: ('ManageHotelCustomMessagesCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'HotelCustomMessages';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/manageHotelCustomMessagesController.js',
                                'app/scripts/components/HotelCustomMessages/templates/hotelcustommessages-comp.js',
                                'app/scripts/factories/manageHotelCustomMessages-factory.js'
                            ]
                        })
                    }
                }
            })


            .state('dashboard.HotelCustomerDataConfig', {
                url: '/HotelCustomerDataConfig',
                templateUrl: 'app/scripts/components/HotelCustomerDataConfig/templates/main-ManageHotelCustomerDataConfig.html',
                controller: ('ManageHotelCustomerDataConfigCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'HotelCustomerDataConfig';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/manageHotelCustomerDataConfigController.js',
                                'app/scripts/components/HotelCustomerDataConfig/hotelcustomerdataconfig-comp.js',
                                'app/scripts/factories/manageHotelCustomerDataConfig-factory.js'
                            ]
                        })
                    }
                }
            })

            .state('dashboard.Timezones', {
                url: '/Timezones',
                templateUrl: 'app/views/Timezones/main-manageTimezones-manager.html',
                controller: ('ManageTimezonesCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'Timezones';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/manageTimezonesController.js',
                                'app/scripts/components/Timezones/templates/timezones-comp.js',
                                'app/scripts/factories/manageTimezones-factory.js'
                            ]
                        })
                    }
                }
            })

            //Loyalty
            .state('dashboard.loyalty', {
                url: '/Loyalty',
                templateUrl: 'app/views/loyalty/main-loyalty-manager.html',
                controller: ('LoyaltyCtrl', ['$scope', function ($scope) {
                    $scope.editingEntity = 'Loyalty';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [
                                'app/scripts/controllers/mainPageControllers/loyaltyController.js',
                                'app/scripts/components/loyalty/loyalty-comp.js',
                                'app/scripts/factories/loyalty-factory.js'
                            ]
                        })
                    }
                }
            })

            .state('dashboard.CloseYear', {
                url: '/CloseYear',
                templateUrl: 'app/views/setupSettings/generic-entity-manager.html',
                controller: ('GenericEntityManagerCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'CloseYear'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/mainPageControllers/generic-entity-manager.js',]
                        })
                    }
                }

            }).state('dashboard.PayroleOverview', {
                url: '/PayroleOverview',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Payrole'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            }).state('dashboard.ManagePages', {
                url: '/ManagePages',
                templateUrl: 'app/views/setup-views/manage-pages-view.html',
                controller: 'ManagePagesController',
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/mainPageControllers/manage-pages-controller.js',]
                        })
                    }
                }
            }).state('dashboard.ManageReceipts', {
                url: '/ManageReceipts',
                templateUrl: 'app/views/handle-views/manage-receipt-view.html',
                controller: 'ManageReceiptsController',
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/transactionControllers/manage-receipt-controller.js',]
                        })
                    }
                }
            })


            .state('dashboard.ManageProducts', {
                url: '/ManageProducts',
                templateUrl: 'app/views/setupSettings/ManageProducts.html',
                controller: 'ManageProductsController',
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [
                                'app/scripts/controllers/mainPageControllers/productsController.js',
                                'app/scripts/directives/directives.js',
                                'app/scripts/directives/views-directives/product-modules/product-directives.js',
                                'app/scripts/components/products/product-recipe-comp.js',
                                'app/scripts/components/products/product-extras-comp.js'
                            ]
                        })
                    }
                }
            }).state('dashboard.ManageExternalProducts', {
                url: '/ManageExternalProducts',
                templateUrl: 'app/views/setupSettings/generic-entity-manager.html',
                controller: ('GenericEntityManagerCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'ManageExternalProducts'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/mainPageControllers/generic-entity-manager.js',
                            ]
                        })
                    }
                }
            })
            .state('dashboard.NFCdevice', {
                url: '/NFCconfiguration',
                templateUrl: 'app/views/setupSettings/generic-entity-manager.html',
                controller: ('GenericEntityManagerCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'NFCconfig'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/mainPageControllers/generic-entity-manager.js',
                            ]
                        })
                    }
                }
            })
            .state('dashboard.ManageRegionLockerProduct', {
                url: '/RegionLockerProduct',
                templateUrl: 'app/views/setupSettings/generic-entity-manager.html',
                controller: ('GenericEntityManagerCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'RegionLockerProduct'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/mainPageControllers/generic-entity-manager.js',]
                        })
                    }
                }
            })

            .state('dashboard.EditStaff', {
                url: '/EntitiesManagement',
                templateUrl: 'app/views/setupSettings/generic-entity-manager.html',
                controller: ('GenericEntityManagerCtrl', ['$scope', function ($scope) { $scope.editingEntity = 'Staff'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/mainPageControllers/generic-entity-manager.js']
                        })
                    }
                }
            })
            //Developing States
            //  .state('dashboard.dataTableManager', {
            //    url: '/dataTableManager',
            //    templateUrl: 'app/views/configuration/data-table-manager.html',
            //    controller: 'DataTableManagerCtrl',
            //    resolve: {
            //        loadMyDirectives: function ($ocLazyLoad) {
            //            return $ocLazyLoad.load({
            //                name: 'posBOApp', files: [
            //                    'app/scripts/controllers/configurationCtrls/dataTableManagerCtrl.js',
            //                ]
            //            })
            //        }
            //    }
            //})
            //  .state('dashboard.mdtInvoiceTypes', {
            //      url: '/ManageInvoiceTypes',
            //      templateUrl: 'app/views/setupSettings/DynamicDataTable.html',
            //      controller: ('DynamicDataTableCtrl', ['$scope', function ($scope) { $scope.entityIdentifier = 'InvoiceTypes'; }]),
            //      resolve: {
            //          loadMyDirectives: function ($ocLazyLoad) {
            //              return $ocLazyLoad.load({
            //                  name: 'posBOApp', files: [, 'app/scripts/controllers/mainPageControllers/dynamicDataTableCtrl.js']
            //              })
            //          }
            //      }
            //  })
            //  .state('dashboard.GridManager', {
            //      url: '/GridManager',
            //      templateUrl: 'app/views/setupSettings/gridManager.html',
            //      controller: 'GridManagerController',
            //      resolve: {
            //          loadMyDirectives: function ($ocLazyLoad) {
            //              return $ocLazyLoad.load({
            //                  name: 'posBOApp', files: [
            //                      'app/scripts/controllers/gridControllers/gridManagerController.js',
            //                      'app/scripts/services/gridInitiallizationService.js',
            //                      'app/scripts/directives/directives.js',
            //                      'app/scripts/factories/variousModelsFactory.js'
            //                  ]
            //              })
            //          }
            //      }
            //})

            .state('dashboard.SetupInvoiceTypes', {
                url: '/SetupInvoiceTypes',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'InvoiceTypes'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js', ,]
                        })
                    }
                }
            })
            .state('dashboard.test', {
                url: '/test',
                templateUrl: 'app/views/test.html',
                controller: 'testController',
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [
                                'app/scripts/controllers/testController.js',
                                'app/scripts/services/gridInitiallizationService.js',
                            ]
                        })
                    }
                }
            })

            .state('dashboard.PosModules', {
                url: '/PosModules',
                templateUrl: 'app/views/setupSettings/PosModules.html',
                controller: ('PosModulesCtrl', ['$scope', function ($scope) { $scope.masterEntityIdentifier = 'PosInfo'; $scope.slaveEntityIdentifier = 'PosInfoDetail'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/mainPageControllers/posModulesController.js', 'app/scripts/directives/views-directives/pos-modules/manage-forms.js',]
                        })
                    }
                }
            })
            //End of development States

            .state('dashboard.home', {
                url: '/home',
                templateUrl: 'app/views/pages/home.html',
                controller: 'MainCtrl',
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/main.js']
                        })
                    }
                }
            })

            .state('dashboard.SetupTables', {
                url: '/SetupTables',
                templateUrl: 'app/views/setupSettings/SetupTables.html',
                controller: 'TablesController',
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [
                                'app/scripts/controllers/mainPageControllers/tablesApiServiceController.js',
                                'app/scripts/services/gridInitiallizationService.js',
                                'app/scripts/directives/directives.js',
                                'app/scripts/directives/views-directives/tables-directives.js',
                                'app/scripts/factories/tablesFactory.js',
                                'Scripts/CustomScripts/multiple-selection.js'
                            ]
                        })
                    }
                }
            })
            .state('dashboard.SetupPages', {
                url: '/SetupPages',
                templateUrl: 'app/views/setupSettings/SetupPages.html',
                controller: 'PagesController',
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [
                                'app/scripts/controllers/gridControllers/pagesApiServiceController.js',
                                'app/scripts/services/gridInitiallizationService.js',
                                'app/scripts/directives/directives.js',
                                //'app/scripts/directives/downloaded-directives/format.js',
                                'Scripts/CustomScripts/multiple-selection.js'
                            ]
                        })
                    }
                }
            })
            .state('dashboard.SetupBoardMeals', {
                url: '/SetupBoardMeals',
                templateUrl: 'app/views/setupSettings/BoardMeals.html',
                controller: ('BoardMealsController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Product'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: ['app/scripts/controllers/mainPageControllers/boardMealsController.js',]
                        })
                    }
                }
            })


            .state('dashboard.SetupProductPrices', {
                url: '/SetupProductPrices',
                templateUrl: 'app/views/setupSettings/SetupProductPrices.html',
                controller: ('ProductsPricesController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Product'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/gridControllers/productPricesApiServiceController.js', 'app/scripts/services/gridInitiallizationService.js', 'app/scripts/directives/directives.js']
                        })
                    }
                }
            })
            .state('dashboard.SetupIngredientPrices', {
                url: '/SetupIngredientPrices',
                templateUrl: 'app/views/setupSettings/SetupProductPrices.html',
                controller: ('ProductsPricesController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Ingredient'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/gridControllers/productPricesApiServiceController.js', 'app/scripts/services/gridInitiallizationService.js', 'app/scripts/directives/directives.js']
                        })
                    }
                }
            })
            .state('dashboard.SetupProducts', {
                url: '/SetupProducts',
                templateUrl: 'app/views/setupSettings/SetupProducts.html',
                controller: 'ProductsServiceController',
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/gridControllers/productsApiServiceController.js', 'app/scripts/services/gridInitiallizationService.js', 'app/scripts/directives/directives.js']
                        })
                    }
                }
            })
            .state('dashboard.SetupIngredientAssocs', {
                url: '/SetupIngredientAssocs',
                templateUrl: 'app/views/setupSettings/SetupIngredientAssocs.html',
                controller: 'IngredientAssocsServiceController',
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/gridControllers/ingredientAssocsApiServiceController.js', 'app/scripts/directives/views-directives/ingredient-assoc-modules/ingredient-assoc-directives.js']
                        })
                    }
                }
            })

            .state('dashboard.SetupDeparments', {
                url: '/SetupDeparments',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Department'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js']
                        })
                    }
                }
            })
            .state('dashboard.SetupDeparmentsMapping', {
                url: '/SetupDeparmentsMapping',
                templateUrl: 'app/views/setupSettings/SetupDeparments.html',
                controller: 'DeparmentsServiceController',
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/gridControllers/deparmentsApiServiceController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })

            .state('dashboard.SetupModules', {
                url: '/SetupModules',
                templateUrl: 'app/views/setupSettings/SetupMasterSlaveGridView.html',
                controller: ('MasterSlaveGridController', ['$scope', function ($scope) { $scope.masterEntityIdentifier = 'PosInfo'; $scope.slaveEntityIdentifier = 'PosInfoDetail'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/gridControllers/masterSlaveGridController.js', 'app/scripts/services/gridInitiallizationService.js']
                        })
                    }
                }
            })
            .state('dashboard.SetupModulesAssocs', {
                url: '/SetupModulesAssocs',
                templateUrl: 'app/views/setupSettings/PosInfoAssocs.html',
                controller: ('PosInfoAssocsController', ['$scope', function ($scope) { }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: ['app/scripts/controllers/mainPageControllers/posInfoAssocsController.js',]
                        })
                    }
                }
            })
            //invoices

            .state('dashboard.SetupInvoiceVat', {
                url: '/SetupInvoiceVat',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Vat'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }

            })
            .state('dashboard.SetupInvoiceTax', {
                url: '/SetupInvoiceTax',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Tax'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }

            }).state('dashboard.SetupPricelistMaster', {
                url: '/SetupPricelistMaster',
                templateUrl: 'app/views/setupSettings/SetupPricelistMasterView.html',
                controller: ('PricelistMasterController', ['$scope', function ($scope) { $scope.entityIdentifier = 'PricelistMaster'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/pricelistMasterController.js',]
                        })
                    }
                }
            })
            .state('dashboard.SetupPricelist', {
                url: '/SetupPricelist',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Pricelist'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            }).state('dashboard.SetupPosInfoDetailPricelistAssoc', {
                url: '/SetupPosInfoDetailPricelistAssoc',
                templateUrl: 'app/views/setupSettings/SetupExcludedAssocs.html',
                controller: ('ExcludedMappingCtrl', ['$scope', function ($scope) {
                    $scope.entityIdentifier = 'Excluded Pricelists';
                    $scope.transferListMastergroup = 'PosInfoId'; //group results by mastergroup Entity
                    $scope.transferListSecondGroup = 'GroupId'; //group results by mastergroup Entity

                    $scope.transferListEntity = 'PriceList';//
                    $scope.transferListField = 'PricelistId';
                    $scope.transferListController = 'ExcludedPricelists';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/mainPageControllers/excludedMappingController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            }).state('dashboard.SetupExcludedAccounts', {
                url: '/SetupExcludedAccounts',
                templateUrl: 'app/views/setupSettings/SetupExcludedAssocs.html',
                controller: ('ExcludedMappingCtrl', ['$scope', function ($scope) {
                    $scope.entityIdentifier = 'Excluded Accounts';
                    $scope.transferListMastergroup = 'PosInfoId'; //group results by mastergroup Entity
                    $scope.transferListSecondGroup = 'GroupId'; //group results by mastergroup Entity

                    $scope.transferListEntity = 'Accounts';//
                    $scope.transferListField = 'AccountId';
                    $scope.transferListController = 'ExcludedAcounts';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/mainPageControllers/excludedMappingController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })
            //Transactions
            .state('dashboard.SetupStaff', {
                url: '/SetupStaff',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Staff'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [
                                'app/scripts/controllers/gridControllers/singleGridController.js',
                                'app/scripts/services/gridInitiallizationService.js',
                            ]
                        })
                    }
                }
            })

            .state('dashboard.SetupAccounts', {
                url: '/SetupAccounts',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Accounts'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })

            .state('dashboard.SetupAccountMapping', {
                url: '/SetupAccountMapping',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'AccountMapping'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })
            .state('dashboard.SetupTransactionTypes', {
                url: '/SetupTransactionTypes',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'TransactionTypes'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }

            })
            .state('dashboard.SetupSuppliers', {
                url: '/SetupSuppliers',
                templateUrl: 'app/views/Suppliers/suppliersView.html',
                controller: ('SuppliersCtrl', ['$scope', function ($scope) {
                    $scope.entityIdentifier = 'Suppliers';
                }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [
                                'app/scripts/controllers/mainPageControllers/suppliersController.js',
                                'app/scripts/components/Suppliers/suppliers-comp.js',
                                'app/scripts/factories/suppliers-factory.js'
                            ]
                        })
                    }
                }
            })
            .state('dashboard.SetupDiscount', {
                url: '/SetupDiscount',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Discount'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }

            })
            .state('dashboard.SetupPredefinedCredits', {
                url: '/SetupPredefinedCredits',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'PredefinedCredits'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }

            })
            //staff
            .state('dashboard.StaffPositions', {
                url: '/StaffPositions',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'StaffPosition'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })
            .state('dashboard.AuthGroupActions', {
                url: '/AuthGroupActions',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'AuthorizedGroupDetail'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })
            .state('dashboard.SetupAuthorizedGroup', {
                url: '/StaffAuthorizedGroup',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'AuthorizedGroup'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })
            //Setup Settings / Sales
            .state('dashboard.SetupClientPos', {
                url: '/ClientPos',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'ClientPos'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })

            .state('dashboard.SetupPdaModules', {
                url: '/PdaModules', templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'PdaModule'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })
            .state('dashboard.SetupKitchen', {
                url: '/Kitchen', templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Kitchen'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            }).state('dashboard.SetupKitchenRegion', {
                url: '/KitchenRegion',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'KitchenRegion'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })
            .state('dashboard.SetupKitchenInstructions', {
                url: '/KitchenInstruction', templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'KitchenInstruction'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            }).state('dashboard.SetupKds', {
                url: '/Kds', templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Kds'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            }).state('dashboard.SetupSalesType', {
                url: '/SalesType', templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'SalesType'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            }).state('dashboard.SetupUnits', {
                url: '/Units', templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Units'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            }).state('dashboard.SetupCategories', {
                url: '/Categories', templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Categories'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp',
                            files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',
                                ,]
                        })
                    }
                }
            }).state('dashboard.SetupItems', {
                url: '/Items', templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'Items'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            }).state('dashboard.SetupProductCategories', {
                //ConfigurationSettings/Products
                url: '/ProductCategories',
                templateUrl: 'app/views/setupSettings/SetupSingleGridView.html',
                controller: ('SingleGridController', ['$scope', function ($scope) { $scope.entityIdentifier = 'ProductCategories'; }]),
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })


            .state('login', {
                templateUrl: 'app/views/pages/login.html',
                url: '/login',
                controller: 'loginController',
                resolve: {
                    loadMyFile: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({ name: 'posBOApp', files: ['app/scripts/controllers/loginController.js'] })
                        //$ocLazyLoad.load({ name: 'loginController.js', }),
                    }
                }
            }).state('dashboard.notFound', {
                templateUrl: 'app/views/pages/blank.html',
                url: '/NotFound',
                controller: 'loginController',
                resolve: {
                    loadMyDirectives: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'posBOApp', files: [, 'app/scripts/controllers/gridControllers/singleGridController.js', 'app/scripts/services/gridInitiallizationService.js',]
                        })
                    }
                }
            })
    })
    //Default path as Constant to Communicate with WebAPI 
    //.run([function () { console.log('Now I am running'); }])
    .run(["$rootScope", "$templateCache", "$location", "$state", "auth", function ($rootScope, $templateCache, $location, $state, auth) {
        $rootScope.isLoggedIn = auth.isLoggedIn();
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.stateName = null;
            //clear cache
            //https://stackoverflow.com/questions/36985240/how-to-clear-the-cache-in-angularjs
            //$templateCache.removeAll();
            if (($rootScope.isLoggedIn == undefined || $rootScope.isLoggedIn == false) && toState.name != 'login') {
                event.preventDefault();
                return $state.go('login');
            }
            if ($rootScope.isLoggedIn == true && toState.name == undefined) {
                event.preventDefault();
                return $state.go('dashboard.notFound');
            }
            if (toState.name == 'dashboard') {
                event.preventDefault();
                return $state.go('dashboard.home');
            }
            return;
        });
    }]);




//.state('dashboard.form', { templateUrl: 'app/views/form.html', url: '/form'})
//.state('dashboard.blank', {templateUrl: 'app/views/pages/blank.html',url: '/blank'})
//.state('dashboard.chart', {templateUrl: 'app/views/chart.html', url: '/chart',controller: 'ChartCtrl', resolve: {
//        loadMyFile: function ($ocLazyLoad) { 
//            return $ocLazyLoad.load({ name: 'chart.js', files: ['Scripts/plugins/angular-chart/angular-chart.min.js','Scripts/plugins/angular-chart/angular-chart.css'] }),
//            $ocLazyLoad.load({ name: 'posBOApp', files: ['app/scripts/controllers/chartContoller.js'] })
//        }
//    }
//})
//.state('dashboard.table', {templateUrl: 'app/views/table.html',url: '/table'})
//.state('dashboard.panels-wells', {templateUrl: 'app/views/ui-elements/panels-wells.html',url: '/panels-wells'})
//.state('dashboard.buttons', {templateUrl: 'app/views/ui-elements/buttons.html',url: '/buttons'})
//.state('dashboard.notifications', {templateUrl: 'app/views/ui-elements/notifications.html',url: '/notifications'})
//.state('dashboard.typography', {templateUrl: 'app/views/ui-elements/typography.html',url: '/typography'})
//.state('dashboard.icons', {templateUrl: 'app/views/ui-elements/icons.html',url: '/icons'})
//.state('dashboard.grid', {templateUrl: 'app/views/ui-elements/grid.html',url: '/grid'})