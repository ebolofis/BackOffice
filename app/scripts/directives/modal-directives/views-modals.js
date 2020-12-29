'use strict';
/**
 * @ngdoc directive
 * @name views-modals-directives : posBOApp_mainviews_directives
 * @Contains Controllers and modal directives used in SPA views
 * #posBOApp
 */
//$uibModal's Docs
//https://github.com/angular-ui/bootstrap/blob/master/src/modal/docs/readme.md
angular.module('posBOApp')
.controller('ManageTMPricelistsModalCtrl', function ($uibModalInstance, $filter, tmpPricelists, containerObject, pricelistEnumOptions) {
    var tmm = this;
    tmm.containerObject = angular.copy(containerObject);
    tmm.allPricelists = angular.copy(tmpPricelists);
    tmm.notAddedPls = []; //left container
    tmm.addedPls = []; //right container
    tmm.pricelistEnumOptions = pricelistEnumOptions;

    //init pricelist Items.selected and create 2 arrays of right left
    angular.forEach(tmm.allPricelists, function (item) {
        item.selected = false;
        var tObj = { Id: item.Id, Description: item.Description, selected: false }
        //divide in  added not_added all pls
        var index = tmm.containerObject.currentPls.indexOf(item.Id);
        (index == -1) ? tmm.notAddedPls.push(tObj) : tmm.addedPls.push(tObj);
    })
    tmm.includePriceLists = function () {
        //exclude from notAddedPls --> addedPls
        var spls = $filter('filter')(tmm.notAddedPls, { selected: true });
        tmm.notAddedPls = $filter('filter')(tmm.notAddedPls, { selected: false });
        //manage added
        angular.forEach(spls, function (item) { item.selected = false; });
        tmm.addedPls = tmm.addedPls.concat(spls);
    }
    tmm.excludePriceLists = function () {
        //exclude from notAddedPls --> addedPls
        var spls = $filter('filter')(tmm.addedPls, { selected: true });
        tmm.addedPls = $filter('filter')(tmm.addedPls, { selected: false });
        //manage added
        angular.forEach(spls, function (item) { item.selected = false; });
        tmm.notAddedPls = tmm.notAddedPls.concat(spls);
    }
    tmm.dismiss = function (reason) { $uibModalInstance.dismiss(reason); };
    tmm.Conf = function () {
        var ret = tmm.manageResults();
        $uibModalInstance.close(ret);
    };
    tmm.manageResults = function () {
        var toDel = [], toInsert = [], addedPids = [], incPls = [];
        angular.forEach(tmm.addedPls, function (item) {
            addedPids.push(item.Id);
            incPls.push(item.Id);
        });

        angular.forEach(tmm.containerObject.currentPls, function (cpl) {
            var ins = addedPids.indexOf(cpl);
            //exist in both /****/delete current pl exists in both items 
            if (ins != -1) { addedPids.splice(ins, 1); }
                //exist only in obj /****/ current pl has to delete
            else { toDel.push(cpl); }
        });
        toInsert = addedPids;
        console.log('Included Pls'); angular.forEach(incPls, function (item) { console.log(tmm.pricelistEnumOptions[item]); });
        console.log('Insert Pls'); angular.forEach(toInsert, function (item) { console.log(tmm.pricelistEnumOptions[item]); });
        console.log('Delete Pls'); angular.forEach(toDel, function (item) { console.log(tmm.pricelistEnumOptions[item]); });
        return ({ incPls: incPls, arrIns: toInsert, arrDel: toDel, plsf: tmm.addedPls })
    }
})
.controller('DisplayTransferMappingsyCtrl', function ($uibModalInstance, $filter, displayObject) {
    var dtm = this;
    dtm.displayObject = angular.copy(displayObject);
    console.log(dtm.displayObject);
    dtm.term = 'react';
    dtm.gridIns = { data: angular.copy(dtm.displayObject.insertedArr) };
    dtm.gridEdit = { data: angular.copy(dtm.displayObject.modifiedArr) };
    dtm.gridLoad = { data: angular.copy(dtm.displayObject.transferMappingsLoaded) };
    dtm.gridReact = { data: angular.copy(dtm.displayObject.reactArr) };
    dtm.Conf = function () {
        $uibModalInstance.close();
    };
})

    //Ctrl of the modal of Edit PageSet 
    //Here you can Eather manage or insert a pageset 
    //Call modal function Rests in Pages-Main-Controller
.controller('AddPageSetCtrl', function ($mdDialog, $filter, posarray, pageset, pcats, pagesetArray, actionInit, pages, tosterFactory) {
    //console.log('Adding new pageset functionality');
    var mps = this;
    mps.actionOption = actionInit;                      //this is an action property to characterize either Create || Edit a PageSet
    mps.posarray = posarray;                            //this is an array of POS objs loaded  on lookups
    mps.panelOption = 'overview';
    mps.tittle = (actionInit == 'Insert') ? 'New PageSet Configuration' : 'Edit Pageset';//an overview title of the modal 
    mps.pages = angular.copy(pages);                    //pages loaded of current Pageset
    mps.pcategories = angular.copy(pcats);              //Product Categories loaded
    mps.pagesetArray = angular.copy(pagesetArray);      //All Pagesets in an Array as lookup and drop down selection on clone pages
    mps.selectedPage = null;                            //this var is mapped for dnd-list (drag & drop) charecterize's current draggable entity of page 
    mps.entity = {                                      //this is the obj entity 
        Description: null, selectedPos: [],
        ActivationDate: new Date(), DeactivationDate: new Date(),
        DPActivationDate: new Date(), DPDeactivationDate: new Date()
    };
    //pages to add  , pages to del  , inserttypemodel
    mps.pagesToAdd = [], mps.pagesToDel = [], mps.insertTypeModel = { type: 'empty', typeArray: [] };

    //if option is update on pageset ... filter current pageset from list avoiding dublicates of copying
    if (mps.actionOption == 'Update') {
        mps.pagesetArray = mps.pagesetArray.filter(function (ips) { return (ips.Id != pageset.Id); })
    }

    mps.dismiss = function (reason) { $mdDialog.cancel(reason); }; //{X} || close window with cancel action
    mps.Conf = function (caseStr) {                     //confirmation modal function
        if (mps.actionOption == 'Update') {
            console.log('conf action of update handle')
            manageOrderList(); //simply order pages
            mps.pagesToDel = mps.pagesToDel.filter(function (item) {
                if (item.Id != 0) {
                    item.IsDeleted = true;
                    return item;
                }
            })
        }
        var ret = {
            action: mps.actionOption,
            pageSet: mps.entity,
            pages: (mps.actionOption == 'Update') ? mps.pagesToAdd.concat(mps.pagesToDel) : [],
            insModel: mps.insertTypeModel
        };

        if (mps.entity.Description !== null && mps.entity.Description !== '' &&
            mps.entity.ActivationDate !== null && mps.entity.ActivationDate !== '' &&
            mps.entity.DeactivationDate !== null && mps.entity.DeactivationDate !== '') {
            //console.log('Zavara:'); console.log(ret.insModel);
            $mdDialog.hide(ret);
        } else { console.log('invalid form'); }
    };

    function manageOrderList() {
        mps.pagesToAdd = [];
        for (var i = 0; i < mps.pages.length; i++) {
            mps.orderChanged = true; mps.pages[i].Sort = i + 1;
            mps.pagesToAdd.push(mps.pages[i]);
        }
    }

    //if actionOption [insert , update] is update
    //initiallize dependencies and vars on modal
    if (mps.actionOption == 'Update') {
        mps.tittle = 'Edit pageset: ' + pageset.Description;
        mps.entity = angular.extend(mps.entity, pageset); //Extend DAO entity with Pageset - loaded entity this gives you the obj fields of loaded obj to 
        var idarr = [];
        //handle pos info mapthem with ids for drop down list of multi selection over POS entities
        angular.forEach(pageset.AssosiatedPos, function (value) {
            if (value.PosInfoId !== undefined && value.PosInfoId !== null && value.PosInfoId != 0) {
                idarr.push(value.PosInfoId);
            } else {
                tosterFactory.showCustomToast('PosInfo of undefined will not insert', 'error');
                console.log("PosInfo of undefined:"); console.log(value);
            }
        })
        mps.entity.selectedPos = idarr;
        //vars for datepicker element to bind value of iso string to entity
        mps.entity.DPActivationDate = new Date(mps.entity.ActivationDate); mps.entity.DPDeactivationDate = new Date(mps.entity.DeactivationDate);
    }
    mps.panelHandler = function (choice) {
        (mps.actionOption == 'Insert' && choice == 'pageManagement') ? mps.panelOption = 'overview' : mps.panelOption = choice;
    }
    //function apply's remove functionality on order && delete pages 
    //this is an opp that pushes entities in the pagesToDel  to be handled in modal return confirmation
    mps.removePage = function (item) {
        var index = mps.pages.indexOf(item);
        mps.pages.splice(index, 1);
        mps.pagesToDel.push(item);
    }
})

//it is a directive to apply and modify Datasets in copy or create new Dataset functionality 
.directive('newPagesManager', function () {
    return {
        controller: 'NewPageSetCtrl',
        restrict: 'E',
        scope: {
            retModel: '=', pagesets: '=', productCats: '=',
            insertAction: '=?', //force ins action view template
            disableViewopp: '=?' //disable back button
        },
        templateUrl: '../app/scripts/directives/modal-directives/new-pages-manager.html',
    };
})
.controller('NewPageSetCtrl', function ($scope, DynamicApiService) {
    //console.log('zavarakatranemia hleos hleos alilouia');

    $scope.$watch('insertAction', function (newValue, oldValue) {
        if (newValue == 'main' || newValue === undefined || newValue === null) return;
        $scope.retModel.type = $scope.insertAction;
        $scope.retModel.typeArray = [];
    })
    $scope.disableViewopp = ($scope.disableViewopp != true) ? false : true;             //this is an option to disable view action button on clone opp
    $scope.insertAction = ($scope.insertAction != undefined) ? $scope.insertAction : 'main'; // this is the view option between create an empty pageset and clone pages on Create|| Edit current pageset
    $scope.selectedPageset = null, $scope.selectedpages = [], $scope.selectedproductCats = []; // initiallization of selection vars across dirctive // dropdown Pset Value , Pages to Clone  , ProductCategories (not yet used)
    $scope.loadedpages = []; //enitity mapped to pages loaded from selection list of pagesets
    //$scope.changeInsertType = function (insertChoice) { $scope.insertAction = insertChoice; } fun to switch between empty and clone opp

    $scope.pageSetDropDownChanged = function () { // rest promise to load selected Pageset Entity from the api and initiallize drop
        if ($scope.selectedPageset === null) return;
        DynamicApiService.getAttributeRoutingData("BOPageSets", "GetAllPages", $scope.selectedPageset.Id).then(function (result) {
            $scope.loadedpages = result.data;
            $scope.retModel.typeArray = $scope.selectedpages = [];
        })
    };
    //this is an action button to append selected list on current 
    $scope.addSelected = function (input) {
        switch (input) {
            case 'pages':
                var list = $scope.loadedpages.filter(function (item) {
                    if (item.selected == true) { item.selected = false; return item; }
                });
                $scope.selectedpages = $scope.selectedpages.concat(angular.copy(list));
                $scope.retModel.typeArray = angular.copy($scope.selectedpages);
                break;
                //case 'pcats': var list = $scope.productCats.filter(function (item) { if (item.selected == true) { item.selected = false; return item; } }); $scope.selectedproductCats = $scope.selectedproductCats.concat(angular.copy(list));$scope.retModel.typeArray = angular.copy($scope.selectedproductCats);break;
            default: break;
        }
    }

    //function opperation on delete from selected list to remove options 
    $scope.removeSelected = function (input) {
        switch (input) {
            case 'pages': $scope.selectedpages = $scope.selectedpages.filter(function (item) {
                if (item.selected == true) { item.selected = false; } else { return item; }
            }); break;
                //case 'pcats': $scope.selectedproductCats = $scope.selectedproductCats.filter(function (item) { if (item.selected == true) { item.selected = false; } else { return item; } }); break;
            default: break;
        }
    }
    //this is a filter used in list-repeat-element as an extra-filter
    //if item loaded exists in selected pages filter it 
    $scope.availablesPagesFilter = function (item) {
        if ($scope.selectedpages === undefined || $scope.selectedpages === null || $scope.selectedpages.length == 0) return true;
        var res = $scope.selectedpages.filter(function (val) { return item.Id == val.Id; })
        return (res.length > 0) ? false : true;
    }
    //$scope.availablesPcatsFilter = function (item) { if ($scope.selectedproductCats === undefined || $scope.selectedproductCats === null || $scope.selectedproductCats.length == 0) return true; var res = $scope.selectedproductCats.filter(function (val) { return item.Id == val.Id; }); return (res.length > 0) ? false : true; }

})
