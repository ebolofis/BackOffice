function CustomMap() {
    var self = this;
    var GoogleMapsApiKey = "AIzaSyDjWwtf-0-BkZhPX_eTrA5SGDhPVnGuxBI";
    self.map = null;
    self.selectedAddress = ko.observable(null);
    self.markers = [];
    self.polygons = [];
    self.polygonLocations = [];
    self.polygonColors = ["#ff0000", "green", "blue", "yellow", "orange"]
    self.lastColor = -1;

    self.InitializeMap = function () {
        var startPoint = { lat: 37.95759829, lng: 23.71669829 };
        self.map = new google.maps.Map(document.getElementById('map'), { zoom: 12, center: startPoint });
        google.maps.event.addListener(self.map, 'click', function (event) {
            self.PlaceMarker(event.latLng);
        });
    };

    self.PlaceMarker = function (location) {
        var marker = new google.maps.Marker({
            position: location,
            map: self.map
        });
        self.markers.push(marker);
        self.polygonLocations.push(location);
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
        self.selectedAddress(addressInput);
    };

    self.PlaceAddressMarker = function () {
        if (self.selectedAddress() == null) {
            toastr.warning("You need to insert an address first!");
            return;
        }
        var addressTokens = self.selectedAddress().split(" ");
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
                    //if (geocode.geometry.bounds !== undefined) {
                    //    var northeastBoundsLocation = geocode.geometry.bounds.northeast;
                    //    self.PlaceMarker(northeastBoundsLocation);
                    //    var southwestBoundsLocation = geocode.geometry.bounds.southwest;
                    //    self.PlaceMarker(southwestBoundsLocation);
                    //}
                    //if (geocode.geometry.viewport !== undefined) {
                    //    var northeastViewportLocation = geocode.geometry.viewport.northeast;
                    //    self.PlaceMarker(northeastViewportLocation);
                    //    var southwestViewportLocation = geocode.geometry.viewport.southwest;
                    //    self.PlaceMarker(southwestViewportLocation);
                    //}
                }
                else {
                    toastr.error("Unable to convert address to coordinates!");
                }
                self.selectedAddress(null);
            }, error: function () {
                toastr.error("Unable to convert address to coordinates!");
            }
        });
    };

    self.ChoosePolygon = function (location) {
        var modifiedLocation = {};
        modifiedLocation.lat = ko.observable(location.lat);
        modifiedLocation.lng = ko.observable(location.lng);
        for (var i = 0; i < self.polygons.length; i++) {
            if (google.maps.geometry.poly.containsLocation(modifiedLocation, self.polygons[i])) {
                return self.polygons[i];
            }
        }
        return null;
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

    self.CreatePolygon = function () {
        if (self.polygonLocations.length < 3) {
            toastr.warning("You need more markers on map to create a polygon!");
            return;
        }
        var polygon = new google.maps.Polygon({
            paths: self.polygonLocations,
            strokeColor: "black",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: self.GetPolygonColor(),
            fillOpacity: 0.35
        });
        polygon.setMap(self.map);
        self.polygons.push(polygon);
        self.polygonLocations = [];
        //self.DeleteMarkers();
        self.selectedAddress(null);
    };

    self.GetPolygonColor = function () {
        self.lastColor++;
        if (self.lastColor == self.polygonColors.length) {
            self.lastColor = 0;
        }
        var color = self.polygonColors[self.lastColor];
        return color;
    };

    self.ShowPolygons = function () {
        for (var i = 0; i < self.polygons.length; i++) {
            self.polygons[i].setMap(self.map);
        }
    };

    self.ClearPolygons = function () {
        for (var i = 0; i < self.polygons.length; i++) {
            self.polygons[i].setMap(null);
        }
    };

    self.DeletePolygons = function () {
        self.ClearPolygons();
        self.polygons = [];
    };

    self.DeleteLastPolygon = function () {
        var lastPolygon = self.polygons.length - 1;
        if (lastPolygon >= 0) {
            self.polygons[lastPolygon].setMap(null);
            self.polygons.splice(lastPolygon, 1);
        }
    };

}