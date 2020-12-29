angular.module('posBOApp')
    .component('handlepayroll', {
        templateUrl: 'app/scripts/components/Payroll/templates/payroll-comp.html',
        controller: 'PayrollMainCTRL',
        controllerAs: 'PayrollMain'
    })
    .directive('modal', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{ title }}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;

                scope.$watch(attrs.visible, function (value) {
                    if (value == true)
                        $(element).modal('show');
                    else
                        $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    })
    .controller('PayrollMainCTRL', ['$scope', '$mdDialog', '$mdMedia', 'managepayrollFactory', 'dataUtilFactory', 'tosterFactory', '$q', 'DynamicApiService', function ($scope, $mdDialog, $mdMedia, managepayrollFactory, dataUtilFactory, tosterFactory, $q, DynamicApiService) {
        var PayrollMain = this;
        var dtu = dataUtilFactory;
        PayrollMain.restbusy = false;
        PayrollMain.$onInit = function () { };

        PayrollMain.initView = function () {
            PayrollMain.payrolls = [];
            PayrollMain.payrollsLookUps = [];
            PayrollMain.staffDynLookUps = [];
            PayrollMain.GetPayrolls();
        };

        $scope.totalHours = "0.00"
        $scope.totalMinutesFloat = 0;

        $scope.showModal = false;
        $scope.open = function (row) {
            $scope.shortRow = row;
            $scope.showModal = !$scope.showModal;
        };

        //########################## Get All Payrolls #################################//
        //#############################################################################//
        PayrollMain.GetPayrolls = function () {
            PayrollMain.restbusy = true;
            var url = managepayrollFactory.apiInterface.Payroll.GET.GetPayroll;
            DynamicApiService.getV3('Payroll', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Payroll  Loaded', 'success');
                    PayrollMain.payrolls = result.data;
                    PayrollMain.restbusy = false;
                    //Get LookUps
                    $scope.GetPayroleLookUps();
                    $scope.GetStaffsLookUps(result.data);
                } else {
                    tosterFactory.showCustomToast('Payroll not Loaded  Loaded', 'success');
                    PayrollMain.payrolls = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Payroll failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                PayrollMain.hasError = true; PayrollMain.payrolls = [];
                return -1;
            }).finally(function () {
                PayrollMain.restbusy = false;
            });
        }

        //########################## Get All LookUps #################################//
        //############################################################################//
        $scope.GetPayroleLookUps = function () {
            var nameType = 'Payrole';
            DynamicApiService.getLookupsByEntityName(nameType).then(function (result) {
                $scope.filtersObjArray = result.data.LookUpEntities;
                result.data.LookUpEntities.StaffPositionId.unshift({ Key: 0, Value: "All Positions" });
                PayrollMain.payrollsLookUps = result.data.LookUpEntities;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Payrole Lookups failed', 'fail');
                console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection);
            })
        };

        //########################## Get Only Staff Dynamic LookUps #################################//
        //###########################################################################################//
        $scope.GetStaffsLookUps = function (payrollsData) {
            PayrollMain.staffDynLookUps = [];
            PayrollMain.staffDynLookUps.unshift({ Key: 0, Value: "All Staffs" });
            angular.forEach(payrollsData, function (payroll, key) {
                PayrollMain.staffDynLookUps.push({ Key: payroll.StaffId, Value: payroll.StaffDesc })
            });

            var obj = {};

            for (var i = 0, len = PayrollMain.staffDynLookUps.length; i < len; i++)
                obj[PayrollMain.staffDynLookUps[i]['Key']] = PayrollMain.staffDynLookUps[i];

            PayrollMain.staffDynLookUps = new Array();
            for (var key in obj)
                PayrollMain.staffDynLookUps.push(obj[key]);
        };

        //########################## Filter Data by Date #################################//
        //################################################################################//
        PayrollMain.filterDate = function (payrolls, from, to) {
            if (angular.isUndefined(from) == false && angular.isUndefined(to) == false) {
                if (payrolls) {
                    if (from != null && to != null) {
                        var fromdate = angular.copy(from);
                        var todate = angular.copy(to);
                        if (todate < fromdate) {
                            $scope.fromDate = null;
                            $scope.toDate = null;
                            toastr.warning('From Date can not be greater than To Date ', 'fail');
                            return;
                        }
                        return function (payrolls) {
                            var dataActionDate;
                            if (payrolls.DateFrom != null) {
                                dataActionDate = payrolls.DateFrom;
                            }
                            else {
                                dataActionDate = payrolls.DateTo;
                            }
                            var finalActionDate = new Date(dataActionDate);
                            var finalFromDate = new Date(from);
                            var finalToDate = new Date(to);
                            finalActionDate.setHours(0, 0, 0, 0);
                            finalFromDate.setHours(0, 0, 0, 0);
                            finalToDate.setHours(0, 0, 0, 0);
                            if (finalActionDate >= finalFromDate && finalActionDate <= finalToDate) {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        //########################## Clear Filter by Date #################################//
        //#################################################################################//
        PayrollMain.ClearFilter = function () {
            $scope.GetStaffsLookUps(PayrollMain.payrolls);
            $scope.fromDate = null;
            $scope.toDate = null;
            $scope.selectedStaff = "0";
            $scope.selectedStaffPos = null;
            $scope.totalMinutesFloat = 0;
            $scope.totalHours = "0.00"
        };

        //########################## Filter Data by Staff #################################//
        //#################################################################################//
        PayrollMain.FilterStaffs = function (payrolls, staff) {
            if (angular.isUndefined(staff) == false) {
                if (payrolls) {
                    var staffKey = parseFloat(staff);
                    if (staffKey != 0) {
                        return function (payrolls) {
                            if (payrolls.StaffId == staffKey) {
                                return true;
                            }
                        }
                    }
                }
            }
        };

        //########################## Filter Data by Staff Positions #################################//
        //#################################################################################//
        PayrollMain.FilterStaffPositions = function (payrolls, staffPosition) {
            if (angular.isUndefined(staffPosition) == false) {
                if (payrolls) {
                    if (staffPosition != null) {
                        if (staffPosition != "0") {
                            return function (payrolls) {
                                if (staffPosition.includes(payrolls.StaffPositionIds) == true) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        };

        //########################## Calculate Total Hours #################################//
        //#################################################################################//
        $scope.calculateTotalHours = function (staffId) {
            if (staffId == "0" && $scope.selectedStaffPos != null) {
                $scope.calculateTotalHoursByPosition($scope.selectedStaffPos);
            }
            else {
                $scope.totalMinutesFloat = 0;
                if ($scope.fromDate != null && $scope.toDate != null) {
                    angular.forEach(PayrollMain.payrolls, function (payroll, key) {
                        if (payroll.StaffId == parseInt(staffId)) {
                            var dataActionDate;
                            if (payroll.DateFrom != null) {
                                dataActionDate = payroll.DateFrom;
                            }
                            else {
                                dataActionDate = payroll.DateTo;
                            }
                            var finalActionDate = new Date(dataActionDate);
                            var finalFromDate = new Date($scope.fromDate);
                            var finalToDate = new Date($scope.toDate);
                            finalActionDate.setHours(0, 0, 0, 0);
                            finalFromDate.setHours(0, 0, 0, 0);
                            finalToDate.setHours(0, 0, 0, 0);
                            if (finalActionDate >= finalFromDate && finalActionDate <= finalToDate) {
                                $scope.totalMinutesFloat += payroll.TotalMinutes;
                            }
                        }
                    });
                    var hours = Math.floor($scope.totalMinutesFloat / 60);
                    var minutes = $scope.totalMinutesFloat % 60;
                    if (minutes > 9) {
                        $scope.totalHours = "" + hours + "." + minutes + "";
                    }
                    else {
                        $scope.totalHours = "" + hours + ".0" + minutes + "";
                    }
                }
                else {
                    angular.forEach(PayrollMain.payrolls, function (payroll, key) {
                        if (payroll.StaffId == staffId) {
                            $scope.totalMinutesFloat += payroll.TotalMinutes;
                        }
                    });
                    var hours = Math.floor($scope.totalMinutesFloat / 60);
                    var minutes = $scope.totalMinutesFloat % 60;
                    if (minutes > 9) {
                        $scope.totalHours = "" + hours + "." + minutes + "";
                    }
                    else {
                        $scope.totalHours = "" + hours + ".0" + minutes + "";
                    }
                }
            }
        };

        //########################## Calculate Total Hours By Staff Positions #################################//
        //#################################################################################//
        $scope.calculateTotalHoursByPosition = function (staffPosId) {
            $scope.totalMinutesFloat = 0;
            $scope.selectedStaff = 0;
            var payrollsAfterFilter = [];
            if ($scope.fromDate != null && $scope.toDate != null) {
                if (staffPosId == "0") {
                    angular.forEach(PayrollMain.payrolls, function (payroll, key) {
                        var dataActionDate;
                        if (payroll.DateFrom != null) {
                            dataActionDate = payroll.DateFrom;
                        }
                        else {
                            dataActionDate = payroll.DateTo;
                        }
                        var finalActionDate = new Date(dataActionDate);
                        var finalFromDate = new Date($scope.fromDate);
                        var finalToDate = new Date($scope.toDate);
                        finalActionDate.setHours(0, 0, 0, 0);
                        finalFromDate.setHours(0, 0, 0, 0);
                        finalToDate.setHours(0, 0, 0, 0);
                        if (finalActionDate >= finalFromDate && finalActionDate <= finalToDate) {
                            $scope.totalMinutesFloat += payroll.TotalMinutes;
                            payrollsAfterFilter.push(payroll);
                        }
                    });
                }
                else {
                    angular.forEach(PayrollMain.payrolls, function (payroll, key) {
                        if (staffPosId.includes(payroll.StaffPositionIds) == true) {
                            var dataActionDate;
                            if (payroll.DateFrom != null) {
                                dataActionDate = payroll.DateFrom;
                            }
                            else {
                                dataActionDate = payroll.DateTo;
                            }
                            var finalActionDate = new Date(dataActionDate);
                            var finalFromDate = new Date($scope.fromDate);
                            var finalToDate = new Date($scope.toDate);
                            finalActionDate.setHours(0, 0, 0, 0);
                            finalFromDate.setHours(0, 0, 0, 0);
                            finalToDate.setHours(0, 0, 0, 0);
                            if (finalActionDate >= finalFromDate && finalActionDate <= finalToDate) {
                                $scope.totalMinutesFloat += payroll.TotalMinutes;
                                payrollsAfterFilter.push(payroll);
                            }
                        }
                    });
                }
                var hours = Math.floor($scope.totalMinutesFloat / 60);
                var minutes = $scope.totalMinutesFloat % 60;
                if (minutes > 9) {
                    $scope.totalHours = "" + hours + "." + minutes + "";
                }
                else {
                    $scope.totalHours = "" + hours + ".0" + minutes + "";
                }
            }
            else {
                if (staffPosId == "0") {
                    angular.forEach(PayrollMain.payrolls, function (payroll, key) {
                        $scope.totalMinutesFloat += payroll.TotalMinutes;
                        payrollsAfterFilter.push(payroll);
                    });
                }
                else {
                    angular.forEach(PayrollMain.payrolls, function (payroll, key) {
                        if (staffPosId.includes(payroll.StaffPositionIds) == true) {
                            $scope.totalMinutesFloat += payroll.TotalMinutes;
                            payrollsAfterFilter.push(payroll);
                        }
                    });
                }
                var hours = Math.floor($scope.totalMinutesFloat / 60);
                var minutes = $scope.totalMinutesFloat % 60;
                if (minutes > 9) {
                    $scope.totalHours = "" + hours + "." + minutes + "";
                }
                else {
                    $scope.totalHours = "" + hours + ".0" + minutes + "";
                }
            }
            $scope.GetStaffsLookUps(payrollsAfterFilter);
        };

        //########################## from Date Change Event #################################//
        //#################################################################################//
        $scope.fromDateChange = function () {
            $scope.selectedStaff = 0;
            $scope.selectedStaffPos = null;
            $scope.totalMinutesFloat = 0;
            $scope.totalHours = "0.00"

            var payrollsAfterFilter = [];

            if ($scope.fromDate != null && $scope.toDate != null) {
                angular.forEach(PayrollMain.payrolls, function (payroll, key) {
                    var dataActionDate;
                    if (payroll.DateFrom != null) {
                        dataActionDate = payroll.DateFrom;
                    }
                    else {
                        dataActionDate = payroll.DateTo;
                    }
                    var finalActionDate = new Date(dataActionDate);
                    var finalFromDate = new Date($scope.fromDate);
                    var finalToDate = new Date($scope.toDate);
                    finalActionDate.setHours(0, 0, 0, 0);
                    finalFromDate.setHours(0, 0, 0, 0);
                    finalToDate.setHours(0, 0, 0, 0);
                    if (finalActionDate >= finalFromDate && finalActionDate <= finalToDate) {
                        payrollsAfterFilter.push(payroll);
                    }
                });
                $scope.GetStaffsLookUps(payrollsAfterFilter);
            }
        };

        //########################## to Date Change Event #################################//
        //#################################################################################//
        $scope.toDateChange = function () {
            $scope.selectedStaff = 0;
            $scope.selectedStaffPos = null;
            $scope.totalMinutesFloat = 0;
            $scope.totalHours = "0.00"
            var payrollsAfterFilter = [];

            if ($scope.fromDate != null && $scope.toDate != null) {
                angular.forEach(PayrollMain.payrolls, function (payroll, key) {
                    var dataActionDate;
                    if (payroll.DateFrom != null) {
                        dataActionDate = payroll.DateFrom;
                    }
                    else {
                        dataActionDate = payroll.DateTo;
                    }
                    var finalActionDate = new Date(dataActionDate);
                    var finalFromDate = new Date($scope.fromDate);
                    var finalToDate = new Date($scope.toDate);
                    finalActionDate.setHours(0, 0, 0, 0);
                    finalFromDate.setHours(0, 0, 0, 0);
                    finalToDate.setHours(0, 0, 0, 0);
                    if (finalActionDate >= finalFromDate && finalActionDate <= finalToDate) {
                        payrollsAfterFilter.push(payroll);
                    }
                });
                $scope.GetStaffsLookUps(payrollsAfterFilter);
            }
        };

        //########################## Add Specific Payroll #################################//
        //##################################################################################//
        $scope.addPayroll = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};

            if (action == 'add' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Add ' + type }, formModel);
                dataEntry = angular.copy(data);
            }
            if (type == 'Payroll') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'Payroll',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
                dataEntry['FromPos'] = false;
            }
            //variable to handle 3 entities and 2 modes of edit and add
            var actionname = {
                type: type,
                action: action
            };
            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
            })
                .then(function (retdata) {
                    var dStart = new Date(retdata.DateFrom);
                    var dEnd = new Date(retdata.DateTo);
                    dStart.setSeconds(0);
                    dEnd.setSeconds(0);
                    retdata["DateFrom"] = dStart;
                    retdata["DateTo"] = dEnd;
                    var url = managepayrollFactory.apiInterface.Payroll.POST.InsertPayroll;
                    DynamicApiService.postGetPmsDepartments('Payroll', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            PayrollMain.payrolls = result.data;
                            $scope.GetStaffsLookUps(result.data);
                            tosterFactory.showCustomToast('Payroll Inserted', 'success');
                        }
                        else {
                            PayrollMain.payrolls = [];
                            tosterFactory.showCustomToast('No Payroll Inserted', 'success');
                        }
                    }).catch(function (rejection) {
                        toastr.warning('Ο χρήστης ΔΕΝ επιτρέπεται να γίνει clock out με ημερομηνία προηγούμενη του clock in');
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        //########################## Edit Specific Payroll #################################//
        //###################################################################################//
        $scope.editPayroll = function (ev, type, data, action) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            var formModel = { entityIdentifier: type, dropDownObject: $scope.filtersObjArray, title: 'Managing ' + type };
            var dataEntry = {};
            if (action == 'edit' && data !== undefined && data !== null) {
                formModel = angular.extend({ forceTitle: 'Edit ' + type }, formModel);
                if (data.DateFrom != null && data.DateTo == null) {
                    var dStart = new Date(data.DateFrom);
                    data["DateFrom"] = dStart;
                }
                else if (data.DateFrom == null && data.DateTo != null) {
                    var dEnd = new Date(data.DateTo);
                    data["DateTo"] = dEnd;
                }
                else {
                    var dStart = new Date(data.DateFrom);
                    var dEnd = new Date(data.DateTo);
                    dStart.setSeconds(0);
                    dEnd.setSeconds(0);
                    data["DateFrom"] = dStart;
                    data["DateTo"] = dEnd;
                }
                dataEntry = angular.copy(data);
            }
            if (type == 'Payroll') {
                $scope.uploadModel = {
                    controllerName: 'Upload',
                    actionName: 'Payroll',
                    extraData: 1,//represents storeinfo.Id
                    externalDirectory: 'region'
                };
                dataEntry['uploadModel'] = $scope.uploadModel;
                dataEntry['loadingImage'] = false;
                dataEntry['FromPos'] = false;
            }
            //variable to handle 3 entities and 2 modes of edit and add
            var actionname = {
                type: type,
                action: action
            };
            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
            })
                .then(function (retdata) {
                    //Update api/Stores
                    retdata.LogoUri = angular.copy(retdata.UploadedLogoUri)

                    var url = managepayrollFactory.apiInterface.Payroll.POST.UpdatePayroll;
                    DynamicApiService.postGetPmsDepartments('Payroll', url, retdata).then(function (result) {
                        if (result != null && result.data != null) {
                            PayrollMain.payrolls = result.data;
                            $scope.GetStaffsLookUps(result.data);
                            tosterFactory.showCustomToast('Payroll Updated', 'success');
                        }
                        else {
                            PayrollMain.payrolls = [];
                            tosterFactory.showCustomToast('No Payroll Updated', 'success');
                        }
                    }).catch(function (rejection) {
                        toastr.warning('Ο χρήστης ΔΕΝ επιτρέπεται να γίνει clock out με ημερομηνία προηγούμενη του clock in');
                    }).finally(function () {
                    })
                }, function () { });
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
                });
        };

        //########################## Delete Specific Payroll #################################//
        //####################################################################################//
        $scope.DeletePayroll = function (row) {
            $scope.showModal = !$scope.showModal;
            var url = managepayrollFactory.apiInterface.Payroll.POST.DeletePayroll;
            DynamicApiService.DeleteHeader('Payroll', url, row.Id).then(function (result) {
                PayrollMain.payrolls = result.data;
                $scope.GetStaffsLookUps(result.data);
                tosterFactory.showCustomToast('Payroll Deleted succesfully', 'success');
            }, function (reason) {
                tosterFactory.showCustomToast('Payroll Delete failed', 'fail');
                $scope.showModal = !$scope.showModal;
            }, function (error) {
                tosterFactory.showCustomToast('Payroll Delete error', 'error');
                $scope.showModal = !$scope.showModal;
            })
        };
    }]);
