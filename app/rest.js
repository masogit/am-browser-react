var Client = require('node-rest-client').Client;
var client = new Client();
var parseString = require('xml2js').parseString;

// init redis search client, need redis service on 127.0.0.1:6379
var redis = require("redis"),
    rds_client = redis.createClient({host: '127.0.0.1', port: 6379});
rds_client.on("error", function (err) {
    console.log("Redis Error " + err);
});

var Search = require('redis-search');
var search = Search.createSearch({
    service: 'am-browser',  // The name of your service. used for namespacing. Default 'search'.
    key: 'db',              // The name of this search. used for namespacing. So that you may have several searches in the same db. Default 'ngram'.
    n: 3,                   // The size of n-gram. Note that this method cannot match the word which length shorter then this size. Default '3'.
    cache_time: 60,         // The second of cache retention. Default '60'.
    client: rds_client      // The redis client instance. Set if you want customize redis connect. Default connect to local.
});

exports.db = function (req, res) {
    var url = "http://${server}${context}${ref-link}${collection}";
    var auth = 'Basic ' + new Buffer(req.body.user + ':' + req.body.password).toString('base64');
    var request;
    if (req.body.param && req.body.param['orderby'].isEmpty())
        delete req.body.param['orderby'];

    var args = {
        path: req.body,
        parameters: req.body.param,
        data: req.body.data,
        headers: {
            "Content-Type": "application/json",
            "Authorization": auth
        }
    };

    var cache = req.body.cache;
    var cacheView = req.body.cacheView;
    if (req.body.method == "get") {
        request = client.get(url, args,function (data, response) {
            var prefix = req.body['ref-link'].split("/")[0];
            if (prefix == "db") {
                res.send(data);

                // redis
                if (cache && cacheView && data.entities)
                    data.entities.forEach(function (obj) {
                        search.index(JSON.stringify(obj), obj['ref-link'] + ":" + obj['self']);
                    });

            } else if (prefix == "aql") {
                parseString(data, function (err, result) {
                    res.json(result);
                });
            }
//                res.send(data);
        }).on('error', function (err) {
                res.status(500).send(err.toString());
            });
        console.log("request.options: " + JSON.stringify(request.options));
        request.on('error', function (err) {
            console.log('request error: ' + err);
        });
    } else if (req.body.method == "post") {
        request = client.post(url, args, function (data, response) {
            res.json(data);
        });
    } else if (req.body.method == "put") {
        request = client.put(url, args, function (data, response) {
            res.json(data);
        });
    } else if (req.body.method == "delete") {
        request = client.delete(url, args, function (data, response) {
            res.json(data);
        });
    }


};

exports.cacheSearch = function (req, res) {
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


String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};