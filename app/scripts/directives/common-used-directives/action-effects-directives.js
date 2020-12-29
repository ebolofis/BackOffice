'use strict';
/**
 * @ngdoc directive
 * @name tables-directives :posBOApp_directive_Creator
 * @Includes Commonly Used Directives in tables view
 * # posBOApp
 */
angular.module('posBOApp')
    .directive('ngRightClick', function ($parse) {
        return function (scope, element, attrs) {
            var fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function (event) {
                scope.$apply(function () {
                    event.preventDefault();
                    fn(scope, { $event: event });
                });
            });
        };
    }).directive('checkConf', function () {
            return {
                restrict: 'A',
                scope: {
                    ccModel: '=', ccType: '=', ccRet: '=',
                },
                controller: function ($scope, ConfigService) {
                    $scope.idle = false;
                    $scope.checkConnection = function () {
                        console.log('Check Connection function started');
                        switch ($scope.ccType) {
                            case 'proteldb':
                                var cm = createProtelDBObject($scope.ccModel);
                                if (cm == null) {
                                    $scope.ccRet = 'Invalid Model';
                                    return;
                                }
                                $scope.ccRet = ''; $scope.idle = true;
                                ConfigService.checkHotelInfo(cm).then(function (ret) {
                                    console.log('Check Connection success'); console.log(ret);
                                    $scope.ccRet = ret.data;
                                }).catch(function (e) {
                                    console.log('Check Connection Error ret'); console.log(e);
                                    $scope.ccRet = 'Error Connection';
                                }).finally(function () {
                                    $scope.idle = false;
                                });
                                break;
                            default:
                                alert('No Configuration type matched on checking Configuration Actions');
                        }
                    }
                    function createProtelDBObject(model) {
                        if (model.DBName == null || model.DBName == '' || model.ServerName == null || model.ServerName == '' || model.DBUserName == null || model.DBUserName == '' || model.DBPassword == null || model.DBPassword == '') {
                            return null;
                        }
                        var ret = {
                            databasename: model.DBName,
                            server: model.ServerName,
                            userName: model.DBUserName,
                            password: model.DBPassword,
                        }
                        return ret;
                    }
                },
                template: '<md-button ng-click="checkConnection()"><md-icon md-menu-origin md-svg-icon="hardware:cast"><md-tooltip md-direction="top">Check conection {{ccType}}</md-tooltip></md-icon></md-button>',
                //compile: function (element, attr) {
                //    // <md-toolbar class=""><div class="md-toolbar-tools">Available Ingredients</div></md-toolbar>
                //    var contents = element.html();
                //    element.html('<md-toolbar class="bo-header-toolbar"><div class="md-toolbar-tools">' + contents + '</div></md-toolbar>');
                //}
            }
        })
    .directive('keyboardActions', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.keyboardActions);
                    });

                    event.preventDefault();
                }
            });
        };
    })

    .directive('slideable', function () {
        //<span slide-toggle="#MyId" >expand</span>
        //<div id="MyId" class="slideable">
        //    <p>How are YOU doing?</p>
        //</div>
        return {
            restrict: 'C',
            compile: function (element, attr) {
                // wrap tag
                var contents = element.html();
                element.html('<div class="slideable_content" style="margin:0 !important; padding:0 !important" >' + contents + '</div>');

                return function postLink(scope, element, attrs) {
                    // default properties
                    attrs.duration = (!attrs.duration) ? '.4s' : attrs.duration;
                    attrs.easing = (!attrs.easing) ? 'ease-in-out' : attrs.easing;
                    element.css({
                        'overflow': 'hidden',
                        'height': '0px',
                        'transitionProperty': 'height',
                        'transitionDuration': attrs.duration,
                        'transitionTimingFunction': attrs.easing
                    });
                };
            }
        };
    }).directive('slideToggle', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var target, content;

                attrs.expanded = false;

                element.bind('click', function () {
                    if (!target) target = document.querySelector(attrs.slideToggle);
                    if (!content) content = target.querySelector('.slideable_content');
                    if (!attrs.expanded) {
                        content.style.border = '1px solid rgba(0,0,0,0)';
                        var y = wrapper.clientHeight;//content.clientHeight;
                        content.style.border = 0;
                        target.style.height = y + 'px';
                        //target.style.height = 'auto';
                    } else {
                        target.style.height = '0px';
                    }
                    attrs.expanded = !attrs.expanded;
                });
                //var target = document.querySelector(attrs.slideToggle);
                //attrs.expanded = false;
                //element.bind('click', function () {
                //    var content = target.querySelector('.slideable_content');
                //    if (!attrs.expanded) {
                //        content.style.border = '1px solid rgba(0,0,0,0)';
                //        var y = content.clientHeight;
                //        content.style.border = 0;
                //        target.style.height = y + 'px';
                //    } else {
                //        target.style.height = '0px';
                //    }
                //    attrs.expanded = !attrs.expanded;
                //});
            }
        }
    });

//var submitIcon = $('.searchbox-icon');
//var inputBox = $('.searchbox-input');
//var searchBox = $('.searchbox');
//var isOpen = false;
//submitIcon.click(function(){
//    if(isOpen == false){
//        searchBox.addClass('searchbox-open');
//        inputBox.focus();
//        isOpen = true;
//    } else {
//        searchBox.removeClass('searchbox-open');
//        inputBox.focusout();
//        isOpen = false;
//    }
//});  
//submitIcon.mouseup(function(){
//    return false;
//});
//searchBox.mouseup(function(){
//    return false;
//});
//$(document).mouseup(function(){
//    if(isOpen == true){
//        $('.searchbox-icon').css('display','block');
//        submitIcon.click();
//    }
//});
//});
//function buttonUp(){
//    var inputVal = $('.searchbox-input').val();
//    inputVal = $.trim(inputVal).length;
//    if( inputVal !== 0){
//        $('.searchbox-icon').css('display','none');
//    } else {
//        $('.searchbox-input').val('');
//        $('.searchbox-icon').css('display','block');
//    }
//}