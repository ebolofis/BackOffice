/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />
angular.module('posBOApp')
    .component('tradingHoursComp', {
        templateUrl: 'app/scripts/components/table-reservation/templates/trading-hours-comp.html',
        controller: 'TradingHoursCompCTRL',
        controllerAs: 'TradMain'
    })
    .controller('TradingHoursCompCTRL', ['$scope', '$mdDialog', 'trFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', '$mdMedia', function ($scope, $mdDialog, trFactory, dataUtilFactory, tosterFactory, DynamicApiService, $mdMedia) {
        var TradMain = this;
        var dtu = dataUtilFactory;
        TradMain.$onInit = function () { };

        TradMain.initView = function () {
            TradMain.TradingHoursModel = [];
            TradMain.GetTradingHours();
        };

        $scope.showModal = false;
        $scope.open = function (row) {
            $scope.shortRow = row;
            $scope.showModal = !$scope.showModal;
        };

        //API CALL rest get Trading Hours
        TradMain.GetTradingHours = function () {
            var url = trFactory.apiInterface.TradingHours.GET.GetTradingHours;
            DynamicApiService.getV3('Restaurants', url).then(function (result) {

                TradMain.TradingHoursModel = result.data;

            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Trading Hours failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                TradMain.TradingHoursModel = [];
            }).finally(function () {
            });
        }

        //Edit Trading Hours
        $scope.editTradingHours = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'TradingHours') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'tradingHours',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
            //variable to handle 3 entities and 2 modes of edit and add
            var actionname = {
                type: type,
                action: action
            };
            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
            })
                .then(function (retdata) {
                    //Update api/Store
                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)

                    var startTime;
                    var endTime;

                    if (retdata.TimeFrom instanceof Date) {
                        var shh = retdata.TimeFrom.getHours();
                        var nshh = ("0" + shh).slice(-2);
                        var smm = retdata.TimeFrom.getMinutes();
                        var nsmm = ("0" + smm).slice(-2);
                        var sss = retdata.TimeFrom.getSeconds();
                        var nsss = ("0" + sss).slice(-2);
                        startTime = nshh + ":" + nsmm + ":" + nsss;
                    }
                    else {
                        startTime = retdata.TimeFrom._i;
                    }
                    if (retdata.TimeTo instanceof Date) {
                        var ehh = retdata.TimeTo.getHours();
                        var nehh = ("0" + ehh).slice(-2);
                        var emm = retdata.TimeTo.getMinutes();
                        var nemm = ("0" + emm).slice(-2);
                        var ess = retdata.TimeTo.getSeconds();
                        var ness = ("0" + ess).slice(-2);
                        endTime = nehh + ":" + nemm + ":" + ness;
                    }
                    else {
                        endTime = retdata.TimeTo._i;
                    }

                    TradMain.TradingHoursModel.TimeFrom = startTime;
                    TradMain.TradingHoursModel.TimeTo = endTime;

                    DynamicApiService.postV3('Restaurants', 'UpdateTradingHours', TradMain.TradingHoursModel).then(function (result) {
                        tosterFactory.showCustomToast('Trading Hours updated succesfully', 'success');
                    }, function (reason) {
                        tosterFactory.showCustomToast('Trading Hours updated failed', 'fail');
                        console.log('Fail update'); console.log(reason);
                    }, function (error) {
                        tosterFactory.showCustomToast('Trading Hours update error', 'error');
                        console.log('Error update'); console.log(reason);
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

    }]);


var selectedViewOptions = {
    GR: { Name: 'NameGR', Description: 'DescriptionGR' },
    En: { Name: 'NameEn', Description: 'DescriptionEn' },
    Ru: { Name: 'NameRu', Description: 'DescriptionRu' },
    Fr: { Name: 'NameFr', Description: 'DescriptionFr' },
    De: { Name: 'NameDe', Description: 'DescriptionDe' },
}
var defaultRestaurantModel = {
    Id: 0,
    NameGR: 'NGR',
    NameEn: 'NEN',
    NameRu: 'NRU',
    NameFr: 'NFR',
    NameDe: 'NDE',
    Image: 'zavara.jpg',
    DescriptionGR: 'Description GR',
    DescriptionEn: 'Description EN',
    DescriptionRu: 'Description RU',
    DescriptionFr: 'Description FR',
    DescriptionDe: 'Description DE'
}
