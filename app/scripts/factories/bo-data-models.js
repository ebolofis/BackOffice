'use strict';
//
//
//
//
//
angular.module('posBOApp')
.factory('Enums', function () {
    var enums = this;
    enums = angular.extend({} ,predefEnums())

    return enums;
})

function predefEnums() {
    var e = {};
    //this is an Enumerator of Metadata System.ServiceProcess from Api to Handle Connected-Required Services 
    e.ServiceControllerStatus = {
        1: 'Stopped',
        2: 'StartPending',
        3: 'StopPending',
        4: 'Running',
        5: 'ContinuePending',
        6: 'PausePending',
        7: 'Paused'
    };

    return e;
}