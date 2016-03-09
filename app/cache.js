var intervalObject;
var Client = require('node-rest-client').Client;
var client = new Client();

module.exports = function (db, am, redisConf) {
    // init redis search client, need redis service on 127.0.0.1:6379
    var redis = require("redis"),
        rds_client = redis.createClient({
            host: redisConf.host,
            port: redisConf.port,
            auth_pass: redisConf.auth_pass
        });

    rds_client.on("error", function (err) {
        console.log("Redis Error " + err);
        rds_client.end();
    });

    var Search = require('redis-search');
    var search = Search.createSearch({
        service: 'am-browser',  // The name of your service. used for namespacing. Default 'search'.
        key: am.server,              // The name of this search. used for namespacing. So that you may have several searches in the same db. Default 'ngram'.
        n: 3,                   // The size of n-gram. Note that this method cannot match the word which length shorter then this size. Default '3'.
        cache_time: redisConf.ttl,         // The second of cache retention. Default '60'.
        client: rds_client      // The redis client instance. Set if you want customize redis connect. Default connect to local.
    });

    rds_client.on("connect", function () {
        console.log("Redis connected");

        if (redisConf.enabled && redisConf.ttl > 0) {                
            // cache view data
            console.log("start to load views: ");
            db.getColl("template", function (data) {
                data.forEach(function (view) {
                    getViewData(view, am, db, search, 0);
                });
                // console.log("views: " + JSON.stringify(views));
            });
            
            intervalObject = setInterval(function () {
                console.log("start to load views: ");
                db.getColl("template", function (data) {
                    data.forEach(function (view) {
                        getViewData(view, am, db, search, 0);
                    });
                    // console.log("views: " + JSON.stringify(views));
                });
            }, redisConf.ttl * 1000);
        }
    });

    this.search = function (req, res) {
        var keyword = req.body.keyword;
        console.log("cache search keyword: " + keyword);
        search
            .type('and')
            .query(query = keyword, function (err, ids) {
                if (err) throw err;
                console.log('Search results for "%s":', query);
                //                console.log(ids);
                res.send(ids);
            });
    };
};

function getViewData(view, am, db, search, offset) {
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

    console.log("restParam: " + JSON.stringify(restParam));

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

        view['last'] = {
            time: Date.now(),
            count: data.count
        };
        db.setColl("template", view);

        data.entities.forEach(function (obj) {
            search.index(JSON.stringify(obj), obj['ref-link'] + ":" + obj['self']);
        });

        if (data.count > restParam.param.limit + offset)
            getViewData(view, am, db, search, restParam.param.limit + offset);

    }).on('error', function (err) {
        console.log(err);
    });

    console.log("request.options: " + JSON.stringify(request.options));
}