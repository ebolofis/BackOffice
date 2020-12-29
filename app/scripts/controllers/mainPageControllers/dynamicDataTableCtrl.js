'use strict';
angular.module('posBOApp')
    .controller('DynamicDataTableCtrl', ['$scope', '$http', '$interval', '$q', '$mdDialog','$mdEditDialog', 'tosterFactory', 'DynamicApiService', function ($scope, $http, $interval, $q, $mdDialog,$mdEditDialog, tosterFactory, DynamicApiService) {
        $scope.initView = function () {
            $scope.dataLoaded = [];
            $scope.viewOption = 'default';
            $scope.viewChoiceOption = 'default';
            var loadMdtModelPromise = $http.get('json-files/project-models/dynamic-md-table-models.json').then(
                function (result) {
                    tosterFactory.showCustomToast('Mdt models loaded', 'debug');
                    $scope.mdtModels = result.data;
                    console.log($scope.mdtModels);
                    $scope.displayObjEditModels = $scope.mdtModels[$scope.entityIdentifier]['mdt-edit-model'];

                },
                function (fail) { },function (error) { });
            var loadModelPromise = $http.get('json-files/entity-models/single-entity-models.json').then(
                function (result) {
                    //tosterFactory.showCustomToast('Single entity models loaded', 'info');
                    $scope.loadedModels = result.data;
                    //console.log($scope.loadedModels);
                    $scope.editableModel = $scope.loadedModels[$scope.entityIdentifier];
                },
                function () { });
            //lookupEntities
            var initPromice = DynamicApiService.getDynamicGridModel($scope.entityIdentifier).then(function (result) {
                $scope.lookupEntities = result.data.LookUpEntities;
                //console.log(result);
                //tosterFactory.showCustomToast('Lookups loaded successfully', 'info');
            }, function () { });


            var parameters = 'page=' + 1 + '&pageSize=' + 3;
            var apiControllerName = $scope.entityIdentifier; // this is "String from state ... manage to obj returnesfrom initiallization"
            var initDataPromice = $scope.getData(apiControllerName, parameters)

        }

        $scope.getData = function (apiControllerName, parameters) {
            return (DynamicApiService.getDynamicObjectData(apiControllerName, parameters).then(function (result) {
                $scope.loadingState = false;
                $scope.loadedData = result.data.Results;
                //console.log(result);
                //tosterFactory.showCustomToast('Data loaded successfully', 'info');
                $scope.pagOptions.totalItems = result.data.RowCount;

                //CurrentPage:1
                //Extras:null
                //PageCount:1
                //PageSize:10
                //Results:Array[7]
                //RowCount:7
            }, function () {

            }));
            //.then(function (result) { //Rest Get call for data using Api service to call Webapi
            //    if (result.data.Results.length < 1) {
            //        tosterFactory.showCustomToast('No Results found', 'info');
            //    }
            //    $scope.dataLoaded = result.data.Results; //apply loaded Data
            //    //$scope.gridApi.grid.options.totalItems = result.data.RowCount; //used to display paggination toal
            //    //$scope.gridApi.grid.modifyRows($scope.dynamicGrid.data);
            //    $scope.loadingState = false;
            //});
        }

        $scope.dynamicCell = 'selectcell';
        //<md-table-pagination 
        //md-limit="query.limit" 
        //md-limit-options="limitOptions" 
        //md-page="query.page" 
        //md-total="{{desserts.count}}" 
        //md-page-select="options.pageSelect" 
        //md-boundary-links="options.boundaryLinks" 
        //md-on-paginate="logPagination">
        //</md-table-pagination>
        $scope.pagOptions = {
            limit:5,
            limitOptions: [5, 10, 15],
            page: 1,
            totalItems: 0,
            pagChangeFun: $scope.pagChangeFun
        }

        $scope.selectedLines = []; //array to display selected lines
        
        $scope.pagChangeFun = function (page, limit) {
            console.log('page: ', page);
            console.log('limit: ', limit);
        }

        $scope.mdTableOptions = {
            rowSelection: true,//allow row selection
            multiSelect: true, // allow multi selection when rowselection is true
            autoSelect: false,
            decapitate: false, //view header or not 
            largeEditDialog: true,
            boundaryLinks: false, //external pag options
            limitSelect: true, //show page results option
            pageSelect: true //allow pag option to select page 
        };

        $scope.query = { order: 'Description', limit: 5, page: 1 };

        $scope.toggleLimitOptions = function () {
            $scope.limitOptions = $scope.limitOptions ? undefined : [5, 10, 15];
        };

        $scope.loadStuff = function () {
            $scope.promise = $timeout(function () {
                // loading
            }, 2000);
        }
        //onclick row
        $scope.logItem = function (item) { console.log(item.name, 'was selected');};
        //onchange order
        $scope.logOrder = function (order) { console.log('order: ', order); };

        //onEdit var 
        $scope.editComment = function (event, data , dfield) {
            event.stopPropagation(); // in case autoselect is enabled
            //edit dialog according to field type md-data-table settings
            var editDialog = {
                modelValue: data[dfield],
                placeholder: 'Add a comment',
                save: function (input) {
                    data[dfield] = input.$modelValue;
                },
                targetEvent: event,
                title: 'Add a ' + dfield,
                type: "number",
                validators: { 'md-maxlength': 30 }
            };

            if ($scope.displayObjEditModels[dfield] !== undefined && $scope.displayObjEditModels[dfield] !== null) {
                alert('Modelfound');
                console.log($scope.displayObjEditModels[dfield]);
                editDialog = angular.extend(editDialog, $scope.displayObjEditModels[dfield])
                console.log($scope.displayObjEditModels[dfield]);
            }


            if ($scope.displayObjEditModels[dfield] !== undefined && $scope.displayObjEditModels[dfield] !== null) {
                tosterFactory.showCustomToast('Display Obj of "' + dfield + '" Found', 'debug');
                console.log(editDialog);
                editDialog = angular.extend(editDialog, $scope.displayObjEditModels[dfield]);
            }
            var promise;

            if ($scope.mdTableOptions.largeEditDialog) {
                promise = $mdEditDialog.large(editDialog);
            } else {
                promise = $mdEditDialog.small(editDialog);
            }

            promise.then(function (ctrl) {
                var input = ctrl.getInput();
                input.$viewChangeListeners.push(function () {
                    input.$setValidity('test', input.$modelValue !== 'test');
                });
            });
        };
        $scope.displayRow = function (data ) { console.log(data); }
    }]);
//https://github.com/daniel-nagy/md-data-table#edit-dialogs
//Small Edit Dialogs
//$mdEditDialog.small(options);

//Parameter	Type	Description
//options	object	Small preset options.
//Property	Type	Default	Description
//clickOutsideToClose	bool	true	The user can dismiss the dialog by clicking anywhere else on the page.
//disableScroll	bool	true	Prevent user scroll while the dialog is open.
//escToClose	bool	true	The user can dismiss the dialog by clicking the esc key.
//focusOnOpen	bool	true	Will search the template for an md-autofocus element.
//messages	object	null	Error messages to display corresponding to errors on the ngModelController.
//modelValue	string	null	The initial value of the input element.
//placeholder	string	null	Placeholder text for input element.
//save	function	null	A callback function for when the use clicks the save button. The callback will receive the ngModelController. The dialog will close unless the callback returns a rejected promise.
//targetEvent	event	null	The event object. This must be provided and it must be from a table cell.
//type	string	"text"	The value of the type attribute on the input element.
//validators	object	null	Optional attributes to be placed on the input element.

//Large Edit Dialogs
//$mdEditDialog.large(options);

//cancel	string	"Cancel"	Text to dismiss the dialog without saving.
//clickOutsideToClose	bool	true	The user can dismiss the dialog by clicking anywhere else on the page.
//disableScroll	bool	true	Prevent user scroll while the dialog is open.
//escToClose	bool	true	The user can dismiss the dialog by clicking the esc key.
//focusOnOpen	bool	true	Will search the template for an md-autofocus element.
//messages	object	null	Error messages to display corresponding to errors on the ngModelController.
//modelValue	string	null	The initial value of the input element.
//ok	string	"Save"	Text to submit and dismiss the dialog.
//placeholder	string	null	Placeholder text for input element.
//save	function	null	A callback function for when the use clicks the save button. The callback will receive the ngModelController. The dialog will close unless the callback returns a rejected promise.
//targetEvent	event	null	The event object. This must be provided and it must be from a table cell.
//title	string	"Edit"	Dialog title text.
//type	string	"text"	The value of the type attribute on the input element.
//validators	object	null	Optional attributes to be placed on the input element.


//Roll Your Own
//$mdEditDialog.show(options);

//Parameter	Type	Description
//options	object	Dialog options.
//Property	Type	Default	Description
//bindToController	bool	false	If true, properties on the provided scope object will be bound to the controller
//clickOutsideToClose	bool	true	The user can dismiss the dialog by clicking anywhere else on the page.
//controller	function string	null	Either a constructor function or a string register with the $controller service. The controller will be automatically injected with $scope and $element. Remember to annotate your controller if you will be minifying your code.
//controllerAs	string	null	An alias to publish your controller on the scope.
//disableScroll	bool	true	Prevent user scroll while the dialog is open.
//escToClose	bool	true	The user can dismiss the dialog by clicking the esc key.
//focusOnOpen	bool	true	Will search the template for an md-autofocus element.
//locals	object	null	Optional dependancies to be injected into your controller. It is not necessary to inject registered services, the $injector will provide them for you.
//resolve	object	null	Similar to locals but waits for promises to be resolved. Once the promises resolve, their return value will be injected into the controller and the dialog will open.
//scope	object	null	Properties to bind to the new isolated scope.
//targetEvent	event	null	The event object. This must be provided and it must be from a table cell.
//template	string	null	The template for your dialog.
//templateUrl	string	null	A URL to fetch your template from.