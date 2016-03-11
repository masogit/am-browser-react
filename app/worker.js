var intervalObject;
var Client = require('node-rest-client').Client;
var client = new Client();


// var cp = require('child_process');
// var child = cp.fork('./app/subworker.js');

var param;
var am;
var redis;
var dbFile;
var db;

process.on('message', function (m) {
    process.send("receive message: " + m);
    param = JSON.parse(m);
    am = param.am;
    redis = param.redis;
    dbFile = param.db;
    db = require('./db.js');
    db.init(dbFile.folder, dbFile.json);
    cache(db, am, redis);
});


function cache(db, am, redisConf) {

        // init redis search client, need redis service on 127.0.0.1:6379
        var redis = require("redis"),
            rds_client = redis.createClient({
                host: redisConf.host,
                port: redisConf.port,
                auth_pass: redisConf.auth_pass,
                socket_keepalive: false,
                disable_resubscribing: true,
                enable_offline_queue: false
            });

        rds_client.on("error", function (err) {
            console.log("Redis Error " + err);
            rds_client.end();
        });

        var Search = require('redis-search');
        var search = Search.createSearch({
            service: 'am-browser',  // The name of your service. used for namespacing. Default 'search'.
            key: am.server,              // The name of this search. used for namespacing. So that you may have several searches in the same db. Default 'ngram'.
            n: 4,                   // The size of n-gram. Note that this method cannot match the word which length shorter then this size. Default '3'.
            cache_time: 60,         // The second of cache retention. Default '60'.
            client: rds_client      // The redis client instance. Set if you want customize redis connect. Default connect to local.
        });

        rds_client.on("connect", function () {
            console.log("Redis connected");


            // cache view data
            console.log("start to load views: ");
            db.getColl("template", function (data) {
                data.forEach(function (view) {
                    getViewData(search, view, am, db, 0);
                });
            });

            intervalObject = setInterval(function () {
                console.log("start to load views: ");
                db.getColl("template", function (data) {
                    data.forEach(function (view) {
                        getViewData(search, view, am, db, 0);
                    });
                });
            }, redisConf.ttl * 1000);

        });

};

function getViewData(search, view, am, db, offset) {
    var restParam = {
        server: am.server,
        user: am.user,
        password: am.password,
        context: "/AssetManagerWebService/rs/",
        "ref-link": "db/" + view['$']['sqlname'],     // "db/amLocation/126874",
        collection: "",     // "EmplDepts",
        param: {
            limit: 1000,
            offset: offset,
            filter: view['AQL'] || "",
            orderby: "",
            fields: view['fields']
        }
    };

    // console.log("restParam: " + JSON.stringify(restParam));

    var url = "http://${server}${context}${ref-link}${collection}";
    var auth = 'Basic ' + new Buffer(restParam.user + ':' + restParam.password).toString('base64');
    if (restParam.param && restParam.param['orderby'].isEmpty())
        delete restParam.param['orderby'];

    var args = {
        path: restParam,
        parameters: restParam.param,
        headers: {
            "Content-Type": "application/json",
            "Authorization": auth
        }
    };

    var request = client.get(url, args, function (data, response) {

        if (offset == 0) {
            view['last'] = {
                time: Date.now(),
                count: data.count
            };
            db.setColl("template", view);
        }

        if (data.entities) {

            data.entities.forEach(function (obj) {
                    search.index(JSON.stringify(obj), obj['ref-link'] + ":" + obj['self']);
            });

            if (data.count > restParam.param.limit + offset) {
                getViewData(search, view, am, db, restParam.param.limit + offset);
            }

        }


    }).on('error', function (err) {
        console.log(err);
    });

    console.log("request.options: " + JSON.stringify(request.options));
}


String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};