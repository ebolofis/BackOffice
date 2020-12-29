angular.module('posBOApp')
    .component('mainConfigComp', {
        templateUrl: 'app/views/MainConfiguration/main-configuration-view.html',
        controller: 'MainConfigCompCTRL',
        controllerAs: 'MainConfig'
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
    .controller('MainConfigCompCTRL', ['$scope', '$mdDialog', 'mcFactory', 'dataUtilFactory', 'tosterFactory', 'DynamicApiService', '$mdDialog', '$mdMedia', 'transferDataService', '$filter', function ($scope, $mdDialog, mcFactory, dataUtilFactory, tosterFactory, DynamicApiService, $mdDialog, $mdMedia, transferDataService, $filter) {
        var MainConfig = this;
        var dtu = dataUtilFactory;
        MainConfig.restbusy = false; MainConfig.hasError = false;
        MainConfig.$onInit = function () { };

        MainConfig.initView = function () {
            MainConfig.allConfiguration = []; // All Configuration Jsons
            MainConfig.allDescriptors = []; // All Descriptors
            MainConfig.allDescriptorsFiltered = [];
            MainConfig.selectedDescriptorCategory = [];
            MainConfig.selectedDescriptorDetails = [];
            MainConfig.selectedConfigValues = [];
            MainConfig.selectedJsonFile = null;
            MainConfig.apiVersionsList = [];


            MainConfig.GetConfiguration();
        };

        $scope.showModal = false;
        $scope.open = function (row) {
            $scope.shortRow = row;
            $scope.showModal = !$scope.showModal;
        };

        $scope.AllVersions = 'All';

        //#################### Get All Configuration Files from API ##########################//
        //####################################################################################//
        MainConfig.GetConfiguration = function () {
            var url = mcFactory.apiInterface.MainConfiguration.GET.GetConfiguration;
            DynamicApiService.getV3('Configuration', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Configuration Loaded', 'success');
                    MainConfig.allConfiguration = result.data;
                    //###### Call GetDescriptors Function #####//
                    MainConfig.GetDescriptors();
                    //pass the configuration to the service
                    transferDataService.setConfig(result.data);
                } else {
                    toastr.error('No Configuration Loaded', 'success');
                    MainConfig.allConfiguration = [];
                }
            }).catch(function (rejection) {
                toastr.error('Loading Configuration failed', 'fail');
                MainConfig.allConfiguration = [];
                return -1;
            }).finally(function () {
            });
        }

        //#################### Get All Descriptors Files from API ##########################//
        //####################################################################################//
        MainConfig.GetDescriptors = function () {
            var url = mcFactory.apiInterface.MainConfiguration.GET.GetDescriptors;
            DynamicApiService.getV3('Configuration', url).then(function (result) {
                if (result != null && result.data != null) {
                    tosterFactory.showCustomToast('Descriptors Loaded', 'success');
                    MainConfig.allDescriptors = result.data;
                    MainConfig.createPosDescriptors();
                } else {
                    toastr.error('No Descriptors Loaded', 'success');
                    MainConfig.allDescriptors = [];
                }
            }).catch(function (rejection) {
                toastr.error('Loading Descriptors failed', 'fail');
                MainConfig.allDescriptors = [];
                return -1;
            }).finally(function () {
                MainConfig.restbusy = false;
                $scope.savingProcess = false;
            });
        }

        //##################### Create Pos Descriptors ##################################//
        //###############################################################################//
        MainConfig.createPosDescriptors = function () {
            angular.forEach(MainConfig.allConfiguration, function (config, key) {
                if (key.toLowerCase() != "api" && key.toLowerCase() != "da" && key.toLowerCase() != "agent" && key.endsWith("Plugin") == false) {
                    MainConfig.allDescriptors[key] = angular.copy(MainConfig.allDescriptors["PosDescriptor"]);
                }
            });
        };

        //##################### Get Selected Json File ##################################//
        //###############################################################################//
        MainConfig.changeJsonFileName = function (fileName) {
            MainConfig.selectedDescriptorCategory = [];
            MainConfig.selectedJsonFile = fileName;
            MainConfig.CollapseAll();
            MainConfig.GetJsonFilesInfo(fileName);
        };

        //##################### Get Selected Json Files Info ############################//
        //###############################################################################//
        MainConfig.GetJsonFilesInfo = function (JsonFileName) {
            var tmpConfiguration = angular.copy(MainConfig.allConfiguration)

            MainConfig.selectedConfigValues = tmpConfiguration[JsonFileName];

            //Get Selected Descriptor
            var stringDescriptor = "";
            if (JsonFileName.toLowerCase() == "api") {
                stringDescriptor = "ApiDescriptor";
            }
            else if (JsonFileName.toLowerCase() == "da") {
                stringDescriptor = "DaDescriptor";
            }
            else if (JsonFileName.toLowerCase() == "agent") {
                stringDescriptor = "AgentDescriptor";
            }
            else if (JsonFileName.endsWith("Plugin")) {
                stringDescriptor = JsonFileName;
            }
            else {
                stringDescriptor = JsonFileName;
            }


            MainConfig.selectedDescriptorCategory = MainConfig.allDescriptors[stringDescriptor];

            //############# Get List of API Versions for Selected Configuration ##################//
            //####################################################################################//
            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }
            var versionsList = [];
            angular.forEach(MainConfig.selectedDescriptorCategory, function (details) {
                angular.forEach(details, function (value, key) {
                    versionsList.push(value.ApiVersion);
                });
            });
            versionsList.push('All');
            MainConfig.apiVersionsList = versionsList.filter(onlyUnique);
            MainConfig.apiVersionsList.sort(function (right, left) { return MainConfig.compareVersionNumbers(right, left, null) });
            MainConfig.apiVersionsList.reverse();
            $scope.AllVersions = 'All';
        };

        //##################### Get Selected Descriptor Category Details ################//
        //###############################################################################//
        MainConfig.SelectedCategory = function (categ) {
            MainConfig.selectedDescriptorDetails = MainConfig.selectedDescriptorCategory[categ];
            MainConfig.selectedConfigValues = angular.copy(MainConfig.allConfiguration[MainConfig.selectedJsonFile]);

            //######### Add new Json Values (Include in Descriptor but not in Json File ##########//
            angular.forEach(MainConfig.selectedDescriptorDetails, function (details) {
                var exist = MainConfig.selectedConfigValues.hasOwnProperty(details.Key);
                if (exist == false) {
                    if (details.Type == "string") {
                        if (details.DefaultValue == "True" || details.DefaultValue == "true") {
                            details.DefaultValue = details.DefaultValue.toLowerCase();
                            MainConfig.selectedConfigValues[details.Key] = JSON.parse(details.DefaultValue);
                        }
                        else if (details.DefaultValue == "False" || details.DefaultValue == "false") {
                            details.DefaultValue = details.DefaultValue.toLowerCase();
                            MainConfig.selectedConfigValues[details.Key] = JSON.parse(details.DefaultValue);
                        }
                        else {
                            MainConfig.selectedConfigValues[details.Key] = details.DefaultValue;
                        }
                    }
                    else if (details.Type == "int")
                    {
                        MainConfig.selectedConfigValues[details.Key] = parseFloat(details.DefaultValue);
                    }
                    else if (details.Type == "decimal") {
                        MainConfig.selectedConfigValues[details.Key] = parseFloat(details.DefaultValue);
                    }
                    else {
                        MainConfig.selectedConfigValues[details.Key] = details.DefaultValue;
                    }
                    MainConfig.allConfiguration[MainConfig.selectedJsonFile] = MainConfig.selectedConfigValues;
                }
            });

            //##### Delete Json Values (Include in Json file but not in Descriptor File ##########//
            var descriptorsValuesArray = [];
            angular.forEach(MainConfig.selectedDescriptorCategory, function (valueArray) {
                angular.forEach(valueArray, function (resArray) {
                    descriptorsValuesArray.push(resArray);
                });
            });
            angular.forEach(MainConfig.selectedConfigValues, function (value, key) {
                var exist = descriptorsValuesArray.some(function (ex) { return ex.Key === key });
                if (exist == false) {
                    delete MainConfig.selectedConfigValues[key];
                }
            });

            angular.forEach(MainConfig.selectedDescriptorDetails, function (details) {
                angular.forEach(MainConfig.selectedConfigValues, function (value, key) {
                    if (details.Key == key) {
                        if (typeof details["Value"] === 'undefined') {
                            details["Value"] = value;
                        }
                    }
                });
            });

            MainConfig.ToggleFunction();
        };

        //####################### Get Selected Version ##################################//
        //###############################################################################//
        MainConfig.greaterThan = function (details, version) {
            if (details) {
                if (version != "All") {
                    return function (details) {
                        var result = MainConfig.compareVersionNumbers(details.ApiVersion, version);
                        if (result >= 0) return true;
                    }
                }
            }
        };

        //############################ Add New Pos Json File ############################//
        //###############################################################################//
        MainConfig.addNewPosJsonFile = function () {
            $mdDialog.show({
                controller: 'PosAddFileCtrl',
                templateUrl: '../app/scripts/components/MainConfiguration/templates/posJsonAdd.html',
                parent: angular.element('#wrapper'),
                fullscreen: $mdMedia('sm'),
                resolve: {
                    ConfigurationFiles: function () { return MainConfig.allConfiguration; }
                }
            }).then(function (retdata) {
                //Get Added Pos Configuration
                var posConfigName = transferDataService.getPosConfigName();

                if (posConfigName != null) {
                    var url = mcFactory.apiInterface.MainConfiguration.GET.AddFile;
                    DynamicApiService.getV3('Configuration', url, posConfigName).then(function (result) {
                        if (result.data == true) {
                            MainConfig.allConfiguration = transferDataService.getConfig();
                            MainConfig.createPosDescriptors();
                            MainConfig.saveSpecificJson(posConfigName);
                            posConfigName = null;
                            tosterFactory.showCustomToast('Το Αρχείο Προστέθηκε με Επιτυχία', 'success');
                        }
                        else {
                            toastr.error('Το Αρχείο δεν μπορεί έχει προστεθεί', 'fail');
                            $scope.showModal = !$scope.showModal;
                        }

                    }).catch(function (rejection) {
                        toastr.error('Add Configuration File failed', 'fail');
                    }).finally(function () {
                    });
                }
            })
        };

        //############################ Save Specific Json ###############################//
        //###############################################################################//
        MainConfig.saveSpecificJson = function (configName) {
            //################################ Collect ALL Changes #######################################//
            //############################################################################################//
            angular.forEach(MainConfig.allConfiguration, function (configurationValues, configurationKeys) {
                if (configurationKeys == configName) {
                    //Get Selected Descriptor
                    var stringDescriptor = "";
                    if (configName.toLowerCase() == "api") {
                        stringDescriptor = "ApiDescriptor";
                    }
                    else if (configName.toLowerCase() == "da") {
                        stringDescriptor = "DaDescriptor";
                    }
                    else if (configName.toLowerCase() == "agent") {
                        stringDescriptor = "AgentDescriptor";
                    }
                    else if (configName.endsWith("Plugin")) {
                        stringDescriptor = configName;
                    }
                    else {
                        stringDescriptor = configName;
                    }
                    var descriptorCategories = MainConfig.allDescriptors[stringDescriptor];

                    //##################### Check if object is Empty and filled configuration ####################//
                    //############################################################################################//
                    var count = 0;
                    for (var key in configurationValues) {
                        count++;
                    }
                    if (count == 0) {
                        angular.forEach(descriptorCategories, function (detailsList) {
                            angular.forEach(detailsList, function (details) {
                                if (details.Type == "string") {
                                    if (details.DefaultValue == "True" || details.DefaultValue == "true") {
                                        details.DefaultValue = details.DefaultValue.toLowerCase();
                                        configurationValues[details.Key] = JSON.parse(details.DefaultValue);
                                    }
                                    else if (details.DefaultValue == "False" || details.DefaultValue == "false") {
                                        details.DefaultValue = details.DefaultValue.toLowerCase();
                                        configurationValues[details.Key] = JSON.parse(details.DefaultValue);
                                    }
                                    else {
                                        configurationValues[details.Key] = details.DefaultValue;
                                    }
                                }
                                else if (details.Type == "int") {
                                    configurationValues[details.Key] = parseFloat(details.DefaultValue);
                                }
                                else if (details.Type == "decimal") {
                                    configurationValues[details.Key] = parseFloat(details.DefaultValue);
                                }
                                else {
                                    configurationValues[details.Key] = details.DefaultValue;
                                }
                            });
                        });
                    }
                    else {
                        angular.forEach(descriptorCategories, function (detailsList) {
                            angular.forEach(detailsList, function (details) {
                                angular.forEach(configurationValues, function (value, key) {
                                    if (details.Key == key) {
                                        if (typeof details.Value != 'undefined') {
                                            configurationValues[key] = details.Value;
                                        }
                                    }
                                });
                            });
                        });
                    }

                    //############################# Send All Data to WebApi ######################################//
                    //############################################################################################//
                    var finalSpecificModel = {};
                    finalSpecificModel[configName] = configurationValues;
                    var url = mcFactory.apiInterface.MainConfiguration.POST.SaveSpecificPos;
                    DynamicApiService.postV3('Configuration', url, finalSpecificModel).then(function (result) {
                        if (result != null && result.data != null) {
                        }
                    }).catch(function (rejection) {
                    }).finally(function () {
                    });
                }
            });
        }

        //############################ Delete Pos Json File #############################//
        //###############################################################################//
        MainConfig.removePosJsonFile = function (row) {
            var isFileDeleted = false;
            //############### Get Distinct PosInfo Configuration Files from API ##################//
            //####################################################################################//
            var url = mcFactory.apiInterface.MainConfiguration.GET.DeleteFile;
            DynamicApiService.getV3('Configuration', url, row).then(function (result) {
                if (result != null && result.data != null) {
                    isFileDeleted = result.data;
                    //Delete file
                    if (isFileDeleted == true) {
                        delete MainConfig.allConfiguration[row];
                        $scope.showModal = !$scope.showModal;
                        MainConfig.selectedDescriptorCategory = [];
                        MainConfig.apiVersionsList = [];
                        $scope.file = null;
                        tosterFactory.showCustomToast('Το επιλεγμένο Αρχείο διαγράφηκε με επιτυχία', 'success');
                    }
                    else {
                        toastr.error('Το Επιλεγμένο Αρχείο δεν μπορεί να διαγραφεί γιατί χρησιμοποιείται ήδη', 'fail');
                        $scope.showModal = !$scope.showModal;
                    }
                } else {
                    tosterFactory.showCustomToast('No Pos Info Configuration List Loaded', 'success');
                }
            }).catch(function (rejection) {
                toastr.error('Loading Pos Info Configuration List failed', 'fail');
            }).finally(function () {
            });
        };

        //############################## Save All Changes ###############################//
        //###############################################################################//
        MainConfig.saveChanges = function () {
            MainConfig.restbusy = true;
            $scope.savingProcess = true;
            //################################ Collect ALL Changes #######################################//
            //############################################################################################//
            //AllDescriptors
            angular.forEach(MainConfig.allConfiguration, function (configurationValues, configurationKeys) {
                //Get Selected Descriptor
                var stringDescriptor = "";
                if (configurationKeys.toLowerCase() == "api") {
                    stringDescriptor = "ApiDescriptor";
                }
                else if (configurationKeys.toLowerCase() == "da") {
                    stringDescriptor = "DaDescriptor";
                }
                else if (configurationKeys.toLowerCase() == "agent") {
                    stringDescriptor = "AgentDescriptor";
                }
                else if (configurationKeys.endsWith("Plugin")) {
                    stringDescriptor = configurationKeys;
                }
                else {
                    stringDescriptor = configurationKeys;
                }
                var descriptorCategories = MainConfig.allDescriptors[stringDescriptor];

                //##################### Check if object is Empty and filled configuration ####################//
                //############################################################################################//
                var count = 0;
                for (var key in configurationValues) {
                    count++;
                }
                if (count == 0) {
                    angular.forEach(descriptorCategories, function (detailsList) {
                        angular.forEach(detailsList, function (details) {
                            if (details.Type == "string") {
                                if (details.DefaultValue == "True" || details.DefaultValue == "true") {
                                    details.DefaultValue = details.DefaultValue.toLowerCase();
                                    configurationValues[details.Key] = JSON.parse(details.DefaultValue);
                                }
                                else if (details.DefaultValue == "False" || details.DefaultValue == "false") {
                                    details.DefaultValue = details.DefaultValue.toLowerCase();
                                    configurationValues[details.Key] = JSON.parse(details.DefaultValue);
                                }
                                else {
                                    configurationValues[details.Key] = details.DefaultValue;
                                }
                            }
                            else if (details.Type == "int") {
                                configurationValues[details.Key] = parseFloat(details.DefaultValue);
                            }
                            else if (details.Type == "decimal") {
                                configurationValues[details.Key] = parseFloat(details.DefaultValue);
                            }
                            else {
                                configurationValues[details.Key] = details.DefaultValue;
                            }
                        });
                    });
                }
                else {
                    angular.forEach(descriptorCategories, function (detailsList) {
                        angular.forEach(detailsList, function (details) {
                            angular.forEach(configurationValues, function (value, key) {
                                if (details.Key == key) {
                                    if (typeof details.Value != 'undefined') {
                                        configurationValues[key] = details.Value;
                                    }
                                }
                            });
                        });
                    });
                }
            });


            //############################# Send All Data to WebApi ######################################//
            //############################################################################################//
            var finalModel = MainConfig.allConfiguration;
            var url = mcFactory.apiInterface.MainConfiguration.POST.SaveAllChanges;
            DynamicApiService.postV3('Configuration', url, finalModel).then(function (result) {
                if (result.data == true) {
                    tosterFactory.showCustomToast('Οι αλλαγές Αποθηκεύτηκαν με Επιτυχία', 'success');
                    //Clear Data
                    MainConfig.allConfiguration = [];
                    $scope.file = null;
                    $scope.AllVersions = null;
                    MainConfig.selectedDescriptorCategory = [];
                    MainConfig.apiVersionsList = [];
                    //Close All Collapse
                    MainConfig.CollapseAll();
                    //Re-get Configuration Files
                    MainConfig.GetConfiguration();
                }
                else {
                    toastr.error('Οι αλλαγές ΔΕΝ Ενημερώθηκαν', 'fail');
                    MainConfig.restbusy = false;
                    $scope.savingProcess = false;
                }
            }).catch(function (rejection) {
                toastr.error('Save Changes Failed', 'fail');
                MainConfig.restbusy = false;
                $scope.savingProcess = false;
                return -1;
            }).finally(function () {
            });
        }

        //############################## compare Version Numbers ########################//
        //###############################################################################//
        MainConfig.compareVersionNumbers = function (v1, v2, options) {
            var lexicographical = options && options.lexicographical,
                zeroExtend = options && options.zeroExtend,
                v1parts = v1.split('.'),
                v2parts = v2.split('.');

            function isValidPart(x) {
                return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
            }

            if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
                return NaN;
            }

            if (zeroExtend) {
                while (v1parts.length < v2parts.length) v1parts.push("0");
                while (v2parts.length < v1parts.length) v2parts.push("0");
            }

            if (!lexicographical) {
                v1parts = v1parts.map(Number);
                v2parts = v2parts.map(Number);
            }

            for (var i = 0; i < v1parts.length; ++i) {
                if (v2parts.length == i) {
                    return 1;
                }

                if (v1parts[i] == v2parts[i]) {
                    continue;
                }
                else if (v1parts[i] > v2parts[i]) {
                    return 1;
                }
                else {
                    return -1;
                }
            }

            if (v1parts.length != v2parts.length) {
                return -1;
            }

            return 0;
        }

        //#################### Call Event Listener for Collapsible Tonggle ##############//
        //###############################################################################//
        MainConfig.ToggleFunction = function () {
            var acc = document.getElementsByClassName("accordion");
            var panel = document.getElementsByClassName('panel');

            for (var i = 0; i < acc.length; i++) {
                acc[i].onclick = function () {
                    var setClasses = !this.classList.contains('active');
                    setClass(acc, 'active', 'remove');
                    setClass(panel, 'show', 'remove');

                    if (setClasses) {
                        this.classList.toggle("active");
                        this.nextElementSibling.classList.toggle("show");
                    }
                }
            }

            function setClass(els, className, fnName) {
                for (var i = 0; i < els.length; i++) {
                    els[i].classList[fnName](className);
                }
            }
        };

        //#################### Call Event Listener for Collapsible Tonggle ##############//
        //###############################################################################//
        MainConfig.CollapseAll = function () {
            var x = document.getElementsByClassName("panel");
            var b;
            for (b = 0; b < x.length; b++) {
                x[b].classList['remove']('show');
            }
        };
    }])

    .controller('PosAddFileCtrl', function ($scope, $mdDialog, transferDataService) {
        var MainConfig2 = this;

        //############################ Close New Pos Modal ##############################//
        //###############################################################################//
        MainConfig2.closeModal = function () {
            $mdDialog.hide();
        };

        //############################ Save New Pos File Name ###########################//
        //###############################################################################//
        MainConfig2.savePosFile = function (posName) {
            var Configuration = [];
            Configuration = transferDataService.getConfig();
            var isSameName = false;
            if (posName) {
                angular.forEach(Configuration, function (value, key) {
                    if (key == posName) {
                        isSameName = true;
                    }
                });
                if (isSameName == false) {
                    //Create New Pos Json File
                    Configuration[posName] = {};
                    //pass the configuration to the service
                    transferDataService.setConfig(Configuration);
                    transferDataService.setPosConfigName(posName);
                    $mdDialog.hide();
                }
                else {
                    toastr.warning("Το Όνομα υπάρχει ήδη. Παρακαλώ Εισάγετε Διαφορετικό Όνομα.")
                }
            }
            else {
                toastr.warning("Παρακαλώ Εισάγετε Όνομα")
            }
        };

    })
    .factory('transferDataService', function () {
        var allConfig = [];//the object to hold our data
        var posConfigName = null;
        return {
            getConfig: function () {
                return allConfig;
            },
            setConfig: function (value) {
                allConfig = value;
            },
            getPosConfigName: function () {
                return posConfigName;
            },
            setPosConfigName: function (name) {
                posConfigName = name;
            }
        }

    });
