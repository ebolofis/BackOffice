angular.module('posBOApp')
    .component('restrictionAssocComp', {
        templateUrl: 'app/scripts/components/table-reservation/templates/restriction-assoc-comp.html',
        controller: 'RestrictionAssocCompCTRL',
        controllerAs: 'RestrictAssoc'
    })

    .controller('RestrictionAssocCompCTRL', ['$scope', '$state', '$mdDialog', 'trFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', function ($scope, $state, $mdDialog, trFactory, dataUtilFactory, tosterFactory, DynamicApiService) {
        var RestrictAssoc = this;
        var dtu = dataUtilFactory;
        RestrictAssoc.restbusy = false; RestrictAssoc.hasError = false;
        RestrictAssoc.$onInit = function () { };
        RestrictAssoc.navigate = function (ref) {
            if (ref != undefined) {
                $state.go(ref);
            }
        }
        RestrictAssoc.initView = function () {
            RestrictAssoc.restbusy = false; RestrictAssoc.hasError = false;
            RestrictAssoc.restrictions = []; RestrictAssoc.restaurants = [];
            RestrictAssoc.GetRestrictions(); RestrictAssoc.GetRestaurants(); RestrictAssoc.GetAssocs();
            RestrictAssoc.shortViewOptions = selectedViewOptions;
            RestrictAssoc.svops = Object.getOwnPropertyNames(selectedViewOptions)[0];
            RestrictAssoc.shortViewOpSelected = selectedViewOptions[RestrictAssoc.svops];
        };

        //Rest Call to get all Restrictions loaded by api
        RestrictAssoc.GetRestrictions = function () {
            RestrictAssoc.restbusy = true;
            var url = trFactory.apiInterface.Restrictions.GET.GetRestrictions;
            DynamicApiService.getV3('Restrictions', url).then(function (result) {
                if (result != null && result.data != null) {
                    RestrictAssoc.restrictions = result.data;
                } else {
                    tosterFactory.showCustomToast('No Restrictions Loaded', 'success');
                    RestrictAssoc.restrictions = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Restrictions failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                RestrictAssoc.hasError = true; RestrictAssoc.restrictions = [];
                return -1;
            }).finally(function () {
                RestrictAssoc.restbusy = false;
            });
        }

        //Rest get All restaurants 
        RestrictAssoc.GetRestaurants = function () {
            RestrictAssoc.restbusy = true;
            var url = trFactory.apiInterface.Restaurants.GET.GetRestaurants;
            DynamicApiService.getV3('Restaurants', url).then(function (result) {
                if (result != null && result.data != null) {
                    RestrictAssoc.restaurants = result.data;
                } else {
                    tosterFactory.showCustomToast('No Restaurants Loaded', 'success');
                    RestrictAssoc.restaurants = [];
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Restaurants failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                RestrictAssoc.hasError = true; RestrictAssoc.restaurants = [];
                return -1;
            }).finally(function () {
                RestrictAssoc.restbusy = false;
            });
        }
        //Rest get all assosiations
        RestrictAssoc.GetAssocs = function () {
            RestrictAssoc.restbusy = true;
            var ctrl = 'RestrictionsRestaurantsAssoc';
            var url = trFactory.apiInterface[ctrl].GET.GetRestrictionsRestaurantsAssoc;
            DynamicApiService.getV3(ctrl, url).then(function (result) {
                if (result != null && result.data != null) {
                    RestrictAssoc.assocs = result.data;
                    RestrictAssoc.assocsByResId = dtu.createEnumObjs(RestrictAssoc.assocs, {}, 'RestId');

                    var groups = dtu.groupTo(RestrictAssoc.assocs, 'RestId');
                    var objassoc = {};
                    angular.forEach(groups, function (arr, key) {
                        var d = dtu.createEnumObjs(arr, {}, 'RestrictId');
                        var s = (objassoc[key] != undefined) ? objassoc[key] : {};
                        objassoc[key] = angular.extend(s, d);
                    });

                    RestrictAssoc.assocsByResId = objassoc;

                } else {
                    tosterFactory.showCustomToast('No Associations Loaded', 'success');
                    RestrictAssoc.assocs = [];
                    RestrictAssoc.assocsByResId = {};
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Associations failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                RestrictAssoc.hasError = true; RestrictAssoc.assocs = [];
                return -1;
            }).finally(function () {
                RestrictAssoc.restbusy = false;
            });
        }
        //check bool function of value 
        RestrictAssoc.checkAssocExist = function (val) { return (val != undefined) ? true : false; }
        RestrictAssoc.nameFilter = function (res) {
            var lowercaseQuery = angular.lowercase(RestrictAssoc.searchStr);
            if (lowercaseQuery == null) return res;
            var lowercaseName = angular.lowercase(res[RestrictAssoc.shortViewOpSelected.Name]);
            var pos = lowercaseName.indexOf(lowercaseQuery);
            return ( pos >=0);
        }

        RestrictAssoc.editAssoc = function (restaurant, restr) {

            var restrict = restr;
            var r = RestrictAssoc.assocsByResId[restaurant.Id];
            var assoc = (r != null) ? r[restrict.Id] : null;
            var name = restaurant[RestrictAssoc.shortViewOpSelected.Name];
            
            if (assoc == undefined) {
                assoc = { Id: 0, N: 0, RestId: restaurant.Id, RestrictId: restrict.Id };
            }
            $mdDialog.show({
                controller: 'RestaurantRestriction',
                templateUrl: 'edit-restrictions-assocs',
                //templateUrl: '../app/scripts/components/table-reservation/templates/RestrictionAssocModal.html',
                parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: {
                    name: function () { return name; },
                    assoc: function () { return assoc; },
                    restrict: function () { return restrict; },
                }
            }).then(function (data) {
                
                if (data == 'done')
                    RestrictAssoc.initView();
            }).catch(function (error) { }).finally(function () { })
        }

    }])

    .controller('RestaurantRestriction', function ($scope, $q, $mdDialog, name, assoc, restrict, tosterFactory, trFactory, DynamicApiService) {

        //Close button with cancel or X top modal
        $scope.cancel = function () { $mdDialog.cancel(); };
        //Action on Remove button  on  Edit mode 
        $scope.clear = function () {
            if ($scope.assoc.Id == 0 || $scope.assoc.Id == undefined) {
                tosterFactory.showCustomToast('Association does not exist in DB there is no need to remove it', 'info');
            } else {
                if ($scope.mode != 'remove') { $scope.switchmode('remove'); }
            }
        }

        $scope.switchmode = function (m) {
            $scope.mode = m;
        }
        //Confirm Action on modal to Add on id 0 or update on current id 
        //Action will be valid to trigger if input form has a value and restriction N > 0
        $scope.confirm = function (answer) {
            var ret = { type: '', model: {} };
            if (assoc.Id == 0 || assoc.Id == null) {
                ret.type = 'insert';
                ret.model = assoc;
                var url = trFactory.apiInterface.RestrictionsRestaurantsAssoc.POST.InsertRestrictionsRestaurantsAssoc;
                $scope.RestActionRestriction(url, ret.model);

            } else if (assoc.Id != 0 && assoc.Id != null) {
                ret.type = 'update';
                ret.model = assoc;
                var url = trFactory.apiInterface.RestrictionsRestaurantsAssoc.POST.UpdateRestrictionsRestaurantsAssoc;
                $scope.RestActionRestriction(url, ret.model);
            }
        };
        $scope.delete = function () {
            if ($scope.assoc.Id == 0 || $scope.assoc.Id == undefined) {
                tosterFactory.showCustomToast('Association does not exist in DB there is no need to remove it', 'info');
            } else {
                var ret = { type: 'delete', model: assoc };
                var url = trFactory.apiInterface.RestrictionsRestaurantsAssoc.POST.DeleteRestrictionsRestaurantsAssoc;
                url = DynamicApiService.regexUrl(url, ret.model);
                $scope.RestActionRestriction(url, ret.model);
            }
        }
        $scope.RestActionRestriction = function (url, model) {
            $scope.restbusy = true;
            DynamicApiService.postV3('RestrictionsRestaurantsAssoc', url, model).then(function (result) {
                tosterFactory.showCustomToast('Changes Updated', 'success');
                $mdDialog.hide('done');
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Changes failed', 'fail');
            }).finally(function () {
                $scope.restbusy = false;
            });
        }

        $scope.name = name;
        $scope.assoc = assoc;
        $scope.restrict = restrict;
        $scope.switchmode('edit');
        
    });

var selectedViewOptions = {
    GR: { Name: 'NameGR', Description: 'DescriptionGR' },
    En: { Name: 'NameEn', Description: 'DescriptionEn' },
    Ru: { Name: 'NameRu', Description: 'DescriptionRu' },
    Fr: { Name: 'NameFr', Description: 'DescriptionFr' },
    De: { Name: 'NameDe', Description: 'DescriptionDe' },
}


 ////Ui Action to switch funcionllity over action button and action perfom
        ////Add - EDit  triggers model Edit with sample to add and current to edit data
        ////On delete 
        //Restrict.Upsert = function (mode, data) {
        //    var model;
        //    if (data == null && mode == 'add') {
        //        model = { Description : null};
        //        Restrict.EditOnModal(mode, model);
        //    } else if (data != null && mode == 'edit') {
        //        model = data;
        //        Restrict.EditOnModal(mode, model);
        //    } else if (data != null && mode == 'delete') {
        //        model = data;
        //        Restrict.RemoveRestriction(model);
        //    } else {
        //        tosterFactory.showCustomToast('Not valid Upsert Action', 'info');
        //    }
        //}

        //Restrict.EditOnModal = function (type, data) {
        //    var formModel = { entityIdentifier: 'TRRestrictions', dropDownObject: {}, title: 'Managing Restrictions' }, dataEntry = {};
        //    dataEntry = angular.copy(data);
        //    if (type == 'edit' && data != null) {
        //        formModel = angular.extend({ forceTitle: 'Edit Restriction' }, formModel);
        //        dataEntry = angular.copy(data);
        //    }
        //    $mdDialog.show({
        //        controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
        //        resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
        //    }).then(function (data) {
        //        
        //        //important step to match ids that is number in this entity
        //        if (type == 'add') {
        //            data['Id'] = 0;
        //            Restrict.InsertRestriction(data);
        //        } else if (type == 'edit') {
        //            Restrict.UpdateRestriction(data);
        //        }
        //    }).catch(function (error) {  }).finally(function () {  })
        //}
        ////API CALL to insert new Restriction
        ////takes as import a model from modal form and posts if with api service to DB
        ////called from EditOnModal result when mode = add
        //Restrict.InsertRestriction = function (model) {
        //    Restrict.restbusy = true;
        //    var url = trFactory.apiInterface.Restrictions.POST.InsertRestriction;
        //    DynamicApiService.postV3('Restrictions', url, model).then(function (result) {
        //        if (result != null && result.data != null) {
        //            tosterFactory.showCustomToast('Restriction Added', 'success');
        //        } else {
        //            tosterFactory.showCustomToast('No saved Restriction returned', 'success');
        //        }
        //        Restrict.GetRestrictions();
        //    }).catch(function (rejection) {
        //        tosterFactory.showCustomToast('Adding Restriction failed', 'fail');
        //        console.warn('Post action on server failed. Reason:'); console.warn(rejection);
        //        return -1;
        //    }).finally(function () {
        //        Restrict.restbusy = false;
        //    });
        //}

        ////API CALL to Update selected Restriction
        ////takes as import a model from modal form and posts if with api service to DB
        ////called from EditOnModal result when mode = edit
        //Restrict.UpdateRestriction = function (model) {
        //    Restrict.restbusy = true;
        //    var url = trFactory.apiInterface.Restrictions.POST.UpdateRestriction;
        //    DynamicApiService.postV3('Restrictions', url, model).then(function (result) {
        //        if (result != null && result.data != null) {
        //            tosterFactory.showCustomToast('Restriction Updated', 'success');
        //        } else {
        //            tosterFactory.showCustomToast('No Restriction Updated', 'success');
        //        }
        //        Restrict.GetRestrictions();
        //    }).catch(function (rejection) {
        //        tosterFactory.showCustomToast('Updating Restriction failed', 'fail');
        //        console.warn('Post action on server failed. Reason:'); console.warn(rejection);
        //        return -1;
        //    }).finally(function () {
        //        Restrict.restbusy = false;
        //    });
        //}

        ////Function that triggers modal confirmation and parses model to delete REST
        //Restrict.RemoveRestriction = function (restr) {
        //    var deleteDialog = $mdDialog.confirm().title('Delete Restriction').htmlContent('You have selected to delete Restriction:<br /><p class="force-break-word">"' + restr.Description + '".</p><br /><br /> Would you like to proceed?')
        //        .ariaLabel('deletingRestriction').ok('Delete').cancel('Cancel');
        //    $mdDialog.show(deleteDialog).then(function () {
        //        Restrict.restbusy = true;
        //        var url = trFactory.apiInterface.Restrictions.POST.DeleteRestriction;
        //        url = DynamicApiService.regexUrl(url, restr);
        //        
        //        DynamicApiService.postV3('Restrictions', url, {}).then(function (result) {
        //            tosterFactory.showCustomToast('Restrictions Removed', 'success');
        //            Restrict.GetRestrictions();
        //        }).catch(function (rejection) {
        //            tosterFactory.showCustomToast('Deleting Restriction failed', 'fail');
        //            console.warn('Post action on server failed. Reason:'); console.warn(rejection);
        //            return -1;
        //        }).finally(function () {
        //            Restrict.restbusy = false;
        //        });
        //    });
        //}
