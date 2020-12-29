'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description 
 * # SalesPosLookUpService
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .factory('dataUtilFactory', function ($http, $rootScope) { //maps ID with VALUE in select form  to display in drop down ui-grid CELL
        return {
            quicksort: function (m, sortfield, left, right) {
                if (typeof (left) === 'undefined') left = 0;
                if (typeof (right) === 'undefined') right = m.length - 1;
                // If the list has 2 or more items
                if (left < right) {
                    // Use a random index for a Pivot such that left ≤ pivotIndex ≤ right
                    var pivotIndex = left + (Math.floor(Math.random() * (right - left)));
                    // Get lists of bigger and smaller items and final position of pivot
                    var pivotNewIndex = partition(m, left, right, pivotIndex, sortfield);
                    // Recursively sort elements smaller than the pivot (assume pivotNewIndex - 1 does not underflow)
                    m = quicksort(m, sortfield, left, ((pivotNewIndex - 1 >= 0) ? pivotNewIndex - 1 : 0));
                    // Recursively sort elements at least as big as the pivot (assume pivotNewIndex + 1 does not overflow)
                    m = quicksort(m, sortfield, ((pivotNewIndex + 1 <= m.length - 1) ? pivotNewIndex + 1 : m.length - 1), right);
                }
                return m;
            },
            createEnums: function (mainLoop, enumAsEnum, keyField, valueField) {
                var tmpEnum = {}; var cEnum = enumAsEnum;
                angular.forEach(mainLoop, function (value) {
                    //create enum of { value.keyfield : value.valuefield }
                    tmpEnum[value[keyField]] = value[valueField]; angular.extend(cEnum, tmpEnum);
                });
                return cEnum;
            },
            createEnumsExtend: function (mainLoop, enumAsEnum, keyField, valueFieldArr) {
                var tmpEnum = {}; var cEnum = enumAsEnum;
                angular.forEach(mainLoop, function (value) {
                    //create enum of { value.keyfield : value.valuefield }
                    var exdesc = '';
                    var vv = angular.copy(value);
                    angular.forEach(valueFieldArr, function (vex) {
                        if (exdesc.length == 0)
                            exdesc = vv[vex];
                        else
                            exdesc += ('-' + vv[vex])
                    })
                    tmpEnum[value[keyField]] = exdesc; angular.extend(cEnum, tmpEnum);
                });
                return cEnum;
            },
            createEntityEnumsArr: function (arr, keyFname, keyFvalue, tryEnumerateKey) {
                var ret = [];
                angular.forEach(arr, function (value, key) {
                    var tmp;
                    if (tryEnumerateKey == true)
                        tmp = { [keyFname]: Number(key), [keyFvalue]: value };
                    else
                        tmp = { [keyFname]: key, [keyFvalue]: value };
                    ret.push(tmp);
                })
                return ret;
            },
            createEnumObjs: function (mainLoop, enumAsObj, keyField) {
                var tmpEnumObj = {}; var cEnumObj = enumAsObj;
                angular.forEach(mainLoop, function (value) {
                    //create enum of { value.keyfield : valueObj }
                    tmpEnumObj[value[keyField]] = value; angular.extend(cEnumObj, tmpEnumObj);
                });
                return cEnumObj;
            },
            createEnumsAndEnumObjs: function (mainLoop, enumAsEnum, enumAsObj, keyField, valueField) {
                var tmpEnum = {}, tmpEnumObj = {}, cEnum = enumAsEnum, cEnumObj = enumAsObj;
                angular.forEach(mainLoop, function (value) {
                    //create enum of { value.keyfield : value.valuefield }
                    tmpEnum[value[keyField]] = value[valueField]; angular.extend(cEnum, tmpEnum);
                    //create enum of { value.keyfield : valueObj }
                    //tmpEnumObj[value[keyField]] = value; angular.extend(cEnumObj, tmpEnumObj);
                    tmpEnumObj[value[keyField]] = value; angular.extend(cEnumObj, tmpEnumObj);
                });
                return ({
                    retEnum: cEnum,
                    retEnumObj: cEnumObj
                });
            },
            //Help Function gets an enum 
            //Creates a drop down 4 Schema Form Entity Dropdowns
            createMapDropdown: function (enumVar) {
                var arr = [];
                angular.forEach(enumVar, function (cnt, key) {
                    var tmpobj = { value: parseInt(key), name: cnt };
                    arr.push(tmpobj);
                });
                return arr;
            },
            //givven an array and a field creates an object of by[key] reference sub array with same values
            groupTo: function (arr, key) {
                var groups = {};
                for (var i = 0; i < arr.length; i++) {
                    groups[arr[i][key]] = groups[arr[i][key]] || [];
                    groups[arr[i][key]].push(arr[i]);
                }
                return groups;
            },
            groupToLvl: function (arr, keyArr) {
                var groups = {};
                
                for (var i = 0; i < arr.length; i++) {
                    var item = arr[i];
                    var lvlg = groups;
                    for (var j = 0; j < keyArr.length; j++) {
                        var k = keyArr[j];

                        if (j == keyArr.length - 1) {
                            //final state 
                            if (lvlg[k] == null) { lvlg[k] = [item]; } else { lvlg[k].push(item); }
                        } else {
                            if (lvlg[k] == null) {
                                lvlg[k] = {};
                            }
                            //create extend and proceed
                            lvlg = lvlg[k];
                        }

                    }
                }
            },

            groupLvl2: function (arr, k1, k2) {
                var groups = {};
                for (var i = 0; i < arr.length; i++) {
                    var item = arr[i];
                    if (groups[item[k1]] == null) {
                        groups[item[k1]] = {};
                    }
                    if (groups[item[k1]][item[k2]] == null) {
                        groups[item[k1]][item[k2]] = [item];
                    } else {
                        groups[item[k1]][item[k1]].push(item);
                    }
                }
                return groups;
            },

            createDateObj: function (o, date, field) {
                if (field == null) {
                    field = 'dateObj'
                }
                var y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
                o = angular.extend(o, { [field]: { year: y, month: m, day: d } });
                return o;
            },
            //givven an array and a field creates an object of by[key] reference sub array with same values
            groupDateField3lvl: function (arr, datekey, dateObjName) {
                if (dateObjName == null) {
                    dateObjName = 'dateObj'
                }
                var groups = {};
                for (var i = 0; i < arr.length; i++) {
                    var date = new Date(arr[i][datekey]);
                    var o = angular.copy(arr[i]);
                    o = this.createDateObj(o, date, dateObjName);
                    var y = o[dateObjName]['year'], m = o[dateObjName]['month'], d = o[dateObjName]['day'];

                    if (groups[y] == null) {
                        groups[y] = {};
                    }
                    if (groups[y][m] == null) {
                        groups[y][m] = {};
                    }
                    if (groups[y][m][d] == null) {
                        groups[y][m][d] = [o];
                    } else {
                        groups[y][m][d].push(o);
                    }
                    //var ta = groups[y][m][d];
                    //groups[y][m][d] = ta.push(o);
                }
                return groups;
            },

            checkObjectMatch: function (masterObj, slaveObj) {
                var ret = false;
                return ret;
            },
            //Description transform an objectArray into filtered field arr
            //modelArr : an array of Objects
            //propertyArr : an array of Fields
            //return : new Array of objects with given property names 
            transformArrModels: function (modelArr, propertyArr) {
                var retArr = modelArr.map(function (item) {
                    var ret = angular.copy(item);
                    angular.forEach(ret, function (key) {
                        var found = propertyArr.indexOf(key);
                        if (found == -1)
                            delete ret[key];
                    })
                    return ret;
                })
                return retArr;
            },

            // a function providing 
            // 1) max by field of an array 
            // 2) or with no field value to check max of array
            findmax: function (arr, field) {
                var m = null;
                try {
                    if (field == null) {
                        angular.forEach(arr, function (i) { if (m == null || i > m) { m = i; } })
                    } else {
                        angular.forEach(arr, function (i) { if (m == null || i[field] > m) { m = i[field]; } })
                    }
                    return m;
                } catch (e) {
                    console.warn('DUF.findmax raised an exception:' + e);
                    return null;
                }
            }
        };
    })



function quicksort(m, sortfield, left, right) {
    if (typeof (left) === 'undefined') left = 0;
    if (typeof (right) === 'undefined') right = m.length - 1;
    // If the list has 2 or more items
    if (left < right) {
        // Use a random index for a Pivot such that left ≤ pivotIndex ≤ right
        var pivotIndex = left + (Math.floor(Math.random() * (right - left)));
        // Get lists of bigger and smaller items and final position of pivot
        var pivotNewIndex = partition(m, left, right, pivotIndex, sortfield);
        // Recursively sort elements smaller than the pivot (assume pivotNewIndex - 1 does not underflow)
        m = quicksort(m, sortfield, left, ((pivotNewIndex - 1 >= 0) ? pivotNewIndex - 1 : 0));
        // Recursively sort elements at least as big as the pivot (assume pivotNewIndex + 1 does not overflow)
        m = quicksort(m, sortfield, ((pivotNewIndex + 1 <= m.length - 1) ? pivotNewIndex + 1 : m.length - 1), right);
    }
    return m;
}
// left is the index of the leftmost element of the subarray // right is the index of the rightmost element of the subarray (inclusive)// number of elements in subarray = right-left+1
function partition(subArray, left, right, pivotIndex, sortfield) {
    var pivotValue = subArray[pivotIndex],
        storeIndex = left;
    subArray = swap(subArray, pivotIndex, right); // Move pivot to end
    for (var i = left; i < right; i++) { // left ≤ i < right
        if (subArray[i][sortfield] <= pivotValue[sortfield]) {
            subArray = swap(subArray, i, storeIndex);
            //console.log(subArray);
            storeIndex++; // only increment storeIndex if swapped
        }
    }
    //subArray.map(function(currentElement,index,arr){
    //   if (currentElement <= pivotValue) {
    //      arr = swap(arr, currentElement, storeIndex);
    //      storeIndex++; // only increment storeIndex if swapped
    //   }
    //   return arr;
    //});
    subArray = swap(subArray, storeIndex, right); // Move pivot to its final place
    return storeIndex;
}


function swap(list, Ai, Bi) {
    list[Bi] = [list[Ai], list[Ai] = list[Bi]][0]; // swap
    return list;

}
function bsJson(json) {
    //var json = { 'one': 1, 'two': 2, 'seven': 7, 'twelve': 12, 'fourty': 40, 'hundred': 100 };
    //var keys = Object.keys(json);
    //var values = []; var search = 99;

    //for (i in json) values.push(json[i]);
    //var middle;
    //middle = keys.length / 2;

    //var low = 0, high = keys.length - 1, i;
    //while (low <= high) {
    //    i = Math.floor((low + high) / 2);    //    if (values[i] < search) { low = i + 1; continue; };    //    if (values[i] > search) { high = i - 1; continue; };
    //}
    //console.log(values[i]);
}
function bsArray(objArr, field, keyVal) {
    var values = objArr; var keyField = field; var search = keyVal;
    var firstFound = -1; var lastFound = -1; var middle;
    middle = objArr.length / 2;
    var low = 0, high = objArr.length - 1, i;
    while (low <= high) {
        i = Math.floor((low + high) / 2);
        if (values[i][keyField] <= search) {
            if (lastFound == -1 && values[i][keyField] == search) { //first time found  {search from 0.....i }
                //replace this with binarySearch ( returning min found)
                for (var j = i; j >= 0; j--) {
                    if (values[j][keyField] < search) { break; } else { firstFound = j; }
                }
            }
            if (lastFound < i && values[i][keyField] == search) { lastFound = i; }
            low = i + 1;             //console.log("Pos:" + i + " Val:" + values[i][keyField]);
            continue;
        };
        if (values[i][keyField] > search) {
            high = i - 1;            //console.log("Pos:" + i + " Val:" + values[i][keyField]);
            continue;

        };
    }
    var ar2;
    if (lastFound + 1 > values.length) {
        ar2 = values.slice(firstFound, values.length - 1);
    } else {
        ar2 = values.slice(firstFound, lastFound + 1);

    }
    console.log(ar2);
    return ar2;
}