/// <reference path="../../services/dynamicapiservice.js" />
/// <reference path="../../factories/table-reservation-factory.js" />
angular.module('posBOApp')
    .component('restaurantComp', {
        templateUrl: 'app/scripts/components/table-reservation/templates/restaurant-comp.html',
        controller: 'RestaurantCompCTRL',
        controllerAs: 'RestMain'
    })
    .controller('RestaurantCompCTRL', ['$scope', '$mdDialog', 'trFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', function ($scope, $mdDialog, trFactory, dataUtilFactory, tosterFactory, DynamicApiService) {
        var RestMain = this;
        var dtu = dataUtilFactory;
        RestMain.restbusy = false; RestMain.hasError = false;
        RestMain.$onInit = function () { };

        RestMain.initView = function () {
            RestMain.restaurants = [];
            RestMain.selectedRestaurant = null;
            RestMain.GetRestaurants();
            RestMain.shortViewOptions = selectedViewOptions;
            RestMain.svops = Object.getOwnPropertyNames(selectedViewOptions)[0];
            RestMain.shortViewOpSelected = selectedViewOptions[RestMain.svops];
        };

        RestMain.Log = function () {
            console.log(RestMain.restaurants);
            console.log(RestMain.shortViewOpSelected);
        }
        //Action on list selection to view selected card on restaurant
        //Triggers with add and edit to reload content loaded by Rest call
        RestMain.selectCurrent = function (data) {
            if (data != null) {
                RestMain.selectedRestaurant = data;
            } else {
                RestMain.selectedRestaurant = null;
                return;
            }
        }
        //Ui Action to switch funcionllity over action button and action perfom
        //Add - EDit  triggers model Edit with sample to add and current to edit data
        //On delete 
        RestMain.Upsert = function (mode, data) {
            var model;
            if (data == null && mode == 'add') {
                model = defaultRestaurantModel;
                
                RestMain.EditOnModal(mode, model);
            } else if (data != null && mode == 'edit') {
                model = data;
                RestMain.EditOnModal(mode, model);
            } else if (data != null && mode == 'delete') {
                model = data;
                RestMain.RemoveRestaurant(model);
            } else {
                tosterFactory.showCustomToast('Not valid Upsert Action', 'info');
            }
        }

        RestMain.EditOnModal = function (type, data) {
            var formModel = { entityIdentifier: 'TRRestaurants', dropDownObject: {}, title: 'Managing Restaurant' }, dataEntry = {};
            dataEntry = angular.copy(data);
            if (type == 'edit' && data != null) {
                formModel = angular.extend({ forceTitle: 'Edit Restaurant' }, formModel);
                dataEntry = angular.copy(data);
            }
            //object to upload image on selected input
            dataEntry['uploadModel'] = {
                controllerName: 'Upload', actionName: 'restaurants', extraData: 1,//represents storeinfo.Id
                externalDirectory: 'region'
            };
            dataEntry['loadingImage'] = false;
            $mdDialog.show({
                controller: 'DynamicSingleFormInsertCtrl', templateUrl: '../app/scripts/directives/gridDirectives/InsertDynamicEntityForm.html', parent: angular.element('#wrapper'), clickOutsideToClose: true, fullscreen: true,
                resolve: { formModel: function () { return formModel; }, dataEntry: function () { return dataEntry; } }
            }).then(function (data) {
                
                //important step to match ids that is number in this entity
                if (type == 'add') {
                    data['Id'] = 0;
                    RestMain.InsertRestaurants(data);
                } else if (type == 'edit') {
                    RestMain.UpdateRestaurants(data);
                }

            }).catch(function (error) {

            }).finally(function () {

            })
        }
        //API CALL to insert new restaurant 
        //takes as import a model from modal form and posts if with api service to DB
        //called from EditOnModal result when mode = add
        RestMain.InsertRestaurants = function (model) {
            RestMain.restbusy = true;
            var url = trFactory.apiInterface.Restaurants.POST.InsertRestaurant;
            DynamicApiService.postV3('Restaurants', url, model).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Restaurant Added', 'success');
                    //result.data here has id 
                    RestMain.GetRestaurants(result.data);
                } else {
                    tosterFactory.showCustomToast('No saved Restaurant returned', 'success');
                    RestMain.GetRestaurants(-1);
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Adding Restaurant failed', 'fail');
                console.warn('Post action on server failed. Reason:'); console.warn(rejection);
                return -1;
            }).finally(function () {
                RestMain.restbusy = false;
            });
        }

        //API CALL to Update selected restaurant
        //takes as import a model from modal form and posts if with api service to DB
        //called from EditOnModal result when mode = edit
        RestMain.UpdateRestaurants = function (model) {
            RestMain.restbusy = true;
            var url = trFactory.apiInterface.Restaurants.POST.UpdateRestaurant;
            DynamicApiService.postV3('Restaurants', url, model).then(function (result) {
                
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Restaurant Updated', 'success');
                    RestMain.GetRestaurants(result.data.Id);
                } else {
                    tosterFactory.showCustomToast('No Restaurants Updated', 'success');
                    RestMain.GetRestaurants(-1);
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Updating Restaurant failed', 'fail');
                console.warn('Post action on server failed. Reason:'); console.warn(rejection);
                return -1;
            }).finally(function () {
                RestMain.restbusy = false;
            });
        }

        //API CALL rest get all to local var array if it  fails
        RestMain.GetRestaurants = function (selectId) {
            var toselect = selectId;
            RestMain.restbusy = true;

            var url = trFactory.apiInterface.Restaurants.GET.GetRestaurants;
            DynamicApiService.getV3('Restaurants', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Restaurants Loaded', 'success');
                    RestMain.restaurants = result.data;
                    //toselect flag id is not null flag may be -1 to select null
                    //functionallity flow will find or not sd obj and select will take action as null data
                    if (toselect != null) {
                        var sd = result.data.find(function (res) {  return res.Id == toselect; });
                        if (sd == null && toselect != -1) {
                            tosterFactory.showCustomToast('No Restaurant to select with id:' + toselect, 'success');
                        }
                        RestMain.selectCurrent(sd);
                    }
                } else {
                    tosterFactory.showCustomToast('No Restaurants Loaded', 'success');
                    RestMain.restaurants = [];
                    RestMain.selectCurrent(null);
                }
            }).catch(function (rejection) {
                tosterFactory.showCustomToast('Loading Restaurants failed', 'fail');
                console.warn('Get action on server failed. Reason:'); console.warn(rejection);
                RestMain.hasError = true; RestMain.restaurants = []; RestMain.selectCurrent(null);
                return -1;
            }).finally(function () {
                RestMain.restbusy = false;
            });
        }

        //Function that triggers modal confirmation and parses model to delete REST
        RestMain.RemoveRestaurant = function (rest) {
            
            var deleteDialog = $mdDialog.confirm().title('Delete Restaurant').textContent('You have selected "' + rest[RestMain.shortViewOpSelected.Name] + '" entry to delete.\n Would you like to proceed and delete current restaurant?')
                .ariaLabel('deletingRestaurant').ok('Delete').cancel('Cancel');
            $mdDialog.show(deleteDialog).then(function () {
                RestMain.restbusy = true;
                var url = trFactory.apiInterface.Restaurants.POST.DeleteRestaurant;
                url = DynamicApiService.regexUrl(url, rest);
                DynamicApiService.postV3('Restaurants', url, {}).then(function (result) {
                    tosterFactory.showCustomToast('Restaurant removed', 'success');
                    RestMain.GetRestaurants(-1);
                }).catch(function (rejection) {
                    tosterFactory.showCustomToast('Deleting Restaurant failed', 'fail');
                    console.warn('Post action on server failed. Reason:'); console.warn(rejection);
                    return -1;
                }).finally(function () {
                    RestMain.restbusy = false;
                });
            });
        }
        //GetRestaurants: 'GetList', GetRestaurantById: 'Get/Id/{Id}', GetComboList:'GetComboList/{language}',
    }])
    ;


var selectedViewOptions = {
    GR: { Name: 'NameGR', Description: 'DescriptionGR' },
    En: { Name: 'NameEn', Description: 'DescriptionEn' },
    Ru: { Name: 'NameRu', Description: 'DescriptionRu' },
    Fr: { Name: 'NameFr', Description: 'DescriptionFr' },
    De: { Name: 'NameDe', Description: 'DescriptionDe' },
}
var defaultRestaurantModel = {
    Id: 0,
    NameGR: 'NGR',
    NameEn: 'NEN',
    NameRu: 'NRU',
    NameFr: 'NFR',
    NameDe: 'NDE',
    Image: 'zavara.jpg',
    DescriptionGR: 'Description GR',
    DescriptionEn: 'Description EN',
    DescriptionRu: 'Description RU',
    DescriptionFr: 'Description FR',
    DescriptionDe: 'Description DE'
}
