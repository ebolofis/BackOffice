'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # loginController
 * Controller of the sbAdminApp
 */
//angular.module('posBOApp')
//  .controller('loginController', ['$scope', '$timeout', function ($scope, $timeout) {

//  }]);

angular.module('posBOApp')
    .controller('loginController', ['$base64', '$scope', 'LoginService', 'NewLoginService', 'auth', 'tosterFactory', function ($base64, $scope, LoginService, NewLoginService, auth, tosterFactory) {
        $scope.viewState = 'loginform';
        $scope.init = function () {
            console.log('Initializing login controller');
            $scope.loading = false;
            $scope.promiseLoadingMsg = 'Loading configuration ...';
            $scope.userModel = { storeId: '', username: '', password: '' }; $scope.storeId = '';
            $scope.check();
        }

        //a function triggered by initialization uses loginservice to check project version
        $scope.check = function () {
            $scope.loading = true; $scope.promiseLoadingMsg = 'Checking product Version ...';
            LoginService.checkVersion().then(function (result) {
                tosterFactory.showCustomToast('Product version verified.', 'success');
                $scope.changeView('login');
            }
                //,function (error) { console.log(error); }
                //,function (update) { console.log(update); }
            ).catch(function (e, f) {
                console.log(e);
                tosterFactory.showCustomToast('Product version missmatch.', 'warning');
                $scope.changeView('error');
            }).finally(function () {
                $scope.loading = false;
            })
        }
        $scope.changeView = function (type) {
            switch (type) {
                case 'login': $scope.viewState = 'loginform'; break;
                case 'error': $scope.viewState = 'errormsg'; break;
                case 'loading': $scope.viewState = 'loading'; break;
                default: break;
            }
        }
        //a function that is triggered || by action button on login form || by keypress enter
        $scope.login = function (username, password) {

            if (localStorage.getItem("isDaClient") == "true" && localStorage.getItem("isDA")=="true")
            {
                tosterFactory.showCustomToast('Login Failed because  isDaClient and is DAgent properties are simultaneously  True', 'fail');
                return;
            }
            $scope.loading = true;
            $scope.promiseLoadingMsg = 'Logging in ...';
            LoginService.login(username, password).then(function (result) {
                console.log('Result login:'); console.log(result.data);
                if (result.data.indexOf("NOT FOUND") == -1 && result.data.length > 0) {
                    $scope.storeId = result.data;
                    $scope.userModel.storeId = $scope.storeId;
                    //$scope.userModel.Auth = "Basic " + $base64.encode($scope.userModel.username + ':' + $scope.userModel.password);
                    auth.loginUser($scope.userModel); //loginfactory 'auth' injection

                    //Is Delivery Agent call Api
                    var url = "isDA";
                    NewLoginService.getV3('Config', url).then(function (result) {
                        if (result != null && result.data != null) {
                            tosterFactory.showCustomToast('isDA Loaded', 'success');
                            localStorage.setItem("isDa", result.data);
                        } else {
                            tosterFactory.showCustomToast('isDA not Loaded', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Loading isDA failed', 'fail');
                    }).finally(function () {
                    });

                    //Is Client Delivery Agent call Api
                    var url = "isdaclient";
                    NewLoginService.getV3('Config', url).then(function (result) {
                        if (result != null && result.data != null) {
                            tosterFactory.showCustomToast('isdaclient Loaded', 'success');
                            localStorage.setItem("isDaClient", result.data);
                        } else {
                            tosterFactory.showCustomToast('isdaclient not Loaded', 'success');
                        }
                    }).catch(function (rejection) {
                        tosterFactory.showCustomToast('Loading isdaclient failed', 'fail');
                    }).finally(function () {
                        });

                    //Get config Model from WebApi
                    var url = "GetConfig";
                    NewLoginService.getV3('Config', url).then(function (result) {
                        if (result != null && result.data != null) {
                            tosterFactory.showCustomToast('GetConfig Loaded', 'success');
                            var configModel = result.data;
                            localStorage.setItem("baseURL", configModel.DA_BaseUrl);
                            localStorage.setItem("staffUserName", configModel.DA_StaffUserName);
                            localStorage.setItem("staffPassword", configModel.DA_StaffPassword);
                        } else {
                            tosterFactory.showCustomToast('GetConfig not Loaded', 'success');
                        }
                    }).catch(function (rejection) {        
                        tosterFactory.showCustomToast('Loading GetConfig failed', 'fail');
                    }).finally(function () {
                    });

                } else {
                    $scope.errormsg = result.data;
                    $scope.loading = false;

                    $scope.changeView('error');
                    tosterFactory.showCustomToast('Login Failed. ' + result.data, 'warning');
                }
            }).catch(function (reason) {
                tosterFactory.showCustomToast('Login failed.', 'warning');
                $scope.loading = false;
            }).finally(function () {
                //$scope.loading = false;
            })

        };
        //loginfactory 'auth' injection
        $scope.logout = function () { auth.logoutUser(); };
        $scope.enterKeyAction = function (keyEvent) {
            if (keyEvent.which === 13) {

                $scope.login($scope.userModel.username, $scope.userModel.password);
            }
        }
        $scope.LoggedUser = auth.getLoggedSpecs();

    }]);
