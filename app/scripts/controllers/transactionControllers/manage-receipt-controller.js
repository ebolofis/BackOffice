
'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:ManageReceiptsController
 * @description
 *  here is a main template initiallize by entity to manage controller 
 *  that by entity name initiallize represents on its main content a directive of main-views to manage Entity on server
 * Controller of the posBOApp
 */

angular.module('posBOApp')
.controller('ManageReceiptsController', ['tosterFactory', '$stateParams', '$scope', '$q', '$interval', '$mdDialog', '$mdMedia', 'DynamicApiService', 'dataUtilFactory',
function (tosterFactory, $stateParams, $scope, $q, $interval, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory) {
    //initiallization function that handles paggination initiallize
    //default receipt filter model 4 first load and lookup promise over entities from API
    $scope.init = function () {
        $scope.receiptFilter = angular.copy(ReceiptFilterModel);
        $scope.paging = { total: 1, current: 1, onPageChanged: pagfun, pageSize: 20 };
        $scope.currentPage = 1;
        //$scope.currentPage = 0;
        $scope.busyloading = true;
        $q.all({
            lookupP: $scope.RestPromice.lookups('ManageReceipts'), //lookup entities
        }).then(function (d) {
            $scope.busyloading = false;
            if (d.lookupP != null) $scope.lookups = d.lookupP.data.LookUpEntities;
            //$scope.receiptFilter = { FromDate: "2017-03-28T01:00:00.000Z", PosInfoId: 4, PageSize: 20, Page: 1 };
            getpagedPagedReceipts();
        }).finally(function () { });
    };
    //obj variable of paggination directive
    //event of pagged function mapped with paged Lockers REST Get
    $scope.psizeChanged = function () {
        //console.log('zavara');
        $scope.paging.current = 1;
        $scope.currentPage = 1;
        $scope.receiptFilter.Page = $scope.currentPage;
        getpagedPagedReceipts();
    }
    //function on change page over paggination
    function pagfun() {
        if ($scope.currentPage != $scope.paging.current) {
            $scope.currentPage = $scope.paging.current;
            $scope.receiptFilter.Page = $scope.currentPage;
            getpagedPagedReceipts();
        }
    }
    //a map function to load by filter results used to refresh primary action button 
    $scope.reloadResults = getpagedPagedReceipts;
    //a promise function that loads result and handles paggination enitity
    function getpagedPagedReceipts(filter) {
        //initiallize receiptfilter if it is not defined
        if ($scope.receiptFilter == undefined) {
            $scope.receiptFilter = {};
            angular.extend($scope.receiptFilter, ReceiptFilterModel);
        }
        //contruct params of not null fields
        var params;
        (filter == undefined) ? params = constructFilter($scope.receiptFilter) : params = constructFilter(filter);
        $scope.busyloading = true;
        //filter model on receipts over Recource POST attribute
        var f = { Page: params.Page, PageSize: params.PageSize, filt: JSON.stringify(params) }
        $q.all({
            receiptP: $scope.RestPromice.getReceipts(f)
        }).then(function (d) {
            var result = d.receiptP;
            if (result.data != null) {
                $scope.paging.total = result.data.PageCount;
                //var cp = (result.data.CurrentPage == 0) ? 1 : result.data.CurrentPage;
                var cp = result.data.CurrentPage;
                $scope.paging.current = cp; $scope.currentPage = cp;
                $scope.loadedReceipts = result.data.Results;
            }
            if (result.data.length < 1 || result.data == null) { tosterFactory.showCustomToast('No Results found', 'info'); }
        }).finally(function () { //finally(callback, notifyCallback)
            $scope.busyloading = false;
        });
    }
    //a function that removes from filter passed values that are null to not be included in predicate over receipts
    function constructFilter(data) {
        var f = angular.copy(data);
        var ret = angular.copy(f);
        angular.forEach(Object.keys(f), function (key, value) {
            //deletes null value fields 
            if (ret[key] == null || ret[key] == undefined || ret[key] == '') {
                delete ret[key];
            }
            //if from date and fromdate != null apply stringify policy by timezone
            if (key == 'FromDate' && ret[key] != undefined) {
                var addHours = -1 * new Date().getTimezoneOffset() / 60;
                var zax = moment(ret[key]).startOf('hour').add(addHours, 'hours');
                ret[key] = zax.toISOString();
            }
        })
        return ret;
    }
    //Resources obj over api promises
    $scope.RestPromice = {
        //Resource of lookups needed to manage lockers and side entities of forms
        'lookups': function (nameType) {
            return DynamicApiService.getLookupsByEntityName(nameType).then(function (result) { //Rest Get call for data using Api service to call Webapi
                console.log('LookUps loaded'); console.log(result);
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Lookups failed', 'fail');
                console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection);
                return null;
            });
        },

        //resource to load receipt details for modal overview
        'invoiceDetails': function (id) {
            var params = 'id=' + id + '&forExtecr=false'
            return DynamicApiService.getDynamicObjectData('InvoiceForDisplay', params).then(function (result) { //Rest Get call for data using Api service to call Webapi
                console.log('Receipt details loaded'); console.log(result);
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Receipt details failed to load', 'fail');
                console.warn('Receipt details failed to load'); console.warn(rejection);
                return null;
            });
        },
        //post  is an array of mainObjects that cancels receipts
        'postReceipts': function (array) {
            return DynamicApiService.postMultiple('InvoiceForDisplay', array).then(function (result) { //Rest Get call for data using Api service to call Webapi
                tosterFactory.showCustomToast('Receipt(s) Canceled.', 'success');
                //console.log('Post Receipts success'); console.log(result);
                return result;
            }, function (fail) {
                tosterFactory.showCustomToast('Receipts Action failed.', 'fail'); console.warn('Receipt details failed to load'); console.warn(fail);
            }, function (error) {
                tosterFactory.showCustomToast('Receipts Action failed.', 'fail'); console.warn('Receipt details failed to load'); console.warn(error);
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Receipts Action failed.', 'fail');
                console.warn('Receipts post Action falied functionality on server failed. Reason:'); console.warn(rejection);
                return null;
            });
        },
        //params here are filter usr need to see results
        'getReceipts': function (params) {
            return DynamicApiService.postAttributeRoutingData('InvoiceForDisplay', '', params).then(function (result) { //Rest Get call for data using Api service to call Webapi
                console.log('Receipts loaded'); console.log(result);
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Receipts Action falied failed', 'fail');
                console.warn('Receipts post Action falied functionality on server failed. Reason:'); console.warn(rejection);
                return null;
            });
        },
    }
    //a function to trigger modal of filters 
    $scope.applyFilter = function () {
        var resfilter = {}, lookups = {};
        if ($scope.receiptFilter != undefined) resfilter = $scope.receiptFilter;
        if ($scope.lookups != undefined) lookups = $scope.lookups;
        $mdDialog.show({
            controller: 'ReceiptFilterCtrl',
            templateUrl: '../app/scripts/directives/modal-directives/receipt-manage-filter-modal-template.html',
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
    //on click list of receipts this function triggers modal of details on view 
    $scope.viewReceiptDetails = function (data) {
        $q.all({
            rdPromice: $scope.RestPromice.invoiceDetails(data.Id)
        }).then(function (d) {
            if (d.rdPromice.data == undefined) {
                return;
            }
            var receipt = {}, lookups = {};
            receipt = angular.copy(d.rdPromice.data.Receipt);
            if ($scope.lookups != undefined) lookups = $scope.lookups;
            $mdDialog.show({
                controller: 'ReceiptDetailsModalCtrl',
                templateUrl: '../app/scripts/directives/modal-directives/receipt-manage-details-modal-template.html',
                parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: {
                    receipt: function () { return receipt; },
                    lookups: function () { return lookups; }
                }
            }).then(function (data) {
                //console.log('This is data details return modal');
                if (data != undefined) {
                    //console.log(data);
                    proceedCancel(data);
                }
            }).catch(function () { });
        })
    };
    //this is a function that creates an array and calls api to cancel a receipt
    //then it auto load results by last filter provided and not changing page
    function proceedCancel(rec) {
        var arr = [];
        arr.push(rec);
        $q.all({
            cancelP: $scope.RestPromice.postReceipts(arr)
        }).then(function (d) {
            if (d.cancel != undefined) {
                tosterFactory.showCustomToast('Receipt canceled Successfully.', 'success');
            }
        }).finally(function () {
            getpagedPagedReceipts();
        })
    }
    //defalut receipt filter model that initiallizes scope on filter
    var ReceiptFilterModel = {
        usedate: false,
        FromDate: null,
        PosInfoId: null,
        IsInvoiced: null,
        IsPaid: null,
        IsPrinted: null,
        TableCode: '',
        Room: '',
        OrderNo: null,
        ReceiptNo: null,
        InvoiceTypeList: [], //inv.Type
        Page: 1,
        PageSize: 20,
        //PosList: [], //StaffList: [], //PricelistsList: [], //FODay  //EodId   //TableCodes  //UseEod  //UsePeriod 
    }
}])
    //Controller of detail modal 
    .controller('ReceiptDetailsModalCtrl', function ($scope, $mdDialog, $q, receipt, lookups, tosterFactory, DynamicApiService) {
        $scope.receipt = angular.copy(receipt);
        $scope.lookups = angular.copy(lookups);
        $scope.PosinfoDetailToCancel = {};
        $scope.getPosinfoDetail = function () {
            var params = 'page=1&pageSize=3000&posInfoId=' + $scope.receipt.PosInfoId;
            return DynamicApiService.getDynamicObjectData('PosInfoDetail', params).then(function (result) { //Rest Get call for data using Api service to call Webapi
                console.log('Pos info detail loaded'); console.log(result);
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('PosInfoDetail 4 cancel failed to load ', 'fail');
                console.warn('Receipt details failed to load'); console.warn(rejection);
                $mdDialog.cancel();
                return null;
            });
        }

        function checkCancelAvailable() {
            if ($scope.receipt.IsVoided == true || $scope.receipt.InvoiceTypeType == 3 || $scope.receipt.InvoiceTypeType == 8) {
                tosterFactory.showCustomToast('Receipt is already canceled!', 'warning');
                return false;
            }
            if ($scope.receipt.InvoiceTypeType == 1 || $scope.receipt.InvoiceTypeType == 4 || $scope.receipt.InvoiceTypeType == 5) {

                var unpaid = $scope.receipt.ReceiptDetails.filter(function (rd) { return rd.PaidStatus != 2; })
                if (unpaid.length > 0) {
                    tosterFactory.showCustomToast('All items must be paid-off in order to cancel receipt!', 'error');
                    return false;
                }
            } else if ($scope.receipt.InvoiceTypeType == 2) {
                var uninvoiced = $scope.receipt.ReceiptDetails.filter(function (rd) {
                    return rd.PaidStatus != 0;
                });
                if (uninvoiced.length > 0) {
                    tosterFactory.showCustomToast('Items are already invoiced. Proceed and Cancel corresponding receipt', 'error');
                    return false;
                }
            }
            return true;
        }

        $scope.discountForDisplay = function (d) {
            var p = ($scope.receipt.Discount != undefined) ? $scope.receipt.Discount : 0;
            angular.forEach($scope.receipt.ReceiptDetails, function (i) {  p += (i.ItemDiscount != undefined) ? i.ItemDiscount : 0; })
            return p.toFixed(2);
        }
        $scope.hide = function () { $mdDialog.hide(); };
        $scope.cancel = function () { $mdDialog.cancel(); };
        $scope.confirm = function (answer) {
            if (checkCancelAvailable()) {
                var recToCancel = angular.copy($scope.receipt);

                var rdarr = recToCancel.ReceiptDetails.map(function (rcp) {
                    //rcp.ItemQty *= (-1);
                    //rcp.TotalBeforeDiscount *= (-1);
                    //rcp.ItemNet *= (-1);
                    //rcp.ItemVatValue *= (-1);
                    rcp.Status = 5;
                    return rcp;
                })
                recToCancel.ReceiptDetails = rdarr;

                var tranarr = recToCancel.ReceiptPayments.map(function (rcp) {
                    rcp.Amount *= (-1);
                    return rcp;
                })
                recToCancel.ReceiptPayments = tranarr;
                var addHours = -1 * new Date().getTimezoneOffset() / 60;
                var zax = moment().startOf('hour').add(addHours, 'hours');

                //recToCancel.Total = (recToCancel.Total != undefined) ? recToCancel.Total * (-1): null,
                //recToCancel.Discount = (recToCancel.Discount != undefined) ? recToCancel.Discount * (-1): null,
                //recToCancel.Net = (recToCancel.Net != undefined) ? recToCancel.Net * (-1): null,
                //recToCancel.Vat = (recToCancel.Total != undefined) ? recToCancel.Vat * (-1): null,
                recToCancel.InvoiceTypeId = $scope.PosinfoDetailToCancel.InvoicesTypeId;
                recToCancel.InvoiceIndex = $scope.PosinfoDetailToCancel.InvoiceId;
                recToCancel.PosInfoDetailId = $scope.PosinfoDetailToCancel.Id;
                recToCancel.InvoiceDescription = $scope.PosinfoDetailToCancel.Description;
                recToCancel.InvoiceTypeType = $scope.PosinfoDetailToCancel.GroupId;
                recToCancel.Abbreviation = $scope.PosinfoDetailToCancel.Abbreviation;
                recToCancel.CreateTransactions = $scope.PosinfoDetailToCancel.CreateTransaction;
                recToCancel.IsVoidCreateTransactions = $scope.PosinfoDetailToCancel.CreateTransaction;
                recToCancel.EndOfDayId = ($scope.receipt.EndOfDayId == 0) ? null : $scope.receipt.EndOfDayId;
                recToCancel.ModifyOrderDetails = 2;
                
                //IsCancel
                //recToCancel.Day = zax.toISOString();
            }
            $mdDialog.hide(recToCancel);
        }
        $scope.dayconf = function (d) { var fd = moment(d).format('MMMM Do YYYY, h:mm:ss a'); return fd; }
        $scope.lg = function () { console.log($scope.receipt); console.log($scope.lookups); }
        $scope.init = function () {
            if ($scope.receipt.PosInfoId == undefined) {
                alert('You can not apply cancel action on this receipt');
                $mdDialog.cancel(); return;
            }
            var gid = ($scope.receipt.InvoiceTypeType == 2) ? 8 : 3;
            var det = $scope.lookups.PosInfoDetailId.filter(function (pid) { return (pid.GroupId == gid && $scope.receipt.PosInfoId == pid.PosInfoId); })
            if (det == undefined || det.length < 1) {
                alert('Please map a Cancel Receipt Pos into Detail on current Pos.');
                $mdDialog.cancel(); return;
            }
            //console.log('&&&&&&&&&&&&&&&&&&');
            $scope.PosinfoDetailToCancel = angular.extend(det[0], {});
        }()
    })
    .controller('ReceiptFilterCtrl', function ($scope, $mdDialog, resfilter, lookups) {
        //console.log('Popup result filter modal');
        $scope.filter = angular.copy(resfilter); //{  page: 0, pageSize: 50, filters: {} }
        $scope.mfilt = angular.extend($scope.filter, {});
        $scope.lookupslists = angular.copy(lookups);
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
            usedate: false,
            FromDate: new Date(),
            PosInfoId: null,
            IsInvoiced: null,
            IsPaid: null,
            IsPrinted: null,
            TableCode: '',
            Room: '',
            OrderNo: null,
            ReceiptNo: null,
            FromDate: null,
            InvoiceTypeList: [], //inv.Type
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

//var Mainmodel = {
//    Abbreviation: "ΕΑΣ",
//    BuzzerNumber: null,
//    CashAmount: null,
//    ClientPosId: null,
//    Counter: 71,
//    Cover: 0,
//    CoverAnalysis: null,
//    CreateTransactions: true,
//    Day: "2017-03-24T10:40:10.383",
//    DepartmentDescription: "Cafe Nikki",
//    DepartmentId: 3,
//    Discount: "0.00",
//    DiscountRemark: null,
//    InvoiceDescription: "ΕΙΔΙΚΟ ΑΚΥΡΩΤΙΚΟ ΣΤΟΙΧΕΙΟ ΣΕΙΡΑ Α",
//    InvoiceIndex: 4,
//    InvoiceTypeId: 4,
//    InvoiceTypeType: 3,
//    IsPrinted: true,
//    ItemAdditionalInfo: "ItemCode",
//    ModifyOrderDetails: 1,
//    Net: "29.28",
//    OrderNo: "10988",
//    PdaModuleId: null,
//    PosInfoDetailId: 76,
//    PosInfoId: 4,
//    PrintType: 0,
//    ReceiptDetails: Array(4),
//    ReceiptNo: 71,
//    ReceiptPayments: Array(1),
//    Sender: null,
//    Staff: "Dora",
//    StaffId: 50,
//    TableCode: "",
//    TableId: null,
//    TempPrint: false,
//    Total: 36,
//    TotalBeforeDiscount: "36.00",
//    Vat: "6.72",
//}
//var ReceiptDetailsModel = {
//    Abbreviation: "ΕΑΣ",
//    Description: "DRAUGHT BEER 500ML",
//    Discount: "0.00",
//    Guid: "8a3009f4-01b9-a902-d2c8-d8247476a0d4",
//    InvoiceType: 3,
//    IsExtra: 0,
//    ItemCode: "211001",
//    ItemDescr: "DRAUGHT BEER 500ML",
//    ItemDiscou: "0.00",
//    ItemGross: 9,
//    ItemNet: 7.32,
//    ItemPrice: 9,
//    ItemQty: 1,
//    ItemSort: 1,
//    ItemVatRate: 23,
//    ItemVatValue: 1.68,
//    KitchenCode: 2,
//    OrderDetailId: 130776,
//    OrderDetailIgredientsId: null,
//    OrderId: 68302,
//    OrderNo: 10988,
//    PaidStatus: 2,
//    PosInfoDetailId: 76,
//    PosInfoId: 4,
//    PreviousStatus: 2,
//    Price: 9,
//    PriceListDetailId: 3611,
//    PriceListId: 1,
//    ProductCategoryId: 52,
//    ProductId: 1685,
//    Qty: 1,
//    ReceiptId: 65260,
//    ReceiptNo: 2176,
//    ReceiptSplitedDiscount: 0,
//    RegionId: null,
//    SalesTypeExtDesc: "BREAKFAST",
//    SalesTypeId: 1,
//    StaffId: 50,
//    Status: 5,
//    TableCode: "",
//    TableId: null,
//    TotalAfterDiscount: "9.00",
//    TotalBeforeDiscount: "9.00",
//    VatCode: 1,
//    VatDesc: 23,
//    VatId: 1,
//}
//var ReceiptPaymentsModel = {
//    AccountDescription: "Cash",
//    AccountId: 1,
//    AccountType: 1,
//    Amount: "-36.00",
//    CreditAccountDescription: null,
//    CreditAccountId: null,
//    CreditCodeId: null,
//    CreditTransactionAction: null,
//    Description: "Cash",
//    OrderNo: null,
//    Percentage: "1.00000",
//    PosInfoId: 4,
//    PreviousAmount: 36,
//    SendsTransfer: false,
//    StaffId: 50,
//}



