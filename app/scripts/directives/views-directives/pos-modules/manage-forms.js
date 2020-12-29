'use strict';
angular.module('posBOApp')
.controller('EditPosInfoCtrl', function ($scope, $mdDialog, formModel) {
    $scope.entityId = angular.copy(formModel.entityIdentifier);
    $scope.dropdownsLookup = angular.copy(formModel.dropDownObject);
    $scope.dataModel = angular.copy(formModel.model);
    if ($scope.dataModel === undefined || $scope.dataModel === null || $scope.dataModel.Id === undefined || $scope.dataModel.Id === null)
        $scope.dataModel.Id = 0;
    fixByteBool('init', $scope.entityId)

    $scope.modalTitle = '';
    if ($scope.entityId == 'posinfo')
        $scope.modalTitle = 'Edit PosInfo';
    else 
        ($scope.dataModel.Id == 0) ? $scope.modalTitle = 'Insert new PosInfo Detail' : $scope.modalTitle = 'Edit PosInfo Detail';


    $scope.hide = function () { $mdDialog.hide(); };
    $scope.cancel = function () { $mdDialog.cancel(); };
    $scope.confirm = function (answer) {
        fixByteBool('ret', $scope.entityId)
        if ($scope.validExit)
            $mdDialog.hide($scope.dataModel);
    };
    $scope.validExit = true;
    function fixByteBool(type, entityId) {
        switch (entityId) {
            case "posinfodetail":
                if (type == 'init') {
                    ($scope.dataModel.Status == 1) ? $scope.dataModel.Status = true : $scope.dataModel.Status = false;
                    ($scope.dataModel.SendsVoidToKitchen == 1) ? $scope.dataModel.SendsVoidToKitchen = true : $scope.dataModel.SendsVoidToKitchen = false;
                } else if (type == 'ret') {
                    var ftype = $scope.dropdownsLookup.InvoicesTypeId.filter(function (item) {
                        return item.Key == Number($scope.dataModel.InvoicesTypeId);
                    })
                    if (ftype === undefined || ftype.length != 1) {
                        alert('Error on mapping InvoiceType Type with GroupId')
                        $scope.validExit = false;
                    }
                    //Caution GRoupid has to be same with InvoiceTypeSelected.Type **RULE**
                    $scope.dataModel.GroupId = ftype[0].Type;
                    ($scope.dataModel.Status == true) ? $scope.dataModel.Status = 1 : $scope.dataModel.Status = 0;
                    ($scope.dataModel.SendsVoidToKitchen == true) ? $scope.dataModel.SendsVoidToKitchen = 1 : $scope.dataModel.SendsVoidToKitchen = 0;
                }
                break;
            default:
                break;


        }
    }
    $scope.constructPredifinedTemplate = function () {
        $mdDialog.show({
            preserveScope: true,
            skipHide: true,
            controllerAs: 'dialogCtrl',
            controller: function ($mdDialog) {
                this.cancel = function () { $mdDialog.cancel(); };
                this.confirm = function () {
                        $mdDialog.hide('OK');
                };

            },
            template: '<md-dialog class="confirm">'
                + '<md-content class="md-padding"><h2 class="md-title ng-binding">Load Predefined Model</h2>'
                    + '<p>Invoice type changed. Would you like to load predefined model for current choice?</p></md-content>'
                +'<md-dialog-actions layout="row">'
                    + '<md-button class="md-raised" ng-click="dialogCtrl.cancel()">No</md-button>'
                    + '<md-button class="md-raised" ng-click="dialogCtrl.confirm()">Yes</md-button>'
                + '</md-dialog-actions>'
                +'</md-dialog>'
        })
        //var transformDialog = $mdDialog.confirm().parent(angular.element(document.querySelector('#EditPosInfoEntities'))).title('Predifined Model')
        //    .textContent('Invoice type changed. Would you like to load predefined model for current choice?')
        //    .ariaLabel('loadpredinvmodel').ok('Proceed').cancel('Cancel');
        //$mdDialog.show(transformDialog)
            .then(function () {
            var ftype = $scope.dropdownsLookup.InvoicesTypeId.filter(function (item) {
                return item.Key == Number($scope.dataModel.InvoicesTypeId);
            })
            if (ftype === undefined || ftype.length != 1) {
                alert('Error on mapping InvoiceType Type with GroupId')
                $scope.validExit = false;
            }
            $scope.dataModel.GroupId = ftype[0].Type;
            //console.log($scope.dataModel);
            var model = angular.copy($scope.dataModel);
            switch (model.GroupId) {
                case 1:
                    model.CreateTransaction = true;
                    model.ButtonDescription = "Payment";
                    model.InvoiceId = 1;
                    model.IsCancel = false;
                    model.IsInvoice = true;
                    model.SendsVoidToKitchen = false;
                    model.IsPdaHidden = false;
                    break;
                case 2:
                    model.InvoiceId = 2;
                    model.Counter = 0;
                    model.IsInvoice = false;
                    model.IsCancel = false;
                    model.IsPdaHidden = false;
                    model.CreateTransaction = false;
                    model.ButtonDescription = "Captains Order";
                    break;

                case 3:
                    model.InvoiceId = 3;
                    model.Counter = 0;
                    model.IsInvoice = false;
                    model.IsCancel = true;
                    model.IsPdaHidden = false;
                    model.CreateTransaction = true;
                    model.ButtonDescription = "Void Receipt";

                    break;
                case 4:
                    model.InvoiceId = 1;
                    model.Counter = 0;
                    model.IsInvoice = true;
                    model.IsCancel = false;
                    model.IsPdaHidden = false;
                    model.CreateTransaction = true;
                    model.ButtonDescription = "Complimentary Receipt";

                    break;
                case 5:
                    model.InvoiceId = 1;
                    model.Counter = 0;
                    model.IsInvoice = true;
                    model.IsCancel = false;
                    model.IsPdaHidden = false;
                    model.CreateTransaction = true;
                    model.ButtonDescription = "ROOM PACKAGE";

                    break;
                case 7:
                    model.InvoiceId = 4;
                    model.Counter = 0;
                    model.IsInvoice = true;
                    model.IsCancel = false;
                    model.IsPdaHidden = true;
                    model.ButtonDescription = "Invoice";
                    break;
                case 8:
                    model.InvoiceId = 2;
                    model.Counter = 0;
                    model.IsInvoice = false;
                    model.IsCancel = true;
                    model.IsPdaHidden = false;
                    model.CreateTransaction = false;
                    model.SendsVoidToKitchen = true;
                    model.ButtonDescription = "Void Order";
                    break;
                case 11:
                    model.InvoiceId = 5;
                    model.Counter = 0;
                    model.IsInvoice = false;
                    model.IsCancel = false;
                    model.CreateTransaction = true;
                    model.IsPdaHidden = true;
                    model.ButtonDescription = "Απόδειξη είσπραξης";

                    break;
                case 12:
                    model.InvoiceId = 5;
                    model.Counter = 0;
                    model.IsInvoice = false;
                    model.IsCancel = true;
                    model.CreateTransaction = true;
                    model.IsPdaHidden = true;
                    model.ButtonDescription = "Απόδειξη πληρωμής";
                    break;
            }
            $scope.dataModel = angular.extend($scope.dataModel, model);
        });
    }
})
    //https://github.com/mgonto/angular-wizard
    //stepwizard manual
.controller('SetupNewPosCtrl', function ($scope, $mdDialog, formModel) {
    $scope.entityId = angular.copy(formModel.entityIdentifier);
    $scope.dropdownsLookup = angular.copy(formModel.dropDownObject);
    $scope.dataModel = angular.copy(formModel.model);
    if ($scope.dataModel === undefined || $scope.dataModel === null || $scope.dataModel.Id === undefined || $scope.dataModel.Id === null) {
        $scope.dataModel.Id = 0;
        $scope.dataModel.Theme = 'Light';
    }
    $scope.wizardStepModels = [
        { title: "Manage general POS settings", label: "General", templateName: 'step1', allowChange: false, completed: false, disabled: false },
        { title: "Receipts Settings", label: "Receipts", templateName: 'step2', allowChange: false, completed: false, disabled: true },
        { title: "Setup your order settings", label: "Order", templateName: 'step3', allowChange: false, completed: false, disabled: true },
        { title: "Select templates management", label: "Details", templateName: 'step4', allowChange: false, completed: false, disabled: true }
    ];

    $scope.selectedstep = 0;
    var defaultValue = $scope.dropdownsLookup.PidTemplateTransactionTypeEnum.filter(function (item) { return item.Key == 0; })
    var ents = $scope.dropdownsLookup.InvoicesTypeId.map(function (cnt) {
        var tmpObj = {
            Id: cnt.Key,
            Code: cnt.Code,
            Description: cnt.Value,
            Abbreviation: cnt.Abbr,
            Type: cnt.Type,
        }
        var ret = {
            InvoiceType: tmpObj,
            TransactionType: defaultValue[0].Key,
        }
        return ret;
    })
    $scope.dataModel.PosInfoDetailTemplate = ents;

    $scope.nextStep = function (val) {
        var pause;
        $scope.wizardStepModels[$scope.selectedstep].completed = true;
        $scope.selectedstep = $scope.selectedstep + 1;
        $scope.wizardStepModels[$scope.selectedstep].disabled = false;
        //console.log($scope.selectedstep)
    }

    $scope.$watchGroup(['step1Form.$invalid', 'step2Form.$invalid', 'step3Form.$invalid'], function (newValues, oldValues, scope) { //, 'isGridRowDirty'
        (newValues[0] == false) ? $scope.wizardStepModels[0].completed = true : $scope.wizardStepModels[0].completed = false;
        (newValues[1] == false) ? $scope.wizardStepModels[1].completed = true : $scope.wizardStepModels[1].completed = false;
        (newValues[2] == false) ? $scope.wizardStepModels[2].completed = true : $scope.wizardStepModels[2].completed = false;
        (newValues[0] == false && newValues[1] == false && newValues[2] == false) ? $scope.disablefinish = false : $scope.disablefinish = true;

    });
    $scope.hide = function () { $mdDialog.hide(); };
    $scope.cancel = function () { $mdDialog.cancel(); };
    $scope.confirm = function (answer) {
        var tmptmpl = $scope.dataModel.PosInfoDetailTemplate.filter(function (item) {
            item.TransactionType = Number(item.TransactionType);
            return item.selected == true;
        })
        console.log(tmptmpl);
        $scope.dataModel.PosInfoDetailTemplate = tmptmpl;
        $mdDialog.hide($scope.dataModel);
    };
})


