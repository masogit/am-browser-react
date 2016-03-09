var am = angular.module('am', ['ui.bootstrap', 'ngRoute', 'mobile-angular-ui', 'mobile-angular-ui.gestures', 'chart.js']);

am.config(function ($routeProvider) {
    $routeProvider.when('/explorer', { templateUrl: '/browser/explorer/index.html'});
    $routeProvider.when('/explorer/records', { templateUrl: '/browser/explorer/records.html'});
    $routeProvider.when('/relations', { templateUrl: '/browser/relations.html'});
    $routeProvider.when('/builder', { templateUrl: '/browser/builder/index.html'});
    $routeProvider.when('/setting', { templateUrl: '/browser/setting.html'});
    $routeProvider.when('/aql', { templateUrl: '/browser/aql/index.html'});
    $routeProvider.otherwise({ redirectTo: '/explorer' });

});

am.controller('amCtl', function ($scope, $http, $uibModal, $window) {
    var AM_FORM_DATA = "amFormData";

    $scope.title = "AM Browser";
    $scope.formData = {
        server: "", // "16.165.217.186:8081",
        context: "/AssetManagerWebService/rs/",
        "ref-link": "",     // "db/amLocation/126874",
        collection: "",     // "EmplDepts",
        param: {
            limit: "100",
            offset: "0",
            filter: "",
            orderby: "",
            fields: []
        },

        method: "get",
        user: "", // admin
        password: "",

        pageSize: 10,
        cache: false,
        viewStyle: "tile",
        //        showError: false,
        showLabel: false
    };

    $scope.alerts = [];
    $scope.AQL = {
        alias: "",
        str: ""
    };
    
    $scope.ucmdb = {
        server: "",
        user: "",
        password: "",
        path: "/ucmdb-browser/ucmdb_widget.jsp?server=Default%20Client&locale=en#widget=properties;refocus-selection="
    };
    
    $scope.getAM = function () {
        $http.get("/am/conf").success(function (data) {
            $scope.formData.server = data.server;
            $scope.formData.user = data.user;
        }).error(function (data) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: data
                });
            });
    };
    
    $scope.getAM();
    
    // console.log(window.location.pathname);
    if (window.location.pathname.indexOf("login") < 0) {
        if (sessionStorage && sessionStorage[AM_FORM_DATA]) {
            var form = JSON.parse(sessionStorage.getItem(AM_FORM_DATA));
            
            if (form.server == "" || form.user == "") {
                $scope.lastPath = window.location.pathname;
                window.location.href = "/login";
            }
        } else {
            window.location.href = "/login";
        }

    }
    
    $scope.login = function () {
        var form = clone($scope.formData);
        form['ref-link'] = "db/amEmplDept";
        form.param.filter = "UserLogin='" + form.user.trim() + "'";
        $scope.logining = true;
        $http.post('/am/rest', form).success(function (data) {
            if (data instanceof Object) {
                $scope.store();
                window.location.href = "/browser";
            } else {
                $scope.alerts.push({
                    type: 'danger',
                    msg: 'Username or password incorrect!'
                });
                $scope.logining = false;
            }
        }).error(function (data) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: 'Server can not be reached!'
                });
                $scope.logining = false;
            });
    };

    $scope.logout = function () {
        $scope.formData.password = "";
        window.location.href = "/login";
    };

    $scope.back = function () {
        $window.history.back();
    };

    $scope.inHash = function (module) {
        var hash = $window.location.hash;
        return hash.indexOf(module) > -1;
    };

    $scope.store = function () {
        if (localStorage) {
            var form = {
                // server: $scope.formData.server,
                // user: $scope.formData.user,
//                password: $scope.formData.password,
                pageSize: $scope.formData.pageSize,
                showLabel: $scope.formData.showLabel,
                //                showError: $scope.formData.showError,
                limit: $scope.formData.param.limit,
                offset: $scope.formData.param.offset,
                cache: $scope.formData.cache,
                viewStyle: $scope.formData.viewStyle
            };
            localStorage.setItem(AM_FORM_DATA, JSON.stringify(form));
        }

        if (sessionStorage) {
            var form = {
                server: $scope.formData.server,
                user: $scope.formData.user
            };
            sessionStorage.setItem(AM_FORM_DATA, JSON.stringify(form));
        }        

        if ($scope.ucmdb && $scope.ucmdb.server) $scope.saveUCMDB();
    };

    if (localStorage && localStorage[AM_FORM_DATA]) {
        var form = JSON.parse(localStorage.getItem(AM_FORM_DATA));
        // if (form.server) $scope.formData.server = form.server;
        // if (form.user) $scope.formData.user = form.user;
//        $scope.formData.password = form.password;
        if (form.pageSize) $scope.formData.pageSize = form.pageSize;
        if (form.showLabel) $scope.formData.showLabel = form.showLabel;
        //        $scope.formData.showError = form.showError;
        if (form.limit) $scope.formData.param.limit = form.limit;
        if (form.offset) $scope.formData.param.offset = form.offset;
        if (form.cache) $scope.formData.cache = form.cache;
        if (form.viewStyle) $scope.formData.viewStyle = form.viewStyle;
    }

    $scope.toggleCheckbox = function (array, field) {
        if (!array)
            array = [];
        var idx = array.indexOf(field);
        if (idx > -1) {
            array.splice(idx, 1);
        }
        else {
            array.push(field);
        }
    };

    $scope.addFields = function (fields) {
        //        console.log("metadata table: " + JSON.stringify($scope.metadata.table));
        var form = clone($scope.formData);
        form.param.fields = fields;
        //        $scope.formData.param.fields = fields;
        $scope.query(form);
        $scope.hiddenRelations();
    };

    /**
     * save UCMDB info
     */
    $scope.loadUCMDB = function () {
        $http.get('/json/ucmdb').success(function (data) {
            $scope.ucmdb = data[0];
        }).error(function (data) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: data
                });
            });
    };
    $scope.loadUCMDB();

    $scope.saveUCMDB = function () {
        if ($scope.ucmdb && $scope.ucmdb.server)
            $http.post('/json/ucmdb', $scope.ucmdb).success(function (data) {

            }).error(function (data) {
                    $scope.alerts.push({
                        type: 'danger',
                        msg: data
                    });
                });
    };

    $scope.urlUCMDB = function (gId) {
        return $scope.ucmdb.server + $scope.ucmdb.path + gId + ";username=" + $scope.ucmdb.user + ";password=" + $scope.ucmdb.password;
    };

    /**
     * build native AQL query
     */
    $scope.loadAQLs = function () {
        var form = clone($scope.formData);
        form['ref-link'] = "db/amInToolReport";
        $http.post('/am/rest', form).success(function (data) {
            $scope.amInToolRepoprt = data;
        });

        $http.get('/json/aql').success(function (data) {
            $scope.aqlHist = data;
        }).error(function (data) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: data
                });
            });

    };

    $scope.loadAQL = function (aql, name) {
        $scope.AQL.str = aql;
        $scope.AQL.alias = name;
        $scope.selectedAQL = name;
    };

    $scope.removeAQL = function (aql) {
        if (aql.$loki)
            $http.delete('/json/aql/' + aql.$loki).success(function (data) {
                $scope.loadAQLs();
            }).error(function (data) {
                    $scope.alerts.push({
                        type: 'danger',
                        msg: data
                    });
                });
    };

    $scope.saveAQL = function (name, str, aqlChart) {
        // init
        if (!$scope.aqlHist)
            $scope.aqlHist = [];

        var aql = $scope.aqlHist.filter(function (obj) {
            return obj.name == name;
        })[0];

        var aqlObj;

        if (aql) {
            aql.str = str;
            aql.time = Date.now();
            aql.data = aqlChart;
            aqlObj = aql;
        } else {
            aqlObj = {
                name: name,
                str: str,
                time: Date.now(),
                data: aqlChart
            };
        }
        $http.post('/json/aql', aqlObj).success(function (data) {
            $scope.loadAQLs();
        }).error(function (data) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: data
                });
            });
    };

    $scope.str2AQL = function (str) {
        var aql = {
            tableName: "",
            where: "",
            fields: ""
        };

        // get key word position
        // todo: check if AQL can contain multipule key words
        var idx_SELECT = str.toLowerCase().indexOf("select");
        var idx_FROM = str.toLowerCase().indexOf("from");
        var idx_WHERE = str.toLowerCase().indexOf("where");

        // get fields from SELECT .. FROM
        aql.fields = str.substring(idx_SELECT + 6, idx_FROM).trim();

        // get tableName from FROM .. WHERE (WHERE is optional)
        aql.tableName = (idx_WHERE > -1) ? str.substring(idx_FROM + 4, idx_WHERE).trim() : str.substring(idx_FROM + 4).trim();

        // get where start from WHERE (not include WHERE, where is optional)
        aql.where = (idx_WHERE < 0) ? "" : str.substring(idx_WHERE).trim();

        return aql;
    };

    $scope.aqlQuery = function (form, str, name) {
        $scope.AQL.alias = name;
        $scope.AQL.str = str;

        var form = clone(form);
        var aql = $scope.str2AQL(str);

        form['ref-link'] = "aql/" + aql.tableName + "/";
        form.collection = aql.fields;
        if (aql.where)
            form.collection += " " + aql.where;
        $scope.query(form);

//        if (name && name.trim() != "")
//            $scope.saveAQL(name, str);
    };

    $scope.setChartData = function (aql) {
        if (aql) {
            $scope.tempTable.chartData = aql.data;
        } else {
            delete $scope.tempTable.chartType;
            delete $scope.tempTable.chartData;
        }
    };
    // amx_record query
    $scope.query = function (form) {
        $scope.loading = true;
        $scope.tableName = form["ref-link"].split("/")[1];
        // if param is query form, use it
        var form = form ? form : clone($scope.formData);

        form.method = "get";
        var timeStart = Date.now();

        // encodeURI
        var form_encode = clone(form);
        form_encode.collection = encodeURI(form_encode.collection);
        form_encode.param.filter = encodeURI(form_encode.param.filter);
        form_encode.param.fields = encodeURI(form_encode.param.fields);

        $http.post('/am/rest', form_encode).success(function (data) {
            $scope.loading = false;
            if (data instanceof Object) {
                if (data.Query) {
                    $scope.aqlData = data.Query;
                    $scope.aqlData.count = data.Query.Result[0].Row.length;
                    $scope.aqlData['timeStart'] = timeStart;
                    $scope.aqlData['timeEnd'] = Date.now();

                    // output charts data
                    $scope.aqlChart = {};
                    var data_1 = [];
                    $scope.aqlChart.series = ['A'];
                    $scope.aqlChart.labels = [];
                    $scope.aqlChart.data = [data_1];
                    $scope.aqlData.Result[0].Row.forEach(function (obj) {
                        $scope.aqlChart.labels.push(obj.Column[0]['_']);
                        data_1.push(obj.Column[1]['_']);
                    });

                    // save AQL
                    if ($scope.AQL.alias && $scope.AQL.alias.trim() != "")
                        $scope.saveAQL($scope.AQL.alias, $scope.AQL.str, $scope.aqlChart);

                } else {
                    $scope.tableData = {};
                    if (data.entities instanceof Array)
                        $scope.tableData = data;
                    else if (data.type == 'Buffer') {
                        $scope.tableData.count = 0;
                    } else {
                        $scope.tableData.count = 1;
                        $scope.tableData.entities = [];
                        $scope.tableData.entities.push(data);
                    }
                    // save last query condition
                    $scope.tableData.form = form;
                    $scope.tableData['timeStart'] = timeStart;
                    $scope.tableData['timeEnd'] = Date.now();
                }

            } else {

                $scope.alerts.push({
                    type: 'warning',
                    msg: JSON.stringify(form)
                });

                $scope.alerts.push({
                    type: 'danger',
                    msg: 'returned data: ' + data
                });

            }
        }).error(function (data) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: data
                });
            });
        //        $scope.store();
    };

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.formatValue = function (key, value, fields) {

        var isDate = false;
        if (fields) {
            isDate = $scope.checkDateType($scope.getTypeFromFields(key, fields));
        } else {
            isDate = $scope.checkDateType($scope.getType(key));
        }

        if (isDate) {
            if (value) {
                var d = new Date(value);
                return d.toLocaleString();
            }
            return value;
        } else {
            if (value instanceof Object)
                return value[Object.keys(value)[0]];
            else
                return value;
        }
    };

    $scope.getTypeFromFields = function (key, fields) {
        var field = fields.filter(function (obj) {
            return obj['sqlname'] == key;
        })[0];

        if (field && field['type'])
            return field['type'];
        else
            return "";
    };

    $scope.getCaptionByTemp = function (key, temp, showLabel) {
        var links = key.split(".");

        if (links.length == 1) {
            var field = temp.field.filter(function (obj) {
                return obj['$']['sqlname'] == key;
            })[0];

            if (!field)
                return key;
            if (field['aliasName'])
                return field['aliasName'];
            else if (showLabel)
                return field['$']['label'];
            else
                return key;
        } else {
            var linkName = links.shift();
            var link = temp.link.filter(function (obj) {
                return obj['$']['sqlname'] == linkName;
            })[0];

            if (link) {
                var newKey = links.join(".");
                linkName = (showLabel) ? link['$']['label'] : linkName;
                return linkName + "." + $scope.getCaptionByTemp(newKey, link.table, showLabel);
            }
        }

    };

    $scope.getType = function (key) {
        var links = key.split('.');
        var table = $scope.metadata.table;
        var def = findDef(table, links);
        return (def) ? def['$']['type'] : def;
    };

    function findDef(table, links) {
        if (table) {
            if (links.length > 1) {
                var link = table.link.filter(function (obj) {
                    return obj['$']['sqlname'] == links[0];
                })[0];
                links.shift();
                return (link.table) ? findDef(link.table, links) : link.table;
            } else {
                return table.field.filter(function (obj) {
                    return obj['$']['sqlname'] == links[0];
                })[0];
            }
        }

    }

    // load modal for CRUD
    $scope.load = function (data) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/browser/record_edit.html',
            controller: 'amModalCtrl',
            size: "modal-lg",
            resolve: {
                data: function () {
                    return data;
                },
                form: function () {
                    return clone($scope.formData);
                }
            }
        });

        modalInstance.result.then(function () {

        });
    };

    // retrieve amTree via AM metadata REST API
    $scope.metadata = function (schema, link, callback) {
        var form = clone($scope.formData);
        var metadata = "";
        if (schema == 'all') {
            metadata = "metadata/tables";
            $scope.metadata.loading = true;
        } else {
            metadata = "metadata/schema/" + schema;
            if ($scope.metadata.tables) {
                var table = $scope.metadata.tables.filter(function (obj) {
                    return obj.id == schema;
                })[0];

                if (table)
                    table.loading = true;
            }

            if (!link && !callback) {
                $scope.formData['ref-link'] = "db/" + schema;
            }

        }

        // loading
        if (link)
            link.loading = true;

        form['metadata'] = metadata;
        $http.post('/am/metadata', form).success(function (data) {
            // loading
            if (link)
                link.loading = false;
            if (table)
                table.loading = false;

            if (callback instanceof Function) {
                callback(data);
            } else {
                if (data.Tables) {
                    $scope.metadata.loading = false;
                    $scope.metadata["tables"] = [];
                    for (var t in data.Tables.Table) {
                        $scope.metadata["tables"].push(data.Tables.Table[t]["$"]);
                    }

                    //                console.log("meta data: " + JSON.stringify($scope.metadata["tables"]));
                } else if (data.table) {
                    //                console.log("meta data table: " + JSON.stringify(data));
                    //                console.log("parent: " + JSON.stringify(parent));

                    if (link) {
                        link["table"] = data.table;
                        // link["table"]["name"] = schema;

                        if (link["parent"])
                            link["table"].parent = link["parent"] + "." + link["$"]["sqlname"];
                        else
                            link["table"].parent = link["$"]["sqlname"];
                        //                    console.log("parent's reverse: " + parent["table"].parent);
                    }
                    else {
                        $scope.metadata["table"] = data.table;
                        $scope.metadata["table"]["fields"] = [];

                        // amTree will check fields and expand related link
                        if ($scope.tempTable) {
                            $scope.metadata["table"]["fields"] = $scope.tempTable.fields;
                        }

                    }

                }
            }

        }).error(function (data) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: data
                });
            });
    };

    $scope.expandLink = function (link) {
        var linkName = ((link['parent']) ? (link['parent'] + '.') : '') + link["$"]["sqlname"];
        var fields = $scope.metadata["table"]["fields"];

        var links = fields.filter(function (obj) {
            return obj.indexOf(linkName) == 0;
        });

        if (links.length > 0)
            $scope.metadata(link['$']['desttable'], link);
    };

    function expandChild(table, links) {
        if (links.length > 1) {
            var linkName = links.shift();
            var link = table.link.filter(function (obj) {
                return obj['$']['sqlname'] == linkName;
            })[0];

            if (link.table)
                expandChild(link.table, links);
            else {
                $scope.metadata(link['$']['desttable'], link, function (data) {
                    link["table"] = data.table;

                    if (link["parent"])
                        link["table"].parent = link["parent"] + "." + link["$"]["sqlname"];
                    else
                        link["table"].parent = link["$"]["sqlname"];

                    expandChild(link.table, links);
                });
            }

        }
    };

    $scope.foldChild = function (link) {
        //        console.log("child: " + JSON.stringify(child));
        delete link["table"];
    };


    // advanced filter condition for ng-repeat
    $scope.filterFields = function (query) {
        if (query)
            return function (item) {
                if ($scope.formData.showLabel)
                    return item['$']['label'].toLowerCase().indexOf(query.toLowerCase()) > -1;
                else
                    return item['$']['sqlname'].toLowerCase().indexOf(query.toLowerCase()) > -1;
            };
    };

    // amTree fields checking
    $scope.checkTreeFields = function (field, fields, parent) {
        field.selected = !field.selected; // for generate template
        $scope.toggleCheckbox(fields, (parent) ? parent + '.' + field['$']['sqlname'] : field['$']['sqlname']);
    };

    $scope.ifChecked = function (field, fields, parent) {
        if (field.selected)
            return field.selected;
        else {
            var path = (parent) ? parent + '.' + field['$']['sqlname'] : field['$']['sqlname'];

            for (var i in fields) {
                if (fields[i] == path) {
                    field.selected = true;
                    return true;
                }
            }
        }

    };


    /**
     * Template module
     * @param table
     * @param isNew
     */
    $scope.toNewTemp = function (table, isNew) {
        if ($scope.tempTable && !isNew) {
            var tableOld = clone($scope.tempTable);
            var tableNew = clone(table);
            $scope.tempTable = Object.assign(tableOld, table2template(tableNew));
        } else {
            var tempTable = clone(table);
            tempTable.showLabel = $scope.formData.showLabel;
            $scope.tempTable = table2template(tempTable);
        }
        delete $scope.tableData;
        delete $scope.relations;
        // console.log("table2template table: " + JSON.stringify(tempTable));
    };

    function table2template(table) {
        delete table['index'];

        // remove all not selected fields
        var selectedFields = table.field.filter(function (obj) {
            return obj.selected;
        });
        table.field = selectedFields;

        // remove all linked without child table
        var expandLinks = table.link.filter(function (obj) {
            if (obj.table)
                obj.table = table2template(obj.table);
            return (obj.table === undefined) ? false : true;
        });
        table.link = expandLinks;

        // When both filed and link empty, set null
        if (table.field.length == 0 && table.link.length == 0)
            table = undefined;

        return table;
    };

    $scope.loadTemplates = function () {

        $http.get('/json/template').success(function (data) {
            $scope.templates = data;
        }).error(function (data) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: data
                });
            });
    };

    $scope.loadOneTemp = function (temp) {

        $scope.templates['selected'] = temp['$loki'];

        $scope.queryRootByTemp(temp);
        $scope.tempTable = clone(temp);
        $scope.metadata(temp['$']['sqlname']);

        $scope.tab = "tables";
        //        $scope.queryRootByTemp(temp);
    };

    $scope.removeTemplate = function (temp) {

        if (temp.$loki)
            $http.delete('/json/template/' + temp.$loki).success(function (data) {
                $scope.loadTemplates();
                $scope.tab = "templates";
            }).error(function (data) {
                    $scope.alerts.push({
                        type: 'danger',
                        msg: data
                    });
                });

        $scope.backTableList();
    };

    $scope.saveTemplate = function (temp) {
        if (!temp.visit)
            temp.visit = 0;

        $http.post('/json/template', temp).success(function (data) {
            //            console.log("saveTemplate: " + JSON.stringify(data));
            temp = data;

            $scope.loadTemplates();
            $scope.tab = "templates";
        }).error(function (data) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: data
                });
            });

    };

    $scope.visitTemplate = function (temp) {
        if (temp.visit)
            temp.visit = temp.visit + 1;
        else
            temp.visit = 1;

        $http.post('/json/template', temp).success(function (data) {
            temp = data;
        }).error(function (data) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: data
                });
            });
    };

    $scope.closeTemplate = function () {
        delete $scope.tempTable;
    };

    $scope.queryRootByTemp = function (temp, keyword) {

        var template = clone(temp);
        var form = clone($scope.formData);
        form["ref-link"] = "db/" + template["$"]["sqlname"];

        // clean param fields generated by amTree
        form.param.fields = template.fields;
        //for (var i in template.field) {
        //    form.param.fields.push(template.field[i]["$"]["sqlname"]);
        //}
        if (keyword) {
            var AQLs = [];
            template.fields.forEach(function (obj) {
                AQLs.push(obj + " like '%" + keyword + "%'");
            });

            form.param.filter = AQLs.join(" OR ");
        }

        if (template.AQL) {
            if (form.param.filter != "")
                form.param.filter = form.param.filter + " AND " + template.AQL;
            else
                form.param.filter = template.AQL;
        }

        $scope.tempRecords = template;
        $scope.tempRecords['timeStart1'] = Date.now();
        $scope.tempRecords.loading1 = true;

        form.cacheView = true;
        $http.post('/am/rest', form).success(function (data) {
            if (data instanceof Object) {
                $scope.tempRecords.records = data.entities;
                $scope.tempRecords.count = data.count;

                $scope.tempRecords['timeEnd1'] = Date.now();
                $scope.tempRecords.loading1 = false;

                if (temp.$loki && !keyword) {
                    temp['last'] = {
                        time: Date.now(),
                        count: data.count
                    };
                    $http.post('/json/template', temp).success(function (data) {

                    });
                }

                if (data.entities[0])
                    $scope.getRecordByTemp(data.entities[0], template, true);

            } else {

                $scope.alerts.push({
                    type: 'warning',
                    msg: JSON.stringify(form)
                });

                $scope.alerts.push({
                    type: 'danger',
                    msg: data
                });

            }

        }).error(function (data) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: data
                });
            });

    };

    $scope.getRecordByTemp = function (data, tempRecord, root) {

        if (root) {
            $scope.tempRecord = tempRecord;
            tempRecord['selected'] = data["ref-link"];
            $scope.tempRecord['timeStart'] = Date.now();
        }

        tempRecord['ID'] = data["ref-link"].split('/')[2];

        for (var i in tempRecord.field) {
            var sqlname = tempRecord.field[i]["$"]["sqlname"];
            tempRecord.field[i].data = data[sqlname];
        }

        for (var i in tempRecord.link) {
            var form = clone($scope.formData);
            var link = tempRecord.link[i];
            form["ref-link"] = "db/" + link['$']['desttable'];
            form.param.filter = link['$']['reverse'] + ".PK=" + data["ref-link"].split('/')[2];
            if (link.table.AQL)
                form.param.filter = form.param.filter + ' AND ' + link.table.AQL;

            for (var j in link.table.field)
                form.param.fields.push(link.table.field[j]['$']['sqlname']);

            link.form = form;

            $scope.queryLinkData(link);
        }

        $scope.tempRecord['timeEnd'] = Date.now();

    };

    $scope.queryLinkData = function (link) {
        if (link.form)
            $http.post('/am/rest', link.form).success(function (data) {
                if (data.entities) {
                    //                    link.records = data.entities;

                    if (link['$']['card11'] == 'yes' && data.entities[0]) {
                        $scope.getRecordByTemp(data.entities[0], link.table);
                    } else {
                        link.tables = [];
                        for (var i in data.entities) {
                            var table = clone((link.table) ? link.table : link);
                            $scope.getRecordByTemp(data.entities[i], table);
                            link.tables.push(table);
                        }
                    }
                } else {

                    $scope.alerts.push({
                        type: 'warning',
                        msg: JSON.stringify(form)
                    });

                    $scope.alerts.push({
                        type: 'danger',
                        msg: data
                    });

                }

            }).error(function (data) {
                    $scope.alerts.push({
                        type: 'danger',
                        msg: data
                    });
                });

    };


    /**
     * Build show relations
     * @param record
     * @param parent
     */
    $scope.showRelations = function (record, parent) {
        var form = clone($scope.formData);
        form["ref-link"] = record["ref-link"];
        form.method = "get";
        if (!parent) {
            $scope.relations = [];
            $scope.relations.push({
                link: record["ref-link"].split("/")[1],
                'ref-link': record["ref-link"],
                schema: record["ref-link"].split("/")[1],
                active: true,
                form: form,
                records: [],
                displayColumns: [],
                child: null
            });
        } else {
            parent.child = [];
            parent.child.push({
                link: parent.link,
                'ref-link': parent["ref-link"],
                schema: parent.schema,
                form: parent.form,
                active: true,
                records: [],
                displayColumns: [],
                child: null
            });
        }

        $scope.metadata(record["ref-link"].split("/")[1], null, function (data) {
            var links = data.table.link;

            for (var i in links) {
                var form = clone($scope.formData);
                var sqlname = links[i]['$']['sqlname'];
                var schema = links[i]['$']['desttable'];

                // check 1v1
                if (links[i]['$']['card11']) {
                    form["ref-link"] = "db/" + schema;
                    form.param.filter = links[i]['$']['reverse'] + ".PK=" + record["ref-link"].split('/')[2];
                } else {
                    form["ref-link"] = record["ref-link"];
                    form["collection"] = "/" + sqlname;
                }

                form.param.fields = "";
                form.method = "get";

                if (!parent) {
                    $scope.relations.push({
                        link: sqlname,
                        schema: schema,
                        records: [],
                        displayColumns: [],
                        form: form
                    });
                } else {
                    parent.child.push({
                        link: sqlname,
                        schema: schema,
                        records: [],
                        displayColumns: [],
                        form: form
                    });
                }
                //                console.log("fields: " + JSON.stringify(fields));

            }
        });

    };

    $scope.getFields = function (record) {
        $scope.metadata(record.schema, null, function (data) {
            record["fields"] = [];
            for (var i in data.table.field)
                record["fields"].push(data.table.field[i]['$']);
        });
    };

    $scope.getRecords = function (record) {
        if (record.form) {
            if (record.displayColumns.length > 0) {
                record.form.param.fields = record.displayColumns;
            }

            $http.post('/am/rest', record.form).success(function (data) {
                if (data instanceof Object) {
                    if (data.entities) {
                        record.records = data.entities;
                        record.count = data.count;
                    } else if (data) {
                        record.records = [data];
                        record.count = 1;
                    }
                } else {

                    $scope.alerts.push({
                        type: 'warning',
                        msg: JSON.stringify(form)
                    });

                    $scope.alerts.push({
                        type: 'danger',
                        msg: data
                    });

                }
            }).error(function (data) {
                    $scope.alerts.push({
                        type: 'danger',
                        msg: data
                    });
                });
        }
    };

    $scope.dbSearch = function (keyword) {
        if ($scope.tempTable) {
            $scope.queryRootByTemp($scope.tempTable, keyword);
        }
    };

    $scope.cacheSearch = function (keyword) {
        if (keyword && $scope.formData.cache) {
            var timeStart = Date.now();
            $http.post('/cache/search', {keyword: keyword}).success(function (data) {
                $scope.cachedRefLinks = data;
                $scope.cacheSearch.timeEnd = Date.now();
                $scope.cacheSearch.timeStart = timeStart;

            });
        }
        else {
            $scope.cachedRefLinks = null;
        }
    };

    $scope.hiddenRelations = function (record) {
        //        console.log("record: " + JSON.stringify(record));
        if (record && record.link) {
            delete record.child;
        } else {
            delete $scope.relations;
        }
    };

    $scope.backTableList = function () {
        delete $scope.metadata["table"];
        $scope.formData.param.fields = [];
        $scope.hiddenRelations();
        delete $scope.tableData;
        delete $scope.tableName;
        delete $scope.tempTable;
        delete $scope.tempRecord;
        delete $scope.tempRecords;
        delete $scope.fieldSearch;
        delete $scope.linkSearch;
    };

    $scope.getMeta = function (ref) {
        var words = ref.split('/');
        for (var i in words) {
            if (words[i].indexOf("am") == 0)
                return 'metadata/schema/' + words[i];
        }
        return "metadata/tables";
    };

    $scope.clearMsg = function () {
        delete $scope.message;
    };

    $scope.colNumber = function (obj) {
        if (obj) {
            var keys = Object.keys(obj);
            if (keys instanceof Array)
                return Object.keys(obj).length;
            else
                return 0;
        }
    };

    // list order by and pagination =============================
    $scope.predicate = '';
    $scope.reverse = false;
    $scope.order = function (predicate) {
        console.log("order: " + predicate);
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
        //        $scope.formData.param.orderby = predicate + ($scope.reverse) ? " desc" : "";
        if ($scope.tableData)
            if (predicate != 'ref-link') {
                var form = $scope.tableData.form;
                form.param.orderby = predicate;
                if ($scope.reverse)
                    form.param.orderby = form.param.orderby + " desc";
            } else {
                $scope.tableData.form.param.orderby = "";
            }
    };

    $scope.group = function (key) {
        if (key)
            $scope.tempTable.groupByKey = key;
        else
            $scope.tempTable.groupByKey = "";

        if ($scope.tempTable)
            $scope.saveTemplate($scope.tempTable);
    };

    $scope.jump = function (i) {
        var pos = i;
        $scope.currentPage = pos;
    };

    $scope.showValue = function (value) {
        if (value instanceof Object)
            return value[Object.keys(value)[0]];
        else
            return value;
    };

    $scope.checkDateType = function (type) {
        return (type == 'Date+Time' || type == 'Date' || type == 'Time');
    };

    // save html
    $scope.saveHtml = function (id) {
        var element = document.getElementById(id);
        console.log(element.outerHTML);
        var randomFileName = (Math.random() + 1).toString(36).substring(7);
    }
});

am.directive('fullHeight', function ($window) {
    return {
        restrict: 'A',
        scope: {
            fullHeight: '&'
        },
        link: function (scope, element, attrs) {

            scope.initializeWindowSize = function () {
                var elementTop = (attrs.fullHeight) ? attrs.fullHeight : element.prop('offsetTop');
                element.css('height', ($window.innerHeight - elementTop - 10) + 'px');
                element.css('overflow-y', 'auto');
            };

            scope.initializeWindowSize();
            angular.element($window).bind('resize', function () {
                scope.initializeWindowSize();
            });
        }
    };
});

am.directive('ngConfirmClick', [
    function () {
        return {
            priority: -1,
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', function (e) {
                    var message = attrs.ngConfirmClick;
                    if (message && !confirm(message)) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                });
            }
        }
    }
]);

am.directive('contenteditable', [
    function () {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                // view -> model
                elm.bind('blur keyup change', function () {
                    //                    console.log(elm);
                    //                    console.log(scope.toggleSelectProp);
                    scope.$apply(function () {
                        ctrl.$setViewValue(elm.text());
                    });
                });

                // model -> view
                ctrl.$render = function () {
                    elm.html(ctrl.$viewValue);
                };

                // load init value from DOM
                //                ctrl.$setViewValue(elm.html());
            }
        }
    }
]);

am.filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
    }
});

am.filter('range', function () {
    return function (input, total) {
        total = Math.ceil(total);
        for (var i = 0; i < total; i++) {
            input.push(i);
        }
        return input;
    };
});

am.filter('groupBy', function ($timeout) {
    return function (data, key) {
        if (!key) return data;
        if (data) {
            var outputPropertyName = '__groupBy__' + key;
            if (!data[outputPropertyName]) {
                var result = {};
                for (var i = 0; i < data.length; i++) {
                    var objKey = (data[i][key] instanceof Object) ? data[i][key][Object.keys(data[i][key])[0]] : data[i][key];
                    if (!result[objKey])
                        result[objKey] = [];
                    result[objKey].push(data[i]);
                }
                Object.defineProperty(data, outputPropertyName, {enumerable: false, configurable: true, writable: false, value: result});
                // $timeout(function(){delete data[outputPropertyName];},0,false);
            }
            return data[outputPropertyName];
        }
    };
})

am.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});


function clone(obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(clone(obj[i]));
                }
            } else {
                o = {};
                for (var j in obj) {
                    o[j] = clone(obj[j]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
}