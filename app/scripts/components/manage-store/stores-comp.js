angular.module('posBOApp')
    .component('storesComp', {
        templateUrl: 'app/scripts/components/manage-store/templates/stores-comp.html',
        controller: 'StoresCompCTRL',
        controllerAs: 'StoreMain'
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
    .controller('StoresCompCTRL', ['$scope', '$mdDialog', 'msFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', '$mdDialog', '$mdMedia', function ($scope, $mdDialog, msFactory, dataUtilFactory, tosterFactory, DynamicApiService, $mdDialog, $mdMedia) {
        var StoreMain = this;
        var dtu = dataUtilFactory;
        StoreMain.restbusy = false; StoreMain.hasError = false;
        StoreMain.$onInit = function () { };

        StoreMain.initView = function () {
            StoreMain.store = [];
            StoreMain.shortages = [];
            StoreMain.polygons = [];
            StoreMain.GetStore();
        };

        $scope.showModal = false;
        $scope.open = function (row) {
            $scope.shortRow = row;
            $scope.showModal = !$scope.showModal;
        };

        //API CALL rest get Store By StaffId
        StoreMain.GetStore = function () {
            var url = msFactory.apiInterface.Stores.GET.GetStoreBystaffId;
            DynamicApiService.getDAV3('Stores', url).then(function (resultStore) {
                if (resultStore != null && resultStore.data != null) {
                    tosterFactory.showCustomToast('Store Loaded', 'success');
                    if (resultStore.data.StoreStatus == 0) {
                        resultStore.data.StoreStatusDescr = "Closed";
                    }
                    else if (resultStore.data.StoreStatus == 1) {
                        resultStore.data.StoreStatusDescr = "Delivery Only";
                    }
                    else if (resultStore.data.StoreStatus == 2) {
                        resultStore.data.StoreStatusDescr = "Take Out Only";
                    }
                    else {
                        resultStore.data.StoreStatusDescr = "Full Operational";
                    }
                    StoreMain.store = resultStore.data;
                    //API CALL rest Get a List of Polygons (Header/details) by StoreId.
                    var url = msFactory.apiInterface.Stores.GET.GetPolygons;
                    DynamicApiService.getDAV3('Polygons', url, resultStore.data.Id).then(function (resultPolygons) {
                        if (resultPolygons != null && resultPolygons.data != null) {
                            tosterFactory.showCustomToast('Polygons Loaded', 'success');
                            StoreMain.polygons = resultPolygons.data;
                            if (typeof google === 'object' && typeof google.maps === 'object') {
                                StoreMain.createMap();
                            }
                            //API CALL rest get Get a List of Shortages for a store based on staffId (a virtual staff assigned to a store). 
                            var url = msFactory.apiInterface.Stores.GET.GetShortagesByStore;
                            DynamicApiService.getDAV3('Shortages', url).then(function (resultShortages) {
                                if (resultShortages != null && resultShortages.data != null) {
                                    tosterFactory.showCustomToast('Shortages Loaded', 'success');
                                    resultShortages.data.forEach(function (details) {
                                        if (details.ShortType == 0) {
                                            StoreMain.shortages.push(details);
                                        }
                                    });
                                    //StoreMain.shortages = resultShortages.data;
                                } else {
                                    tosterFactory.showCustomToast('No Shortages Loaded', 'success');
                                    StoreMain.shortages = [];
                                }
                            }).catch(function (rejection) {
                                tosterFactory.showCustomToast('Loading Shortages failed', 'fail');
                                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                                StoreMain.shortages = [];
                            }).finally(function () {
                            });

                        } else {
                            tosterFactory.showCustomToast('No Polygons Loaded', 'success');
                            StoreMain.polygons = [];
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Loading Polygons failed', 'fail');
                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                        StoreMain.polygons = [];
                    }).finally(function () {
                    });
                } else {
                    tosterFactory.showCustomToast('No Store Loaded', 'success');
                    StoreMain.store = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Store failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                StoreMain.store = [];
            }).finally(function () {
            });
        }

        //Edit STORE
        $scope.editStore = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'store') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'store',
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
                    //Update api/Store
                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)

                    if (retdata.StoreStatus == "0") {
                        retdata.StoreStatusDescr = "Closed";
                    }
                    else if (retdata.StoreStatus == "1") {
                        retdata.StoreStatusDescr = "Delivery Only";
                    }
                    else if (retdata.StoreStatus == "2") {
                        retdata.StoreStatusDescr = "Take Out Only";
                    }
                    else {
                        retdata.StoreStatusDescr = "Full Operational";
                    }
                    StoreMain.store = retdata;

                    DynamicApiService.postDAV3('Stores', 'update', retdata).then(function (result) {
                        tosterFactory.showCustomToast('Store updated succesfully', 'success');
                        //$scope.getDropDownLookUps('Store');
                    }, function (reason) {
                        tosterFactory.showCustomToast('Store updated failed', 'fail');
                        console.log('Fail update'); console.log(reason);
                    }, function (error) {
                        tosterFactory.showCustomToast('StoreInfo update error', 'error');
                        console.log('Error update'); console.log(reason);
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        //Edit POLYGONS 
        $scope.editPolygons = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'store') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'store',
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
                    //Update api/Polygons
                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)

                    var url = 'UpdateStatus/Id/' + retdata.Id + '/IsActive/' + retdata.IsActive;
                    DynamicApiService.getPolygonsIsActiveV3('Polygons', url).then(function (result) {
                        if (result != null && result.data != null) {

                            //Reload Polygons in order to refresh page
                            var url = msFactory.apiInterface.Stores.GET.GetPolygons;
                            DynamicApiService.getDAV3('Polygons', url, StoreMain.store.Id).then(function (resultPolygons) {
                                if (resultPolygons != null && resultPolygons.data != null) {
                                    StoreMain.polygons = resultPolygons.data;
                                    $scope.initialize();
                                } else {
                                    StoreMain.polygons = [];
                                }
                            }).catch(function (rejection) {
                                StoreMain.polygons = [];
                            }).finally(function () {
                            });

                            tosterFactory.showCustomToast('Polygons Updated', 'success');
                        } else {
                            tosterFactory.showCustomToast('No Polygons Updated', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Updating Polygons failed', 'fail');
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

        //Add SHORTAGE
        $scope.addShortages = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var url = msFactory.apiInterface.Stores.GET.GetProducts;
            DynamicApiService.getV3('Product', url).then(function (resultProducts) {
                if (resultProducts != null && resultProducts.data != null) {
                    $scope.filtersObjArray = resultProducts;

                    var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };

                    var dataEntry = {};
                    if (action == 'edit' && data !== undefined && data !== null) {
                        formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                        dataEntry = angular.copy(data);
                    }

                    $scope.StoreId = StoreMain.store.Id;
                    $scope.ShortType = 0;
                    dataEntry['StoreId'] = $scope.StoreId;
                    dataEntry['ShortType'] = $scope.ShortType;

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

                            DynamicApiService.postDAV3('Shortages', 'insert', retdata).then(function (result) {
                                tosterFactory.showCustomToast('Shortage Inserted succesfully', 'success');

                                //Update UI 
                                StoreMain.shortages = [];
                                var url = msFactory.apiInterface.Stores.GET.GetShortagesByStore;
                                DynamicApiService.getDAV3('Shortages', url).then(function (resultShortages) {
                                    if (resultShortages != null && resultShortages.data != null) {
                                        resultShortages.data.forEach(function (details) {
                                            if (details.ShortType == 0) {
                                                StoreMain.shortages.push(details);
                                            }
                                        });
                                    } else {
                                        StoreMain.shortages = [];
                                    }
                                }).catch(function (rejection) {
                                    StoreMain.shortages = [];
                                }).finally(function () {
                                });

                            }, function (reason) {
                                tosterFactory.showCustomToast('Shortage Insert failed', 'fail');
                                console.log('Fail update'); console.log(reason);
                            }, function (error) {
                                tosterFactory.showCustomToast('Shortage Insert error', 'error');
                                console.log('Error update'); console.log(reason);
                            })
                        }, function () { });
                    $scope.$watch(function () {
                        return $mdMedia('xs') || $mdMedia('sm');
                    }, function (wantsFullScreen) {
                        $scope.customFullscreen = (wantsFullScreen === true);
                    });

                } else {
                    console.warn('No Product Loaded');
                }
            }).catch(function (rejection) {
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
            }).finally(function () {
            });
        };


        //Delete SHORTAGE
        $scope.DeleteShortage = function (row) {
            var url = msFactory.apiInterface.Stores.POST.delete;
            DynamicApiService.deleteShortageDAV3('Shortages', url, row.Id).then(function (result) {
                tosterFactory.showCustomToast('Shortage Deleted succesfully', 'success');
                $scope.showModal = !$scope.showModal;
                StoreMain.shortages = [];
                var url = msFactory.apiInterface.Stores.GET.GetShortagesByStore;
                DynamicApiService.getDAV3('Shortages', url).then(function (resultShortages) {
                    if (resultShortages != null && resultShortages.data != null) {
                        resultShortages.data.forEach(function (details) {
                            if (details.ShortType == 0) {
                                StoreMain.shortages.push(details);
                            }
                        });
                    } else {
                    }
                }).catch(function (rejection) {
                }).finally(function () {
                });

            }, function (reason) {
                tosterFactory.showCustomToast('Shortage Delete failed', 'fail');
                console.log('Fail update'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Shortage Delete error', 'error');
                console.log('Error update'); console.log(reason);
            })
        };

        if (typeof google === 'object' && typeof google.maps === 'object') {
            StoreMain.createMap = function CustomMap() {
                var self = this;
                var GoogleMapsApiKey = "AIzaSyDjWwtf-0-BkZhPX_eTrA5SGDhPVnGuxBI";
                self.map = null;
                self.markers = [];
                self.polygonsArray = [];
                self.polygonLocations = [];
                $scope.selectedRow = null;

                //Create Polygons
                $scope.InitializePolygons = function () {
                    StoreMain.polygons.forEach(function (entry) {
                        entry.Details.forEach(function (details) {
                            var obj = {};
                            obj.lat = details.Latitude;
                            obj.lng = details.Longtitude;
                            self.polygonLocations.push(obj);
                        });
                        self.CreatePolygon(entry);
                    });
                };

                $scope.initialize = function () {
                    var startPoint = { lat: StoreMain.store.Latitude, lng: StoreMain.store.Longtitude };
                    self.map = new google.maps.Map(document.getElementById('map'), { zoom: 12.5, center: startPoint });
                    $scope.InitializePolygons();
                }

                self.PlaceMarker = function (location) {
                    var marker = new google.maps.Marker({
                        position: location,
                        map: self.map,
                        animation: google.maps.Animation.DROP
                    });
                    self.markers.push(marker);
                    self.polygonLocations.push(location);
                };

                self.CreatePolygon = function (polModel) {
                    if (polModel.IsActive == true) {
                        var polygon = new google.maps.Polygon({
                            paths: self.polygonLocations,
                            strokeColor: "black",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: polModel.PolygonsColor,
                            fillOpacity: 0.35,
                            Id: polModel.Id
                        });
                    }
                    else {
                        var polygon = new google.maps.Polygon({
                            paths: self.polygonLocations,
                            strokeColor: "black",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "gray",
                            fillOpacity: 0.20,
                            Id: polModel.Id
                        });
                    }
                    polygon.setMap(self.map);
                    var storePoint = { lat: polModel.Latitude, lng: polModel.Longtitude };
                    self.PlaceMarker(storePoint);
                    self.polygonsArray.push(polygon);
                    polygon.addListener('click', function () {
                        StoreMain.RowId = polModel.Id;
                        $scope.selectedRow = polModel.Id;
                        $scope.ChoosePolygon(polModel);
                        angular.element('#map').triggerHandler('click');
                    });
                    self.polygonLocations = [];
                };

                // Call Map
                $scope.initialize();

                //Focus on chosen Polygon
                $scope.ChoosePolygon = function ChoosePolygon(row) {
                    row.Details.forEach(function (details) {
                        var obj = {};
                        obj.lat = details.Latitude;
                        obj.lng = details.Longtitude;
                        self.polygonLocations.push(obj);
                    });
                    self.focusPolygon(row);
                    $scope.selectedRow = row.Id;
                }

                self.focusPolygon = function (Model) {
                    for (var i = 0; i < self.polygonsArray.length; i++) {
                        if (self.polygonsArray[i].Id == Model.Id) {
                            self.polygonsArray[i].setOptions({ fillOpacity: 3.35, strokeWeight: 8 });
                            self.polygonsArray[i].setMap(self.map);
                            self.polygonLocations = [];
                        }
                        else {
                            self.polygonsArray[i].setOptions({ fillOpacity: 0.35, strokeWeight: 2 });
                            self.polygonsArray[i].setMap(self.map);
                            self.polygonLocations = [];
                        }
                    }
                };
            }
        }

    }]);
