(function () {
    angular.module('posBOApp')
        .service('boutil', backOfficeUtil)
        .factory('bolog' , BackOfficeLogger)
    //Implementation of backoffice utilization factory
    function backOfficeUtil(bolog) {
        console.log('Logger initiallization starting');
        var util;
        util = {
            msg: bolog.alert,
            log: bolog.log
        }
        return util;
    }

    //Logger Factory user to debugor msg BackOffice utilizations
    function BackOfficeLogger() {
        var logger = this;

        logger.log = function (msg) { console.log(msg); }
        logger.alert = function (txt) { alert(txt); }

        return logger;
    }
}());