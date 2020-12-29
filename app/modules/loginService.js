(function () {
    angular.module('posBOApp')
        .service('NewLoginService', ['$http', 'config', 'auth', '$base64', 'loginAuth', function ($http, config, auth, $base64, loginAuth) {
            var urlBase = config.WebApiURL + 'api/';
            //REST to init Dyn grid Model ||tableType AS Identifier of Dyn entity
            this.uploadImage = function (controllerName, actionName, extraData, data) {
                controllerName = "/" + controllerName; actionName = '/' + actionName; extraData = '/' + extraData;
                var authSpecs = auth.getLoggedSpecs();
                //$http.defaults.headers.common['Authorization'] = authSpecs.auth;
                var call = urlBase + authSpecs.storeId + controllerName + actionName + extraData;
                console.log(call);

                var formData = new FormData(); formData.append("file", data);
                return $http.post(call, formData, {
                    headers: { 'Content-Type': undefined }, transformRequest: angular.identity
                });
                //return $http({ url: call, method: "POST", file: data });
            }


            //Providing a resource with params ex: api/zavara/search/{page}/{pagesize}
            //and an object like { page: 1 , pagesize : 20 }
            //applies a regex to src and provides resource with values ex: api/zavara/search/1/20
            this.regexUrl = function (resc, objmap) {
                // based on a resc with { as vars } overlaps through string to find variables of {name} and provides an array of  entities 
                // if these entities exist on objmap then it replace those strings with the obj[{name}]
                if (!resc || resc.length == 0) {
                    console.error('Resource Constructor: empty or error src-string  provided as resource');
                    return resc;
                }
                var retresc = resc;
                if (objmap === undefined || objmap === null) {
                    console.warn('Resource Constructor: no mapobject to resource variables');
                    return retresc;
                }
                var vars = resc.match(/{(.*?)}/g); // find all in substrings like  {}  and return array of strings [ "{row}" , "{page}", ... ]
                // set force vars = null for debug
                if (!vars || vars.length <= 0) {
                    console.log('Resource Constructor: no resource variables to handle');
                    return retresc;
                }
                angular.forEach(vars, function (literal) {
                    var entkey = literal.slice(1, literal.length - 1); // construct key removing {} from  "{row}" to "row"
                    var updatestr = (objmap[entkey] !== undefined && objmap[entkey] !== null) ? objmap[entkey] : 0
                    if (config.workPolicy == true)
                        console.log('replace:' + literal + ' -> ' + updatestr);
                    retresc = retresc.replace(literal, updatestr);
                })
                return retresc;
            }
            //------------------------------------------------------------------------
            //----------------------------- V3 Resources -----------------------------
            // [RoutePrefix("api/v3/Report")] Route("ReportTotalsForPos/{PosInfoId}/{DepartmentId}/{StaffId}")
            this.getV3 = function (RoutePrefix, Route, dataObj) {
                var authSpecs = auth.getLoggedSpecs();
                $http.defaults.headers.common['Authorization'] = authSpecs.auth;
                var d = (dataObj != null) ? '/' + dataObj : '';
                var urlResource = urlBase + 'v3' + '/' + RoutePrefix + '/' + Route;
                console.log(urlResource)
                return $http.get(urlResource + d);
            }
            this.postV3 = function (RoutePrefix, Route, dataObj) {
                var authSpecs = auth.getLoggedSpecs();
                $http.defaults.headers.common['Authorization'] = authSpecs.auth;
                var urlResource = urlBase + 'v3' + '/' + RoutePrefix + '/' + Route;
                return $http({ url: urlResource, method: "POST", dataType: 'JSON', data: JSON.stringify(dataObj), });
            }

            this.getDAV3 = function (RoutePrefix, Route, dataObj) {
                var sUsername = loginAuth.DA_Staff_Username;
                var staffPassword = loginAuth.DA_Staff_Password;
                var staffUsername = "";
                if (sUsername.endsWith("@")) {
                    staffUsername = sUsername;
                }
                else {
                    staffUsername = sUsername.concat("@");
                }
                var authNew = $base64.encode("" + staffUsername + ":" + staffPassword + "");
                $http.defaults.headers.common['Authorization'] = 'Basic ' + authNew;
                var d = (dataObj != null) ? '/' + dataObj : '';
                var urlResource = urlBase + 'v3' + '/da/' + RoutePrefix + '/' + Route;
                console.log(urlResource)
                return $http.get(urlResource + d);
            }
            this.postDAV3 = function (RoutePrefix, Route, dataObj) {
                var authSpecs = auth.getLoggedSpecs();
                $http.defaults.headers.common['Authorization'] = authSpecs.auth;
                var urlResource = urlBase + 'v3' + '/da/' + RoutePrefix + '/' + Route;
                return $http({ url: urlResource, method: "POST", dataType: 'JSON', data: JSON.stringify(dataObj), });
            }


            //Rest Service over Api for LookupEnums
            //ProvideTableName and get assigned lookup Lists
            this.getLookupsByEntityName = function (ename) {
                var authSpecs = auth.getLoggedSpecs();
                $http.defaults.headers.common['Authorization'] = authSpecs.auth;
                var sid = '?storeId=' + authSpecs.storeId;
                return $http.get(urlBase + 'DynSingleGrid' + sid + '&lookupEntityName=' + ename);
            }

            this.getDynamicUrl = function (url) {
                //crc.getHeaders().add("Access-Control-Allow-Origin", "*"); //crc.getHeaders().add("Access-Control-Allow-Credentials", "true"); //crc.getHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
                $http.defaults.headers.common['Access-Control-Allow-Origin'] = "*";
                $http.defaults.headers.common['Access-Control-Allow-Methods'] = "*";
                return $http({ url: url, method: "GET", headers: { 'Content-Type': 'application/json; charset=utf-8' } });
            }
            this.getDynamicGridModel = function (tableType) {
                var authSpecs = auth.getLoggedSpecs();
                $http.defaults.headers.common['Authorization'] = authSpecs.auth;
                //return $http.get(urlBase + 'DynSingleGrid' + '?entityName=' + tableType);
                var sid = '?storeId=' + authSpecs.storeId;
                return $http.get(urlBase + 'DynSingleGrid' + sid + '&entityName=' + tableType);
            }
            //REST to get entity Data from ||apiControllerName AS entity ||parameters as Page
            this.getDynamicObjectData = function (apiControllerName, parameters) {
                var authSpecs = auth.getLoggedSpecs();
                $http.defaults.headers.common['Authorization'] = authSpecs.auth;
                //parameters = '?' + parameters;
                //return $http.get(urlBase + apiControllerName + parameters);
                if (parameters !== undefined && parameters !== null && parameters !== '')
                    parameters = '&' + parameters;
                else parameters = '';
                var sid = '?storeId=' + authSpecs.storeId;
                console.log(urlBase + apiControllerName + sid + parameters);
                return $http.get(urlBase + apiControllerName + sid + parameters);
            }

            this.getAttributeRoutingData = function (controllerName, actionName, extraData, parameters) {
                controllerName = "/" + controllerName;
                if (actionName != '') actionName = "/" + actionName;

                var useParams = false, useExtra = false;
                if (extraData !== undefined && extraData !== null && extraData != "") {
                    useExtra = true;
                    extraData = '/' + extraData;
                }
                if (parameters !== undefined && parameters !== null && parameters !== "") {
                    useParams = true;
                    parameters = '?' + parameters;
                }

                var authSpecs = auth.getLoggedSpecs();
                $http.defaults.headers.common['Authorization'] = authSpecs.auth;

                var call = urlBase + authSpecs.storeId + controllerName + actionName;
                if (useExtra == true)
                    call = call + extraData;
                if (useParams == true)
                    call = call + parameters;
                console.log(call);
                //console.log(JSON.stringify(rowEntitiesArray));
                return $http.get(call);
            }

            //--------------------------------------------- POST ACTION FUNS -----------------------------------------------------
            //--------------------------------------------------------------------------------------------------------------------
            this.postSingle = function (apiControllerName, rowEntity) {
                var authSpecs = auth.getLoggedSpecs();
                $http.defaults.headers.common['Authorization'] = authSpecs.auth;
                //$http.defaults.headers.common['Access-Control-Allow-Origin'] = "*";
                var sid = '?storeId=' + authSpecs.storeId;

                var callUrl = urlBase + apiControllerName + sid;
                console.log(callUrl); console.log(JSON.stringify(rowEntity));
                return $http.post(callUrl, rowEntity);
            }
            this.postMultiple = function (apiControllerName, rowEntitiesArray) {
                var authSpecs = auth.getLoggedSpecs(); $http.defaults.headers.common['Authorization'] = authSpecs.auth;

                var sid = '?storeId=' + authSpecs.storeId;
                var callUrl = urlBase + apiControllerName + sid;
                console.log(callUrl); console.log(JSON.stringify(rowEntitiesArray));
                return $http({ url: callUrl, method: "POST", dataType: 'JSON', data: JSON.stringify(rowEntitiesArray), });
            }

            //http://localhost:61964/api/2623fe8e-cb11-4591-b953-bc070b6a5f56/PosInfo/Add
            this.postAttributeRoutingData = function (controllerName, actionName, data) {
                var authSpecs = auth.getLoggedSpecs(); $http.defaults.headers.common['Authorization'] = authSpecs.auth;
                controllerName = "/" + controllerName;
                if (actionName != '')
                    actionName = "/" + actionName;
                var callUrl = urlBase + authSpecs.storeId + controllerName + actionName;
                console.log(callUrl); console.log(JSON.stringify(data));
                return $http({ url: callUrl, method: "POST", dataType: 'JSON', data: JSON.stringify(data) });
            }

            //--------------------------------------------- PUT ACTION FUNS ---------------------------------------------------
            //--------------------------------------------------------------------------------------------------------------------

            this.putSingle = function (apiControllerName, params, rowEntity) {
                var authSpecs = auth.getLoggedSpecs(); $http.defaults.headers.common['Authorization'] = authSpecs.auth;
                var sid = '?storeId=' + authSpecs.storeId;
                params = (params !== null && params !== undefined && params != '') ? ('&' + params) : '';
                console.log(JSON.stringify(rowEntity));
                return $http({ url: urlBase + apiControllerName + sid + params, method: "PUT", dataType: 'JSON', data: JSON.stringify(rowEntity) });
            }

            //REST to PUT dirty rows of data ||apiControllerName AS entity || rowEntitiesArray as Array of Dirty Rows
            this.putMultiple = function (apiControllerName, rowEntitiesArray) {
                var authSpecs = auth.getLoggedSpecs(); $http.defaults.headers.common['Authorization'] = authSpecs.auth;
                var sid = '?storeId=' + authSpecs.storeId;
                var callUrl = urlBase + apiControllerName + sid;
                console.log(callUrl); console.log(JSON.stringify(rowEntitiesArray));
                return $http({ url: callUrl, method: "PUT", dataType: 'JSON', data: JSON.stringify(rowEntitiesArray), });
            }

            //http://localhost:61964/api/PosInfo/UpdatePage?storeId=2623fe8e-cb11-4591-b953-bc070b6a5f56
            this.putAttributeRoutingDataParamStoreId = function (controllerName, actionName, data) {
                var authSpecs = auth.getLoggedSpecs(); $http.defaults.headers.common['Authorization'] = authSpecs.auth;
                actionName = "/" + actionName;
                var callUrl = urlBase + controllerName + actionName + '?storeId=' + authSpecs.storeId;
                console.log(callUrl); console.log(JSON.stringify(data));

                return $http({ url: callUrl, method: "PUT", dataType: 'JSON', data: JSON.stringify(data) });
            }
            //PUT api/{storeId}/Region/UpdateRange
            this.putAttributeRoutingData = function (controllerName, actionName, data) {
                var authSpecs = auth.getLoggedSpecs(); $http.defaults.headers.common['Authorization'] = authSpecs.auth;

                controllerName = "/" + controllerName;
                actionName = "/" + actionName;
                var callUrl = urlBase + authSpecs.storeId + controllerName + actionName;
                console.log(callUrl); console.log(JSON.stringify(data));
                return $http({ url: callUrl, method: "PUT", dataType: 'JSON', data: JSON.stringify(data) });
            }

            //--------------------------------------------- DELETE ACTION FUNS ---------------------------------------------------
            //--------------------------------------------------------------------------------------------------------------------
            //http://poswebapi.hitweb.com/api/PricelistMaster/storeId=2623fe8e-cb11-4591-b953-bc070b6a5f56&id=5
            this.deleteSingle = function (apiControllerName, parameters) {
                var authSpecs = auth.getLoggedSpecs(); $http.defaults.headers.common['Authorization'] = authSpecs.auth;

                parameters = '&id=' + parameters;
                var sid = '?storeId=' + authSpecs.storeId;
                var callUrl = urlBase + apiControllerName + sid + parameters;

                console.log(callUrl);
                return $http.delete(callUrl);
            }
            this.deleteMultiple = function (apiControllerName, rowEntitiesArray) {
                var authSpecs = auth.getLoggedSpecs(); $http.defaults.headers.common['Authorization'] = authSpecs.auth;

                var sid = '?storeId=' + authSpecs.storeId;
                var callUrl = urlBase + apiControllerName + sid;
                console.log('method: MULTIDEL ' + urlBase + apiControllerName + sid);
                console.log(JSON.stringify(rowEntitiesArray));

                return $http({ url: callUrl, method: "DELETE", headers: { 'Content-Type': 'application/json' }, data: JSON.stringify(rowEntitiesArray), });
            }

            this.deleteAttributeRoutingData = function (controllerName, actionName, data) {
                var authSpecs = auth.getLoggedSpecs(); $http.defaults.headers.common['Authorization'] = authSpecs.auth;

                controllerName = "/" + controllerName; actionName = "/" + actionName;
                var callUrl = urlBase + authSpecs.storeId + controllerName + actionName;
                console.log(callUrl); console.log(JSON.stringify(data));
                return $http({ url: callUrl, method: "DELETE", headers: { 'Content-Type': 'application/json' }, dataType: 'JSONP', data: JSON.stringify(data) });
            }
            //api/{ storeId }/controllerName/actionName/data
            this.deleteAttributeRoutingDataForce = function (controllerName, actionName, data) {
                var authSpecs = auth.getLoggedSpecs();
                $http.defaults.headers.common['Authorization'] = authSpecs.auth;
                controllerName = "/" + controllerName; actionName = "/" + actionName; data = "/" + data;
                var callUrl = urlBase + authSpecs.storeId + controllerName + actionName + data;
                console.log(callUrl);
                return $http({ url: callUrl, method: "DELETE", headers: { 'Content-Type': 'application/json' } });
            }

            //DELETE api/StoreMessages/{id}?storeid={storeid}	
            this.deleteAttributeRoutingDataParamStoreId = function (apiControllerName, actionName) {
                (actionName !== null && actionName !== undefined && actionName !== '') ? (actionName = '/' + actionName) : actionName = '';
                var authSpecs = auth.getLoggedSpecs();
                $http.defaults.headers.common['Authorization'] = authSpecs.auth;
                var sid = '?storeId=' + authSpecs.storeId;
                console.log('method: DelAttr routingdata ' + urlBase + apiControllerName + actionName + sid);
                return $http({ url: urlBase + apiControllerName + actionName + sid, method: "DELETE" });
            }

        }
        ])
})();