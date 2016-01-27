angular.module('cmsController', [])

    .controller('dashboardCtl', ['$scope', '$http', 'topology', '$interval', function ($scope, $http, topology, $interval) {
        var CMS_FORM_DATA = "cmsFormData";
        $scope.title = "CMS REST Console";
        $scope.formData = {
            server: "16.165.217.57:9091",
            view: "AM Node Push 2.0",
            history: "",
            historyViews: ["AM Node Push 2.0", "AM Installed Software Push 2.0"],
//            interval: 2,
            pageSize: 5,
            ciType: ''
        };


        $scope.init = function () {
            $scope.statistics = {};
            $scope.time = "";
            $scope.currentPage = 0;
            $scope.rawCis = [];
            $scope.rawRelations = [];
            $scope.cis = [];
            if (localStorage[CMS_FORM_DATA])
                $scope.formData = JSON.parse(localStorage.getItem(CMS_FORM_DATA));
        };

        $scope.setDataIn = function (ci) {
            var form = clone($scope.formData);
            $scope.formData["data"] = {"cis": [ci], "relations": null};
            topology.post($scope.formData).success(function (data) {
                console.log("response data: " + JSON.stringify(data));
            });
        };

        $scope.getTopology = function () {
            $scope.loading = true;
            $scope.statistics = {};
            $scope.cis = [];
            topology.get($scope.formData).success(function (data) {
                $scope.loading = false;
                var d = new Date();
                $scope.time = d.toLocaleString();

                if (data.cis instanceof Array) {

                    $scope.rawCis = data.cis; // save raw data
                    $scope.rawRelations = data.relations;

                    var ciNumber = {};
                    data.cis.map(function (obj) {

                        // count all CI type
                        if (obj.type in ciNumber)
                            ciNumber[obj.type]++;
                        else
                            ciNumber[obj.type] = 1;

                        // create time
                        if ('create_time' in obj.properties) {
                            obj.properties['timestamp'] = Date.parse(obj.properties['create_time']);
                        }

                    });

                    $scope.statistics = ciNumber;	// caculate statistics

                    $scope.queryCis($scope.formData.ciType); // query specified Cis by ciType

                }

            });
        };

        // build records
        $scope.queryCis = function (ciType) {

            $scope.formData.ciType = ciType;

            // save web storage
            if (localStorage)
                localStorage.setItem(CMS_FORM_DATA, JSON.stringify($scope.formData));

            $scope.cis = [];
            for (i in $scope.rawCis) {
                if ($scope.rawCis[i].type == ciType && $scope.rawCis[i].properties) {
                    var properties = clone($scope.rawCis[i].properties);
                    // add ucmdb id in properties
                    properties['id'] = $scope.rawCis[i].ucmdbid.id;
                    $scope.cis.push(properties);
                }
            }

        };

        // hide relation
        $scope.hideRelations = function () {
            delete $scope.relations;
        };

        // query relation
        $scope.showRelations = function (ucmdbid) {
//            console.log("rawRelations: " + JSON.stringify($scope.rawRelations));
            var ids = [];
            ids.push(ucmdbid);
            findRelId(ids, 0);


            var sorted = findCisByIds(ids).sort(function (a, b) {
                return a.type > b.type;
            });

            // group by type
            $scope.relations = {};
            for (var i in sorted) {
                if ($scope.relations[sorted[i].type]) {
                    $scope.relations[sorted[i].type].push(sorted[i]);
                } else {
                    $scope.relations[sorted[i].type] = [];
                    $scope.relations[sorted[i].type].push(sorted[i]);
                }
            }

//            console.log("relation ids: " + JSON.stringify($scope.relations));
        };

        // get all related Cis by ids
        function findCisByIds(ids) {
            var cis = [];
            for (var i in ids) {
                var result = $scope.rawCis.filter(function (obj) {
                    return obj.ucmdbid.id == ids[i];
                });
                cis.push(result[0]);
            }
            return cis;
        }

        // get all related ids recursion
        function findRelId(ids, pos) {
            var ucmdbid = ids[pos];
            var number = 0;

            for (var i in $scope.rawRelations) {
                var end1Id = $scope.rawRelations[i]['end1Id']['id'];
                var end2Id = $scope.rawRelations[i]['end2Id']['id'];

                if (end1Id == ucmdbid && ids.indexOf(end2Id) < 0) {
                    ids.push(end2Id);
                    number++;
                }
                if (end2Id == ucmdbid && ids.indexOf(end1Id) < 0) {
                    ids.push(end1Id);
                    number++;
                }
            }

            if (number > 0) {
                findRelId(ids, pos + 1)
            }
        }

        // capitalize each word, replace _ to " "
        $scope.t2t = function (type) {
            if (type)
                return type.replace(/_/g, " ").capitalize();
            else
                return "";
        };


        // form behavior ==========================================
        $scope.save = function () {
//            console.log("$scope.view: " + $scope.view);
            if ($scope.formData.view && $scope.formData.historyViews.indexOf($scope.formData.view) < 0)
                $scope.formData.historyViews.push($scope.formData.view);

            if (localStorage)
                localStorage.setItem(CMS_FORM_DATA, JSON.stringify($scope.formData));

            $scope.getTopology();

        };

        $scope.remove = function () {
            var i = $scope.formData.historyViews.indexOf($scope.formData.view);
            $scope.formData.historyViews.splice(i, 1);

            if ($scope.formData.historyViews[0])
                $scope.formData.view = $scope.formData.historyViews[0];

            $scope.save();
        };


        // list order by and pagination =============================
        $scope.predicate = 'timestamp';
        $scope.reverse = true;
        $scope.order = function (predicate) {
            console.log("order: " + predicate);
            $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
            $scope.predicate = predicate;
        };

        $scope.jump = function (i) {
            var pos = i;
            $scope.currentPage = pos;
        };

        // initial ======================================================
        $scope.init();	// inital run for set disp value

    }]);


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
