'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:IngredientAssocsServiceController
 * @description
 * # IngredientAssocs
 * Controller of the posBOApp
 */

angular.module('posBOApp')
    .controller('IngredientAssocsServiceController', IngredientAssocsController)
    ;
function IngredientAssocsController($stateParams, $scope, $filter, $q, $interval, $mdDialog, $mdMedia, DynamicApiService, dataUtilFactory, tosterFactory, config) {
    $scope.selectedProductCategory = null; $scope.productCategoryEnum = {};
    $scope.searchloadedingrs = '';
    $scope.selectedIngedient = null;
    $scope.containerObjects = {}; //array of obj categoriezed
    $scope.selectedContainerObj = null;
    $scope.registersToDelete = {}; $scope.registersToAdd = {};

    //initiallize view dependencies
    $scope.initView = function () {
        $scope.devAccess = (config.workPolicy == 'dev') ? true : false;
        $scope.lookups = {}, $scope.lookupArrays = {}; $scope.missingSort = false;

        var productCategoriesPromise = $scope.getDropDownLookUps('ProductCategories');
        var ingredientsPromise = $scope.getDropDownLookUps('Ingredients');
        var ingredientsAssocsPromise = $scope.getDropDownLookUps('Ingredient_ProdCategoryAssoc');
        var lookupPromiceIngrs = $scope.RestPromice.lookups('SetupIngredients');
        var lookupPromiceCats = $scope.RestPromice.lookups('SetupProductCategories');
        //When all lookUps finished loading 
        $q.all([lookupPromiceIngrs, lookupPromiceCats, productCategoriesPromise, ingredientsPromise, ingredientsAssocsPromise]).then(function (d) {
            if (d[0].data.LookUpEntities != undefined)
                angular.extend($scope.lookups, d[0].data.LookUpEntities);
            if (d[1].data.LookUpEntities != undefined)
                angular.extend($scope.lookups, d[1].data.LookUpEntities);
            if ($scope.missingSort == true) {
                prososeSortModal();
            }
        });
    }
    //get lookups and registers of assocs
    $scope.getDropDownLookUps = function (entity) {
        switch (entity) {
            case 'ProductCategories': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                var dpsLoaded = angular.copy(result.data);
                $scope.productCategoryEnum = {}; $scope.productCategoryArrayOptions = [];
                var objRes = dataUtilFactory.createEnumsAndEnumObjs(dpsLoaded, $scope.productCategoryEnum, $scope.productCategoryArrayOptions, 'Id', 'Description');
                $scope.productCategoryEnum = objRes.retEnum;
                $scope.productCategoryArrayOptions = objRes.retEnumObj;
                $scope.lookups['ProductCategories'] = $scope.productCategoryEnum;
                $scope.lookupArrays['ProductCategories'] = $scope.productCategoryArrayOptions;

            }, function (reason) {
                $scope.lookups['ProductCategories'] = -1; $scope.lookupArrays['ProductCategories'] = -1;
                tosterFactory.showCustomToast('Loading ProductCategories failed', 'fail'); console.log('Error Load'); console.log(reason);
            })); break;

            case 'Ingredients': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { //Rest Get call for data using Api service to call Webapi
                var dpsLoaded = angular.copy(result.data);
                $scope.ingredientsEnum = {}; $scope.ingredientsArrayOptions = [];

                var objRes = dataUtilFactory.createEnumsAndEnumObjs(dpsLoaded, $scope.ingredientsEnum, $scope.ingredientsArrayOptions, 'Id', 'Description');
                $scope.lookups['Ingredients'] = $scope.ingredientsEnum = objRes.retEnum;
                $scope.lookupArrays['Ingredients'] = $scope.ingredientsArrayOptions = objRes.retEnumObj;
            }, function (reason) {
                $scope.lookups['Ingredients'] = -1; $scope.lookupArrays['Ingredients'] = -1;
                tosterFactory.showCustomToast('Loading Ingredients failed', 'fail'); console.log('Error Load'); console.log(reason);
            })); break;

            case 'Ingredient_ProdCategoryAssoc': return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) {
                if (result.data == undefined || result.data.length == 0 || result.data == -1) {
                    console.warn('No Assosiations loaded. Configuring empty Objects');
                    $scope.containerObjects = {}, $scope.databaseLoadedAssocs = {}, $scope.ingredientAssocsEnum = {}, $scope.ingredientAssocsArrayOptions = [];
                } else {
                    var dpsLoaded = [], sortFielded = [], emptySort = [], sorted = [];
                    //on ingredients loaded filter those with not sort defined sort them with quicksort then append
                    angular.forEach(result.data, function (item) {
                        if (item.Sort == undefined) {
                            $scope.missingSort = true; emptySort.push(item);
                        } else { sortFielded.push(item); }
                    })

                    try {
                        sorted = dataUtilFactory.quicksort(sortFielded, 'Sort');
                    } catch (e) {
                        console.log('Trying to sort ingredients loaded error (append unsorted):');
                        sorted = sortFielded;
                    }
                    dpsLoaded = sorted.concat(emptySort);
                    $scope.containerObjects = angular.copy(dataUtilFactory.groupTo(dpsLoaded, 'ProductCategoryId'));
                    $scope.databaseLoadedAssocs = angular.copy($scope.containerObjects);
                    $scope.ingredientAssocsEnum = {}; $scope.ingredientAssocsArrayOptions = [];
                    
                    var objRes = dataUtilFactory.createEnumsAndEnumObjs(dpsLoaded, $scope.ingredientAssocsEnum, $scope.ingredientAssocsArrayOptions, 'IngredientId', 'ProductCategoryId');
                    $scope.ingredientAssocsEnum = objRes.retEnum; //{ IngredientId : ProductCategoryId}
                    $scope.ingredientsAssocsArrayOptions = objRes.retEnumObj; //{ IngredientId : ingredientAssocObject}

                }
                $scope.lookups['Ingredient_ProdCategoryAssoc'] = $scope.ingredientAssocsEnum; $scope.lookupArrays['Ingredient_ProdCategoryAssoc'] = $scope.ingredientsAssocsArrayOptions;

            }, function (reason) {
                $scope.lookups['Ingredient_ProdCategoryAssoc'] = -1; $scope.lookupArrays['Ingredient_ProdCategoryAssoc'] = -1;
                tosterFactory.showCustomToast('Loading Ingredient categories failed', 'fail'); console.log('Error Load'); console.log(reason);
            })); break;
            default: break;
        }
    };
    //Rest Promises
    $scope.RestPromice = {
        //used to add a creation of new ingredient or product category 
        'singleInsert': function (entityIdentifier, data) {
            return DynamicApiService.postSingle(entityIdentifier, data).then(function (result) {
                tosterFactory.showCustomToast('New entry inserted successfully.', 'success');
                return result;
            }).catch(function (result) {
                tosterFactory.showCustomToast('Inserting new row failed', 'fail'); console.log('Error Load'); console.log(reason); return null;
            });
        },
        //Resource of lookups needed to manage side entities of forms
        'lookups': function (nameType) {
            return DynamicApiService.getLookupsByEntityName(nameType).then(function (result) {
                return result;
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Lookups failed', 'fail'); console.warn('Get lookups functionality on server failed. Reason:'); console.warn(rejection);
                return null;
            });
        },
    }

    //ProductCategory Container  Functions for directive use
    $scope.categoryContainerFunctions = {
        clickOn: clickSelectContainerObjectfun,
        clickDelete: containerObjDeleteActionfun,
        categoryMenuOptions: categoryOptions,
    }

    //Actions on Category Main Panel 
    //Select Performed Add new category [collapse visibility of panel add categories]
    $scope.clickSelectContainerObject = clickSelectContainerObjectfun;
    $scope.containerObjDeleteAction = containerObjDeleteActionfun;
    $scope.sortDisplay = sortDisplayedContainer;
    $scope.categoryOptions = categoryOptions;
    $scope.flag = 0;
    function clickSelectContainerObjectfun(key, cObj) {
        //on select PCat Init filter ingredients
        $scope.incCatDisplay = false;
        if ($scope.selectedContainerObj != undefined || $scope.selectedContainerObj != null) $scope.selectedContainerObj.isSelected = false;
        cObj.isSelected = true;
        $scope.selectedContainerObj = cObj; $scope.selectedProductCategory = $scope.productCategoryArrayOptions[key];
    }
    //Delete Associated Category Action Performed
    function containerObjDeleteActionfun(key, cObj, ev) {
        var deleteDialog = $mdDialog.confirm().title('Deleting product category association').textContent('You have selected "' + $scope.productCategoryEnum[key] + '" category to delete.\n Proceed and delete item ?').ariaLabel('ingrassocdelete' + key).ok('Delete').cancel('Cancel');
        $mdDialog.show(deleteDialog).then(function () {
            $scope.selectedContainerObj = cObj; $scope.selectedProductCategory = key;
            angular.forEach(cObj, function (item) { deleteProccess(item); }); //parse through delete proccess each Ingredient
            delete $scope.containerObjects[key]; //delete key from container to avoid display
            //clear selection vars
            $scope.selectedContainerObj = null; $scope.selectedProductCategory = null;
        })
    }
    //This is a function that propose to user a functionallity of autosorting
    //When Containers Loaded and sorting missmatches against sorting order this pop up allows you to auto sort ingredients
    $scope.modalSortPropose = prososeSortModal;
    function prososeSortModal() {
        var autosortDialog = $mdDialog.confirm().title('Auto Sort Fix').textContent('There are ingredients with invalid sort fields.\n Provide auto fix on invalid containers?').ariaLabel('autosort').ok('Sort').cancel('Cancel');
        $mdDialog.show(autosortDialog).then(function () { sortAssociatedIngredients(); })
    }
    //sort all containerObjects
    function sortAssociatedIngredients() {
        angular.forEach($scope.containerObjects, function (carr, key) {
            clickSelectContainerObjectfun(key, carr)
            $scope.sortDisplay();
        })
    }
    //this function sorts Displayed and +SELECTED+ container in view 
    function sortDisplayedContainer() {
        var cnt = 0;
        angular.forEach($scope.selectedContainerObj, function (ex) {
            if (ex.Sort != cnt) {
                ex.edited = true;
                $scope.selectedContainerObj.isEdited = true;
                ex.Sort = cnt;
            }
            cnt++;
        })
    }
    //function binded to category dropdown
    function categoryOptions(key, cObj, type) {
        switch (type) {
            case 'assoc': case 'clone': var tobj = { [key]: cObj }; addCategoryModal(type, tobj); break;
            case 'restore':
                angular.forEach($scope.containerObjects[key], function (ai) { clearCreateAssocArrays(ai); });
                angular.forEach($scope.databaseLoadedAssocs[key], function (ai) { clearDeleteAssocArrays(ai); });
                var load = ($scope.databaseLoadedAssocs[key] != undefined) ? angular.copy($scope.databaseLoadedAssocs[key]) : [];
                $scope.containerObjects[key] = angular.copy(load);
                clickSelectContainerObjectfun(key, $scope.containerObjects[key]);
                break;
            case 'sort': $scope.sortDisplay();
            default: break;
        }
    }
    //Create and Delete Changes Map is an Obj based on { ingrId: [ ingreID_Assocs ] } to create or delete
    //So on Rollback clear object registers and delete ref if they have no registers left
    function clearDeleteAssocArrays(ingr) {
        if ($scope.registersToDelete[ingr.IngredientId] != undefined) {
            var farr = $scope.registersToDelete[ingr.IngredientId];
            $scope.registersToDelete[ingr.IngredientId] = farr.filter(function (item) {
                return (item.ProductCategoryId != ingr.ProductCategoryId);
            })
            if ($scope.registersToDelete[ingr.IngredientId].length == 0)
                delete $scope.registersToDelete[ingr.IngredientId];
        }
    }
    function clearCreateAssocArrays(ingr) {
        if ($scope.registersToAdd[ingr.IngredientId] != undefined) {
            var iarr = $scope.registersToAdd[ingr.IngredientId];
            $scope.registersToAdd[ingr.IngredientId] = iarr.filter(function (item) {
                return (item.ProductCategoryId != ingr.ProductCategoryId);
            })
            if ($scope.registersToAdd[ingr.IngredientId].length == 0)
                delete $scope.registersToAdd[ingr.IngredientId];
        }
    }

    //Delete Single Ingredient associated to a category
    $scope.ingrsDeleteAction = function (ingrs, cObj) {
        var index = cObj.indexOf(ingrs);
        (index != -1) ? (cObj.splice(index, 1), cObj.isEdited = true) : alert('Error paradox Selected ContainerObj is trying to delete content that does not exist');
        deleteProccess(ingrs);
    }
    //Common delete Action used by Single Ingr Del & Category Del
    function deleteProccess(ingrs) {
        //manage del array
        if (ingrs.Id != undefined && ingrs.Id != 0) { //if register loaded from DB //Manage Delete
            if ($scope.registersToDelete.hasOwnProperty(ingrs.IngredientId)) {
                //if ($scope.registersToDelete[ingrs.IngredientId] != undefined) {
                $scope.registersToDelete[ingrs.IngredientId].push(ingrs);
            } else {
                var newObj = {}; newObj[ingrs.IngredientId] = [];
                newObj[ingrs.IngredientId].push(ingrs);
                angular.extend($scope.registersToDelete, newObj);
            }
        }
        //manage add array 
        if (!$scope.registersToAdd.hasOwnProperty(ingrs.IngredientId) || $scope.registersToAdd[ingrs.IngredientId].length == 0) return; //does not exist in rejisters to add
        else {
            if ($scope.registersToAdd[ingrs.IngredientId].length == 1) delete $scope.registersToAdd[ingrs.IngredientId];
            else {
                for (var i = 0; i < $scope.registersToAdd[ingrs.IngredientId].length; i++) { //else interate through deletion array regs to del spec
                    var it = $scope.registersToAdd[ingrs.IngredientId][i];
                    if (it.ProductCategoryId == $scope.selectedProductCategory.Id) {
                        $scope.registersToAdd[ingrs.IngredientId].splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
    //Insert Functions
    //Switch between mode and normal to bind options on product category
    $scope.addCategoryModal = addCategoryModal;
    function addCategoryModal(popupMode, modalData) {
        //parse enums and anum objects
        var lookup = {
            enums: {
                ProductCategories: $scope.lookups['ProductCategories'],
                Ingredients: $scope.lookups['Ingredients'],
            },
            objs: {
                ProductCategories: $scope.lookupArrays['ProductCategories'],
                Ingredients: $scope.lookupArrays['Ingredients'],
            }
        }
        //setup mode functionality
        var mode = {
            type: (popupMode != undefined) ? popupMode : 'default',
            data: (modalData != undefined) ? modalData : null
        }
        var container = $scope.containerObjects;
        $mdDialog.show({
            controller: 'IngredientCategoryAssocModalCtrl', templateUrl: 'app/scripts/directives/views-directives/ingredient-assoc-modules/pcat-ingr-assoc-modal-template.html',
            parent: angular.element('#wrapper'), clickOutsideToClose: false, fullscreen: true,
            resolve: { lookup: function () { return lookup; }, container: function () { return container; }, mode: function () { return mode; } }
        }).then(function (data) {
            //console.log('Category Association modal return:'); console.log(data);
            if (data != undefined) {
                var insobj = data;
                angular.forEach(insobj, function (value, key) {
                    var niingrs = [];
                    if ($scope.containerObjects[key] != undefined && $scope.containerObjects[key].length > 0)
                        niingrs = getNotAllreadyIncluded(value, key, 'IngredientId', 'IngredientId');
                    else {
                        niingrs = value;
                    }
                    var inarr = insertProccess(niingrs, key, 'IngredientId');
                    ($scope.containerObjects[key] == undefined) ? $scope.containerObjects[key] = inarr : $scope.containerObjects[key] = $scope.containerObjects[key].concat(inarr);
                    $scope.containerObjects[key].isEdited = true;
                })
                if ($scope.selectedProductCategory != undefined && $scope.selectedProductCategory.Id != undefined && $scope.containerObjects[$scope.selectedProductCategory.Id] != undefined)
                    clickSelectContainerObjectfun($scope.selectedProductCategory.Id, $scope.containerObjects[$scope.selectedProductCategory.Id]);
            }
        })
    }
    //array is input  array of ingredient dtos and key is productcategory key to refer the containers
    function getNotAllreadyIncluded(array, pkey, arrfieldName, cfieldName) {
        var cobj = dataUtilFactory.createEnumObjs($scope.containerObjects[pkey], {}, cfieldName);
        var iobj = dataUtilFactory.createEnumObjs(array, {}, arrfieldName);
        angular.forEach(Object.keys(iobj), function (ingid) {
            //if container object has a ref of ingredient id ---> dont append
            if (cobj[ingid] != undefined) {
                //delete ref with ingid 
                delete iobj[ingid]; //console.log('Inserting Id found on container IngId:' + ingid);
            }
        })
        var ret = Object.values(iobj);
        return ret;
    }

    //function that creates Ingredient and Product Category remote by Dynamic Form
    $scope.createDynamicEntity = function (entityIdentifier) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')); //&& $scope.customFullscreen;
        var filtObj = provideLookups(entityIdentifier);

        var formModel = {
            entityIdentifier: entityIdentifier,
            dropDownObject: filtObj,
        }
        var dataEntry = {};
        $mdDialog.show({
            controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'),
            //targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: useFullScreen,
            resolve: {
                formModel: function () { return formModel; },
                dataEntry: function () { return dataEntry; },
            }
        }).then(function (data) {
            saveRemoteIns(formModel.entityIdentifier, data);
        });
    }
    //Rest call of dynamic single entity insert
    function saveRemoteIns(type, data) {
        console.log('Saving new entity of type:' + type); console.log(data);
        $q.all({
            savePromise: $scope.RestPromice.singleInsert(type, data)
        }).then(function (d) {
            if (d.savePromise.data != null) {
                //console.log('Saving returned of:' + type + ' loading Dropdown lists');
                $scope.getDropDownLookUps(type);
            }
        })
    }
    //function that provide lookups over entity type
    function provideLookups(type) {
        var ret = {};
        switch (type) {
            case 'Ingredients':
                ret['UnitId'] = $scope.lookups['UnitId'];
                ret['ItemId'] = $scope.lookups['ItemId'];
                break;
            case 'ProductCategories':
                ret['CategoryId'] = $scope.lookups['CategoryId'];
                break;
            default:
                break;
        }
        return ret;
    }

    //Insert new Ingredient in selected product Category
    $scope.insertIngredients = function () {
        if ($scope.selectedContainerObj == null || $scope.selectedContainerObj == undefined || $scope.selectedProductCategory == undefined || $scope.selectedProductCategory == undefined) {
            tosterFactory.showCustomToast('Please select a container to insert', 'info');
            return;
        }

        var selectedIngrs = $filter('filter')($scope.ingredientsArrayOptions, function (item) {
            if (item.selected != undefined && item.selected == true) {
                item.selected = false; return item;
            }
        });
        var insarr = getNotAllreadyIncluded(selectedIngrs, $scope.selectedProductCategory.Id, 'Id', 'IngredientId');
        //used to concat entries on containerObj
        var arrayToIns = insertProccess(insarr, $scope.selectedProductCategory.Id, 'Id');
        var maxS = 0;
        angular.forEach($scope.containerObjects[$scope.selectedProductCategory.Id], function (ingr) {
            if (ingr.Sort > maxS)
                maxS = ingr.Sort;
        })
        if (maxS != 0)
            maxS++;
        var sortedA = arrayToIns.map(function (ii) {
            ii.Sort = maxS; maxS++; return ii;
        })

        $scope.containerObjects[$scope.selectedProductCategory.Id] = $scope.containerObjects[$scope.selectedProductCategory.Id].concat(arrayToIns);
        $scope.selectedContainerObj = $scope.containerObjects[$scope.selectedProductCategory.Id]; // update selected model 
        $scope.selectedContainerObj.isSelected = true;
        $scope.selectedContainerObj.isEdited = true;

    }
    function insertProccess(loop, pcatId, insref) {
        var reffield = (insref == undefined) ? 'Id' : insref;
        var retArray = [];
        angular.forEach(loop, function (item) { //<--array has entities of ingredients so actually relation is $scope.registersToDelete[IngredientId] == arrayToIns[i].Id
            //if register loaded from Db on delete it creates an Obj in del array  {ingId : [ingAssocObj]}
            var found = false;
            if ($scope.registersToDelete[item[reffield]] != undefined) {
                if ($scope.registersToDelete[item[reffield]] != undefined && $scope.registersToDelete[item[reffield]].length == 1) { //if register length has one value delete the hole reg on Del array 
                    delete $scope.registersToDelete[item[reffield]];
                } else {
                    for (var i = 0; i < $scope.registersToDelete[item[reffield]].length; i++) { //else interate through deletion array regs to del spec
                        var it = $scope.registersToDelete[item[reffield]][i];
                        if (it.ProductCategoryId == pcatId) { $scope.registersToDelete[item[reffield]].splice(i, 1); break; }
                    }
                }
            }
            var tmpObj = {}, foundOnLoaded = false, arr = $scope.databaseLoadedAssocs[pcatId];
            if (arr === undefined) { arr = []; }
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].IngredientId == item[reffield]) {
                    foundOnLoaded = true;
                    tmpObj = angular.copy(arr[i]);
                    break;
                }
            }
            if (foundOnLoaded == false) tmpObj = { Id: 0, IngredientId: item[reffield], ProductCategoryId: pcatId, Sort: 0 }
            if (found == false && foundOnLoaded == false) {
                ($scope.registersToAdd[item[reffield]] == undefined) ? $scope.registersToAdd[item[reffield]] = [tmpObj] : $scope.registersToAdd[item[reffield]].push(tmpObj);
            }
            retArray.push(tmpObj);
        })
        return retArray;
    }




    $scope.saveIngredientsAssocs = function () {
        $scope.savingProcess = true;
        var tableToDel = [], tableToAdd = [];
        angular.forEach($scope.registersToDelete, function (item) {
            angular.forEach(item, function (value) {
                if (value.Id === undefined || value.Id === null || value.Id === 0 || value.Id === -1) {
                    alert('Error on creating registers to delete current registers does not have an Id');
                    return;
                }
                tableToDel = tableToDel.concat(value.Id);
            })
        })
        var edited = [];
        angular.forEach($scope.containerObjects, function (arr, key) {
            var mod = arr.filter(function (ei) {
                if (ei.MinQty != null || ei.MaxQty != null)
                {
                    $scope.flag = 1;
                }
                return (ei.edited == true && ei.Id != 0 || ei.MinQty != null || ei.MaxQty !=null) ;
                //return (ei.edited == true && ei.Id != 0);
            })
            edited = edited.concat(mod);
        })
        angular.forEach($scope.registersToAdd, function (item) { tableToAdd = tableToAdd.concat(item); })
        var postPromise = (tableToAdd.length <= 0) ? $q.when(true) :
            DynamicApiService.postMultiple('Ingredient_ProdCategoryAssoc', tableToAdd).then(function (result) {
                $scope.registersToAdd = {}; return true;
            }).catch(function (result) { tosterFactory.showCustomToast('Insert Ingredient association failed', 'fail'); return false; });
        //Delete  promise to all assocs that are on deleted map
        var deletePromise = (tableToDel.length <= 0) ? $q.when(true) :
            DynamicApiService.deleteMultiple('Ingredient_ProdCategoryAssoc', tableToDel).then(function (result) {
                $scope.registersToDelete = {}; return true;
            }).catch(function (result) {
                if ($scope.flag == 0) {
                tosterFactory.showCustomToast('Deleting association failed', 'fail'); return false;
                }
                    })

        //Update Promise for is edited containers and assocs
        var updatePromise = (edited.length <= 0) ? $q.when(true) :
            DynamicApiService.putMultiple('Ingredient_ProdCategoryAssoc', edited).then(function (result) {
                $scope.registersToDelete = {}; return true;
            }).catch(function (result) {
                if ($scope.flag == 0) {
                    tosterFactory.showCustomToast('Modified associations failed', 'fail'); return false;
                }
            })

        if (tableToAdd.length > 0 || tableToDel.length > 0 || edited.length > 0) {
            console.log('Saving add:' + tableToAdd.length + ' del:' + tableToDel.length + ' edit:' + edited.length)
            $q.all([postPromise, deletePromise, updatePromise]).then(function (d) {
                if (d[0] == true && d[1] == true && d[2] == true) {
                    tosterFactory.showCustomToast('Changes Saved add:' + tableToAdd.length + ' del:' + tableToDel.length + ' edit:' + edited.length, 'success');
                    reinitiallizeview();
                } else {
                    var errorstr = '';
                    if (d[0] != true) errorstr += ' adding' + tableToAdd.length;
                    if (d[1] != true) errorstr += ' deleting:' + tableToDel.length;
                    if (d[2] != true) errorstr += ' editing:' + edited.length;
                    var savedailog = $mdDialog.confirm().title('Error on Save').textContent('Multi save action failed on' + errorstr).ariaLabel('ingrassocdelete' + key).ok('Reload').cancel('Cancel');
                    $mdDialog.show(savedailog).then(function () {
                        reinitiallizeview();
                    }).catch(function () {

                    })
                }
            }).finally(function () { $scope.savingProcess = false; });
        } else {
                tosterFactory.showCustomToast('There are no changes to save.', 'info');
                $scope.savingProcess = false;
            
            }

    }
    function manageRegistersToRest(entityArray) {

    }

    function reinitiallizeview() {
        $scope.selectedProductCategory = null; $scope.productCategoryEnum = {};
        $scope.searchloadedingrs = ''; $scope.selectedIngedient = null;
        $scope.containerObjects = {};
        $scope.selectedContainerObj = null;
        $scope.initView();
    }


    //Ingredients available to add  based on selected assosiated product category 
    $scope.filterContainerIngrs = function (ingr) {
        if ($scope.selectedContainerObj == null || $scope.selectedContainerObj == undefined) return true;
        if ($scope.searchloadedingrs.length == 0 || $scope.searchloadedingrs.length == '') {
            return true;
        } else {
            var expected = ('' + $scope.searchloadedingrs).toLowerCase();
            var actual = ('' + $scope.ingredientsEnum[ingr.IngredientId]).toLowerCase();
            var c = ('' + $scope.lookupArrays['Ingredients'][ingr.IngredientId]['Code']).toLowerCase();
            if (actual.indexOf(expected) > -1) return true;
            if (c.indexOf(expected) > -1) return true;
            return false;
        }
    }
    $scope.searchingrsFilter = function (ingr) {
        if ($scope.searchingrs == null) {
            return true;
        } else {
            var expected = ('' + $scope.searchingrs).toLowerCase();
            var actual = ('' + ingr.Description).toLowerCase();
            var c = ('' + ingr.Code).toLowerCase();
            if (actual.indexOf(expected) > -1) return true;
            if (c.indexOf(expected) > -1) return true;
            return false;
        }
    }
    
    //Ingredients Filter based on pCat Selected panel
    $scope.filterIngrs = function (ingr) {
        if ($scope.selectedContainerObj == null || $scope.selectedContainerObj == undefined) return true;
        for (var i = 0; i < $scope.selectedContainerObj.length; i++) {
            if ($scope.selectedContainerObj[i].IngredientId == ingr.Id) return false;
        } return true;
    }

    //Global Handle Functions
    //Select/Unselect force by givven arr , true/false , obj.SelectionEntity 
    $scope.toggleSelection = function (arr, value, selectvalue) {
        var sval = (selectvalue != undefined) ? selectvalue : 'selected',
            rarr = (arr != undefined) ? arr : [],
            boolval = (value != undefined) ? value : false;
        angular.forEach(rarr, function (ai) {
            ai[sval] = boolval;
        })
    }
    $scope.devActions = [
        { action: $scope.displayLookups, arialabel: 'dev-log-container', desc: 'Log Lookups' },
        { action: $scope.displayContainer, arialabel: 'dev-log-container', desc: 'Log Container' },
        { action: $scope.displaylogs, arialabel: 'dev-log-crud-array', desc: 'Log Changes' },
        { action: $scope.displayLoadedAssocs, arialabel: 'dev-log-loaded-assocs', desc: 'Log Loaded Assocs' },
    ];
    //Debug - Develop Functions

    $scope.displayLoadedAssocs = function () { console.log($scope.databaseLoadedAssocs); }
    $scope.displayContainer = function () { console.log($scope.containerObjects); }
    $scope.displaylogs = function () {
        console.log('RegistersToDelete'); console.log($scope.registersToDelete);
        console.log('Registers to Add'); console.log($scope.registersToAdd);
    }
    $scope.displayLookups = function () {
        console.log('Product Category Lookups:');
        console.log($scope.productCategoryEnum);
        console.log($scope.productCategoryArrayOptions);
        console.log('Ingredient Lookups:');
        console.log($scope.ingredientsEnum);
        console.log($scope.ingredientsArrayOptions);
        console.log('Ingredient Assocs Lookups:');
        console.log($scope.ingredientAssocsEnum);
        console.log($scope.ingredientAssocsArrayOptions);
    }


}

