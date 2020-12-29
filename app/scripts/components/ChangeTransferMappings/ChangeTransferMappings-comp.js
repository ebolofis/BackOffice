/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />


angular.module('posBOApp')
    .component('mappingsComp', {
        templateUrl: 'app/scripts/components/vodafone-promos/templates/promos-comp.html',
        controller: 'ChangeTransferMappingsCTRL',
        controllerAs: 'ChTransMapCtrl'
    })
    .controller('ChangeTransferMappingsCTRL', ['$scope', 'ChangeTransferMappingsFactory', 'dataUtilFactory', 'tosterFactory', '$q', 'DynamicApiService', function ($scope, ChangeTransferMappingsFactory, dataUtilFactory, tosterFactory, $q, DynamicApiService) {
        var ChTransMapCtrl = this;
        var dtu = dataUtilFactory;
        ChTransMapCtrl.restbusy = false; ChTransMapCtrl.hasError = false;
        ChTransMapCtrl.$onInit = function () { };

        ChTransMapCtrl.initView = function () {
            ChTransMapCtrl.ProdCat = [];
            ChTransMapCtrl.HotelInf = [];
            ChTransMapCtrl.GetProdCat();
            ChTransMapCtrl.GetHotelInfos();
            ChTransMapCtrl.SelectedProdCat = [];
            ChTransMapCtrl.selectedHotelInfo = [];
            ChTransMapCtrl.getpmsDepartments = [];
            ChTransMapCtrl.selectedPmsDepartments = [];
            ChTransMapCtrl.TransferMappings = [];
            ChTransMapCtrl.HotelId = [];
        };


        //Get All Enabled Product Categories
        ChTransMapCtrl.GetProdCat = function () {
            var url = ChangeTransferMappingsFactory.apiInterface.ChangeTransferMappings.GET.GetAllEnabledProductCategories;
            DynamicApiService.getV3('ProductCategories', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Product Categories  Loaded', 'success');
                    ChTransMapCtrl.ProdCat = result.data;
                } else {
                    tosterFactory.showCustomToast('No Product Categories Loaded', 'success');
                    ChTransMapCtrl.ProdCat = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Product Categories failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                ChTransMapCtrl.hasError = true;
                ChTransMapCtrl.ProdCat = [];
                return -1;
            }).finally(function () {
                ChTransMapCtrl.restbusy = false;
            });
        }

        //GetHotelInfo
        ChTransMapCtrl.GetHotelInfos = function () {

            var url = ChangeTransferMappingsFactory.apiInterface.ChangeTransferMappings.GET.GetAllHotelInfo;
            DynamicApiService.getV3('HotelInfo', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Hotel Info Loaded', 'success');
                    ChTransMapCtrl.HotelInf = result.data;
                } else {
                    tosterFactory.showCustomToast('No Hotel Info Loaded', 'success');
                    ChTransMapCtrl.HotelInf = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Hotel Info failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                ChTransMapCtrl.hasError = true;
                ChTransMapCtrl.HotelInf = [];
                return -1;
            }).finally(function () {
                ChTransMapCtrl.restbusy = false;
            });
        }

        $scope.GetDepartments = function () {
          
            var selectedhotelinfo = ChTransMapCtrl.selectedHotelInfo;
            var url = ChangeTransferMappingsFactory.apiInterface.ChangeTransferMappings.POST.GetPMSDepartments;
            DynamicApiService.postGetPmsDepartments('HotelInfo', url, selectedhotelinfo).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('PMS Departments Info Loaded', 'success');
                    ChTransMapCtrl.getpmsDepartments = result.data;
                } else {
                    tosterFactory.showCustomToast('No PMS Departments Info Loaded', 'success');
                    ChTransMapCtrl.getpmsDepartments = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading PMS Departments Info failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                ChTransMapCtrl.hasError = true;
                ChTransMapCtrl.getpmsDepartments = [];
                return -1;
            }).finally(function () {
                ChTransMapCtrl.restbusy = false;
            });

        }

        $scope.GetTransferMappings = function () {
            var obj = {};
            obj.HotelId = ChTransMapCtrl.HotelId;
           obj.ProdCatId  = ChTransMapCtrl.SelectedProdCat;

           var url = ChangeTransferMappingsFactory.apiInterface.ChangeTransferMappings.POST.GetTransferMappings;
            DynamicApiService.postGetTransferMappings('HotelInfo', url,obj).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Transfer Mappings  Loaded', 'success');
                    ChTransMapCtrl.TransferMappings = result.data;
                } else {
                    tosterFactory.showCustomToast('No Transfer Mappings Loaded', 'success');
                    ChTransMapCtrl.TransferMappings = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Transfer Mappings  failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                ChTransMapCtrl.hasError = true;
                ChTransMapCtrl.TransferMappings = [];
                return -1;
            }).finally(function () {
                ChTransMapCtrl.restbusy = false;
            });
       
        }

        $scope.UpdateTransferMappings = function () {

            var obj = {};
            obj.newPmsDepartmentId = ChTransMapCtrl.newPmsDepId;
            obj.newPmsDescr = ChTransMapCtrl.newPmsDepDesc;
            obj.HotelId = ChTransMapCtrl.HotelId;
            obj.ProdCatId = ChTransMapCtrl.SelectedProdCat;
            obj.OldPmsDepartmentId = ChTransMapCtrl.selectedTransferMappings;

            var url = ChangeTransferMappingsFactory.apiInterface.ChangeTransferMappings.POST.UpdateTransferMappings;
            DynamicApiService.postGetTransferMappings('HotelInfo', url, obj).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Updated Mappings successfully', 'success');
                    ChTransMapCtrl.TransferMappings = result.data;
                } else {
                    tosterFactory.showCustomToast('Did not Update Mappings ', 'success');
                    ChTransMapCtrl.TransferMappings = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Updating Transfer Mappings  failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                ChTransMapCtrl.hasError = true;
                ChTransMapCtrl.TransferMappings = [];
                return -1;
            }).finally(function () {
                ChTransMapCtrl.restbusy = false;
            });

        }


    }])