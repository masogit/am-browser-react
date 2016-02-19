var db = require('./db.js');
module.exports = function (app, rds_client) {
    var SSH = require('simple-ssh');
    var Client = require('node-rest-client').Client;
    var client = new Client();
    var loki = require('lokijs');
//    var db = new loki('db/template.json');
    var db2 = new loki('db/metadata.json');
    var parseString = require('xml2js').parseString;
    var metadata;
    db2.loadDatabase({}, function () {
        metadata = db2.getCollection('metadata');
        if (!metadata) {
            console.log("not found Collection: ");
            metadata = db2.addCollection("metadata");
            console.log("collection metadata created! ");
        }
    });

    var Search = require('redis-search');
    var search = Search.createSearch({
        service: 'am-browser',  // The name of your service. used for namespacing. Default 'search'.
        key: 'db',              // The name of this search. used for namespacing. So that you may have several searches in the same db. Default 'ngram'.
        n: 3,                   // The size of n-gram. Note that this method cannot match the word which length shorter then this size. Default '3'.
        cache_time: 60,         // The second of cache retention. Default '60'.
        client: rds_client          // The redis client instance. Set if you want customize redis connect. Default connect to local.
    });

    // CRUD local loki file json db
    app.get('/json/:collection', db.get);
    app.post('/json/:collection', db.set);
    app.delete('/json/:collection/:id', db.del);

    function getMetadata(url, callback) {
        if (metadata) {
            console.log("query url: " + url);

            var metalist = metadata.find({ 'url': { '$eq': url } });
            // console.log("metalist: " + JSON.stringify(metalist[0].url));
            if (metalist && metalist.length > 0) {
                return metalist[0];
                console.log("return url data: ");
            }
            else {
                console.log("not find url in Collection: ");
                return null;
            }
        } else {
            console.log("not found Collection: ");
            return null;
        }
    }

    function saveMetadata(url, data) {
        console.log("to save url: " + url);
        if (!metadata) {
            console.log("not found collection");
//            metadata = db2.addCollection("metadata");
            return null;
        }

        var temp = { url: url, data: data };
        //        console.log("temp: " + JSON.stringify(temp));
        metadata.insert(temp);

        console.log("url saved: " + temp.url);

        db2.saveDatabase();

    }

    // AM Metadata ---------------------------------------------------------
    app.post('/am/metadata', function (req, res) {
        // all Table = "metadata/tables";
        // a Table = "metadata/schema/amNews";
        var url = "http://${server}${context}${metadata}";
        var auth = 'Basic ' + new Buffer(req.body.user + ':' + req.body.password).toString('base64');
        var request;

        var args = {
            path: req.body,
            headers: {
                "Content-Type": "text/xml",
                "Authorization": auth
            }
        };

        var url_str = "http://" + req.body.server + req.body.context + req.body.metadata;
        var metadata = getMetadata(url_str);
        if (metadata && metadata.data)
            res.json(metadata.data);
        else {
            request = client.get(url, args,function (data, response) {
                parseString(data, function (err, result) {
                    //                console.log("meta data json: " + JSON.stringify(result));
                    res.json(result);
                    metadata = result;
                    saveMetadata(url_str, metadata);
                });
            }).on('error', function (err) {
                    res.status(500).send(err.toString());
                });

            request.on('error', function (err) {
                console.log('request error: ' + err);
            });
        }
    });

    // redis cache search --------------------------------------------------
    app.post('/cache/search', function (req, res) {
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
    });

    app.post('/cache/get', function (req, res) {
        var key = req.body.key;
        console.log("cache get key: " + key);
    });

    // AM REST -------------------------------------------------------------
    app.post('/am/rest', function (req, res) {
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


    });

    app.get('/amx', function (req, res) {
        res.sendfile('./public/browser/amx.html');
    });

    app.get('/m', function (req, res) {
        res.sendfile('./public/mobile/index.html');
    });

    app.get('/login', function (req, res) {
        res.sendfile('./public/login.html');
    });

    app.get('/', function (req, res) {
        res.sendfile('./public/login.html');
    });

};


String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};