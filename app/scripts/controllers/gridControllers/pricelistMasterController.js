'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:PricelistMasterController
 * @description
 * #PricelistMasterController
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .controller('PricelistMasterController', ['tosterFactory', '$stateParams', '$scope', '$http', '$log', '$timeout', '$q', '$interval', 'auth', 'DynamicApiService', 'dataUtilFactory', '$mdSidenav', '$mdDialog', '$mdMedia',
function (tosterFactory, $stateParams, $scope, $http, $log, $timeout, $q, $interval, auth, DynamicApiService, dataUtilFactory, $mdSidenav, $mdDialog, $mdMedia) {
    $scope.restCalling = true;
    $scope.initView = function () {
        var salesTypePromise = $scope.getDropDownLookUps('SalesType');
        $q.all([salesTypePromise]).then(function () {
            var pricelistMasterPromise = $scope.getDropDownLookUps('PricelistMaster');
        });
    }
    $scope.getDropDownLookUps = function (entity, customparams) {
        switch (entity) {
            case 'SalesType': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                var res = angular.copy(result.data);
                $scope.salesTypes = res.map(function (item) {
                    //Id   PricelistMasterId	SalesTypeId	 IsDeleted	SalesTypeDescription
                    var obj = {
                        Id: 0,
                        PricelistMasterId: null,
                        SalesTypeId: item.Id,
                        SalesTypeDescription: item.Description,
                        Abbreviation: item.Abbreviation, IsDeleted: false,
                    }
                    return obj;
                })
            }, function (reason) {
                tosterFactory.showCustomToast('Region lookup failed to load', 'fail');
                console.log('Fail Load'); console.log(reason);
            })); break;
            case 'PricelistMaster':
                $scope.restCalling = true;
                return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                    $scope.pricelistMaster = angular.copy(result.data); //loadedRegions
                    angular.forEach($scope.pricelistMaster, function (value) {
                        value.Status = (value.Status == 1) ? true : false;
                        value.isEdited = false;
                        value.selectedAssocs = transformSelected(value);
                        value.allAvailableAssocs = $scope.salesTypes;
                    })
                    //console.log('PricelistMaster'); console.log($scope.pricelistMaster);
                    //Id	//Description	//Status	//Active	
                    //AssociatedSalesTypes{	
                    //    Id	//    PricelistMasterId	//    SalesTypeId	//    IsDeleted	//    SalesTypeDescription
                    //}
                    $scope.restCalling = false;
                }, function (reason) {
                    tosterFactory.showCustomToast('PricelistMaster lookup failed to load', 'fail');
                    console.log('Fail Load'); console.log(reason);
                    $scope.restCalling = false;
                },
                 function (error) {
                     tosterFactory.showCustomToast('PricelistMaster lookup failed to load', 'error');
                     console.log('Error Load'); console.log(error);
                     $scope.restCalling = false;
                 }
                )); break;
            default: break;
        }
    }
    function transformSelected(value) {
        var ret = [];
        ret = $scope.salesTypes.filter(function (item) {
            var found = value.AssociatedSalesTypes.filter(function (cca) { return (cca.SalesTypeId == item.SalesTypeId); });
            if (found.length > 0) return item;
        })
        return ret;
    }
    $scope.filtered = function (list) {
        var ret = list.filter(function (item) { return (item.selected == true); })
    }
    $scope.display = function () { console.log($scope.selectedRow); }
    $scope.selectPl = function (pl) {
        angular.forEach($scope.pricelistMaster, function (item) { item.selected = false; })
        pl.selected = true;
        $scope.selectedRow = pl;
    }

    $scope.addData = function () {
        var thisPlm = null;
        $mdDialog.show({
            controller: function ($scope, $mdDialog, salesTypes, plm) {
                $scope.salesTypes = angular.copy(salesTypes);
                if (plm === undefined || plm === null) {
                    $scope.plm = {}
                    $scope.plm.selectedSalesTypes = [];
                } else {
                    $scope.plm = angular.copy(plm);
                    $scope.plm.selectedSalesTypes = $scope.salesTypes.filter(function (item) {
                        var found = $scope.plm.AssociatedSalesTypes.filter(function (cca) { return (cca.SalesTypeId == item.SalesTypeId); });
                        if (found.length > 0) return item;
                    })
                }

                $scope.hide = function () { $mdDialog.hide(); };
                $scope.cancel = function () { $mdDialog.cancel(); };
                $scope.confirm = function (answer) {
                    $scope.plm.AssociatedSalesTypes = angular.copy($scope.plm.selectedSalesTypes);
                    var ret = { data: $scope.plm }
                    $mdDialog.hide(ret);
                }
            },
            template: '<md-dialog aria-label="tableModel" ng-cloak style="min-width: 50vw;"><div ng-include src="\'pricelistMasterModalTemplate\'"></div></md-dialog>',
            parent: angular.element('#wrapper'),
            clickOutsideToClose: true,
            //fullscreen: useFullScreen,
            resolve: {
                salesTypes: function () { return $scope.salesTypes; },
                plm: function () { return thisPlm; }
            }
        }).then(function (retdata) {
            $scope.savingProcess = true;
            DynamicApiService.postSingle('PricelistMaster', retdata.data).then(function () {
                $scope.savingProcess = false;
                tosterFactory.showCustomToast('New Pricelist master entry saved successfully', 'success');
                $scope.getDropDownLookUps('PricelistMaster');
            }, function (reason) {
                tosterFactory.showCustomToast('Adding new Pricelist Master failed', 'error');
                console.log('Fail Add'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Error on adding new Pricelist Master', 'error');
                console.log('Error Add'); console.log(error);

            })
        })
    }
    $scope.removeObject = function () {
        var toDel = $scope.pricelistMaster.filter(function (item) { return (item.selected == true); })
        if (!toDel || toDel.length == 0) {
            tosterFactory.showCustomToast('No selected lines to delete', 'info');
            return;
        }
        var txtDesp = '';
        angular.forEach(toDel, function (value) {
            txtDesp += ' "' + value.Description + '"';
        })
        var confirm = $mdDialog.confirm()
               .title('Delete Pricelist Masters ')
               .textContent('Proceed and delete Master pricelist: ' + txtDesp + ' entry.')
               .ariaLabel('removePlms')
               .ok('Remove')
               .cancel('Cancel');
        $mdDialog.show(confirm).then(function () {
            $scope.savingProcess = true;
            DynamicApiService.deleteSingle('PricelistMaster', toDel[0].Id).then(function (result) {
                $scope.savingProcess = false;
                tosterFactory.showCustomToast('Pricelist deleted successfully.', 'success');
                $scope.getDropDownLookUps('PricelistMaster');
            }, function (reason) { }, function (error) { })

        }, function () {
        });
    }
    $scope.saveChanges = function () {
        $scope.savingProcess = true;
        //selected all is edited
        var editedEntities = $scope.pricelistMaster.filter(function (item) { return (item.isEdited == true); });
        //check from selectedAssocs VS AssociatedSalesTypes
        angular.forEach(editedEntities, function (value) {
            //osa den vrethoun ston selected yphrxan kai diagrafikan
            var deleted = value.AssociatedSalesTypes.filter(function (item) {
                var found = value.selectedAssocs.filter(function (cca) { return (cca.SalesTypeId == item.SalesTypeId); });
                if (found.length == 0) {
                    item.IsDeleted = true;
                    return item;
                }
            })
            //osa yparxoun ston selected kai den yparxoun ston Loaded einai gia add
            var inserted = value.selectedAssocs.filter(function (item) {
                var found = value.AssociatedSalesTypes.filter(function (cca) { return (cca.SalesTypeId == item.SalesTypeId); });
                if (found.length == 0) {
                    item.PricelistMasterId = value.Id;
                    return item;
                }
            })
            value.AssociatedSalesTypes = value.AssociatedSalesTypes.concat(inserted);
        })
        var saveplMastersPromice = DynamicApiService.putMultiple('PricelistMaster', editedEntities).then(function (result) {
            tosterFactory.showCustomToast('PricelistMasters updated successfully.', 'success');
            $scope.savingProcess = false;
            $scope.getDropDownLookUps('PricelistMaster');
        }, function (freason) {
            $scope.savingProcess = false;
            tosterFactory.showCustomToast('PricelistMaster save failed', 'fail');
            console.log('Fail Save'); console.log(freason);
        }, function (ereason) {
            $scope.savingProcess = false;
            tosterFactory.showCustomToast('PricelistMaster save had an Error', 'error');
            console.log('Error Save'); console.log(ereason);
        })
    }
}])