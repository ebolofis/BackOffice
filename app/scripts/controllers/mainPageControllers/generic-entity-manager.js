'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:MainCtrl
 * @description
 *  here is a main template initiallize by entity to manage controller 
 *  that by entity name initiallize represents on its main content a directive of main-views to manage Entity on server
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .controller('GenericEntityManagerCtrl', [
        'tosterFactory', '$stateParams', '$scope', '$q', '$interval', '$uibModal', '$mdDialog', '$mdMedia', 'DynamicApiService', 'dataUtilFactory', 'EntityTemplateManager',
        function (tosterFactory, $stateParams, $scope, $q, $interval, $uibModal, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, EntityTemplateManager) {
            //define editing entity 
            //load editing template that includes managing directives over view
            //load editing dependences & lookups
            //load data
            //$scope.editingEntity = 'Staff'; // this is a var to characterize editing entity. Based on this lookups template and functionality of view are changed
            $scope.idlestate = false; //this is a var to disable actions as idle state
            $scope.initView = function () {

                $scope.viewTitle = EntityTemplateManager.getcontainerTitle($scope.editingEntity);
                $scope.containerTemplate = EntityTemplateManager.getcontainerTemplate($scope.editingEntity);
                if ($scope.containerTemplate == null)
                    $scope.containerTemplate = 'error-container-template';
            }
            $scope.saveChanges = function () {
                $scope.idlestate = true;
                tosterFactory.showCustomToast('Saving Changes', 'info');
                $scope.idlestate = false;
            }

            $scope.vvar = 'Test Title';
            $scope.actionfff = function () {
                $scope.vvar = 'Title changed';
            }
        }]).filter('removeSpaces', [function () {
            return function (string) {
                if (!angular.isString(string)) {
                    return string;
                }
                return string.replace(/[\s]/g, '');
            };
        }])
    .service('EntityTemplateManager', ['$http', 'config', function ($http, config) {
        var templates = {
            'RegionLockerProduct': 'edit-regionlockerproduct-container-template',
            'Staff': 'edit-staff-container-template',
            'ManageExternalProducts': 'edit-manageexternalproducts-container-template',
            'Payrole': 'edit-payrole-container-template',
            'CloseYear': 'edit-closeyear-container-template',
            'NFCconfig': 'edit-nfcDevice-template',
            'EmailConfig': 'edit-emailconfig-template',
            'errorLoad': 'error-loading-template'
        };
        this.getcontainerTemplate = function (type) {
            var ret = null;
            if (templates[type] !== undefined && templates[type] !== null) {
                ret = templates[type];
            } else {
                console.log('Invalid template match or error on matching template of type:' + type);
                ret = templates['errorLoad'];
            }
            return ret;
        };

        var titles = {
            'RegionLockerProduct': 'Manage Locker Products',
            'Staff': 'Manage Staff',
            'ManageExternalProducts': 'External Products Entities',
            'Payrole': 'Payrole Entries',
            'CloseYear': 'Close Current Year',
            'NFCconfig': 'NFC Configuration',
            'EmailConfig': 'Email Configuration',
            'errorLoad': 'Invalid Manage Template'
        };
        this.getcontainerTitle = function (type) {
            var ret = null;
            if (titles[type] !== undefined && titles[type] !== null) {
                ret = titles[type];
            } else {
                console.log('Invalid template header match or error on matching title of type:' + type);
                ret = titles['errorLoad'];
            }
            return ret;
        }
    }])
    .directive('nfcDeviceManager', function () {
        function linkfun(scope, element, attrs) {
            scope.$watch(function () { return scope.title; }, function (newvar) {
                //alert(newvar);
            })
        }
        return {
            controller: 'NFCDeviceManagerCtrl', restrict: 'EAC',
            scope: {}, link: linkfun,
            //template :'<div>Hello kosmang </div>'
            templateUrl: 'app/scripts/directives/views-directives/entities-manager/manage-nfc-device-template.html',
        };
    })
    .controller('NFCDeviceManagerCtrl', function ($scope, $q, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, tosterFactory) {

        //Rest ResourcesObject Reference to handle all Rest calls nfc-configuration need to be handled
        $scope.RestPromice = {
            //Resource of lookups needed to manage nfc device 
            'lookups': function (nameType) {
                return DynamicApiService.getLookupsByEntityName('NFCConfiguration').then(function (result) { //Rest Get call for data using Api service to call Webapi
                    console.log('LookUps loaded'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Lookups failed', 'fail'); console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection); return -1; });
            },
            //Get Resource return a single entity or -1 when smth went wrong
            'getNFC': function () {
                return DynamicApiService.getV3("NFCcard", "GetNFCcardInfo").then(function (result) {
                    console.log(result);
                    var msg = (result.data != null) ? 'NFC Device configuration Loaded.' : 'No NFC device Configured';
                    var mt = (result.data != null) ? 'success' : 'info';
                    tosterFactory.showCustomToast(msg, mt);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Loading nfc device failed', 'fail'); console.warn('Get action on server failed. Reason:'); console.warn(rejection); return -1; });
            },
            //Parse a model to resource then update via v3 controller data provided to function 
            'updateNFC': function (data) {
                var params = '';
                if (data != null)
                    params = data;
                return DynamicApiService.postV3("NFCcard", "UpdateNFCcardInfo", data).then(function (result) {
                    tosterFactory.showCustomToast(result.data, 'success');
                    console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Updating nfc device failed', 'fail'); console.warn('Put action on server failed. Reason:'); console.warn(rejection); return -1; });
            },
        }
        //Change event function that checkes 3 model vars not to be the same
        $scope.checkValidModel = function (nfcm, form) {
            var rvalid = (nfcm == null || nfcm.FirstDateSector == nfcm.RoomSector || nfcm.SecondDateSector == nfcm.RoomSector || nfcm.FirstDateSector == nfcm.SecondDateSector) ? false : true;
            if (nfcm.ValidateDate != true) {
                rvalid = true;
            }
            if (form != undefined) {
                if (nfcm.FirstDateSector == nfcm.RoomSector && nfcm.SecondDateSector == nfcm.RoomSector) {
                    if (form.RoomSector != undefined)
                        form.RoomSector.$setValidity("notsame", rvalid);
                    if (form.FirstDateSector != undefined)
                        form.FirstDateSector.$setValidity("notsame", rvalid);
                    if (form.SecondDateSector != undefined)
                        form.SecondDateSector.$setValidity("notsame", rvalid);
                }
                else if (nfcm.FirstDateSector == nfcm.RoomSector) {
                    if (form.RoomSector != undefined)
                        form.RoomSector.$setValidity("notsame", rvalid);
                    if (form.FirstDateSector != undefined)
                        form.FirstDateSector.$setValidity("notsame", rvalid);
                    if (form.SecondDateSector != undefined)
                        form.SecondDateSector.$setValidity("notsame", !rvalid);
                }
                else if (nfcm.SecondDateSector == nfcm.RoomSector) {
                    if (form.RoomSector != undefined)
                        form.RoomSector.$setValidity("notsame", rvalid);
                    if (form.FirstDateSector != undefined)
                        form.FirstDateSector.$setValidity("notsame", !rvalid);
                    if (form.SecondDateSector != undefined)
                        form.SecondDateSector.$setValidity("notsame", rvalid);
                }
                else if (nfcm.FirstDateSector == nfcm.SecondDateSector) {
                    if (form.RoomSector != undefined)
                        form.RoomSector.$setValidity("notsame", !rvalid);
                    if (form.FirstDateSector != undefined)
                        form.FirstDateSector.$setValidity("notsame", rvalid);
                    if (form.SecondDateSector != undefined)
                        form.SecondDateSector.$setValidity("notsame", rvalid);
                }
                else {
                    if (form.RoomSector != undefined)
                        form.RoomSector.$setValidity("notsame", rvalid);
                    if (form.FirstDateSector != undefined)
                        form.FirstDateSector.$setValidity("notsame", rvalid);
                    if (form.SecondDateSector != undefined)
                        form.SecondDateSector.$setValidity("notsame", rvalid);
                }
                form.$setSubmitted();
            }
        }
        //watcher on dropdown nfc type 
        //action will bound new min max values to model validation and resubmit form to display error msgs
        $scope.$watch('nfc.Type', function (newValue, oldValue) {
            switch (newValue) {
                case 0: case '0': $scope.maxval = 63, $scope.minval = 0; break;
                case 1: case '1': $scope.maxval = 15, $scope.minval = 0; break;
                default: $scope.maxval = 0, $scope.minval = 0; break;
            }
            if ($scope.dynSGIForm != undefined) {
                $scope.dynSGIForm.RoomSector.$validate();
                $scope.dynSGIForm.FirstDateSector.$validate();
                $scope.dynSGIForm.SecondDateSector.$validate();
                $scope.dynSGIForm.$setSubmitted();
            }
        }, true);
        //Event binded to select drop down of nfc type 
        //Changes bounded vars for form validation
        $scope.nfctypeChanged = function (choice) {
            //MifareClassic = 0,   [min max] [0 , 63]
            //MifareUltralight = 1 [min max] [0 , 15]
            switch (choice) {
                case 0: case '0': $scope.maxval = 63, $scope.minval = 0; break;
                case 1: case '1': $scope.maxval = 15, $scope.minval = 0; break;
                default: $scope.maxval = 0, $scope.minval = 0; break;
            }
        }
        //update model from form
        $scope.savenfc = function () {
            //if use of datesector is not active apply -1 to property
            if ($scope.nfc.ValidateDate != true) {
                $scope.nfc.FirstDateSector = null;
                $scope.nfc.SecondDateSector = null;
            }
            $scope.busyProcess = true;
            $scope.RestPromice.updateNFC($scope.nfc).then(function (res) {
                if (res != -1) {
                    //on success of update 
                    //reload model
                    $scope.RestPromice.getNFC().then(function (res) {
                        $scope.nfc = res.data;
                    }).catch().finally(function () {
                        $scope.busyProcess = false;
                    });
                }
            }).catch(function () {
                $scope.busyProcess = false;
            });
        }

        //Initiallize function that triggers 2 promises lookups and getdata marking a template flag as edited false to loaded obj
        $scope.init = function () {
            $scope.busyProcess = true;
            $scope.maxval = $scope.minval = 1;
            $scope.lookups = {};
            var lookupPromise = $scope.RestPromice.lookups();
            var loadNfcPromise = $scope.RestPromice.getNFC();
            $q.all({ lookupPromise, loadNfcPromise }).then(function (d) {
                if (d.lookupPromise != -1) {
                    $scope.lookups['NFCType'] = d.lookupPromise.data.LookUpEntities.nfcType;
                }
                if (d.loadNfcPromise != -1) {
                    $scope.nfc = d.loadNfcPromise.data;
                }
            }).finally(function () {
                $scope.busyProcess = false;
            });

        }
    })

    .directive('closeYearManager', function () { return { controller: 'CloseYearToHistoryCtrl', restrict: 'E', scope: {}, templateUrl: 'app/scripts/directives/views-directives/entities-manager/manage-closeyear-template.html', }; })
    .controller('CloseYearToHistoryCtrl', function ($scope, $q, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, tosterFactory) {
        //Main closing year promise functionallity. Provide year you wish to close and name to assign to SQL job 
        $scope.closeYear = function (syear, jobDesc) {
            var nyear = Number(syear);
            if (typeof nyear != 'number') { tosterFactory.showCustomToast('Not a valid year', 'fail'); return; };
            $scope.processing = true;
            $scope.RestPromice.closeYear(syear, jobDesc).then(function (res) {
                if (res != undefined && res.data != null) {
                    //force unvalid vars to 
                    $scope.validToClose = false; $scope.selectedClosingYear = -1;
                    alert('Closing Year activated procedure started. This will take several minutes to complete.');
                    //loadValid();
                } else {
                    alert('Closing Failed to post');
                }
            }).catch().finally(function () { $scope.processing = false; }); //lookup entities

        }
        //Rest Promises Used by Entity UI handling and displaying 
        $scope.RestPromice = {
            //This Resource Returns an obj {valid , YEAR}.  valid : When LastClose was LastYear and date is at least 10/1 of next year
            'loadValidYear': function () {
                return DynamicApiService.getDynamicObjectData('EndOfYear', 'now=false').then(function (result) {
                    console.log('Returned validmodel year.'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Getting closed years failed on server', 'fail'); console.warn('Get Closed years action failed'); console.warn(rejection); return null; });
            },
            //Resouce to post a Closeyear Job Task
            'closeYear': function (yr, jobDesc) {
                var job = (jobDesc != undefined) ? jobDesc.replace(/[\s]/g, '') : 'ClosingYear' + yr;
                return DynamicApiService.putAttributeRoutingData('Endofyear', 'Movetohistory/' + yr + '/' + job, '').then(function (result) {
                    console.log('Close year returned successfuly'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Closing year failed on server', 'fail'); console.warn('Multi Actions failed'); console.warn(rejection); return null; });
            },
            //Get Registers on EndOfYear by generic getAll()
            'getAllClosed':
            function () {
                return DynamicApiService.getDynamicObjectData('EndOfYear', '').then(function (result) {
                    console.log('Closing  years found on server.'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Getting closed years failed on server', 'fail'); console.warn('Get Closed years action failed'); console.warn(rejection); return null; });
            }
        }

        $scope.init = function () {
            $scope.orderFilt = 'Id';
            $scope.validToClose = false;
            //$scope.selectedClosingYear = -1;$scope.yearsClosed = [];
            loadValid();
        }
        //UI map ref funs
        $scope.reloadClosings = loadYears;
        $scope.loadValid = loadValid;

        //BI UI action to check valid Close
        function loadValid() {
            $scope.processing = true;
            $scope.RestPromice.loadValidYear().then(function (res) {
                if (res != undefined && res.data != null && res.data.valid != undefined) {
                    if (res.data.valid == false)
                        tosterFactory.showCustomToast('Closing-Year not Allowed', 'warning');
                    $scope.validToClose = res.data.valid;
                    $scope.selectedClosingYear = angular.copy(res.data.newClosingDate);
                    loadYears();
                } else {
                    $scope.validToClose = false;
                }
            }).catch(function () { $scope.validToClose = false; }).finally(function () { $scope.processing = false; });
        }
        //BI UI action on load years
        function loadYears() {
            $scope.yearsClosed = []; $scope.processing = true;
            $scope.RestPromice.getAllClosed().then(function (res) {
                if (res != undefined && res.data != null) {
                    $scope.yearsClosed = formatDateToDatepicker(res.data);
                } else {
                    alert('Reload undefined results of closing year data');
                }
            }).catch().finally(function () {
                $scope.processing = false;
            });
        }
        //Function to format and create a date obj for datepicker from datestring in DB 
        function formatDateToDatepicker(arr) {
            var ret = arr.map(function (cc) {
                cc.ClosedDateDP = new Date(cc.ClosedDate);
                return cc;
            })
            return ret;
        }
    })

    //Payrole Directive

    .directive('payroleManager', function () {
        return {
            controller: 'PayroleManagerCtrl',
            restrict: 'E',
            scope: {},
            templateUrl: 'app/scripts/directives/views-directives/entities-manager/manage-payrole-template.html',

        };
    })
    .controller('PayroleManagerCtrl', function ($scope, $q, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, tosterFactory, FileSaver, Blob) {
        //variable to manage pagginator on results list
        $scope.paging = { total: 1, current: 1, onPageChanged: pagfun };
        var defaultPredicate = { Identification: '', ActionDateFrom: null, ActionDateTo: null, Type: null, PosInfoId: null, StaffId: null, ShopId: '', usedate: false }
        $scope.resfilter = { page: 0, pageSize: 50, filters: defaultPredicate }
        $scope.clearFilter = function () { $scope.resfilter.filters = angular.copy(defaultPredicate); };

        //initiallize function
        $scope.init = function () {
            $scope.payroles = []; //array of loaded results
            $scope.expostArray = [];
            $scope.busyloading = true; //promise var of deactivation attributes over UI
            $scope.lookupEnums = { PosInfo: {}, Staff: {}, Type: {} };
            $q.all({
                lookupP: $scope.RestPromice.lookups('Payrole'), //lookup entities
            }).then(function (d) {
                $scope.busyloading = false;
                $scope.lookups = d.lookupP.data.LookUpEntities;
                getpagedPagedPayroles();
                //Create lookups by ref you are interested to display entities on list dislay in O(1) search and provide Info as quick as you want
                $scope.lookupEnums['PosInfo'] = dataUtilFactory.createEnumObjs($scope.lookups.PosInfoId, {}, 'Id');
                $scope.lookupEnums['Staff'] = dataUtilFactory.createEnumObjs($scope.lookups.StaffId, {}, 'Id');
                $scope.lookupEnums['Type'] = dataUtilFactory.createEnums($scope.lookups.Type, {}, 'Key', 'Value');

            })
        }
        //a function that load results and handles paggination options
        function getpagedPagedPayroles() {
            //console.log('Trigger get');
            $scope.busyloading = true;
            var par = '', f = createFilterObj(), extdata = { page: $scope.currentPage, pageSize: $scope.resfilter.pageSize, filters: JSON.stringify(f), };
            //console.log(extdata);
            $scope.RestPromice.getPagedFiltered(par, extdata).then(function (res) {
                //console.log('Return of getpaged promise');
                if (res != -1) { handlePagesVars(res); } else { $scope.payroles = []; }
            }).catch().finally(function () { $scope.busyloading = false; })
        }
        //var to act as triggerer on call of data
        $scope.triggerGetPage = getpagedPagedPayroles;

        //a function to return a filter to be stringify as an obj to pagedresults filter
        function createFilterObj() {
            var retfilt = angular.copy($scope.resfilter.filters);
            if ($scope.resfilter.filters.usedate == true) { } else { retfilt.ActionDateFrom = null; retfilt.ActionDateTo = null; }
            if (retfilt.ActionDateFrom == null) delete retfilt.ActionDateFrom;
            if (retfilt.ActionDateTo == null) delete retfilt.ActionDateTo;
            return retfilt;
        }
        //this is a function that matches results loaded with dependency variables on UI
        function handlePagesVars(result) {
            if ($scope.paging.total != result.data.PageCount) $scope.paging.total = result.data.PageCount;
            if ($scope.paging.current != result.data.CurrentPage) $scope.paging.current = result.data.CurrentPage;
            $scope.currentPage = result.data.CurrentPage;
            $scope.payroles = angular.copy(result.data.Results);
        }
        //event of pagged function mapped with paged Results REST Get
        function pagfun() {
            if ($scope.currentPage != $scope.paging.current) {
                $scope.currentPage = $scope.paging.current;
                getpagedPagedPayroles();
            }
        }

        //an object call function that handles all Resource Requests
        $scope.RestPromice = {
            //Resource of lookups needed to manage lockers and side entities of forms
            'lookups': function (nameType) {
                return DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    console.log('LookUps loaded'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Lookups failed', 'fail'); console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection); return null; });
            },
            'searchFilteredPayroles': function (filterparams) {
                return DynamicApiService.getDynamicObjectData('Product', filterparams).then(function (result) { //Rest Get call for data using Api service to call Webapi 
                    console.log('Search result of products succeded.'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Searching Products yeild no results', 'fail'); console.warn('Get by Product by Filters server failed. Reason:'); console.warn(rejection); return -1; });
            },
            'getAll': function (data) {
                var params = '';
                if (data !== undefined || data !== null)
                    params = data;
                return DynamicApiService.getDynamicObjectData("Payrole", data).then(function (result) {
                    tosterFactory.showCustomToast('Payroles loaded successfully.', 'success');
                    console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Loading payroles  failed', 'fail'); console.warn('Getall action on server failed. Reason:'); console.warn(rejection); return -1; });
            },
            'getPagedFiltered': function (paramsdata, extdata) {
                var params = '';
                if (paramsdata !== undefined || paramsdata !== null)
                    params = paramsdata;
                return DynamicApiService.postAttributeRoutingData("", "PostPayrolePagedFilter", extdata).then(function (result) {
                    tosterFactory.showCustomToast('Payroles loaded successfully.', 'success');
                    console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Loading payroles  failed', 'fail'); console.warn('Getall action on server failed. Reason:'); console.warn(rejection); return -1; });

            },
        }
        $scope.logClick = function () {
            console.log('lookups'); console.log($scope.lookups);
            console.log('payroles'); console.log($scope.payroles);
        }
        //Button Action function on select filters modal 
        //Changes and applies filter changes and on return gets Uses pagedResultby filter Resource
        $scope.selectFiltersModal = function () {
            var resfilter = angular.copy($scope.resfilter);
            var lookups = angular.copy($scope.lookups);
            $mdDialog.show({
                controller: 'PayroleFilterCtrl',
                templateUrl: '../app/scripts/directives/modal-directives/payrole-filter-modal-template.html',
                parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: {
                    resfilter: function () { return resfilter; },
                    lookups: function () { return lookups; }
                }
            }).then(function (data) {
                //console.log('This is data filter return from selection filter modal');
                if (data != undefined) {
                    angular.extend($scope.resfilter, data);
                    //console.log(data); console.log($scope.resfilter);
                    getpagedPagedPayroles();
                }
            }).catch(function () { console.log('This is data filter return from selection filter modal'); });
        }
        //display for date and time from isostring to list repeat view
        //those functions handle date and time representation by formatprovided
        $scope.formatDateProc = function (dd) { return moment(dd).format('DD/MM/YYYY'); }
        $scope.formatTimeProc = function (dd) { return moment(dd).format('kk:mm'); }
        // 00000705 || 08/02/2017 || 21:36 || A- B|| 68 
        // κωδικός κάρτας //ημερομηνία συστήματος//ώρα// είσοδος-έξοδος // Τα τελευταία 2 πεδία είναι ο σταθμός(POS) από πού έγινε η εξαγωγή(παραμετρικό)
        function printObj(pr) {
            var retobj = {
                Identification: pr.Identification,
                Date: $scope.formatDateProc(pr.ActionDate),
                Time: $scope.formatTimeProc(pr.ActionDate),
                Type: (pr.Type == 0) ? 'A' : ((pr.Type == 1) ? 'B' : 'Error'),

                Pos: $scope.lookupEnums.PosInfo[pr.PosInfoId]['Code'],
            }
            return retobj;
        }
        function manageCode(item) {
            var t = angular.copy($scope.lookupEnums.Staff[item.StaffId]['Code']);
            while (t.length < 8) {
                t = '0' + t;
            }
            return t;
        }


        $scope.download = function (text, filename) {
            var fname = 'Export.txt';
            if (filename != undefined && filename != '') {
                if (filename.substring(filename.length - 4, filename.length) != '.txt') {
                    fname = angular.copy(filename + '.txt');
                } else {
                    fname = angular.copy(filename);
                }

            }
            //available export entities
            //var op = {
            //    text: ['text/plain', 'text/html', 'text/css', 'text/javascript'],image: ['image/gif', 'image/png', 'image/jpeg', 'image/bmp', 'image/webp'],audio: ['audio/midi', 'audio/mpeg', 'audio/webm', 'audio/ogg', 'audio/wav'],
            //    video: ['video/webm', 'video/ogg'],application: ['application/octet-stream', 'application/pkcs12', 'application/vnd.mspowerpoint', 'application/xhtml+xml', 'application/xml', 'application/pdf']
            //};
            //var charsets = ['ascii', 'ansi', 'iso-8859-1', 'utf-8'];
            //$scope.selectedOp = 'text'; var opchoice = 0, charsetchoice = 0;  $scope.selectedType = op[$scope.selectedOp][opchoice]; $scope.selectedCharset = charsets[charsetchoice];
            //var data = new Blob([text], { type: $scope.selectedType + ';charset=' + $scope.selectedCharset });
            var data = new Blob([text], { type: 'text/plain;charset=ascii' });
            FileSaver.saveAs(data, fname);
        };
        //call function on export UserButton Action
        $scope.filename = 'Export';
        $scope.exportDataArray = function () {
            console.log('transforming');
            var transformed = []; var arr = angular.copy($scope.payroles);
            var tdData = "";
            angular.forEach(arr, function (item) {
                //Export File is for Autogrill Perpose
                var c = manageCode(item);
                var d = $scope.formatDateProc(item.ActionDate);
                var t = $scope.formatTimeProc(item.ActionDate);
                var e = (item.Type == 0) ? 'A' : ((item.Type == 1) ? 'B' : 'Error');
                var gtx = c + d + t + e + $scope.lookupEnums.PosInfo[item.PosInfoId]['Code'];
                tdData += gtx; tdData += "\r\n";
            });
            var filename = ($scope.filename != undefined) ? angular.copy($scope.filename) : '';
            $mdDialog.show({
                controller: function ($mdDialog, $scope, filename) {
                    if (filename != undefined)
                        $scope.outfname = angular.copy(filename)
                    else $scope.outfname = '';
                    $scope.close = function (data) {
                        $mdDialog.hide(data)
                    }
                },
                template: '<md-dialog aria-label="List dialog" style="width:40vw;"><md-toolbar><div class="md-toolbar-tools"><h2>Export</h2><span flex></span></div></md-toolbar>'
                + '<md-dialog-content><div class="md-padding" layout="column" layout-align="center stretch">'
                + '<md-input-container class="md-block" flex="grow"><label>Filename</label><input name="exportfilename" ng-model="outfname"><div class="hint">*Select name for your exportfile</div></md-input-container>'
                + '</div></md-dialog-content>'
                + '<md-dialog-actions>'
                + '<md-button ng-click="close();" class="md-raised">Close</md-button>'
                + '<md-button ng-click="close(outfname);" class="md-raised md-primary">Export</md-button>'
                + '</md-dialog-actions></md-dialog>',
                parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: {
                    filename: function () { return filename; },
                }
            }).then(function (data) {
                console.log('Exportname selected return with data:');
                console.log(data);
                if (data != undefined) {
                    try {
                        $scope.filename = data;
                        $scope.download(tdData, data);
                    } catch (e) { alert('Something went wrong with the outputfile.\nVerify that your export entities uses latin chars or try smaller size'); }
                }
            }).catch(function () { console.log('This is export name selection modal'); });
        }


    })
    .controller('PayroleFilterCtrl', function ($scope, $mdDialog, resfilter, lookups) {
        console.log('Popup result filter modal');
        var defaultPredicate = { Identification: '', ActionDateFrom: null, ActionDateTo: null, Type: null, PosInfoId: null, StaffId: null, ShopId: '', usedate: false }
        $scope.resfilter = angular.copy(resfilter); //{  page: 0, pageSize: 50, filters: {} }
        $scope.lookups = angular.copy(lookups);
        //a function to reinitiallize filter of filter

        //return filter entity to its default state and re-initiallizes date 
        $scope.clearFilter = function () {
            $scope.resfilter.filters = angular.copy(defaultPredicate);
            initDate();
        }
        //log button filter on modal
        $scope.logfilter = function () { console.log($scope.resfilter); }
        //this is a filter function that disables dates earlier than from date 
        //it is binded to actiondateto field
        $scope.dateBiggerFrom = function (date) {
            var ds = angular.copy(date), de = angular.copy($scope.resfilter.filters.DPActionDateFrom);
            ds.setHours(0, 0, 0, 0); de.setHours(0, 0, 0, 0);
            if (ds >= de) { return true; }
            return false;
        }
        $scope.managedate = function (entto, entfrom) {
            var addHours = -1 * new Date().getTimezoneOffset() / 60;
            var zax = moment($scope.resfilter.filters[entfrom]).startOf('hour').add(addHours, 'hours');
            $scope.resfilter.filters[entto] = zax.toISOString();
        }
        //when from date change and to date is earlier that selected 
        //force dateto to bind from date +1 day
        $scope.changeForceToDate = function () {
            console.log('Force change to date');
            if (!$scope.dateBiggerFrom($scope.resfilter.filters.DPActionDateTo)) {
                var t = angular.copy($scope.resfilter.filters.DPActionDateFrom);
                t.setDate(t.getDate());
                $scope.resfilter.filters.DPActionDateTo = t;
                $scope.managedate('ActionDateTo', 'DPActionDateTo');
            }
        }
        $scope.hide = function () { $mdDialog.hide(); };
        $scope.cancel = function () { $mdDialog.cancel(); };
        $scope.confirm = function (answer) {
            manageReturnFilter();
            $mdDialog.hide($scope.resfilter);
        }
        function manageReturnFilter() {
            //var defaultPredicate = { Identification: '', ActionDateFrom: null, ActionDateTo: null, Type: null, PosInfoId: null, StaffId: null, ShopId: '', usedate: false }
            var tf = angular.copy($scope.resfilter.filters);
            if (typeof tf.Type == 'string') {
                if (tf.Type == 'null') {
                    tf.Type = null;
                } else {
                    try { tf.Type = Number(tf.Type); } catch (e) { tf.Type = null; }
                }
            } else if (typeof tf.Type == 'number') { } else { tf.Type = null; }
            angular.extend($scope.resfilter.filters, tf);
        }

        $scope.init = function () {
            initDate();
        }();
        //function to initiallize or reset filter on dates
        function initDate() {
            if ($scope.resfilter.filters.ActionDateFrom == undefined) {
                $scope.resfilter.filters.DPActionDateFrom = new Date();
                $scope.managedate('ActionDateFrom', 'DPActionDateFrom');
                //$scope.resfilter.filters.ActionDateFrom = new Date().toISOString();
            } else {
                $scope.resfilter.filters.DPActionDateFrom = new Date($scope.resfilter.filters.ActionDateFrom);
            }
            if ($scope.resfilter.filters.ActionDateTo == undefined) {
                var t = new Date();
                t.setDate(t.getDate());
                $scope.resfilter.filters.DPActionDateTo = t;
                $scope.managedate('ActionDateTo', 'DPActionDateTo');
                //$scope.resfilter.filters.ActionDateTo = t.toISOString();
            } else {
                $scope.resfilter.filters.DPActionDateTo = new Date($scope.resfilter.filters.ActionDateTo);
            }
        }
    })


    .directive('manageExternalProductsManager', function () {
        return {
            controller: 'ManageExternalProductsManagerCtrl',
            restrict: 'E',
            scope: {},
            templateUrl: 'app/scripts/directives/views-directives/entities-manager/manage-external-products-manager-template.html',

        };
    })
    .controller('ManageExternalProductsManagerCtrl', function ($scope, $q, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, tosterFactory) {
        //initiallize function
        $scope.init = function () {
            $scope.externalProducts = []; //array of loaded results 
            $scope.busyloading = true; //promise var of deactivation attributes over UI
            $q.all({
                result1: $scope.RestPromice.lookups('ManageExternalProductsManager'), //lookup entities
                result2: $scope.RestPromice.getAll(''), //promise of request all 
            }).then(function (d) {
                $scope.busyloading = false;
                $scope.lookups = d.result1.data.LookUpEntities;
                $scope.externalProducts = d.result2.data;
                createMapObj();
            })
        }
        //create a reference obj 
        function createMapObj() {
            var newmap = {};
            newmap = dataUtilFactory.createEnumObjs($scope.externalProducts, newmap, 'Id');
            $scope.loadedMap = angular.copy(newmap);
        }
        $scope.checkDirty = function (ent) {
            if (ent == null || ent === undefined) {
                return;
            }
            var primary = $scope.loadedMap[ent.Id];
            (primary.ProductId != ent.ProductId || Number(primary.ProductEnumType) != Number(ent.ProductEnumType)) ? ent.isDirty = true : ent.isDirty = false;
            return ent;
        }
        //function on dynamic form edit to insert new register 
        $scope.addEntry = function (type, data) {
            var formModel = {
                entityIdentifier: 'ExternalProductMapping', forceTitle: 'Create External map over a Product',
                dropDownObject: $scope.lookups, querySearch: querySearch, selectedItemChange: selectedItemChange, searchTextChange: searchTextChange,
            };
            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return {}; } }
            }).then(function (data) {
                console.log('Saving Product map'); console.log(data);
                $scope.busyloading = true;
                $q.all({
                    //on success of saving modal call a resource to save 
                    add: $scope.RestPromice.add(data), //lookup entities
                }).then(function (res) {
                    if (res.add.data != -1 && res.add.data != undefined && res.add.data.Id != undefined) {
                        var ids = res.add.data.Id;
                        //call it busy to load registers again
                        $scope.busyloading = true;
                        $scope.RestPromice.getAll('&id=' + ids).then(function (res) {
                            if (res != -1 && res.data != undefined) {
                                var item = angular.copy(res.data);
                                //sos trying to manage obj with an other way binds changes to same obj and ent does not transform to dirty 
                                var newobj = { Id: item.Id, Product: item.Product, ProductEnumType: item.ProductEnumType, ProductId: item.ProductId, };
                                angular.extend($scope.loadedMap, { [newobj.Id]: newobj });
                                $scope.externalProducts.unshift(item);
                            }
                        }).finally(function () { $scope.busyloading = false; })
                    }
                }).finally(function () { $scope.busyloading = false; })
            })
        }
        //function binded to delete button of current ent on displayed list of loaded maps 
        $scope.removeEntry = function (data) {
            var datatodelindx = $scope.externalProducts.indexOf(data);
            var idtodel = data.Id;
            $scope.busyloading = true;
            $scope.RestPromice.delete(data.Id).then(function (res) {
                $scope.externalProducts.splice(datatodelindx, 1);
                delete $scope.loadedMap[idtodel];
            }).catch(function (reason) { }).finally(function () { $scope.busyloading = false; })

        }
        var defaultMapModel = { Id: 0, ProductId: null, ProductEnumType: null }
        $scope.funfun = function (item) {
            console.log($scope.externalProducts);
            console.log($scope.loadedMap);
            //  alert(item.ProductId);
        }
        $scope.saveChanges = function () {
            var arrtosave = $scope.externalProducts.filter(function (item) { return item.isDirty == true; });
            if (checkValidPlicy(arrtosave) == false) {
                alert('Invalid Entities to Save.\nCheck products mapped and be sure you have selected Type of register into your handled entities.');
                tosterFactory.showCustomToast('Invalid Entities to Save', 'warning');
                return;
            }
            $scope.busyloading = true;
            $scope.RestPromice.editRange(arrtosave).then(function (res) {
                if (res != -1 && res != undefined && res != null) {
                    $scope.busyloading = true;
                    $scope.RestPromice.getAll('').then(function (res) {
                        if (res != -1 && res.data != undefined) {
                            $scope.externalProducts = res.data;
                            createMapObj();
                        }
                    }).finally(function () { $scope.busyloading = false; })
                }
            }).finally(function () { $scope.busyloading = false; })
        }

        function checkValidPlicy(arr) {
            var isvalid = true;
            for (var i = 0; i < arr.length; i++) {
                var ent = arr[i];
                if (ent.ProductId == undefined || ent.ProductEnumType == undefined) {
                    return false;
                }
            }
            return true;

        }
        //'add', null)
        //Rest Actions used in current management
        $scope.RestPromice = {
            //Resource of lookups needed to manage lockers and side entities of forms
            'lookups': function (nameType) {
                return DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    console.log('LookUps loaded'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Lookups failed', 'fail'); console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection); return null; });
            },
            'searchFilteredProducts': function (filterparams) {
                return DynamicApiService.getDynamicObjectData('Product', filterparams).then(function (result) { //Rest Get call for data using Api service to call Webapi 
                    console.log('Search result of products succeded.'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Searching Products yeild no results', 'fail'); console.warn('Get by Product by Filters server failed. Reason:'); console.warn(rejection); return -1; });
            },
            'getAll': function (data) {
                var params = '';
                if (data !== undefined || data !== null)
                    params = data;
                return DynamicApiService.getDynamicObjectData("ExternalProductMapping", data).then(function (result) {
                    tosterFactory.showCustomToast('External Maps loaded successfully.', 'success');
                    console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Loading external maps  failed', 'fail'); console.warn('Get action on server failed. Reason:'); console.warn(rejection); return -1; });
            },
            'add': function (data) {
                return DynamicApiService.postSingle("ExternalProductMapping", data).then(function (result) {
                    tosterFactory.showCustomToast('New external map on Product created.', 'success'); return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Insert new entry failed', 'fail'); console.warn('Post action on server failed. Reason:'); console.warn(rejection); return -1; });
            },
            'editRange': function (data) {
                return DynamicApiService.putMultiple("ExternalProductMapping", data).then(function (result) {
                    tosterFactory.showCustomToast('External map updated successfully.', 'success'); return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Updating external mapping Product failed', 'fail'); console.warn('Update action  external mapping Product on server failed. Reason:'); console.warn(rejection); return -1; });
            },
            'delete': function (data) {
                return DynamicApiService.deleteSingle("ExternalProductMapping", data).then(function (result) {
                    tosterFactory.showCustomToast('External map deleted successfully.', 'success'); return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Deleting  external mapping Product failed', 'fail'); console.warn('Delete action  external mapping Product on server failed. Reason:'); console.warn(rejection); return -1; });
            }
        }
        //variables to map with autocomplete directive
        $scope.simulateQuery = true; $scope.isDisabled = false; $scope.noCache = false;
        $scope.querySearch = querySearch; $scope.selectedItemChange = selectedItemChange; $scope.searchTextChange = void (0);//searchTextChange;
        //obj of functions to parse in dynamic autocomplete directive
        $scope.autoCompleteObjFun = { 'querySearch': $scope.querySearch, 'selectedItemChange': $scope.selectedItemChange, 'searchTextChange': $scope.searchTextChange, }
        //function binded to search text over results
        function querySearch(query) {
            var tmp = { Description: query }; var params = 'page=1&pageSize=250' + '&filters=' + JSON.stringify(tmp); var results = [], deferred;
            if ($scope.simulateQuery) {
                deferred = $q.defer();
                $scope.RestPromice.searchFilteredProducts(params).then(function (result) {
                    results = result.data.Results; deferred.resolve(results);
                }).catch(function (fail) { console.warn('Products failed on description or code search'); deferred.resolve([]); })
                return deferred.promise;
            } else { return results; }
        }
        function searchTextChange(text) { console.info('Text changed to ' + text); }
        function selectedItemChange(selectedItem, mapvar, entHandle) {
            if (selectedItem == undefined || selectedItem === null || selectedItem == -1) {
                return;
            }
            var managingEnt = angular.copy(entHandle);
            var providedVar = angular.copy(selectedItem);
            $scope.externalProducts = $scope.externalProducts.filter(function (item) {
                if (item['Id'] == managingEnt['Id']) {
                    item.ProductId = providedVar.Id;
                    item.Product = providedVar;
                    $scope.checkDirty(item);
                }
                return item;
            })
        }
        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(prod) { return (prod.Description.indexOf(lowercaseQuery) >= 0 || angular.lowercase(prod.Description).indexOf(lowercaseQuery) >= 0); };
        }

    })
    .directive('regionLockerProductManager', function () {
        return {
            controller: 'RegionLockerProductManagerCtrl',
            restrict: 'E',
            scope: {},
            templateUrl: 'app/scripts/directives/views-directives/entities-manager/manage-region-locker-product-template.html',

        };
    })
    .controller('RegionLockerProductManagerCtrl', function ($scope, $q, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, tosterFactory) {
        console.log('Hello LockerManager');
        //public enum ExternalProductMappingEnum { OnlineRegistration = 0, Locker, ProductForEod, Dump}
        $scope.init = function () {
            $scope.busyloading = true;
            $scope.selectedLocker = null;
            $q.all({
                lookupPr: $scope.RestPromice.lookups('RegionLockerProduct'), //lookup entities
                prodPr: $scope.RestPromice.getmappedProducts('Extype=1')
            }).then(function (d) {
                $scope.busyloading = false;
                $scope.lookups = d.lookupPr.data.LookUpEntities;
                $scope.loadedProducts = d.prodPr.data;
                //getLockersPaged via paggination event
                pagfun();
            })
        }

        //obj variable of paggination directive
        $scope.paging = { total: 1, current: 1, onPageChanged: pagfun };
        //event of pagged function mapped with paged Lockers REST Get
        function pagfun() {
            if ($scope.currentPage != $scope.paging.current) {
                $scope.currentPage = $scope.paging.current;
                getpagedlockers();
            }

        }
        //function that loads paged lockers
        //handles busy of loading call 
        //paggination result handle
        function getpagedlockers(page, pagesize) {
            $scope.busyloading = true;
            $scope.busyloadingPosinfoDetails == false;
            $scope.posinfoDetails = [];
            if (page === undefined || page === null || typeof (page) != 'number') page = $scope.paging.current;
            if (pagesize === undefined || pagesize === null || typeof (pagesize) != 'number') pagesize = 50;
            var params = 'page=' + page + '&pageSize=' + pagesize;
            //promise of paged lockers load 
            var getPagepromise = $scope.RestPromice.getPagedLockers(params);
            getPagepromise.then(function (result) {
                $scope.busyloading = false;
                if ($scope.paging.total != result.data.PageCount) $scope.paging.total = result.data.PageCount;
                if ($scope.paging.current != result.data.CurrentPage) $scope.paging.current = result.data.CurrentPage;
                $scope.currentPage = result.data.CurrentPage;
                $scope.loadedLockers = result.data.Results;

                if (result.data.length < 1) { tosterFactory.showCustomToast('No Results found', 'info'); }
            }).finally(function () { // finally(callback, notifyCallback)
                $scope.busyloading = false;
            });

        }

        //scope function on click listed locker
        //change current locker editing
        $scope.selectCurrentLocker = selectlocker;
        function selectlocker(lkr) {
            var pid = lkr.ProductId;
            var params = 'page=1&pageSize=50' + '&filters=' + JSON.stringify({ ProductId: pid });
            $q.all({
                prodsearch: $scope.RestPromice.getmappedProducts(params), //lookup entities
            }).then(function (d) {
                var res = d.prodsearch.data.Results[0];
                $scope.selectedLocker.Product = (res) ? res : null;
                lkr.Product = (res) ? res : null;
            })

            $scope.oldPosId = lkr.PosInfoId;
            $scope.selectedLocker = lkr;
            if (lkr.PosInfoId !== undefined && lkr.PosInfoId !== null && lkr.PosInfoId !== 0 && lkr.PosInfoId !== -1)
                $scope.posinfochanged(lkr.PosInfoId);
            else {
                tosterFactory.showCustomToast('Invalid PosInfo selection not an option to load details', 'info');
            }

        }
        function loadProductLookUps(txt) {
            var tmp = {
                Description: txt, Code: txt,
                //ProductId: null,//ProductCategoryId: ''
            }
        }

        $scope.loadedProducts = []; $scope.simulateQuery = true; $scope.isDisabled = false; $scope.noCache = false;
        $scope.querySearch = querySearch; $scope.selectedItemChange = selectedItemChange; $scope.searchTextChange = searchTextChange;
        function querySearch(query) {
            var results = query ? $scope.loadedProducts.filter(createFilterFor(query)) : $scope.loadedProducts;
            return results;
            //Rest Call on hole product array
            //var tmp = { Description: query } ,params = 'page=1&pageSize=250' + '&filters=' + JSON.stringify(tmp); results = [], deferred;
            //if ($scope.simulateQuery) { deferred = $q.defer(); $scope.RestPromice.getmappedProducts(params).then(function (result) { $scope.loadedProducts = result.data.Results;  results = $scope.loadedProducts; deferred.resolve(results); }).catch(function (fail) { console.warn('Products failed on description or code search'); deferred.resolve([]); }) return deferred.promise; } else { return results; }
        }
        function searchTextChange(text) { console.info('Text changed to ' + text); }
        function selectedItemChange(item, apident) { console.info('Item changed to ' + JSON.stringify(item)); if (apident !== undefined) { apident.Id = item.ProductId; } }
        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(prod) {
                return (prod.Description.indexOf(lowercaseQuery) >= 0 || angular.lowercase(prod.Description).indexOf(lowercaseQuery) >= 0
                    || prod.Code.indexOf(lowercaseQuery) >= 0 || angular.lowercase(prod.Code).indexOf(lowercaseQuery) >= 0
                );
            };

        }

        //this is a help value to bind on model loaded posinfoid
        $scope.oldPosId = -1;
        $scope.posinfochanged = posinfoch;
        function posinfoch(id) {
            console.log('Pos info id changed loading details over id:' + id);
            if (id !== null && id !== -1 && id !== undefined) {
                $scope.busyloadingPosinfoDetails == true;
                var params = '&posInfoId=' + id;
                //Load Pos info details by posinfo id parsed
                var posinfodetailpromice = $scope.RestPromice.loadposinfodetails(params);
                return posinfodetailpromice.then(function (result) {
                    $scope.posinfoDetails = result.data;
                    $scope.busyloadingPosinfoDetails == false;
                    return result.data;
                }).finally(function () { // finally(callback, notifyCallback)
                    $scope.busyloadingPosinfoDetails == false;
                });
            } else {
                tosterFactory.showCustomToast('Invalid PosInfo Selected ', 'warning');
            }
        }
        //Edit or Add entry via Dynamic insertion modal modal
        $scope.editEntry = function (type, locker) {
            var formModel = {
                entityIdentifier: 'RegionLockerProduct',
                dropDownObject: $scope.lookups,
                forceTitle: 'Create Locker Product',
                posinfochanged: posinfoch,//$scope.posinfochanged
                posinfoDetails: $scope.posinfoDetails,
                querySearch: querySearch,
                selectedItemChange: selectedItemChange,
                searchTextChange: searchTextChange,
            };
            var dataEntry = {};
            var userMapped = locker;
            //console.log('************************************');
            if (type == 'edit' && locker !== undefined && locker !== null) {
                formModel = angular.extend({ forceTitle: 'Edit Locker Product' }, formModel);
                dataEntry = angular.copy(locker);
                var p = $scope.loadedProducts.filter(function (ps) {
                    return (ps.Id == locker.Product.ProductId);
                });
                dataEntry['selectedProduct'] = p[0];

            }
            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
            }).then(function (data) {
                console.log('Saving Locker'); console.log(data);
                $scope.processingLocker = true;
                //to save we have to ... validate posinfodetail ids over posinfoID on updating entity
                //posinfodetails are loaded so check to save ids if belongs to a posinfodetail from those who loaded via validate function
                //so $scope.posinfo loaded is last loaded as update is only on modal 
                //important step to match ids that is number in this entity
                var toSaveEnt = validateEntry(data);
                //on success we have to check these things
                //update models loaded per page page size and current page selected
                if (toSaveEnt.Id === undefined || toSaveEnt.Id === null || toSaveEnt.Id == -1) {
                    //then add
                    //toSaveEnt.Id = 0;
                    $scope.saveLocker('add', toSaveEnt)
                    $scope.processingLocker = false;
                } else {
                    $scope.selectedLocker = toSaveEnt;
                    $scope.saveLocker('edit', toSaveEnt)
                    //else update 
                    $scope.processingLocker = false;
                }
            })
        }
        $scope.removeEntry = function (locker) {
            if (locker.Id !== undefined && locker.Id !== null && Number(locker.Id) > 0) {
                var deleteDialog = $mdDialog.confirm().title('Deleting Locker').textContent('You have selected "' + locker.SalesDescription + '" entry to delete.\n Would you like to proceed and delete current locker?')
                    .ariaLabel('deletingClocker').ok('Delete').cancel('Cancel');
                $mdDialog.show(deleteDialog).then(function () {
                    $scope.processingLocker = true;
                    $scope.saveLocker('delete', locker.Id);
                });

            } else {
                tosterFactory.showCustomToast('Invalid selected entity\'s id:' + locker.Id, 'warn');
            }
        }
        var defaultlocker = {
            Id: 0,
            Price: 0,
            Discount: 0,
            ProductId: -1,
            // Product: null,
            SalesDescription: "",
            PosInfoId: -1,
            // PosInfo: null,
            PriceListId: -1,
            // Pricelist: null,
            PaymentId: -1,
            ReturnPaymentpId: -1,
            SaleId: -1,
            //RegionId: 5
        }
        //action to update view on a rest call
        $scope.saveLocker = function (type, entry) {
            console.log(entry);
            switch (type) {
                case 'add':
                    var copy = angular.copy(defaultlocker);
                    copy = angular.extend(copy, entry);
                    copy.ProductId = Number(copy.ProductId);
                    copy.PosInfoId = Number(copy.PosInfoId);
                    copy.PriceListId = Number(copy.PriceListId);
                    copy.PaymentId = Number(copy.PaymentId);
                    copy.ReturnPaymentpId = Number(copy.ReturnPaymentpId);
                    copy.SaleId = Number(copy.SaleId);
                    copy.Discount = Number(copy.Discount);
                    copy.Price = Number(copy.Price);
                    var result1 = $scope.RestPromice.add(copy);
                    result1.then(function (d) {
                        $scope.selectedLocker = null;
                        getpagedlockers();
                    }); break;
                case 'edit':
                    var copy = angular.copy(defaultlocker);
                    //copy = angular.extend(copy, entry);
                    copy.Id = Number(entry.Id);
                    copy.SalesDescription = entry.SalesDescription;
                    copy.ProductId = Number(entry.ProductId);
                    copy.PosInfoId = Number(entry.PosInfoId);
                    copy.PriceListId = Number(entry.PriceListId);
                    copy.PaymentId = Number(entry.PaymentId);
                    copy.ReturnPaymentpId = Number(entry.ReturnPaymentpId);
                    copy.SaleId = Number(entry.SaleId);
                    copy.Discount = Number(entry.Discount);
                    copy.Price = Number(entry.Price);
                    var result1 = $scope.RestPromice.edit(copy);
                    result1.then(function (d) {
                        $scope.selectedLocker = null;
                        getpagedlockers();

                    }); break;
                case 'delete':
                    var result1 = $scope.RestPromice.delete(entry);
                    result1.then(function (d) {
                        $scope.selectedLocker = null;
                        getpagedlockers();

                    });
                    break;
                default: tosterFactory.showCustomToast('Invalid Rest option on saving.', 'warn'); break;
            }
        }
        //function to check from posinfo details if enty givven has valid depended values
        //PaymentId , ReturnPaymentpId , SaleId
        function validateEntry(data) {
            var entry = angular.copy(data);
            var details = ($scope.posinfoDetails.length > 0) ? $scope.posinfoDetails : [];
            //validate posinfodetails over entity posinfo
            var validDetails = details.filter(function (item) {
                return item.PosInfoId == data.PosInfoId;
            })
            // here loaded posinfodetails are loaded correctly
            if (validDetails.length > 0 && details.length > 0) {
                var validtosaveEntry = checkIdDetails(entry);
                return validtosaveEntry;
            } else {
                //here posinfo details are empty or massuped
                $q.all({ result1: posinfoch(id) }).then(function (d) {
                    //now we have valid posinfodetails 4 sure
                    var validtosaveEntry = checkIdDetails(entry);
                    return validtosaveEntry;
                })
            }
        }
        //a function  that validates if current givvent entity has variable refs over pos info details loaded
        function checkIdDetails(entity) {
            var refObjs = dataUtilFactory.createEnumObjs($scope.posinfoDetails, {}, 'Id');
            if (refObjs[entity.PaymentId] === undefined || refObjs[entity.PaymentId] === null)
                entity.PaymentId = null;
            if (refObjs[entity.ReturnPaymentpId] === undefined || refObjs[entity.ReturnPaymentpId] === null)
                entity.ReturnPaymentpId = null;
            if (refObjs[entity.SaleId] === undefined || refObjs[entity.SaleId] === null)
                entity.SaleId = null;
            return entity;
        }
        //Rest Actions used in current management
        $scope.RestPromice = {
            //Resource of lookups needed to manage lockers and side entities of forms
            'lookups': function (nameType) {
                return DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    console.log('LookUps loaded'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Lookups failed', 'fail'); console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection); });
            },
            //parameters : 
            'loadposinfodetails': function (parameters) {
                return DynamicApiService.getDynamicObjectData('PosInfoDetail', parameters).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    console.log('PosIndo details loaded'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Pos info details failed', 'fail'); console.warn('Getting Pos info Details on server failed. Reason:'); console.warn(rejection); });
            },
            'getmappedProducts': function (filterparams) {
                return DynamicApiService.getDynamicObjectData('ExternalProductMapping', filterparams).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    console.log('Search result of products succeded.'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Searching Products yeild no results', 'fail'); console.warn('Get by Product by Filters server failed. Reason:'); console.warn(rejection); });
            },

            //main paged lockers load by params 
            //params: 'page=&pageSize=;
            'getPagedLockers': function (params) {
                return DynamicApiService.getDynamicObjectData('RegionLockerProduct', params).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    console.log('Region Locker Products Loaded'); console.log(result);
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Region Locker Products failed', 'fail'); console.warn('Get paged Lockers on server failed. Reason:'); console.warn(rejection); });
            },
            'add': function (data) {
                return DynamicApiService.postSingle("RegionLockerProduct", data).then(function (result) {
                    tosterFactory.showCustomToast('New Locker Product created.', 'success');
                }).catch(function (rejection) { tosterFactory.showCustomToast('Insert new entry failed', 'fail'); console.warn('Post action on server failed. Reason:'); console.warn(rejection); });
            },
            'edit': function (data) {
                return DynamicApiService.putMultiple("RegionLockerProduct", [data]).then(function (result) {
                    tosterFactory.showCustomToast('Locker Product updated successfully.', 'success');
                }).catch(function (rejection) { tosterFactory.showCustomToast('Update Locker Product failed', 'fail'); console.warn('Update action Locker Product on server failed. Reason:'); console.warn(rejection); });
            },
            'delete': function (data) {
                return DynamicApiService.deleteSingle("RegionLockerProduct", data).then(function (result) {
                    tosterFactory.showCustomToast('Locker Product deleted successfully.', 'success');
                }).catch(function (rejection) { tosterFactory.showCustomToast('Deleting Locker Product failed', 'fail'); console.warn('Delete action Locker Product on server failed. Reason:'); console.warn(rejection); });
            }
        }

        var emptyRegionLockerProduct = {
            PosId: -1, //: το id του pos (insert new field)
            PriseListId: -1, // : το PriseList.Id
            ProductId: -1, // : το id του product ‘Locker’
            SalesDescription: 'Empty Product',//: πάντα Locker
            Price: 0, //: το αρχικό ποσό ενοικίασης του Locker(6€)
            Discount: 0,// το τελικό ποσό ενοικίασης με την παράδοση του κλειδιού (4€).
            ReturnPaymentpId: -1, //PosInfoDetailId of selected PosInfoId
            PaymentId: -1, //PosInfoDetailId of selected PosInfoId
            SaleId: -1, //PosInfoDetailId of selected PosInfoId
        }


    })
    .directive('staffManager', function () {
        return {
            controller: 'StaffManagerCtrl',
            restrict: 'E',
            scope: {},
            templateUrl: 'app/scripts/directives/views-directives/entities-manager/manage-staff-template.html',

        };
    })
    .controller('StaffManagerCtrl', function ($scope, $q, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, tosterFactory) {
        //array of all loaded staff and selected user vars
        $scope.selecteUser = null; //var to bind click on user
        $scope.paging = { total: 1, current: 1, onPageChanged: pagfun }; //object to manage pagginator plugin on common-used-modules
        $scope.currentPage = 1; //variable to 
        $scope.uploadModel = {
            controllerName: 'Upload',
            actionName: 'staff',
            extraData: 1,//represents storeinfo.Id
            externalDirectory: 'region'
        };
        $scope.init = function () {
            $q.all({
                //lookup entities
                result1: DynamicApiService.getDynamicObjectData('StaffPosition', ''),
                result2: DynamicApiService.getDynamicObjectData('AuthorizedGroup', ''),
                //result3: DynamicApiService.getDynamicObjectDataDA('Stores', 'GetStores', ''),
              result3: DynamicApiService.getDynamicObjectDataStores('Stores', 'GetStores')

            }).then(function (d) {
                getpagedstaff(); // load paged data
                //bind data loaded and create enums for lookups and dropdowns
                $scope.staffPositions = d.result1.data;
                $scope.staffPositionsEnum = dataUtilFactory.createEnums(d.result1.data, {}, 'Id', 'Description');
                $scope.authorizedGroups = d.result2.data;
                $scope.authorizedGroupsEnum = dataUtilFactory.createEnums(d.result2.data, {}, 'Id', 'Description');
                    $scope.StaffDaStores = d.result3.data;
                    $scope.StaffDaStoresEnum = dataUtilFactory.createEnums(d.result3.data, {}, 'Id', 'Title');
                var tmp = {
                    StaffPositions: dataUtilFactory.createEntityEnumsArr($scope.staffPositionsEnum, 'value', 'name', true),
                    StaffAuthorization: dataUtilFactory.createEntityEnumsArr($scope.authorizedGroupsEnum, 'value', 'name', true),
                    StaffDaStores: dataUtilFactory.createEntityEnumsArr($scope.StaffDaStoresEnum, 'value', 'name', true),
                }
                $scope.filtersObjArray = angular.extend({}, tmp);
            });
        }
        //event on watch var of paggination plugin
        function pagfun() {
            if ($scope.currentPage != $scope.paging.current) {
                $scope.currentPage = $scope.paging.current;
                getpagedstaff();
            }
        }
        //scope function on click listed user
        //change current user
        $scope.selectCurrentUser = selectUser;
        function selectUser(usr) {
            $scope.selecteUser = usr;
        }
        //a function to REST Get Paged by filter staff registered
        function getpagedstaff(filters, page, pagesize) {
            $scope.busyloading = true;
            if (page === undefined || page === null || typeof (page) != 'number') page = 0;
            if ($scope.paging.current === undefined || $scope.paging.current === null || typeof ($scope.paging.current) != 'number') page = $scope.paging.current;

            if (pagesize === undefined || pagesize === null || typeof (pagesize) != 'number') pagesize = 50;
            if (filters === undefined || filters === null || typeof (filters) != 'object') filters = {};
            var params = 'filters=' + filters + '&page=' + $scope.paging.current + '&pageSize=' + pagesize;
            $scope.busyloading = true;
            var getPagepromise = $scope.RestPromice.getPaged(params);
            getPagepromise.then(function (result) {
                if ($scope.paging.total != result.data.PageCount) $scope.paging.total = result.data.PageCount;
                if ($scope.paging.current != result.data.CurrentPage) $scope.paging.current = result.data.CurrentPage;
                $scope.loadedStaff = result.data.Results;
                if (result.data.length < 1) {
                    tosterFactory.showCustomToast('No Results found', 'info');
                }
            }).finally(function () { //finally(callback, notifyCallback)
                $scope.busyloading = false;
            });

        }
        //edit and add modal on user
        $scope.editEntry = function (type, cuser) {
            var formModel = { entityIdentifier: 'Staff', dropDownObject: $scope.filtersObjArray, title: 'Managing Staff' }; var dataEntry = {};
            var userMapped = cuser;
            if (type == 'edit' && cuser !== undefined && cuser !== null) {
                formModel = angular.extend({ forceTitle: 'Edit Staff' }, formModel);
                dataEntry = angular.copy(cuser);
                dataEntry.StaffAuthorizationId = (cuser.StaffAuthorization.length >= 0) ? cuser.StaffAuthorization.map(function (item) { return String(item.AuthorizedGroupId); }) : [];
                dataEntry.StaffPositionsId = (cuser.StaffPositions.length >= 0) ? cuser.StaffPositions.map(function (item) { return String(item.StaffPositionId); }) : [];
                dataEntry.StaffDaStores = (cuser.StaffDaStores) ? cuser.StaffDaStores.map(function (item) { return String(item.DaStoreId, item.DaStoreDescription) }) : [];
                //dataEntry.StaffDaStores = (cuser.StaffDaStores) ? cuser.StaffDaStores.map(function (item) { return String(item.DaStoreId, item.DaStoreDescription) }) : [];
            }
            dataEntry['uploadModel'] = $scope.uploadModel;
            dataEntry['loadingImage'] = false;

            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
            }).then(function (data) {
                $scope.processingUser = true;
                //important step to match ids that is number in this entity
                data.StaffAuthorizationId = data.StaffAuthorizationId.map(function (item) { return Number(item); })
                data.StaffPositionsId = data.StaffPositionsId.map(function (item) { return Number(item); })
                if (type == 'add') {
                    data.Id = 0; data.IsDeleted = false;
                    data.StaffAuthorization = createEmptyDTO('StaffAuthorization', data.StaffAuthorizationId);
                    data.StaffPositions = createEmptyDTO('StaffPositions', data.StaffPositionsId);
                    data.StaffDaStores = createEmptyDTO('StaffDaStores', data.id);
                    var addpromise = $scope.RestPromice.add(data);
                    addpromise.finally(function () {
                        $scope.processingUser = false;
                        $scope.selecteUser = null;
                        getpagedstaff();
                    })
                } else if (type == 'edit') {
                    //update is deletedDTO
                    var mar = findMissing(data.StaffAuthorization, data.StaffAuthorizationId, 'AuthorizedGroupId');
                    data.StaffAuthorization = markDeletedDiffEntities(data.StaffAuthorization, data.StaffAuthorizationId, 'AuthorizedGroupId');
                    data.StaffAuthorization = data.StaffAuthorization.filter(function (item) {
                        return item.IsDeleted == true;
                    });
                    //find missing to add
                    var dtos = createEmptyDTO('StaffAuthorization', mar);
                    data.StaffAuthorization = data.StaffAuthorization.concat(dtos);
                    data.StaffAuthorization = data.StaffAuthorization.map(function (item) {
                        item.StaffId = data.Id;
                        return item;
                    })

                    var mmar = findMissing(data.StaffPositions, data.StaffPositionsId, 'StaffPositionId');
                    //update is deletedDTO
                    data.StaffPositions = markDeletedDiffEntities(data.StaffPositions, data.StaffPositionsId, 'StaffPositionId');
                    data.StaffPositions = data.StaffPositions.filter(function (item) {
                        return item.IsDeleted == true;
                    });
                    //find missing to add
                    var ddtos = createEmptyDTO('StaffPositions', mmar);
                    data.StaffPositions = data.StaffPositions.concat(ddtos);
                    data.StaffPositions = data.StaffPositions.map(function (item) {
                        item.StaffId = data.Id;
                        return item;
                    })
                    //find missing to add
                    var ddtos = createEmptyDTO('StaffDaStores', mmar);
                    data.StaffDaStores = data.StaffDaStores.map(function (item) {
                        item.DaStoreDescription = data.Description;
                        item.DaStoreId = data.id;
                        return item;
                    })
                    var editpromise = $scope.RestPromice.edit(data);
                    editpromise.finally(function () {
                        $scope.processingUser = false;
                        $scope.selecteUser = null;
                        getpagedstaff();
                    })
                }
            })
        }
        //fun to push new DTOs to model array
        function createEmptyDTO(type, arr) {
            var retarr = [];
            switch (type) {
                case 'StaffPositions':
                    angular.forEach(arr, function (value) {
                        var stafposDTO = { Id: 0, StaffId: 0, IsDeleted: false, StaffPositionId: value, Description: $scope.staffPositionsEnum[value] };
                        retarr.push(stafposDTO);
                    });
                    break;
                case 'StaffAuthorization':
                    angular.forEach(arr, function (value) {
                        var authDTO = { Id: 0, StaffId: 0, IsDeleted: false, AuthorizedGroupId: value, Description: $scope.authorizedGroupsEnum[value] };
                        retarr.push(authDTO);
                    })
                    break;
                case 'StaffDaStores':
                    angular.forEach(arr, function (value) {
                        var authDTO = { id: 0, Description: " " };
                        retarr.push(authDTO);
                    })
                    break;
                default: break;
            }
            return retarr;
        }
        //datar has all entities and compr has all after update .. 
        //so if item.field does not exist in compr collection it has been deleted
        function markDeletedDiffEntities(datar, compr, confield) {
            if (datar === undefined || datar.length == 0)
                return [];
            //when selected if empty all have to be deleted
            if (compr === undefined || compr.length == 0) {
                datar = datar.map(function (item) {
                    item.IsDeleted = true;
                    return item;
                })
                return datar;
            }
            angular.forEach(datar, function (dto) {
                var index = compr.indexOf(dto[confield]);
                if (index == -1) { dto.IsDeleted = true; }
            })
            return datar;
        }
        //according to compr: array of ids find  missing 
        function findMissing(datar, compr, confield) {
            if ((datar.length == 0 || datar === undefined) && (compr.length > 0 || compr !== undefined))
                return compr;
            var eobj = {};
            eobj = dataUtilFactory.createEnumObjs(datar, eobj, confield);
            //from array of ids all that is undefined are those that does not exist push them to arr
            var idstoins = [];
            angular.forEach(compr, function (idsrep) {
                if (eobj[idsrep] === undefined) {
                    idstoins.push(idsrep);
                }
            })
            return idstoins; //array of missing entity ids
        }
        //Function that triggers modal confirmation and parses model to delete REST
        $scope.removeModel = function (usr) {
            var deleteDialog = $mdDialog.confirm().title('Deleting User').textContent('You have selected "' + usr.FirstName + '" entry to delete.\n Would you like to proceed and delete current user?')
                .ariaLabel('deletingCuser').ok('Delete').cancel('Cancel');
            $mdDialog.show(deleteDialog).then(function () {
                $scope.processingUser = true;
                var delpromise = $scope.RestPromice.delete([usr.Id]);
                delpromise.finally(function () { // finally(callback, notifyCallback)
                    $scope.processingUser = false;
                    $scope.selecteUser = null;
                    getpagedstaff();
                })
            });
        }
        $scope.RestPromice = {
            'getPaged': function (params) {
                return DynamicApiService.getAttributeRoutingData('Staff', 'GetPaged', '', params).then(function (result) { //Rest Get call for data using Api service to call Webapi
                    console.log('loadedStaff');
                    return result;
                }).catch(function (rejection) { tosterFactory.showCustomToast('Loading staff failed', 'fail'); console.warn('Get paged action on server failed. Reason:'); console.warn(rejection); });
            },
            'add': function (data) {
                return DynamicApiService.postAttributeRoutingData("Staff", "Add", data).then(function (result) {
                    tosterFactory.showCustomToast('New staff created.', 'success');
                }).catch(function (rejection) { tosterFactory.showCustomToast('Insert new entry failed', 'fail'); console.warn('Post action on server failed. Reason:'); console.warn(rejection); });
            },
            'edit': function (data) {
                return DynamicApiService.putAttributeRoutingData("Staff", "UpdateRange", [data]).then(function (result) {
                    tosterFactory.showCustomToast('Staff updated successfully.', 'success');
                }).catch(function (rejection) { tosterFactory.showCustomToast('Update current entry failed', 'fail'); console.warn('Update action on server failed. Reason:'); console.warn(rejection); });
            },
            'delete': function (data) {
                return DynamicApiService.deleteAttributeRoutingData("Staff", "DeleteRange", data).then(function (result) {
                    tosterFactory.showCustomToast('Entry deleted successfully.', 'success');
                }).catch(function (rejection) { tosterFactory.showCustomToast('Delete failed but IsDeleted field is now true', 'fail'); console.warn('Delete action on server failed. Reason:'); console.warn(rejection); });
            }
        }

    })


