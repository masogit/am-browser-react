module.exports = function (app) {
    var SSH = require('simple-ssh');
    var Client = require('node-rest-client').Client;
    var client = new Client();
    var loki = require('lokijs');
    var db = new loki('db/template.json');
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
    // Configuration
    app.get('/json/template', function (req, res) {
        db.loadDatabase({}, function () {
            var temp = db.getCollection('template');
            if (!temp) {
                temp = db.addCollection("template");
            } else {
                // console.log(temp.data);
                res.json(temp.data);
            }
            db.saveDatabase();
        });
    });

    app.post('/json/template', function (req, res) {
        var temp = db.getCollection("template");
        if (!temp) {
            temp = db.addCollection("template");
        }
        var obj = req.body;
        console.log("template insert or update: " + JSON.stringify(obj));
        var data;
        if (obj.$loki)
            data = temp.update(obj);
        else
            data = temp.insert(obj);
        res.json(data);

        db.saveDatabase();
    });

    app.post('/json/template/delete', function (req, res) {
        var temp = db.getCollection("template");
        console.log("template delete: " + JSON.stringify(req.body));
        var data = temp.remove(req.body);
        res.json(data);

        db.saveDatabase();
    });

    function getMetadata(url, callback) {
            if (metadata) {
                console.log("query url: " + url);

                var metalist = metadata.find({ 'url': { '$eq': url } });
                // console.log("metalist: " + JSON.stringify(metalist[0].url));
                if (metalist && metalist.length > 0) {
                    return metalist[0];
                    console.log("return url data: ");
                }
                else{
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

    // CMS REST -------------------------------------------------------------
    app.post('/cms/get', function (req, res) {
        var server = "http://" + req.body.server;
        var args = {
            data: req.body.view, // TQL Name,
            headers: { "Content-Type": "text/plain" },
            requestConfig: { timeout: 2000 },
            responseConfig: { timeout: 5000 }
        };

        var req = client.post(server + "/rest/topology/", args, function (data, response) {
            res.json(data);
        });

        req.on('error', function (err) {
            console.log('request error');
        });

    });

    app.post('/cms/post', function (req, res) {
        var server = "http://" + req.body.server;
        var args = {
            data: req.body.data, // UCMDB CIs,
            headers: { "Content-Type": "application/json" },
            requestConfig: { timeout: 2000 },
            responseConfig: { timeout: 5000 }
        };

        var req = client.post(server + "/rest/dataIn", args, function (data, response) {
            console.log('ucmdb create/update data: ' + data);
            res.send(data);
        });
        console.log('req.options: ' + JSON.stringify(req.options));
        req.on('error', function (err) {
            console.log('request error');
        });

    });
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
                request = client.get(url, args, function (data, response) {
                    parseString(data, function (err, result) {
                        //                console.log("meta data json: " + JSON.stringify(result));
                        res.json(result);
                        metadata = result;
                        saveMetadata(url_str, metadata);
                    });
                });

                request.on('error', function (err) {
                    console.log('request error: ' + err);
                });
            }
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

        if (req.body.method == "get") {
            request = client.get(url, args, function (data, response) {
                res.send(data);
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

    // SSH CMD -------------------------------------------------------------
    app.post('/ssh/exec', function (req, res) {
        console.log("req.body.cmd: " + req.body.cmd);
        var ssh = new SSH({
            host: req.body.host,
            user: req.body.user,
            pass: req.body.pass
        });

        ssh.exec(req.body.cmd, {
            out: function (stdout) {
                console.log("stdout: " + stdout);
                res.send(stdout);
            },

            err: function (stderr) {
                res.send(stderr);
                console.log("stderr: " + stderr);
            }
        }).start();
    });

    // load the single view file
    app.get('/cfg', function (req, res) {
        res.sendfile('./public/cfg.html');
    });

    app.get('/ssh', function (req, res) {
        res.sendfile('./public/ssh.html');
    });

    app.get('/cms', function (req, res) {
        res.sendfile('./public/cms.html');
    });

    //    app.get('/am', function (req, res) {
    //        res.sendfile('./public/am.html');
    //    });

    app.get('/amx', function (req, res) {
        res.sendfile('./public/amx.html');
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