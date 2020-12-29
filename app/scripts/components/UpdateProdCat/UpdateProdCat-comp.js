/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />
//import { Component } from '@angular/core';
//import { FormControl } from '@angular/forms';
angular.module('posBOApp')
    .component('prodcatvatcomp', {
        templateUrl: 'app/scripts/components/vodafone-promos/templates/promos-comp.html',
        controller: 'ChangeProductCategoriesVatCTRL',
        controllerAs: 'ChProdCatVatCont'
    })
    .controller('ChangeProductCategoriesVatCTRL', ['$scope', '$mdDialog', '$mdMedia', 'ChangeProductCategoriesVatFactory', 'dataUtilFactory', 'tosterFactory', '$q', 'DynamicApiService', function ($scope, $mdDialog, $mdMedia, ChangeProductCategoriesVatFactory, dataUtilFactory, tosterFactory, $q, DynamicApiService) {

        var ChProdCatVatCont = this; 
        var dtu = dataUtilFactory;
        ChProdCatVatCont.restbusy = false; ChProdCatVatCont.hasError = false;
        ChProdCatVatCont.$onInit = function () { };

        ChProdCatVatCont.initView = function () {
            ChProdCatVatCont.ProdCat = [];
            ChProdCatVatCont.Vat = [];
            ChProdCatVatCont.GetProdCat();
            ChProdCatVatCont.GetAllAvailableVatValues();
            ChProdCatVatCont.SelectedProdCats = [];
            ChProdCatVatCont.selectedVat = [];
        };




        $scope.ConvertVatValues = function () {

                                var x = ChProdCatVatCont.selectedVat;
                                var y = ChProdCatVatCont.SelectedProdCats;
                                var retdata = {};

                                 retdata.prodcatlist = y;
                                 retdata.vat = x;

                                 var url = ChangeProductCategoriesVatFactory.apiInterface.UpdateProdCat.POST.UpdateProdCatVat;
                                    DynamicApiService.postProdCatVatChanges('ProductCategories', url, retdata).then(function (result) {
                                        if (result.status = 200) {
                                            tosterFactory.showCustomToast('Vat Value was Updated', 'success');
                                        } else {
                                            tosterFactory.showCustomToast('No Product Categories Loaded', 'success');
                                        }
                                    }).catch(function (rejection) {
                                        tosterFactory.showCustomToast('The Vat Value Update failed', 'fail');
                                        console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                                        return -1;
                                    }).finally(function () {
                                        ChProdCatVatCont.restbusy = false;
                                    });

                            }

        //$scope.cancel = function () { $mdDialog.cancel(); };


        //Get All Enabled Product Categories
        ChProdCatVatCont.GetProdCat = function () {
            var url = ChangeProductCategoriesVatFactory.apiInterface.UpdateProdCat.GET.GetProductCategories;
            DynamicApiService.getV3('ProductCategories', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Product Categories  Loaded', 'success');
                    ChProdCatVatCont.ProdCat = result.data;
                } else {
                    tosterFactory.showCustomToast('No Product Categories Loaded', 'success');
                    ChProdCatVatCont.ProdCat = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Product Categories failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                ChProdCatVatCont.hasError = true;
                ChProdCatVatCont.ProdCat = [];
                return -1;
            }).finally(function () {
                ChProdCatVatCont.restbusy = false;
            });
        }

        //Get All Available Vat rows
        ChProdCatVatCont.GetAllAvailableVatValues = function () {
            var url = ChangeProductCategoriesVatFactory.apiInterface.UpdateProdCat.GET.GetAllAvailableVatValues;
            DynamicApiService.getV3('Vat', url).then(function (result) {
                if (result && result.data != null) {
                    tosterFactory.showCustomToast('Vat Values  Loaded', 'success');
                    ChProdCatVatCont.Vat = result.data;
                } else {
                    tosterFactory.showCustomToast('No Vat Values Loaded', 'success');
                    ChProdCatVatCont.Vat  = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Vat Values failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                ChProdCatVatCont.hasError = true;
                ChProdCatVatCont.Vat  = [];
                return -1;
            }).finally(function () {
                ChProdCatVatCont.restbusy = false;
            });
        }

    }])