var util = require('util');
var db = require('./db.js');
var logger = require('./logger.js');
var REST = require('./rest.js');
var sessionUtil = require('./sessionUtil.js');
var config = require('./config.js');
var version = require('../version.json');
var multer  = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

module.exports = function (app) {
  var rest_protocol = process.env.AMB_REST_PROTOCOL || config.rest_protocol;
  var rest_server = process.env.AMB_REST_SERVER || config.rest_server;
  var rest_port = process.env.AMB_REST_PORT || config.rest_port;
  var ucmdb_browser_server = process.env.UCMDB_BROWSER_SERVER || config.ucmdb_browser_server;
  var ucmdb_browser_port = process.env.UCMDB_BROWSER_PORT || config.ucmdb_browser_port;
  var session_max_age = process.env.AMB_SESSION_MAX_AGE || config.session_max_age;
  var enable_csrf = process.env.AMB_NODE_CSRF || config.enable_csrf;
  var jwt_max_age = process.env.AMB_JWT_MAX_AGE || config.jwt_max_age;

  db.init(config.db_folder);

  var httpProxy = require('http-proxy');
  var apiProxy = httpProxy.createProxyServer();

  apiProxy.on('proxyReq', function (proxyReq, req, res, options) {
    proxyReq.setHeader('X-Authorization', req.session.jwt.secret);
  });

  apiProxy.on('proxyReq', function (proxyReq, req, res) {
    logger.debug(`[proxy] [${req.sessionID}] [request] ${req.method} ${req.originalUrl}`);
  });

  apiProxy.on('proxyRes', function (proxyRes, req, res) {
    logger.debug(`[proxy] [${req.sessionID}] [response] ${req.method} ${req.originalUrl} ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
    if(proxyRes.statusCode == 401) {
      proxyRes.statusCode = 500;
    }
  });

  var rest = new REST({
    server: rest_server + ":" + rest_port,
    session_max_age: session_max_age,
    jwt_max_age: jwt_max_age,
    enable_csrf: enable_csrf,
    context: config.base + config.version
  });

  apiProxy.on('error', function (e, req, res) {
    logger.error(`[proxy] [${req.sessionID}] [error] ${req.method} ${req.originalUrl}`, util.inspect(e));
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

  app.get('/am/logout', function (req, res) {
    logger.info(`[user] [${req.sessionID || '-'}]`, (req.session && req.session.user ? req.session.user : "user") + " logout.");
    var am_rest = {};
    const username = req.session.user;
    req.session.regenerate((err)=>{});
    res.clearCookie('headerNavs');
    res.json(am_rest);
    if (username) {
      rest.slack(username, `${username} logs out`);
    }
  });

  app.all("/*", function (req, res, next) {
    var session = req.session;
    if (!session || !session.user) {
      if (enable_csrf) {
        res.cookie('csrf-token', req.csrfToken());
      }
      res.clearCookie('headerNavs');
      res.sendStatus(401);
    } else {
      req.session.expires = new Date(Date.now() + session_max_age * 60 * 1000);
      sessionUtil.touch(req.session, session_max_age);
      // TODO Use 'X-Authorization' if jwt token is ready.
      // // Renew jwt token.
      // if ((new Date(req.session.jwt.expires) - req.session.expires) < 1 * 60 * 1000) {
      //   rest.jwtRenew(req, res);
      // }

      next(); // Call the next middleware
    }
  });

  // CRUD Tingodb
  app.get('/coll/:collection', db.find);
  app.get('/coll/:collection/:id', db.find);
  app.post('/coll/:collection', upload.single('docFile'), (req, res) => {
    checkRight(req);
    var createView = req.originalUrl.indexOf('view') > -1 && !req.body._id;

    db.upsert(req, res);

    if (createView) {
      rest.slack(req.session.user, `${req.session.user} created a view`);
    }
  });
  app.post('/coll/:collection/:id', upload.single('docFile'), (req, res) => {
    checkRight(req);
    db.upsert(req, res);
  });
  app.delete('/coll/:collection/:id', (req, res) => {
    checkRight(req);
    db.delete(req, res);
  });

  // Download CSV in server side
  app.use('/am/download/:tableName', rest.csv);

  // Proxy the backend rest service /rs/db -> /am/db
  app.use('/am/db', function (req, res) {
    // TODO: need to take care of https
    apiProxy.web(req, res, {target: `${rest_protocol}://${rest_server}:${rest_port}${config.base}${config.version}/db`});
  });

  app.use('/am/aql', function (req, res) {
    // TODO: need to take care of https
    apiProxy.web(req, res, {target: `${rest_protocol}://${rest_server}:${rest_port}${config.base}/aql`});
  });

  app.use('/am/schema', function (req, res) {
    // TODO: need to take care of https
    apiProxy.web(req, res, {target: `${rest_protocol}://${rest_server}:${rest_port}${config.base}${config.version}/schema`});
  });

  // get ucmdb point data
  app.use('/am/ucmdbPoint/', function (req, res) {
    checkRight(req);
    apiProxy.web(req, res, {target: `${rest_protocol}://${rest_server}:${rest_port}${config.base}/integration/ucmdbAdapter/points`});
  });

  /**
   * Federate CI from UCMDB
   * /ucmdb-browser/<global_id>
   */
  app.get('/ucmdb-browser/', function (req, res) {
    res.send(`http://${ucmdb_browser_server}:${ucmdb_browser_port}${config.ucmdb_browser_param}`);
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
};


const checkRight = (req) => {
  if (!req.session.isAdmin) {
    throw 'user has no permission';
  }
};

