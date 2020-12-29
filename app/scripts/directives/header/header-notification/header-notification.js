'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('posBOApp')
	.directive('headerNotification', function () {
	    return {
		    templateUrl: 'app/scripts/directives/header/header-notification/header-notification.html',
		    controller: 'loginController',
            restrict: 'E',
            replace: true,
    	}
	});


