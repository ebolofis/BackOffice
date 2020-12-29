'use strict';
/**
 * @ngdoc function
 * @name Filter-General-Factory
 * @description
 * # Filter General Factory
 */

angular.module('posBOApp')

    .filter('boolValEnumeration', function () { return function (input) { if (input === undefined) return '--'; return (input == true) ? 'Yes' : 'No'; } })

    .filter('boolValStatusEnumeration', function () { return function (input) { return (input == true) ? 'Enabled' : 'Disabled'; } })
    .filter('boolValStatusIntEnumeration', function () { return function (input) { return (input == 1) ? 'Enabled' : ((input == 0) ? 'Disabled' : '---'); } })
    .filter('mapGender', function (arr) {
        var genderHash = arr;
        return function (input) { var result; var match; if (!input) { return ''; } else if (result = genderHash[input]) { return result; } else if ((match = input.match(/(.+)( \([$\d,.]+\))/)) && (result = genderHash[match[1]])) { return result + match[2]; } else { return input; } };
    })
    .filter('passwordFilter', function () { return function (input) { return (input !== undefined && input !== null && input != '') ? '*****' : ''; } })
    .filter('mscFilter', function () { return function (input, displayField) { var descs = input.map(function (c) { return c[displayField]; }); var ret = descs.join(", "); return ret; } })

    .filter('mapDropdown', function (uiGridFactory) { return uiGridFactory.getMapDrowdownFilter() })
    .filter('mapGroupDropdown', function (uiGridFactory) { return uiGridFactory.getMapGroupDrowdownFilter() })

    .filter('textDate', ['$filter', function ($filter) { return function (input, format) { var date = new Date(input); return $filter('date')(date, format); }; }])
    .filter('textDateFilter', ['$filter', function ($filter) { return function (input) { if (input == '' || input == null) return; var format = "d/MM/yyyy"; var date = new Date(input); return $filter('date')(date, format); }; }])
    .filter('searchStringByEnum', function () {
        //custom filter to manage available categories filter  based on cat_ID && enum of categories loaded
        return function (input, search, enumArray) {
            if (!input) return input; if (!enumArray) return input; if (!search) return input;
            var expected = ('' + search).toLowerCase(); var result = {};
            angular.forEach(input, function (value, key) {
                var actual = ('' + enumArray[key]).toLowerCase();
                if (actual.indexOf(expected) !== -1) { result[key] = value; }
            });
            return result;
        }
    })
    .filter('searchStringByEnumField', function () {
        //custom filter to manage available categories filter  based on cat_ID && enum of categories loaded
        return function (input, search, enumArray, field) {
            if (!input) return input; if (!enumArray) return input; if (!search) return input;
            var expected = ('' + search).toLowerCase(); var result = [];
            angular.forEach(input, function (value, key) {
                var actual = ('' + enumArray[value[field]]).toLowerCase();
                if (actual.indexOf(expected) !== -1) {
                    result.push(value);
                    //result[key] = value;
                }
            });
            return result;
        }
    })
    //.filter("date", function () { return function (date) { return moment(new Date(date)).format('DD/MM/YYYY hh:mm'); }; })
    // helper code
    .filter('object2Array', function () {
        return function (input) {
            var out = [];
            for (i in input) {
                out.push(input[i]);
            }
            return out;
        }
    })