var Client = require('node-rest-client').Client;
var client = new Client();
var parseString = require('xml2js').parseString;

module.exports = function (am) {
    this.am = am;
    
    this.db = function (req, res) {
        req.body.server = am.server;       
        req.body.user = am.user;
        req.body.password = am.password;
        
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
            request = client.get(url, args,function (data, response) {
                var prefix = req.body['ref-link'].split("/")[0];
                if (prefix == "db") {
                    res.send(data);
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

};


String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};