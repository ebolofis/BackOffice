'use strict';
/**
 * @ngdoc directive
 * @name tables-directives :posBOApp_directive_Creator
 * @Includes Commonly Used Directives in tables view
 * # posBOApp
 */
angular.module('posBOApp')
    .directive('toggleFsModal', function () {
        return {
            restrict: 'E',
            scope: {
                tvar: '=',
            },
            template: '<md-button class="md-icon-button" aria-label="togglefullscreenmodal" ng-click="(tvar != true) ? tvar = true : tvar = false">'
            + '<md-icon ng-if="tvar != true" md-svg-icon="navigation:fullscreen"></md-icon><md-icon ng-if="tvar == true" md-svg-icon="navigation:fullscreen_exit"></md-icon>'
            + '</md-button>'
        }
    })
    .directive('boHtd', function () {
        return {
            restrict: 'CA',
            //template: ,
            compile: function (element, attr) {
                // <md-toolbar class=""><div class="md-toolbar-tools">Available Ingredients</div></md-toolbar>
                var contents = element.html();
                element.html('<md-toolbar class="bo-header-toolbar"><div class="md-toolbar-tools">' + contents + '</div></md-toolbar>');
            }
        }
    }).directive('uploadImageFile', ['tosterFactory', 'DynamicApiService', '$q', '$interval', '$compile', 'config', 'auth', function (tosterFactory, DynamicApiService, $q, $interval, $compile, config, auth) {
        var directive = {
            restrict: 'E',
            scope: {
                uploadModel: '=',
                data: '=', datafield: '@',
                loadingState: '=', callback: '=?'
            },
            template: '<input id="imageFileInput" type="file" class="ng-hide">' +
            '<md-button id="uploadImageButton" layout-align="center" class="md-raised md-mini md-primary" aria-label="upload_region_bg" style="width:auto;">' +
            '<i class="fa fa-image fa-fw"></i>' +
            '<md-tooltip md-direction="top">Change Image</md-tooltip>' +
            '</md-button>',
            link: function (scope, element, attrs) {
                scope.fileName = (scope.data !== undefined && scope.data !== null
                    && scope.datafield && scope.datafield !== null
                    && scope.data[scope.datafield] !== undefined && scope.data[scope.datafield] !== null) ? scope.data[scope.datafield] : '';
                var input = $(element[0].querySelector('#imageFileInput'));
                var button = $(element[0].querySelector('#uploadImageButton'));
                if (input.length && button.length) {// && textInput.length) {
                    button.click(function (e) { input.click(); });
                }
                input.on('change', function (e) {
                    scope.loadingState = true;
                    console.log('Uri on immage directive changed');
                    var authSpecs = auth.getLoggedSpecs(); var files = e.target.files;
                    if (files[0]) {
                        var uploadPromise = DynamicApiService.uploadImage(scope.uploadModel.controllerName, scope.uploadModel.actionName, scope.uploadModel.extraData, files[0]).then(function (result) {
                            scope.fileName = files[0].name;
                            var UploadedLogoPrefix = config.WebApiURL.slice(0, -1) + '/images/' + authSpecs.storeId + '/' + scope.uploadModel.actionName + '/';
                            scope.data[scope.datafield] = angular.copy(UploadedLogoPrefix + scope.fileName);
                            if (scope.callback != undefined) scope.callback(scope.data[scope.datafield]);
                            tosterFactory.showCustomToast('Image uploaded successfully', 'success');
                        }, function (fail) {
                            tosterFactory.showCustomToast('Uploading Image failed', 'fail');
                            console.log('Failed uploading image'); console.log(fail);
                            scope.fileName = "";
                        }, function (error) {
                            tosterFactory.showCustomToast('Uploading Image error', 'error'); console.log('Error uploading image'); console.log(error);
                        }).finally(function () {
                            scope.loadingState = false;

                        })
                    } else {
                        scope.loadingState = false;
                        scope.fileName = null;
                    }
                    scope.$apply();
                });

            }
        };
        return directive;
    }])



    .directive('collapsibleSearchBar', function () {
        return {
            restrict: 'E',
            scope: {
                searchVar: '='
            },
            template: '<div ng-init="colsearchbarvar=false;" layout-fill><div class="search-widget" ng-class="{\'search-open\' : colsearchbarvar}">'
            + '<button class="search-button" ng-class="{\'search-open\' : colsearchbarvar}"><md-icon md-svg-icon="action:search" ng-click="colsearchbarvar = true;"></md-icon></button>'
            + '<button class="search-close-button"  ng-class="{\'search-open\' : colsearchbarvar}"><md-icon md-svg-icon="navigation:close" ng-click="colsearchbarvar = false;"></md-icon></button>'
            + '<input name="q" ng-model="searchVar" type="text" autocomplete="off" placeholder="Search"></div></div>'
        }
    })
    .directive('loadDynamicTemplate', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                templateUrl: '='
            },
            link: function (scope, element, attrs) {
                //Function returns the correct template for each field.
                scope.getTemplateUrl = function () {
                    var type = scope.templateUrl || 'text';
                    return type;
                }
            },
            template: '<div class="load-dynamic-template" ng-include="getTemplateUrl()"></div>'
        };
    }).directive('errSrc', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('error', function () {
                    if (attrs.src != attrs.errSrc) {
                        attrs.$set('src', attrs.errSrc);
                    }
                });
            }
        }
    })
    //http://angularscript.com/angular-material-design-pagination/
    .directive('clPaging', function () {
        return {
            restrict: 'EA',
            scope: {
                clPages: '=',
                clAlignModel: '=',
                clPageChanged: '&',
                clSteps: '=',
                clCurrentPage: '='
            },
            controller: function ($scope) {
                var vm = this;
                vm.first = '<<'; vm.last = '>>';
                vm.index = 0;
                vm.clSteps = $scope.clSteps;

                vm.goto = function (index) { $scope.clCurrentPage = vm.page[index]; };
                vm.gotoPrev = function () { $scope.clCurrentPage = vm.index; vm.index -= vm.clSteps; };
                vm.gotoNext = function () { vm.index += vm.clSteps; $scope.clCurrentPage = vm.index + 1; };
                vm.gotoFirst = function () { vm.index = 0; $scope.clCurrentPage = 1; };
                vm.gotoLast = function () {
                    vm.index = parseInt($scope.clPages / vm.clSteps) * vm.clSteps;
                    vm.index === $scope.clPages ? vm.index = vm.index - vm.clSteps : '';
                    $scope.clCurrentPage = $scope.clPages;
                };
                $scope.$watch('clCurrentPage', function (value) {
                    vm.index = parseInt((value - 1) / vm.clSteps) * vm.clSteps;
                    $scope.clPageChanged();
                });
                $scope.$watch('clPages', function () { vm.init(); });
                vm.init = function () {
                    vm.stepInfo = (function () {
                        var result = [];
                        for (var i = 0; i < vm.clSteps; i++) { result.push(i) }
                        return result;
                    })();
                    vm.page = (function () {
                        var result = [];
                        for (var i = 1; i <= $scope.clPages; i++) { result.push(i); }
                        return result;
                    })();
                };
            },
            controllerAs: 'vm',
            template: [
                '<md-button class="md-icon-button md-raised md-warn" aria-label="First" ng-click="vm.gotoFirst()">{{ vm.first }}</md-button>',
                '<md-button class="md-icon-button md-raised" aria-label="Previous" ng-click="vm.gotoPrev()" ng-show="vm.index - 1 >= 0">&#8230;</md-button>',
                '<md-button class="md-icon-button md-raised" aria-label="Go to page {{i+1}}" ng-repeat="i in vm.stepInfo"',
                ' ng-click="vm.goto(vm.index + i)" ng-show="vm.page[vm.index + i]" ',
                ' ng-class="{\'md-primary\': vm.page[vm.index + i] == clCurrentPage}">',
                ' {{ vm.page[vm.index + i] }}',
                '</md-button>',
                '<md-button class="md-icon-button md-raised" aria-label="Next" ng-click="vm.gotoNext()" ng-show="vm.index + vm.clSteps < clPages">&#8230;</md-button>',
                '<md-button class="md-icon-button md-raised md-warn" aria-label="Last" ng-click="vm.gotoLast()">{{ vm.last }}</md-button>',
            ].join('')
        };
    });



