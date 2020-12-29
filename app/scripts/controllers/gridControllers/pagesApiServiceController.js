'use strict';
/**
 * @ngdoc function
 * @name posBOApp.controller:DeparmentsServiceController
 * @description
 * # DepartmentsController
 * Controller of the posBOApp
 */

angular.module('posBOApp')
.controller('PagesController', PagesController)
.controller('ExtFilterCtrl', ExtFilterCtrl)
.factory('EnumFactory', EnumFactory)
.directive('ngEnter', ngEnter)
function PagesController(tosterFactory, $stateParams, $scope, $filter, $q, $mdDialog, DynamicApiService, dataUtilFactory, EnumFactory, config) {
    // $http,$log,$interval, $timeout,$window, uiGridConstants, uiGridGroupingConstants,GridInitiallization,uiGridFactory,
    //http://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/multi
    $scope.switchStatus = false; $scope.searchProd = {}; $scope.dirtyView = false; //use this to init view
    $scope.initView = function () {
        $scope.devAccess = (config.workPolicy == 'dev') ? true : false;
        var PriceListPromise = $scope.getDropDownLookUps('PriceList'); var SalesTypePromise = $scope.getDropDownLookUps('SalesType');
        var CategoriesPromise = $scope.getDropDownLookUps('Categories'); var ProductCategoriesPromise = $scope.getDropDownLookUps('ProductCategories');
        var PosInfoPromise = $scope.getDropDownLookUps('PosInfo');
        $scope.dragging = false; $scope.loadPageSets();
        $scope.selectType = true; //if this true <--- single select
        $scope.multiEdit = false; //more than 1 selected on multiselect mode make this true
        //init of pageButton
        $scope.selectPageButton($scope.buttonEntity);
        $q.all([SalesTypePromise, PriceListPromise]).then(function () { $scope.categoryfiltersChanged(); manageTitleMaps(); })
        $scope.defaultButton = { width: '120px', height: '80px', };
    };
    $scope.$watch("pageButtons", function (value) {//I change here
        var val = value || null;
        if (val && document.getElementById('draggable-list-component')) { resizeButtons(); }
    });
    function resizeButtons() {
        var w = (document.getElementById('draggable-list-component').clientWidth - 70) / 6;
        var h = (2 / 3) * w;
        $scope.defaultButton = { width: w + 'px', height: h + 'px', }
    }
    $scope.enterKeySearchProduct = function (searchProdDesc) { $scope.exFilterModel.Description = searchProdDesc; $scope.paggination.page = 0; $scope.categoryfiltersChanged(); }
    $scope.enterKeySearchProductCode = function (searchProdCode) { $scope.exFilterModel.ProductCode = searchProdCode; $scope.paggination.page = 0; $scope.categoryfiltersChanged(); }
    $scope.dirtyExSearch = false;
    //Products Filtered Call
    $scope.categoryfiltersChanged = function () {
        ($scope.exFilterModel.ProductCode == "" && $scope.exFilterModel.ProductCategoryId === null && $scope.exFilterModel.CategoryId === null) ? $scope.dirtyExSearch = false : $scope.dirtyExSearch = true;
        var controllerName = "BOPageSets", actionName = "GetPagedProducts";
        var params = 'filters=' + JSON.stringify($scope.exFilterModel) + '&page=' + $scope.paggination.page + '&pageSize=' + $scope.paggination.pageSize
        var ProductsPromise = DynamicApiService.getAttributeRoutingData(controllerName, actionName, "", params).then(function (result) { //Rest Get call for data using Api service to call Webapi
            tosterFactory.showCustomToast('Products loaded successfully', 'success');
            $scope.totalItems = result.data.RowCount;
            $scope.maxSize = 3; //size of buttons in pag 
            $scope.currentPage = result.data.CurrentPage;
            $scope.numPages = result.data.PageCount;
            $scope.paggination.pageSize = $scope.pageSize = result.data.PageSize;

            $scope.paggination.page = result.data.CurrentPage;
            $scope.paggination.pageSize = result.data.PageSize;
            $scope.products = result.data.Results;
        }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Pages failed', 'fail'); console.warn('Get action on server failed. Reason:'); console.warn(rejection); });
    }
    //Rest Call function to Load Pagesets in DB and init PageSet DropDown
    $scope.loadPageSets = function (toselectId) {
        return (DynamicApiService.getAttributeRoutingData("BOPageSets", "GetAllPageSets", "", "").then(function (result) { //Rest Get call for data using Api service to call Webapi
            $scope.pageSetGroups = dataUtilFactory.groupTo(result.data, 'Id'); $scope.pageSetDropDownArray = [];
            var tmparr = [];
            angular.forEach($scope.pageSetGroups, function (value, key) {
                if (value[0]['Description'] === undefined || value[0]['Description'] === null)
                    value[0]['Description'] = value[0]['Id'];
                tmparr.push(value[0]);
            })
            $scope.pageSetDropDownArray = tmparr;
            if (toselectId !== undefined && toselectId !== null && typeof toselectId == 'number' && toselectId > 0) {
                var tmpis = $scope.pageSetDropDownArray.filter(function (item) { return item.Id == toselectId })
                if (tmpis.length > 1) { alert('Selected Pageset seams to exist as dublicate in pageset list.'); return; }
                $scope.pageSetChanged(tmpis[0]);
                $scope.selectedPageSet = tmpis[0];
            }
        }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Pagesets failed', 'fail'); console.warn('Get action on server failed. Reason:'); console.warn(rejection); }));
    }

    $scope.pageButtons = [];
    //Action Event raised on 1st Dropdown of PageSet select 
    $scope.pageSetChanged = function (selectedPS, reselectPage) {
        if (selectedPS == undefined) return;

        $scope.selectedPageSet = selectedPS;
        $scope.deletedButtons = []; $scope.pageButtons = []; $scope.dragging = false; $scope.selectedPage = null; $scope.pagesLoaded = []; $scope.pagesDropDownArray = [];
        var controllerName = "BOPageSets", actionName = "GetAllPages", extraFields = selectedPS.Id;
        var loadPagePromise = DynamicApiService.getAttributeRoutingData(controllerName, actionName, extraFields).then(function (result) { //Rest Get call for data using Api service to call Webapi
            var sort = dataUtilFactory.createEnums(result.data, {}, 'Sort', 'Id');
            $scope.possibleSorts = [], $scope.maxPageSort = -1;
            for (var i = 0; i < result.data.length; i++) {
                if (result.data[i]['Sort'] > $scope.maxPageSort)
                    $scope.maxPageSort = result.data[i]['Sort'];
            }
            angular.forEach(result.data, function (item) { if (item.Sort === null || item.Sort === undefined) { $scope.maxPageSort += 1; item.Sort = $scope.maxPageSort; } })
            $scope.pagesLoaded = $scope.pagesDropDownArray = dataUtilFactory.quicksort(result.data, 'Sort'); //result.data;
            $scope.dirtySortPages = [];
            for (var i = 0; i < $scope.pagesLoaded.length; i++) {
                if ($scope.pagesLoaded[i].Sort != i + 1) {
                    $scope.pagesLoaded[i].Sort = i + 1;
                    $scope.dirtySortPages.push($scope.pagesLoaded[i]);
                }
            }

            var tenum = dataUtilFactory.createEnums($scope.pagesLoaded, {}, 'Id', 'Description');
            var tempTitleMap = dataUtilFactory.createMapDropdown(tenum);
            angular.forEach($scope.pbForm, function (value, key) {
                if (angular.isObject(value) && value.titleMap !== undefined && value.key == "NavigateToPage") {
                    value.titleMap = angular.copy(tempTitleMap)
                    value.titleMap.unshift({ name: "---", value: null })
                }
            })
        }).catch(function (rejection) {
            $scope.dirtySortPages = [];
            angular.forEach($scope.pbForm, function (value, key) {
                if (angular.isObject(value) && value.titleMap !== undefined && value.key == "NavigateToPage")
                    value.titleMap = [];
            })
            tosterFactory.showCustomToast('Loading Pages failed', 'fail');
            console.log('Fail Load'); console.warn(rejection);
        });
        loadPagePromise.then(function () {
            if ($scope.dirtySortPages !== undefined && $scope.dirtySortPages.length > 0)
                manageDirtySorts();
        }, function (reason) { }).finally(function () {
            console.log('finally reselect page operation:' + reselectPage);
            if (reselectPage != undefined) {
                $scope.pageChanged(reselectPage);
            }
        });

    }
    function manageDirtySorts() {
        var sortPageDialog =
            $mdDialog.confirm().title('Dirty pages of Sort field')
            .htmlContent('<strong>Pages loaded for current set has invalid sort fields</strong><br /><br /><strong>Continue with auto correct or manage pages order on edit PageSet.</strong><br />')
            .ariaLabel('sort-dirty-pagesorts').ok('Correct').cancel('Cancel');
        $mdDialog.show(sortPageDialog).then(function (reason) {
            var pagesToAdd = [];
            for (var i = 0; i < $scope.pagesLoaded.length; i++) {
                $scope.pagesLoaded[i].Sort = i + 1;
                pagesToAdd.push($scope.pagesLoaded[i]);
            }
            $scope.selectedPageSet.Pages = pagesToAdd;
            $scope.updatePageSet($scope.selectedPageSet);
        });
    }
    //action button of pageset to insert or update
    //in this modal you can edit form refs 
    //add or copy a pageset for pages
    //order current pages
    //associate POSs
    $scope.addPageSet = function (actionChoice) {
        if (actionChoice == "Update" && $scope.selectedPageSet == null) {
            tosterFactory.showCustomToast('Please select a pageset to edit', 'info');
            return;
        }
        var PagePosAssocDTO = [];
        angular.forEach($scope.posInfo, function (value) {
            var tmp = { value: value.Id, name: value.Description }
            PagePosAssocDTO.push(tmp);
        })
        var pagearray = [];
        (actionChoice == "Update") ? (pagearray = dataUtilFactory.quicksort($scope.pagesDropDownArray, 'Sort')) : (pagearray = []); //result.data;
        if ($scope.selectedPage !== null && $scope.selectedPage !== undefined) {
            pagearray = pagearray.filter(function (item) {
                if (item.Id == $scope.selectedPage.Id)
                    item.PageButtons = $scope.pageButtons;
                return item;
            })
        }
        $mdDialog.show({
            templateUrl: '../app/scripts/directives/modal-directives/add-new-pageSet.html', controller: 'AddPageSetCtrl', controllerAs: 'mps', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
            resolve: {
                posarray: function () { return PagePosAssocDTO; },
                pageset: function () { return $scope.selectedPageSet; },
                pcats: function () { return $scope.productCategories },
                pagesetArray: function () { return $scope.pageSetDropDownArray; },
                actionInit: function () { return actionChoice; },
                pages: function () { return pagearray; }
            }
        }).then(function (data) {
            var objArr = [];
            switch (data.action) {
                case 'Insert':
                    angular.forEach(data.pageSet.selectedPos, function (value) {
                        var tmp = {
                            Id: 0, PageSetId: 0, PosInfoId: value,
                            PosInfoDescription: $scope.posInfoEnum[value], IsDeleted: false
                        }
                        objArr.push(tmp);
                    })
                    data.pageSet.AssosiatedPos = objArr;
                    $scope.insertPageSet(data);
                    break;
                case 'Update':
                    angular.forEach(data.pageSet.AssosiatedPos, function (curr) {
                        var res = []; res = data.pageSet.selectedPos.filter(function (item) { return (item == curr.PosInfoId); });
                        //not found in list so mark it as deleted
                        if (res.length == 0) { curr.IsDeleted = true; objArr.push(curr); }
                        if (res.length == 1) {
                            var list = []; list = data.pageSet.selectedPos.filter(function (item) { return (item != curr.PosInfoId); });
                            data.pageSet.selectedPos = list;
                        }
                        if (res.length > 1) { alert('Critical Error On selectedPos before management. Pageset has assosiated Pos that does not exist on loaded Poslist'); return; }
                    })
                    //rest POS entities to add
                    var psid = data.pageSet.Id;
                    angular.forEach(data.pageSet.selectedPos, function (value) { //map POS.Ids from modal to pos entities
                        var tmp = { Id: 0, PageSetId: psid, PosInfoId: value, PosInfoDescription: $scope.posInfoEnum[value], IsDeleted: false };
                        objArr.push(tmp);
                    })
                    data.pageSet.AssosiatedPos = objArr;

                    for (var i = 0; i < data.pages.length; i++) {
                        if (data.pages[i].PageButtons.length > 0 && data.pages[i].Id == $scope.selectedPage.Id) {
                            var it = data.pages[i];
                            for (var j = 0; j < it.PageButtons.length; j++) {
                                if (it.PageButtons[j].Sort != j) {
                                    it.PageButtons[j].isEdited = true;
                                    it.PageButtons[j].Sort = j;
                                }
                            }
                            var edited = it.PageButtons.filter(function (item) { if (item.isEdited == true) return item; })
                            it.PageButtons = $scope.deletedButtons.concat(edited);
                            data.pages[i] = it;
                        } else if (data.pages[i].PageButtons.length > 0 && data.pages[i].Id != $scope.selectedPage.Id) {
                            alert('Error on managing Pageset sort');
                            return;
                        }
                    }
                    if (data.pages.length > 0)
                        data.pageSet.Pages = angular.copy(data.pages);
                    $scope.updatePageSet(data);
                    break;
                default: break;
            }
        }, function () { })
    }
    $scope.insertPageSet = function (data) {
        var resource = '';
        var parseData;
        $scope.pageButtons = []; $scope.deletedButtons = []; $scope.selectedPage = null; $scope.selectedPageSet = null; $scope.pagesDropDownArray = [];
        var resource = '';
        if (data.insModel.type == 'empty' || data.insModel.typeArray.length == 0) {
            resource = 'AddPageSet';
            parseData = data.pageSet;
        } else if (data.insModel.type == 'copy' && data.insModel.typeArray.length != 0) {
            var pid = data.insModel.typeArray[0].PageSetId;
            resource = 'CopyFromPageSet?sourcePageSetId=' + pid;
            data.pageSet.Pages = data.insModel.typeArray;
            parseData = data.pageSet;
        } else {
            tosterFactory.showCustomToast('No action Performed', 'info'); return;
        }
        DynamicApiService.postAttributeRoutingData("BOPageSets", resource, parseData).then(function (result) {
            $scope.loadPageSets();
        }).catch(function (rejection) {
            tosterFactory.showCustomToast('Insert PageSet failed', 'fail');
            console.warn('Post action on server failed. Reason:'); console.warn(rejection);
        });
    }

    $scope.updatePageSet = function (data) {
        var resource = '';
        if (data.insModel !== undefined && data.insModel.typeArray !== undefined && data.insModel.typeArray.length > 0) {//zavara edw
            data.pageSet.Pages = data.pageSet.Pages.concat(data.insModel.typeArray);
            var pid = data.insModel.typeArray[0].PageSetId;
            resource = "UpdateFromPageSet?sourcePageSetId=" + pid;
        } else {
            resource = "UpdatePageSet";
        }
        //console.log('Zavara save:'); console.log(data.insModel);
        var ent = (data.pageSet !== undefined) ? data.pageSet : data;
        return (DynamicApiService.putAttributeRoutingData("BOPageSets", resource, ent).then(function (result) { //Rest Get call for data using Api service to call Webapi
            updateUIVarsOnPageSetChange();
        }).catch(function (rejection) {
            tosterFactory.showCustomToast('Updating PageSet failed', 'fail');
            console.warn('Get action on server failed. Reason:'); console.warn(rejection);
        }));
    }
    function updateUIVarsOnPageSetChange() {
        $scope.pageButtons = []; $scope.deletedButtons = []; $scope.selectedPage = null; $scope.pagesDropDownArray = []; $scope.searchPageText = '';
        var backupId = $scope.selectedPageSet.Id;
        $scope.selectedPageSet = null;
        $scope.pageOptionEntity = angular.copy(insPageSFE.entity);
        $scope.pbEntity = angular.copy($scope.btnSFE.entity);
        $scope.loadPageSets(backupId);
    }
    $scope.deletePageSet = function () {
        //console.log('Deleting PageSet:'); console.log($scope.selectedPageSet);
        if ($scope.selectedPageSet == null || $scope.selectedPageSet === undefined) {
            tosterFactory.showCustomToast('Invalid selection of pageset', 'info');
            //console.log('Trying to delete Selected Pageset of empty or undefined.');
            return;
        }
        var deletePageDialog =
            $mdDialog.confirm().title('Deleting "' + $scope.selectedPageSet.Description + '" pageSet')
            .htmlContent('You are about to delete selected pageset.<br>Are you sure you want to continue?<br><br><br>'
            + '<small>*Pageset will affect any mapped POS associated , pages and page buttons and will send an update message on current online maps.</small>')
            .ariaLabel('deleting-selected-pageset').ok('Delete').cancel('Cancel');
        $mdDialog.show(deletePageDialog).then(function () {
            DynamicApiService.deleteAttributeRoutingDataForce("BOPageSets", "DeletePageSet", $scope.selectedPageSet.Id).then(function (result) { //Rest Get call for data using Api service to call Webapi
                updateUIVarsOnPageSetChange();
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Delete PageSet failed', 'fail');
                console.warn('Delete action on server failed. Reason:'); console.warn(rejection);
            })
        });
    }
    //Delete selected page action
    $scope.deletePage = function () {
        //if no page selected
        if ($scope.selectedPage == null || $scope.selectedPage === undefined) {
            tosterFactory.showCustomToast('Trying to delete Selected Page of empty or undefined.', 'info');
            return;
        }
        //apply conf msg 
        var deletePageDialog = $mdDialog.confirm().title('Deleting "' + $scope.selectedPage.Description + '" page')
        .htmlContent('You are about to delete "selected" page.<br>Are you sure you want to continue?<br><br><br>*Page set will auto update and reload after confirmation.').ariaLabel('deleting-selected-page').ok('Delete').cancel('Cancel');
        $mdDialog.show(deletePageDialog).then(function () {
            //proceed to delete not saved new page
            if ($scope.selectedPage.Id == 0) {
                tosterFactory.showCustomToast('Unsaved Page discarded successfully.', 'info');
                updateUIVarsOnPageSetChange();
                return;
            } else if ($scope.selectedPage.Id !== undefined && $scope.selectedPage.Id !== null && $scope.selectedPage.Id > 0) {
                //apply pageset update functionality with pages[].isDeleted = true on selected Id
                var pagearray = angular.copy($scope.pagesDropDownArray)
                if ($scope.selectedPage !== null && $scope.selectedPage !== undefined) {
                    pagearray = pagearray.filter(function (item) {
                        if (item.Id == $scope.selectedPage.Id) {
                            item.IsDeleted = true;
                        }
                        return item;
                    })
                }
                $scope.selectedPageSet.Pages = pagearray;
                $scope.updatePageSet($scope.selectedPageSet); return;
            }
        })
    }
    //Action event raised on 2nd dropDown
    //of CurrentPageset  Available Pages
    $scope.pageChanged = function (selectedP) {
        if (selectedP == undefined) return;
        if ($scope.selectedPage == null) $scope.selectedPage = selectedP;

        $scope.spagebuttonslength = 0; $scope.deletedButtons = []; $scope.pageButtons = []; $scope.dragging = false; $scope.pageOptionEntity = selectedP;
        var controllerName = "BOPageSets", actionName = "GetButtons", extraFields = selectedP.Id;
        if (extraFields == undefined || extraFields == 0)
            return;
        DynamicApiService.getAttributeRoutingData(controllerName, actionName, extraFields).then(function (result) { //Rest Get call for data using Api service to call Webapi
            angular.forEach(result.data, function (item) {
                item.selected = false;

                if (item.Type == 8) item.IsOpen = true;
                else if (item.Type == 10) item.IsWeighted = true;
                else if (item.Type == 11) { item.IsOpen = true; item.IsWeighted = true; }
                else { item.IsOpen = false; item.IsWeighted = false; }
                //Product    
                if (item.Type == 1 && typeof (item.ProductId) != 'number') item.hasError = true;
                //SalesTypes
                if (item.Type == 2 && typeof (item.SetDefaultSalesType) != 'number') item.hasError = true;
                //Navigate
                if (item.Type == 5 && typeof (item.NavigateToPage) != 'number') item.hasError = true;
                //NavWithPricelist
                if (item.Type == 6 && (typeof (item.SetDefaultPriceListId) != 'number' || typeof (item.NavigateToPage) != 'number')) item.hasError = true;
                //Pricelist
                if (item.Type == 7 && typeof (item.SetDefaultPriceListId) != 'number') item.hasError = true;
                if (item.Sort === null || item.Sort === undefined) { tosterFactory.showCustomToast('Button ' + item.Description + ' has null Sortfield', 'warning'); item.Sort = 2; }
            })
            var tmparra = dataUtilFactory.createEnumsAndEnumObjs(result.data, {}, {}, 'Id', 'Description').retEnumObj;
            $scope.loadedPageButtons = angular.copy(tmparra);
            $scope.pageButtons = dataUtilFactory.quicksort(result.data, 'Sort'); //result.data;
        }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Pages failed', 'fail'); console.log('Fail Load'); console.log(rejection); });
    }

    function checkValidToChange() {
        if ($scope.selectedPage !== null) {
            if ($scope.selectedPage.Id == 0) { tosterFactory.showCustomToast('Please save current page then add a new', 'info'); return false; }
            for (var i = 0; i < $scope.pageButtons.length; i++) {
                if ($scope.pageButtons[i].isEdited == true) {
                    $scope.editedPageButtons = true;
                    tosterFactory.showCustomToast('Please save current page then add a new', 'info'); return false;
                }
            }
        }
        return true;
    }
    //open modal to ins new page via Dynamic form Handler
    $scope.addPage = function () {
        if ($scope.selectedPageSet === undefined || $scope.selectedPageSet === null) { tosterFactory.showCustomToast('Please select a Pageset', 'info'); return; }
        if (checkValidToChange() == false) return;
        var dataEntry = angular.copy($scope.emptyPage); //create an empty page
        dataEntry.PageSetId = $scope.selectedPageSet.Id; //assign selected pageset
        //form params
        var formModel = { entityIdentifier: 'Page', forceTitle: 'Add new Page', dropDownObject: { PageSetId: $scope.pageSetDropDownArray, DefaultPriceListId: $scope.priceLists }, };
        $mdDialog.show({
            controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
            resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
        }).then(function (data) { //on save button confirm 
            var newPage = data, maxSort = -1;
            for (var i = 0; i < $scope.pagesLoaded.length; i++) {
                if ($scope.pagesLoaded[i]['Sort'] > maxSort) maxSort = $scope.pagesLoaded[i]['Sort'];
            }
            maxSort += 1; newPage.Sort = maxSort;

            $scope.deletedButtons = []; $scope.dragging = false;
            $scope.pageOptionEntity = $scope.selectedPage = newPage;
            $scope.selectedPage.PageButtons = $scope.pageButtons = [];
            //dropdown manage
            $scope.pagesDropDownArray.unshift($scope.selectedPage);
            //console.log('Adding new page'); console.log($scope.pageOptionEntity);
            //manage Form
        }, function (reason) { });
    };

    //var to init Mutlti CheckBox  Button 
    $scope.selectAll = false;
    //Fuction triggered in MutiSelect Click 
    $scope.toggleSelection = function () {
        ($scope.selectAll == true) ? $scope.selectAll = false : $scope.selectAll = true;
        angular.forEach($scope.products, function (item) { item.selected = $scope.selectAll; })
    }
    //Variables and function to change Dropdown list on Left Panel
    $scope.insertType = "Products";
    $scope.insertTypeOptions = ["Categories", "ProductCategories", "Products"];
    $scope.selectDropOption = function (choice) { $scope.insertType = choice; }
    //FILTERED REST PRODUCT Procedures
    //Collapse panel filters button action $$tip: move this to a directive on this controller
    //Filter Model var used to display filters in collapse filtered search
    $scope.openExtFilter = function () {
        $scope.exFilterModel['Description'] = ($scope.searchProd['Description'] !== undefined) ? $scope.searchProd['Description'] : '';
        $mdDialog.show({
            controller: 'ExtFilterCtrl', templateUrl: '../app/scripts/directives/modal-directives/page-product-external-filter-template.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
            resolve: { productCategories: function () { return $scope.productCategories; }, categories: function () { return $scope.categories }, paggination: function () { return $scope.paggination; }, exFilterModel: function () { return $scope.exFilterModel; }, }
        }).then(function (data) {
            if (data == -1) {
                $scope.clearCatFilters();
            } else if (data != -1 && data !== undefined && data !== null) {
                data.ProductCategoryId = (data.ProductCategoryId != '' && data.ProductCategoryId != null) ? parseInt(data.ProductCategoryId) : null;
                data.CategoryId = (data.CategoryId != '' && data.CategoryId != null) ? parseInt(data.CategoryId) : null;
                $scope.paggination.pageSize = (data.pageSize != '' && data.pageSize != null) ? parseInt(data.pageSize) : null;
                $scope.exFilterModel = angular.extend($scope.exFilterModel, data);
                $scope.searchProd['Description'] = $scope.exFilterModel.Description;
            }
            $scope.categoryfiltersChanged($scope.exFilterModel);
        })
    }

    $scope.exFilterModel = { Description: '', ProductCode: '', ProductCategoryId: null, CategoryId: null };
    $scope.clearCatFilters = function () {
        $scope.exFilterModel = { Description: '', ProductCode: '', ProductCategoryId: null, CategoryId: null, } //ProductCategoryDesc : '', ProductCategoryCode : '', CategoryDesc : '',
        $scope.dirtyExSearch = false; $scope.searchProd.Description = '';
    }

    $scope.paggination = { page: 0, pageSize: 50 }
    $scope.getDropDownLookUps = function (entity) {
        switch (entity) {
            case "SalesType":
                return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { $scope.salesTypes = result.data; }).catch(function (rejection) { tosterFactory.showCustomToast('Loading SalesType Lookups failed', 'fail'); console.warn('Get action on server failed. Reason:'); console.warn(rejection); })); break;
            case "PriceList":
                return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { $scope.priceLists = result.data; }).catch(function (rejection) { tosterFactory.showCustomToast('Loading PriceList Lookups failed', 'fail'); console.warn('Get action on server failed. Reason:'); console.warn(rejection); })); break;
            case "Categories":
                return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { $scope.categories = result.data; }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Categories Lookups failed', 'fail'); console.warn('Get action on server failed. Reason:'); console.warn(rejection); })); break;
            case "ProductCategories":
                return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { $scope.productCategories = result.data; }).catch(function (rejection) { tosterFactory.showCustomToast('Loading ProductCategories Lookups failed', 'fail'); console.warn('Get action on server failed. Reason:'); console.warn(rejection); })); break;
            case "PosInfo":
                return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { $scope.posInfo = result.data; $scope.posInfoEnum = dataUtilFactory.createEnums(result.data, {}, 'Id', 'Description'); }).catch(function (rejection) { tosterFactory.showCustomToast('Loading PosInfo Lookups failed', 'fail'); console.warn('Get action on server failed. Reason:'); console.warn(rejection); })); break;
            case "Payrole":
                return (DynamicApiService.getDynamicObjectData(entity, '').then(function (result) { $scope.Payrole = result.data; }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Payrole Lookups failed', 'fail'); console.warn('Get action on server failed. Reason:'); console.warn(rejection); })); break;
            default: break;
        }
    }
    $scope.emptyPage = { DefaultPriceListId: "", Description: "", ExtendedDesc: "", Id: 0, PageButtons: [], PageSetId: null, Sort: null, Status: 1 };
    //get Category and Product Category Lists and returns an Array of Ids Selected 
    function arrSelectedIds(data) {
        var selectedData = $filter('filter')(data, function (item) { if (item.selected == true) return item; });
        selectedData = selectedData.map(function (item) { return item.Id; });
        return selectedData;
    }
    //Function call from adding Category and Product Category Products Included
    $scope.externalFilterCalls = function (filter) {
        //var params = 'filters=' + JSON.stringify(filter) + '&page=' + $scope.paggination.page + '&pageSize=' + $scope.paggination.pageSize
        //var controllerName = "BOPageSets", actionName = "GetPagedProducts";
        var params = 'filters=' + JSON.stringify(filter);
        var controllerName = "BOPageSets", actionName = "GetProducts";
        var ProductsPromise = DynamicApiService.getAttributeRoutingData(controllerName, actionName, "", params).then(function (result) { //Rest Get call for data using Api service to call Webapi
            tosterFactory.showCustomToast('Selected Categories Insert load successfully', 'success');
            console.warn('externalfillter success products');
            addProductToPageButton(result.data); //addProductToPageButton(result.data.Results); //this is used in pagged
        }).catch(function (rejection) { tosterFactory.showCustomToast('Loading Categories to ins failed', 'fail'); console.warn('Get action on server failed. Reason:'); console.warn(rejection); });
    }
    $scope.addPageButtonsCategory = function () {
        var valid = checkToAddButton();
        if (valid == false) { tosterFactory.showCustomToast('Make sure you have selected a PageSet and an additional Page.', 'info'); return; }
        var idarr = arrSelectedIds($scope.categories);
        if (idarr === undefined || idarr === null || idarr.length < 1) return;
        var filter = { CategoriesList: idarr };
        $scope.externalFilterCalls(filter);
        $scope.categories = $scope.categories.map(function (obj) { obj.selected = false; return obj; });

    }
    $scope.addPageButtonsProductCategory = function () {
        var valid = checkToAddButton();
        if (valid == false) {
            tosterFactory.showCustomToast('Make sure you have selected a PageSet and an additional Page.', 'info');
            return;
        }
        var idarr = arrSelectedIds($scope.productCategories);
        if (idarr === undefined || idarr === null || idarr.length < 1) return;
        var filter = { ProductCategoriesList: idarr };
        $scope.externalFilterCalls(filter);
        $scope.productCategories = $scope.productCategories.map(function (obj) { obj.selected = false; return obj; });

    }
    //left panel choice of add selected products from list displayed
    $scope.addPageButtonsProducts = function () {
        var valid = checkToAddButton();
        if (valid == false) { tosterFactory.showCustomToast('Make sure you have selected a PageSet and an additional Page.', 'info'); return; }
        var selectedProds = $filter('filter')($scope.products, function (item) { if (item.selected == true) return item; });
        addProductToPageButton(selectedProds);
        $scope.products = $scope.products.map(function (obj) { obj.selected = false; return obj; });
    }
    function checkToAddButton() {
        var pageOk = true; var pageSetOk = true;
        if ($scope.selectedPage === undefined || $scope.selectedPage === null) pageOk = false;
        if ($scope.selectedPageSet === undefined || $scope.selectedPageSet === null)
            pageSetOk = false;
        return (pageOk && pageSetOk);

    }
    //function takes product Array and Pushes Product to PageButton on Selected Page
    function addProductToPageButton(loopArr) {
        angular.forEach(loopArr, function (item) {
            var tButton = angular.copy($scope.buttonEntity);
            tButton.Id = 0;
            tButton.Description = item.Description;
            tButton.ProductId = item.ProductId;
            tButton.PriceListId = ($scope.selectedPage.DefaultPriceListId !== null && $scope.selectedPage.DefaultPriceListId !== undefined) ? $scope.selectedPage.DefaultPriceListId : null
            tButton.PageId = $scope.selectedPage.Id;
            tButton.Sort = $scope.pageButtons.length;
            tButton.Type = 1;
            tButton.isEdited = true;
            tButton.selected = false;
            $scope.pageButtons.push(tButton);
        })
    }
    //Used By contained of drag & drop
    $scope.selectedToDrag = { index: -1, length: -1 }; $scope.dragging = false;
    $scope.getSelectedItemsIncluding = function (list, item) {
        item.selected = true;
        var ret = list.filter(function (item) { return item.selected; });
        return ret;
    };
    $scope.onDragstart = function (list, event) {
        $scope.buDragList = angular.copy(list);
        $scope.dragging = true;
        if (event.dataTransfer.setDragImage) {
            var img = new Image();
        }
    };
    $scope.onDrop = function (list, items, index) {
        $scope.selectedToDrag = { index: index, length: items.length };
        angular.forEach(items, function (item) { item.selected = false; });
        list = list.slice(0, index).concat(items).concat(list.slice(index));
        $scope.pageButtons = list;
        $scope.dragging = false;
        return true;
    }
    $scope.onCanceled = function () {
        $scope.dragging = false;
        $scope.pageButtons = $scope.buDragList;
    }
    $scope.onMoved = function (list) {
        $scope.dragging = false;
        $scope.pageButtons = list.filter(function (item) { return (item.selected == false); });
    };
    //from lookups function called on Init View
    //Maps Form Entity Choices for dropdowns
    function manageTitleMaps() {
        //form of Page Properties
        angular.forEach($scope.pageOptionForm, function (value, key) {
            if (angular.isObject(value) && value.titleMap !== undefined) {
                if (value.key == 'DefaultPriceListId') {
                    var tenum = dataUtilFactory.createEnums($scope.priceLists, {}, 'Id', 'Description');
                    value.titleMap = dataUtilFactory.createMapDropdown(tenum);
                    value.titleMap.unshift({ name: "---", value: null })
                }
            }
        })
        //form to Button properties
        angular.forEach($scope.pbForm, function (value, key) {
            if (angular.isObject(value) && value.titleMap !== undefined) {
                if (value.key == 'SetDefaultPriceListId') {
                    var tenum = dataUtilFactory.createEnums($scope.priceLists, {}, 'Id', 'Description');
                    value.titleMap = dataUtilFactory.createMapDropdown(tenum);
                    value.titleMap.unshift({ name: "---", value: null })
                }
                if (value.key == 'SetDefaultSalesType') {
                    var tenum = dataUtilFactory.createEnums($scope.salesTypes, {}, 'Id', 'Description');
                    value.titleMap = dataUtilFactory.createMapDropdown(tenum);
                    value.titleMap.unshift({ name: "---", value: null })
                }
                if (value.key == 'NavigateToPage') {
                    var tenum = dataUtilFactory.createEnums($scope.pagesLoaded, {}, 'Id', 'Description');
                    value.titleMap = dataUtilFactory.createMapDropdown(tenum);
                    value.titleMap.unshift({ name: "---", value: null })
                }
            }
        })
    }
    //S-F-E for pageOptions
    var insPageSFE = getPageInsertModelSFE();
    $scope.pageOptionSchema = angular.copy(insPageSFE.schema);
    $scope.pageOptionForm = angular.copy(insPageSFE.form);
    $scope.pageOptionEntity = angular.copy(insPageSFE.entity);

    //S-F-E for Button Properties
    $scope.buttonEntity = {
        Id: -1, Description: "", Color: "rgb(255, 255, 255)", Background: "hsl(0, 0%, 0%)",
        PriceListId: null, NavigateToPage: null, SetDefaultSalesType: null, selected: false, PageId: null, Sort: null, //possition  in list
        SetDefaultPriceListId: null, Type: null, PreparationTime: null, ImageUri: '', Price: null, ProductId: null, IsDeleted: false
    }
    $scope.changeMode = function (type) { $scope.selectType = type; }
    //multi action Buttons  , select/unselect all 
    //clear selection action
    $scope.clearSelectedButtons = function () {
        angular.forEach($scope.pageButtons, function (item) { item.selected = false; })
        $scope.spagebuttonslength = 0; $scope.selectedPageButton = null; $scope.multiEdit = false;
    }
    //select all pb action
    $scope.selectAllButtons = function () {
        angular.forEach($scope.pageButtons, function (item) { item.selected = true; })
        $scope.spagebuttonslength = $scope.pageButtons.length;
        $scope.selectedPageButton = $scope.pageButtons[$scope.pageButtons.length - 1];
        $scope.multiEdit = true;
    }
    //remove selected pagebuttons
    $scope.deleteSelectedPageButtons = function () {
        var deleteDialog = $mdDialog.confirm().title('Deleting selected page buttons')
    .htmlContent('You are about to delete "selected" page buttons.<br>Are you sure you want to continue?<br><br><br>*although current page will not change until you save changes.')
    .ariaLabel('deleting-selected-page-buttons').ok('Delete').cancel('Cancel');
        $mdDialog.show(deleteDialog).then(function () {
            angular.forEach($scope.pageButtons, function (item) {
                if (item.selected == true) {
                    item.selected = false; item.IsDeleted = true;
                    if (item.Id !== undefined && item.Id !== null && item.Id != 0 && item.Id != -1) {
                        $scope.deletedButtons.push(item);
                    }
                }
            })
            var notdeled = $scope.pageButtons.filter(function (item) { return item.IsDeleted != true; });
            $scope.pageButtons = notdeled; $scope.spagebuttonslength = 0; $scope.selectedPageButton = null;
        })

    }
    $scope.sortPageButtons = function (field) {
        if ($scope.pageButtons == undefined || $scope.pageButtons.length < 1) {
            tosterFactory.showCustomToast('No Pagebuttons to sort.', 'info');
            return;
        }
        var sortfield = (field == undefined) ? 'Sort' : field;
        console.log('Sorting pagebuttons by :' + sortfield)
        var hasfield = [], hasnotfield = [];
        angular.forEach($scope.pageButtons, function (item) {
            if (item[sortfield] == undefined || item[sortfield] == '')
                hasnotfield.push(item);
            else {
                hasfield.push(item);
            }
        })
        var sorted = dataUtilFactory.quicksort(hasfield, sortfield);
        var ord = 0;
        sorted = sorted.concat(hasnotfield);
        sorted = sorted.map(function (pbi) {
            if (pbi.Sort != ord) {
                pbi.Sort;
                pbi.isEdited = true;
            }
            ord++;
            return pbi;
        })
        $scope.pageButtons = sorted;
    }
    //delete all pbs in current page
    $scope.deleteAllPageButtons = function () {
        var deleteDialog = $mdDialog.confirm().title('Deleting page buttons')
            .htmlContent('You are about to delete all page buttons in current page.<br>Are you sure you want to continue?<br><br><br>*although current page will not change until you save changes.').ariaLabel('deleting-all-page-buttons').ok('Delete').cancel('Cancel');
        $mdDialog.show(deleteDialog).then(function () {
            angular.forEach($scope.pageButtons, function (item) {
                item.selected = false; item.IsDeleted = true;
                if (item.Id !== undefined && item.Id !== null && item.Id != 0 && item.Id != -1) {
                    $scope.deletedButtons.push(item);
                }
            });
            $scope.pageButtons = []; $scope.spagebuttonslength = 0; $scope.selectedPageButton = null;
        })
    }

    //Array to push isDeleted == true  on action Button delete  and removed from $scope.pageButtons
    $scope.deletedButtons = [];
    $scope.deletePageButton = function (item) {
        var index = $scope.pageButtons.indexOf(item); if (index == undefined) alert('Undefined index');
        //if button exists or loaded in current page on DB 
        if (item.Id !== undefined && item.Id !== null && item.Id != 0 && item.Id != -1) { item.IsDeleted = true; $scope.deletedButtons.push(item); }
        $scope.pageButtons.splice(index, 1); //remove item from  Display list
    }
    //Special Buttons Insertion
    $scope.actionsButtonsClicked = function (actionName) {
        var newButton = angular.copy($scope.buttonEntity);
        newButton.Id = 0; newButton.PageId = $scope.selectedPage.Id; newButton.Background = "#32cd32"; newButton.Color = "rgb(51, 51, 51)"; newButton.isEdited = true; newButton.selected = false;
        newButton.Sort = ($scope.pageButtons.length == 0) ? 1 : $scope.pageButtons.length;
        if (actionName != 'empty') newButton.PriceListId = $scope.selectedPage.DefaultPriceList;

        switch (actionName) {
            case 'empty': newButton.Type = 0;
                break;
            case 'pricelist':
                newButton.Description = ($scope.selectedPage.DefaultPriceList != null) ? $scope.selectedPage.DefaultPriceList : $scope.priceLists[0].Description;
                newButton.SetDefaultPriceListId = ($scope.selectedPage.DefaultPriceList != null) ? $scope.selectedPage.DefaultPriceList : $scope.priceLists[0].Id;
                newButton.Type = 7;
                break;
            case 'navigate':
                var defPage = $scope.pagesLoaded.filter(function (item) { return item.Sort == 1; })
                var ndesc = ''; var nId = null;
                if (defPage === undefined || defPage === null || defPage.length == 0) {
                    tosterFactory.showCustomToast('No Page with sort 1 found...Assinging Current Page', 'info');
                    ndesc = $scope.selectedPage.Description;
                    nId = $scope.selectedPage.Id;
                } else {
                    if (defPage.length > 1)
                        tosterFactory.showCustomToast('More than pages with sort 1 found...Assing to:' + defPage[0].Description, 'info');
                    ndesc = defPage[0].Description;
                    nId = defPage[0].Id;
                }
                newButton.Description = ndesc; newButton.NavigateToPage = nId; newButton.Type = 5;
                break;
            case 'salesType': newButton.Description = $scope.salesTypes[0].Description; newButton.SetDefaultSalesType = $scope.salesTypes[0].Id; newButton.Type = 2; break;
            case 'kitchen': newButton.Description = "Kitchen Instruction"; newButton.Type = 9; break;
            default: break;
        }
        $scope.pageButtons.push(newButton);
    }
    $scope.btnSFE = getButtonSFE();
    $scope.pbEntity = angular.copy($scope.btnSFE.entity);
    $scope.pbForm = angular.copy($scope.btnSFE.form);
    $scope.pbSchema = angular.copy($scope.btnSFE.schema);
    $scope.multipbEntity = { Color: '', Background: '' };

    $scope.multipbForm = [
        {
            type: "section", htmlClass: "inlineFormDisplay",
            items: [
              {
                  type: "section", items: [{
                      fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', //htmlClass: 'col-md-6 col-xs-6 noPadding',
                      key: "Background", onChange: "valueChanged(form.key,modelValue)",
                      type: 'colorpicker',
                      colorFormat: 'hsl',
                      spectrumOptions: {
                          preferredFormat: 'hsl', showInput: true, showAlpha: true, showPalette: true, showSelectionPalette: true,
                          //containerClassName: 'col-md-6 col-xs-6 noPadding', replacerClassName: 'col-md-6 col-xs-6 noPadding',
                          change: function (color) { console.log(color.toHexString()); },
                          palette: [['black', 'white', 'blanchedalmond', 'rgb(255, 128, 0);', 'hsv 100 70 50'], ['red', 'yellow', 'green', 'blue', 'violet']]
                      }
                  }]
              },
              {
                  type: "section", items: [{
                      fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style',
                      key: "Color", onChange: "valueChanged(form.key,modelValue)",
                      type: 'colorpicker', colorFormat: 'rgb',
                      spectrumOptions: {
                          preferredFormat: 'rgb', showInput: true, showAlpha: true, showPalette: true, showSelectionPalette: true,
                          //containerClassName: 'col-md-6 col-xs-6 noPadding', replacerClassName: 'col-md-6 col-xs-6 noPadding',
                          change: function (color) { },
                          palette: [['black', 'white'], ['red', 'green']]
                      }
                  }]
              }
            ]
        }
    ];

    //Action click on Page Button
    $scope.selectPageButton = function (item) {
        $scope.dragging = false;
        item.selected = !item.selected;
        if ($scope.pageButtons === undefined || $scope.pageButtons.length == 0) { $scope.spagebuttonslength = 0; return; }
        if ($scope.selectType == true) {
            var backupvar = item.selected;
            var pbs = $scope.pageButtons.filter(function (it) { it.selected = false; return it; })
            item.selected = backupvar;
            $scope.pageButtons = pbs;
        }
        var buttons = $filter('filter')($scope.pageButtons, function (item) { if (item.selected == true) return item; });
        (buttons && buttons.length > 1) ? $scope.multiEdit = true : $scope.multiEdit = false;

        if ($scope.multiEdit == false) {
            if (buttons !== undefined && buttons.length == 1) {
                $scope.spagebuttonslength = 1;
                $scope.pbSchema = angular.copy($scope.btnSFE.schema);
                //$scope.pbEntity = tmpSFE.entity;
                if (buttons[0].Type == 1) {
                    $scope.loadingSpecDesc = true;
                    var params = 'filters=' + JSON.stringify({ ProductId: buttons[0].ProductId }) + '&page=' + $scope.paggination.page + '&pageSize=' + $scope.paggination.pageSize
                    var ProductsPromise = DynamicApiService.getAttributeRoutingData("BOPageSets", "GetPagedProducts", "", params).then(function (result) { //Rest Get call for data using Api service to call Webapi
                        $scope.loadingSpecDesc = false;
                        $scope.DescriptionSelectedButton = result.data.Results[0].Description;
                        $scope.CodeSelectedButton = result.data.Results[0].ProductCode;
                    }).catch(function (rejection) {
                        $scope.loadingSpecDesc = false; $scope.DescriptionSelectedButton = '';
                        tosterFactory.showCustomToast('Loading Categories to ins failed', 'fail');
                        console.warn('Loading productID form search failed. Reason:'); console.warn(rejection);
                    });
                } else { $scope.DescriptionSelectedButton = ''; }
                $scope.pbEntity = $scope.selectedPageButton = buttons[0];
            } else {
                $scope.selectedPageButton = null;
                $scope.spagebuttonslength = 0;
            }
        } else {
            $scope.spagebuttonslength = buttons.length;
        }
    }
    //Action Event Listens to Button Form Change  
    $scope.valueChanged = function (key, value) {
        if ($scope.multiEdit == true) {
            var tkey = key, loop = angular.copy($scope.pageButtons);
            angular.forEach(loop, function (item) {
                if (item.selected == true && (tkey == 'Color' || tkey == 'Background')) { item[tkey] = value; item.isEdited = true; }
            })
            $scope.pageButtons = loop;
        } else {
            if ($scope.selectedPageButton !== null && $scope.selectedPage !== undefined) {
                $scope.selectedPageButton[key] = value;
                if ((key != 'Color' && key != 'Background') || $scope.selectedPageButton.Id == 0) {

                    $scope.selectedPageButton.isEdited = true;
                } else {
                    if ($scope.selectedPageButton == undefined || $scope.selectedPageButton.Id == undefined || $scope.loadedPageButtons == undefined ||
                        $scope.loadedPageButtons[$scope.selectedPageButton.Id] == undefined || $scope.loadedPageButtons[$scope.selectedPageButton.Id].length == 0)
                        console.log('loadedPageButtons..');
                    else {
                        $scope.loadedPageButtons[$scope.selectedPageButton.Id]
                        if (key == 'Color' && value != $scope.loadedPageButtons[$scope.selectedPageButton.Id].Color) { $scope.selectedPageButton.isEdited = true; }
                        if (key == 'Background' && value != $scope.loadedPageButtons[$scope.selectedPageButton.Id].Background) { $scope.selectedPageButton.isEdited = true; }
                    }
                }
                var c  =  checkPBs();
                (c == false && $scope.deletedButtons.length == 0) ? $scope.editedPageButtons = false : $scope.editedPageButtons = true;
            }
        }
    };
    //Watchers in Button Form entity
    $scope.$watchGroup(['pbEntity.IsOpen', 'pbEntity.IsWeighted'], function (newValues, oldValues, scope) {
        //$scope.$watch('pbEntity.IsOpen', function (newValue, oldValue) {
        if ($scope.pbEntity.Type == 1 || $scope.pbEntity.Type == 8 || $scope.pbEntity.Type == 10 || $scope.pbEntity.Type == 11) {
            if ($scope.pbEntity.IsOpen == true && $scope.pbEntity.IsWeighted == true) $scope.pbEntity.Type = 11;
            else if ($scope.pbEntity.IsOpen != true && $scope.pbEntity.IsWeighted == true) $scope.pbEntity.Type = 10;
            else if ($scope.pbEntity.IsOpen == true && $scope.pbEntity.IsWeighted != true) $scope.pbEntity.Type = 8;
            else $scope.pbEntity.Type = 1;
        }
    });

    $scope.$watch('pbEntity.SetDefaultPriceListId', function (newValue, oldValue) {
        if ($scope.pbEntity.SetDefaultPriceListId !== null && $scope.pbEntity.NavigateToPage !== null) $scope.pbEntity.Type = 6;
    });
    $scope.$watch('pbEntity.NavigateToPage', function (newValue, oldValue) { if ($scope.pbEntity.SetDefaultPriceListId !== null && $scope.pbEntity.NavigateToPage !== null) $scope.pbEntity.Type = 6; });
    $scope.$watch('pbEntity.Color', function (newValue, oldValue) { $scope.valueChanged('Color', newValue); $scope.buttonEntity.Color = newValue; });
    $scope.$watch('pbEntity.Background', function (newValue, oldValue) { $scope.valueChanged('Background', newValue); $scope.buttonEntity.Background = newValue; });
    $scope.$watch('spagebuttonslength', function (newValue, oldValue) {
        if (newValue == 0 || newValue === undefined || newValue === null) {
            $scope.selectedPageButton = angular.copy($scope.buttonEntity);
            $scope.pbEntity = $scope.selectedPageButton;
        }
    });
    $scope.$watch('multipbEntity.Color', function (newValue, oldValue) { $scope.valueChanged('Color', newValue) });
    $scope.$watch('multipbEntity.Background', function (newValue, oldValue) { $scope.valueChanged('Background', newValue) });
    $scope.$watch('selectedPageSet', function (newValue, oldValue) {
        if (newValue == undefined) {
            $scope.clearSelectedButtons();
            $scope.pageButtons = []; $scope.deletedButtons = []; $scope.selectedPage = null; $scope.pagesDropDownArray = []; $scope.searchPageText = '';
            $scope.pageOptionEntity = angular.copy(insPageSFE.entity);
            $scope.pbEntity = angular.copy($scope.btnSFE.entity);
        }
    })
    $scope.$watch('selectedPage', function (newValue, oldValue) {
        if (newValue == undefined) {
            $scope.clearSelectedButtons();
            $scope.pageButtons = []; $scope.deletedButtons = [];
            if ($scope.selectedPageSet == undefined)
                $scope.pagesDropDownArray = [];
            $scope.pageOptionEntity = angular.copy(insPageSFE.entity); $scope.pbEntity = angular.copy($scope.btnSFE.entity);
            //$scope.editedPageButtons = false;
        }
    })

    $scope.$watch('pageButtons.length', function (newValue, oldValue) {
        console.log('Page Buttons changed');
        if (newValue == undefined) $scope.editedPageButtons = false;
        else {
            var c = checkPBs($scope.pageButtons);
            (c == false && $scope.deletedButtons.length == 0) ? $scope.editedPageButtons = false : $scope.editedPageButtons = true;
        }
    })
    function checkPBs(arr) {
        if (arr == undefined || arr.length == 0)
            return false;
        for (var i = 0; i < arr.length; i++) {
            var pbi = arr[i];
            if (pbi.isEdited != undefined && pbi.isEdited == true) {
                return true;
            }
        }
        return false;
    }
    $scope.discardChanges = function () {
        var msg = ($scope.selectedPage != undefined && $scope.selectedPage.Id !=undefined &&  $scope.selectedPage.Id == 0) ? '*Page editing is new. If you dont save you will loose current configuration and page will be removed.<br>*New pages have to be saved to get stored.':'';
        var discardDialog = $mdDialog.confirm().title('Unsaved changes').htmlContent('Current page has unsaved changes.<br> Continue editing current page and save or discard changes and reload page.<br><br><br><small>'+msg+'</small>')
            .ariaLabel('deleting-selected-page-buttons').ok('Discard').cancel('Cancel');
        $mdDialog.show(discardDialog).then(function () {
            $scope.clearSelectedButtons();
            updateUIVarsOnPageSetChange();
        });
    }
    $scope.saveCurrentPage = function () {
        if ($scope.selectedPage.Id == undefined || $scope.selectedPage == undefined) { alert('Invalid Page selection. \n Unable to save changes.\n Selected Page is empty or id is undefined'); return; }
        $scope.savingProcess = true;
        console.log('Saving..')
        for (var i = 0; i < $scope.pageButtons.length; i++) {
            if ($scope.pageButtons[i].Sort != i) { $scope.pageButtons[i].isEdited = true; $scope.pageButtons[i].Sort = i; }
        }
        var edited = $scope.pageButtons.filter(function (item) { if (item.isEdited == true) return item; })

        $scope.selectedPage.PageButtons = $scope.deletedButtons.concat(edited);
        if ($scope.selectedPage.Id == 0) {
            var controllerName = "BOPageSets", actionName = "AddPage";
            DynamicApiService.postAttributeRoutingData(controllerName, actionName, $scope.selectedPage).then(function (result) { //Rest Get call for data using Api service to call Webapi
                updateUIVarsOnPageSetChange();
                tosterFactory.showCustomToast('New Page inserted successfully', 'success');
                $scope.pageButtons = []; $scope.deletedButtons = []; $scope.selectedPage = null;
                $scope.pageSetChanged($scope.selectedPageSet);
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Inserting Page failed', 'fail');
                console.warn('Post action on server failed. Reason:'); console.warn(rejection);
            }).finally(function () { $scope.savingProcess = false; });
        } else {
            var controllerName = "BOPageSets", actionName = "UpdatePage";
            DynamicApiService.putAttributeRoutingData(controllerName, actionName, $scope.selectedPage).then(function (result) { //Rest Get call for data using Api service to call Webapi
                $scope.pageButtons = [];
                $scope.pageSetChanged($scope.selectedPageSet, $scope.selectedPage);
                tosterFactory.showCustomToast('Page saved successfully', 'success');
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Updating Page failed', 'fail');
                console.warn('Put action on server failed. Reason:'); console.warn(rejection);
            }).finally(function () { $scope.savingProcess = false; });

        }

    }
    $scope.enumTypeDescs = EnumFactory.typeEnumDesc;

    //AutoComplete material dropdown functionality of pagesets and pages selection
    $scope.querySearch = querySearch; $scope.selectedItemChange = selectedItemChange; $scope.searchTextChange = searchTextChange;
    function querySearch(query, type) {
        var results = [];
        switch (type) {
            case 'PageSet': results = query ? $scope.pageSetDropDownArray.filter(createFilterFor(query)) : $scope.pageSetDropDownArray; break;
            case 'Page': results = query ? $scope.pagesDropDownArray.filter(createFilterFor(query)) : $scope.pagesDropDownArray; break;
            default: break;
        } return results;
    }
    function searchTextChange(text) { }

    function selectedItemChange(item, type) {
        console.info('selected item changed changed type:' + item);
        //var validChange = false;
        switch (type) {
            case 'PageSet': $scope.pageSetChanged(item); break;
            case 'Page': $scope.pageChanged(item); break;
            default: break;
        }
    }

    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(entry) {
            var entlow = angular.lowercase(entry.Description);
            return (entlow.indexOf(lowercaseQuery) > -1);
        };

    }

    $scope.devlog = function (type) {
        switch (type) {
            case 'Pageset': console.log(type + ' log'); console.log($scope.pageSetDropDownArray); break;
            case 'Page': console.log(type + ' log'); console.log($scope.pagesDropDownArray); break;
            case 'selectedPageset': console.log(type + ' log'); console.log($scope.selectedPageSet); break;
            case 'selectedPage': console.log(type + ' log'); console.log($scope.selectedPage); break;
            case 'PageButtons':
                console.log('Pagebuttons log');
                console.log($scope.pageButtons);
                console.log('Deleted Pagebuttons log');
                console.log($scope.deletedButtons);
                break;
            default: console.log('No dev logtype matched on cases'); break;

        }
    }
}

function ExtFilterCtrl($scope, $mdDialog, productCategories, categories, paggination, exFilterModel) {
    $scope.exFilterModel = angular.copy(exFilterModel);
    $scope.productCategories = angular.copy(productCategories);
    $scope.categories = angular.copy(categories);
    $scope.paggination = angular.copy(paggination);
    $scope.exFilterModel['pageSize'] = $scope.paggination.pageSize;

    $scope.hide = function () { $mdDialog.hide(); };
    $scope.cancel = function () { $mdDialog.hide(-1); };
    $scope.confirm = function (answer) {
        $mdDialog.hide(answer);
    };
}
function EnumFactory() {
    var service = {
        typeEnum: {
            Empty: 0, Product: 1, SalesTypes: 2, //"":3 ,//"": 4
            Navigate: 5, NavWithPricelist: 6, Pricelist: 7, OpenItem: 8, KitchenInstruction: 9, Weighted: 10, WeightedOpenItem: 11
        },
        typeEnumDesc: {
            0: "Empty",
            1: "Product",
            2: "SalesTypes",
            5: "Navigate",
            6: "NavWithPricelist",
            7: "Pricelist",
            8: "OpenItem",
            9: "KitchenInstruction",
            10: "Weighted",
            11: "WeightedOpenItem",
        }
    };
    return service;

}
function ngEnter() {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
};

//SFE of form insert Page
function getPageModelSFE() {
    var entity = { Description: '', ExtendedDesc: '', PageSetId: '', DefaultPriceListId: '', Sort: '', Status: 1 };
    var form = [
    {
        type: "section", htmlClass: "row", disableSuccessState: true, disableErrorState: true,
        items: [
          {
              type: "section", disableSuccessState: true, disableErrorState: true,
              items: [
                  { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'col-md-6 col-xs-6 noPadding', key: "Description", copyValueTo: ["ExtendedDesc"] },
                  { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'col-md-6 col-xs-6 noPadding', key: "ExtendedDesc" }
              ]
          }]
    },
    { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: 'PageSetId', type: 'select', titleMap: [] },
    { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: 'DefaultPriceListId', type: 'select', titleMap: [] },
    //{ fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: "Sort" },
    //{ fieldHtmlClass: 'custom-form-style', key: "Status" }
    ];
    var schema = {
        type: 'object',
        title: "Comment",
        properties: {
            //     'Description': '', 'Color': '', 'Background': '', 'PriceListId': '', 'NavigateToPage': '', 'SetDefaultSalesType': ''
            Description: { type: 'string', title: 'Page Description', validationMessage: "You need to add a Desciption." },
            ExtendedDesc: { type: 'string', title: 'Page Extended Description', validationMessage: "You need to add a Desciption." },
            PageSetId: { title: 'PageSet', type: 'number', htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select Pageset...', nullLabel: '---', },
            DefaultPriceListId: { title: 'Default Pricelist', type: 'number', htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select Default Pricelist...', nullLabel: '---', validationMessage: "You need to add a Default Pricelist." },
            Sort: { title: 'Sort', type: "number" },
            Status: { title: 'Status', type: "number" },
        },
        required: ['Description', 'ExtendedDesc', 'PageSetId', 'DefaultPriceListId']
    }
    var ret = {
        schema: schema,
        form: form,
        entity: entity
    }
    return ret;
}
//SFE for right top panel to manage current Page options 
function getPageInsertModelSFE() {
    var schema = {
        type: 'object',
        title: "Comment",
        properties: {
            //htmlClass: "street foobar",  fieldHtmlClass: "street" labelHtmlClass: "street"
            Description: { type: 'string', title: 'Description', validationMessage: "You need to add a Desciption." },
            DefaultPriceListId: { title: 'Pricelist', type: 'number', htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select default pricelist...', nullLabel: '---', validationMessage: "You need to add a Default Pricelist." },
            Status: { title: 'Status', type: 'number', htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select Action...', nullLabel: '---' },
            Sort: { type: 'number', title: 'Sort' }
        },
        required: ['Description', 'DefaultPriceListId']
    }
    var form = [
        { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: "Description", feedback: false },
        { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: 'DefaultPriceListId', type: 'select', titleMap: [], feedback: false },
        { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: "Sort", readonly: true, feedback: false }
    ];

    var entity = { Description: "", Sort: null, DefaultPriceListId: "", Status: 1 }
    var ret = {
        schema: schema,
        form: form,
        entity: entity
    }
    return ret;
}
//SFE of PagerButton 
function getButtonSFE() {
    var entity = { Description: '', Color: 'rgb(255, 255, 255)', Background: 'hsl(0, 0%, 0%)', SetDefaultPriceListId: '', NavigateToPage: '', SetDefaultSalesType: '', IsOpen: false, IsWeighted: false, Type: -1 };
    var form = [
        { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: 'Description', onChange: "valueChanged(form.key,modelValue)", feedback: false },
        {
            type: "section", htmlClass: "inlineFormDisplay", feedback: false,
            items: [
              {
                  type: "section", feedback: false, items: [{
                      fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', feedback: false,
                      key: "Background", onChange: "valueChanged(form.key,modelValue)",
                      type: 'colorpicker',
                      colorFormat: 'hsl',
                      spectrumOptions: {
                          preferredFormat: 'hsl', showInput: true, showAlpha: true, showPalette: true, showSelectionPalette: true,
                          palette: [['black', 'white', 'blanchedalmond', 'rgb(255, 128, 0);', 'hsv 100 70 50'], ['red', 'yellow', 'green', 'blue', 'violet']]
                      }
                  }]
              },
              {
                  type: "section", items: [{
                      fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', feedback: false,
                      key: "Color",
                      type: 'colorpicker', colorFormat: 'rgb',
                      spectrumOptions: {
                          preferredFormat: 'rgb', showInput: true, showAlpha: true, showPalette: true, showSelectionPalette: true,
                          onChange: "valueChanged(form.key,modelValue)",
                          palette: [['black', 'white'], ['red', 'green']]
                      }
                  }]
              }
            ]
        },
        { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: 'SetDefaultPriceListId', onChange: "valueChanged(form.key,modelValue)", type: 'select', titleMap: [], feedback: false, },
        {
            fieldHtmlClass: 'custom-form-style', feedback: false,
            labelHtmlClass: 'custom-form-style',
            htmlClass: 'noPadding', key: 'NavigateToPage',
            onChange: "valueChanged(form.key,modelValue)",
            type: 'select', titleMap: []
        },
        { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: 'SetDefaultSalesType', onChange: "valueChanged(form.key,modelValue)", type: 'select', titleMap: [] },
        {
            type: "section", htmlClass: "row",
            items: [
              {
                  type: "section",
                  items: [
                      { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'col-md-6 col-xs-6 noPadding', key: "IsOpen", onChange: "valueChanged(form.key,modelValue)" },
                      { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'col-md-6 col-xs-6 noPadding', key: "IsWeighted", onChange: "valueChanged(form.key,modelValue)" }
                  ]
              }]
        },
        { fieldHtmlClass: 'custom-form-style', labelHtmlClass: 'custom-form-style', htmlClass: 'noPadding', key: 'Type' },
    ];
    var schema = {
        type: 'object',
        title: "Comment",
        properties: {
            //'Description': '', 'Color': '', 'Background': '', 'PriceListId': '', 'NavigateToPage': '', 'SetDefaultSalesType': ''
            //uiselectmultiple: { type: 'uiselectmultiple', title: 'uiselectmultiple' },

            Description: { type: 'string', title: 'Description', validationMessage: "You need to add a Desciption.", readonly: false },

            Background: { type: 'string', title: 'Font', format: "color" },
            Color: { type: 'string', title: 'Text', format: "color" },
            SetDefaultPriceListId: { title: 'Pricelist', type: ["null", "number"], htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select Action...', nullLabel: '---', readonly: false },
            NavigateToPage: { title: 'Navigate To Page', type: ["null", "number"], htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select Page...', nullLabel: '---', readonly: false },
            SetDefaultSalesType: { title: 'Sales Type', type: ["null", "number"], htmlClass: 'customFormSelect', format: 'uiselect', placeholder: 'Select SalesType...', nullLabel: '---', readonly: false },
            IsOpen: {
                title: 'Open Item',
                type: "boolean", readonly: false
            },
            IsWeighted: {
                title: 'Weighted',
                type: "boolean", readonly: false
            },

            //Type: { type: 'number', title: 'Type', readonly: false }
        },
        required: ['Description']
    };
    var ret = {
        schema: schema,
        form: form,
        entity: entity
    }
    return ret;
}