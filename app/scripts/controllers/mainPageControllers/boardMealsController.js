'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:PosInfoAssocsController
 * @description
 * # PosInfoAssocsController
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .controller('BoardMealsController', ['tosterFactory', '$stateParams', '$scope', '$http', '$log', '$timeout', '$q', '$interval', '$uibModal', 'DynamicApiService', 'dataUtilFactory',
        function (tosterFactory, $stateParams, $scope, $http, $log, $timeout, $q, $interval, $uibModal, DynamicApiService, dataUtilFactory) {
            $scope.initView = function () {
                $scope.selectedMeal = null;
                var PriceListPromise = $scope.getDropDownLookUps('PriceList');
                var productCategoriesPromise = $scope.getDropDownLookUps('ProductCategories');
                $q.all([PriceListPromise]).then(function () {
                    var AllowedMealsPerBoardPromise = $scope.getDropDownLookUps('AllowedMealsPerBoard'); //get pagged Results of Products
                });
            }
            $scope.getDropDownLookUps = function (entity, customparams) {
                switch (entity) {
                    case 'PriceList': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                        $scope.priceLists = result.data;
                        $scope.priceListsEnum = dataUtilFactory.createEnums(result.data, {}, 'Id', 'Description');
                        $scope.priceListsDropDown = dataUtilFactory.createMapDropdown($scope.priceListsEnum);
                        $scope.priceListsDropDown.unshift({ name: "---", value: null })
                    }, function (reason) {
                        tosterFactory.showCustomToast('Loading PriceList failed', 'fail');
                        console.log('Fail Load'); console.log(reason);
                    }, function (error) {
                        tosterFactory.showCustomToast('Loading PriceList error', 'error');
                        console.log('Error Load'); console.log(error);
                    })); break;
                    case 'ProductCategories': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                        $scope.productCategories = result.data;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Loading ProductCategories failed', 'fail');
                        console.log('Fail Load'); console.log(reason);
                    }, function (error) {
                        tosterFactory.showCustomToast('Loading ProductCategories error', 'error');
                        console.log('Error Load'); console.log(error);
                    })); break;
                    case 'AllowedMealsPerBoard': return (DynamicApiService.getAttributeRoutingData("AllowedMealsPerBoard", "GetAll", "", "").then(function (result) {
                        tosterFactory.showCustomToast('Allowed meals loaded successfully', 'success');
                        $scope.allowedMeals = result.data;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Loading AllowedMealsPerBoard failed', 'fail');
                        console.log('Fail Load'); console.log(reason);
                    }, function (error) {
                        tosterFactory.showCustomToast('Loading AllowedMealsPerBoard error', 'error');
                        console.log('Error Load'); console.log(error);
                    })); break;
                    default: break;
                }
            }
            $scope.clickSelectAllowedMeal = function (meal) {
                //($scope.selectedMeal == meal) ? $scope.selectedMeal = null :
                $scope.selectedMeal = meal;
                //console.log($scope.selectedMeal);
            }
            $scope.pricelistChanged = function () {
                $scope.selectedMeal.IsEdited = true;
                $scope.selectedMeal.PricelistDescription = $scope.priceListsEnum[$scope.selectedMeal.PriceListId];
            }
            $scope.deletedFilter = function (item) {
                return (item.IsDeleted == true) ? false : true;
            }
            //display filter of allowed meals
            $scope.includedFilter = function (item) {
                return (item.IsDeleted == true) ? false : true;
            }
            //filter for available pcats
            $scope.excludedFilter = function (item) {
                if ($scope.selectedMeal == null) return true;
                var index = -1;
                for (var i = 0; i < $scope.selectedMeal.Details.length; i++) {
                    if ($scope.selectedMeal.Details[i].ProductCategoryId == item.Id) {
                        index = i;
                        break;
                    }
                }
                var ret = false;
                (index < 0) ? ret = true : (($scope.selectedMeal.Details[index].IsDeleted == true) ? ret = true : ret = false);
                return ret;
            }

            $scope.includeOptions = function () {
                var selectedArr = [], toAdd = [], addObj = { Id: 0, IsDeleted: false, AllowedMealsPerBoardId: $scope.selectedMeal.Id, IsEdited: true, }

                $scope.productCategories = $scope.productCategories.filter(function (it) {
                    if (it.selected == true) {
                        it.selected = false; selectedArr.push(it);
                    }
                    return it;
                })
                angular.forEach(selectedArr, function (value) {
                    var index = -1;
                    for (var i = 0; i < $scope.selectedMeal.Details.length; i++) {
                        if ($scope.selectedMeal.Details[i].ProductCategoryId == value.Id) {
                            index = i; break;
                        }
                    }
                    if (index != -1) {
                        $scope.selectedMeal.Details[i].IsDeleted = false;
                        $scope.selectedMeal.Details[i].IsEdited = true;
                    } else {
                        var tmp = angular.copy(addObj);
                        tmp.ProductCategoryId = value.Id;
                        tmp.ProductCategoryDescription = value.Description;
                        toAdd.push(tmp);
                    }
                })
                if (toAdd.length > 0)
                    $scope.selectedMeal.IsEdited = true;
                $scope.selectedMeal.Details = $scope.selectedMeal.Details.concat(toAdd);
            }

            $scope.excludeOptions = function () {
                $scope.selectedMeal.IsEdited = true;
                $scope.selectedMeal.Details = $scope.selectedMeal.Details.filter(function (item) {
                    if (item.selected == true) {
                        item.selected = false; item.IsEdited = true; item.IsDeleted = true;
                    } return item;
                })
            }

            $scope.insertBoardMeal = function () {
                var singleFormModel = getBoardMealSFE();
                singleFormModel.form[1].titleMap = $scope.priceListsDropDown;
                //http://angularscript.com/fully-customizable-fuelux-wizard-angular-directive/
                var modalInstance = $uibModal.open({
                    backdrop: "static", width: '1500px', animation: true,
                    template: function (element, attrs) {
                        var html1 = '<div><div class="modal-header"><h3 class="modal-title">Add new Board Meal</h3></div><div class="modal-body">';
                        var html2 = '<form name="createRowEntryForm" sf-schema="si_modal.schema" sf-form="si_modal.form" sf-model="si_modal.entity"></form>';
                        var html3 = '</div><div class="modal-footer"><button class="hvr-fade hvr-warning" style="text-decoration:none; height: inherit;" ng-click="si_modal.dismiss()">Cancel</button><button class="hvr-fade hvr-success" style="text-decoration:none; height: inherit;" ng-click="si_modal.save()">Save</button></div></div>';
                        var html = html1 + html2 + html3;
                        return html;
                    },
                    controller: 'SingleFormInsertModalCtrl', controllerAs: 'si_modal',
                    resolve: {
                        filtersObjArray: function () { return $scope.filtersObjArray; },
                        singleFormModel: function () { return angular.copy(singleFormModel); }
                    }
                });
                modalInstance.result.then(function (data) {
                    data.PricelistDescription = $scope.priceListsEnum[data.PriceListId];
                    //DynamicApiService.postAttributeRoutingData('AllowedMealsPerBoard', 'Add', data).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    //    $scope.getDropDownLookUps('AllowedMealsPerBoard');
                    //}, function (reason) {
                    //});
                    $scope.allowedMeals.unshift(data);
                }, function (reason) {
                    //modal closed with action close button or [X] modify your actions here
                });
            };
            $scope.popConfirmationMsgModal = function (modalmsg) {
                return ($uibModal.open({
                    animation: false, backdrop: "static",
                    templateUrl: '../app/scripts/directives/gridDirectives/simpleMessageModal.html',
                    controller: 'SimpleMessageModalCtrl', controllerAs: 'smm',
                    resolve: { message: function () { return modalmsg; } }
                })
                );
            }
            $scope.deleteBoardMeal = function (item) {
                var msg = 'You are about to delete current BoardMeal. Proceed ?'
                $scope.popConfirmationMsgModal(msg).result.then(function (data) {
                    if (item == $scope.selectedMeal)
                        $scope.selectedMeal = null;
                    item.IsEdited = true;
                    item.IsDeleted = true;
                })

            }
            $scope.saveBoardMeals = function () {
                $scope.savingProcess = true;
                //all edited
                var edited = $scope.allowedMeals.filter(function (item) {
                    return (item.IsEdited == true);
                })
                //loaded and deleted
                var deleted = edited.filter(function (item) {
                    return (item.IsDeleted == true && item.Id != 0);
                })
                //details loaded and deleted belonging to deleted
                angular.forEach(deleted, function (value) {
                    value.Details = value.Details.filter(function (item) {
                        item.IsDeleted = true;
                        return (item.Id != 0);
                    })
                })
                var edited = edited.filter(function (item) { return (item.IsEdited == true && item.IsDeleted != true); })
                angular.forEach(edited, function (value) {
                    value.Details = value.Details.filter(function (item) {
                        return ((item.IsEdited == true && item.IsDeleted == true && item.Id != 0) || (item.IsEdited == true && item.IsDeleted != true && item.Id == 0));
                    })
                })
                console.log('edited:'); console.log(edited);
                console.log('deleted:'); console.log(deleted);

                var modifiedObjs = edited.concat(deleted);
                if (modifiedObjs.length > 0) {
                    $scope.selectedMeal = null;
                    DynamicApiService.putAttributeRoutingData('AllowedMealsPerBoard', 'UpdateRange', modifiedObjs).then(function (result) { //Rest Get call for data using Api service to call Webapi
                        $scope.savingProcess = false;
                        tosterFactory.showCustomToast('Allowed meals saved successfully. Loading new Entries..', 'success');
                        $scope.getDropDownLookUps('AllowedMealsPerBoard');
                    }, function (reason) {
                        $scope.savingProcess = false;
                        tosterFactory.showCustomToast('Updating modified Allowed meals failed', 'fail');
                        console.log('Fail Load'); console.log(reason);
                    }, function (error) {
                        $scope.savingProcess = false;
                        tosterFactory.showCustomToast('Updating modified Allowed meals error', 'error');
                        console.log('Error Load'); console.log(error);
                    });
                } else {
                    $scope.savingProcess = false;
                }

            }


        }])
    .controller('BoardMealsCtrl', ['$scope', '$locale', function ($scope, $locale) {

        if ($scope.data === undefined) { alert('Error Not Capable data for Meals Notice'); }
        var retSFE = listBoardMealSFE();
        $scope.sch = retSFE.schema; $scope.form = retSFE.form; $scope.entity = $scope.data;
        $scope.valueChanged = function (fkey, value) {
            if (fkey == 'AllowedDiscountAmount' || fkey == 'AllowedDiscountAmountChild')
                $scope.data[fkey] = Number(value.toFixed(2));
            $scope.data.IsEdited = true;
        }
        function listBoardMealSFE() {
            var entity = { PriceListId: null, AllowedMeals: 0, AllowedDiscountAmount: 0, AllowedMealsChild: 0, AllowedDiscountAmountChild: 0 };
            var form = [
                {
                    type: "section", htmlClass: "row noPadding", feedback: false,
                    items: [{
                        type: "section", htmlClass: 'col-md-6 col-xs-6 noPadding', feedback: false,
                        items: [{ fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: 'BoardDescription', feedback: false, onChange: "valueChanged(form.key,modelValue)" }]
                    }, {
                        type: "section", htmlClass: 'col-md-6 col-xs-6 noPadding', feedback: false,
                        items: [{
                            fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: 'BoardId', feedback: false,
                            onChange: "valueChanged(form.key,modelValue)"
                        }]
                    }
                    ]
                },
                {
                    type: "section", htmlClass: "row noPadding", feedback: false,
                    items: [{
                        type: "section", htmlClass: 'col-md-4 col-xs-4 noPadding', feedback: false,
                        items: [{ fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', title: 'Pricelist', }]
                    }, {
                        type: "section", htmlClass: 'col-md-8 col-xs-8 noPadding', feedback: false,
                        items: [{ fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: 'PriceListId', feedback: false, type: 'select', titleMap: $scope.dropDown, notitle: true, onChange: "valueChanged(form.key,modelValue)" }]
                    }
                    ]
                },
                {
                    type: "section", htmlClass: "row noPadding", feedback: false,
                    items: [
                        {
                            type: "section", htmlClass: 'col-md-4 col-xs-4 noPadding', feedback: false,
                            items: [
                                { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', title: 'Adults', feedback: false },
                                { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', title: 'Children', feedback: false },
                            ]
                        },
                        {
                            type: "section", htmlClass: 'col-md-4 col-xs-4 noPadding', feedback: false,
                            items: [
                                { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: "AllowedMeals", notitle: true, feedback: false, onChange: "valueChanged(form.key,modelValue)" },
                                { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: "AllowedMealsChild", notitle: true, feedback: false, onChange: "valueChanged(form.key,modelValue)" },
                            ]
                        },
                        {
                            type: "section", htmlClass: 'col-md-4 col-xs-4 noPadding', feedback: false,
                            items: [
                                { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: "AllowedDiscountAmount", notitle: true, feedback: false, onChange: "valueChanged(form.key,modelValue)" },
                                { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: "AllowedDiscountAmountChild", notitle: true, feedback: false, onChange: "valueChanged(form.key,modelValue)" },
                            ]
                        },
                    ]
                },
            ];
            var schema = {
                type: 'object', title: "Comment",
                properties: {
                    BoardDescription: { type: 'string', title: 'BoardDescription', validationMessage: "You need to add a Desciption.", readonly: false },
                    BoardId: { type: 'string', title: 'BoardId', validationMessage: "You need to add a Board sort Id.", readonly: false },
                    PriceListId: { title: 'Pricelist', type: 'number', htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select Action...', nullLabel: '---', readonly: false },
                    AllowedMeals: { type: 'integer', feedback: false, readonly: false },
                    AllowedDiscountAmount: { type: 'number', format: "currency", feedback: false, readonly: false },
                    AllowedMealsChild: { type: 'integer', feedback: false, readonly: false },
                    AllowedDiscountAmountChild: { type: 'number', format: "currency", feedback: false, readonly: false },
                },
                required: ['PriceListId']
            };
            var ret = { schema: schema, form: form, entity: entity }
            return ret;
        }
    }])
    .directive('boardMealsCell', function () {
        return {
            controller: 'BoardMealsCtrl',
            restrict: 'E',
            scope: {
                data: '=',
                dropDown: '='
            },
            template: '<form sf-schema="sch" sf-form="form" sf-model="entity" ng-model="data"></form>',
        };
    })

function getBoardMealSFE() {
    var entity = {
        Id: 0, BoardDescription: "", BoardId: "",
        PriceListId: null, PricelistDescription: "",
        AllowedMeals: 0, AllowedDiscountAmount: 0,
        AllowedMealsChild: 0, AllowedDiscountAmountChild: 0,
        IsEdited: true,
        Details: [],
        IsDeleted: false,
    };
    var form = [
        {
            type: "section", htmlClass: "row",
            items: [
                { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'col-md-6 col-xs-6 noPadding', key: "BoardDescription" },
                { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'col-md-6 col-xs-6 noPadding', key: "BoardId" }
            ]
        },
        { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: 'PriceListId', type: 'select', titleMap: [] },
        {
            type: "section", htmlClass: "row",
            items: [
                { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'col-md-6 col-xs-6 noPadding', key: "AllowedMeals" },
                { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'col-md-6 col-xs-6 noPadding', key: "AllowedDiscountAmount" }
            ]
        },
        {
            type: "section", htmlClass: "row",
            items: [
                { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'col-md-6 col-xs-6 noPadding', key: "AllowedMealsChild" },
                { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'col-md-6 col-xs-6 noPadding', key: "AllowedDiscountAmountChild" }
            ]
        },
    ];
    var schema = {
        type: 'object',
        title: "Comment",
        properties: {
            BoardDescription: { type: 'string', title: 'BoardDescription', validationMessage: "You need to add a Desciption.", readonly: false },
            BoardId: { type: 'string', title: 'BoardId', validationMessage: "You need to add a Board sort Id.", readonly: false },
            PriceListId: { title: 'Pricelist', type: 'number', htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select Action...', nullLabel: '---', readonly: false },
            AllowedMeals: { type: 'integer', title: 'Allowed Adult meals', readonly: false },
            AllowedDiscountAmount: { type: 'number', title: 'Discount adult amount', readonly: false },
            AllowedMealsChild: { type: 'integer', title: 'Allowed Child meals', readonly: false },
            AllowedDiscountAmountChild: { type: 'number', title: 'Discount child amount', readonly: false },
        },
        required: ['BoardDescription', 'BoardId', 'PriceListId']
    };
    var ret = {
        schema: schema,
        form: form,
        entity: entity
    }
    return ret;
}