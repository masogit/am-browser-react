var am = angular.module('am', ['ui.bootstrap']);
am.controller('amCtl', function ($scope, $http, $uibModal, $log, $q) {
    var AM_FORM_DATA = "amFormData";
    $scope.title = "AM REST DB Client";
    $scope.formData = {
        server: "16.165.217.186:8081",
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

        user: "admin",
        password: ""
    };
    $scope.pageSize = 10;
    $scope.fields = [];
    $scope.breadcrumb = [];
    $scope.toggleFilter = function toggleSelection(field) {
        var idx = $scope.fields.indexOf(field);
        if (idx > -1) {
            $scope.fields.splice(idx, 1);
        }
        else {
            $scope.fields.push(field);
        }
//        $scope.addFields();
    };
    $scope.addFields = function () {
        $scope.formData.param.fields = $scope.fields;
        $scope.query();
        $scope.hiddenRelations();
    };

    if (localStorage && localStorage[AM_FORM_DATA]) {
        $scope.formData = JSON.parse(localStorage.getItem(AM_FORM_DATA));
        $scope.formData.collection = "";
        $scope.formData.param.filter = "";
        $scope.formData.param.offset = 0;
        $scope.formData.param.orderby = "";
        $scope.formData.param.fields = [];
    }

    $scope.query = function (form) {
        $scope.loading = true;
        $scope.tableData = {};

        // if param is query form, use it
        var form = form ? form : clone($scope.formData);
        $scope.tableName = form["ref-link"].split("/")[1];

        form.method = "get";
        $http.post('/am/rest', form).success(function (data) {
//            console.log("rest data: " + JSON.stringify(data));
            $scope.loading = false;
            if (data instanceof Object) {
                console.log("query data:" + JSON.stringify(data));
                if (data.entities instanceof Array)
                    $scope.tableData = data;
                else if (data.type == 'Buffer') {
                    $scope.tableData.count = 0;
                } else {
                    $scope.tableData.count = 1;
                    $scope.tableData.entities = [];
                    $scope.tableData.entities.push(data);
                }
            } else {
                $scope.message = data;
            }
        });
        $scope.store();
    };

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
            $scope.query();
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.store = function () {
        if (localStorage)
            localStorage.setItem(AM_FORM_DATA, JSON.stringify($scope.formData));
    };

    // list order by and pagination =============================
    $scope.predicate = '';
    $scope.reverse = true;
    $scope.order = function (predicate, reQuery) {
        console.log("order: " + predicate);
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
//        $scope.formData.param.orderby = predicate + ($scope.reverse) ? " desc" : "";
        if (reQuery) {
            var form = clone($scope.formData);
            form.param.orderby = predicate;
            if ($scope.reverse)
                form.param.orderby = form.param.orderby + " desc";
            $scope.query(form);
        }
    }
    ;

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

    $scope.metadata = function (schema, link, callback) {
        var form = clone($scope.formData);
        var metadata = "";
        if (schema == 'all') {
            metadata = "metadata/tables";
        } else {
            metadata = "metadata/schema/" + schema;

            // click query table from tree
            if (!link && !callback) {
                $scope.formData['ref-link'] = "db/" + schema;
//                $scope.tableName = schema;
                $scope.formData.param.fields = [];
                $scope.fields = [];
                $scope.query();
                $scope.hiddenRelations();
            }

        }
        form['metadata'] = metadata;
        $http.post('/am/metadata', form).success(function (data) {

            if (callback instanceof Function) {
                callback(data);
            } else {
                if (data.Tables) {
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

                        if (link["parent"])
                            link["table"].parent = link["parent"] + "." + link["$"]["sqlname"];
                        else
                            link["table"].parent = link["$"]["sqlname"];
//                    console.log("parent's reverse: " + parent["table"].parent);
                    }
                    else
                        $scope.metadata["table"] = data.table;
                }
            }

        });
    };

    $scope.foldChild = function (link) {
//        console.log("child: " + JSON.stringify(child));
        delete link["table"];
    };

    $scope.addBreadcrumb = function (refLink) {
        var bread = {
            label: refLink.split("/")[1] + "[" + refLink.split("/")[2] + "]",
            link: refLink
        };

        if ($scope.breadcrumb.map(function (e) {
            return e.label;
        }).indexOf(bread.label) < 0)
            $scope.breadcrumb.push(bread);
    };

    $scope.removeBreadcrumb = function (refLink) {
//        console.log("refLink: " + refLink);
        if (!refLink)
            $scope.breadcrumb = [];
        else {
            var bread = {
                label: refLink.split("/")[1] + "[" + refLink.split("/")[2] + "]",
                link: refLink
            };
            var pos = $scope.breadcrumb.map(function (e) {
                return e.label;
            }).indexOf(bread.label);

            $scope.breadcrumb.splice(pos, 1);
        }
    };

    $scope.useBreadcrumb = function (bread) {
        var form = clone($scope.formData);
        form["ref-link"] = bread.link;
        $scope.query(form);
        $scope.hiddenRelations();
    };

    $scope.showRelations = function (record, parent) {
        if (!parent) {
            $scope.relations = [];
            $scope.relations.push({
                table: record["ref-link"].split("/")[1],
                active: true,
                records: [record],
                child: null
            });
        } else {
            parent.child = [];
            parent.child.push({
                table: parent.table,
                active: true,
                records: [record],
                child: null
            });
        }

        $scope.addBreadcrumb(record["ref-link"]);

        $scope.metadata(record["ref-link"].split("/")[1], null, function (data) {
            var links = data.table.link;
            for (var i in links) {
                var form = clone($scope.formData);
                var sqlname = links[i]['$']['sqlname'];

                // check 1v1
                if (links[i]['$']['card11']) {
                    form["ref-link"] = "db/" + links[i]['$']['desttable'];
                    form.param.filter = links[i]['$']['reverse'] + ".PK=" + record["ref-link"].split('/')[2];
                } else {
                    form["ref-link"] = record["ref-link"];
                    form["collection"] = "/" + sqlname;
                }

                form.method = "get";
                if (!parent) {
                    $scope.relations.push({
                        table: sqlname,
                        records: [],
                        form: form
                    });
                } else {
                    parent.child.push({
                        table: sqlname,
                        records: [],
                        form: form
                    });
                }


            }
        });

    };

    $scope.getRecords = function (record) {
        if (record.form) {
            $http.post('/am/rest', record.form).success(function (data) {
                record.records = data.entities;
            });
        }
    };

    $scope.showRecord = function (record) {
        record.active = (record.active) ? !record.active : true;
    };

    $scope.hiddenRelations = function (record) {
//        console.log("record: " + JSON.stringify(record));
        if (record && record.table){
            $scope.removeBreadcrumb("db/" + record.table + "/dummy");
            delete record.child;
        } else {
            delete $scope.relations;
            $scope.removeBreadcrumb();
        }
    };

    $scope.removeOneTable = function () {
        delete $scope.metadata["table"];
        $scope.formData.param.fields = [];
        $scope.fields = [];
        $scope.breadcrumb = [];
        $scope.hiddenRelations();
        delete $scope.tableData;
        delete $scope.tableName;
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

    $scope.toggleNavbar = function () {
        if ($scope.navbar) {
            $scope.navbar = !$scope.navbar;
        } else
            $scope.navbar = true;
    };

    $scope.toggleServer = function () {
        if ($scope.serverbar) {
            $scope.serverbar = !$scope.serverbar;
        } else
            $scope.serverbar = true;
    };

    $scope.metadata("all");
});

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