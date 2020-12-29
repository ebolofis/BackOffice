'use strict';
/**
 * @ngdoc directive
 * @name gridExport.directive:posBOApp_grid_Exporter
 * @description
 * # posBOApp
 */
//$uibModal's Docs
//https://github.com/angular-ui/bootstrap/blob/master/src/modal/docs/readme.md
angular.module('posBOApp')
    .directive('uiGridEditBsDropdown', ['uiGridConstants', 'uiGridEditConstants', function (uiGridConstants, uiGridEditConstants) {
        return {
            scope: true,
            compile: function () {
                return {
                    pre: function ($scope, $elm, $attrs) { },
                    post: function ($scope, $elm, $attrs) {
                        //set focus at start of edit
                        $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                            console.log('Custom Directive: Begun the cell event');
                            $elm[0].focus();
                            $elm[0].style.width = ($elm[0].parentElement.offsetWidth - 1) + 'px';
                            //for bootstrap dropdown
                            $elm.on('change', function (evt) {
                                console.log('Custom Directive: blur() :  the dropdown just blurred');
                                $scope.stopEdit(evt);
                            });
                            //for boostrap datepicker 
                            $elm.on('blur', function (evt) {
                                console.log('Custom Directive: blur() :  the calender blurred using onblur()');
                                $scope.stopEdit(evt);
                            });
                        });
                        $scope.stopEdit = function (evt) {
                            // no need to validate a dropdown - invalid values shouldn't be
                            // available in the list
                            console.log('Custom Directive: stopEdit() :  Now stopping the edit functionality');
                            $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                        };
                        $elm.on('keydown', function (evt) {
                            switch (evt.keyCode) {
                                case uiGridConstants.keymap.ESC: evt.stopPropagation(); $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                                    break;
                                case uiGridConstants.keymap.ENTER: // Enter (Leave Field)
                                    $scope.stopEdit(evt); break;
                                case uiGridConstants.keymap.LEFT:
                                    $scope.stopEdit(evt); break;
                                case uiGridConstants.keymap.RIGHT:
                                    $scope.stopEdit(evt); break;
                                case uiGridConstants.keymap.UP:
                                    evt.stopPropagation(); break;
                                case uiGridConstants.keymap.DOWN:
                                    evt.stopPropagation(); break;
                                case uiGridConstants.keymap.TAB:
                                    $scope.stopEdit(evt); break;
                            }
                            return true;
                        });
                    }
                };
            }
        };
    }])
    .directive('gridExportfilters', function () {
        return {
            templateUrl: 'app/scripts/directives/gridDirectives/gridExport.html',
            //controller: 'dynamicApiServiceController',
            restrict: 'AE',
            replace: false,
        }
    })
    .directive('singleGrid', function () {
        return {
            templateUrl: 'app/scripts/directives/gridDirectives/singleGrid.html',
            restrict: 'AE',
            replace: false,
        }
    })
    .controller('DatepickerDemoCtrl', function ($scope) {
        $scope.today = function () { $scope.dt = new Date(); };
        $scope.today();
        $scope.clear = function () { $scope.dt = null; };

        // Disable weekend selection
        $scope.disabled = function (date, mode) { return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6)); };

        $scope.toggleMin = function () { $scope.minDate = $scope.minDate ? null : new Date(); };
        $scope.toggleMin();
        $scope.maxDate = new Date(2020, 5, 22);

        $scope.open = function ($event) { $scope.status.opened = true; };
        $scope.setDate = function (year, month, day) {
            $scope.dt = new Date(year, month, day);
        };

        $scope.dateOptions = { formatYear: 'yy', startingDay: 1 };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];

        $scope.status = { opened: false };

        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        var afterTomorrow = new Date();
        afterTomorrow.setDate(tomorrow.getDate() + 2);

        $scope.events = [{ date: tomorrow, status: 'full' }, { date: afterTomorrow, status: 'partially' }];

        $scope.getDayClass = function (date, mode) {
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);
                    if (dayToCheck === currentDay) { return $scope.events[i].status; }
                }
            }
            return '';
        };
    })
    .directive('datepickerCustomPopup', function () {
        return {
            templateUrl: 'app/scripts/directives/gridDirectives/datePicker.html',//template: 'Name: {{customer.name}} Address: {{customer.address}}',
            controller: 'DatepickerDemoCtrl',
            restrict: 'E',
            scope: true,
            //  {
            //   ngModel: '=',
            //    datevar: '=',
            //    customtitle : '='
            // },
            compile: function (tElem, attrs) {
                //do optional DOM transformation here
                return function (scope, elem, attrs) {
                    //linking function here
                    var pause;
                }
            },
            link: function (scope, element, attrs, ngModelCtrl) {
                scope.$watch("row.entity.Name", function (v) {
                    console.log(v);
                });
                element.datepicker({
                    //dateFormat: 'dd, MM, yy',
                    onSelect: function (date) {
                        console.log(scope.datevar); //scope.dt = date;
                        //attrs.rowField = scope.datevar;
                        scope.$apply();
                    }
                });
            }
        };
    })


    //simple modal with message in <strong>--content--</strong> and conf , cansel actions to manage return;
    .controller('SimpleMessageModalCtrl', function ($uibModalInstance, message) {
        var smm = this;
        smm.message = message;
        smm.dismiss = function (reason) { $uibModalInstance.dismiss(reason); };
        smm.Conf = function () { $uibModalInstance.close('OK'); };
    })

    //step wizard master slave
    .controller('StepWizardFormInsertModalCtrl', function ($uibModalInstance, $scope, stepWizardFormArray, steps) { //modalStateVars
        var modal = this;
        modal.steps = steps;
        modal.step = 0;
        modal.stepWizardModelArray = stepWizardFormArray;
        modal.wizard = { master: modal.modelToSave, slave: modal.detailModelToSave };
        modal.modelToSave = {}; //this is the model to be saved on db
        modal.detailModelToSave = {};

        modal.isFirstStep = function () { return modal.step === 0; };
        modal.isLastStep = function () { return modal.step === (modal.steps.length - 1); };
        modal.isCurrentStep = function (step) { return modal.step === step; };

        modal.moderateStep = function (form) {
            var pause;

        }
        modal.setCurrentStep = function (step) {//validate current step to continue.
            var retObj = stepValidator();
            if (step < modal.step) { modal.step = step; }
            //else if ( true) {
            else if (retObj.validated == true) {
                //add fields of entity to return model 
                appendFormToReturnModel(retObj.model);
                // extend object with form obj
                modal.step = step;
            }
        };
        modal.getCurrentStep = function () { return modal.steps[modal.step]; };
        modal.getNextLabel = function () { return (modal.isLastStep()) ? 'Submit' : 'Next'; };

        //step buttons Next/Back functions
        modal.handlePrevious = function () { modal.step -= (modal.isFirstStep()) ? 0 : 1; };
        modal.handleNext = function () {
            //validate current step to continue.
            var retObj = stepValidator(); //{ validated: if valid , model: form entity returned }
            if (retObj.validated == true) {
                //add entity to model
                appendFormToReturnModel(retObj.model);
                if (modal.isLastStep()) { //last form validation
                    modal.wizard = { master: modal.modelToSave, slave: modal.detailModelToSave };
                    $uibModalInstance.close(modal.wizard);
                } else {//switch step validation 
                    modal.step += 1;
                }
            }
        };
        modal.dismiss = function (reason) { $uibModalInstance.dismiss(reason); };
        //from array step type switches owner to return validated model by extend primary / slave / ...  models of return
        function appendFormToReturnModel(objModel) {
            switch (modal.stepWizardModelArray[modal.step].gridOwner) {
                case 'master': angular.extend(modal.modelToSave, objModel); break;
                case 'slave': angular.extend(modal.detailModelToSave, objModel); break;
                case 'both': alert('Append step case to both " Implement me plz"!'); break;
                default: alert('Append step case to default!'); break;
            }
        }
        function stepValidator() {
            var valid = false; var entityToAdd;
            for (var i = 0; i < modal.stepWizardModelArray.length; i++) {
                if (modal.stepWizardModelArray[i].modelStep == modal.step) {
                    //switch step validation https://github.com/Textalk/angular-schema-form/pull/589
                    //PosInfo Exception handle Template Creator
                    if (modal.step == 5 && modal.stepWizardModelArray[i].entriesArray !== undefined) {
                        entityToAdd = {
                            PosInfoDetailTemplate: modal.stepWizardModelArray[i].entriesArray.filter(function (item) { return (item.selected == true); })
                        }
                        valid = true;
                        break;
                    }

                    $scope.$broadcast('schemaFormValidate', modal.stepWizardModelArray[i].modelFormName);
                    if (modal.stepWizardModelArray[i].modelFormName.$valid) {
                        entityToAdd = modal.stepWizardModelArray[i].entity; valid = true;
                    } break;
                }
            }
            return ({ validated: valid, model: entityToAdd });
        }

    })
    //Used to insert any type of single grid add 
    .controller('SingleFormInsertModalCtrl', function ($uibModalInstance, $scope, singleFormModel, filtersObjArray) {
        var si_modal = this;
        si_modal.schema = singleFormModel.schema;
        si_modal.form = singleFormModel.form; //['Code', 'Abbreviation', ' Description', 'Type', 'IsDeleted'];
        si_modal.entity = singleFormModel.entity; //{ 'Code': '', 'Abbreviation': '', ' Description': '', 'Type': '', 'IsDeleted': false }

        si_modal.save = save;
        si_modal.filtersObjArray = filtersObjArray;
        si_modal.dismiss = function (reason) { $uibModalInstance.dismiss(reason); };

        function save(forma) {
            console.log(si_modal.form);
            $scope.$broadcast('schemaFormValidate', 'createRowEntryForm')
            // Copy row values over
            if ($scope.createRowEntryForm.$valid) {
                $uibModalInstance.close(si_modal.entity);
                //$uibModalInstance.close(grid);
                //DynamicApiService.postSingle(si_modal.entityIdentifier,).then(function (result) {
                // $scope.getData(si_modal.entityIdentifier, '');
                //}), (function (result) {
                //alert(result);
                //$uibModalInstance.close(grid);
                //});
            } else {
                console.log('invalid form');
            }

        };
        function valueChanged(key, modelValue) {

        }
    })
    //Department modal on manage pricelists grouping
    .controller('TransferMappingsModalCtrl', function ($uibModalInstance, $filter, selectedDepartment, pricelist, vats, lookUpResults, pmsLookUpResults) {
        var tmm = this;
        tmm.step = 'mix';
        tmm.pmsLookUpResults = pmsLookUpResults;
        tmm.pricelistOptions = [];
        tmm.lookUpResults = lookUpResults;// filt as PricelistId: 1 VatCode: 2
        angular.forEach(pricelist.Array, function (value) {
            value.selected = false;
            tmm.pricelistOptions.push(value);
        });
        tmm.vatOptions = [];
        angular.forEach(vats.Array, function (value) {
            value.selected = false;
            tmm.vatOptions.push(value);
        });
        tmm.mixedOptions = [];
        tmm.mixSelected = function (reason) {
            tmm.step = 'manage'; tmm.mixedOptions = []; tmm.groupMixedOptions = [];
            var selectedPls = $filter('filter')(tmm.pricelistOptions, { selected: true });
            var selectedVats = $filter('filter')(tmm.vatOptions, { selected: true });
            var tmpLookups = angular.copy(tmm.lookUpResults);
            angular.forEach(selectedPls, function (plv) {
                angular.forEach(selectedVats, function (vav) {
                    var tmp = {
                        PosDepartmentId: selectedDepartment.Id,
                        PriceListId: plv.Id,
                        PriceListDescription: plv.Description,
                        VatPercentage: vav.Percentage,
                        VatCode: vav.Code,
                        VatDescription: vav.Description,
                        PmsDepartmentId: "",
                        PmsDepDescription: ""
                    }
                    var i = 0; var imp = true;
                    for (i = 0; i < tmpLookups.length; i++) {
                        if (tmpLookups[i].PricelistId == tmp.PriceListId && tmpLookups[i].VatCode == tmp.VatCode) {
                            tmpLookups.splice(i, 1);
                            imp = false;
                            break;
                        }
                    }
                    if (imp == true) tmm.mixedOptions.push(tmp);
                });
            });
            tmm.groupMixedOptions = groupTo(tmm.mixedOptions, 'PriceListId');

        };
        tmm.manageSelectedReg = function (mxd) {
            var index = tmm.mixedOptions.indexOf(mxd);
            //tmm.tempDropObj = tmm.mixedOptions[index].PmsDepDescription;
            tmm.mixedOptions[index].PmsDepartmentId = tmm.mixedOptions[index].PmsObj.DepartmentId;
            tmm.mixedOptions[index].PmsDepDescription = tmm.mixedOptions[index].PmsObj.Description;
            //tmm.groupMixedOptions = groupTo(tmm.mixedOptions, 'PriceListId');
            return;
        }

        tmm.transferDelete = function (model) {
            var index = tmm.mixedOptions.indexOf(model);
            tmm.mixedOptions.splice(index, 1);
            //tmm.groupMixedOptions = groupTo(tmm.mixedOptions, 'PriceListId');
        };
        tmm.tempDropObj;
        tmm.groupMixedOptions = {};
        function groupTo(arr, key) {
            var groups = {};
            for (var i = 0; i < arr.length; i++) {
                groups[arr[i][key]] = groups[arr[i][key]] || [];
                groups[arr[i][key]].push(arr[i]);
            }
            return groups;
        };
        tmm.dismiss = function (reason) { $uibModalInstance.dismiss(reason); };

        tmm.back = function (reason) {
            tmm.step = 'mix';
        };
        tmm.Conf = function () { $uibModalInstance.close('OK'); };
    })



    .directive('categoryHeader', function () {
        function link(scope) {
            console.log(scope.gridOptions.columnDefs);
            scope.headerRowHeight = 30;
            scope.catHeaderRowHeight = scope.headerRowHeight + 'px';
            scope.categories = [];
            var lastDisplayName = "";
            var totalWidth = 0;
            var left = 0;
            var cols = scope.gridOptions.columnDefs;
            for (var i = 0; i < cols.length; i++) {
                totalWidth += Number(cols[i].width);
                var displayName = (typeof (cols[i].categoryDisplayName) === "undefined") ?
                    "\u00A0" : cols[i].categoryDisplayName;
                if (displayName !== lastDisplayName) {
                    scope.categories.push({
                        displayName: lastDisplayName,
                        width: totalWidth - Number(cols[i].width),
                        widthPx: (totalWidth - Number(cols[i].width)) + 'px',
                        left: left,
                        leftPx: left + 'px'
                    });
                    left += (totalWidth - Number(cols[i].width));
                    totalWidth = Number(cols[i].width);
                    lastDisplayName = displayName;
                }
            }
            if (totalWidth > 0) {
                scope.categories.push({
                    displayName: lastDisplayName,
                    width: totalWidth,
                    widthPx: totalWidth + 'px',
                    left: left,
                    leftPx: left + 'px'
                });
            }

        }
        return {

            templateUrl: 'app/scripts/directives/gridDirectives/category_header.html',
            link: link
        };
    })
    //used in ProductPrices and Product Ingredients table 
    .controller('ProductPricesCellCtrl', ['$scope', '$locale', function ($scope, $locale) {

        if ($scope.data === undefined) {
            alert('Error Not Capable');
        }
        var retSFE = getSFE();
        $scope.sch = retSFE.schema; $scope.form = retSFE.form; $scope.entity = retSFE.entity;
        //console.log($scope.data);

        $scope.priceWithoutChanged = function (modelValue) {
            var num = Number(modelValue);
            $scope.data.PriceWithout = num.toFixed(2);
            $scope.rowObj.edited = true;
        }
        $scope.priceChanged = function (modelValue) {
            var num = Number(modelValue);
            $scope.data.Price = num.toFixed(2);
            $scope.rowObj.edited = true;
            angular.forEach($scope.rowObj.ProductPricesModelDetails, function (itemObj, key) {

                if ($scope.data.PriceListId != key) {
                    if (itemObj.LookUpPriceListId !== undefined && $scope.data.PriceListId == itemObj.LookUpPriceListId) {
                        if ($scope.data.Price == '' || $scope.data.Price == null || $scope.data.Price == undefined)
                            $scope.data.Price = 0;
                        if (itemObj.Percentage !== undefined && itemObj.Percentage !== null) {
                            itemObj.Price = Number($scope.data.Price) * (itemObj.Percentage / 100);
                            itemObj.Price = itemObj.Price.toFixed(2);
                        }

                    }
                }
            })
        }
        function getSFE() {
            var ret = { schema: {}, form: [], entity: {} }
            if ($scope.identifier == 'Product') {
                ret.schema = {
                    type: 'object', properties: {
                        VatId: { type: 'number', "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Vat...', "nullLabel": '---', },
                        Price: { type: 'number' }
                    }
                }
                ret.form = [{
                    type: "section", htmlClass: "row",
                    items: [
                        {
                            type: "section",
                            htmlClass: "col-md-7 zero-padright",
                            items: [
                                {
                                    key: 'Price', notitle: true, feedback: false, fieldHtmlClass: 'custom-cellform-numcell', labelHtmlClass: 'custom-cellform-numcell', htmlClass: 'noPadding', onChange: function (modelValue, form) {
                                        if (modelValue !== undefined) {
                                            if (modelValue === null)
                                                $scope.entity.Price = modelValue = 0;
                                            $scope.priceChanged(modelValue);
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            type: "section", htmlClass: "col-md-5 zero-padleft", items: [{
                                key: 'VatId', type: 'select', titleMap: $scope.vatEnum, notitle: true, disableSuccessState: true, disableErrorState: true,
                                fieldHtmlClass: 'custom-cellform-dropdown', labelHtmlClass: 'custom-cellform-dropdown', htmlClass: 'noPadding', onChange: function (modelValue, form) {
                                    $scope.rowObj.edited = true;
                                    $scope.data.VatId = modelValue;
                                    //console.log(modelValue);
                                }
                            }]
                        }
                    ]
                }];
                ret.entity = {
                    VatId: ($scope.data !== undefined && $scope.data.VatId !== undefined && $scope.data.VatId !== null) ? $scope.data.VatId : null,
                    Price: ($scope.data !== undefined && Number($scope.data.Price) !== undefined && Number($scope.data.Price) !== null) ? Number($scope.data.Price) : null
                };

            } else {
                ret.schema = {
                    type: 'object', properties: {
                        VatId: { type: 'number', "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Vat...', "nullLabel": '---', },
                        Price: { type: 'number' },
                        PriceWithout: { type: 'number' }
                    }
                };
                ret.form = [
                    {
                        type: "section", htmlClass: "row",
                        items: [
                            {
                                type: "section", htmlClass: "col-md-7 zero-padright-2lines", items: [{
                                    key: 'Price', notitle: true, feedback: false, fieldHtmlClass: 'custom-cellform-numcell', labelHtmlClass: 'custom-cellform-numcell', htmlClass: 'noPadding', onChange: function (modelValue, form) {
                                        if (modelValue !== undefined) { if (modelValue === null) $scope.entity.Price = modelValue = 0; $scope.priceChanged(modelValue); }
                                    }
                                }, {
                                    key: 'PriceWithout', fieldHtmlClass: 'custom-cellform-numcell', labelHtmlClass: 'custom-cellform-numcell', htmlClass: 'noPadding', notitle: true, feedback: false, onChange: function (modelValue, form) {
                                        if (modelValue !== undefined) {
                                            if (modelValue === null)
                                                $scope.entity.PriceWithout = modelValue = 0;
                                            $scope.priceWithoutChanged(modelValue);
                                        }
                                    }
                                }]
                            },
                            {
                                type: "section", htmlClass: "col-md-5 zero-padleft", items: [
                                    {
                                        key: 'VatId', type: 'select', fieldHtmlClass: 'custom-cellform-dropdown', labelHtmlClass: 'custom-cellform-dropdown', htmlClass: 'noPadding', titleMap: $scope.vatEnum, notitle: true, feedback: false, onChange: function (modelValue, form) {
                                            $scope.rowObj.edited = true;
                                            $scope.data.VatId = modelValue;
                                            //console.log(modelValue);
                                        }
                                    }]
                            }
                        ]
                    },
                ];
                ret.entity = {
                    VatId: ($scope.data !== undefined && $scope.data.VatId !== undefined && $scope.data.VatId !== null) ? $scope.data.VatId : null,
                    Price: ($scope.data !== undefined && Number($scope.data.Price) !== undefined && Number($scope.data.Price) !== null) ? Number($scope.data.Price) : null,
                    PriceWithout: ($scope.data !== undefined && Number($scope.data.PriceWithout) !== undefined && Number($scope.data.PriceWithout) !== null) ? Number($scope.data.PriceWithout) : null,
                };
            }
            return ret;
        }
        $scope.$watch('data.VatId', function (newValue, oldValue) {
            if (newValue !== null && newValue !== undefined) {
                $scope.entity.VatId = newValue;
                angular.forEach($scope.rowObj.ProductPricesModelDetails, function (itemObj, key) {
                    if (itemObj.VatId == null || itemObj.VatId == undefined) {
                        itemObj.VatId = newValue;
                    }
                });
            }
        });



        $scope.$watch('data.Price', function (newValue, oldValue) {
            if (newValue != oldValue) {
                var num = Number($scope.data.Price)
                $scope.entity.Price = num
            }
        });



    }])
    .directive('productPricesCell', function () {
        return {
            controller: 'ProductPricesCellCtrl',
            restrict: 'E',
            scope: {
                data: '=',
                vatArr: '=',
                vatEnum: '=',
                taxArr: '=',
                pricelistEnum: '=',
                cPricelist: '=',
                rowObj: '=',
                identifier: '=',

            },
            templateUrl: 'app/scripts/directives/gridDirectives/product_prices_cell.html',

        };
    })

    //http://plnkr.co/edit/Qrnat8yTvISuM1qHHDlA?p=preview
    //auto complete input formfield
    .directive('tableDate', function ($filter) {
        function parseDateString(dateString) {
            if (typeof (dateString) === 'undefined' || dateString === '') {
                return null;
            }
            var parts = dateString.split('/');
            if (parts.length !== 3) {
                return null;
            }
            var year = parseInt(parts[2], 10);
            var month = parseInt(parts[1], 10);
            var day = parseInt(parts[0], 10);

            if (month < 1 || year < 1 || day < 1) {
                return null;
            }
            return new Date(year, (month - 1), day);
        }
        function pad(s) { return (s < 10) ? '0' + s : s; }
        return {
            priority: -100, // run after default uiGridEditor directive
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                scope.istableDate = false;

                scope.$on('uiGridEventBeginCellEdit', function () {
                    scope.istableDate = true;
                });

                element.on("click", function () {
                    scope.istableDate = true;
                });

                element.bind('blur', function () {
                    if (!scope.istableDate) {
                        scope.$emit('uiGridEventEndCellEdit');
                    } else {
                        scope.istableDate = false;
                    }
                }); //when leaving the input element, emit the 'end cell edit' event

                if (ngModel) {
                    ngModel.$formatters.push(function (modelValue) {
                        var modelValue = new Date(modelValue);
                        ngModel.$setValidity(null, (!modelValue || !isNaN(modelValue.getTime())));
                        return $filter('date')(modelValue, 'dd/MM/yyyy');
                    });

                    ngModel.$parsers.push(function (viewValue) {
                        if (viewValue) {
                            var dateString = [pad(viewValue.getDate()), pad(viewValue.getMonth() + 1), viewValue.getFullYear()].join('/')
                            var dateValue = parseDateString(dateString);
                            ngModel.$setValidity(null, (dateValue && !isNaN(dateValue.getTime())));
                            return dateValue;
                        }
                        else {
                            ngModel.$setValidity(null, true);
                            return null;
                        }
                    });
                }
            }
        };
    })
    .controller('DynamicSingleFormInsertCtrl', function ($scope, $q, $mdDialog, formModel, dataEntry) {
        console.log('Dynamic Insert / Edit form started');
        $scope.entityId = angular.copy(formModel.entityIdentifier);
        //
        $scope.dropdownsLookup = angular.copy(formModel.dropDownObject);

        $scope.dropdownsLookup2 = angular.copy(formModel.dropDownObject2);

        //Store Status Dropdown
        $scope.dropdownStoreStatus = [
            { Id: "0", Descr: "Closed" },
            { Id: "1", Descr: "Delivery Only" },
            { Id: "2", Descr: "Take Out Only" },
            { Id: "4", Descr: "Full Operational" }
        ];

        //Loyalty Gain Points Type Dropdown
        $scope.dropdownLoyaltyGainPoints = [
            { Id: "0", Descr: "Amount Range" },
            { Id: "1", Descr: "Amount Ratio" }
        ];

        //Loyalty Redeem Type Dropdown
        $scope.dropdownLoyaltyRedeemType = [
            { Id: "0", Descr: "Free Product" },
            { Id: "1", Descr: "Discount" },
            { Id: "2", Descr: "Both" }
        ];

        if ($scope.dropdownsLookup != undefined) {
            $scope.dropdownProducts = $scope.dropdownsLookup.data;
        }

        if ($scope.dropdownsLookup2 != undefined) {
            $scope.dropdownProductCategeries = $scope.dropdownsLookup2.data;
        }

        $scope.searchTerm;
        $scope.clearSearchTerm = function () {
            $scope.searchTerm = '';
        };

        $scope.modalTitle = angular.copy(formModel.title);
        $scope.formpModel = angular.copy(formModel);
        //vars used to upload an img 
        //switch between entityId to change uploadmodel
        $scope.loadingImage = false;
        $scope.uploadModel = (dataEntry.uploadModel != undefined && dataEntry.uploadModel !== null) ? dataEntry.uploadModel : {
            controllerName: 'Upload',
            actionName: 'staff',
            extraData: 1,
            externalDirectory: 'region'
        };
        //this is a function that get 
        //a name over formmodel function 
        //an inp obj or var 
        //and an updatename of formmodel to bind on callback
        $scope.eventFormBind = function (callfun, invar, formvarname) {
            console.log('Form event raised over promise');
            $q.all({
                res1: $scope.formpModel[callfun](invar), //lookup entities
            }).then(function (d) {

                $scope.formpModel[formvarname] = d.res1;
            })
        }
        $scope.eventValidationBind = function (callfun, invar, formvarname, validationfield) {
            console.log('Form event validation raised over promise');
            $q.all({
                res1: $scope.formpModel[callfun](invar), //lookup entities
            }).then(function (d) {

                $scope.dynSGIForm[formvarname].$setValidity(validationfield, d.res1);
            })
        }
        $scope.hide = function () { $mdDialog.hide(); };
        $scope.cancel = function () { $mdDialog.cancel(); };
        $scope.insEntryData = (dataEntry != undefined) ? dataEntry : {};
        $scope.confirm = function (answer) {
            if ($scope.formpModel.entityIdentifier == 'hotel') {
                if ($scope.insEntryData['allHotels'] == undefined)
                    $scope.insEntryData['allHotels'] = false;
            }
            if ($scope.formpModel.entityIdentifier == 'loyaltyRedeemFreeProducts') {
                if ($scope.insEntryData.Product != undefined) {
                    $scope.insEntryData.ProductId = $scope.insEntryData.Product.Id;
                    $scope.insEntryData.ProductName = $scope.insEntryData.Product.Descr;
                }
                if ($scope.insEntryData.ProdCategory != undefined) {
                    $scope.insEntryData.ProdCategoryId = $scope.insEntryData.ProdCategory.Id;
                    $scope.insEntryData.ProdCategoryName = $scope.insEntryData.ProdCategory.Descr;
                }
            }
            $mdDialog.hide($scope.insEntryData);
        };
        $scope.applyAll = function (list, field) {
            var ret = [];
            angular.forEach(list, function (li) {
                if (li[field] != undefined) {
                    ret.push(li[field]);
                }

            })
            return ret;
        }

    }).controller('CloneAccountMappingModalCtrl', function ($scope, $q, $mdDialog, formModel, cloneEnt) {
        $scope.formModel = formModel;
        $scope.cloneEnt = cloneEnt;
        $scope.dropDownObject = formModel.dropDownObject;

        console.log('Formodel'); console.log($scope.formModel); console.log('Object Array'); console.log($scope.cloneEnt);

        $scope.hide = function () { $mdDialog.hide(); };
        $scope.cancel = function () { $mdDialog.cancel(); };

        $scope.exceptProvided = function (item) {
            if (item.Key == $scope.cloneEnt.PosInfoId) return false;
            return true;
        }
        $scope.insEntryData = (cloneEnt !== undefined && cloneEnt !== null) ? cloneEnt : {};

        $scope.confirm = function (answer) {
            console.log($scope.selectedPosToClone);
            var ret = [];
            //AccountId:2
            //PmsRoom:6969
            //PosInfoId:1
            //Description:"testcopy ent" //Id:2 //Status:true

            angular.forEach($scope.selectedPosToClone, function (pid) {
                var m = angular.extend({}, $scope.cloneEnt);
                m.Id = 0;
                m.PosInfoId = Number(pid);
                ret.push(m);
            })
            $mdDialog.hide(ret);
        };
    })


    .controller('PricelistAutoFix', function ($scope, $mdDialog, checkModel) {
        $scope.vatNullArray = checkModel.vatNullArray;
        $scope.vatEnum = checkModel.vatEnum;
        $scope.pricelistEnum = checkModel.pricelistEnum;
        //plId: 21, lookupPlId: null, looupVatid: 1
        $scope.confirm = function (answer) {
            $mdDialog.hide();
        };
    });
