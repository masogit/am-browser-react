var Client = require('node-rest-client').Client;
var client = new Client();

module.exports = function (am) {

  this.getUCMDB = function (req, res) {
    var url = "http://" + req.body.server + req.body.context + req.body.metadata;
    var auth = 'Basic ' + new Buffer(req.body.user + ':' + req.body.password).toString('base64');
    var args = {
      headers: {
        "Authorization": auth
      }
    };
    var request = client.get(url, args, function (data, response) {
      var arrayData = Array.isArray(data) ? data : [];
      res.json(arrayData);
    }).on('error', function (err) {
      res.status(500).send(err.toString());
    });
  };

  this.getUCMDBJob = function (req, res) {
    //const { server, context, metadata, user, password } = req.body;
    var url = "http://" + req.body.server + req.body.context + req.body.metadata;
    var auth = 'Basic ' + new Buffer(req.body.user + ':' + req.body.password).toString('base64');
    var args = {
      headers: {
        "Authorization": auth
      }
    };
    var request = client.get(url, args, function (data, response) {
      var arrayData = Array.isArray(data["jobStatuses"]) ? data["jobStatuses"] : [];
      res.json(arrayData);
    }).on('error', function (err) {
      res.status(500).send(err.toString());
    });
  };
};

