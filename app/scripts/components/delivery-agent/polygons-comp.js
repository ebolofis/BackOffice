/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />
angular.module('posBOApp')
    .component('polygonsComp', {
        templateUrl: 'app/scripts/components/delivery-agent/templates/polygons-comp.html',
        controller: 'PolygonsCompCTRL',
        controllerAs: 'PolMain'
    })
    .controller('PolygonsCompCTRL', ['$scope', '$mdDialog', 'daFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', function ($scope, $mdDialog, daFactory, dataUtilFactory, tosterFactory, DynamicApiService) {
        var PolMain = this;
        var dtu = dataUtilFactory;
        PolMain.restbusy = false; PolMain.hasError = false;
        PolMain.$onInit = function () { };

        PolMain.initView = function () {
            PolMain.polygons = [];
            PolMain.stores = [];
            PolMain.GetPolygons();
        };


        $scope.GenerateShapes = function ()
        {
            var url = daFactory.apiInterface.Polygons.POST.GenerateShapes;
            DynamicApiService.postDAV3('Polygons', url).then(function (result) {
                if (result.data.length == 0)
                {
                    tosterFactory.showCustomToast('No Errors Found', 'success');
                }
                else {
                    tosterFactory.showCustomToast('Errors Found', 'fail');
                }

            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Unable to Generate Shapes ', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                PolMain.hasError = true; PolMain.polygons = [];
                return -1;
            }).finally(function () {
                PolMain.restbusy = false;
            });
        }

        //API CALL rest get all Polygons
        PolMain.GetPolygons = function () {
            
            var url = daFactory.apiInterface.Polygons.GET.GetPolygons;
            DynamicApiService.getDAV3('Polygons', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Polygons Loaded', 'success');
                    PolMain.polygons = result.data;
                    if (typeof google === 'object' && typeof google.maps === 'object') {
                        PolMain.createMap();
                    }
                } else {
                    tosterFactory.showCustomToast('No Polygons Loaded', 'success');
                    PolMain.polygons = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Polygons failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                PolMain.hasError = true; PolMain.polygons = [];
                return -1;
            }).finally(function () {
                PolMain.restbusy = false;
            });
        }

        if (typeof google === 'object' && typeof google.maps === 'object') {
            PolMain.createMap = function CustomMap() {
                var self = this;
                var GoogleMapsApiKey = "AIzaSyDjWwtf-0-BkZhPX_eTrA5SGDhPVnGuxBI";
                self.map = null;
                self.markers = [];
                self.searchMarkers = [];
                self.polygonsArray = [];
                self.polygonLocations = [];
                $scope.selectedRow = null;

                //Create Polygons
                $scope.InitializePolygons = function () {
                    PolMain.polygons.forEach(function (entry) {
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
                    var startPoint = { lat: 37.95759829, lng: 23.71669829 };
                    self.map = new google.maps.Map(document.getElementById('map'), { zoom: 12, center: startPoint });
                    $scope.InitializePolygons();
                }

                self.PlaceMarker = function (location) {
                    var marker = new google.maps.Marker({
                        position: location,
                        map: self.map
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
                    self.polygonsArray.push(polygon)
                    polygon.addListener('click', function () {
                        PolMain.RowId = polModel.Id;
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

                //Focus on chosen Polygon
                $scope.placeGivenMarker = function placeGivenMarker(latitude, longitude) {
                    for (var i = 0; i < self.searchMarkers.length; i++) {
                        self.searchMarkers[i].setMap(null);
                    }
                    self.searchMarkers = [];
                    var location = { lat: latitude, lng: longitude };
                    var marker = new google.maps.Marker({
                        position: location,
                        map: self.map,
                        icon: {
                            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                        }
                    });
                    self.searchMarkers.push(marker);
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



                self.ShowMarkers = function () {
                    for (var i = 0; i < self.markers.length; i++) {
                        self.markers[i].setMap(self.map);
                    }
                };

                self.ClearMarkers = function () {
                    for (var i = 0; i < self.markers.length; i++) {
                        self.markers[i].setMap(null);
                    }
                };

                self.ApplyAddressInput = function () {
                    var addressInput = document.getElementById("address").value;
                };

                self.PlaceAddressMarker = function () {
                    var address = "";
                    for (var i = 0; i < addressTokens.length; i++) {
                        address = address + addressTokens[i];
                        if (i != (addressTokens.length - 1)) {
                            address = address + "+";
                        }
                    }
                    $.ajax({
                        url: "https://maps.google.com/maps/api/geocode/json?address=" + address + "&key=" + GoogleMapsApiKey,
                        type: "GET",
                        crossdomain: true,
                        dataType: "json",
                        ContentType: "application/json; charset=utf-8",
                        success: function (data) {
                            if (data.results.length > 0) {
                                var geocode = data.results[0];
                                var location = geocode.geometry.location;
                                self.PlaceMarker(location);
                                var polygonInBounds = self.ChoosePolygon(location);
                                if (polygonInBounds != null) {
                                    toastr.info("Marker belongs in a polygon!");
                                    console.log(polygonInBounds);
                                }
                                else {
                                    toastr.warning("Marker does not belong in a polygon!");
                                }
                            }
                            else {
                                toastr.error("Unable to convert address to coordinates!");
                            }
                            // self.selectedAddress(null);
                        }, error: function () {
                            toastr.error("Unable to convert address to coordinates!");
                        }
                    });
                };

                self.DeleteMarkers = function () {
                    self.ClearMarkers();
                    self.markers = [];
                    self.polygonLocations = [];
                };

                self.DeleteLastMarker = function () {
                    var lastMarker = self.markers.length - 1;
                    if (lastMarker >= 0) {
                        self.markers[lastMarker].setMap(null);
                        self.markers.splice(lastMarker, 1);
                        self.polygonLocations.splice(lastMarker, 1);
                    }
                };
            }
        }

    }]);
