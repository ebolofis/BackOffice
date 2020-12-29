'use strict';
//directives that used by ingredients through the project
angular.module('posBOApp')
//Directive to display categories association 
//lookupdata { lookups : ,lookupObjects : } ProductCategories Ingredients Ingredient_ProdCategoryAssoc enums anr arrays
//container : object of live containers assosiated
.controller('IngredientCategoryAssocModalCtrl', IngredientCategoryAssocModalCtrl)
.directive('categoryAssocContainer', categoryAssocContainer)
.controller('ProductCategoryAssocCtrl', ProductCategoryAssocCtrl)
.directive('containerDropSelection', containerDropSelection)
function containerDropSelection() {
    return {
        controller: function ($scope) {
            //$scope.onchangeFun = function (id) {
            //    console.log('Assosiation change' + id);
            //    //$scope.smodel = id;
            //    $scope.onchangeFun(id);
            //}
        }, restrict: 'E',
        scope: { smodel: '=', loop: '=', onchangeFun: '=', lookup: '=', lookupExtra :'='},
        template: '<md-input-container class="fix-input-display" aria-label="zav1" flex>'
        + '<md-select name="ToCloneAssocContainer" ng-model="smodel" ng-change="onchangeFun(smodel)" aria-label="Select Assoc to clone">'
        + '<md-option ng-repeat="cid in loop" ng-value="cid">{{lookup[cid]}} ({{lookupExtra[cid]}})</md-option>' + '</md-select></md-input-container>'
    };
}
function categoryAssocContainer() {
    return {
        templateUrl: 'app/scripts/directives/views-directives/ingredient-assoc-modules/product-category-association-container-template.html',
        controller: 'ProductCategoryAssocCtrl', restrict: 'E',
        scope: { pckey: '=', data: '=', lookups: '=', mode: '=?', actionFuns: '=?', options: '=?' },
        //link: function (scope, elem, attrs) { }
    }
}
function ProductCategoryAssocCtrl($q, $scope, $mdDialog, tosterFactory, DynamicApiService) {
    //$scope.actionFuns = actionFuns
    $scope.log = function (data) {
        console.log(data);
    }
}
function IngredientCategoryAssocModalCtrl($q, $scope, $filter, $mdDialog, lookup, container, mode, tosterFactory, DynamicApiService) {
    //Append new Selected Product Categories
    // appendContainers <---- selected cats from lookups
    $scope.insertProductCategories = function () {
        var arrayToInsIds = $scope.allProductCategories.filter(function (item) { if (item.selected != undefined && item.selected == true) { item.selected = false; return item; } });
        var tmpObj = {};
        angular.forEach(arrayToInsIds, function (idi) {
            if ($scope.appendContainers[idi.Id] != undefined) { alert('Error current Category seams to exist on Container') }
            tmpObj[idi.Id] = [];
        })
        angular.extend(tmpObj, $scope.appendContainers); $scope.appendContainers = tmpObj; // extend on begining
    }
    //Action that Appends selected ingredients to selected entity
    // selectedIngredients <------ from dropdown ingredients tranform INGR DTO
    $scope.appendSelectedIngredients = function () {
        var selected = [];
        angular.forEach($scope.allAvailableIngredients, function (item) {
            if (item.selected != undefined && item.selected == true) {
                item.selected = false; var obj = assocFromIngr(item); selected.push(obj);
            }
        });
        $scope.selectedIngredients = $scope.selectedIngredients.concat(selected);
    }
    //Takes an ingredient obj and provides and assosiation to assign
    function assocFromIngr(ingr) { var ret = { Id: 0, IngredientId: ingr.Id, ProductCategoryId: -1 }; return ret; }


    //Change selection group from clone container 
    //scope function parsed to dropdown container directive on clone assocs action
    $scope.assocSelectionChanged = function (id) {
        //console.log('Changing dropdown container selection to id:' + id)
        if (id != undefined && $scope.containerObjects[id] != undefined) {
            $scope.selectedCloneContainer = $scope.containerObjects[id];
            $scope.selectedCloneContainer = $scope.selectedCloneContainer.map(function (i) { i.selected = true; return i; });
        }
        else {
            alert('Assosiation Container missmatch or not valid');
            $scope.selectedCloneContainer = [];
            return;
        }
    }
    //Action button on clone view to append ingredient Assocs on selected to clone assocs 
    $scope.appendCloneIngredients = function () {
        var selected = [];
        angular.forEach($scope.selectedCloneContainer, function (item) {
            if (item.selected != undefined && item.selected == true) {
                item.selected = false;
                var newi = { Id: 0, IngredientId: item.IngredientId, ProductCategoryId: -1 };
                selected.push(new Object(newi));
            }
        });
        $scope.selectedAssocs = $scope.selectedAssocs.concat(selected);
    }

    //action that removes selected entities from a dropdown type provided
    //generic array delete of selected = true action
    //provide  name of the array ar type on this function and generically scope array will be binded to the name
    $scope.removeSelection = function (type) {
        if ($scope[type] == undefined) { alert('Not scoped mapped array to clear'); return; }
        var mar = $scope[type];
        var arr = mar.filter(function (i) {
            if (i.selected != true) { return i; };
        })
        $scope[type] = arr;
    }

    //toggle selection function to providing array and value to apply 
    $scope.toggleSelection = function (arr, boolval) {
        angular.forEach(arr, function (i) { i['selected'] = boolval; });
    }


    //---------------------------------------------- Product Category Container Creation Functions -----------------------------------------------------------
    //Mapped functions to containers directive
    $scope.categoryContainerModalFunctions = {
        clickOn: clickSelectContainerObjectfun,
        clickDelete: containerObjDeleteActionfun
    }
    //A function to action click on clone Category ingredients
    //Changes single selected entity
    function clickSelectContainerObjectfun(key, cObj) {
        if ($scope.selectedContainerObj != undefined || $scope.selectedContainerObj != null)
            $scope.selectedContainerObj.isSelected = false;
        cObj.isSelected = true; $scope.selectedContainerObj = cObj;
    }
    //function mapped to remove button of container
    //When you wish to delete selected  containers that you have selected this function removes it from the obj of appendContainers
    function containerObjDeleteActionfun(key, cObj, $event) {
        if ($scope.appendContainers[key] != undefined) {
            delete $scope.appendContainers[key];
            if (Object.keys($scope.appendContainers).length == 0)
                $scope.validContainerSelection = false;

        } else {
            console.log('Nothing to delete from selection container key:' + key);
            console.log($scope.appendContainers);
        }
    }

    //---------------------------------------------------------- Filter Functions -----------------------------------------------------------
    $scope.searchtextclonec = function (txt) {
        $scope.searchCloneAssocIngrs = txt;
    }
    //Custom Filters on Drop Down selects
    //Categories to append Ingredients custom filter
    $scope.filterPCats = function (pcat) {
        //if a category id is included either on containerObj || to appendContainers
        if ($scope.containerObjects[pcat.Id] == undefined && $scope.appendContainers[pcat.Id] == undefined) {  //if category does not exist in container display it 
            return true;
        } else { return false; }
    }
    //this is a filter for clones of selected container vs selected clones you wish to append
    $scope.filterClones = function (cing) {
        //if a category id is included either on containerObj || to appendContainers
        if ($scope.selectedAssocs == undefined || $scope.selectedAssocs.length == 0) {
            return true;
        } else {
            for (var i = 0; i < $scope.selectedAssocs.length; i++) { var c = $scope.selectedAssocs[i]; if (c.IngredientId == cing.IngredientId) { return false; } }
            return true;
        }
        return false;
    }

    //filter ingredients that exist on selectedIngredients Array 
    $scope.filterIngrs = function (ingr) {
        if ($scope.selectedIngredients == null || $scope.selectedIngredients == undefined) return true;
        for (var i = 0; i < $scope.selectedIngredients.length; i++) {
            if ($scope.selectedIngredients[i].IngredientId == ingr.Id) return false;
        } return true;
    }
    //---------------------------------------------------------- Default modal functionality variables -----------------------------------------------------------
    //Available Actions displayed in actions panel || default view option
    $scope.actions = {
        'default': { title: 'Association Policy Options', label: "Home", template: 'action-selection-template', allowChange: false, completed: false, disabled: false, info: 'Select an action to perform modifications.' },
        'selectCat': { title: 'Select Product Categories', label: "Categories", template: 'inner-assoc-split-option-template', allowChange: false, completed: false, disabled: false, info: 'Choose Product-Categories to associate Ingredients.', leftT: 'container-add-list-template', rightT: 'categories-list-template' },
        'selectIngredients': { title: 'Custom Ingredients Selection', label: "Ingredients", template: 'inner-assoc-split-option-template', allowChange: false, completed: false, disabled: false, info: 'Choose Ingredients from the list you wish to append.', leftT: 'selected-ingredients-template', rightT: 'available-ingredients-template' },
        'cloneIngredients': { title: 'Ingredients from Categories', label: "Associations", template: 'inner-assoc-split-option-template', allowChange: false, completed: false, disabled: false, info: 'Choose Product-Categories to associate Ingredients', leftT: 'selected-associations-template', rightT: 'container-associations-template' },
        'applyIngredients': { title: 'Apply Ingredients Selection', label: "Apply", template: 'inner-assoc-split-option-template', allowChange: false, completed: false, disabled: false, info: 'Selected Ingredients to apply ingredient mapping on selected Product-Category containers', leftT: 'container-add-list-template', rightT: 'selected-ingredients-template' },
        'applyClonedIngredients': { title: 'Apply Clone Selection', label: "Apply", template: 'inner-assoc-split-option-template', allowChange: false, completed: false, disabled: false, info: 'Clone associations to apply ingredient mapping on selected Product-Category containers', leftT: 'container-add-list-template', rightT: 'selected-associations-template' },
    }

    //Action click on menu options available
    $scope.selectAction = function (type) {
        if ($scope.actions[type] != undefined) {
            $scope.selectedAction = $scope.actions[type];
            $scope.templateChoice = type;
            $scope.templateOption = $scope.selectedAction.template;
            var index = $scope.steps.indexOf(type);
            if (index > -1)
                $scope.selectedstep = index;
        } else {
            $scope.selectedAction = $scope.actions['default'];
            $scope.templateChoice = 'default';
            $scope.templateOption = $scope.selectedAction.template;
            $scope.selectedstep = 0;
        }
    }
    //watch group to update step entities with help of chenge Steps
    $scope.$watchGroup(['appendContainers', 'selectedIngredients', 'selectedAssocs', 'mode'], function (newValues, oldValues, scope) { //, 'isGridRowDirty'
        if (newValues[0] != undefined && newValues[0] != {}) {
            changeStepsById('selectCat');
            if (Object.keys(newValues[0]).length > 0)
                $scope.validContainerSelection = true;
        } else if ($scope.actions['selectCat'] != undefined) {
            $scope.actions['selectCat'].completed = false;
            if (Object.keys(newValues[0]).length == 0)
                $scope.validContainerSelection = false;
        }
        if (newValues[1].length > 0 && newValues[1] != undefined) {
            changeStepsById('selectIngredients');
            //$scope.actions['selectedIngredients'].completed = true;
        } else if ($scope.actions['selectIngredients'] != undefined) {
            $scope.actions['selectIngredients'].completed = false;
        }
        if (newValues[2].length > 0 && newValues[2] != undefined) {
            changeStepsById('cloneIngredients');
            //$scope.actions['selectedAssocs'].completed = true;
        } else if ($scope.actions['cloneIngredients'] != undefined) {
            $scope.actions['cloneIngredients'].completed = false;
        }
        if ($scope.mode == 'assoc')
            (newValues[0] != undefined && newValues[0] != {} && newValues[1].length > 0 && newValues[1] != undefined) ? $scope.validToAppend = true : $scope.validToAppend = false;
        if ($scope.mode == 'clone')
            (newValues[0] != undefined && newValues[0] != {} && newValues[2].length > 0 && newValues[2] != undefined) ? $scope.validToAppend = true : $scope.validToAppend = false;

    });
    function changeStepsById(stype) {
        $scope.actions[stype].completed = true; //change step completion
        var index = $scope.steps.indexOf(stype); //allow next step 
        if (index != undefined && index > 0 && index + 1 <= $scope.steps.length && $scope.steps[index + 1] != undefined) {
            $scope.actions[$scope.steps[index + 1]].disabled = false;
        }
    }

    //function resetStepValidation() { }

    $scope.switchSelectionMapPolicy = function (type) { $scope.mode = type; BIAction($scope.mode, $scope.modeData); }
    function BIAction(mode, data) {
        createSteps(mode);
        if (mode != undefined && data != undefined)
            angular.extend($scope.appendContainers, data);
    }
    function createSteps(mode) {
        switch (mode) {
            case 'assoc': $scope.steps = []; $scope.steps.push('selectCat', 'selectIngredients', 'applyIngredients'); $scope.selectAction('selectCat'); $scope.mode = mode; break;
            case 'clone': $scope.steps = []; $scope.steps.push('selectCat', 'cloneIngredients', 'applyClonedIngredients'); $scope.selectAction('selectCat'); $scope.mode = mode; break;
            case 'default': default: $scope.steps = []; $scope.selectAction('default'); break;
        }
    }
    $scope.categoryContainerOptions = {
        disableMenu: true
    }
    $scope.logAppendContainer = function () { console.log($scope.appendContainers); console.log($scope.selectedIngredients); console.log($scope.selectedAssocs); }
    //Modal Return Functions
    $scope.hide = function () { $mdDialog.cancel(); };
    $scope.cancel = function () { $mdDialog.cancel(); };
    $scope.confirm = function (answer) {
        $mdDialog.hide(answer);
    }
    $scope.applyChanges = function () {
        var selectionArray = [], returningContainers = {};
        returningContainers = angular.copy($scope.appendContainers);


        switch ($scope.mode) {
            case 'assoc': selectionArray = angular.copy($scope.selectedIngredients); break;
            case 'clone': selectionArray = angular.copy($scope.selectedAssocs); break;
            default: return; break;
        }
        angular.forEach(returningContainers, function (value, key) {
            var newr = selectionArray.map(function (i) { i.ProductCategoryId = Number(key); return i; })
            returningContainers[key] = newr;
        })
        //$scope.logAppendContainer(); console.log('Return array'); console.log(returningContainers);
        $scope.confirm(returningContainers);
    }

    $scope.init = function () {
        $scope.lookupEnums = lookup.enums;
        $scope.lookupObjs = lookup.objs;
        $scope.containerObjects = new Object(container);

        $scope.assocExtraLength = {}
        angular.forEach($scope.containerObjects, function (val, k) { $scope.assocExtraLength[k] = val.length; })
        console.log('Log Enum');
        console.log($scope.assocExtraLength);
        //Ingredients selection list
        $scope.allAvailableIngredients = new Object($scope.lookupObjs['Ingredients']);
        //containers Dropdown
        $scope.allProductCategories = new Object($scope.lookupObjs['ProductCategories']);
        //Containers Selection
        $scope.assocCatIds = Object.keys($scope.containerObjects);
        //Assoc container  //assoc Container ProductCategoryID
        $scope.selectedCloneAssoc = null; $scope.selectedCloneContainer = [];
        //new containerCreation //Selection of ingredients //Selection of Assosiations 
        $scope.appendContainers = {}; $scope.selectedIngredients = []; $scope.selectedAssocs = [];

        //StepWizard Variables
        $scope.selectedstep = 0; $scope.searchCloneAssocIngrs = ''
        $scope.validToAppend = false;
        $scope.validContainerSelection = false;
        $scope.mode = mode.type;
        $scope.modeData = mode.data;
        BIAction($scope.mode, $scope.modeData);
    }();
}
