var Client = require('node-rest-client').Client;
var client = new Client();
var Convertor = require('json-2-csv');
var sessionUtil = require('./sessionUtil');
var config = require('./config');
var rights = require('./constants').rights;
var logger = require('./logger');

module.exports = function (am) {

  this.csv = function (req, res) {

    var url = "http://${server}${context}${ref-link}";
    var auth = req.session.jwt ? req.session.jwt.secret : undefined;
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
        "X-Authorization": auth
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
        context: am.context,
        "ref-link": '/auth/sign-in'
      },
      data: `username=${username}&password=${password}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    client.post(url, args, (signData, response) => {
      req.session.jwt = {
        secret: signData.toString(),
        expires: new Date(Date.now() + am.jwt_max_age * 60 * 1000)
      };

      var user_rights = config.rights_admin.indexOf('@anyone') > -1 ? rights.admin : rights.guest;

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
          "X-Authorization": req.session.jwt.secret
        }
      };

      client.get(url, args, (data, response) => {
        if (!data.entities || !data.entities[0]) {
          var message = response.statusMessage;
          logger.warn(`[user] [${req.sessionID || '-'}]`, message, username);
          res.status(response.statusCode).send(message);
        } else {
          var isAdmin = !!data.entities[0].bAdminRight[1];
          var email = data.entities[0].EMail;
          if (user_rights === rights.admin || (isAdmin && config.rights_admin.indexOf('@admin') > -1)) {
            loginSuccess(req, res, username, password, email, rights.admin, am);
            res.end();
          } else {
            // get detail rights
            args = {
              path: {
                server: am.server,
                context: config.base,
                "ref-link": `/aql/amMasterProfile%20MP,%20amRelEmplMProf%20REM,%20amEmplDept%20ED/MP.SQLName%20WHERE%20MP.lMProfileId%20=%20REM.lMProfileId%20AND%20REM.lEmplDeptId%20=%20ED.lEmplDeptId%20AND%20ED.Name%20=%20'${username.trim()}'`
              },
              headers: {
                Accept: "application/json",
                "X-Authorization": req.session.jwt.secret
              }
            };

            client.get(url, args, (data, response) => {
              if (data.Query.Result == true) {
                user_rights = rights.admin;
              } else {
                for (var i = 0; i < data.Query.Result.Row.length; i++) {
                  var currentRight = data.Query.Result.Row[i].Column.content;
                  if (config.rights_admin.indexOf(currentRight) > -1) {
                    user_rights = rights.admin;
                    break;
                  } else if (user_rights.index > 1 && (config.rights_power.indexOf('@admin') > -1 || config.rights_power.indexOf(currentRight) > -1)) {
                    user_rights = rights.power;
                  }
                }
              }

              loginSuccess(req, res, username, password, email, user_rights, am);

              res.end();
            });
          }
        }
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

function loginSuccess(req, res, username, password, email, rights, am) {
  req.session.expires = new Date(Date.now() + am.session_max_age * 60 * 1000);
  sessionUtil.touch(req.session, am.session_max_age);

  var am_rest = {};
  if (am.enable_csrf) {
    res.cookie('csrf-token', req.csrfToken());
  }
  req.session.user = username;
  req.session.rights = rights;
  am_rest.headerNavs = getHeadNav(rights);
  res.cookie('headerNavs', am_rest.headerNavs);
  res.cookie("user", username);
  res.cookie("email", email);
  res.json(am_rest);
  slack(username, `${username} logs in`);
  logger.info(`[user] [${req.sessionID || '-'}]`, (req.session && req.session.user ? req.session.user : "user") + " login.");
}

function getFormattedRecords(fields, rawRecords) {
  var records = [];
  rawRecords.forEach((rawRecord) => {
    var record = {Self: escapeStr(rawRecord.self)};
    fields.forEach((field) => {
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

function getHeadNav(rights) {
  return {
    login: true,
    home: true,
    search: rights.index < 2,
    'search/:keyword': rights.index < 2,
    insight: rights.index < 2,
    'insight/:id': rights.index < 3,
    explorer: rights.index < 2,
    'explorer/:id': rights.index < 3,
    tbd: rights.index < 2,
    ucmdbAdapter: config.ucmdb_adapter_enabled && rights.index < 1,
    'ucmdbAdapter(/:pointName)(/:tabName)(/:integrationJobName)': config.ucmdb_adapter_enabled && rights.index < 1,
    aql: rights.index < 1,
    views: rights.index < 1,
    'views/:id': rights.index < 1
  };
}