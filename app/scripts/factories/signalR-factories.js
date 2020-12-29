'use strict';
//File including all factories of signal-R service actions
//Create new hub of  predef options ove rsignalR API service to handle  msgs
//Documentation: https://github.com/JustMaier/angular-signalr-hub
angular.module('posBOApp')
.factory('WPHub', ['$rootScope', 'Hub', '$timeout', 'auth', function ($rootScope, Hub, $timeout, auth) {
    console.log('Signal-R Initiallizing')
    var connectionName = //auth.getLoggedSpecs.storeId + 
        "d107eeec-752a-45cf-a214-1a868731f088|BO-1";
    //"d707eeec-752a-45cf-a214-1a868731f088|BO-1";

    //var connection = $.hubConnection('http://localhost:54200/', { useDefaultPath: true, qs: { "name": connectionName }, withCredentials: false });
    var connection = $.hubConnection('http://sisifos:5420/', { useDefaultPath: true, qs: { "name": connectionName }});

    var proxy = connection.createHubProxy("webPosHub");

    console.log("Trying to connect!");
    connection.start({
        jsonp: true
    }).done(function () {
        console.log("Connected, transport = " + connection.transport.name);
        console.log("Now connected, connection ID = " + connection.id);
    }).fail(function (err) {
        console.log("Could not connect: " + err);
    });


    /// Event Listeners
    proxy.on("connectedUsers", function (connectedUsers) {
        console.log(connectedUsers);
    });
    proxy.on("plainMessage", function (msg) {
        console.log("Plain message: " + msg);
    });

    $(connection).bind("onDisconnect", function (e, data) {
        connection.start({ jsonp: true }).done(function () {
            console.log("Connected, transport = " + connection.transport.name);
            console.log("Now connected, connection ID= " + connection.id);
        }).fail(function (err) {
            console.log("Could not connect: " + err);
        });
    });
    //connection.start().done(function () {
    //    alert('zavara');
    //});
    //declaring the hub connection
    //var hub = new Hub('webPosHub', {
    //    //client side methods
    //    listeners:{
    //        //'lockEmployee': function (id) {
    //        //    var employee = find(id);
    //        //    employee.Locked = true;
    //        //    $rootScope.$apply();
    //        //},
    //        //'unlockEmployee': function (id) {
    //        //    var employee = find(id);
    //        //    employee.Locked = false;
    //        //    $rootScope.$apply();
    //        //}
    //    },

    //    //server side methods
    //    methods: ['NewChatMessage'],

    //    //query params sent on initial connection
    //    queryParams: { useDefaultPath: true, qs: { "name": connectionName } , withCredentials: false },

    //    //handle connection error
    //    errorHandler: function(error){
    //        console.error(error);
    //    },

    //    //specify a non default root
    //    rootPath: 'http://localhost:54200/',//api',
    //    //'stateChanged': function(state){
    //    //	var stateNames = {0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected'};
    //    //	if(stateNames[state.newState] == 'disconnected'){
    //    //    //Hub Disconnect logic here...
    //    //}
    //    //}
    //    stateChanged: function (state) {
    //        alert('Connection State Changed : ' + state.newState)
    //        switch (state.newState) {
    //            case $.signalR.connectionState.connecting:
    //                //your code here
    //                break;
    //            case $.signalR.connectionState.connected:
    //                //your code here
    //                break;
    //            case $.signalR.connectionState.reconnecting:
    //                //your code here
    //                break;
    //            case $.signalR.connectionState.disconnected:
    //                //your code here
    //                break;
    //        }
    //    }

    //});

    var sendmsg = function (msg) {
        hub.NewChatMessage(msg); //Calling a server method
    };
    var sendplain = function (msg) {
        proxy.invoke("plainMessage", msg, true);
        //hub.PlainMessage(msg); //Calling a server method
    };
    //var done = function (employee) {
    //    hub.unlock(employee.Id); //Calling a server method
    //}


    return {
        on: function (eventName, callback) {
            proxy.on(eventName, function (result) {
                $rootScope.$apply(function () {
                    if (callback) {
                        callback(result);
                    }
                });
            });
        },
        invoke: function (methodName, callback) {
            proxy.invoke(methodName)
            .done(function (result) {
                $rootScope.$apply(function () {
                    if (callback) {
                        callback(result);
                    }
                });
            });
        },
        sendMessage: sendmsg,
        sendPlainMessage: sendplain
    };
}]);


//Options

//listeners: client side callbacks*
//withCredentials: whether or not cross-site Access-Control requests should be made using credentials such as cookies, authorization headers or TLS client certificates, defaults to true
//methods: a string array of server side methods which the client can call
//rootPath: sets the root path for the signalR web service
//queryParams: object representing additional query params to be sent on connection, can also be specified in the connect method
//errorHandler: function(error) to handle hub connection errors
//logging: enable/disable logging
//useSharedConnection: use a shared global connection or create a new one just for this hub, defaults to true
//transport: sets transport method (e.g 'longPolling' or ['webSockets', 'longPolling'])
//jsonp: toggle JSONP for cross-domain support on older browsers or when you can't setup CORS
//stateChanged: function() to handle hub connection state changed event {0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected'}
//autoConnect: prevents from connecting automatically. useful for authenticating and then connecting.

//Note hubDisconnected has been removed, instead use the following:

//'stateChanged': function(state){
//	var stateNames = {0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected'};
//	if(stateNames[state.newState] == 'disconnected'){
//    //Hub Disconnect logic here...
//}
//}