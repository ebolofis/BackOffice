'use strict';
//angular.module('posBOApp.config', []).constant("config", {
//    WebApiURL: "http://sisifos:5420/",
//    Version: 4, Features: 0, Minor: 4, External: 2,
//    workPolicy: 'release',
//})

//***************************************************************
//***************************************************************

angular.module('posBOApp.config', []).constant("config", {
    WebApiURL: "http://localhost:5420/",
    Version: 5, Features: 0, Minor: 15, External: 0,
    workPolicy: 'release',        // option will produce functionallity on release feature 
    //workPolicy: 'dev',              // option will add extra features and logs on views
})

angular.module('posBOApp.loginAuth', []).constant("loginAuth", {
    DA_Staff_Username: "1",
    DA_Staff_Password: "1",
})

//'WebApiURL': "http://192.168.47.93/Pos_WebApi/",//CodeFirst on web-servises-dev/PosWebApi
//'WebApiURL': "http://192.168.15.59:8001/",//CodeFirst on web-servises-dev/PosWebApi
//'WebApiURL': "http://sisifos:5420/",
//'WebApiURL': "http://localhost:55420/",
//'WebApiURL': "http://localhost:54690/",//CodeFirst on web-servises/PosWebApi
//'WebApiURL': "http://localhost:6969/",//Local WebApi Site 
//'WebApiURL': "http://poswebapi.hitweb.com.gr/",//Hit domain WebAPI

//***************************************************************
//***************************************************************





