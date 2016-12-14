var util = require('util');
var db = require('./db.js');
var logger = require('./logger.js');
var rest = require('./rest.js').rest;
var Export_file = require('./export_file.js');
var sessionUtil = require('./sessionUtil.js');
var config = require('./config.js');
var version = require('../version.json');
var multer  = require('multer');
var storage = multer.memoryStorage();
var upload = multer({storage: storage});
var isAuthenticated = require('./authentication').isAuthenticated;
var path = require('path');
var cookiesUtil = require('./cookiesUtil');
var pug = require('pug');
var fs = require('fs');
var html;
var getHtml = function() {
  if (!html) {
    html = pug.renderFile(path.resolve(path.join(__dirname, '/../dist/index.pug')), {
      baseName: config.node_base == '/' ? '' : config.node_base
    });
  }

  return html;
};

module.exports = function (app) {
  var rest_protocol = config.rest_protocol;
  var rest_server = config.rest_server;
  var rest_port = config.rest_port;
  var ucmdb_browser_server = config.ucmdb_browser_server;
  var ucmdb_browser_port = config.ucmdb_browser_port;
  var session_max_age = config.session_max_age;
  var enable_csrf = config.enable_csrf;
  var jwt_max_age = config.jwt_max_age;
  var enable_lwsso = config.enable_lwsso;

  switch (config.db_type) {
    case 'file':
      db.init(config.db_folder);
      break;
    case 'mongo':
      db.mongo(config.mongo);
      break;
    default:
      logger.error("database", "db init error");
  }

  var httpProxy = require('http-proxy');
  var apiProxy = httpProxy.createProxyServer({
    proxyTimeout: config.rest_conn.proxy_timeout
  });

  apiProxy.on('proxyReq', function (proxyReq, req, res) {
    // add jwt check for LWSSO jwt may not exist
    if (req.session.jwt) {
      proxyReq.setHeader('X-Authorization', req.session.jwt.secret);
    }
    // LWSSO enabled
    if (enable_lwsso) {
      proxyReq.setHeader('Cookie', cookiesUtil.getCookies(req));
    }
    logger.debug(`[proxy] [${req.sessionID}] [request] ${req.method} ${req.originalUrl}`);
  });

  apiProxy.on('proxyRes', function (proxyRes, req, res) {
    logger.debug(`[proxy] [${req.sessionID}] [response] ${req.method} ${req.originalUrl} ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
    if (proxyRes.statusCode == 401) {
      proxyRes.statusCode = 500;
    }
  });

  var export_file = new Export_file(config.rest_conn);

  apiProxy.on('error', function (e, req, res) {
    logger.error(`[proxy] [${req.sessionID}] [error] ${req.method} ${req.originalUrl}`, util.inspect(e));
    res.status(500).end();
  });

  app.get('/am/csrf', function (req, res) {
    if (enable_csrf) {
      res.cookie('csrf-token', req.csrfToken());
    }
    res.end();
  });

  app.get('/am/about', function (req, res) {
    logger.info(`[/about]`);
    res.json({
      about: {
        amVersion: '',
        ambVersion: version.number + (version.timestamp ? (`-` + version.timestamp) : ``) + (version.stage ? (`_` + version.stage) : ``),
        rest: {
          server: rest_server,
          port: rest_port
        },
        ucmdb: {
          server: ucmdb_browser_server,
          port: ucmdb_browser_port
        }
      }
    });
  });

  // AM Server Login
  app.post('/am/login', rest.login);
  app.get('/am/logout', rest.logout);
  // AM LWSSO Login
  app.post('/am/lwssoLogin', function (req, res) {
    if (enable_lwsso && req.cookies && req.cookies.LWSSO_COOKIE_KEY) {
      rest.lwssoLogin(req, res);
    } else {
      //logger.warn(`[lwssoLogin] [${req.sessionID || '-'}]`, "LWSSO disabled or no LWSSO_COOKIE_KEY found in cookies!");
      res.status(200).end();
    }
  });

  app.all("/*", function (req, res, next) {
    var session = req.session;

    if (!session || !session.user) {
      if (enable_csrf) {
        res.cookie('csrf-token', req.csrfToken());
      }
      res.clearCookie('headerNavs');
      if (req.headers['x-api-version']) {
        res.sendStatus(401); // if the request is from rest, won't send file
      } else {
        res.send(getHtml());
      }

    } else {
      req.session.expires = new Date(Date.now() + session_max_age * 60 * 1000);
      sessionUtil.touch(req.session, session_max_age);
      // Renew jwt token.
      // add jet check for LWSSO jwt may not exist
      if (req.session.jwt && req.session.jwt.expires && req.session.expires
        && (new Date(req.session.jwt.expires) - req.session.expires) < 1 * 60 * 1000) {
        rest.jwtRenew(req, res);
      }
      next(); // Call the next middleware
    }
  });

  app.get('/am/onlineUser', rest.getOnlineUser);

  const sendSlack = (req, res, next) => {
    if (req.originalUrl.indexOf('view') > -1 && !req.body._id) {
      next();
      rest.slack(req.session.user, `${req.session.user} created a view`);
    } else {
      next();
    }
  };

  // CRUD Tingodb
  app.get('/coll/:collection', db.find);
  app.get('/coll/:collection/:id', db.find);
  app.post('/coll/:collection', upload.single('docFile'), isAuthenticated, sendSlack, db.upsert);
  app.post('/coll/:collection/:id', upload.single('docFile'), isAuthenticated, db.upsert);
  app.delete('/coll/:collection/:id', isAuthenticated, db.delete);

  // Download CSV in server side
  app.use('/am/download/:tableName', function (req, res) {
    // type: 'csv' or 'pdf' or '1vM'
    if (req.query.type == '1vM')
      export_file.report(req, res);
    else
      export_file.list(req, res);
  });

  //check AQL syntax
  app.use('/am/checkAqlSyntax', function(req, res, next) {
    if (req.headers['x-api-version']) {
        rest.checkAqlSyntax(req.session, req.query.str).then((data) => {
        res.send(true);
      }).catch((err) => {
        res.send(err.message);
      });
    } else {
      next();
    }
  });

  // Proxy the backend rest service /rs/db -> /am/db
  app.use('/am/db', function (req, res, next) {
    // TODO: need to take care of https
    if (req.headers['x-api-version']) {
      apiProxy.web(req, res, { target: `${rest_protocol}://${rest_server}:${rest_port}${config.base}${config.version}/db` });
    } else {
      next();
    }
  });

  app.use('/am/query', function (req, res, next) {
    // TODO: need to take care of https
    if (req.headers['x-api-version']) {
      apiProxy.web(req, res, { target: `${rest_protocol}://${rest_server}:${rest_port}${config.rest_conn.context}/query` });
    } else {
      next();
    }
  });

  app.use('/am/schema', function (req, res, next) {
    // TODO: need to take care of https
    if (req.headers['x-api-version']) {
      apiProxy.web(req, res, { target: `${rest_protocol}://${rest_server}:${rest_port}${config.base}${config.version}/schema` });
    } else {
      next();
    }
  });

  // get ucmdb point data
  app.use('/am/ucmdbPoint/', isAuthenticated, function (req, res, next) {
    if (req.headers['x-api-version']) {
      apiProxy.web(req, res, { target: `${rest_protocol}://${rest_server}:${rest_port}${config.base}/integration/ucmdbAdapter/points` });
    } else {
      next();
    }
  });

  /**
   * Federate CI from UCMDB
   * /ucmdb-browser/<global_id>
   */
  app.get('/ucmdb-browser/', function (req, res) {
    if (config.ucmdb_adapter_enabled) {
      res.send(`http://${ucmdb_browser_server}:${ucmdb_browser_port}${config.ucmdb_browser_param}`);
    } else {
      res.send('');
    }
  });

  app.post('/slack', function (req, res) {
    rest.slack(req.session.user, req.body.messages, '[Comments]', function (result) {
      if (result) {
        if (result.status !== 'info') {
          res.end(result.message);
        }
        res.end();
      } else {
        res.status(500).end();
      }
    });
  });

  app.get('/live-network', function (req, res) {
    rest.live_net_work(req, res);
  });

  app.get('/icon-map', function (req, res) {
    fs.readFile('./app/iconMap.json', 'utf-8', (err, data) => {
      res.send(data);
    });
  });

  app.get('/*', function (req, res) {
    if (enable_csrf) {
      res.cookie('csrf-token', req.csrfToken());
    }
    res.send(getHtml());
  });
};
