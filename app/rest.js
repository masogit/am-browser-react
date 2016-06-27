var Client = require('node-rest-client').Client;
var client = new Client();
var Convertor = require('json-2-csv');
var sessionUtil = require('./sessionUtil.js');
var config = require('./config.js');
var logger = require('./logger.js');

module.exports = function (am) {

  this.csv = function (req, res) {

    var url = "http://${server}${context}${ref-link}";
    // TODO Use 'X-Authorization' if jwt token is ready.
    // var auth = req.session.jwt ? req.session.jwt.secret : undefined;
    var auth = (req.session.user != "") ? 'Basic ' + new Buffer(req.session.user + ':' + req.session.password).toString('base64') : undefined;
    var request;
    var param = JSON.parse(req.body.param);
    var args = {
      path: {
        server: am.server,
        context: am.context,
        "ref-link": '/db/' + req.params.tableName
      },
      parameters: param,
      headers: (auth) ? {
        "Content-Type": "application/json",
        // TODO Use 'X-Authorization' if jwt token is ready.
        // "X-Authorization": auth,
        "Authorization": auth
      } : undefined
    };

    request = client.get(url, args, (data, response) => {
      var isOffset = !param.offset || param.offset === 0 || param.offset === "0";
      if (isOffset) {
        param.offset = 0;
        res.setHeader('Content-disposition', 'attachment; filename=' + req.params.tableName + '.csv');
        res.setHeader('Content-type', 'text/csv');
      }

      if (data.count >= 10000)
        param.limit = 1000;
      else if (data.count < 10000 && data.count >= 1000)
        param.limit = parseInt(data.count / 10);
      else
        param.limit = 100;

      if (data.entities && data.entities.length > 0)
        Convertor.json2csv(getFormattedRecords(JSON.parse(req.body.fields), data.entities), (err, csv) => {
          res.write(csv, 'binary');

          if (data.count > data.entities.length + param.offset) {
            param.offset += data.entities.length;
            var REST = require('./rest.js');
            var rest = new REST(am);
            req.body.param = JSON.stringify(param);
            rest.csv(req, res);
          } else
            res.end();

        }, {delimiter: {field: ',', array: ';', wrap: '', eol: '\n'}, prependHeader: isOffset});

      else
        res.end();

    }).on('error', function (err) {
      logger.error('Export CSV: ' + err.toString());
      res.status(500).send(err.toString());
    });
    //console.log("request.options: " + JSON.stringify(request.options));
    request.on('error', function (err) {
      logger.error('Export CSV: ' + err);
      console.log('request error: ' + err);
    });


  };

  this.login = function (req, res) {
    var url = "http://${server}${context}${ref-link}", request;

    const user = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString();
    const username = user.split(':')[0];
    const password = user.split(':')[1];
    var args = {
      path: {
        server: am.server,
        context: am.config,
        "ref-link": '/auth/sign-in'
      },
      data: `username=${username}&password=${password}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    request = client.post(url, args, (signData, response) => {
      req.session.jwt = {
        secret: signData.toString(),
        expires: new Date(Date.now() + am.jwt_max_age * 60 * 1000)
      };

      args = {
        path: {
          server: am.server,
          context: am.context,
          "ref-link": `/db/amEmplDept`
        },
        parameters: {
          filter: `UserLogin='${username.trim()}'`
        },
        headers: {
          "Content-Type": "application/json",
          // TODO Use 'X-Authorization' if jwt token is ready.
          // "X-Authorization": req.session.jwt.secret,
          "Authorization": req.headers.authorization
        }
      };

      request = client.get(url, args, (data, response) => {
        if (!data.entities || !data.entities[0]) {

          var message = 'The user name or password is incorrect or your account is locked.';
          logger.warn(`[user] [${req.sessionID || '-'}]`, message, username);
          res.send(message);
        } else {
          req.session.expires = new Date(Date.now() + am.session_max_age * 60 * 1000);
          sessionUtil.touch(req.session, am.session_max_age);

          var am_rest = {};
          if (am.enable_csrf) {
            res.cookie('csrf-token', req.csrfToken());
          }
          req.session.user = username;
          req.session.password = password;
          req.session.isAdmin = !!data.entities[0].bAdminRight[1];
          am_rest.headerNavs = getHeadNav(req.session.isAdmin);
          res.cookie('headerNavs', am_rest.headerNavs);
          res.json(am_rest);
          slack(username, `${username} logs in`);
        }
        logger.info(`[user] [${req.sessionID || '-'}]`, (req.session && req.session.user ? req.session.user : "user") + " login.");
        res.end();
      });
    }).on('error', function (err) {
      logger.error(`[user] [${req.sessionID || '-'}]`, "login failed with error: " + err.toString());
      res.status(500).send(err.toString());
    });
  };

  this.jwtRenew = function (req, res) {

    var url = "http://${server}${context}${ref-link}";

    var args = {
      path: {
        server: am.server,
        context: am.context,
        "ref-link": `/auth/renew-token`
      },
      parameters: {
      },
      headers: {
        "X-Authorization": req.session.jwt.secret
      }
    };

    client.post(url, args, (signData, response) => {
      req.session.jwt = {
        secret: signData.toString(),
        expires: new Date(Date.now() + am.jwt_max_age * 60 * 1000)
      };
    });
  };

  this.slack = slack;
};

var slackProcess;
if (config.slack_url) {
  var child_process = require('child_process');
  slackProcess = child_process.fork('./app/slack.js');
}

function slack(username, message, prefix, callback) {
  if (slackProcess) {
    prefix = prefix || '[System]';

    slackProcess.send({username: username, message: `${prefix} ${message}`});
    slackProcess.on('message', function (result) {
      logger[result.status](result.message);
      if (callback) {
        callback(result);
      }
    });
  } else {
    if (callback) {
      callback({status: 'warn', message: 'Slack url is not configured'});
    }
  }
}

function getFormattedRecords(fields, rawRecords) {
  var records = [];
  rawRecords.forEach((rawRecord) => {
    var record = {Self: escapeStr(rawRecord.self)};
    fields.forEach((field) => {
      if (!field.PK)
        record[getDisplayLabel(field)] = getFieldStrVal(rawRecord, field);
    });
    records.push(record);
  });
  return records;
}

function getFieldStrVal(record, field) {
  var val = record[field.sqlname];
  if (field.user_type && field.user_type == 'System Itemized List')
    val = val[Object.keys(val)[0]];
  else if (field.type && field.type == 'Date+Time') {
    if (val) {
      var d = new Date(val * 1000);
      val = d.toLocaleString();
    }
  } else if (field.type && field.type == 'Date') {
    if (val) {
      var d = new Date(val * 1000);
      val = d.toLocaleDateString();
    }
  } else if (val instanceof Object)
    val = val[Object.keys(val)[0]];

  return escapeStr(val);
}

function escapeStr(val) {
  if (typeof val == 'string') {
    val = val.replace(/"/g, '""');
    return '"' + val + '"';
  } else
    return val;
}

function getDisplayLabel(field) {
  return field.alias ? field.alias : (field.label ? field.label : field.sqlname);
}

function getHeadNav(isAdmin) {
  return {
    login: true,
    home: true,
    search: true,
    insight: true,
    explorer: true,
    tbd: true,
    ucmdbAdapter: isAdmin,
    aql: isAdmin,
    views: isAdmin
  };
};