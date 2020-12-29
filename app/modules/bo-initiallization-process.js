(function () {
    angular.module('posBOApp')
        .service('LoginService', LoginService)
        .factory('auth', auth)

    function LoginService($http, config) {
        var urlBase = config.WebApiURL + '/api/Security';
        var prodversion = config.Version.toString() + '.' + config.Features.toString() + '.' + config.Minor.toString() + '.' + config.External.toString();

        this.checkVersion = function () {
            console.log('Checking Version: ' + prodversion);
            console.log(urlBase + '/CheckVersion?client=0&version=' + prodversion);
            return $http.get(urlBase + '/CheckVersion?client=0&version=' + prodversion);
        };
        this.login = function (username, password) {
            //console.log('Logging...'); console.log(urlBase);
            return $http.get(urlBase + '?id=' + username + '&pid=' + password);
        }
    }

    function auth($base64, $rootScope, $state ) {
        var user;
        return {
            loginUser: function (aUser) {
                user = aUser;
                var Auth = "Basic " + $base64.encode(user.username + ':' + user.password);
                sessionStorage.StoreInfo = JSON.stringify({ 'storeId': user.storeId, 'loggedUser': user.username, 'auth': Auth });
                $rootScope.isLoggedIn = true;
                $state.go("dashboard");
            },
            logoutUser: function () {
                sessionStorage.StoreInfo = "";
                $rootScope.isLoggedIn = false;
                $state.go("login");
            },
            isLoggedIn: function () {
                console.log('Checking Logged State')
                var lsdata = this.getLoggedSpecs();
                var res = (lsdata != undefined && lsdata.loggedUser != "") ? true : false;
                $rootScope.isLoggedIn = res;
                return res;
            },
            getLoggedSpecs: function () {
                if (sessionStorage.StoreInfo != '' && sessionStorage.StoreInfo !== undefined) {
                    return JSON.parse(sessionStorage.StoreInfo);
                } else {
                    return { "storeId": "", "loggedUser": "", "auth": "" };
                }

            }
        }
    }
})();
