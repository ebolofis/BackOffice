'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
        /* It returns a dropdown filter to help you show editDropdownValueLabel
         *
         * Parameters:
         *
         * - input: selected input value, it always comes when you select a dropdown value
         * - map: Dictionary containing the catalog info. For example:
         *    $scope.languageCatalog = [ {'id': 'EN', 'description': 'English'}, {'id': 'ES', 'description': 'Español'} ]
         * - idLabel: ID label. For this example: 'id'.
         * - valueLabel: Value label. For this example: 'description'.
         *
         * 1) Configure cellFilter this way at the ui-grid colDef:
         *
         * { field: 'languageId', name: 'Language'), editableCellTemplate: 'ui-grid/dropdownEditor',
         *   editDropdownIdLabel: 'id', editDropdownValueLabel: 'description', 
         *   editDropdownOptionsArray: $scope.languageCatalog,
         *   cellFilter: 'mapDropdown:row:row.grid.appScope.languageCatalog:"id":"description":languageCatalog' },
         *
         * 2) Append this snippet to the controller:
         * 
         * .filter('mapDropdown', function(uiGridFactory) { 
         *    return uiGridFactory.getMapDrowdownFilter()
         * });
         *
         */
    .factory('uiGridFactory', function ($http, $rootScope) { //maps ID with VALUE in select form  to display in drop down ui-grid CELL
        var factory = {}
        factory.getMapDrowdownFilter = function () {
            return function (input, map, idLabel, valueLabel) {
                var match; var result;
                if (map != null) {
                    for (var i = 0; i < map.length; i++) {
                        if (map[i][idLabel] == input) { return map[i][valueLabel]; }
                    }
                }
                return "";
            }
        }
        factory.getMapGroupDrowdownFilter = function () {
            return function (input, map) {
                var match; var result;
                if (!input) {
                    return '';
                } else if (result = map[input]) {
                    return result;
                } else if ((match = input.match(/(.+)( \([$\d,.]+\))/)) && (result = map[match[1]])) {
                    return result + match[2];
                } else { return input; }
            }
        }
        //input (filterArray : from  lookups , dynRowForm : form of schema-form
        //transforms enum dropdown from {Key , Value} --> {value , name} and feed it to titleMAp_Array of form inserted
        factory.transformDropDownSelect = function (filterArray, dynRowForm) {
            for (var j = 0; j < dynRowForm.length; j++) {

                if (typeof dynRowForm[j] == "object" && dynRowForm[j].type == "select") {
                    var arr = [] , temparr = filterArray[dynRowForm[j].key];
                    if (temparr !== undefined) {
                        for (var i = 0; i < temparr.length; i++) {
                            var tmpobj = { value: temparr[i].Key, name: temparr[i].Value };
                            arr.push(tmpobj);
                        }
                        dynRowForm[j].titleMap = arr;
                    }
                }
            }
            return dynRowForm;
        }
        //inputs 
        //filterarray { Pricelist: { id:desc } , Vat: { id: desc} } 
        //dynRowForm  form of schema form selected 
        //Fills form of objects and select field to its tittle maps and returns same form
        factory.transformDropDownSelectEnum = function (filterArray, dynRowForm) {
            for (var j = 0; j < dynRowForm.length; j++) {
                var arr = [];
                if (typeof dynRowForm[j] == "object" && dynRowForm[j].type == "select") {
                    var temparr = filterArray[dynRowForm[j].key];
                    angular.forEach(temparr, function (cnt, key) {
                        var tmpobj = { value: parseInt(key), name: cnt };
                        arr.push(tmpobj);
                    });
                    dynRowForm[j].titleMap = arr;
                }
            }
            return dynRowForm;
        }



        //var genderHash = arr;
        //return function (input) {
        //    var result; var match;
        //    if (!input) {
        //        return '';
        //    } else if (result = genderHash[input]) {
        //        return result;
        //    } else if ((match = input.match(/(.+)( \([$\d,.]+\))/)) && (result = genderHash[match[1]])) {
        //        return result + match[2];
        //    } else { return input; }
        //};
        return factory;
    });