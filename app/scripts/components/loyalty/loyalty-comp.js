angular.module('posBOApp')
    .component('loyaltyComp', {
        templateUrl: 'app/scripts/components/loyalty/templates/loyalty-comp.html',
        controller: 'LoyaltyCompCTRL',
        controllerAs: 'LoyaltyMain'
    })
    .directive('modal', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{ title }}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;

                scope.$watch(attrs.visible, function (value) {
                    if (value == true)
                        $(element).modal('show');
                    else
                        $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    })
    .controller('LoyaltyCompCTRL', ['$scope', '$mdDialog', 'loyalFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', '$mdDialog', '$mdMedia', function ($scope, $mdDialog, loyalFactory, dataUtilFactory, tosterFactory, DynamicApiService, $mdDialog, $mdMedia) {
        var LoyaltyMain = this;
        var dtu = dataUtilFactory;
        LoyaltyMain.restbusy = false; LoyaltyMain.hasError = false;
        LoyaltyMain.$onInit = function () { };

        LoyaltyMain.initView = function () {
            LoyaltyMain.LoyaltyData = [];
            LoyaltyMain.LoyaltyConfig = [];
            LoyaltyMain.LoyalGainRange = [];
            LoyaltyMain.LoyalGainRatio = [];
            LoyaltyMain.LoyalRedeemDiscount = [];
            LoyaltyMain.LoyalRedeemFreeProduct = [];
            LoyaltyMain.GetLoyaltyData();
        };

        $scope.showModal = false;
        $scope.showModalFreeProducts = false;
        $scope.showModalGainPointsRange = false;
        $scope.showModalFreeProductsRow = false;

        $scope.openGainPointsRangeRow = function (row) {
            $scope.rangeRow = row;
            $scope.showModalGainPointsRange = !$scope.showModalGainPointsRange;
        };
        $scope.cancelGainPointsRange = function () {
            $scope.showModalGainPointsRange = !$scope.showModalGainPointsRange;
        };

        $scope.openDialogGainPointsRange = function () {
            $scope.showModal = !$scope.showModal;
        };
        $scope.cancel = function () {
            $scope.showModal = !$scope.showModal;
        };

        $scope.openDialogFreeProductsRow = function (row) {
            $scope.productRow = row;
            $scope.showModalFreeProductsRow = !$scope.showModalFreeProductsRow;
        };
        $scope.cancelFreeProductsRow = function () {
            $scope.showModalFreeProductsRow = !$scope.showModalFreeProductsRow;
        };

        $scope.openDialogFreeProducts = function () {
            $scope.showModalFreeProducts = !$scope.showModalFreeProducts;
        };
        $scope.cancel2 = function () {
            $scope.showModalFreeProducts = !$scope.showModalFreeProducts;
        };

        //API CALL rest to Get Loyalty Config
        LoyaltyMain.GetLoyaltyData = function () {
            var url = loyalFactory.apiInterface.Loyalty.GET.GetLoyaltyConfig;
            DynamicApiService.getDAV3('Loyalty', url).then(function (resultLoyal) {
                tosterFactory.showCustomToast('Loyalty Data Loaded', 'success');
                LoyaltyMain.LoyaltyData = resultLoyal.data;
                if (resultLoyal.data.LoyalConfigModel.GainPointsType == 0) {
                    resultLoyal.data.LoyalConfigModel.GainPointsTypeDescr = "Amount Range";
                }
                if (resultLoyal.data.LoyalConfigModel.GainPointsType == 1) {
                    resultLoyal.data.LoyalConfigModel.GainPointsTypeDescr = "Amount Ratio";
                }
                if (resultLoyal.data.LoyalConfigModel.RedeemType == 0) {
                    resultLoyal.data.LoyalConfigModel.RedeemTypeDescr = "Free Product";
                }
                if (resultLoyal.data.LoyalConfigModel.RedeemType == 1) {
                    resultLoyal.data.LoyalConfigModel.RedeemTypeDescr = "Discount";
                }
                if (resultLoyal.data.LoyalConfigModel.RedeemType == 2) {
                    resultLoyal.data.LoyalConfigModel.RedeemTypeDescr = "Both";
                }
                LoyaltyMain.LoyaltyConfig = resultLoyal.data.LoyalConfigModel;
                LoyaltyMain.LoyalGainRange = resultLoyal.data.LoyalGainAmountRangeModel;
                LoyaltyMain.LoyalGainRatio = resultLoyal.data.LoyalGainAmountRatioModel;
                LoyaltyMain.LoyalRedeemDiscount = resultLoyal.data.LoyalRedeemDiscountModel;
                LoyaltyMain.LoyalRedeemFreeProduct = resultLoyal.data.LoyalRedeemFreeProductModel;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loyalty Data failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                LoyaltyMain.LoyaltyData = [];
                LoyaltyMain.LoyaltyConfig = [];
                LoyaltyMain.LoyalGainRange = [];
                LoyaltyMain.LoyalGainRatio = [];
                LoyaltyMain.LoyalRedeemDiscount = [];
                LoyaltyMain.LoyalRedeemFreeProduct = [];
            }).finally(function () {
            });
        }

        //Edit or Insert Loyalty Config
        $scope.editLoyalty = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'loyalty') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'loyalty',
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
                    if (actionname.action == 'edit') {
                        LoyaltyMain.LoyaltyData.LoyalConfigModel = retdata;
                        var url = loyalFactory.apiInterface.Loyalty.POST.SetLoyaltyConfig;
                        DynamicApiService.postDAV3('Loyalty', url, LoyaltyMain.LoyaltyData).then(function (resultLoyalty) {
                            tosterFactory.showCustomToast('Loyalty Data Updated', 'success');

                            if (retdata.GainPointsType == 0) {
                                retdata.GainPointsTypeDescr = "Amount Range";
                            }
                            if (retdata.GainPointsType == 1) {
                                retdata.GainPointsTypeDescr = "Amount Ratio";
                            }
                            if (retdata.RedeemType == 0) {
                                retdata.RedeemTypeDescr = "Free Product";
                            }
                            if (retdata.RedeemType == 1) {
                                retdata.RedeemTypeDescr = "Discount";
                            }
                            if (retdata.RedeemType == 2) {
                                retdata.RedeemTypeDescr = "Both";
                            }
                            LoyaltyMain.LoyaltyConfig = retdata;
                        }).catch(function (rejection) {
                            tosterFactory.showCustomToast('Loyalty Data failed to Update', 'fail');
                            console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                            LoyaltyMain.LoyaltyData = [];
                            LoyaltyMain.LoyaltyConfig = [];
                        }).finally(function () {
                        });

                    } else if (actionname.action == 'insert') {
                        LoyaltyMain.LoyaltyData.LoyalConfigModel = retdata;
                        var url = loyalFactory.apiInterface.Loyalty.POST.SetLoyaltyConfig;
                        DynamicApiService.postDAV3('Loyalty', url, LoyaltyMain.LoyaltyData).then(function (resultLoyalty) {
                            tosterFactory.showCustomToast('Loyalty Data Updated', 'success');
                            if (retdata.GainPointsType == 0) {
                                retdata.GainPointsTypeDescr = "Amount Range";
                            }
                            if (retdata.GainPointsType == 1) {
                                retdata.GainPointsTypeDescr = "Amount Ratio";
                            }
                            if (retdata.RedeemType == 0) {
                                retdata.RedeemTypeDescr = "Free Product";
                            }
                            if (retdata.RedeemType == 1) {
                                retdata.RedeemTypeDescr = "Discount";
                            }
                            if (retdata.RedeemType == 2) {
                                retdata.RedeemTypeDescr = "Both";
                            }
                            LoyaltyMain.LoyaltyConfig = retdata;
                        }).catch(function (rejection) {
                            tosterFactory.showCustomToast('Loyalty Data failed to Update', 'fail');
                            console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                            LoyaltyMain.LoyaltyData = [];
                            LoyaltyMain.LoyaltyConfig = [];
                        }).finally(function () {
                        });
                    }
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        //Insert Loyalty Gain Points Range
        $scope.editLoyaltyGainRange = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'loyaltyGainPointsRange') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'loyaltyGainPointsRange',
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
                    //LoyaltyMain.LoyaltyData.LoyalGainAmountRangeModel.push(retdata);
                    var url = loyalFactory.apiInterface.Loyalty.POST.InsertGainAmountRange;
                    DynamicApiService.postDAV3('Loyalty', url, retdata).then(function (resultLoyalty) {
                        tosterFactory.showCustomToast('Loyalty Data Updated', 'success');

                        var url = loyalFactory.apiInterface.Loyalty.GET.GetLoyaltyConfig;
                        DynamicApiService.getDAV3('Loyalty', url).then(function (finalResult) {
                            LoyaltyMain.LoyalGainRange = finalResult.data.LoyalGainAmountRangeModel;
                            LoyaltyMain.LoyaltyData.LoyalGainAmountRangeModel = finalResult.data.LoyalGainAmountRangeModel;
                        }).catch(function (rejection) {
                            LoyaltyMain.LoyaltyData = [];
                            LoyaltyMain.LoyalGainRange = [];
                        }).finally(function () {
                        });

                        LoyaltyMain.LoyalGainRange.push(retdata);
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Loyalty Data failed to Update', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                        LoyaltyMain.LoyaltyData = [];
                        LoyaltyMain.LoyalGainRange = [];
                    }).finally(function () {
                    });
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        //Delete Loyalty Gain Points Range Row
        $scope.deleteLoyaltyGainRangeRow = function (row) {
            var url = loyalFactory.apiInterface.Loyalty.POST.DeleteRangeRow;
            DynamicApiService.deleteShortageDAV3('Loyalty', url, row.Id).then(function (resultLoyalty) {
                tosterFactory.showCustomToast('Row Deleted Successfully', 'success');

                $scope.showModalGainPointsRange = !$scope.showModalGainPointsRange;

                var url = loyalFactory.apiInterface.Loyalty.GET.GetLoyaltyConfig;
                DynamicApiService.getDAV3('Loyalty', url).then(function (resultLoyal) {

                    LoyaltyMain.LoyalGainRange = resultLoyal.data.LoyalGainAmountRangeModel;
                    LoyaltyMain.LoyaltyData.LoyalGainAmountRangeModel = resultLoyal.data.LoyalGainAmountRangeModel;
                }).catch(function (rejection) {
                    LoyaltyMain.LoyalGainRange = [];
                }).finally(function () {
                });

            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Delete failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
            }).finally(function () {
            });
        };

        //Delete All Loyalty Gain Points Range
        $scope.deleteLoyaltyGainRange = function () {
            var url = loyalFactory.apiInterface.Loyalty.POST.DeleteGainAmountRange;
            DynamicApiService.postDAV3('Loyalty', url).then(function (resultLoyalty) {
                tosterFactory.showCustomToast('Row Deleted Successfully', 'success');

                $scope.showModal = !$scope.showModal;
                var url = loyalFactory.apiInterface.Loyalty.GET.GetLoyaltyConfig;
                DynamicApiService.getDAV3('Loyalty', url).then(function (resultLoyal) {

                    LoyaltyMain.LoyalGainRange = resultLoyal.data.LoyalGainAmountRangeModel;
                    LoyaltyMain.LoyaltyData.LoyalGainAmountRangeModel = resultLoyal.data.LoyalGainAmountRangeModel;
                }).catch(function (rejection) {
                    LoyaltyMain.LoyalGainRange = [];
                }).finally(function () {
                });

            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Delete failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
            }).finally(function () {
            });
        };

        //Edit Loyalty Gain Points Ratio
        $scope.editLoyaltyGainPointsRatio = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'loyaltyGainPointsRatio') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'loyaltyGainPointsRatio',
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
                    LoyaltyMain.LoyaltyData.LoyalGainAmountRatioModel = retdata;
                    var url = loyalFactory.apiInterface.Loyalty.POST.SetLoyaltyConfig;
                    DynamicApiService.postDAV3('Loyalty', url, LoyaltyMain.LoyaltyData).then(function (resultLoyalty) {
                        tosterFactory.showCustomToast('Loyalty Data Updated', 'success');

                        var url = loyalFactory.apiInterface.Loyalty.GET.GetLoyaltyConfig;
                        DynamicApiService.getDAV3('Loyalty', url).then(function (finalResult) {
                            LoyaltyMain.LoyalGainRatio = finalResult.data.LoyalGainAmountRatioModel;
                            LoyaltyMain.LoyaltyData.LoyalGainAmountRatioModel = finalResult.data.LoyalGainAmountRatioModel;
                            LoyaltyMain.LoyalGainRange = finalResult.data.LoyalGainAmountRangeModel;
                        }).catch(function (rejection) {
                            LoyaltyMain.LoyaltyData = [];
                            LoyaltyMain.LoyalGainRatio = [];
                        }).finally(function () {
                        });

                        LoyaltyMain.LoyalGainRange.push(retdata);
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Loyalty Data failed to Update', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                        LoyaltyMain.LoyaltyData = [];
                        LoyaltyMain.LoyalGainRange = [];
                    }).finally(function () {
                    });
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        //Edit Loyalty Redeem Discount
        $scope.editLoyaltyRedeemDiscount = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'LoyaltyRedeemDiscount') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'LoyaltyRedeemDiscount',
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
                    LoyaltyMain.LoyaltyData.LoyalRedeemDiscountModel = retdata;
                    var url = loyalFactory.apiInterface.Loyalty.POST.SetLoyaltyConfig;
                    DynamicApiService.postDAV3('Loyalty', url, LoyaltyMain.LoyaltyData).then(function (resultLoyalty) {
                        tosterFactory.showCustomToast('Loyalty Data Updated', 'success');

                        var url = loyalFactory.apiInterface.Loyalty.GET.GetLoyaltyConfig;
                        DynamicApiService.getDAV3('Loyalty', url).then(function (finalResult) {
                            LoyaltyMain.LoyalRedeemDiscount = finalResult.data.LoyalRedeemDiscountModel;
                            LoyaltyMain.LoyaltyData.LoyalRedeemDiscountModel = finalResult.data.LoyalRedeemDiscountModel;
                            LoyaltyMain.LoyalGainRange = finalResult.data.LoyalGainAmountRangeModel;
                        }).catch(function (rejection) {
                            LoyaltyMain.LoyaltyData = [];
                            LoyaltyMain.LoyalRedeemDiscount = [];
                        }).finally(function () {
                        });

                        LoyaltyMain.LoyalGainRange.push(retdata);
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Loyalty Data failed to Update', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                        LoyaltyMain.LoyaltyData = [];
                        LoyaltyMain.LoyalRedeemDiscount = [];
                    }).finally(function () {
                    });
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        //Insert Loyalty Free Products
        $scope.editLoyaltyRedeemFreeProducts = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var url = loyalFactory.apiInterface.Loyalty.GET.GetProducts;
            DynamicApiService.getV3('Product', url).then(function (resultProducts) {
                $scope.filtersObjArray = resultProducts;
                var url = loyalFactory.apiInterface.Loyalty.GET.GetProductCategories;
                DynamicApiService.getV3('ProductCategories', url).then(function (resultProductCategories) {
                    $scope.filtersObjArray2 = resultProductCategories;

                    var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, dropDownObject2: $scope.filtersObjArray2, title: 'Managing ' + type };
                    var dataEntry = {};
                    if (action == 'edit' && data !== undefined && data !== null) {
                        formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                        dataEntry = angular.copy(data);
                    }
                    if (type == 'loyaltyRedeemFreeProducts') {
                        $scope.uploadModel = {
                            controllerName: 'Upload',
                            actionName: 'loyaltyRedeemFreeProducts',
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
                            //LoyaltyMain.LoyaltyData.LoyalGainAmountRangeModel.push(retdata);
                            var url = loyalFactory.apiInterface.Loyalty.POST.InsertRedeemFreeProduct;
                            DynamicApiService.postDAV3('Loyalty', url, retdata).then(function (resultLoyalty) {
                                tosterFactory.showCustomToast('Loyalty Data Updated', 'success');

                                var url = loyalFactory.apiInterface.Loyalty.GET.GetLoyaltyConfig;
                                DynamicApiService.getDAV3('Loyalty', url).then(function (finalResult) {
                                    LoyaltyMain.LoyalRedeemFreeProduct = finalResult.data.LoyalRedeemFreeProductModel;
                                    LoyaltyMain.LoyaltyData.LoyalRedeemFreeProductModel = finalResult.data.LoyalRedeemFreeProductModel;
                                    LoyaltyMain.LoyalGainRange = finalResult.data.LoyalGainAmountRangeModel;
                                }).catch(function (rejection) {
                                    LoyaltyMain.LoyaltyData = [];
                                    LoyaltyMain.LoyalRedeemFreeProduct = [];
                                }).finally(function () {
                                });

                                LoyaltyMain.LoyalGainRange.push(retdata);
                            }).catch(function (rejection) {
                                tosterFactory.showCustomToast('Loyalty Data failed to Update', 'fail');
                                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                                LoyaltyMain.LoyaltyData = [];
                                LoyaltyMain.LoyalGainRange = [];
                            }).finally(function () {
                            });
                        }, function () { });
                    $scope.$watch(function () {
                        return $mdMedia('xs') || $mdMedia('sm');
                    }, function (wantsFullScreen) {
                        $scope.customFullscreen = (wantsFullScreen === true);
                    });
                }).catch(function (rejection) {
                    console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                }).finally(function () {
                    });

                }).catch(function (rejection) {
                    console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                }).finally(function () {
                });
        };

        //Delete Loyalty Free Products Row
        $scope.deleteLoyaltyFreeProductsRow = function (row) {
            var url = loyalFactory.apiInterface.Loyalty.POST.DeleteRedeemFreeProductRow;
            DynamicApiService.deleteShortageDAV3('Loyalty', url, row.Id).then(function (resultLoyalty) {
                tosterFactory.showCustomToast('Row Deleted Successfully', 'success');

                $scope.showModalFreeProductsRow = !$scope.showModalFreeProductsRow;

                var url = loyalFactory.apiInterface.Loyalty.GET.GetLoyaltyConfig;
                DynamicApiService.getDAV3('Loyalty', url).then(function (resultLoyal) {

                    LoyaltyMain.LoyalRedeemFreeProduct = resultLoyal.data.LoyalRedeemFreeProductModel;
                    LoyaltyMain.LoyaltyData.LoyalRedeemFreeProductModel = resultLoyal.data.LoyalRedeemFreeProductModel;
                }).catch(function (rejection) {
                    LoyaltyMain.LoyalRedeemFreeProduct = [];
                }).finally(function () {
                });

            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Delete failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
            }).finally(function () {
            });
        };

        //Delete All Loyalty Free Products
        $scope.deleteLoyaltyFreeProducts = function () {
            var url = loyalFactory.apiInterface.Loyalty.POST.DeleteRedeemFreeProduct;
            DynamicApiService.postDAV3('Loyalty', url).then(function (resultLoyalty) {
                tosterFactory.showCustomToast('Row Deleted Successfully', 'success');

                $scope.showModalFreeProducts = !$scope.showModalFreeProducts;
                var url = loyalFactory.apiInterface.Loyalty.GET.GetLoyaltyConfig;
                DynamicApiService.getDAV3('Loyalty', url).then(function (resultLoyal) {

                    LoyaltyMain.LoyalRedeemFreeProduct = resultLoyal.data.LoyalRedeemFreeProductModel;
                    LoyaltyMain.LoyaltyData.LoyalRedeemFreeProductModel = resultLoyal.data.LoyalRedeemFreeProductModel;
                }).catch(function (rejection) {
                    LoyaltyMain.LoyalRedeemFreeProduct = [];
                }).finally(function () {
                });

            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Delete failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
            }).finally(function () {
            });
        };

    }]);
