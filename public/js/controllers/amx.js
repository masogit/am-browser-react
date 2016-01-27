var am = angular.module('am', ['ui.bootstrap', 'ngRoute', 'mobile-angular-ui', 'mobile-angular-ui.gestures']);

//am.run(function ($transform) {
//    window.$transform = $transform;
//});
//
//am.config(function ($routeProvider) {
//    $routeProvider.when('/m/temp_edit', { templateUrl: '/mobile/temp_edit.html', reloadOnSearch: false });
//    $routeProvider.when('/m/temp_records', { templateUrl: '/mobile/temp_records.html', reloadOnSearch: false });
//    $routeProvider.when('/m/temp_record', { templateUrl: '/mobile/temp_record.html', reloadOnSearch: false });
//    $routeProvider.when('/m/tab_tree', { templateUrl: '/mobile/tab_tree.html', reloadOnSearch: false });
//});

am.controller('amCtl', function ($scope, $http, $uibModal) {
    var AM_FORM_DATA = "amFormData";
    $scope.title = "AM Browser";
    $scope.formData = {
        server: "16.165.217.186:8081", // "16.165.217.186:8081",
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
        user: "admin", // admin
        password: "",

        pageSize: 10,
//        showError: false,
        showLabel: false
    };

    $scope.alerts = [];

    $scope.login = function () {
        var form = clone($scope.formData);
        form['ref-link'] = "db/amEmplDept";
        form.param.filter = "UserLogin='" + form.user.trim() + "'";
        $http.post('/am/rest', form).success(function (data) {
            if (data instanceof Object) {
                $scope.store();
                window.location.href = "/amx";
            } else {
                $scope.alerts.push({
                    type: 'danger',
                    msg: 'Username or password incorrect!'
                });

            }
        }).error(function (data) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: 'Server can not be reached!'
                });
            });
    };

    $scope.logout = function () {
        $scope.formData.password = "";
        window.location.href = "/login";
    };

    $scope.store = function () {
        if (localStorage) {
            var form = {
                server: $scope.formData.server,
                user: $scope.formData.user,
                password: $scope.formData.password,
                pageSize: $scope.formData.pageSize,
                showLabel: $scope.formData.showLabel,
//                showError: $scope.formData.showError,
                limit: $scope.formData.param.limit,
                offset: $scope.formData.param.offset
            };
            localStorage.setItem(AM_FORM_DATA, JSON.stringify(form));
        }
        delete $scope.serverbar;
        $scope.metadata('all');
    };

    if (localStorage && localStorage[AM_FORM_DATA]) {
        var form = JSON.parse(localStorage.getItem(AM_FORM_DATA));
        $scope.formData.server = form.server;
        $scope.formData.user = form.user;
        $scope.formData.password = form.password;
        $scope.formData.pageSize = form.pageSize;
        $scope.formData.showLabel = form.showLabel;
//        $scope.formData.showError = form.showError;
        $scope.formData.param.limit = form.limit;
        $scope.formData.param.offset = form.offset;
    }

    // console.log(window.location.pathname);
    if (window.location.pathname.indexOf("login") < 0) {
        if ($scope.formData.server == "" || $scope.formData.user == "") {
            $scope.lastPath = window.location.pathname;
            window.location.href = "/login";
        }
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

    // amx_record query
    $scope.query = function (form) {
        $scope.loading = true;
        $scope.tableData = {};

        // if param is query form, use it
        var form = form ? form : clone($scope.formData);
        $scope.tableName = form["ref-link"].split("/")[1];

        form.method = "get";
        var timeStart = Date.now();
        $http.post('/am/rest', form).success(function (data) {
            $scope.loading = false;
            if (data instanceof Object) {
                if (data.entities instanceof Array)
                    $scope.tableData = data;
                else if (data.type == 'Buffer') {
                    $scope.tableData.count = 0;
                } else {
                    $scope.tableData.count = 1;
                    $scope.tableData.entities = [];
                    $scope.tableData.entities.push(data);
                }
                $scope.tableData.form = form;
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
            $scope.tableData['timeStart'] = timeStart;
            $scope.tableData['timeEnd'] = Date.now();
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
            var newKey = links.join(".");
            linkName = (showLabel) ? link['$']['label'] : linkName;
            return linkName + "." + $scope.getCaptionByTemp(newKey, link.table, showLabel);
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
            templateUrl: 'am_modal.html',
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
            $http.post('/json/template/delete', temp).success(function (data) {
                $scope.loadTemplates();
                $scope.tab = "templates";
            });

        $scope.backTableList();
    };

    $scope.saveTemplate = function (temp) {
        //        console.log("saveTemplate: " + JSON.stringify(temp));
        $http.post('/json/template', temp).success(function (data) {
            //            console.log("saveTemplate: " + JSON.stringify(data));
            temp = data;

            $scope.loadTemplates();
            $scope.tab = "templates";
        });

        $scope.backTableList();
    };

    $scope.closeTemplate = function () {
        delete $scope.tempTable;
    };

    $scope.queryRootByTemp = function (temp) {

        var template = clone(temp);
        var form = clone($scope.formData);
        form["ref-link"] = "db/" + template["$"]["sqlname"];

        // clean param fields generated by amTree
        form.param.fields = template.fields;
        //for (var i in template.field) {
        //    form.param.fields.push(template.field[i]["$"]["sqlname"]);
        //}
        if (template.AQL)
            form.param.filter = template.AQL;

        $scope.tempRecords = template;
        $scope.tempRecords['timeStart1'] = Date.now();
        $scope.tempRecords.loading1 = true;

        $http.post('/am/rest', form).success(function (data) {
            if (data instanceof Object) {
                $scope.tempRecords.records = data.entities;
                $scope.tempRecords.count = data.count;

                $scope.tempRecords['timeEnd1'] = Date.now();
                $scope.tempRecords.loading1 = false;

                if (temp.$loki) {
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
                    if (data.entities)
                        record.records = data.entities;
                    else if (data)
                        record.records = [data];
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
            });
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