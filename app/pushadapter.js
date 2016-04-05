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
    var request = client.get(url, args,function (data, response) {
      var arrayData = [];
      if (Array.isArray(data) && data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          arrayData.push(data[i]);
        }
      }
      res.json(arrayData);
    }).on('error', function (err) {
      res.status(500).send(err.toString());
    });
    request.on('error', function (err) {
      console.log('request error: ' + err);
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
    var request = client.get(url, args,function (data, response) {
      var arrayData = [],origData = data["jobStatuses"];
      if (Array.isArray(origData) && origData.length > 0) {
        for (var i = 0; i < origData.length; i++) {
          arrayData.push(origData[i]);
        }
      }
      res.json(arrayData);
    }).on('error', function (err) {
      res.status(500).send(err.toString());
    });
    request.on('error', function (err) {
      console.log('request error: ' + err);
    });
  };

};

