'use strict';
angular.module('posBOApp')
.factory('VariousModelsFactory', function ($http, $rootScope) {
    var factory = {}
    factory.uigridColumnModel = function () {
        var columnModel = {
            field: '' //: "foo" //Can also be a property path on your data model. "foo.bar.myField", "Name.First", etc..
            , displayName: ''
            , name: '' //: "Pretty Foo"
            , width: '' //60
            , minWidth: '' //50
            , maxWidth: '' //: 9000

            , visible: null //: true
            , resizable: null//: true
            , groupable: null //: true //allows the column to be grouped with drag and drop, but has no effect on gridOptions.groups
            , pinnable: null //: true //allows the column to be pinned when enablePinning is set to true
            , sortable: null //: true
            , sortFn: null //: //function(a,b){return a > b} (see Sorting and Filtering) It may be renamed to 'sortingAlgorithm'.

            , headerCellClass: '' //: "userDefinedCSSClass"
            , headerCellTemplate: ''//: "" //(see Templating)
            , enableCellEdit: '' //: true //allows the cell to use an edit template when focused (grid option enableCellSelection must be enabled)
            , cellClass: '' //: "userDefinedCSSClass"
            , cellTemplate: '' //: "" //(see Templating)
            , cellFilter: '' //string name for filter to use on the cell ('currency', 'date', etc..)
            , editableCellTemplate: null //: true //the template to use while editing
            , cellEditableCondition: null//: //'true' controls when to use the edit template on per-row basis using an angular expression (enableCellEdit must also be true for editing)

            , aggLabelFilter: ''//string name for filter to use on the aggregate label ('currency', 'date', etc..) defaults to cellFilter if not set.
        }
        return columnModel;
    }
    factory.uigridColumnSFE = function () {
        var colSchema = {
            type: 'object',
            properties: {
                field: { title: 'field', type: 'string' },
                displayName: { title: 'displayName', type: 'string' },
                name: { title: 'name', type: 'string' },
                width: { title: 'width', type: 'string' },
                minWidth: { title: 'minWidth', type: 'string' },
                maxWidth: { title: 'maxWidth', type: 'string' },

                visible: { title: 'visible', type: 'boolean' },
                resizable: { title: 'resizable', type: 'boolean' },
                groupable: { title: 'groupable', type: 'boolean' },
                pinnable: { title: 'pinnable', type: 'boolean' },
                sortable: { title: 'sortable', type: 'boolean' },
                sortFn: { title: 'sortFn', type: 'string' },

                headerCellClass: { title: 'headerCellClass', type: 'string' },
                headerCellTemplate: { title: 'headerCellTemplate', type: 'string' },
                enableCellEdit: { title: 'enableCellEdit', type: 'boolean' },
                cellClass: { title: 'cellClass', type: 'string' },
                cellTemplate: { title: 'cellTemplate', type: 'string' },
                cellFilter: { title: 'sortFn', type: 'string' },

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
                Theme: { type: 'string', title: 'Theme', validationMessage: "You need to add a FiscalName." }, //datepicker
                IsOpen: { type: 'boolean', title: 'IsOpen' }
            },
            required: ['Type', 'Code', 'Description', 'DepartmentId', 'Theme']
        };
        var colForm = [
            { key: 'Type', type: 'select', titleMap: [] }, 'Code', 'Description', { key: 'DepartmentId', type: 'select', titleMap: [] }, 'Theme', 'IsOpen'];
        var entity = factory.uigridColumnModel;

        var ret = { schema: colSchema, form: colForm, entity: colEntity };
        return ret
    }
    return factory;
})
