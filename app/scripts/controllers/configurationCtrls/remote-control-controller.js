
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:RemoteControlCtrl
 * @description
 *  here is a main template initiallize by entity to manage controller 
 *  that by entity name initiallize represents on its main content a directive of main-views to manage Entity on server
 * Controller of the posBOApp
 */

angular.module('posBOApp')
.controller('RemoteControlCtrl', ['tosterFactory', '$stateParams', '$scope', '$q', '$interval', '$mdDialog', '$mdMedia', 'DynamicApiService', 'dataUtilFactory', 'FileSaver', 'Blob',
function (tosterFactory, $stateParams, $scope, $q, $interval, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, FileSaver, Blob) {
    console.log('Remote Access Started');

    $scope.init = function () {
        $scope.reloadQueries();
    }
    //Reload queries from back-end
    //Reinitiallize array of loaded queries and object display 
    //calls Promise map to extend queries on view model representaion
    $scope.reloadQueries = function () {
        $scope.busyloading = true;
        $scope.loadedQueries = [];
        $scope.mapQueries = {};
        $q.all({
            getall: $scope.RestPromice.getQueries(), //lookup entities
        }).then(function (d) {
            $scope.busyloading = false;
            if (d.getall != null) {
                $scope.loadedQueries = d.getall.data.Actions;
                createPromisesMap();
            }
        }).finally(function () {
            $scope.busyloading = false;
        });
    }
    //Extend loaded queries by state field
    //and applies registers on a map that represents view
    function createPromisesMap() {
        angular.forEach($scope.loadedQueries, function (item) {
            item = angular.extend(item, { 'State': 'default' });
            $scope.mapQueries[item.Id] = item;
        })
    }
    //a single by id action that handls map query state and 
    //call a resource by id that execute query on back end
    $scope.executeQuery = function (Id) {
        //$scope.busyloading = true;
        $scope.mapQueries[Id]['State'] = 'busy';
        $q.all({
            getbyid: $scope.RestPromice.applyQuery(Id), //lookup entities
        }).then(function (d) {
            //$scope.busyloading = false;
            if (d.getbyid != null) {
                $scope.mapQueries[Id]['State'] = 'success';
                tosterFactory.showCustomToast('Action (' + $scope.mapQueries[Id].Name + ') applied successfully', 'success');
                //$scope.mapQueries[Id] = angular.extend($scope.mapQueries[Id], { 'ReturnResults': d.getbyid.data });
            } else {
                $scope.mapQueries[Id]['State'] = 'fail';
                tosterFactory.showCustomToast('Action (' + $scope.mapQueries[Id].Name + ') applied failed', 'fail');
            }
        }).catch(function () {
            $scope.mapQueries[Id]['State'] = 'fail';
            tosterFactory.showCustomToast('Action (' + $scope.mapQueries[Id].Name + ') applied failed', 'fail');
        }).finally(function () {

        });
    }
    //a fun that provides a modal with queriy result.data and provides an export funcitonallity 
    //with Rest Call results obj JSON that was mapped on query after tryied to apply on Context
    $scope.logResults = function (query) {
        console.log(query);
        var txt = (query.ReturnResults.data.ExceptionMessage != undefined) ? query.ReturnResults.data.ExceptionMessage : query.ReturnResults.data
        var resultDialog = $mdDialog.confirm().title(query.Name + ':' + query.ReturnResults.status).htmlContent(txt).ariaLabel('result-log-dialog').ok('Export').cancel('close');
        $mdDialog.show(resultDialog).then(function () {
            exportQuery(query);
        });
    }
    //this is the export fun to file 
    //a result of a Rest call after it is executed it is saved  on ReturnResults field name 
    //this function provides a json output of this result to a textfile created by responsetype by the name of q.Name + status returned
    function exportQuery(query) {
        var fname = query.Name + ':' + query.ReturnResults.status + '.txt';
        var txt = JSON.stringify(query.ReturnResults);
        var data = new Blob([txt], { type: 'text/plain;charset=ascii' });
        FileSaver.saveAs(data, fname);
    }

    //Rest Promises over back end to  map 
    // { getQueries  || by id } return actions 
    // { applyQuery } run selected action  
    // { applyMultiQuery } run selected list action  
    $scope.RestPromice = {
        //Resource of lookups needed to manage lockers and side entities of forms
        'getQueries': function (id) {
            var actionName = 'GetAll', parameters = '';
            (id == undefined) ? actionName = 'GetAll' : actionName = 'GetById';
            (id == undefined) ? parameters = '' : parameters = id;
            return DynamicApiService.getAttributeRoutingData('RemoteActions', actionName, "", parameters).then(function (result) { //Rest Get call for data using Api service to call Webapi
                console.log('Remote q(s) loaded'); console.log(result);
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading predefined Actions Failed', 'fail');
                console.warn('Loading predefined Actions Failed. Reason:'); console.warn(rejection);
                return null;
            });
        },

        //http://localhost:61964/api/2623fe8e-cb11-4591-b953-bc070b6a5f56/PosInfo/Add
        //resource to load receipt details for modal overview
        'applyQuery': function (id) {
            var actionName = '', data = id;
            var actionName = 'ExecuteQuery/' + id;
            return DynamicApiService.postAttributeRoutingData('RemoteActions', actionName).then(function (result) { //Rest Get call for data using Api service to call Webapi
                console.log('Receipt details loaded'); console.log(result);
                $scope.mapQueries[id] = angular.extend($scope.mapQueries[id], { 'ReturnResults': result });
                return result;
            }).catch(function (rejection) {
                $scope.mapQueries[id] = angular.extend($scope.mapQueries[id], { 'ReturnResults': rejection });
                tosterFactory.showCustomToast('Trying to apply action on server failed', 'fail');
                console.warn('Action failed to load'); console.warn(rejection);

                return null;
            });
        },
        //not yet implemented 
        //used to apply actions on row 
        'applyMultiQuery': function (idarr) {
            var actionName = 'ExecuteMultipleQueries'; // data [id]
            return DynamicApiService.postAttributeRoutingData('RemoteActions', actionName, idarr).then(function (result) { //Rest Get call for data using Api service to call Webapi
                console.log('Receipt details loaded'); console.log(result);
                $scope.mapQueries[id] = angular.extend($scope.mapQueries[id], { 'ReturnResults': result });
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Multi Actions failed on server', 'fail');
                console.warn('Multi Actions failed'); console.warn(rejection);
                $scope.mapQueries[id] = angular.extend($scope.mapQueries[id], { 'ReturnResults': rejection });
                return null;
            });
        },
    }
    //Not Wet implemented 
    //fun acts like getting a specific Action by id from server 
    $scope.loadQuery = function (id) {
        //$scope.busyloading = true;
        $q.all({
            getbyid: $scope.RestPromice.getQueries(id), //lookup entities
        }).then(function (d) {
            //$scope.busyloading = false;
            if (d.getbyid != null)
                $scope.loadedQuery = d.getbyid.data.Actions;
        }).finally(function () { });
    }
    //Not yet implemented 
    //Used to apply selected gueries  one by one 
    $scope.applyQueries = function () { }
}])