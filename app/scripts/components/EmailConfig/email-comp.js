angular.module('posBOApp')
    .component('emailCongigComp', {
        templateUrl: 'app/views/EmailSetUp/emailConfig.html',
        controller: 'EmailConfigCompCTRL',
        controllerAs: 'EmailMain'
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
    .controller('EmailConfigCompCTRL', ['$scope', '$mdDialog', 'emailFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', '$mdMedia', function ($scope, $mdDialog, emailFactory, dataUtilFactory, tosterFactory, DynamicApiService, $mdMedia) {
        var EmailMain = this;
        var dtu = dataUtilFactory;
        EmailMain.$onInit = function () { };

        EmailMain.initView = function () {
            EmailMain.EmailConfigModel = [];
            EmailMain.GetEmailConfig();
            $scope.savingProcess = true;
            $scope.deleteProcess = true;
        };

        $scope.showModal = false;
        $scope.open = function (row) {
            $scope.shortRow = row;
            $scope.showModal = !$scope.showModal;
        };

        //API CALL rest get Email Config
        EmailMain.GetEmailConfig = function () {
            var url = emailFactory.apiInterface.EmailConfig.GET.GetEmailConfig;
            DynamicApiService.getV3('EmailConfig', url).then(function (result) {
                if (result != null && result.data != null) {
                    $scope.savingProcess = true;
                    $scope.deleteProcess = false;
                    EmailMain.EmailConfigModel = result.data;
                }
                else {
                    $scope.savingProcess = false;
                    $scope.deleteProcess = true;
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Email Config failed', 'fail');
                EmailMain.EmailConfigModel = [];
            }).finally(function () {
            });
        }

        //Add Email Config
        $scope.addEmailConfig = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'EmailConfig') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'EmailConfig',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
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
                    DynamicApiService.postV3('EmailConfig', 'Insert', retdata).then(function (result) {
                        tosterFactory.showCustomToast('Email Config Inserted succesfully', 'success');
                        EmailMain.EmailConfigModel = result.data;
                        $scope.savingProcess = true;
                        $scope.deleteProcess = false;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Insert Email Config failed', 'fail');
                    }, function (error) {
                        tosterFactory.showCustomToast('Insert Email Config Error', 'error');
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        //Edit Email Config
        $scope.editEmailConfig = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'EmailConfig') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'EmailConfig',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
            }
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

                    DynamicApiService.postV3('EmailConfig', 'Update', retdata).then(function (result) {
                        tosterFactory.showCustomToast('Email Config Inserted succesfully', 'success');
                        EmailMain.EmailConfigModel = result.data;
                    }, function (reason) {
                        tosterFactory.showCustomToast('Insert Email Config failed', 'fail');
                    }, function (error) {
                        tosterFactory.showCustomToast('Insert Email Config Error', 'error');
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        //Delete Email Config
        $scope.DeleteEmailConfig = function (row) {
            var url = emailFactory.apiInterface.EmailConfig.POST.DeleteEmailConfig;
            DynamicApiService.DeleteHeader('EmailConfig', url, row.Id).then(function (result) {
                $scope.showModal = !$scope.showModal;
                tosterFactory.showCustomToast('Email Config Deleted succesfully', 'success');
                EmailMain.EmailConfigModel = [];
                $scope.savingProcess = false;
                $scope.deleteProcess = true;
            }, function (reason) {
                tosterFactory.showCustomToast('Delete Email Config failed', 'fail');
                $scope.showModal = !$scope.showModal;
                console.log('Fail update'); console.log(reason);
            }, function (error) {
                tosterFactory.showCustomToast('Delete Email Config error', 'error');
                $scope.showModal = !$scope.showModal;
            })
        };

    }]);
