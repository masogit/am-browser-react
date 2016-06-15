var Client = require('node-rest-client').Client;
var client = new Client();
var Convertor = require('json-2-csv');
var logger = require('./logger.js');
var sessionUtil = require('./sessionUtil.js');

module.exports = function (am) {

  this.csv = function (req, res) {

    var url = "http://${server}${context}${ref-link}";
    // TODO Use 'X-Authorization' if jwt token is ready.
    // var auth = req.session.jwt ? req.session.jwt.secret : undefined;
    var auth = (am.user != "") ? 'Basic ' + new Buffer(am.user + ':' + am.password).toString('base64') : undefined;
    var request;
    var args = {
      path: {
        server: am.server,
        context: '/AssetManagerWebService/rs/',
        "ref-link": req.params[0]
      },
      parameters: req.query,
      headers: (auth) ? {
        "Content-Type": "application/json",
        // TODO Use 'X-Authorization' if jwt token is ready.
        // "X-Authorization": auth,
        "Authorization": auth
      } : undefined
    };

    request = client.get(url, args, (data, response) => {
      var isOffset = !req.query['offset'] || req.query['offset'] === 0 || req.query['offset'] === "0";
      if (isOffset) {
        req.query['offset'] = 0;
        res.setHeader('Content-disposition', 'attachment; filename=' + req.params[0] + '.csv');
        res.setHeader('Content-type', 'text/csv');
      }

      if (data.count >= 10000)
        req.query.limit = 1000;
      else if (data.count < 10000 && data.count >= 1000)
        req.query.limit = parseInt(data.count / 10);
      else
        req.query.limit = 100;

      if (data.entities && data.entities.length > 0)
        Convertor.json2csv(getFormattedRecords(JSON.parse(req.body.fields), data.entities), (err, csv) => {
          res.write(csv, 'binary');

          if (data.count > data.entities.length + req.query.offset) {
            req.query.offset += data.entities.length;
            var REST = require('./rest.js');
            var rest = new REST(am);
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
        context: '/AssetManagerWebService/rs/',
        "ref-link": `v1/auth/sign-in`
      },
      parameters: {
        username: username,
        password: password
      },
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
          context: '/AssetManagerWebService/rs/',
          "ref-link": `db/amEmplDept`
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
        if (!data.entities || data.count === 0) {
          logger.warn(`[user] [${req.sessionID || '-'}]`, 'user name or password is wrong: ', username);
          res.send('user name or password is wrong');
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
        context: '/AssetManagerWebService/rs/',
        "ref-link": `v1/auth/renew-token`
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
};

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
  else if (field.type && field.type.indexOf('Date') > -1) {
    var d = new Date(val * 1000);
    val = d.toLocaleString();
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