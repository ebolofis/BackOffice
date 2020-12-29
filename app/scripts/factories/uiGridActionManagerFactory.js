'use strict';
/**
 * @ngdoc function
 * @name posBOApp.factory:uiGridActionManagerFactory
 * @description 
 * # uiGridActionManagerFactory
 * Factory of the posBOApp
 */

angular.module('posBOApp')
    .factory('uiGridActionManagerFactory', function ($http, $rootScope) { //maps ID with VALUE in select form  to display in drop down ui-grid CELL
        var factory = {}
        factory.gridActionManager = function (masterActionInfo, masterSF, slaveActionInfo, slaveSF) {
            var pause;
            var addA = manageAdd(masterActionInfo.addm, masterSF, slaveActionInfo.addm, slaveSF);
            var delA = "i am del action!!"
            var editA = "i am edit action!!"
            return ({
                master: { addAct: addA.masterActions, editAct: editA, delAct: delA },
                slave: { addAct: addA.slaveActions, editAct: editA, delAct: delA }
            })
        }
        return factory;
    });
function manageAdd(masterAdd, masterSF, slaveAdd, slaveSF) {
    var masterFormArray, slaveFormArray;
    switch (masterAdd.Type) {
        case 'StepWizard':
            masterFormArray = masterSF; //<-- put all objs from master to master 

            // if step wizard add master Sf &&  entities of slaveSF depend on 
            if (masterAdd.Deps.toSlave != 0) { //<-  object field to characterise dependesies to other models Forms
                var extraSFs = slaveSF.filter(function (item) { //steps of slave deps to master, 
                    return item.modelStep != -1;
                });
                // on error check masterAdd.Deps && dep.modelSteps &
                if (masterAdd.Deps.toSlave != extraSFs.length) alert("Action manager/manageAdd Error: Dependencies and extraForms number don't agree!");
                masterFormArray = masterFormArray.concat(extraSFs);
            }
            break;
        case 'SingleModal': if (masterAdd.Steps.length == 1) masterFormArray = masterSF; break;
        default: break;


    };
    switch (slaveAdd.Type) {
        case 'StepWizard': // if step wizard add master Sf &&  entities of slaveSF depend on 
            slaveFormArray = masterSF;
            if (slaveAdd.Deps.toMaster != 0) {
                var extraSFs = masterSF.filter(function (item) { //steps of slave deps to master, 
                    return item.modelStep != -1;
                });//filt slave model where modelStep != -1
                slaveFormArray = slaveFormArray.concat(extraSFs);
            }
            break;
        case 'SingleModal':
            if (slaveAdd.Steps.length == 1) {
                slaveFormArray = slaveSF;
            } break;
        default: break;


    };
    return {
        masterActions: { type: masterAdd.Type, arrayFormModel: masterFormArray },
        slaveActions: { type: slaveAdd.Type, arrayFormModel: slaveFormArray }
    };
}
function manageEdit() {

    return "";
}
function manageDel() {

    return "";
}
//masterSF && slaveSF are array of Object types of these

//stepWizardModel = {
//    modelStep: 1,
//    modelStepName: 'Receipts',
//    modelEntity: 'PosInfo', //dbtable/controllerref
//    gridOwner: 'master',
//    modelFormName: 'formPosInfoStep1',
//    schema: schemaS1,
//    form: formS1,
//    entity: entityS1,
//};


//masterActionInfo  && slaveActionInfo are Objects of these 
//addm:{
//        Type: "StepWizard",
//        Steps: [
//            { Owner: 'master', StepName: 'formPosInfoStep0' },
//            { Owner: 'master', StepName: 'formPosInfoStep1' },
//            { Owner: 'master', StepName: 'formPosInfoStep2' },
//            { Owner: 'master', StepName: 'formPosInfoStep3' },
//            { Owner: 'master', StepName: 'formPosInfoStep4' },
//            { Owner: 'slave', StepName: 'formPosInfoStep5' }
//        ],
//        Deps :{
//            toMaster : 0 , 
//            toSlave : 1
//        }
//},
//editm: "",
//delm: ""