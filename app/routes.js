var util = require('util');
var db = require('./db.js');
var logger = require('./logger.js');
var REST = require('./rest.js');
var sessionUtil = require('./sessionUtil.js');

module.exports = function (app) {
  // init variables from properties
  var PropertiesReader = require('properties-reader');
  var properties = PropertiesReader('am-browser-config.properties');
  var rest_protocol = process.env.AMB_REST_PROTOCOL || properties.get('rest.protocol');
  var rest_server = process.env.AMB_REST_SERVER || properties.get('rest.server');
  var rest_port = process.env.AMB_REST_PORT || properties.get('rest.port');
  var ucmdb_server = process.env.UCMDB_SERVER || properties.get('ucmdb.server');
  var ucmdb_port = process.env.UCMDB_PORT || properties.get('ucmdb.port');
  var session_max_age = process.env.AMB_SESSION_MAX_AGE || properties.get('node.session_max_age');
  var jwt_max_age = process.env.AMB_JWT_MAX_AGE || properties.get('rest.jwt_max_age');
  var enable_csrf = process.env.AMB_NODE_CSRF || properties.get('node.enable_csrf');
  var ucmdb_param = properties.get('ucmdb.param');
  var base = properties.get('rest.base');
  var db_folder = properties.get('db.folder');
  db.init(db_folder);

  var httpProxy = require('http-proxy');
  var apiProxy = httpProxy.createProxyServer();

  apiProxy.on('proxyReq', function (proxyReq, req, res, options) {
    proxyReq.setHeader('X-Authorization', req.session.jwt.secret);
  });

  apiProxy.on('proxyReq', function (proxyReq, req, res) {
    logger.debug(`[proxy] [request] [${req.sessionID}] ${req.method} ${req.originalUrl}`);
  });

  apiProxy.on('proxyRes', function (proxyRes, req, res) {
    logger.debug(`[proxy] [response] [${req.sessionID}] ${req.method} ${req.originalUrl} ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
  });

  var rest = new REST({
    server: rest_server + ":" + rest_port,
    session_max_age: session_max_age,
    jwt_max_age: jwt_max_age,
    enable_csrf: enable_csrf
  });

  apiProxy.on('error', function (e) {
    logger.error(util.inspect(e));
  });

  app.get('/am/csrf', function (req, res) {
    res.end();
  });

  // AM Server Login
  app.post('/am/login', rest.login);

  app.get('/am/logout', function (req, res) {
    logger.info((req.session && req.session.user ? req.session.user : "user") + " logout.");
    var am_rest = {};
    req.session.regenerate((err)=>{});
    res.clearCookie('headerNavs');
    res.json(am_rest);
  });

  app.all("/*", function (req, res, next) {
    var session = req.session;
    if (!session || !session.user) {
      res.clearCookie('headerNavs');
      res.sendStatus(401);
    } else {
      req.session.expires = new Date(Date.now() + session_max_age * 60 * 1000);
      sessionUtil.touch(req.session, session_max_age);
      // Renew jwt token.
      if ((new Date(req.session.jwt.expires) - req.session.expires) < 1 * 60 * 1000) {
        rest.jwtRenew(req, res);
      }

      next(); // Call the next middleware
    }
  });

  // CRUD Tingodb
  app.get('/coll/:collection', db.find);
  app.get('/coll/:collection/:id', db.find);
  app.post('/coll/:collection', (req, res) => {
    checkRight(req);
    db.upsert(req, res);
  });
  app.post('/coll/:collection/:id', (req, res) => {
    checkRight(req);
    db.upsert(req, res);
  });
  app.delete('/coll/:collection/:id', (req, res) => {
    checkRight(req);
    db.delete(req, res);
  });

  // Download CSV in server side
  app.use('/download/*', rest.csv);

  // Proxy the backend rest service /rs/db -> /am/db
  app.use('/am/db', function (req, res) {
    // TODO: need to take care of https
    logger.info(`[/am/db] ${rest_protocol}://${rest_server}:${rest_port}${base}/db`);
    apiProxy.web(req, res, {target: `${rest_protocol}://${rest_server}:${rest_port}${base}/db`});
  });

  app.use('/am/aql', function (req, res) {
    // TODO: need to take care of https
    logger.info(`[/am/aql] ${rest_protocol}://${rest_server}:${rest_port}${base}/aql`);
    apiProxy.web(req, res, {target: `${rest_protocol}://${rest_server}:${rest_port}${base}/aql`});
  });

  app.use('/am/v1/schema', function (req, res) {
    // TODO: need to take care of https
    logger.info(`[/am/v1/schema] ${rest_protocol}://${rest_server}:${rest_port}${base}/v1/schema`);
    apiProxy.web(req, res, {target: `${rest_protocol}://${rest_server}:${rest_port}${base}/v1/schema`});
  });

  // get ucmdb point data
  app.use('/am/ucmdbPoint/', function (req, res) {
    checkRight(req);
    logger.info(`[/am/ucmdbPoint/] ${rest_protocol}://${rest_server}:${rest_port}${base}/integration/ucmdbAdapter/points`);
    apiProxy.web(req, res, {target: `${rest_protocol}://${rest_server}:${rest_port}${base}/integration/ucmdbAdapter/points`});
  });

  /**
   * Federate CI from UCMDB
   * /ucmdb-browser/<global_id>
   */
  app.get('/ucmdb-browser', function (req, res) {
    logger.info(`[/ucmdb-browser] http://${ucmdb_server}:${ucmdb_port}${ucmdb_param}`);
    res.send(`http://${ucmdb_server}:${ucmdb_port}${ucmdb_param}`);
  });
};

const checkRight = (req) => {
  if (!req.session.isAdmin) {
    throw 'user has no permission';
  }
};

