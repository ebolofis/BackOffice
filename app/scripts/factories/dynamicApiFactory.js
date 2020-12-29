'use strict';
/**
    factory to dynamically setup  objects 
    DOM needs :{
      referred name ex: Invoicetypes 
      $scope.dynObjKeyRef = 'Id';
    }
 */
angular.module('posBOApp')
    .factory('DynamicTypeGrid', ['uiGridGroupingConstants', function (uiGridGroupingConstants) {
        var TypeArray = [];
        //Sorting Algorithm
        //enableSorting: true, sortingAlgorithm: function (a, b) { if (a == b) return 0; if (a < b) return -1; if (a === undefined || a === null || a == "") return -1; if (b === undefined || b === null || b == "") return 1; return 1; },
        return {
            getColumns: function (tableType) {
                switch (tableType) {
                    case 'Department': return ([
                        { field: 'Id', name: 'Id', enableCellEdit: false, visible: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false }
                    ]); break;
                    //Setup Settings/Invoices
                    case 'InvoiceTypes': return ([
                        { field: 'Id', name: 'Id', enableCellEdit: false, visible: false },
                        {
                            field: 'Code', name: 'Code', enableCellEditOnFocus: false,
                            notEmpty: { message: 'The Code is required and cannot be empty' },
                            stringLength: { min: 1, max: 10, message: 'Min value 1 Max value 10' },
                            groupingShowAggregationMenu: false, groupingShowGroupingMenu: false, enableHiding: false,
                        },
                        {
                            field: 'Abbreviation', name: 'Abbreviation', enableCellEditOnFocus: false, enableCellEdit: true,
                            groupingShowAggregationMenu: false, groupingShowGroupingMenu: false, enableHiding: false,
                            validators: { notNull: true, minLength: { threshold: 1 }, maxLength: { threshold: 3 } }
                        },
                        { field: 'Description', name: 'Description', groupingShowAggregationMenu: false, groupingShowGroupingMenu: false, enableHiding: false, enableCellEditOnFocus: false, width: '50%' },
                        {
                            field: 'Type', name: 'Type', enableCellEditOnFocus: false,
                            groupingShowAggregationMenu: false, groupingShowGroupingMenu: false, enableHiding: false,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [], //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'Type\']:"Key":"Value"' //working
                        },
                        {
                            field: 'IsDeleted', name: 'IsDeleted',
                            type: "boolean",
                            enableCellEdit: false, enableCellEditOnFocus: false,
                            //cellTemplate: '<input type="checkbox" ng-model="row.entity.IsDeleted">', cellFilter: 'boolValEnumeration',
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 2, bool: 'No' }],
                            visible: false
                        },
                        { field: 'Invoices', name: 'Invoices', visible: false },
                        { field: 'PosInfoDetail', name: 'PosInfoDetail', visible: false, },
                        { field: 'PredefinedCredits', name: 'PredefinedCredits', visible: false },
                        //{
                        //    field: "ActivationDate", displayName: "ActivationDate",
                        //    cellFilter: 'date:"M/d/yyyy"',
                        //    //cellFilter: 'textDateFilter',
                        //    editableCellTemplate: '<div><form name="inputForm"><div ui-grid-edit-datepicker row-field="MODEL_COL_FIELD" ng-class="\'colt\' + col.uid"></div></form></div>'
                        //},
                        //{ field: 'IsEdited', name: 'IsEdited', enableCellEdit: false, cellFilter: 'stateEvaluator' }// use this on object.. inject..
                    ]); break;
                    case 'Vat': return ([
                        { field: 'Id', name: 'Id', enableCellEdit: false, visible: false },// enableCellEdit: false },
                        { field: 'Code', name: 'Code', enableCellEditOnFocus: false },
                        { field: 'Description', name: 'Description', enableCellEditOnFocus: false },
                        { field: 'Percentage', name: 'Percentage', enableCellEditOnFocus: false },

                    ]); break;
                    case 'Tax': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false },// enableCellEdit: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        { field: 'Percentage', name: 'Percentage', type: "number", enableCellEditOnFocus: false }
                    ]); break;
                    case 'PricelistMaster': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false },// enableCellEdit: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        {
                            field: 'Active', name: 'Active', type: "boolean", enableCellEdit: false, enableCellEditOnFocus: false,
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 2, bool: 'No' }],
                            visible: false
                        },
                        {
                            field: 'AssociatedSalesTypes', name: 'Sales Types Associations', width: 300, enableCellEditOnFocus: false, //enableCellEdit: false,
                            cellFilter: 'mscFilter:"SalesTypeDescription"',
                            editableCellTemplate: '<custom-multiselect-cell class="msDropdownCell" drop-array="col.colDef.editDropdownOptionsArray" to-select-model="MODEL_COL_FIELD" match-property="SalesTypeId"><custom-multiselect-cell>',
                            editDropdownOptionsArray: []
                        },

                    ]); break;
                    case 'Pricelist': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false },// enableCellEdit: false },
                        { field: 'Code', name: 'Code', type: "string", enableCellEditOnFocus: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        {
                            field: 'LookUpPriceListId', name: 'LookUpPriceListId', enableCellEditOnFocus: false,
                            //grouping privilages
                            groupable: true, enableSorting: true, sortFn: function (a, b) { return a < b },
                            grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'desc' },
                            // cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>',
                            //editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: [], //this needs to init dynamically
                            cellFilter: 'mapGroupDropdown: row.grid.appScope.dynamicEnumObj[\'LookUpPriceListId\']',
                            treeAggregationType: uiGridGroupingConstants.aggregation.max,
                        },
                        { field: 'Percentage', name: 'Percentage', type: "number", enableCellEditOnFocus: false },
                        //{ field: 'Status', name: 'Status',  type: "number", enableCellEditOnFocus: false },
                        {
                            field: "ActivationDate", displayName: "ActivationDate", enableCellEditOnFocus: false, width: 150,
                            cellFilter: 'textDate:"mediumDate"',
                            editableCellTemplate: '<div><form name="inputForm"><div ui-grid-edit-datepicker ng-class="\'colt\' + col.uid"></div></form></div>'
                        },
                        {
                            field: 'DeactivationDate', name: 'Deactivation Date', enableCellEditOnFocus: false, width: 150,
                            cellFilter: 'textDate:"mediumDate"',
                            editableCellTemplate: '<div><form name="inputForm"><div ui-grid-edit-datepicker ng-class="\'colt\' + col.uid"></div></form></div>'
                        },
                        {
                            field: 'SalesTypeId', name: 'SalesTypeId',// treeAggregationType: uiGridGroupingConstants.aggregation.COUNT,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'SalesTypeId\']:"Key":"Value"',
                        },
                        {
                            field: 'PricelistMasterId', name: 'PricelistMasterId', editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'PricelistMasterId\']:"Key":"Value"',
                        },
                        {
                            field: 'Type', name: 'Type', type: "number", editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'Type\']:"Key":"Value"',
                        },
                        {
                            field: 'IsDeleted', name: 'IsDeleted', type: "boolean", enableCellEdit: false, enableCellEditOnFocus: false,
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 2, bool: 'No' }],
                            //cellTemplate: '<input type="checkbox" ng-model="row.entity.LogInToOrder">', cellFilter: 'boolValEnumeration',
                            visible: false
                        }
                        //Id Code Description  LookUpPriceListId  Percentage  Status  ActivationDate  DeactivationDate SalesTypeId PricelistMasterId IsDeleted Type
                    ]); break;
                    case 'PosInfoDetail_Pricelist_Assoc': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false }, 
                        {
                            field: 'PosInfoDetailId', name: 'PosInfoDetailId', enableCellEditOnFocus: false,
                            //grouping privilages
                            groupable: true, enableSorting: true, sortFn: function (a, b) { return a < b },
                            grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'desc' }, width: '35%',
                            // cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>',
                            //editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: [], //this needs to init dynamically
                            cellFilter: 'mapGroupDropdown: row.grid.appScope.dynamicEnumObj[\'PosInfoDetailId\']',
                            treeAggregationType: uiGridGroupingConstants.aggregation.max,
                        },
                        {
                            field: 'PricelistId', name: 'PricelistId',// treeAggregationType: uiGridGroupingConstants.aggregation.COUNT,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'PricelistId\']:"Key":"Value"',

                        },
                    ]); break;
                    //Setup Settings / Transactions
                    case 'Accounts': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        {
                            field: 'Type', name: 'Type', enableCellEditOnFocus: false,
                            notEmpty: { message: 'The Code is required and cannot be empty' },
                            stringLength: { min: 1, max: 10, message: 'Min value 1 Max value 10' },
                            editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [],//this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'Type\']:"Key":"Value"'
                        },
                        {
                            field: 'IsDefault', name: 'IsDefault', type: "boolean",
                            //cellFilter: 'boolValEnumeration', cellTemplate: '<input type="checkbox" ng-model="row.entity.IsDefault">',
                            enableCellEdit: false, enableCellEditOnFocus: false,
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 2, bool: 'No' }],
                        },
                        {
                            field: 'SendsTransfer', name: 'SendsTransfer', type: "boolean",
                            //cellFilter: 'boolValEnumeration', cellTemplate: '<input type="checkbox" ng-model="row.entity.SendsTransfer">',
                            enableCellEdit: false, enableCellEditOnFocus: false,
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 2, bool: 'No' }],
                        },
                        {
                            field: 'CardOnly', name: 'CardOnly', type: "boolean",
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }], visible: true,
                        },
                        {
                            field: 'PMSPaymentId', name: 'PMS Payment', type: "number", enableCellEditOnFocus: false,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'PMSPaymentId\']:"Key":"Value"'
                        },
                        { field: 'Sort', name: 'Sort', type: "number", enableCellEditOnFocus: false },
                        {
                            field: 'IsDeleted', name: 'IsDeleted', type: "boolean",
                            enableCellEdit: false, enableCellEditOnFocus: false,
                            //cellFilter: 'boolValEnumeration', cellTemplate: '<input type="checkbox" ng-model="row.entity.IsDeleted">',
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 0, bool: 'No' }, { id: 1, bool: 'Yes' }],
                            visible: false
                        }
                    ]); break;
                    case 'PosInfoDetail_Excluded_Accounts': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false }, 
                        {
                            field: 'PosInfoDetailId', name: 'PosInfoDetailId', enableCellEditOnFocus: false,
                            //grouping privilages
                            //groupable: true,
                            enableSorting: true, sortFn: function (a, b) { return a < b },
                            //grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'desc' },
                            width: '35%',
                            //cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>',
                            //editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: [], //this needs to init dynamically
                            cellFilter: 'mapGroupDropdown: row.grid.appScope.dynamicEnumObj[\'PosInfoDetailId\']',
                            //treeAggregationType: uiGridGroupingConstants.aggregation.max,
                        },
                        {
                            field: 'PosInfoDetail.Description', name: 'PosInfoDetail Desc', enableCellEditOnFocus: false,
                            ////grouping privilages
                            ////groupable: true,
                            //enableSorting: true, sortFn: function (a, b) { return a < b },
                            ////grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'desc' },
                            //width: '35%',
                            ////cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>',
                            ////editType: 'dropdown',
                            //editableCellTemplate: 'ui-grid/dropdownEditor',
                            //editDropdownIdLabel: 'Key',
                            //editDropdownValueLabel: 'Value',
                            //editDropdownOptionsArray: [], //this needs to init dynamically
                            //cellFilter: 'mapGroupDropdown: row.grid.appScope.dynamicEnumObj[\'PosInfoDetailId\']',
                            ////treeAggregationType: uiGridGroupingConstants.aggregation.max,
                        },
                        {
                            field: 'AccountId', name: 'AccountId',// treeAggregationType: uiGridGroupingConstants.aggregation.COUNT,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'AccountId\']:"Key":"Value"',

                        },
                    ]); break;
                    case 'AccountMapping': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        {
                            field: 'PosInfoId', name: 'PosInfoId', enableCellEditOnFocus: false,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [], //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'PosInfoId\']:"Key":"Value"' //working
                        },
                        {
                            field: 'AccountId', name: 'AccountId', enableCellEditOnFocus: false,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: [], //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'AccountId\']:"Key":"Value"' //working
                        },
                        { field: 'PmsRoom', name: 'PmsRoom', type: "number" },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },

                        {
                            field: 'Status', name: 'Status', type: "boolean",
                            enableCellEdit: true, enableCellEditOnFocus: false,
                            //cellFilter: 'boolValEnumeration', cellTemplate: '<input type="checkbox" ng-model="row.entity.Status">'
                            //editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolToIntEnumeration",
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 0, bool: 'No' }],
                        }
                    ]); break;
                    //Id PosInfoId AccountId PmsRoom Description Status
                    case 'TransactionTypes': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        {
                            field: 'Code', name: 'Code', enableCellEditOnFocus: false,
                            notEmpty: { message: 'The Code is required and cannot be empty' },
                            stringLength: { min: 1, max: 10, message: 'Min value 1 Max value 10' },
                            editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [],                            //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'Code\']:"Key":"Value"'
                        },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        {
                            field: 'IsIncome', name: 'IsIncome', type: "boolean",
                            enableCellEdit: false, enableCellEditOnFocus: false,
                            //cellFilter: 'boolValEnumeration',cellTemplate: '<input type="checkbox" ng-model="row.entity.IsIncome">'
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 2, bool: 'No' }],
                        },
                        {
                            field: 'IsDeleted', name: 'IsDeleted', type: "boolean",
                            enableCellEdit: false, enableCellEditOnFocus: false,
                            //cellFilter: 'boolValEnumeration', cellTemplate: '<input type="checkbox" ng-model="row.entity.IsDeleted">',
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 2, bool: 'No' }],
                            visible: false
                        }
                    ]); break;
                    case 'Discount': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        {
                            field: 'Type', name: 'Type',
                            editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [],                            //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'Type\']:"Key":"Value"'
                        },
                        { field: 'Amount', name: 'Amount', type: "number" },
                        {
                            field: 'Status', name: 'Status', type: "boolean",
                            enableCellEdit: true, enableCellEditOnFocus: false,
                            //cellFilter: 'boolValEnumeration', cellTemplate: '<input type="checkbox" ng-model="row.entity.Status">'
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 2, bool: 'No' }],
                        },
                        { field: 'Sort', name: 'Sort', type: "number" }
                    ]); break;
                    case 'PredefinedCredits': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        { field: 'Amount', name: 'Amount', type: "number" },
                        {
                            field: 'InvoiceTypeId', name: 'InvoiceTypeId', enableCellEditOnFocus: false,
                            editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [],
                            //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'InvoiceTypeId\']:"Key":"Value"'
                        },
                    ]); break;
                    //Setup Settings / Staff
                    //Id Code FirstName LastName ImageUri Password IsDeleted
                    case 'Staff': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        { field: 'Code', name: 'Code', type: "string", enableCellEditOnFocus: false, width: 100 },
                        { field: 'FirstName', name: 'FirstName', type: "string", enableCellEditOnFocus: false, width: 100 },
                        { field: 'LastName', name: 'LastName', type: "string", enableCellEditOnFocus: false, minWidth: 100 },

                        {
                            field: 'ImageUri', name: 'ImageUri', type: "string", enableCellEdit: false, enableCellEditOnFocus: false, width: 100,
                            cellTemplate: '<div class="ui-grid-cell-contents" style="text-align: center;">' +
                            '<button type="button"class="btn btn-xs btn-primary" ng-click="grid.appScope.updateStaffPicture(row)"><i class="fa fa-photo fa-fw"></i></button></div>'
                            //type: "string", 
                        },
                        {
                            field: 'Password', name: 'Password', type: "string", enableCellEditOnFocus: false, cellFilter: 'passwordFilter', width: 100,
                            //editableCellTemplate: '<input ng-model="MODEL_COL_FIELD" type="password">'
                        },
                        {
                            field: 'StaffAuthorization', name: 'Authorizations', width: 300, enableCellEditOnFocus: false,
                            cellFilter: 'mscFilter:"Description"',
                            //cellTemplate: 'multiCell',
                            //cellTemplate: '<div class="ui-grid-cell-contents">{{ COL_FIELD.join(\', \') }}</div>',
                            editableCellTemplate: '<custom-multiselect-cell class="msDropdownCell" drop-array="col.colDef.editDropdownOptionsArray" to-select-model="MODEL_COL_FIELD" match-property="AuthorizedGroupId"><custom-multiselect-cell>',
                            editDropdownOptionsArray: [],

                        },
                        {
                            field: 'StaffPositions', name: 'Positions', width: 300, enableCellEditOnFocus: false, //enableCellEdit: false,
                            cellFilter: 'mscFilter:"Description"',
                            //cellTemplate: '<custom-multiselect-cell class="msDropdownCell" drop-array="col.colDef.editDropdownOptionsArray" to-select-model="MODEL_COL_FIELD" match-property="StaffPositionId"><custom-multiselect-cell>',
                            editableCellTemplate: '<custom-multiselect-cell class="msDropdownCell" drop-array="col.colDef.editDropdownOptionsArray" to-select-model="MODEL_COL_FIELD" match-property="StaffPositionId"><custom-multiselect-cell>',
                            editDropdownOptionsArray: []
                        },
                        { field: 'IsDeleted', name: 'IsDeleted', type: "string", visible: false }
                    ]); break;
                    case 'AuthorizedGroup': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        { field: 'ExtendedDescription', name: 'ExtendedDescription', type: "string", enableCellEditOnFocus: false },
                    ]); break;
                    case 'AuthorizedGroupDetail': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false }, 
                        {
                            field: 'AuthorizedGroupId', name: 'AuthorizedGroup', enableCellEditOnFocus: false,
                            //grouping privilages
                            groupable: true, enableSorting: true, sortFn: function (a, b) { return a < b },
                            grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'desc' }, width: '35%',
                            // cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>',
                            //editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: [], //this needs to init dynamically
                            cellFilter: 'mapGroupDropdown: row.grid.appScope.dynamicEnumObj[\'AuthorizedGroupId\']',
                            treeAggregationType: uiGridGroupingConstants.aggregation.max,
                        },
                        {
                            field: 'ActionId', name: 'ActionId',// treeAggregationType: uiGridGroupingConstants.aggregation.COUNT,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'ActionId\']:"Key":"Value"',

                        },
                    ]); break;
                    case 'StaffPosition': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                    ]); break;
                    //Setup Settings / Sales
                    case 'ClientPos': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false }, 
                        { field: 'Code', name: 'Code', type: "string", enableCellEditOnFocus: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        {
                            field: 'PosInfoId', name: 'PosInfoId', enableCellEditOnFocus: false,
                            //grouping privilages
                            groupable: true, enableSorting: true, sortFn: function (a, b) { return a < b },
                            grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'desc' }, width: '35%',

                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: [], //this needs to init dynamically
                            cellFilter: 'mapGroupDropdown: row.grid.appScope.dynamicEnumObj[\'PosInfoId\']',
                            // treeAggregationType: uiGridGroupingConstants.aggregation.max,
                        },
                        { field: 'Theme', name: 'Theme', type: "string", enableCellEditOnFocus: false },
                        {
                            field: 'LogInToOrder', name: 'LogInToOrder', type: "boolean", enableCellEdit: false, enableCellEditOnFocus: false,
                            //cellTemplate: '<input type="checkbox" ng-model="row.entity.LogInToOrder">', cellFilter: 'boolValEnumeration',
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 2, bool: 'No' }],
                            visible: false
                        },
                        {
                            field: 'Status', name: 'Status', type: "boolean",
                            enableCellEdit: true, enableCellEditOnFocus: false,
                            //cellFilter: 'boolValEnumeration', cellTemplate: '<input type="checkbox" ng-model="row.entity.Status">'
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValStatusIntEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Enabled' }, { id: 0, bool: 'Disabled' }]
                        }
                        // { field: 'Status', name: 'Status', type: "number" }
                    ]); break;
                    case 'PdaModule': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false }, 
                        { field: 'Code', name: 'Code', type: "string", enableCellEditOnFocus: false },
                        {
                            field: 'PosInfoId', name: 'PosInfoId', enableCellEditOnFocus: false,
                            //grouping privilages
                            groupable: true, enableSorting: true, sortFn: function (a, b) { return a < b },
                            grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'desc' }, width: '35%',

                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: [], //this needs to init dynamically
                            cellFilter: 'mapGroupDropdown: row.grid.appScope.dynamicEnumObj[\'PosInfoId\']',
                            treeAggregationType: uiGridGroupingConstants.aggregation.max,
                        },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        {
                            field: 'PageSetId', name: 'PageSetId',// treeAggregationType: uiGridGroupingConstants.aggregation.COUNT,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'PageSetId\']:"Key":"Value"',

                        },
                        { field: 'MaxActiveUsers', name: 'MaxActiveUsers', type: "number" },
                        { field: 'Status', name: 'Status', type: "number" }
                    ]); break;
                    case 'Kitchen': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        { field: 'Code', name: 'Code', type: "string" },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        { field: 'Status', name: 'Status' /*, type: Byte*/ },
                        {
                            field: 'IsDeleted', name: 'IsDeleted', type: "boolean",
                            enableCellEdit: false, enableCellEditOnFocus: false,
                            //cellFilter: 'boolValEnumeration', cellTemplate: '<input type="checkbox" ng-model="row.entity.IsDeleted">',
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 2, bool: 'No' }],
                            visible: false
                        }
                    ]); break;
                    case 'KitchenRegion': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        { field: 'ItemRegion', name: 'ItemRegion', type: "string" },
                        { field: 'RegionPosition', name: 'RegionPosition', type: "number" },
                        {
                            field: 'Abbr', name: 'Abbr', enableCellEditOnFocus: false, enableCellEdit: true,
                            validators: { notNull: true, minLength: { threshold: 1 }, maxLength: { threshold: 3 } }//, cellTemplate: 'ui-grid/cellTitleValidator'
                            //cellEditableCondition: function($scope){                              //    return $scope.rowRenderIndex%2
                        },
                    ]); break;
                    case 'KitchenInstruction': return ([
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        {
                            field: 'KitchenId', name: 'KitchenId', enableCellEditOnFocus: false,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: [],
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'KitchenId\']:"Key":"Value"' //working
                            //$scope.filtersObjArray["KitchenId"]
                        },
                        { field: 'Message', name: 'Message', type: "string", }
                    ]); break;
                    case 'Kds': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        { field: 'Status', name: 'Status'/*, type: Byte*/ },
                        { field: 'PosInfoId', name: 'PosInfoId', type: "number", visible: false, },
                        {
                            field: 'IsDeleted', name: 'IsDeleted', type: "boolean",
                            //cellFilter: 'boolValEnumeration', cellTemplate: '<input type="checkbox" ng-model="row.entity.IsDeleted">',
                            enableCellEdit: false, enableCellEditOnFocus: false,
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 2, bool: 'No' }],
                            visible: false
                        }
                    ]); break;
                    case 'Payrole': return ([
                        //{ field: 'StaffId', name: 'Staff', type: "number", enableCellEdit: true },
                        {
                            field: 'StaffId', name: 'Staff',
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'StaffId\']:"Key":"Value"',
                        },
                        {
                            field: 'PosInfoId', name: 'PosInfo', enableCellEditOnFocus: false,
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: [], //this needs to init dynamically
                            //cellFilter: 'mapGroupDropdown: row.grid.appScope.dynamicEnumObj[\'PosInfoId\']',
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'PosInfoId\']:"Key":"Value"',
                        },
                        {
                            field: 'Type', name: 'Type',// treeAggregationType: uiGridGroupingConstants.aggregation.COUNT,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'Type\']:"Key":"Value"',
                        },
                        {
                            field: "ActionDate", displayName: "Date", enableCellEditOnFocus: false,
                            cellFilter: 'date:"dd MMM yyyy HH:mm"',
                            editableCellTemplate: '<div><form name="inputForm"><div ui-grid-edit-datetimepicker ng-class="\'colt\' + col.uid"></div></form></div>'
                        },
                        { field: 'Identification', name: 'Identification', type: "string", enableCellEdit: true, enableCellEditOnFocus: false },
                        {
                            field: 'ShopId', name: 'Shop',
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'ShopId\']:"Key":"Value"',
                        },
                    ]); break;
                    case 'SalesType': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: true },// enableCellEdit: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        {
                            field: 'Abbreviation', name: 'Abbreviation', enableCellEditOnFocus: false, enableCellEdit: true,
                            validators: { notNull: true, minLength: { threshold: 1 }, maxLength: { threshold: 5 } }
                        },
                        {
                            field: 'IsDeleted', name: 'IsDeleted', type: "boolean",
                            //cellFilter: 'boolValEnumeration',cellTemplate: '<input type="checkbox" ng-model="row.entity.IsDeleted">',
                            enableCellEdit: false, enableCellEditOnFocus: false,
                            editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 2, bool: 'No' }],
                            visible: false
                        }
                    ]); break;
                    case 'Units': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        {
                            field: 'Abbreviation', name: 'Abbreviation', enableCellEditOnFocus: false, enableCellEdit: true,
                            validators: { notNull: true, minLength: { threshold: 1 }, maxLength: { threshold: 3 } }
                        },
                        { field: 'Unit', name: 'Unit', type: "number" }
                    ]); break;
                    case 'Categories': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, width: 50 },// enableCellEdit: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        { field: 'Status', name: 'Status', type: "boolean", visible: false, }
                    ]); break;
                    case 'Items': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        { field: 'ExtendedDescription', name: 'ExtendedDescription', type: "string", enableCellEditOnFocus: false },
                        { field: 'Qty', name: 'Status', type: "number" },
                        {
                            field: 'UnitId', name: 'UnitId',// treeAggregationType: uiGridGroupingConstants.aggregation.COUNT,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'UnitId\']:"Key":"Value"',
                        },
                        {
                            field: 'VatId', name: 'VatId',// treeAggregationType: uiGridGroupingConstants.aggregation.COUNT,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'VatId\']:"Key":"Value"',
                        }
                    ]); break;
                    case 'ProductCategories': return ([
                        //Id Description  Type  Status  Code  CategoryId
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        { field: 'Code', name: 'Code', type: "string" },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        //{ field: 'Type', name: 'Type', type: "boolean" },
                        {
                            field: 'CategoryId', name: 'Category', type: "number", enableCellEditOnFocus: false,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'CategoryId\']:"Key":"Value"'
                        },
                        {
                            field: 'Status', name: 'Status', type: "boolean", editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValStatusEnumeration",
                            editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Enabled' }, { id: false, bool: 'Disabled' }],
                            visible: true, width: 100
                        }

                    ]); break;
                    case 'IngredientCategories': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },
                        { field: 'Code', name: 'Code', type: "string" },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false },
                        {
                            field: 'Status', name: 'Status', type: "boolean", editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValStatusEnumeration",
                            editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Enabled' }, { id: false, bool: 'Disabled' }],
                            visible: true, width: 100
                        },
                        {
                            field: 'IsUnique', name: 'IsUnique', type: "boolean", editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                            editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'YES' }, { id: false, bool: 'NO' }],
                            visible: true, width: 100
                        }

                    ]); break;
                    case 'Ingredients': return ([
                        //Id Description ExtendedDescription SalesDescription Qty ItemId UnitId Code IsDeleted Background Color
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                        { field: 'Code', name: 'Code', type: "string" },
                        { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false, },
                        { field: 'ExtendedDescription', name: 'Extended Desc', type: "string", enableCellEditOnFocus: false },
                        { field: 'SalesDescription', name: 'Sales Desc', type: "string", enableCellEditOnFocus: false },
                        { field: 'Qty', name: 'Qty', type: "number" },
                        {
                            field: 'ItemId', name: 'Item  ', type: "number", enableCellEditOnFocus: false, visible: false,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'ItemId\']:"Key":"Value"'
                        },
                        {
                            field: 'UnitId', name: 'Unit ', type: "number", enableCellEditOnFocus: false,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'UnitId\']:"Key":"Value"'
                        },
                        { field: 'IsDeleted', name: 'IsDeleted', type: "boolean", visible: false },
                        {
                            field: 'Colors', name: 'Colors', type: "string", enableCellEdit: false, enableCellEditOnFocus: false, width: 100,
                            cellTemplate: '<div class="ui-grid-cell-contents" style="text-align: center;">' +
                            '<button type="button"class="btn btn-xs" style="background-color:{{row.entity.Background || \'#dae0e0\'}}; color:{{row.entity.Color || \'black\'}};" ng-click="grid.appScope.colorPickerModal(row)">Text</div>'
                        },
                        { field: 'Background', name: 'Background', type: "string", enableCellEditOnFocus: false, visible: false },
                        { field: 'Color', name: 'Color', type: "string", enableCellEditOnFocus: false, visible: false },
                        {
                            field: 'IngredientCategoryId', name: 'IngredientCategory ', type: "number", enableCellEditOnFocus: false,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'IngredientCategoryId\']:"Key":"Value"'
                        },


                    ]); break;
                    case 'Combo': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false },
                        { field: 'Description', name: 'Description', type: "Description" },
                        {
                            field: 'StartDate', name: 'Start Date', width: 100,// cellFilter: 'textDateFilter',
                            enableCellEdit: true, enableCellEditOnFocus: true,
                            cellFilter: 'date:"dd/MM/yyyy"',
                            editableCellTemplate: '<div><form name="inputForm"><div ui-grid-edit-date-picker ng-class="\'colt\' + col.uid"></div></form></div>'
                        },
                        {
                            field: 'EndDate', name: 'End Date', width: 100,// cellFilter: 'textDateFilter',
                            enableCellEdit: true, enableCellEditOnFocus: true,
                            cellFilter: 'date:"dd/MM/yyyy"',
                            editableCellTemplate: '<div><form name="inputForm"><div ui-grid-edit-date-picker ng-class="\'colt\' + col.uid"></div></form></div>'
                        },
                        {
                            field: 'StartTime', name: 'Start Time', width: 100,// cellFilter: 'textDateFilter',
                            enableCellEdit: true, enableCellEditOnFocus: true,
                            cellFilter: 'date:"hh:mm a"',
                            editableCellTemplate: '<div><form name="inputForm"><div ui-grid-edit-time-picker ng-class="\'colt\' + col.uid"></div></form></div>'
                        },
                        {
                            field: 'EndTime', name: 'End Time', width: 100,// cellFilter: 'textDateFilter',
                            enableCellEdit: true, enableCellEditOnFocus: true,
                            cellFilter: 'date:"hh:mm a"',
                            editableCellTemplate: '<div><form name="inputForm"><div ui-grid-edit-time-picker ng-class="\'colt\' + col.uid"></div></form></div>'
                        },
                        {
                            field: 'ProductComboId', name: 'Product', type: "number", enableCellEditOnFocus: false,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'ProductComboId\']:"Key":"Value"'
                        },
                        {
                            field: 'DepartmentId', name: 'Department', type: "number", enableCellEditOnFocus: false,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'DepartmentId\']:"Key":"Value"'
                        }
                    ]); break;
                    case 'ComboDetail': return ([
                        { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false },
                        {
                            field: 'ComboId', name: 'Combo', type: "number", enableCellEditOnFocus: false,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'ComboId\']:"Key":"Value"'
                        },
                        {
                            field: 'ProductComboItemId', name: 'Product', type: "number", enableCellEditOnFocus: false,
                            editType: 'dropdown',
                            editableCellTemplate: 'ui-grid/dropdownEditor',
                            editDropdownIdLabel: 'Key',
                            editDropdownValueLabel: 'Value',
                            editDropdownOptionsArray: TypeArray, //this needs to init dynamically
                            cellFilter: 'mapDropdown: row.grid.appScope.filtersObjArray[\'ProductComboItemId\']:"Key":"Value"'
                        }
                    ]); break;

                    default: break;

                }
            },
            getTittle: function (tableType) {
                switch (tableType) {
                    case 'InvoiceTypes': return "Manage your Invoice Types"; break;
                    case 'Vat': return "Manage Vat Settings"; break;
                    case 'Tax': return "Manage Tax Entries"; break;
                    default: break;
                }
            },
            getGridParams: function (tableType) {
                switch (tableType) {
                    case 'AuthorizedGroupDetail': case 'PosInfoDetail_Excluded_Accounts': case 'PosInfoDetail_Pricelist_Assoc':
                    case 'PdaModule': case 'ClientPos': case 'Pricelist': case 'Department':
                        return ([
                            //{ key: "groupKeys", value: ['AuthorizedGroupId'] },
                            { key: "enableFiltering", value: true },

                            { key: "enableGroupHeaderSelection", value: true },
                            { key: "showGroupPanel", value: true },
                            { key: "enableGrouping", value: false },
                            { key: "groupingShowCounts", value: true },
                            { key: "showTreeRowHeader", value: true },
                            { key: "treeRowHeaderAlwaysVisible", value: false },
                            { key: "showColumnFooter", value: true },
                            { key: "rowEditWaitInterval", value: -1 }, //use this to avoid save event wait until next edit .. 
                            { key: "groupingShowAggregationMenu", value: false },

                        ]); break;
                    case 'Payrole':
                        return ([

                            { key: "enableGroupHeaderSelection", value: true },
                            { key: "showTreeRowHeader", value: true },
                            { key: "treeRowHeaderAlwaysVisible", value: false },
                            { key: "showColumnFooter", value: true },
                            { key: "rowEditWaitInterval", value: -1 }, //use this to avoid save event wait until next edit .. 

                        ]); break;
                    case 'InvoiceTypes': case 'Vat': case 'Tax': case 'Items': case 'Ingredients': case 'Staff': case 'PricelistMaster': case 'Accounts': case 'Combo': case 'ComboDetail':
                        return ([
                            { key: "rowEditWaitInterval", value: -1 }, //use this to avoid save event wait until next edit .. 
                            //{ key: "enableFiltering", value: true },
                            { key: "enablePaginationControls", value: true }, //pag buttons action

                            //{ key: "enableCellEdit", value: false },
                            { key: "enableCellEditOnFocus", value: true }, //on dblclick edit <!> Caution <!> with row edit enable u need to activate select box its the only way to select a row
                            { key: "enableSorting", value: true },
                            //{ key: "enableRowSelection", value: true },
                            { key: "multiSelect", value: false },   //--<
                            { key: "modifierKeysToMultiSelect", value: false }, //column on multiselect
                            { key: "noUnselect", value: true },

                            //{ key: "enableColumnResizing", value: true },
                            //{ key: "enableGridMenu", value: true },
                            //{ key: "enableSorting", value: true },
                            //{ key: "enableFullRowSelection", value: true },
                            //{ key: "showGridFootersizing", value: false },
                            //{ key: "showColumnFootersizing", value: true },
                            //{ key: "fastWatch sizing", value: true },

                        ]); break;
                    default: break;
                }
            },
            geteditRowEntity: function (tableType) {
                switch (tableType) {
                    case 'InvoiceTypes':
                        return { 'Code': '', 'Abbreviation': '', ' Description': '', 'Type': '', 'IsDeleted': false }; break;
                    case 'Vat':
                        return { 'Description': '', 'Percentage': '', 'Code': '' }; break;
                    case 'Tax':
                        return { ' Description': '', 'Percentage': '' }; break;
                    default: break;
                }
            },
            geteditRowSchema: function (tableType) {
                switch (tableType) {
                    case 'Department': return ({
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description' },
                        },
                        required: ['Description']
                    }); break;
                    case 'InvoiceTypes': return ({
                        type: 'object',
                        properties: {
                            Code: { type: 'string', title: 'Code', htmlClass: 'col-md-6,col-xs-6' },
                            Abbreviation: {
                                type: 'string', title: 'Abbreviation',
                                htmlClass: 'col-md-6,col-xs-6',
                                minLength: 1, maxLength: 3,
                                validationMessage: "Abbreviation length of must be 2-3 Chars.",
                                description: "Add an Abbreviation of 2-3 characters.",
                                validators: {
                                    notEmpty: { message: 'The cell phone number is required' }
                                }
                            },
                            Description: { type: 'string', title: 'Description', validationMessage: "You need to add a Desciption." },
                            Type: {
                                "title": 'Type',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            },
                            //IsDeleted: { type: 'boolean', title: 'IsDeleted' },
                            //Invoices : { type: 'array', title: 'Invoices' },                    //PosInfoDetail': { type: 'array', title: 'Invoices' },
                            //PosInfoDetail': { type: 'array', title: 'Invoices' },                        //PredefinedCredits': { type: 'array', title: 'Invoices' },
                            //IsEdited: { type: 'string', title: 'Invoices' },    
                        },
                        required: ['Code', 'Description', 'Abbreviation', 'Type']
                    }); break;
                    case 'Vat': return ({
                        type: 'object',
                        properties: {
                            Code: { type: 'integer', title: 'Code', "minimum": 0 },
                            Description: { type: 'string', title: 'Description' },
                            Percentage: {
                                "type": 'number', "title": 'Percentage',
                                "minimum": 0.0, "maximum": 100
                            },

                        },
                        required: ['Description', 'Percentage', 'Code']
                    }); break;
                    case 'Tax': return ({
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description' },
                            Percentage: {
                                "type": 'number', "title": 'Percentage',
                                "minimum": 0.0, "maximum": 100
                            },
                        },
                        required: ['Description', 'Percentage']
                    }); break;
                    case 'PricelistMaster': return ({
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description', validationMessage: "You need to add a Desciption." },
                            Status: { type: 'boolean', title: 'Status' },
                            Active: { type: 'boolean', title: 'Active' },
                            AssociatedSalesTypes: {
                                title: "Sales Types ",
                                type: "array",
                                items: { type: "number" },
                                //maxItems: 2,
                            },
                        },

                        required: ['Description', 'AssociatedSalesTypes']
                    }); break;
                    case 'Pricelist': return ({
                        type: 'object',
                        properties: {
                            Code: { type: 'string', title: 'Code' },
                            Description: { type: 'string', title: 'Description', validationMessage: "You need to add a Desciption." },
                            LookUpPriceListId: {
                                "title": 'LookUpPriceListId', "type": 'number',
                                "htmlClass": 'customFormSelect', "format": 'uiselect',
                                "placeholder": 'Select Price List...', "nullLabel": '---',
                            },
                            SalesTypeId: {
                                "title": 'SalesTypeId', "type": 'number',
                                "htmlClass": 'customFormSelect', "format": 'uiselect',
                                "placeholder": 'Select Action...', "nullLabel": '---',
                            },
                            Percentage: {
                                "type": 'number', "title": 'Percentage', "minimum": 0.0
                            },
                            ActivationDate: { type: 'string', title: 'ActivationDate', format: "date" },// format: "yyyy-mm-dd" }, //rowEntity.ActivationDate.toISOString()
                            DeactivationDate: { type: 'string', title: 'DeactivationDate', format: "date" }, //rowEntity.ActivationDate.toISOString()
                            PricelistMasterId: {
                                "title": 'PricelistMasterId', "type": 'number',
                                "htmlClass": 'customFormSelect', "format": 'uiselect',
                                "placeholder": 'Select Action...', "nullLabel": '---',
                            },
                            Status: { type: 'number', title: 'Status' },
                            Type: {
                                type: 'number', title: 'Type',
                                "htmlClass": 'customFormSelect', "format": 'uiselect',
                                "placeholder": 'Select Action...', "nullLabel": '---',
                            },
                        },
                        required: ['Description', 'SalesTypeId', 'ActivationDate', 'DeactivationDate', 'Type']
                    }); break;
                    case 'PosInfoDetail_Pricelist_Assoc': return ({
                        type: 'object',
                        properties: {
                            PosInfoDetailId: {
                                "title": 'PosInfoDetailId',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select Group...',
                                "nullLabel": '---',
                            },
                            PricelistId: {
                                "title": 'PricelistId',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select Action...',
                                "nullLabel": '---',
                            },
                        },
                        required: ['PosInfoDetailId', 'PricelistId']
                    }); break;

                    //lvl1 Transactions
                    case 'Accounts': return ({
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description' },
                            Type: {
                                "title": 'Type',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            },
                            IsDefault: { type: 'boolean', title: 'IsDefault' },
                            SendsTransfer: { type: 'boolean', title: 'SendsTransfer' },
                            OnlyCard: { type: 'boolean', title: 'Only Card' },
                            PMSPaymentId: {
                                "title": 'PMS Payment',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            }
                            //KeyboardType: {
                            //    "title": 'KeyboardType',
                            //    "type": 'number',
                            //    "htmlClass": 'customFormSelect',
                            //    "format": 'uiselect',
                            //    "placeholder": 'Select type...',
                            //    "nullLabel": '---',
                            //},

                        },
                        required: ['Description', 'Type', 'KeyboardType']
                    }); break;
                    case 'PosInfoDetail_Excluded_Accounts': return ({
                        type: 'object',
                        properties: {
                            PosInfoDetailId: {
                                "title": 'PosInfoDetailId',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select Group...',
                                "nullLabel": '---',
                            },
                            AccountId: {
                                "title": 'AccountId',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select Action...',
                                "nullLabel": '---',
                            },
                        },
                        required: ['PosInfoDetailId', 'AccountId']
                    }); break;
                    case 'AccountMapping': return ({
                        type: 'object',
                        properties: {
                            PosInfoId: {
                                "title": 'PosInfoId', "type": 'number', "htmlClass": 'customFormSelect',
                                "format": 'uiselect', "placeholder": 'Select type...', "nullLabel": '---',
                            },
                            AccountId: {
                                "title": 'AccountId', "type": 'number', "htmlClass": 'customFormSelect',
                                "format": 'uiselect', "placeholder": 'Select type...', "nullLabel": '---',
                            },
                            PmsRoom: { type: 'integer', title: 'PmsRoom' },
                            Description: { type: 'string', title: 'Description' },
                            Status: { type: 'boolean', title: 'Status' },
                        },
                        required: ['PosInfoId', 'AccountId', 'PmsRoom', 'Description']
                    }); break;
                    case 'TransactionTypes': return ({
                        type: 'object',
                        properties: {
                            Code: {
                                type: 'integer', title: 'Code', "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            },
                            Description: { type: 'string', title: 'Description' },
                            IsIncome: { type: 'boolean', title: 'Is Income' }
                        },
                        required: ['Code', 'Description']
                    }); break;
                    case 'Discount': return ({
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description' },
                            Type: {
                                type: 'integer', title: 'Type', "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            },
                            Amount: {
                                type: 'number', title: 'Amount',
                                "minimum": "{{values.Type}}",
                                //function () {
                                //         return 5;
                                //    return ("{{values.Type}}" == 0) ? 0.0 : 2;
                                //    },
                                "maximum": "{{values.Type}}"
                            },
                            Status: { type: 'boolean', title: 'Status' },
                            Sort: { type: 'integer', title: 'Sort' }

                        },
                        required: ['Type', 'Amount', 'Sort', 'Description']
                    }); break;
                    case 'PredefinedCredits': return ({
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description' },
                            Amount: { type: 'number', title: 'Amount' },
                            InvoiceTypeId: {
                                type: 'integer', title: 'InvoiceTypeId', "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            },
                            InvoiceType: { type: 'integer', title: 'InvoiceType' },

                        },
                        required: ['Description', 'Amount', 'InvoiceTypeId', 'InvoiceType']
                    }); break;
                    //lvl1 Staff
                    //Id Code FirstName LastName ImageUri Password IsDeleted
                    case 'Staff': return ({
                        type: 'object',
                        properties: {
                            Code: { type: 'string', title: 'Code' },
                            FirstName: { type: 'string', title: 'FirstName' },
                            LastName: { type: 'string', title: 'LastName' },
                            ImageUri: { type: 'string', title: 'ImageUri' },
                            Password: { type: 'string', title: 'Password' },
                            StaffAuthorization: {
                                title: "Authorization ",
                                type: "array",
                                items: { type: "number" },
                                //maxItems: 2,
                            },
                            StaffPositions: {
                                title: "Positions ",
                                type: "array",
                                items: { type: "number" },
                                //maxItems: 2,
                            }
                        },
                        required: ['FirstName', 'LastName', 'Password']
                    }); break;
                    case 'AuthorizedGroup': return ({
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description' },
                            ExtendedDescription: { type: 'string', title: 'ExtendedDescription' },
                        },
                        required: ['Description', 'ExtendedDescription']
                    }); break;
                    case 'AuthorizedGroupDetail': return ({
                        type: 'object',
                        properties: {
                            AuthorizedGroupId: {
                                "title": 'AuthorizedGroup',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select Group...',
                                "nullLabel": '---',
                            },
                            ActionId: {
                                "title": 'Actions',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select Action...',
                                "nullLabel": '---',
                            },
                        },
                        required: ['AuthorizedGroupId', 'ActionId']
                    }); break;
                    case 'StaffPosition': return ({
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description' },
                        },
                        required: ['Description']
                    }); break;
                    //lvl1 Sales
                    //Id Code Description PosInfoId Theme LogInToOrder Status
                    case 'ClientPos': return ({
                        type: 'object',
                        properties: {
                            Code: { type: 'string', title: 'Code' },
                            Description: { type: 'string', title: 'Description' },
                            PosInfoId: {
                                "title": 'PosInfoId',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select Group...',
                                "nullLabel": '---',
                            },
                            Theme: {
                                "title": 'Theme',
                                "type": 'string',
                                //"htmlClass": 'customFormSelect',
                                //"format": 'uiselect',
                                //"placeholder": 'Select Group...',
                                //"nullLabel": '---',
                            },
                            LogInToOrder: { type: 'boolean', title: 'LogInToOrder' },
                            Status: { type: 'integer', title: 'Status' }
                        },
                        required: ['Code', 'Description', 'PosInfoId', 'Theme', 'LogInToOrder', 'Status']
                    }); break;
                    case 'PdaModule': return ({
                        type: 'object',
                        properties: {
                            PosInfoId: {
                                "title": 'PosInfoId',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select Group...',
                                "nullLabel": '---',
                            },
                            Code: { type: 'string', title: 'Code' },
                            Description: { type: 'string', title: 'Description' },
                            PageSetId: {
                                "title": 'PageSetId',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select Group...',
                                "nullLabel": '---',
                            },
                            MaxActiveUsers: { type: 'integer', title: 'MaxActiveUsers' },
                            Status: { type: 'integer', title: 'Status' }
                        },
                        required: ['PosInfoId', 'Code', 'Description', 'PageSetId', 'MaxActiveUsers', 'Status']
                    }); break;
                    case 'Kitchen': return ({
                        type: 'object',
                        properties: {
                            Code: { type: 'string', title: 'Code' },
                            Description: { type: 'string', title: 'Description' },
                            Status: { type: 'integer', title: 'Status' }
                        },
                        required: ['Code', 'Description', 'Status']
                    }); break;
                    case 'KitchenRegion': return ({
                        type: 'object',
                        properties: {
                            ItemRegion: { type: 'string', title: 'ItemRegion' },
                            Abbr: { type: 'string', title: 'Abbr' },
                            RegionPosition: { type: 'integer', title: 'RegionPosition' }
                        },
                        required: ['ItemRegion', 'Abbr', 'RegionPosition']
                    }); break;
                    //                    { field: 'Id', name: 'Id',  type: "number", enableCellEdit: false, visible: false, },// enableCellEdit: false },
                    //{ field: 'ItemRegion', name: 'ItemRegion', type: "string" },
                    //{ field: 'RegionPosition', name: 'RegionPosition',  type: "number" },
                    //{
                    //    field: 'Abbr', name: 'Abbr', enableCellEditOnFocus: false, enableCellEdit: true,
                    //    validators: { notNull: true, minLength: { threshold: 1 }, maxLength: { threshold: 3 } }//, cellTemplate: 'ui-grid/cellTitleValidator'
                    //    //cellEditableCondition: function($scope){                              //    return $scope.rowRenderIndex%2
                    //},
                    case 'KitchenInstruction': return ({
                        type: 'object',
                        properties: {
                            KitchenId: {
                                "title": 'KitchenId',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            },
                            Message: { type: 'string', title: 'Message', validationMessage: "You need to add a Message." },
                            Description: { type: 'string', title: 'Description', validationMessage: "You need to add a Desciption." },
                        },
                        required: ['Description', 'KitchenId', 'Message']
                    }); break;
                    case 'Kds': return ({
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description' },
                            Status: { type: 'integer', title: 'Status' }
                        },
                        required: ['Description', 'Status', 'PosInfoId']
                    }); break;
                    case 'Payrole': return ({
                        type: 'object',
                        properties: {
                            StaffId: { type: 'number', title: 'Staff' },
                            PosInfoId: {
                                "title": 'PosInfoId',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select Group...',
                                "nullLabel": '---',
                            },
                            Type: { type: 'string', title: 'Type' },
                            ActionDate: { type: 'string', title: 'ActionDate' },
                            Identification: { type: 'string', title: 'Identification' },
                            ShopId: { type: 'number', title: 'Shop' },
                        },
                        required: ['StaffId', 'PosInfoId', 'Type', 'ActionDate', 'Identification']
                    }); break;
                    case 'SalesType': return ({
                        type: 'object',
                        properties: {
                            Id: { type: 'number', title: 'Id' },
                            Description: { type: 'string', title: 'Description' },
                            Abbreviation: {
                                type: 'string', title: 'Abbreviation', htmlClass: 'col-md-6,col-xs-6', minLength: 1, maxLength: 5,
                                validationMessage: "Abbreviation length of must be 1-5 Chars.", description: "Add an Abbreviation of 1-5 characters.",
                                validators: { notEmpty: { message: 'The cell phone number is required' } }
                            },
                        },
                        required: ['Description', 'Abbreviation']
                    }); break;
                    case 'Units': return ({
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description' },
                            Abbreviation: {
                                type: 'string', title: 'Abbreviation', htmlClass: 'col-md-6,col-xs-6', minLength: 1, maxLength: 5,
                                validationMessage: "Abbreviation length of must be 1-5 Chars.", description: "Add an Abbreviation of 1-5 characters.",
                                validators: { notEmpty: { message: 'The cell phone number is required' } }
                            },
                            Unit: { type: 'number', title: 'Unit' },
                        },
                        required: ['Description', 'Abbreviation', 'Unit']
                    }); break;
                    case 'Categories': return ({
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description', validationMessage: "You need to add a Desciption." },
                            Status: { type: 'integer', title: 'Status' },
                        },
                        required: ['Description', 'Status']
                    }); break;
                    case 'Items': return ({
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description', validationMessage: "You need to add a Desciption." },
                            ExtendedDescription: { type: 'string', title: 'ExtendedDescription', validationMessage: "You need to add a Desciption." },
                            Qty: { type: 'number', title: 'Qty' },
                            UnitId: {
                                "title": 'UnitId',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select Group...',
                                "nullLabel": '---',
                            },
                            VatId: {
                                "title": 'VatId',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select Group...',
                                "nullLabel": '---',
                            },
                        },
                        required: ['Description', 'ExtendedDescription', 'Qty', 'UnitId', 'VatId']
                    }); break;
                    //lvl1 Products
                    case 'ProductCategories': return ({
                        type: 'object',
                        properties: {
                            Code: { type: 'string', title: 'Code', validationMessage: "You need to add a Code." },
                            Description: { type: 'string', title: 'Description', validationMessage: "You need to add a Desciption." },
                            //Type: { type: 'integer', title: 'Type' },
                            CategoryId: {
                                "title": 'Category',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            },
                            Status: {
                                title: 'Status',
                                type: 'boolean',
                                htmlClass: 'customFormSelect',
                                format: 'uiselect',
                                placeholder: 'Select type...',
                                nullLabel: '---',
                                title: 'Status'
                            }
                        },
                        required: ['Code', 'Description', 'CategoryId', 'Status']
                    }); break;
                    case 'IngredientCategories': return ({
                        type: 'object',
                        properties: {
                            Code: { type: 'string', title: 'Code', validationMessage: "You need to add a Code." },
                            Description: { type: 'string', title: 'Description', validationMessage: "You need to add a Desciption." },
                            Status: {
                                title: 'Status',
                                type: 'boolean',
                                htmlClass: 'customFormSelect',
                                format: 'uiselect',
                                placeholder: 'Select type...',
                                nullLabel: '---',
                                title: 'Status'
                            },
                            IsUnique: {
                                title: 'IsUnique',
                                type: 'boolean',
                                htmlClass: 'customFormSelect',
                                format: 'uiselect',
                                placeholder: 'Select type...',
                                nullLabel: '---',
                                title: 'IsUnique'
                            }
                        },
                        required: ['Code', 'Description', 'Status','IsUnique']
                    }); break;
                    case 'Ingredients': return ({
                        type: 'object',
                        properties: {
                            Code: { type: 'string', title: 'Code', validationMessage: "You need to add a Code." },
                            Description: { type: 'string', title: 'Description', validationMessage: "You need to add a Desciption." },
                            ExtendedDescription: { type: 'string', title: 'Extended Description', validationMessage: "You need to add a Extended Description." },
                            SalesDescription: { type: 'string', title: 'Sales Description', validationMessage: "You need to add a Sales Description." },
                            UnitId: {
                                "title": 'Unit',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            },
                            IngredientCategoryId: {
                                "title": 'IngredientCategory',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            }
                        },
                        required: ['Description', 'ExtendedDescription', 'SalesDescription', 'UnitId']
                    }); break;
                    case 'Combo': return ({
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description', validationMessage: "You need to add a Desciption." },
                            StartDate: { type: 'text', title: 'Start Date', format: "DD/MM/YYYY", validationMessage: "You need to add a Start Date." },
                            EndDate: { type: 'text', title: 'End Date', format: "DD/MM/YYYY", validationMessage: "You need to add an End Date." },
                            StartTime: { type: 'text', title: 'Start Time', format: "hh:mm a", validationMessage: "You need to add a Start Time." },
                            EndTime: { type: 'text', title: 'End Time', format: "hh:mm a", validationMessage: "You need to add an End Time." },
                            ProductComboId: {
                                "title": 'Product',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            },
                            DepartmentId: {
                                "title": 'Department',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            }
                        },
                        required: ['Description', 'StartDate', 'EndDate', 'StartTime', 'EndTime', 'ProductComboId', 'DepartmentId']
                    }); break;
                    case 'ComboDetail': return ({
                        type: 'object',
                        properties: {
                            ComboId: {
                                "title": 'Combo',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            },
                            ProductComboItemId: {
                                "title": 'Product',
                                "type": 'number',
                                "htmlClass": 'customFormSelect',
                                "format": 'uiselect',
                                "placeholder": 'Select type...',
                                "nullLabel": '---',
                            }
                        },
                        required: ['ComboId', 'ProductComboItemId']
                    }); break;

                    default: break;

                }
            },
            geteditRowForm: function (tableType) {
                switch (tableType) {
                    case 'Department': return ['Description']; break;
                    case 'InvoiceTypes': return ['Code', 'Abbreviation', 'Description',
                        {
                            key: 'Type', type: 'select', titleMap: [],                                //htmlClass: "col-lg-3 col-md-3",
                            labelHtmlClass: "customFormSelect", fieldHtmlClass: "customFormSelect",
                        }]; break;
                    case 'Vat': return ['Description', 'Percentage', 'Code']; break;
                    case 'Tax': return ['Description', 'Percentage']; break;
                    case 'PricelistMaster': return ['Description', 'Status', 'Active', {
                        key: 'AssociatedSalesTypes', type: 'strapselect',
                        options: {
                            multiple: "true",
                            //map: { valueProperty: "PosInfoId", nameProperty: "PosInfoDescription" }
                        },
                        titleMap: []
                    },]; break;
                    case 'Pricelist': return ['Code', 'Description',
                        { key: 'LookUpPriceListId', type: 'select', titleMap: [] }, { key: 'SalesTypeId', type: 'select', titleMap: [] },
                        'Percentage',
                        { key: 'ActivationDate', type: 'datepicker' },
                        { key: 'DeactivationDate', type: 'datepicker' },
                        { key: 'PricelistMasterId', type: 'select', titleMap: [] }, { key: 'Type', type: 'select', titleMap: [] }]; break;
                    case 'PosInfoDetail_Pricelist_Assoc': return [{ key: 'PosInfoDetailId', type: 'select', titleMap: [] }, { key: 'PricelistId', type: 'select', titleMap: [] }]; break;
                    case 'Accounts': return [
                        'Description', { key: 'Type', type: 'select', titleMap: [], labelHtmlClass: "customFormSelect", fieldHtmlClass: "customFormSelect", }, 'IsDefault', 'SendsTransfer', 'OnlyCard', { key: 'PMSPaymentId', type: 'select', titleMap: [] }, { key: 'Sort', type: 'select', titleMap: [] }
                    ]; break;
                    case 'PosInfoDetail_Excluded_Accounts': return [{ key: 'PosInfoDetailId', type: 'select', titleMap: [] }, { key: 'AccountId', type: 'select', titleMap: [] }]; break;
                    case 'AccountMapping': return [{ key: 'PosInfoId', type: 'select', titleMap: [] }, { key: 'AccountId', type: 'select', titleMap: [] }, 'PmsRoom', 'Description', 'Status']; break;
                    //lvl1 Transactions
                    case 'TransactionTypes': return [
                        { key: 'Code', type: 'select', titleMap: [] },
                        'Description', 'IsIncome']; break;
                    case 'Discount': return ['Description',
                        { key: 'Type', type: 'select', titleMap: [] },
                        'Amount', 'Status', 'Sort']; break;
                    case 'PredefinedCredits': return ['Description', 'Amount', { key: 'InvoiceTypeId', type: 'select', titleMap: [] }, 'InvoiceType']; break;
                    //lvl1 Staff
                    case 'Staff': return ['Code', 'FirstName', 'LastName', 'ImageUri', 'Password',
                        { key: 'StaffAuthorization', type: 'strapselect', options: { multiple: "true", }, titleMap: [] },
                        { key: 'StaffPositions', type: 'strapselect', options: { multiple: "true", }, titleMap: [] },
                        { key: 'StaffDaStores', type: 'strapselect', options: { multiple: "false", }, titleMap: [] },
                    ]; break;
                    case 'AuthorizedGroup': return ['Description', 'ExtendedDescription']; break;
                    case 'AuthorizedGroupDetail': return [{ key: 'AuthorizedGroupId', type: 'select', titleMap: [] }, { key: 'ActionId', type: 'select', titleMap: [] }]; break;
                    case 'StaffPosition': return ['Description']; break;
                    //lvl1 Sales
                    case 'ClientPos': return ['Code', 'Description',
                        { key: 'PosInfoId', type: 'select', titleMap: [] },
                        //{ key: 'Theme', type: 'select', titleMap: [] },
                        'Theme', 'LogInToOrder', 'Status']; break;
                    case 'PdaModule': return [{ key: 'PosInfoId', type: 'select', titleMap: [] }, 'Code', 'Description', { key: 'PageSetId', type: 'select', titleMap: [] }, 'MaxActiveUsers', 'Status']; break;
                    case 'Kitchen': return ['Code', 'Description', 'Status']; break;
                    case 'KitchenRegion': return ['ItemRegion', 'Abbr', 'RegionPosition']; break;
                    case 'KitchenInstruction': return ['Description',
                        {
                            key: 'KitchenId', type: 'select', titleMap: [], labelHtmlClass: "customFormSelect", fieldHtmlClass: "customFormSelect",
                        }, 'Message']; break;
                    case 'Kds': return ['Description', 'Status']; break;
                    case 'SalesType': return ['Id', 'Description', 'Abbreviation']; break;
                    case 'Payrole': return ['StaffId', { key: 'PosInfoId', type: 'select', titleMap: [] }, 'Type', 'ActionDate', 'Identification', 'ShopId']; break;
                    case 'Units': return ['Description', 'Abbreviation', 'Unit']; break;
                    case 'Categories': return ['Description', 'Status']; break;
                    case 'Items': return ['Description', 'ExtendedDescription', 'Qty', { key: 'UnitId', type: 'select', titleMap: [] }, { key: 'VatId', type: 'select', titleMap: [] }]; break;
                    case 'ProductCategories': return ['Code', 'Description', 'Abbreviation',
                        { key: 'CategoryId', type: 'select', titleMap: [] },
                        { key: 'Status', type: 'select', titleMap: [{ value: true, name: 'Enabled' }, { value: false, name: 'Disabled' }] }]; break;
                    case 'IngredientCategories': return ['Code', 'Description',
                        { key: 'Status', type: 'select', titleMap: [{ value: true, name: 'Enabled' }, { value: false, name: 'Disabled' }] },
                        { key: 'IsUnique', type: 'select', titleMap: [{ value: true, name: 'Yes' }, { value: false, name: 'No' }] }]; break;
                    case 'Ingredients': return [
                        'Code', { key: "Description", type: "text", copyValueTo: ["ExtendedDescription", "SalesDescription"] }, 'ExtendedDescription', 'SalesDescription',
                        //'Qty', { key: 'ItemId', type: 'select', titleMap: [] },
                        { key: 'UnitId', type: 'select', titleMap: [] },
                        { key: 'IngredientCategoryId', type: 'select', titleMap: [] }
                        // 'Background', 'Color'
                    ]; break;
                    case 'Combo': return [
                        'Description', 'StartDate', 'EndDate', 'StartTime', 'EndTime',
                        { key: 'ProductComboId', type: 'select', titleMap: [] },
                        { key: 'DepartmentId', type: 'select', titleMap: [] }
                    ]; break;
                    case 'ComboDetail': return [
                        { key: 'ComboId', type: 'select', titleMap: [] },
                        { key: 'ProductComboItemId', type: 'select', titleMap: [] }
                    ]; break;

                    default: break;
                }
            },
            //URL of Edit Schema and Form Options
            //https://github.com/Textalk/angular-schema-form/blob/master/docs/index.md#basic-usage
        }
    }])

    //{ key: 'ActivationDate', minDate: '01-09-1995'},// , maxDate: new Date(), format: 'yyyy-mm-dd' },
    //{ key: 'DeactivationDate', minDate: '01-09-1995' },//, maxDate: new Date(), format: 'dd-mm-yyyy'},

    //{
    //    key: "address.street",      // The dot notatin to the attribute on the model
    //    type: "text",               // Type of field
    //    title: "Street",            // Title of field, taken from schema if available
    //    notitle: false,             // Set to true to hide title
    //    description: "Street name", // A description, taken from schema if available, can be HTML
    //    validationMessage: "Oh noes, please write a proper address",  // A custom validation error message
    //    onChange: "valueChanged(form.key,modelValue)", // onChange event handler, expression or function
    //    feedback: false,             // Inline feedback icons
    //    disableSuccessState: false,  // Set true to NOT apply 'has-success' class to a field that was validated successfully
    //    disableErrorState: false,    // Set true to NOT apply 'has-error' class to a field that failed validation
    //    placeholder: "Input...",     // placeholder on inputs and textarea
    //    ngModelOptions: { ... },     // Passed along to ng-model-options
    //    readonly: true,              // Same effect as readOnly in schema. Put on a fieldset or array
    //    // and their items will inherit it.
    //    htmlClass: "street foobar",  // CSS Class(es) to be added to the container div
    //    fieldHtmlClass: "street"     // CSS Class(es) to be added to field input (or similar)
    //    labelHtmlClass: "street"     // CSS Class(es) to be added to the label of the field (or similar)
    //    copyValueTo: ["address.street"],     // Copy values to these schema keys.
    //    condition: "person.age < 18" // Show or hide field depending on an angular expression
    //    destroyStrategy: "remove"    // One of "null", "empty" , "remove", or 'retain'. Changes model on $destroy event. default is "remove".
    //}

    //http://brianhann.com/6-ways-to-take-control-of-how-your-ui-grid-data-is-displayed/
    ////column  function examples
    //{ field: 'getCurrency()' },
    //{ field: 'transformValue(row.entity.myField)' },
    ////cell css class
    //{ field: 'address', cellClass: 'address' }
    ////template as directive
    //{ field: 'name', cellTemplate: 'name-template.html' },
    //{ field: 'name', cellTemplate: 'myTemplateId' },
    //{ field: 'name', cellTemplate: $.get('url-to-your-template.html') }

    //{    field: 'image_url',    cellTemplate: '<div class="ui-grid-cell-contents"><img src="{{ COL_FIELD }}" /></div>'}


    //column definition privileges
    //http://ui-grid.info/docs/#/api/ui.grid.class:GridOptions.columnDef

    .factory('MSDynamicTypeGrid', ['uiGridGroupingConstants', function (uiGridGroupingConstants) {
        var TypeArray = [];
        return {
            getMSEditModel: function (tableType) {
                switch (tableType) {
                    case 'PosInfo':
                        return ({
                            addm: {
                                Type: "StepWizard",
                                Steps: [
                                    { Owner: 'master', StepName: 'formPosInfoStep0' }, { Owner: 'master', StepName: 'formPosInfoStep1' }, { Owner: 'master', StepName: 'formPosInfoStep2' },
                                    { Owner: 'master', StepName: 'formPosInfoStep3' }, { Owner: 'master', StepName: 'formPosInfoStep4' }, { Owner: 'master', StepName: 'formPosInfoStep5' }
                                ],
                                Deps: { toMaster: 0, toSlave: 0 }
                            },
                            editm: "", delm: ""
                        });
                        break;
                    case 'PosInfoDetail':
                        return ({
                            addm: {
                                Type: "SingleModal",
                                Steps: [{ Owner: 'slave', StepName: 'formPosInfoStep5' }],
                                Deps: { toMaster: 0, toSlave: 0 }
                            },
                            editm: "", delm: ""
                        });
                        break;
                    default: break;
                }
            },
            //getTittle: function (tableType) {            },
            getMSGridParams: function (tableType) {
                switch (tableType) {
                    case 'PosInfo': case 'PosInfoDetail':
                        return ({
                            enablePaging: true,
                            useExternalPagination: true,
                            paginationPageSizes: [25, 50, 75],
                            paginationPageSize: 25,
                            rowEditWaitInterval: -1, //use this to avoid save event wait until next edit .. 
                            enablePaginationControls: true, //pag buttons action
                            enableCellEditOnFocus: true, //on dblclick edit <!> Caution <!> with row edit enable u need to activate select box its the only way to select a row
                            enableSorting: true,
                            enableRowSelection: true,
                            multiSelect: false,
                            modifierKeysToMultiSelect: false,
                        }); break;
                    default: break;
                }
            },
            getMSColumns: function (tableType) {
                switch (tableType) {
                    case 'PosInfo':
                        return ({
                            columnDefs: [
                                //Id Code Description FODay CloseId IPAddress //Type WsIP WsPort  DepartmentId FiscalName //FiscalType IsOpen ReceiptCount ResetsReceiptCounter //Theme AccountId LogInToOrder ClearTableManually ViewOnly //IsDeleted InvoiceSumType 
                                { field: 'Id', name: 'Id', type: "number", enableCellEdit: false, visible: false, width: 100 },// enableCellEdit: false },
                                { field: 'Code', name: 'Code', type: "string", enableCellEditOnFocus: false, width: 100 },
                                {
                                    field: 'DefaultHotelId', name: 'Default Hotel', enableCellEditOnFocus: false,
                                    editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [], //this needs to init dynamically
                                    cellFilter: 'mapDropdown: row.grid.appScope.masterFiltersObjArray[\'DefaultHotelId\']:"Key":"Value"', width: 100
                                },
                                { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false, width: 100 },
                                {
                                    field: 'FODay', name: 'FODay', width: 100,// cellFilter: 'textDateFilter',
                                    enableCellEdit: true, enableCellEditOnFocus: true,
                                    cellFilter: 'textDate:"mediumDate"',
                                    editableCellTemplate: '<div><form name="inputForm"><div ui-grid-edit-datepicker ng-class="\'colt\' + col.uid"></div></form></div>'
                                },
                                { field: 'CloseIdId', name: 'CloseIdId', type: "number", enableCellEdit: false, visible: true, width: 100 },// enableCellEdit: false },
                                { field: 'IPAddress', name: 'IPAddress', type: "string", enableCellEditOnFocus: false, width: 100 },
                                {
                                    field: 'Type', name: 'Type', enableCellEditOnFocus: false,
                                    groupable: true, enableSorting: true, sortFn: function (a, b) { return a < b },
                                    grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'desc' },
                                    editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [], //this needs to init dynamically
                                    cellFilter: 'mapGroupDropdown: row.grid.appScope.dynamicEnumObjMaster[\'Type\']', width: 100
                                },
                                { field: 'WsIP', name: 'WsIP', type: "string", enableCellEditOnFocus: false, width: 100 },
                                { field: 'WsPort', name: 'WsPort', type: "string", enableCellEditOnFocus: false, width: 100 },
                                {
                                    field: 'DepartmentId', name: 'DepartmentId', enableCellEditOnFocus: false, editType: 'dropdown',
                                    editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [], //this needs to init dynamically
                                    cellFilter: 'mapDropdown: row.grid.appScope.masterFiltersObjArray[\'DepartmentId\']:"Key":"Value"', width: 100
                                },

                                { field: 'FiscalName', name: 'FiscalName', type: "string", enableCellEditOnFocus: false, width: 100 },
                                {
                                    field: 'FiscalType', name: 'FiscalType', enableCellEditOnFocus: false,
                                    groupingShowAggregationMenu: false, groupingShowGroupingMenu: false, enableHiding: false,
                                    editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                                    editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [], //this needs to init dynamically
                                    cellFilter: 'mapDropdown: row.grid.appScope.masterFiltersObjArray[\'FiscalType\']:"Key":"Value"', width: 100
                                },
                                {
                                    field: 'IsOpen', name: 'IsOpen', type: "boolean", enableCellEditOnFocus: false,
                                    editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                                    editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }],
                                    visible: true, width: 100
                                },
                                { field: 'ReceiptCount', name: 'ReceiptCount', type: "number", enableCellEditOnFocus: false, width: 100 },
                                {
                                    field: 'ResetsReceiptCounter', name: 'ResetsReceiptCounter', type: "boolean", enableCellEditOnFocus: false,
                                    editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                                    editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }],

                                    visible: true, width: 100
                                },
                                { field: 'Theme', name: 'Theme', type: "string", enableCellEditOnFocus: false, width: 100 },
                                {
                                    field: 'AccountId', name: 'AccountId', enableCellEditOnFocus: false,
                                    editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [], //this needs to init dynamically
                                    cellFilter: 'mapDropdown: row.grid.appScope.masterFiltersObjArray[\'AccountId\']:"Key":"Value"', width: 100
                                },
                                {
                                    field: 'ClearTableManually', name: 'ClearTableManually', type: "boolean", enableCellEditOnFocus: false,
                                    editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                                    editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }],

                                    visible: true, width: 100
                                },
                                {
                                    field: 'ViewOnly', name: 'ViewOnly', type: "boolean", enableCellEditOnFocus: false,
                                    editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                                    editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }],
                                    visible: true, width: 100
                                },
                                {
                                    field: 'IsDeleted', name: 'IsDeleted', type: "boolean", enableCellEditOnFocus: false,
                                    editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                                    editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }],
                                    visible: false, width: 100
                                },
                                {
                                    field: 'KeyboardType', name: 'KeyboardType', enableCellEditOnFocus: false,
                                    editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [], //this needs to init dynamically
                                    cellFilter: 'mapDropdown: row.grid.appScope.masterFiltersObjArray[\'KeyboardType\']:"Key":"Value"', width: 100
                                },

                                {
                                    field: 'LoginToOrderMode', name: 'LoginToOrderMode', enableCellEditOnFocus: false,
                                    editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [], //this needs to init dynamically
                                    cellFilter: 'mapDropdown: row.grid.appScope.masterFiltersObjArray[\'LoginToOrderMode\']:"Key":"Value"', width: 100
                                },
                                { field: 'CustomerDisplayGif', name: 'Customer Display gif', type: "string", enableCellEditOnFocus: false, width: 100 },
                                { field: 'NfcDevice', name: 'NFC Device', type: "string", enableCellEditOnFocus: false, width: 100 },
                                {
                                    field: 'Configuration', name: 'Configuration', enableCellEditOnFocus: false,
                                    editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownIdLabel: 'Value', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [], //this needs to init dynamically
                                    width: 100
                                },


                            ]
                        }); break;
                    case 'PosInfoDetail':
                        return ({

                            columnDefs: [{ field: 'Id', displayName: 'Id', type: "number", enableCellEdit: false, visible: false, width: 100 },
                            {
                                field: 'InvoicesTypeId', name: 'Invoice Type', enableCellEditOnFocus: false,
                                groupable: true, enableSorting: true, sortFn: function (a, b) { return a < b },
                                grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'desc' },
                                editableCellTemplate: 'ui-grid/dropdownEditor',
                                editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value', editDropdownOptionsArray: [], //this needs to init dynamically
                                cellFilter: 'mapGroupDropdown: row.grid.appScope.dynamicEnumObjSlave[\'InvoicesTypeId\']', width: 100

                            },

                            {
                                field: 'GroupId', name: 'GroupId', type: "number", enableCellEditOnFocus: false, width: 100, editable: false,
                                minimum: 0, maximum: 20, validationMessage: "Please select a Fiscal Slot [1..20]."
                            },
                            { field: 'Counter', name: 'Counter', type: "number", enableCellEditOnFocus: false, width: 100 },
                            { field: 'Abbreviation', name: 'Abbreviation', type: "string", enableCellEditOnFocus: false, width: 100 },
                            { field: 'Description', name: 'Description', type: "string", enableCellEditOnFocus: false, width: 100 },
                            {
                                field: 'ResetsAfterEod', name: 'ResetsAfterEod', type: "boolean", enableCellEditOnFocus: false,
                                editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                                editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }],
                                visible: true, width: 100
                            },
                            { field: 'InvoiceId', name: 'Fiscal Slot', type: "number", enableCellEditOnFocus: false, width: 100, },
                            { field: 'ButtonDescription', name: 'ButtonDescription', type: "string", enableCellEditOnFocus: false, width: 100 },
                            {
                                field: 'Status', name: 'Status', type: "boolean", enableCellEditOnFocus: false, editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                                editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }],
                                visible: true, width: 100
                            },
                            {
                                field: 'FiscalType', name: 'FiscalType', editableCellTemplate: 'ui-grid/dropdownEditor',
                                editDropdownIdLabel: 'Key', editDropdownValueLabel: 'Value',
                                editDropdownOptionsArray: [], //this needs to init dynamically
                                cellFilter: 'mapDropdown: row.grid.appScope.slaveFiltersObjArray[\'FiscalType\']:"Key":"Value"', width: 100
                            },
                            {
                                field: 'IsInvoice', name: 'IsInvoice', type: "boolean", enableCellEditOnFocus: false, editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                                editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }],
                                visible: true, width: 100
                            },
                            {
                                field: 'CreateTransaction', name: 'CreateTransaction', type: "boolean", enableCellEditOnFocus: false, editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                                editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }],
                                visible: true, width: 100
                            },
                            {
                                field: 'IsCancel', name: 'IsCancel', type: "boolean", enableCellEditOnFocus: false, editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                                editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }],
                                visible: true, width: 100
                            },
                            {
                                field: 'IsPdaHidden', name: 'IsPdaHidden', type: "boolean", enableCellEditOnFocus: false, editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                                editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }],
                                visible: true, width: 100
                            },
                            {
                                field: 'SendsVoidToKitchen', name: 'SendsVoidToKitchen', type: "boolean", enableCellEditOnFocus: false, editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                                editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }],
                                visible: true, width: 100
                            },
                            {
                                field: 'PMSInvoiceId', name: 'PMS Invoice', type: "number", enableCellEditOnFocus: false, editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: 'mapDropdown: row.grid.appScope.slaveFiltersObjArray[\'PMSInvoiceId\']:"Key":"Value"',
                                editDropdownIdLabel: "Key", editDropdownValueLabel: "Value", editDropdownOptionsArray: [],
                                visible: true, width: 100
                            },
                            { field: 'Background', name: 'Background', type: "string", enableCellEditOnFocus: false, visible: false },
                            { field: 'Color', name: 'Color', type: "string", enableCellEditOnFocus: false, visible: false },
                            {
                                field: 'Colors', name: 'Colors', type: "string", enableCellEdit: false, enableCellEditOnFocus: false, width: 100,
                                cellTemplate: '<div class="ui-grid-cell-contents" style="text-align: center;">' +
                                '<button type="button"class="btn btn-xs" style="background-color:{{row.entity.Background || \'#dae0e0\'}}; color:{{row.entity.Color || \'black\'}};" ng-click="grid.appScope.colorPickerModal(row)">Text</div>'
                            }
                            ]
                        }); break;
                    default: break;
                }
            },
            getMSeditRowModel: function (tableType) {
                switch (tableType) {
                    case 'PosInfo':
                        var stepWizardModelArray = [];
                        //step1 General
                        var schemaS0 = {
                            type: 'object',
                            properties: {
                                Type: { "title": 'Type', "type": 'number', "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Type...', "nullLabel": '---', },
                                Code: {
                                    type: 'string', title: 'Code', minLength: 1, maxLength: 3,
                                    validationMessage: "Abbreviation length of must be 2-3 Chars.",
                                    description: "Add an Abbreviation of 2-3 characters.",
                                    validators: {
                                        notEmpty: { message: 'The cell Code number is required' }
                                    }
                                },
                                Description: { type: 'string', title: 'Description', validationMessage: "You need to add a Desciption." },
                                DepartmentId: { "title": 'DepartmentId', "type": 'number', "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Action...', "nullLabel": '---', },
                                Theme: { type: 'string', title: 'Theme', validationMessage: "You need to add a Theme." }, //datepicker
                                //Theme: { type: 'string', title: 'Theme', htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select Theme...', "nullLabel": '---', validationMessage: "You need to add a Theme." }, //datepicker
                                IsOpen: { type: 'boolean', title: 'IsOpen' }
                            },
                            required: ['Type', 'Code', 'Description', 'DepartmentId']
                        };
                        var formS0 = [{ key: 'Type', type: 'select', titleMap: [] }, 'Code', 'Description', { key: 'DepartmentId', type: 'select', titleMap: [] },
                            //{ key: 'Theme', type: 'select', titleMap: ['Light', 'Dark'] }
                            'Theme',
                            , 'IsOpen'];
                        var entityS0 = { 'Type': '', 'Code': '', 'Description': '', 'DepartmentId': '', 'Theme': 'Light', 'IsOpen': false };

                        var stepWizardModel = {
                            modelStep: 0, modelStepName: 'General', modelEntity: 'PosInfo', //dbtable/controllerref
                            gridOwner: 'master', modelFormName: 'formPosInfoStep0',
                            schema: schemaS0, form: formS0, entity: entityS0,
                        };
                        stepWizardModelArray.push(stepWizardModel);
                        //step2 Receipts 
                        var schemaS1 = {
                            type: 'object',
                            properties: {
                                FiscalType: { "title": 'FiscalType', "type": 'number', "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Action...', "nullLabel": '---', validationMessage: "Please Select a field from the list." },

                                FiscalName: { type: 'string', title: 'FiscalName', validationMessage: "You need to add a FiscalName." }, //datepicker
                                ReceiptCount: { type: 'number', title: 'Order Count' },
                                ResetsReceiptCounter: { type: 'boolean', title: 'ResetsReceiptCounter' }
                            },
                            required: ['FiscalType', 'FiscalName', 'ReceiptCount']
                        };
                        var formS1 = [{ key: 'FiscalType', type: 'select', titleMap: [] }, 'FiscalName', 'ReceiptCount', 'ResetsReceiptCounter'];
                        var entityS1 = { 'FiscalType': '', 'FiscalName': '', 'ReceiptCount': '', 'ResetsReceiptCounter': false };

                        stepWizardModel = {
                            modelStep: 1, modelStepName: 'Receipts', modelEntity: 'PosInfo', //dbtable/controllerref
                            gridOwner: 'master', modelFormName: 'formPosInfoStep1',
                            schema: schemaS1, form: formS1, entity: entityS1,
                        };
                        stepWizardModelArray.push(stepWizardModel);
                        //step3 Order  
                        var schemaS2 = {
                            type: 'object',
                            properties: {
                                AccountId: { "title": 'AccountId', "type": 'number', "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Account...', "nullLabel": '---', },
                                KeyboardType: { title: 'KeyboardType', type: 'number', htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select Keyboard...', nullLabel: '---', validationMessage: "Please Select a field from the list." },
                                LoginToOrderMode: { title: 'LoginToOrderMode', type: 'number', htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select Login to order...', nullLabel: '---', validationMessage: "Please Select a field from the list." },
                                DefaultHotelId: { title: 'DefaultHotel', type: 'number', htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select Login to order...', nullLabel: '---', validationMessage: "Please Select a HotelId from the list." },
                                CustomerDisplayGif: { type: 'string', title: 'CustomerDisplayGif', validationMessage: "You need to add a CustomerDisplayGif." },
                                NfcDevice: { type: 'string', title: 'NfcDevice', validationMessage: "You need to add a NfcDevice." }, //datepicker
                                Configuration: { "title": 'Configuration', "type": 'number', "htmlClass": 'customFormSelect', format: 'uiselect', placeholder: 'Select Configuration...', nullLabel: '---', validationMessage: "Please Select a field from the list." },
                            },
                            required: ['AccountId', 'KeyboardType', 'LoginToOrderMode']
                        };

                        var formS2 = [{ key: 'AccountId', type: 'select', titleMap: [] }, { key: 'KeyboardType', type: 'select', titleMap: [] }, { key: 'LoginToOrderMode', type: 'select', titleMap: [] }, { key: 'DefaultHotelId', type: 'select', titleMap: [] }, 'ClearTableManually', 'CustomerDisplayGif', 'NfcDevice', { key: 'Configuration', type: 'select', titleMap: [] }];
                        var entityS2 = { 'AccountId': '', 'KeyboardType': '', 'LoginToOrderMode': '' };

                        stepWizardModel = {
                            modelStep: 2, modelStepName: 'Order', modelEntity: 'PosInfo', //dbtable/controllerref
                            gridOwner: 'master', modelFormName: 'formPosInfoStep2',
                            schema: schemaS2, form: formS2, entity: entityS2,
                        };
                        stepWizardModelArray.push(stepWizardModel);
                        //step4 Communication  
                        var schemaS3 = {
                            type: 'object',
                            properties: {
                                WsIP: {
                                    type: 'string', title: 'WsIP', validationMessage: "Please insert a WsIP in IPv4 format. (255.255.255.255)",
                                    pattern: '/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/', //IPV4 pattern
                                }, //datepicker
                                WsPort: { type: 'string', title: 'WsPort', validationMessage: "You need to register a WsPort." }, //datepicker
                                IPAddress: {
                                    type: 'string', title: 'IPAddress', validationMessage: "Please insert an IPAddress in IPv4 format. (255.255.255.255)",
                                    pattern: '/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/'
                                }
                            },
                            required: ['IPAddress']//'WsIP', 'WsPort', 
                        };
                        var formS3 = ['WsIP', 'WsPort', 'IPAddress'];
                        var entityS3 = { 'WsIP': '', 'WsPort': '', 'IPAddress': '' };
                        stepWizardModel = {
                            modelStep: 3, modelStepName: 'Communication', modelEntity: 'PosInfo', //dbtable/controllerref
                            gridOwner: 'master', modelFormName: 'formPosInfoStep3',
                            schema: schemaS3, form: formS3, entity: entityS3,
                        };
                        stepWizardModelArray.push(stepWizardModel);
                        //step5 Store 
                        var schemaS4 = {
                            type: 'object',
                            properties: {
                                FODay: { type: 'string', title: 'FODay', format: "date", validationMessage: "You need to add a FODay." },
                                //   { type: 'string', title: 'FODay', validationMessage: "You need to add a FODay."}, //datepicker      { type: 'string', title: 'FODay', format: "yyyy-mm-dd" },
                                CloseIdId: { type: 'string', title: 'CloseIdId', validationMessage: "Please enter a close ID." }, //datepicker
                                //ViewOnly: { type: 'boolean', title: 'ViewOnly' }
                            },
                            required: ['FODay', 'CloseIdId']
                        };
                        var entityS4 = { 'FODay': '', 'CloseIdId': 0 }; //, 'ViewOnly': false, };
                        var formS4 = [
                            //{ key: "FODay", type: "template" },
                            'FODay',
                            'CloseIdId'];//, 'ViewOnly'];
                        stepWizardModel = {
                            modelStep: 4, modelStepName: 'Store', modelEntity: 'PosInfo', //dbtable/controllerref
                            gridOwner: 'master', modelFormName: 'formPosInfoStep4',
                            schema: schemaS4, form: formS4, entity: entityS4,
                        };
                        stepWizardModelArray.push(stepWizardModel);

                        var schemaS5 = {
                            type: 'object',
                            properties: {
                                PidTemplateTransactionTypeEnum: { type: 'number', htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select TemplateType...', nullLabel: '---', }
                            }
                        }
                        var formS5 = [{ key: 'PidTemplateTransactionTypeEnum', type: 'select', titleMap: [], notitle: true, feedback: false }]
                        var entityS5 = { 'PidTemplateTransactionTypeEnum': null };
                        stepWizardModel = {
                            modelStep: 5, modelStepName: 'Detail Templates', modelEntity: 'PosInfo', //dbtable/controllerref
                            gridOwner: 'master', modelFormName: 'formPosInfoStep5',
                            schema: schemaS5, form: formS5, entity: entityS5, entriesArray: []
                        };
                        stepWizardModelArray.push(stepWizardModel);

                        return stepWizardModelArray; break;

                    case 'PosInfoDetail':
                        var stepWizardModelArray = [];
                        var schemaS5 = {
                            type: 'object',
                            properties: {
                                //datepicker      { type: 'string', title: 'FODay', format: "yyyy-mm-dd" },
                                PosInfoId: { "title": 'PosInfoId', "type": 'number', "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Type...', "nullLabel": '---', },
                                Counter: { type: 'number', title: 'Counter', validationMessage: "Please enter a close ID." },
                                Abbreviation: {
                                    type: 'string', title: 'Code', minLength: 1, maxLength: 3, validationMessage: "Abbreviation length of must be 2-3 Chars.",
                                    description: "Add an Abbreviation of 2-3 characters.", validators: { notEmpty: { message: 'The cell Abbreviation is required' } }
                                },
                                Description: { type: 'string', title: 'Description', validationMessage: "You need to add a POSInfo Detail Desciption." },
                                ResetsAfterEod: { type: 'boolean', title: 'ResetsAfterEod' },

                                InvoicesTypeId: {
                                    title: 'InvoiceTypeId', type: 'number', htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select Invoice Type...', nullLabel: '---',
                                    validationMessage: "Please select an Invoice Type ID.",

                                },
                                GroupId: { type: 'number', title: 'GroupId' },
                                InvoiceId: { type: 'number', title: 'InvoiceId' },

                                ButtonDescription: { type: 'string', title: 'ButtonDescription', validationMessage: "Please enter a description for Button." }, //datepicker
                                Status: { type: 'boolean', title: 'Status' },
                                FiscalType: { "title": 'FiscalType', "type": 'number', "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Action...', "nullLabel": '---', },
                                IsInvoice: { type: 'boolean', title: 'IsInvoice' },
                                CreateTransaction: { type: 'boolean', title: 'CreateTransaction' },
                                IsCancel: { type: 'boolean', title: 'IsCancel' },
                                IsPdaHidden: { type: 'boolean', title: 'IsPdaHidden' },
                                SendsVoidToKitchen: { type: 'boolean', title: 'SendsVoidToKitchen' },
                                //PMSInvoiceId: {
                                //    "title": 'PMS Invoice',
                                //    "type": 'number',
                                //    "htmlClass": 'customFormSelect',
                                //    "format": 'uiselect',
                                //    "placeholder": 'Select type...',
                                //    "nullLabel": '---',
                                //}
                                Colors: { field: 'Color', name: 'Color', type: "string", enableCellEditOnFocus: false, visible: false },
                                Background: { type: "string", title: 'Background' },
                                Color: { type: "string", title: 'Color' }
                            },
                            required: ['InvoicesTypeId', 'InvoiceId', 'PosInfoId', 'Counter', 'Abbreviation', 'Description', 'ButtonDescription', 'FiscalType']
                        };
                        var entityS5 = { 'InvoicesTypeId': '', 'GroupId': null, 'InvoiceId': '', 'PosInfoId': '', 'Counter': '', 'Abbreviation': '', 'Description': '', 'ResetsAfterEod': false, 'ButtonDescription': '', 'Status': false, 'FiscalType': '', 'IsInvoice': false, 'CreateTransaction': false, 'IsCancel': false, 'IsPdaHidden': false, 'SendsVoidToKitchen': true, 'Colors': '', 'Background': '', 'Color': '' };//, 'PMSInvoiceId': ''
                        var formS5 = [
                            {
                                key: 'InvoicesTypeId', type: 'select', titleMap: [], onChange: "valueChanged(form.key,modelValue)"
                            },
                            'InvoiceId', 'Counter', 'Abbreviation', 'Description', 'ResetsAfterEod', 'ButtonDescription', 'Status', { key: 'FiscalType', type: 'select', titleMap: [] }, 'IsInvoice', 'CreateTransaction', 'IsCancel', 'IsPdaHidden', 'SendsVoidToKitchen', 'Colors'];//, { key: 'PMSInvoiceId', type: 'select', titleMap: [] }

                        var stepWizardModel = {
                            modelStep: 5, modelStepName: 'Details Insertion', modelEntity: 'PosInfoDetail', //dbtable/controllerref
                            gridOwner: 'slave', modelFormName: 'formPosInfoStep5',
                            schema: schemaS5, form: formS5, entity: entityS5,
                        };
                        stepWizardModelArray.push(stepWizardModel);

                        return stepWizardModelArray; break;
                    default: break;
                }

                //URL of Edit Schema and Form Options
                //https://github.com/Textalk/angular-schema-form/blob/master/docs/index.md#basic-usage
            }
        }
    }])

    .factory('ProductsTypeGrid', ['uiGridGroupingConstants', 'uiGridConstants', '$q', '$timeout', function (uiGridGroupingConstants, uiGridConstants, $q, $timeout) {
        var TypeArray = [];
        return {
            getGridParams: function () {
                return ({
                    productGrid: {
                        enablePaging: true, useExternalPagination: true,
                        paginationPageSizes: [20, 50, 75], paginationPageSize: 20,
                        paginationCurrentPage: 1,
                        rowEditWaitInterval: -1, //use this to avoid save event wait until next edit .. 
                        enablePaginationControls: true, //pag buttons action
                        // rowTemplate: '<div ng-dblclick="grid.appScope.rowDblClick(row)" >' +
                        //'<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
                        //'</div>',
                        enableCellEditOnFocus: true,//on dblclick edit <!> Caution <!> with row edit enable u need to activate select box its the only way to select a row
                        enableSorting: true, sortingOrder: ['desc', 'asc', null],
                        enableRowSelection: true, multiSelect: false, modifierKeysToMultiSelect: false,
                        enableFiltering: true, noUnselect: true, enableCellNav: false, enableCellEdit: false,
                        columnDefs: [
                            { field: 'Id', name: 'Id', enableCellEdit: false, width: 50 },
                            {
                                field: 'SalesDescription', name: 'SalesDescription', type: 'string', enableCellEdit: true,
                                sortingAlgorithm: function (a, b) {
                                    if (a == b) return 0;
                                    if (a < b) return -1;
                                    if (a === undefined || a === null || a == "") return -1;
                                    if (b === undefined || b === null || b == "") return 1;
                                    return 1;
                                },
                                sort: { direction: uiGridConstants.ASC, priority: 0 }
                            },
                            {
                                field: 'Code', name: 'Code', type: 'string', enableCellEdit: true, sortingAlgorithm: function (a, b) {
                                    if (a == b) return 0;
                                    if (a < b) return -1;
                                    if (a === undefined || a === null || a == "") return -1;
                                    if (b === undefined || b === null || b == "") return 1;
                                    return 1;
                                },
                                sort: { direction: uiGridConstants.ASC, priority: 0 }
                            },
                            {
                                field: 'ProductCategoryId', name: 'ProductCategory', enableCellEdit: true, enableColumnMenu: false,
                                filter: { type: uiGridConstants.filter.SELECT, selectOptions: [] },
                                editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                                editDropdownIdLabel: 'Id', editDropdownValueLabel: 'Description', editDropdownOptionsArray: [],//$scope.productCategoryLookupResults, //this needs to init dynamically
                                cellFilter: 'mapDropdown: row.grid.appScope.productCategoryLookupResults:"Id":"Description"' //working
                            },
                            //{ name: 'EntityStatus', enableCellEdit: false, default: -1 }
                        ]
                    },
                    recipesGrid: {
                        rowEditWaitInterval: -1, //use this to avoid save event wait until next edit .. 
                        enablePaginationControls: false, //pag buttons action
                        enableCellEditOnFocus: true, //on dblclick edit <!> Caution <!> with row edit enable u need to activate select box its the only way to select a row
                        enableSorting: true, enableRowSelection: true, multiSelect: false, modifierKeysToMultiSelect: false,
                        showGridFooter: true, noUnselect: true,
                        gridFooterTemplate: '<div class="col-md-12 col-xs-12 customGridFooter">' +//hvr-icon-float-away
                        '<button type="button" class="btn btn-sm btn-customBlack" ng-click=grid.appScope.addRecipe()>Add Row &nbsp;<i class="fa fa-plus-circle fa-fw"></i></button>' +
                        '<div class="pull-right" style="width: 100%; text-align: right;">' +
                        '<strong style="width: 100%; vertical-align: middle;">Total Items: <span>{{grid.appScope.recipesGrid.data.length}}</span></strong>' +
                        '</div></div>',
                        columnDefs: [
                            { field: 'Id', name: 'Id', enableCellEdit: false, visible: false },
                            { field: 'ProductId', name: 'ProductId', enableCellEdit: false, visible: false },
                            { field: 'Qty', name: 'Qty', type: "number", enableCellEditOnFocus: false },
                            {
                                field: 'UnitId', name: 'Unit', enableCellEditOnFocus: false,
                                editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                                editDropdownIdLabel: 'Id', editDropdownValueLabel: 'Description', editDropdownOptionsArray: [], //this needs to init dynamically
                                cellFilter: 'mapDropdown: row.grid.appScope.unitsLookupResults:"Id":"Description"' //working
                            },
                            //{ field: 'IngredientId', name: 'IngredientId',  type: "number", enableCellEditOnFocus: false },
                            {
                                field: 'IngredientId', name: 'Ingredient', enableCellEditOnFocus: false,
                                editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                                editDropdownIdLabel: 'Id', editDropdownValueLabel: 'Description', editDropdownOptionsArray: [],//$scope.ingredientsLookupResults, //this needs to init dynamically
                                cellFilter: 'mapDropdown: row.grid.appScope.ingredientsLookupResults:"Id":"Description"' //working
                            },
                            { field: 'DefaultQty', name: 'DefaultQty', type: "number", enableCellEditOnFocus: false },
                            { field: 'MinQty', name: 'MinQty', type: "number", enableCellEditOnFocus: false },
                            { field: 'MaxQty', name: 'MaxQty', type: "number", enableCellEditOnFocus: false },
                            {
                                name: 'Action', enableCellEdit: false,
                                cellTemplate: '<div class="ui-grid-cell-contents">' +// hvr-icon-spin//hvr-icon-sink-away
                                //'<button type="button"class="btn btn-xs btn-primary" ng-if="row.entity.EntityStatus!=0" ng-click="grid.appScope.refreshRow(\'recipe\',row)"><i class="fa fa-refresh"></i></button>' +
                                '<button type="button"class="btn btn-xs btn-danger" ng-click="grid.appScope.removeRecipe(row)"><i class="fa fa-trash-o"></i></button></div>'
                            },
                            //{ name: 'EntityStatus', enableCellEdit: false, default: -1 }

                        ]
                    },
                    extrasGrid: {
                        rowEditWaitInterval: -1, //use this to avoid save event wait until next edit .. 
                        enablePaginationControls: false, //pag buttons action
                        enableCellEditOnFocus: true, //on dblclick edit <!> Caution <!> with row edit enable u need to activate select box its the only way to select a row
                        enableSorting: true, enableRowSelection: true, multiSelect: false, modifierKeysToMultiSelect: false,
                        showGridFooter: true, noUnselect: true,
                        gridFooterTemplate: '<div class="col-md-12 col-xs-12 customGridFooter">' +//hvr-icon-float-away
                        '<button type="button" class="btn btn-sm btn-customBlack" ng-click=grid.appScope.addExtras()>Add Row &nbsp;<i class="fa fa-plus-circle fa-fw"></i></button>' +
                        '<div class="pull-right" style="width: 100%; text-align: right;">' +
                        '<strong style="width: 100%; vertical-align: middle;">Total Items: <span>{{grid.appScope.extrasGrid.data.length}}</span></strong>' +
                        '</div></div>',
                        columnDefs: [
                            { field: 'Id', name: 'Id', enableCellEdit: false, visible: false },
                            { field: 'ProductId', name: 'ProductId', enableCellEdit: false, visible: false },
                            {
                                field: 'UnitId', name: 'Unit', enableCellEditOnFocus: false,
                                editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                                editDropdownIdLabel: 'Id', editDropdownValueLabel: 'Description', editDropdownOptionsArray: [], //this needs to init dynamically
                                cellFilter: 'mapDropdown: row.grid.appScope.unitsLookupResults:"Id":"Description"' //working
                            },
                            {
                                field: 'IngredientId', name: 'Ingredient', enableCellEditOnFocus: false,
                                editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                                editDropdownIdLabel: 'Id', editDropdownValueLabel: 'Description', editDropdownOptionsArray: [],// $scope.ingredientsLookupResults, //this needs to init dynamically
                                cellFilter: 'mapDropdown: row.grid.appScope.ingredientsLookupResults:"Id":"Description"' //working
                            },
                            {
                                field: 'IsRequired', name: 'IsRequired', type: "boolean", //cellFilter: 'boolValEnumeration',
                                enableCellEdit: true, enableCellEditOnFocus: false,
                                editableCellTemplate: "ui-grid/dropdownEditor", cellFilter: "boolValEnumeration",
                                editDropdownIdLabel: 'id', editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: true, bool: 'Yes' }, { id: false, bool: 'No' }],
                                //editDropdownValueLabel: "bool", editDropdownOptionsArray: [{ id: 1, bool: 'Yes' }, { id: 2, bool: 'No' }]
                                //editableCellTemplate: '<input type="checkbox" ng-model="row.entity.IsRequired" grid-cell-checkbox="row.entity.IsRequired" />'//'editCheckBox.html'
                                //editableCellTemplate: '<input type="checkbox" ng-model="row.entity.IsRequired">'
                            },
                            { field: 'MinQty', name: 'MinQty', type: "number", enableCellEditOnFocus: false },
                            { field: 'MaxQty', name: 'MaxQty', type: "number", enableCellEditOnFocus: false },
                            { field: 'Sort', name: 'Sort', type: "number", enableCellEditOnFocus: false },
                            {
                                name: 'Action', enableCellEdit: false,
                                cellTemplate: '<div class="ui-grid-cell-contents">' +// hvr-icon-spin//hvr-icon-sink-away
                                //'<button type="button"class="btn btn-xs btn-primary" ng-if="row.entity.EntityStatus!=0" ng-click="grid.appScope.refreshRow(\'extras\',row)"><i class="fa fa-refresh"></i></button>' +
                                '<button type="button"class="btn btn-xs btn-danger" ng-click="grid.appScope.removeExtras(row)"><i class="fa fa-trash-o"></i></button>'
                                + '</div>'
                            },
                            //{ name: 'EntityStatus', enableCellEdit: false, default: -1 }

                        ]
                    },
                    barcodesGrid: {
                        rowEditWaitInterval: -1, //use this to avoid save event wait until next edit .. 
                        enablePaginationControls: false, //pag buttons action
                        enableCellEditOnFocus: true, //on dblclick edit <!> Caution <!> with row edit enable u need to activate select box its the only way to select a row
                        enableSorting: true, enableRowSelection: true, multiSelect: false, modifierKeysToMultiSelect: false,
                        showGridFooter: true, noUnselect: true,
                        gridFooterTemplate: '<div class="col-md-12 col-xs-12 customGridFooter">' +//hvr-icon-float-away
                        '<button type="button" class="btn btn-sm btn-customBlack" ng-click=grid.appScope.addBarcode()>Add Row &nbsp;<i class="fa fa-plus-circle fa-fw"></i></button>' +
                        '<div class="pull-right" style="width: 100%; text-align: right;">' +
                        '<strong style="width: 100%; vertical-align: middle;">Total Items: <span>{{grid.appScope.barcodesGrid.data.length}}</span></strong>' +
                        //'<button type="button" class="btn btn-xs btn-danger" ng-click=grid.appScope.removeExtras()  ng-class="(grid.appScope.selectedRowExtras == null) ? \'disabled\' : \'\'"><i class="fa fa-trash-o fa-fw"></i></button>' +
                        '</div></div>',
                        columnDefs: [
                            { field: 'Id', name: 'Id', enableCellEdit: false, visible: false },
                            { field: 'ProductId', name: 'ProductId', enableCellEdit: false, visible: false },
                            { field: 'Barcode', name: 'Barcode', type: "string", enableCellEditOnFocus: false },
                            {
                                name: 'Action', enableCellEdit: false,
                                cellTemplate: '<div class="ui-grid-cell-contents">' +// hvr-icon-spin//hvr-icon-sink-away
                                //'<button type="button"class="btn btn-xs btn-primary" ng-if="row.entity.EntityStatus!=0" ng-click="grid.appScope.refreshRow(\'barcode\',row)"><i class="fa fa-refresh"></i></button>' +
                                '<button type="button"class="btn btn-xs btn-danger " ng-click="grid.appScope.removeBarcode(row)"><i class="fa fa-trash-o"></i></button></div>'
                            },
                            //{ name: 'EntityStatus', enableCellEdit: false, default: -1 }

                        ]
                    }
                });
            },
            getOverviewSFE: function (type, tmap) {
                return ({
                    overviewEntity: { 'Description': '', 'ProductCategoryId': null, 'SalesDescription': '', 'ExtraDescription': '', 'Code': '', 'ImageUrl': '', 'UnitId': null, 'IsReturnItem': false, 'IsCustom': false, 'SalesTypeId': null, 'KitchenId': null, 'KdsId': null, 'KitchenRegionId': null, 'PreparationTime': '' },
                    overviewForm: [
                        {
                            type: "section", htmlClass: "row",
                            items: [
                                { type: "section", htmlClass: "col-xs-6", items: [{ key: "Description", onChange: "overviewChanged(form.key,modelValue)" }, { key: "ExtraDescription", onChange: "overviewChanged(form.key,modelValue)" }] },
                                { type: "section", htmlClass: "col-xs-6", items: [{ key: "ProductCategoryId", type: 'select', titleMap: tmap.ProductCategoryId, onChange: "overviewChanged(form.key,modelValue)" }, { key: "SalesDescription", onChange: "overviewChanged(form.key,modelValue)" }] }
                            ]
                        },
                        {
                            type: "section", htmlClass: "row",
                            items: [
                                {
                                    type: "section", htmlClass: "col-xs-6", items: [{
                                        key: "Code", onChange: "overviewChanged('Code',modelValue)",
                                        //validationMessage: {
                                        //    //'empty': 'You need to add a unique Code.',
                                        //    'allready': 'Code of product is already taken.'
                                        //},
                                        //ngModelOptions: {
                                        //    allowInvalid: true
                                        //},
                                        //$validators: {
                                        //    'empty': function (value) {
                                        //        if (angular.isString(value) && value.length > 0)
                                        //            return true;
                                        //        else
                                        //            return false;
                                        //    },
                                        //},
                                        //$asyncValidators: {
                                        //    allready: function (value) {
                                        //        checkSameBarcode();
                                        //        //var deferred = $q.defer();
                                        //        //$timeout(function () {
                                        //        //    if (angular.isString(value) && value.indexOf('bob') !== -1) {
                                        //        //        deferred.reject();
                                        //        //    } else {
                                        //        //        deferred.resolve();
                                        //        //    }
                                        //        //}, 500);
                                        //        //return deferred.promise;
                                        //    }
                                        //}
                                    }]
                                },
                                { type: "section", htmlClass: "col-xs-6", items: [{ key: "ImageUri", onChange: "overviewChanged(form.key,modelValue)" }] }
                            ]
                        },
                        {
                            type: "section", htmlClass: "row",
                            items: [
                                { type: "section", htmlClass: "col-xs-4", items: [{ key: "UnitId", type: "select", titleMap: tmap.UnitId, onChange: "overviewChanged(form.key,modelValue)" }] },
                                { type: "section", htmlClass: "col-xs-4", items: [{ key: "IsReturnItem", onChange: "overviewChanged(form.key,modelValue)" }] },
                                { type: "section", htmlClass: "col-xs-4", items: [{ key: "IsCustom", onChange: "overviewChanged(form.key,modelValue)" }] }
                            ]
                        },
                        {
                            type: "section", htmlClass: "row",
                            items: [
                                { type: "section", htmlClass: "col-xs-4", items: [{ key: "KitchenId", type: 'select', titleMap: tmap.KitchenId, onChange: "overviewChanged(form.key,modelValue)" }] },
                                { type: "section", htmlClass: "col-xs-4", items: [{ key: "KdsId", type: 'select', titleMap: tmap.KdsId, onChange: "overviewChanged(form.key,modelValue)" }] },
                                { type: "section", htmlClass: "col-xs-4", items: [{ key: "PreparationTime", onChange: "overviewChanged(form.key,modelValue)" }] }
                            ]
                        },
                        { key: 'KitchenRegionId', type: 'select', titleMap: tmap.KitchenRegionId, onChange: "overviewChanged(form.key,modelValue)" },
                    ],

                    overviewSchema: {
                        type: 'object',
                        properties: {
                            Description: { type: 'string', title: 'Description' },
                            SalesDescription: { type: 'string', title: 'SalesDescription' },
                            ExtraDescription: { type: 'string', title: 'Extra Description', validationMessage: "You need to add a Desciption." },
                            ProductCategoryId: { "title": 'Product Category', "type": 'number', "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Catgory...', "nullLabel": '---', },
                            Code: {
                                type: 'string', title: 'Code',

                            },
                            ImageUri: { type: ["null", "string"], title: 'ImageUri', validationMessage: "You need to add an Image." },
                            UnitId: { type: ["null", "number"], title: 'Unit', "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Unit List...', "nullLabel": '---', },
                            IsReturnItem: { type: ["null", "boolean"], title: 'Is Return' },
                            IsCustom: { type: ["null", "boolean"], title: 'Is Custom' },
                            SalesTypeId: { "title": 'SalesTypeId', type: ["null", "number"], "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Action...', "nullLabel": '---', },
                            KitchenId: { "title": 'Kitchen', type: ["null", "number"], "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Kitchen List...', "nullLabel": '---', },
                            KdsId: { "title": 'Kds', type: ["null", "number"], "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Kds List...', "nullLabel": '---', },
                            KitchenRegionId: { "title": 'Kitchen Region', type: ["null", "number"], "htmlClass": 'customFormSelect', "format": 'uiselect', "placeholder": 'Select Unit List...', "nullLabel": '---', },
                            PreparationTime: { "type": 'number', "title": 'PreparationTime' },
                        },
                        required: ['Description', 'ProductCategoryId']
                    }
                })
            }

        }
    }])
    .factory('ProductPricesGrid', ['uiGridGroupingConstants', 'uiGridConstants', function (uiGridGroupingConstants, uiGridConstants) {
        var TypeArray = [];
        return {
            getPricesGridParams: function () {
                return ({
                    enablePaging: true, useExternalPagination: true,
                    paginationPageSizes: [20, 50, 75], paginationPageSize: 20,
                    paginationCurrentPage: 1,
                    rowEditWaitInterval: -1, //use this to avoid save event wait until next edit .. 
                    enablePaginationControls: true, //pag buttons action
                    //enableCellEditOnFocus: false,//on dblclick edit <!> Caution <!> with row edit enable u need to activate select box its the only way to select a row
                    enableSorting: true,
                    //enableRowSelection: true,
                    multiSelect: false, modifierKeysToMultiSelect: false,
                    enableFiltering: true,
                    enableCellNav: true, enableCellEdit: true,
                    columnDefs: [
                        { field: 'Id', name: 'Id', enableCellEdit: false, visible: false },
                        { field: 'Code', name: 'Code', enableCellEdit: true },
                        { field: 'ProductId', name: 'ProductId', categoryDisplayName: 'address' },
                        { field: 'Description', name: 'Description', categoryDisplayName: 'address' },

                        //{ field: 'Price', name: 'Price',  type: "number", enableCellEditOnFocus: false },
                        //{ field: 'PriceWithout', name: 'PriceWithout', },
                        //{
                        //    field: 'PriceListId', name: 'PriceListId', editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                        //    editDropdownIdLabel: 'Id', editDropdownValueLabel: 'Description', editDropdownOptionsArray: [], //this needs to init dynamically
                        //    cellFilter: 'mapDropdown: row.grid.appScope.unitsLookupResults:"Id":"Description"' //working
                        //},
                        //{
                        //    field: 'PricelistMasterId', name: 'PricelistMasterId', editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                        //    editDropdownIdLabel: 'Id', editDropdownValueLabel: 'Description', editDropdownOptionsArray: [], //this needs to init dynamically
                        //    cellFilter: 'mapDropdown: row.grid.appScope.unitsLookupResults:"Id":"Description"' //working
                        //},
                        //{
                        //    field: 'VatId', name: 'VatId', editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                        //    editDropdownIdLabel: 'Id', editDropdownValueLabel: 'Description', editDropdownOptionsArray: [], //this needs to init dynamically
                        //    cellFilter: 'mapDropdown: row.grid.appScope.unitsLookupResults:"Id":"Description"' //working
                        //},
                        //{
                        //    field: 'ProductCategoryId', name: 'ProductCategoryId', editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                        //    editDropdownIdLabel: 'Id', editDropdownValueLabel: 'Description', editDropdownOptionsArray: [], //this needs to init dynamically
                        //    cellFilter: 'mapDropdown: row.grid.appScope.unitsLookupResults:"Id":"Description"' //working
                        //},
                        //{
                        //    field: 'TaxId', name: 'Tax', editType: 'dropdown', editableCellTemplate: 'ui-grid/dropdownEditor',
                        //    editDropdownIdLabel: 'Id', editDropdownValueLabel: 'Description', editDropdownOptionsArray: [], //this needs to init dynamically
                        //    cellFilter: 'mapDropdown: row.grid.appScope.unitsLookupResults:"Id":"Description"' //working
                        //},
                    ]
                })
            }
        }
    }]);




