'use strict';
/**
 * @ngdoc resource
 * @name reusable-dynamic-directives : PosBO directives
 * @Includes Commonly Used Directives in views
 * #posBOApp
 */
angular.module('posBOApp')
    // this is a debug perpose directive 
    // is active when debug mode is true
    // uses drop down liat of actions to map and hide on release mode
    .directive('devEnable', function () {
        return {
            restrict: 'EC',
            scope: {},
            controller: 'devEnablectrl',
            templateUrl: 'app/scripts/directives/common-used-directives/templates/dev-log-menu.html',
            //transclude: true,
        }
    }).controller('devEnablectrl', function ($scope, $q, config) {
        
        $scope.devAccess = (config.workPolicy == 'dev') ? true : false;
    })

    .directive('exportPredifinedFormat', function () {
        return {
            restrict: 'E',
            scope: {
                dataarray: '=',
                template: '=?',
            },
            controller: 'ExportPredifinedFormatCtrl',
            //controllerAs: 'dactrl',
            templateUrl: 'app/scripts/directives/common-used-directives/export-predefined-format-template.html',
        }
    }).controller('ExportPredifinedFormatCtrl', function ($scope, $q, ExportTemplateFactory, tosterFactory) {
        console.log('Entering export process');
        $scope.entity = 'AutoGrill';
        $scope.data = angular.copy($scope.dataarray);
        $scope.tableTemplate = ExportTemplateFactory.getTemplate($scope.entity);
        $scope.exportModel = ExportTemplateFactory.getExportModel($scope.entity);
        $scope.getFile = function (id) {
            constructDataExport(id);
            //$(id).tableExport($scope.exportModel);
        }
        var defaults = { separator: ',', ignoreColumn: [], tableName: 'yourTableName', type: 'csv', pdfFontSize: 14, pdfLeftMargin: 20, escape: 'true', htmlContent: 'false', consoleLog: 'false' };
        function constructDataExport(ell) {
            var options = $.extend(defaults, $scope.exportModel);
            var el = this;
            var tdData = "";
            //Header
            //$(ell).find('thead').find('tr').each(function () {
            //    tdData += "\n";
            //    $(this).filter(':visible').find('th').each(function (index, data) {if ($(this).css('display') != 'none') {if (defaults.ignoreColumn.indexOf(index) == -1) {tdData += '"' + parseString($(this)) + '"' + defaults.separator;}}});
            //    tdData = $.trim(tdData);tdData = $.trim(tdData).substring(0, tdData.length - 1);
            //});
            // Row vs Column
            $(ell).find('tbody').find('tr').each(function () {
                tdData += "\n";
                $(this).filter(':visible').find('td').each(function (index, data) {
                    if ($(this).css('display') != 'none') {
                        if (defaults.ignoreColumn.indexOf(index) == -1) {
                            tdData += '' + $(this).text().trim() + '' + defaults.separator;
                        }
                    }
                });
                tdData = $.trim(tdData);
            });
            //output
            if (defaults.consoleLog == 'true') { console.log(tdData); }
            var base64data = "base64," + $.base64.encode(tdData);
            var dataUri = "data:application/text;charset=utf-8;" + base64data;
            //var filename = "somedata.txt"; //$("<a download='" + filename + "' href='" + dataUri + "'></a>")[0].click();
            window.open('data:application/text;charset=utf-8;download=exportData.txt;' + base64data);
            //window.open('data:application/' + defaults.type + ';filename=exportData.txt;' + base64data);
        }

    }).factory('ExportTemplateFactory', [function () {
        //load by entity load template of table display
        this.getTemplate = function (type) {
            if (defaultTemplates[type] == undefined) {
                return null;
            }
            return defaultTemplates[type];
        };
        //load by entity Export model
        this.getExportModel = function (type) {
            if (defaultModels[type] == undefined) {
                return null;
            }
            return defaultModels[type];
        };
        var defaultTemplates = {
            'AutoGrill': 'payrole-table-template'
        }
        var defaultModels = {
            'AutoGrill': { separator: '', type: 'txt', escape: 'false' },
            'default': {
                separator: '',
                ignoreColumn: [2, 3],
                tableName: 'yourTableName',
                type: 'txt',
                pdfFontSize: 14,
                pdfLeftMargin: 20,
                escape: 'true',
                htmlContent: 'true',
                consoleLog: 'false',
            }
        }
        return this;
    }])

    .directive('dynamicAutocomplete', function () {
        return {
            restrict: 'E',
            scope: {
                ngModel: '=',
                selEnt: '=',
                autoFuns: '=',
                searchList: '=',
                entityHandling: '='
            },
            controller: 'DynamicAutocompleteCtrl',
            controllerAs: 'dactrl',
            templateUrl: 'app/scripts/directives/common-used-directives/dynamic-autocomplete-template.html',
        }
    }).controller('DynamicAutocompleteCtrl', function ($scope, $q, DynamicApiService, tosterFactory) {
        var dactrl = this;
        dactrl.selectedItem = $scope.selEnt;
        dactrl.entityHandling = $scope.entityHandling;
        dactrl.bindmodel = $scope.ngModel;
        dactrl.propertySelect = 'Id';
        dactrl.simulateQuery = true; dactrl.isDisabled = false; dactrl.noCache = false;
        dactrl.minSearchLength = 0;
        dactrl.querySearch = $scope.autoFuns['querySearch'];
        dactrl.selectedItemChange = $scope.autoFuns['selectedItemChange'];
        dactrl.searchTextChange = $scope.autoFuns['searchTextChange'];
        dactrl.loadedList = $scope.searchList;

        //function querySearch(query) {
        //    //return [];
        //    var tmp = { Description: query };//, Code: query, }
        //    var params = 'page=1&pageSize=250' + '&filters=' + JSON.stringify(tmp);
        //    var results = [], deferred;//query ? dactrl.loadedProducts.filter(createFilterFor(query)) : dactrl.loadedProducts, deferred;
        //    //var results = query ? self.states.filter(createFilterFor(query)) : self.states,
        //    if (dactrl.simulateQuery) {
        //        deferred = $q.defer();
        //        dactrl.RestPromice.searchFilteredProducts(params).then(function (result) {
        //            dactrl.loadedProducts = result.data.Results;
        //            results = dactrl.loadedProducts;
        //            //results = query ? dactrl.loadedProducts.filter(createFilterFor(query)) : dactrl.loadedProducts;
        //            deferred.resolve(results);
        //            //return results;
        //        }).catch(function (fail) {
        //            console.warn('Products failed on description or code search');
        //            deferred.resolve([]);
        //            //return dactrl.loadedProducts = [];
        //        })
        //        return deferred.promise;
        //    } else {
        //        return results;
        //    }
        //}
        //function searchTextChange(text) {
        //    //console.info('Text changed to ' + text);
        //}
        //function selectedItemChange(item, apident){
        //    //dactrl.bindmodel = $scope.ngModel = dactrl.selectedItem[dactrl.propertySelect];
        //    if (dactrl.selectedItem != null && dactrl.selectedItem !== undefined) {
        //        $scope.ngModel = dactrl.selectedItem[dactrl.propertySelect]
        //    } else { $scope.ngModel = null } ;
        //    console.info('Item changed to ' + JSON.stringify(item));
        //    if (apident !== undefined) { apident.Id = item.ProductId; }
        //}
        //var searchFilterEnt = 'Description';
        //function createFilterFor(query) {
        //    var lowercaseQuery = angular.lowercase(query);
        //    return function filterFn(prod) {
        //        return (prod.Description.indexOf(lowercaseQuery) >= 0 || angular.lowercase(prod.Description).indexOf(lowercaseQuery) >= 0);
        //    };

        //}
        //dactrl.RestPromice = {
        //    'searchFilteredProducts': function (filterparams) {
        //        //Rest Get call for data using Api service to call Webapi
        //        return DynamicApiService.getDynamicObjectData('Product', filterparams).then(function (result) {
        //            //console.log('Search result of products succeded.'); console.log(result);
        //            return result;
        //        }).catch(function (rejection) { tosterFactory.showCustomToast('Searching on db yeild no results', 'fail'); console.warn('Get by search filters server failed. Reason:'); console.warn(rejection); return -1; });
        //    },
        //}
    })



    ;