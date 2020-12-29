/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />
angular.module('posBOApp')
    .component('dasopeninghourscomp', {
        templateUrl: 'app/scripts/components/ManageDaOpeningHours/templates/ManageDaOpeningHours-comp.html',
        controller: 'managedaopeninghourscompCTRL',
        controllerAs: 'OpenHoursMain'
    })
    .controller('managedaopeninghourscompCTRL', ['$scope', '$mdDialog', '$mdMedia', 'mohFactory', 'dataUtilFactory', 'tosterFactory', '$q', 'DynamicApiService', function ($scope, $mdDialog, $mdMedia, mohFactory, dataUtilFactory, tosterFactory, $q, DynamicApiService) {
        var OpenHoursMain = this;
        var dtu = dataUtilFactory;
        OpenHoursMain.restbusy = false; OpenHoursMain.hasError = false;
        OpenHoursMain.$onInit = function () { };

        OpenHoursMain.initView = function () {
            OpenHoursMain.shortages = [];
            OpenHoursMain.selectedStoreId = 0;
            OpenHoursMain.stores = [];
            OpenHoursMain.openinghours = [];
            OpenHoursMain.selectedshortages = [];
           OpenHoursMain.GetOpeningHours();
            //ShortMain.GetShortages();
        };
        $scope.searchText = ' ';

        $scope.searchText = '';
        $scope.Lookups = {};
        //Resources obj over api promises
        $scope.test = function () {
            //GetSetupStores
            var nameType = 'SetupStores';
            DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.Lookups.StoreList = result.data.LookUpEntities.StoreId;
                OpenHoursMain.stores = result.data.LookUpEntities.StoreId;
                console.log('LookUps loaded'); console.log(result);
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Lookups failed', 'fail');
                console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection);
                return null;
            })
        };

        $scope.hide = function () { $mdDialog.hide(); };
        $scope.cancel = function () { $mdDialog.cancel(); };
        $scope.test();


        OpenHoursMain.GetOpeningHours = function () {
            
            var url = mohFactory.apiInterface.ManageDaOpeningHours.GET.GetOpeningHours;
            DynamicApiService.getDAV3('OpeningHours', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('OpeningHours List Loaded', 'success');
                    OpenHoursMain.openinghours = result.data;
                } else {
                    tosterFactory.showCustomToast('No OpeningHours Loaded', 'success');
                    OpenHoursMain.openinghours = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading OpeningHours List failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                OpenHoursMain.hasError = true; OpenHoursMain.openinghours = [];
                return -1;
            }).finally(function () {
                OpenHoursMain.restbusy = false;
            });
        }

        $scope.SaveForAllStores = function () {
            var url = mohFactory.apiInterface.ManageDaOpeningHours.POST.SaveForAllStores;
            DynamicApiService.postDAV3('OpeningHours', url, OpenHoursMain.selectedopeninghours).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Saved the settings for all stores', 'success');
                    
                } else {
     
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Saving Opening Hours for All Stores  failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
               
                return -1;
            }).finally(function () {
                //  ShortMain.restbusy = false;
            });
        }


        //Save Opening Hours for specific stores 
        $scope.SaveOpeningHoursForStore = function () {
            var url = mohFactory.apiInterface.ManageDaOpeningHours.POST.SaveForStore;
            DynamicApiService.postDAV3('OpeningHours', url, OpenHoursMain.selectedopeninghours).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Saved Opening Hours For One Store ', 'success');
                } else {

                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Saving Opening Hours failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
              //  ShortMain.hasError = true; ShortMain.shortages = [];
                return -1;
            }).finally(function () {
              //  ShortMain.restbusy = false;
            });
        }

        $scope.viewStoreOpeningsHours = function (selectedStore) {
            var Id = selectedStore.Key;
            OpenHoursMain.selectedStoreId = Id;
            OpenHoursMain.selectedopeninghours = OpenHoursMain.openinghours.filter(function (item) { return item.StoreId === Id });

        }

        $scope.setvalues = function (row, value, type) {

            if (value == undefined) toastr.error("Invalid values  ! Please enter between 0 and 23 for hours and 0 and 59 for minutes");

            let index = findWithAttr(OpenHoursMain.selectedopeninghours, 'Id', row.Id); 
            
            if (type == 'OpenHour' && value >= 0 && value <= 23)
                OpenHoursMain.selectedopeninghours[index].OpenHour = value;

            if (type == 'OpenMinute' && value >=0 && value <=59)
                OpenHoursMain.selectedopeninghours[index].OpenMinute = value;

            if (type == 'CloseHour' && value >= 0 && value <= 23)
                OpenHoursMain.selectedopeninghours[index].CloseHour = value;

            if (type == 'CloseMinute' && value >= 0 && value <= 59)
            OpenHoursMain.selectedopeninghours[index].CloseMinute = value;
         
        }

        function findWithAttr(array, attr, value) {
            for (var i = 0; i < array.length; i += 1) {
                if (array[i][attr] === value) {
                    return i;
                }
            }
            return -1;
        }


        $scope.applyFilter = function () {
            var resfilter = {}, lookups = {};
            if ($scope.receiptFilter != undefined) resfilter = $scope.receiptFilter;
            if ($scope.Lookups != undefined) lookups = $scope.Lookups;
            $mdDialog.show({
                controller: 'DaShortagesFilter',
                templateUrl: '../app/scripts/directives/modal-directives/Da-Shortages-Filter.html',
                parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: {
                    resfilter: function () { return resfilter; },
                    lookups: function () { return lookups; }
                }
            }).then(function (data) {
                console.log('This is data filter return from selection filter modal');
                if (data != undefined) {
                    //extend receipt filter by data returned then call psize that changes also current page to 1
                    angular.extend($scope.receiptFilter, data);
                    //console.log(data); console.log($scope.resfilter);
                    $scope.psizeChanged();
                }
            }).catch(function () { console.log('This is data filter return from selection filter modal'); });
        };

    }])
    .controller('DaShortagesFilter', function ($scope, $mdDialog, resfilter, lookups) {
        //console.log('Popup result filter modal');
        $scope.filter = angular.copy(resfilter); //{  page: 0, pageSize: 50, filters: {} }
        $scope.mfilt = angular.extend($scope.filter, {});
        //$scope.mfilt = angular.copy($scope.Lookups);
        $scope.lookupslists = angular.copy($scope.Lookups);

        //a function to reinitiallize filter of filter
        ////return filter entity to its default state and re-initiallizes date 
        $scope.clearfilter = function () {
            var def = angular.copy(defaultReceiptPredicate);
            $scope.mfilt = angular.extend(def, {});
            //initdate();
        }
        $scope.hide = function () { $mdDialog.hide(); };
        $scope.cancel = function () { $mdDialog.cancel(); };
        $scope.confirm = function (answer) {
            //console.log('consolas');
            if ($scope.mfilt.usedate != true)
                $scope.mfilt.FromDate = null;
            //    manageReturnFilter();
            $mdDialog.hide($scope.mfilt);
        }
        $scope.logdate = function (date) {
            console.log(date);
            var addHours = -1 * new Date().getTimezoneOffset() / 60;
            var zax = moment(date).startOf('hour').add(addHours, 'hours');
            console.log(zax);
            console.log(zax.toISOString());
        }
        var defaultReceiptPredicate = {
            Id: null,
            Product: null,
            StoreId: null,
            ShortType: null,
            Page: 1,
            PageSize: 20,
            //PosList: [], //StaffList: [], //PricelistsList: [], //FODay  //EodId   //TableCodes  //UseEod  //UsePeriod 
        }
    }).filter("date", function () {
        //moment.lang("ru");
        return function (date) {
            return moment(new Date(date)).format('DD/MM/YYYY hh:mm');
        };
    });
