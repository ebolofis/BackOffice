/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />
angular.module('posBOApp')
    .component('promotions', {
        templateUrl: 'app/scripts/components/Promotions/templates/ManagePromotions.html',
        controller: 'PromotionsMainCTRL',
        controllerAs: 'PromotionsMain'
    })
    .controller('PromotionsMainCTRL', ['$scope', '$mdDialog', '$mdMedia', 'managepromosFactory', 'dataUtilFactory', 'tosterFactory', '$q', 'DynamicApiService', function ($scope, $mdDialog, $mdMedia, managepromosFactory, dataUtilFactory, tosterFactory, $q, DynamicApiService) {
        var PromotionsMain = this;
        var dtu = dataUtilFactory;
        PromotionsMain.restbusy = false; PromotionsMain.hasError = false;
        PromotionsMain.$onInit = function () { };

        PromotionsMain.initView = function () {
            PromotionsMain.promos = [];
            PromotionsMain.promosdetails = [];
            PromotionsMain.promoscombos = [];
            PromotionsMain.promosdiscounts = [];
            PromotionsMain.promosPricelists = [];
            PromotionsMain.promotionsLookUps = [];
            PromotionsMain.GetPromos();
            PromotionsMain.GetPromosPricelists();
        };

        $scope.searchText = '';

        // Get All Promotion Pricelists
        PromotionsMain.GetPromosPricelists = function () {
            var url = managepromosFactory.apiInterface.Promotions.GET.GetPromoPriceLists;
            DynamicApiService.getV3('Promotions', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Pricelists Loaded', 'success');
                    PromotionsMain.promosPricelists = result.data;
                } else {
                    tosterFactory.showCustomToast('No Pricelists Loaded', 'success');
                    PromotionsMain.promos = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Pricelists failed', 'fail');
            }).finally(function () {
            });
        }

        //Add Pricelisti to Pricelist Array
        PromotionsMain.addSelectedPricelist = function (pricelist) {
            var myobj = JSON.parse(pricelist);
            var pricelistId = myobj.Key;
            var pricelistDescr = myobj.Value;
            var checkForDublicate = false;
            angular.forEach(PromotionsMain.promosPricelists, function (value) {
                if (value.PricelistId == pricelistId) {
                    checkForDublicate = true;
                }
            });
            if (checkForDublicate == false) {
                PromotionsMain.promosPricelists.push({ PricelistId: pricelistId, PricelistDescr: pricelistDescr });
            }
            else {
                toastr.warning("Selected Pricelist Already Exist")
            }
        };

        //Remove Pricelist for Pricelists Array
        PromotionsMain.removePricelist = function (pricelist) {
            var index = PromotionsMain.promosPricelists.map(x => {
                return x.Id;
            }).indexOf(pricelist.Id);
            PromotionsMain.promosPricelists.splice(index, 1);
        };

        //############################# Save All Pricelist changes ###################################//
        //############################################################################################//
        PromotionsMain.SavePricelists = function () {
            PromotionsMain.restbusy = true;
            var finalModel = PromotionsMain.promosPricelists;
            var url = managepromosFactory.apiInterface.Promotions.POST.UpsertPromotionPricelists;
            DynamicApiService.postV3('Promotions', url, finalModel).then(function (result) {
                tosterFactory.showCustomToast('Pricelist Save Successfully', 'success');
                PromotionsMain.promosPricelists = result.data;
            }).catch(function (rejection) {
                toastr.error('Save Changes Failed', 'fail');
                $scope.savingProcess = false;
                }).finally(function () {
                    PromotionsMain.restbusy = false;
            });
        };

        $scope.GetPricelistLookup = function () {
            //GetSetupProductCatLookUps
            var nameType = 'SetupPricelist';
            DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { 
                $scope.filtersObjArray = result.data.LookUpEntities;
                //GetDiscountTypeLookup
                var nameType = 'SetupPromoDiscountType';
                DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    $scope.filtersObjArray["DiscountType"] = result.data.LookUpEntities.DiscountType;
                    PromotionsMain.promotionsLookUps = $scope.filtersObjArray;
                    return result;
                }).catch(function (rejection) {
                    tosterFactory.showCustomToast('Loading Discount Type Lookups failed', 'fail');
                    console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection);
                    return null;
                })
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Lookups failed', 'fail');
                return null;
            })
        };

        $scope.GetPricelistLookup();
        $scope.cancel = function () { $mdDialog.cancel(); };

        var DiscountTypeModel = { entityIdentifier: 'SetupPromoDiscountType', dropDownObject: $scope.filtersObjArray, title: 'Managing ' + 'SetupPromoDiscountType' };
        // add Promotion Header
        $scope.addPromotion = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};

            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'Promotions') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'Promotions',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
            //variable to handle 3 entities and 2 modes of edit and add
            var actionname = {
                type: type,
                action: action
            };
            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
            })
                .then(function (retdata) {
                    //Add api/Headers
                    //retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    var url = managepromosFactory.apiInterface.Promotions.POST.InsertPromotion;
              
                    DynamicApiService.postV3('Promotions', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {

                            //Reload Stores in order to refresh page
                            var url = managepromosFactory.apiInterface.Promotions.GET.GetPromos;
                            DynamicApiService.getV3('Promotions', url).then(function (result) {
                                if (result != null && result.data != null) {
                                    PromotionsMain.promos = result.data;
                                } else {
                                    PromotionsMain.promos = [];
                                }
                            }).catch(function (rejection) {
                                PromotionsMain.promos = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Header Promotion Inserted', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Header Promotion Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Inserting Header Promotion failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };


        //Edit Promotion Headers 
        $scope.editPromotion = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'Promotions') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'Promotions',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
            //variable to handle 3 entities and 2 modes of edit and add
            var actionname = {
                type: type,
                action: action
            };
            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
            })
                .then(function (retdata) {
                    //Update api/Stores


                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    var url = managepromosFactory.apiInterface.Promotions.POST.UpdatePromotions;
                    DynamicApiService.postV3('Promotions', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            //Reload Stores in order to refresh page
                            var url = managepromosFactory.apiInterface.Promotions.GET.GetPromos;
                            DynamicApiService.getV3('Promotions', url).then(function (result) {
                                if (result != null && result.data != null) {
                                    PromotionsMain.promos = result.data;
                                } else {
                                    PromotionsMain.promos = [];
                                }
                            }).catch(function (rejection) {
                                PromotionsMain.promos = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Promotion Header Updated', 'success');
                        } else {
                            tosterFactory.showCustomToast('Promotion Header was not Updated', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Updating Promotion Header failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };


        $scope.removeHeader = function (row) {
            var url = managepromosFactory.apiInterface.Promotions.POST.DeletePromotion;
            deletedStoreId = row.Id;
            DynamicApiService.DeleteHeader('Promotions', url, deletedStoreId).then(function (result) {
                tosterFactory.showCustomToast('Promotion Header Deleted succesfully', 'success');
                var url = managepromosFactory.apiInterface.Promotions.GET.GetPromos;
                DynamicApiService.getV3('Promotions', url).then(function (result) {
                    if (result != null && result.data != null) {
                        PromotionsMain.promos = result.data;
                    } else {
                        PromotionsMain.promos = [];
                    }
                }).catch(function (rejection) {
                }).finally(function () {
                });

            }, function (reason) {
                tosterFactory.showCustomToast('Store Delete failed', 'fail');
                console.log('Fail update'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Store Delete error', 'error');
                console.log('Error update'); console.log(reason);
            })
        };


        // Get All available DA Stores  PromotionsMain.GetPromos();
        PromotionsMain.GetPromos = function () {
            var url = managepromosFactory.apiInterface.Promotions.GET.GetPromos;
            DynamicApiService.getV3('Promotions', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('All Promos  Loaded', 'success');
                    PromotionsMain.promos = result.data;
                } else {
                    tosterFactory.showCustomToast('No Promos  Loaded', 'success');
                    PromotionsMain.promos = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Promos failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                PromotionsMain.hasError = true; PromotionsMain.promos = [];
                return -1;
            }).finally(function () {
            });
        }

        $scope.viewPromotionDetails = function (data, type) {
            //Get Details From Api
            var details = {};
            var header = {};
            $scope.PromoComboItemIds = [];
            $scope.PromoDiscountsItemIds=[];
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var tempObject = formModel;
            var url = managepromosFactory.apiInterface.Promotions.GET.GetPromotionDetails;
            DynamicApiService.getPromoDetails('Promotions', url, data.Id).then(function (result) {
                if (result != null && result.data != null) {
                    PromotionsMain.promosdetails = result.data;

                    details = angular.copy(result.data);
                    header = angular.copy(data);
                    $mdDialog.show({
                        controller: 'PromotionsDetailsCompCTRL',
                        templateUrl: '../app/scripts/directives/modal-directives/Promotions-manage-details-modal-template.html',
                        parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                        resolve: {
                            details: function () { return details; },
                            header: function () { return header; },
                            formModel: function () {return  formModel;}
                        }
                    }).then(function (data) {
                        if (data != undefined) {
                            proceedCancel(data);
                        }
                    }).catch(function () { });
                } else {
                    PromotionsMain.promosdetails = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Promos Details failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                PromotionsMain.hasError = true; PromotionsMain.promosdetails = [];
                return -1;
            }).finally(function () {
            });
        };

    }])
    .controller('PromotionsDetailsCompCTRL', function ($scope, $mdDialog, $mdMedia, $q, dataUtilFactory, managepromosFactory, details, header, tosterFactory, DynamicApiService) {
        $scope.header = angular.copy(header);
        $scope.details = angular.copy(details);
        if ($scope.details.length == 0) {
            tosterFactory.showCustomToast('There are no Details Results!', 'warning');
        }

        //getProdCategoriesLookups
        $scope.GetProductCategoriesandProductsLookup = function () {
            //GetSetupProductCatLookUps
            var nameType = 'SetupProductandProductCategories';
            DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.filtersObjArray = result.data.LookUpEntities;
                console.log('LookUps loaded'); console.log(result);
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Lookups failed', 'fail');
                console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection);
                return null;
            })
        };
        $scope.GetProductCategoriesandProductsLookup();
        $scope.hide = function () { $mdDialog.hide(); };
        $scope.cancel = function () { $mdDialog.cancel(); };
       

        ////remove Combo
        $scope.DeleteCombo = function (row) {
            var url = managepromosFactory.apiInterface.Promotions.POST.DeleteCombo;
            deletedComboId = row.Id;
            DynamicApiService.DeleteHeader('Promotions', url, deletedComboId).then(function (result) {
                tosterFactory.showCustomToast('Combo Deleted succesfully', 'success');
                var url = managepromosFactory.apiInterface.Promotions.GET.GetPromos;
                DynamicApiService.getV3('Promotions', url).then(function (result) {
                    if (result != null && result.data != null) {
                        $scope.promos = result.data;
                        //$scope.myLoadingFunction();
                    } else {
                        $scope.promos = [];
                    }
                }).catch(function (rejection) {
                }).finally(function () {
                });
            }, function (reason) {
                tosterFactory.showCustomToast('Combo Delete failed', 'fail');
                console.log('Fail update'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Combo Delete error', 'error');
                console.log('Error update'); console.log(reason);
            })
        };

        $scope.DeleteDiscount = function (row) {
            var url = managepromosFactory.apiInterface.Promotions.POST.DeleteDiscount;
            deletedDiscountId = row.Id;
            DynamicApiService.DeleteHeader('Promotions', url, deletedDiscountId).then(function (result) {
                tosterFactory.showCustomToast('Discount Deleted succesfully', 'success');
                var url = managepromosFactory.apiInterface.Promotions.GET.GetPromos;
                DynamicApiService.getV3('Promotions', url).then(function (result) {
                    if (result != null && result.data != null) {
                        $scope.promos = result.data;
                    } else {
                        $scope.promos  = [];
                    }
                }).catch(function (rejection) {
                }).finally(function () {
                });
            }, function (reason) {
                tosterFactory.showCustomToast('Discount Delete failed', 'fail');
                console.log('Fail update'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Discount Delete error', 'error');
                console.log('Error update'); console.log(reason);
            })
        };
        //Edit editPromoCombos
        $scope.editPromoCombos = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            var random = data;
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'PromotionCombos') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'PromotionCombos',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
            //variable to handle 3 entities and 2 modes of edit and add
            var actionname = {
                type: type,
                action: action
            };
            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
            })
                .then(function (retdata) {
                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)

                   if (retdata.ItemIsProduct == false) {
                       $scope.ParseItemId = parseFloat(retdata.ItemId1);
                   }
                    else {
                       $scope.ParseItemId = parseFloat(retdata.ItemId);
                    }

                    retdata.ItemId = $scope.ParseItemId;
                    
                    var url = managepromosFactory.apiInterface.Promotions.POST.UpdateCombo;
                    DynamicApiService.postV3('Promotions', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            //Reload Stores in order to refresh page
                            var url = managepromosFactory.apiInterface.Promotions.GET.GetPromos;
                            DynamicApiService.getV3('Promotions', url).then(function (result) {
                                if (result != null && result.data != null) {
                                    $scope.promos = result.data;
                                } else {
                                    $scope.promos = [];
                                }
                            }).catch(function (rejection) {
                                $scope.promos = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Promo Combo Updated', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Promo Combo Updated', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Updating Promo Combo failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        //UpdateDiscount   - editDiscount
        // 
        //
        $scope.editDiscount = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            var random = data;
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'PromotionDiscounts') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'PromotionDiscounts',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
            //variable to handle 3 entities and 2 modes of edit and add
            var actionname = {
                type: type,
                action: action
            };
            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
            })
                .then(function (retdata) {

                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)


                    if (retdata.ItemIsProduct == false) {
                        $scope.ParseItemId = parseFloat(retdata.ItemId1);
                    }
                    else {
                        $scope.ParseItemId = parseFloat(retdata.ItemId);
                    }

                    retdata.ItemId = $scope.ParseItemId;

                    var url = managepromosFactory.apiInterface.Promotions.POST.UpdateDiscount;
                    DynamicApiService.postV3('Promotions', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            //Reload Stores in order to refresh page
                            var url = managepromosFactory.apiInterface.Promotions.GET.GetPromos;
                            DynamicApiService.getV3('Promotions', url).then(function (result) {
                                if (resultDetails != null && resultDetails.data != null) {
                                    $scope.promosdetails = resultDetails.data;
                                } else {
                                    $scope.promosdetails = [];
                                }
                            }).catch(function (rejection) {
                                $scope.promosdetails = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Promo Discount Updated', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Promo Discount Updated', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Updating Promo Discount failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };
        //
        $scope.addComboDetail = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
                dataEntry.HeaderId = data.Id;
            }
            if (type == 'PromotionCombos') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'PromotionCombos',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
            //variable to handle 3 entities and 2 modes of edit and add
            var actionname = {
                type: type,
                action: action
            };
            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
            })
                .then(function (retdata) {
                   //Added a Product Case

                    if (retdata.ItemId != undefined && retdata.ItemId1 != undefined)
                    {
                        tosterFactory.showCustomToast('Can not select both a Product and a Product Category  ', 'fail');
                        return;
                    }
                    if (retdata.ItemId1 == undefined && retdata.ItemIsProduct == false)
                    {
                            tosterFactory.showCustomToast('Can not add a Product as a Product Category ', 'fail');
                            return;
                    }
                    //Added a Product Category Case
                    if (retdata.ItemId == undefined && retdata.ItemIsProduct == true)
                    {
                            tosterFactory.showCustomToast('Can not add a Product Category as a Product  ', 'fail');
                            return;
                    }
                    if (retdata.ItemIsProduct == false) {
                        $scope.ParseItemId = parseFloat(retdata.ItemId1);
                        }
                    else
                    {
                        $scope.ParseItemId = parseFloat(retdata.ItemId);
                    }
                    var ItemId = $scope.ParseItemId;
                    var HeaderId = retdata.HeaderId;
                    var ItemQuantity = retdata.ItemQuantity;
                    var ItemIsProduct = retdata.ItemIsProduct;
                    var object = { HeaderId: HeaderId, ItemId: ItemId, ItemQuantity: ItemQuantity, ItemIsProduct: ItemIsProduct };
                    retdata.PromoCombo.push(object);
                    retdata.ItemId = ItemId;
                    if (retdata.ItemIsProduct == undefined) {
                        retdata.ItemIsProduct = 0;
                        retdata.ItemId = parseFloat(retdata.ItemId1);
                    }

                    var url = managepromosFactory.apiInterface.Promotions.POST.InsertCombo;
                    DynamicApiService.postV3('Promotions', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {

                            //Reload Details in order to refresh page
                            var url = managepromosFactory.apiInterface.Promotions.GET.GetPromos;
                            DynamicApiService.getV3('Promotions', url).then(function (resultDetails) {
                                if (resultDetails != null && resultDetails.data != null) {
                                    $scope.promos = resultDetails.data;
                                } else {
                                    $scope.promos = [];
                                }
                            }).catch(function (rejection) {
                                $scope.promos = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Detail Inserted', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Detail Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Inserting Detail failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        $scope.addPromoDiscount = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
                dataEntry.HeaderId = data.Id;
            }
            if (type == 'PromotionDiscounts') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'PromotionDiscounts',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
            //variable to handle 3 entities and 2 modes of edit and add
            var actionname = {
                type: type,
                action: action
            };
            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
            })
                .then(function (retdata) {
                    //retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    if (retdata.ItemId != undefined && retdata.ItemId1 != undefined) {
                        tosterFactory.showCustomToast('Can not select both a Product and a Product Category  ', 'fail');
                        return;
                    }
                    if (retdata.ItemId1 == undefined && retdata.ItemIsProduct == false) {
                        tosterFactory.showCustomToast('Can not add a Product as a Product Category ', 'fail');
                        return;
                    }
                    //Added a Product Category Case
                    if (retdata.ItemId == undefined && retdata.ItemIsProduct == true) {
                        tosterFactory.showCustomToast('Can not add a Product Category as a Product  ', 'fail');
                        return;
                    }
                    if (retdata.ItemIsProduct == false) {
                        $scope.ParseItemId = parseFloat(retdata.ItemId1);
                    }
                    else {
                        $scope.ParseItemId = parseFloat(retdata.ItemId);
                    }

                    $scope.ValidItemFlag = false;
                 
                    var ItemId = $scope.ParseItemId;
                    $scope.CheckItemId = ItemId;
                    if (retdata.ItemIsProduct == undefined) {
                        $scope.CheckItemId = parseFloat(retdata.ItemId1);
                    }
                
                    var promoComboItemIds = $scope.details.PromoCombo;

                    angular.forEach(promoComboItemIds, function (combo ) {
                        if (combo.ItemId == $scope.CheckItemId)
                            $scope.ValidItemFlag = true;
                    })

                    if ($scope.ValidItemFlag == false) {
                        tosterFactory.showCustomToast('The ItemId does not exist in the current Promotion Combo', 'fail');
                        return;
                    }
                    var HeaderId = retdata.HeaderId;                   
                    var ItemQuantity = retdata.ItemQuantity;
                    var ItemIsProduct = retdata.ItemIsProduct;
                    var object = { HeaderId: HeaderId, ItemId: ItemId, ItemQuantity: ItemQuantity, ItemIsProduct: ItemIsProduct };
                    retdata.PromoDiscounts.push(object);
                    retdata.ItemId = ItemId;
                    if (retdata.ItemIsProduct == undefined) {
                        retdata.ItemIsProduct = 0;
                        retdata.ItemId = parseFloat(retdata.ItemId1);
                    }
                 
                    var url = managepromosFactory.apiInterface.Promotions.POST.InsertDiscount;
                    DynamicApiService.postV3('Promotions', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {

                            //Reload Details in order to refresh page
                            var url = managepromosFactory.apiInterface.Promotions.GET.GetPromos;
                            DynamicApiService.getV3('Promotions', url).then(function (resultDetails) {
                                if (resultDetails != null && resultDetails.data != null) {
                                    $scope.promos = resultDetails.data;
                                } else {
                                    $scope.promos = [];
                                }
                            }).catch(function (rejection) {
                                $scope.promos = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Detail Inserted', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Detail Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Inserting Detail failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        $scope.hide = function () { $mdDialog.hide(); };
        $scope.cancel = function () { $mdDialog.cancel(); };
        //addHeaderDetail
        $scope.addHeaderDetail = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'Details') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'Details',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
            //variable to handle 3 entities and 2 modes of edit and add
            var actionname = {
                type: type,
                action: action
            };
            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
            })
                .then(function (retdata) {
                    //retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)
                    var url = promosFactory.apiInterface.HeaderDetailsPromos.POST.InsertVodafone11Details;
                    DynamicApiService.postV3('promos', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            //Reload Details in order to refresh page
                            var url = promosFactory.apiInterface.HeaderDetailsPromos.GET.GetVodafone11AllDetails;
                            DynamicApiService.getV3('promos', url).then(function (resultDetails) {
                                if (resultDetails != null && resultDetails.data != null) {
                                    $scope.details = resultDetails.data;
                                } else {
                                    $scope.details = [];
                                }
                            }).catch(function (rejection) {
                                $scope.details = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Detail Inserted', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Detail Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Inserting Detail failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        $scope.init = function () {

        }()
    });
