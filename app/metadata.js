var Client = require('node-rest-client').Client;
var client = new Client();

var parseString = require('xml2js').parseString;
var NodeCache = require("node-cache");
var myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });


exports.get = function (req, res) {
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

    var url_str = "http://" + req.body.server + req.body.context + req.body.metadata + "?user=" + req.body.user;

    myCache.get(url_str, function (err, value) {
        if (!err) {
            if (value == undefined) {
                request = client.get(url, args,function (data, response) {
                    parseString(data, function (err, result) {
                        res.json(result);
                        myCache.set(url_str, result, 3600);
                    });
                }).on('error', function (err) {
                        res.status(500).send(err.toString());
                    });

                request.on('error', function (err) {
                    console.log('request error: ' + err);
                });
            } else {
                res.json(value);
            }
        } else
            console.log("cache error: " + err);
    });

};