angular.module('posBOApp')
    .component('handlepayroll', {
        templateUrl: 'app/views/Suppliers/suppliersView.html',
        controller: 'SuppliersMainCTRL',
        controllerAs: 'SuppliersMain'
    })
    .directive('modal', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{ title }}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;

                scope.$watch(attrs.visible, function (value) {
                    if (value == true)
                        $(element).modal('show');
                    else
                        $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    })
    .controller('SuppliersMainCTRL', ['$scope', '$mdDialog', '$mdMedia', 'suppliersFactory', 'dataUtilFactory', 'tosterFactory', '$q', 'DynamicApiService', function ($scope, $mdDialog, $mdMedia, suppliersFactory, dataUtilFactory, tosterFactory, $q, DynamicApiService) {
        var SuppliersMain = this;
        var dtu = dataUtilFactory;
        SuppliersMain.$onInit = function () { };

        SuppliersMain.initView = function () {
            SuppliersMain.suppliers = [];
            SuppliersMain.GetSuppliers();
        };

        $scope.showModal = false;
        $scope.open = function (row) {
            $scope.shortRow = row;
            $scope.showModal = !$scope.showModal;
        };

        //########################## Get All Payrolls #################################//
        //#############################################################################//
        SuppliersMain.GetSuppliers = function () {
            var url = suppliersFactory.apiInterface.Suppliers.GET.GetSuppliers;
            DynamicApiService.getV3('Suppliers', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Οι Προμηθευτές Φορτώθηκαν', 'success');
                    SuppliersMain.suppliers = result.data;
                } else {
                    tosterFactory.showCustomToast('Οι Προμηθευτές ΔΕΝ Φορτώθηκαν', 'success');
                    SuppliersMain.suppliers = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Σφάλμα κατά την ανάκτηση των Προμηθευτών', 'fail');
                SuppliersMain.suppliers = [];
            }).finally(function () {
            });
        }

        //########################## Add Specific Supplier #################################//
        //##################################################################################//
        $scope.addSupplier = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};

            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'Suppliers') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'Suppliers',
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
                    var url = suppliersFactory.apiInterface.Suppliers.POST.InsertSupplier;
                    DynamicApiService.postGetPmsDepartments('Suppliers', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            SuppliersMain.suppliers = result.data;
                            tosterFactory.showCustomToast('Ο Προμηθευτής Προστέθηκε με επιτυχία', 'success');
                        } else {
                            tosterFactory.showCustomToast('Ο Προμηθευτής ΔΕΝ Προστέθηκε', 'success');
                            SuppliersMain.suppliers = [];
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Σφάλμα κατά την Εισαγωγή Προμηθευτή', 'fail');
                        SuppliersMain.suppliers = [];
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        //########################## Edit Specific Supplier #################################//
        //###################################################################################//
        $scope.editSupplier = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'Suppliers') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'Suppliers',
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
                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)

                    var url = suppliersFactory.apiInterface.Suppliers.POST.UpdateSupplier;
                    DynamicApiService.postGetPmsDepartments('Suppliers', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            SuppliersMain.suppliers = result.data;
                            tosterFactory.showCustomToast('Τα Στοιχεία Προμηθευτή Ενημερώθηκαν', 'success');
                        } else {
                            tosterFactory.showCustomToast('Τα Στοιχεία Προμηθευτή ΔΕΝ Ενημερώθηκαν', 'success');
                            SuppliersMain.suppliers = [];
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Σφάλμα κατά την Ενημέρωση των Στοιχείων Προμηθευτή', 'fail');
                        SuppliersMain.suppliers = [];
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        //########################## Delete Specific Payroll #################################//
        //####################################################################################//
        $scope.DeleteSupplier = function (row) {
            var url = suppliersFactory.apiInterface.Suppliers.GET.DeleteSupplier;
            DynamicApiService.getV3('Suppliers', url, row.Id).then(function (result) {
                $scope.showModal = !$scope.showModal;
                tosterFactory.showCustomToast('Ο Προμηθευτής Διαγράφηκε με Επιτυχία', 'success');
                SuppliersMain.suppliers = result.data;

            }, function (reason) {
                $scope.showModal = !$scope.showModal;
            }, function (error) {
                tosterFactory.showCustomToast('Σφάλμα κατά τη διαγραφή Προμηθευτή', 'error');
                $scope.showModal = !$scope.showModal;
            })
        };

    }]);
