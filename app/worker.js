var intervalObject;
var Client = require('node-rest-client').Client;
var client = new Client();
var converter = require('json-2-csv');
var fs = require('fs');

// var cp = require('child_process');
// var child = cp.fork('./app/subworker.js');

var param;
var am;
var redis;
var dbFile;
var db;
var search;

process.on('message', function (m) {
    process.send("receive message: " + m);
    param = JSON.parse(m);
    am = param.am;
//    redis = param.redis;
    dbFile = param.db;
    db = require('./db.js');
    db.init(dbFile.folder, dbFile.json);

    // init redis search client, need redis service on 127.0.0.1:6379
    if (param.redis.enabled && param.redis.ttl > 0){
        redis = require("redis");
        var rds_client = redis.createClient({
            host: param.redis.host,
            port: param.redis.port,
            auth_pass: param.redis.auth_pass,
            socket_keepalive: false,
            disable_resubscribing: true,
            enable_offline_queue: false
        });

        rds_client.on("error", function (err) {
            console.log("Redis Error " + err);
            rds_client.end();
        });

        var Search = require('redis-search');
        search = Search.createSearch({
            service: 'am-browser',  // The name of your service. used for namespacing. Default 'search'.
            key: "db",              // The name of this search. used for namespacing. So that you may have several searches in the same db. Default 'ngram'.
            n: 3,                   // The size of n-gram. Note that this method cannot match the word which length shorter then this size. Default '3'.
            cache_time: 60,         // The second of cache retention. Default '60'.
            client: rds_client      // The redis client instance. Set if you want customize redis connect. Default connect to local.
        });
    }

    cache(db, am);
});


function cache(db, am) {

    // cache view data
    console.log("start to load views: ");
    db.getColl("template", function (data) {
        data.forEach(function (view) {
            getViewData(view, am, db, 0);
        });
    });

    intervalObject = setInterval(function () {
        console.log("start to load views: ");
        db.getColl("template", function (data) {
            data.forEach(function (view) {
                getViewData(view, am, db, 0);
            });
        });
    }, param.redis.ttl * 1000);

};

function getViewData(view, am, db, offset) {
    var restParam = {
        server: am.server,
        user: am.user,
        password: am.password,
        context: "/AssetManagerWebService/rs/",
        "ref-link": "db/" + view['$']['sqlname'],     // "db/amLocation/126874",
        collection: "",     // "EmplDepts",
        param: {
            limit: 10,
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
            // Save in CSV
            var json2csvCallback = function (err, csv) {
                if (err)
                    console.log(err);
//                throw err;
//                console.log(csv);
                // delete file
                if (offset == 0)
                    fs.unlink("public/csv/"+view.name+".csv", function (err) {
                        if (err)
//                            throw err;
                            console.log(err);
                    });
                // append file
                fs.appendFile("public/csv/"+view.name+".csv", csv, function (err) {
                    if (err)
                        console.log(err);
//                    throw err;
                });
            };

            converter.json2csv(data.entities, json2csvCallback, {prependHeader: offset == 0});

            // Cache in Redis
            if (param.redis.enabled && param.redis.ttl > 0)
                data.entities.forEach(function (obj) {
                    search.index(JSON.stringify(obj), obj['ref-link'] + ":" + obj['self']);
                });

            if (data.count > restParam.param.limit + offset) {
                getViewData(view, am, db, restParam.param.limit + offset);
            }

        }


    }).on('error', function (err) {
        console.log(err);
    });

//    console.log("getViewData: " + JSON.stringify(request.options));
}


String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};