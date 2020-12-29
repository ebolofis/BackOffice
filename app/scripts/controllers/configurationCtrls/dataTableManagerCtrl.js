'use strict';
angular.module('posBOApp')
    .controller('DataTableManagerCtrl', ['$scope', '$http', '$interval', 'tosterFactory', '$mdDialog', function ($scope, $http, $interval, tosterFactory, $mdDialog) {
        $scope.initView = function () {
            $scope.viewOption = 'default';
            $scope.viewChoiceOption = 'default';
            var loadModelPromise = $http.get('json-files/entity-models/single-entity-models.json').then(
                function (result) {
                    tosterFactory.showCustomToast('Single entity models loaded', 'info');
                    $scope.loadedModels = result.data;
                    console.log($scope.loadedModels);
                },
                function (error) { });
        }
        $scope.switchView = function (opt) {
            $scope.viewOption = opt;
            switch (opt) {
                case 'models': $scope.viewChoiceOption = 'default'; break;
                case 'manageSelectedModel': $scope.viewChoiceOption = 'models'; break;
                case 'default': $scope.viewChoiceOption = 'default'; break;
                default:
                    tosterFactory.showCustomToast('No view option', 'info');
                    $scope.viewOption = 'default'; $scope.viewChoiceOption = 'default'; break;
            }
        }
        $scope.selectModel = function (identity, properties) {
            $scope.sModel = { identity: identity }
            $scope.sModel = angular.extend($scope.sModel , properties)
            console.log($scope.sModel);
        }
        //$http.get('/someUrl', config).then(successCallback, errorCallback);
        //$http.post('/someUrl', data, config).then(successCallback, errorCallback);
        $scope.entityLength = function (value) {
            var l = Object.getOwnPropertyNames(value.repoOptions);
            return l.length;
        }
        $scope.generateJson = function (object) {
            var dataModel = {};
            dataModel.jsonGenerated = JSON.stringify(object);
            var templateOptions = {
                modalTitle: 'Export text of generated Obj',
                entityId: 'jsonExportText'
            };
            popUpEditModal(templateOptions, dataModel).then();
            //var loadModelPromise = $http.post('json-files/entity-models/single-entity-models.json', $scope.loadedModels).then(
            //    function (result) {
            //        tosterFactory.showCustomToast(type + 'models updated successfully', 'success');
            //    }, function (result) {
            //        tosterFactory.showCustomToast(type + 'models failed to update', 'fail');
            //    });
        }

        //Remove model 
        $scope.removeModelEntity = function (name, model) {
            if (name == undefined || name == null || $scope.loadedModels[name] == undefined) {
                tosterFactory.showCustomToast('No model matches ' + name, 'warning');
            }
            else {
                var deleteDialog = $mdDialog.confirm().title('Deleting Model').textContent('Proceed and delete selected "'+ name+'" model?')
                .ariaLabel('dynamicrm' + $scope.entityIdentifier).ok('Delete').cancel('Cancel');
                $mdDialog.show(deleteDialog).then(function () {
                    delete $scope.loadedModels[name];
                })
            }
        }
        //Add-Edit Model IdREf
        $scope.editModelEntity = function (callAction,name,model) {
            var dataModel = {};
            dataModel.DescriptionField = (name !== undefined && name !== null) ? name :'';
            var templateOptions = {
                modalTitle: (callAction == 'add') ? 'Insert new Model' : 'Edit current Model',
                entityId: 'singleInputField'
            };
            popUpEditModal(templateOptions, dataModel).then(
                function (ret) {
                    switch (callAction) {
                        case 'add':
                            $scope.loadedModels[ret.data.DescriptionField] = {
                                repoOptions: {},
                                displayOptions: {},
                            }
                            break;
                        case 'edit':
                            delete $scope.loadedModels[name];
                            $scope.loadedModels[ret.data.DescriptionField] = model;
                            $scope.selectModel(ret.data.DescriptionField, model);
                            break;
                        default: alert('no action caller'); break;
                    }
                },
                function (fail) { }
            )
        }
        //Add-Edit property field on selected model
        $scope.editModelProperty = function (callAction, name, model) {
            var dataModel ;
            (model === undefined || model === null) ? dataModel = {} : dataModel = angular.copy(model);
            dataModel.DescriptionField = name;

            var templateOptions = {
                modalTitle: (callAction == 'add') ? 'Insert new Model' : 'Edit current Model',
                entityId: 'singleEntityForm'
            };
            popUpEditModal(templateOptions, dataModel).then(function (ret) {
                var newm = {}; newm[ret.data.DescriptionField] = ret.data;
                delete newm[ret.data.DescriptionField].DescriptionField;
                switch (callAction) {
                    case 'add':
                        $scope.sModel.repoOptions = angular.extend($scope.sModel.repoOptions, newm);
                        break;
                    case 'edit':
                        delete $scope.sModel.repoOptions[name];
                        $scope.sModel.repoOptions = angular.extend($scope.sModel.repoOptions, newm);
                        break;
                    default: alert('no action caller'); break;
                }
            }, function (fail) { })
        }
        function popUpEditModal(templateOptions , dataModel) {
            return ($mdDialog.show({
                controller: function ($mdDialog, $filter, templateOptions, dataModel) {
                    var dfm = this;
                    dfm.templateOptions = templateOptions;
                    dfm.dataModel = angular.copy(dataModel);
                    console.log(dfm.dataModel);
                    dfm.allDataTypes = ['string', 'number', 'boolean', 'array', 'object'];
                    dfm.hide = function () { $mdDialog.hide(); };
                    dfm.cancel = function () { $mdDialog.cancel(); };
                    dfm.confirm = function (answer) {
                        var ret = { data: dfm.dataModel }
                        $mdDialog.hide(ret);
                    }
                },
                controllerAs: 'dfm',
                templateUrl: '../app/scripts/directives/views-directives/data-table-manager/edit-model-modal.html',
                parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: {
                    templateOptions: function () { return templateOptions; },
                    dataModel: function () { return dataModel; }
                }
            })
            )
    
        }

    }])

