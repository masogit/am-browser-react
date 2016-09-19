var Client = require('node-rest-client').Client;
var client = new Client();
var sessionUtil = require('./sessionUtil');
var config = require('./config');
var rights = require('./constants').rights;
var logger = require('./logger');

module.exports = function (am) {

  this.login = function (req, res) {
    var url = "http://${server}${context}${ref-link}";

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

      var am_rights = ['@anyone'];

      args = {
        path: {
          server: am.server,
          context: am.context,
          "ref-link": `/db/amEmplDept`
        },
        parameters: {
          fields: `bAdminRight, lEmplDeptId, EMail`,
          filter: `lEmplDeptId=CurrentUser.lEmplDeptId`
        },
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": req.session.jwt.secret
        }
      };

      client.get(url, args, (data, response) => {
        var user_rights = Object.assign({}, rights.guest);
        if (!data.entities || !data.entities[0]) {
          var message = response.statusMessage;
          logger.warn(`[user] [${req.sessionID || '-'}]`, message, username);
          res.status(response.statusCode).send(message);
        } else {
          var email = data.entities[0].EMail;
          var isAdmin = !!data.entities[0].bAdminRight[1];
          var empId = data.entities[0].lEmplDeptId;
          if (isAdmin) {
            am_rights.push('@admin');
            user_rights.ucmdbAdapter = true;
          }

          if (config.rights_power.indexOf('@anyone') > -1 || isAdmin && config.rights_power.indexOf('@admin') > -1) {
            loginSuccess(req, res, username, password, email, Object.assign(user_rights, rights.admin), am);
            res.end();
          } else {
            // get detail rights
            var aqlUrl = "http://${server}${context}/aql/${tables}/${fields} WHERE ${clause}";
            args = {
              path: {
                server: am.server,
                context: config.base,
                tables: "amMasterProfile MP,amRelEmplMProf REM",
                fields: "MP.SQLName",
                clause: `MP.lMProfileId=REM.lMProfileId AND REM.lEmplDeptId=${empId}`
              },
              headers: {
                Accept: "application/json",
                "X-Authorization": req.session.jwt.secret
              }
            };

            client.get(aqlUrl, args, (data, response) => {
              // get user right defined in AM
              if (data.Query.Result.Row) {
                var row = data.Query.Result.Row;
                if (!row.length) {
                  am_rights.push(row.Column.content);
                } else {
                  row.forEach(data => {
                    am_rights.push(data.Column.content);
                  });
                }
              }

              // match am_rights and amb rights

              for (var i = 0; i < am_rights.length; i++) {
                if (config.rights_admin.indexOf(am_rights[i]) > -1) {
                  Object.assign(user_rights, rights.admin);
                  break;
                } else if (config.rights_power.indexOf(am_rights[i]) > -1) {
                  Object.assign(user_rights, rights.power);
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
  this.live_net_work = live_net_work;
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
    ucmdbAdapter: config.ucmdb_adapter_enabled && rights.index < 1 && rights.ucmdbAdapter,
    'ucmdbAdapter(/:pointName)(/:tabName)(/:integrationJobName)': config.ucmdb_adapter_enabled && rights.index < 1 && rights.ucmdbAdapter,
    aql: rights.index < 1,
    views: rights.index < 1,
    'views/:id': rights.index < 1,
    my: rights.index < 3
  };
}

function live_net_work(req, res) {
  var url = 'https://hpln.hpe.com/rest/contentofferings/1712/contentpackages';
  var proxyClient = client;
  if (config.proxy_host && config.proxy_port) {
    var options_proxy = {
      proxy: {
        host: config.proxy_host,
        port: config.proxy_port,
        tunnel: true
      }
    };
    proxyClient = new Client(options_proxy);
  }

  proxyClient.get(url, (data) => {
    res.json(data).end();
  }).on('error', function (err) {
    var errMsg = err.message;
    if (err.code == 'ECONNRESET') {
      errMsg = 'Can not connect to live net work(https://hpln.hpe.com)';
    }
    logger.error(`[live net work] [${req.sessionID || '-'}]`, errMsg);
    res.end(errMsg);
  });
}
