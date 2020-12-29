'use strict';
/**
 * @ngdoc file-handling-directives 
 * @Includes Commonly Used Directives that handles fles I/O and export import formats  that BO uses to handle data
 * # posBOApp
 */
angular.module('posBOApp')
.directive('fileReader', function () {
    return {
        scope: {
            fileReader: "="
        },
        link: function (scope, element) {
            $(element).on('change', function (changeEvent) {
                var files = changeEvent.target.files;
                if (files.length) {
                    var r = new FileReader();
                    r.onload = function (e) {
                        var contents = e.target.result;
                        scope.$apply(function () {
                            scope.fileReader = contents;
                        });
                    };
                    r.readAsText(files[0]);
                }
            });
        }
    };
})
.directive('apsUploadFile', apsUploadFile);

function apsUploadFile() {
    var directive = {
        restrict: 'E',
        scope: {
            fileCont: "="
        },
        template: '<input id="fileInput" type="file" class="ng-hide"> <md-button id="uploadButton" class="md-raised md-primary" aria-label="attach_file">    Choose file </md-button><md-input-container  md-no-float>    <input id="textInput" ng-model="fileName" type="text" placeholder="No file chosen" ng-readonly="true"></md-input-container>',
        link: apsUploadFileLink
    };
    return directive;
}

function apsUploadFileLink(scope, element, attrs) {
    var input = $(element[0].querySelector('#fileInput'));
    var button = $(element[0].querySelector('#uploadButton'));
    var textInput = $(element[0].querySelector('#textInput'));

    if (input.length && button.length && textInput.length) {
        button.click(function (e) { input.click(); });
        textInput.click(function (e) { input.click(); });
    }
    input.on('change', function (e) {
        var files = e.target.files;
        if (files[0]) {
            scope.fileName = files[0].name;
        } else {
            scope.fileName = null;
        }
        if (files.length) {
            var r = new FileReader();
            r.onload = function (e) {
                var contents = e.target.result;
                scope.$apply(function () {
                    console.log('File content changed: on file upload csv');
                    scope.fileCont = contents;
                });
            };
            r.readAsText(files[0]);
        }
        scope.$apply();
    });
};