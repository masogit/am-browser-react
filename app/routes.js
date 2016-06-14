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
  var rest_username = process.env.AMB_REST_USERNAME || properties.get('rest.username');
  var rest_password = process.env.AMB_REST_PASSWORD || properties.getRaw('rest.password');
  var ucmdb_server = process.env.UCMDB_SERVER || properties.get('ucmdb.server');
  var ucmdb_port = process.env.UCMDB_PORT || properties.get('ucmdb.port');
  var session_max_age = process.env.AMB_SESSION_MAX_AGE || properties.get('node.session_max_age');
  var enable_csrf = process.env.AMB_NODE_CSRF || properties.get('node.enable_csrf');
  var ucmdb_param = properties.get('ucmdb.param');
  var base = properties.get('rest.base');
  var db_folder = properties.get('db.folder');
  db.init(db_folder);

  var httpProxy = require('http-proxy');
  var apiProxy = httpProxy.createProxyServer();

  apiProxy.on('proxyReq', function (proxyReq, req, res, options) {
    const auth = 'Basic ' + new Buffer(req.session.user + ':' + req.session.password).toString('base64');
    logger.info("set request header: " + auth);
    proxyReq.setHeader('Authorization', auth);
  });

  var rest = new REST({
    user: rest_username,
    password: rest_password,
    server: rest_server + ":" + rest_port,
    session_max_age: session_max_age,
    enable_csrf: enable_csrf
  });

  apiProxy.on('error', function (e) {
    logger.error(util.inspect(e));
  });

  app.get('/am/csrf', function (req, res) {
    if (enable_csrf) {
      res.cookie('csrf-token', req.csrfToken());
    }
    res.end();
  });

  // AM Server Login
  app.post('/am/login', rest.login);

  app.get('/am/logout', function (req, res) {
    // TODO logout
    var am_rest = {};
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.clearCookie('csrf-token');
    res.clearCookie('headerNavs');
    res.json(am_rest);
  });

  app.all("/*", function (req, res, next) {
    var session = req.session;
    if (!session || !session.user) {
      res.clearCookie('headerNavs');
      res.sendStatus(401);
    } else {
      req.session.expires = new Date(Date.now() + session_max_age);
      sessionUtil.touch(req.session, session_max_age);

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
    logger.info(`${rest_protocol}://${rest_server}:${rest_port}${base}/db`);
    apiProxy.web(req, res, {target: `${rest_protocol}://${rest_server}:${rest_port}${base}/db`});
  });

  app.use('/am/aql', function (req, res) {
    // TODO: need to take care of https
    logger.info(`${rest_protocol}://${rest_server}:${rest_port}${base}/aql`);
    apiProxy.web(req, res, {target: `${rest_protocol}://${rest_server}:${rest_port}${base}/aql`});
  });

  app.use('/am/v1/schema', function (req, res) {
    // TODO: need to take care of https
    logger.info(`${rest_protocol}://${rest_server}:${rest_port}${base}/v1/schema`);
    apiProxy.web(req, res, {target: `${rest_protocol}://${rest_server}:${rest_port}${base}/v1/schema`});
  });

  // get ucmdb point data
  app.use('/am/ucmdbPoint/', function (req, res) {
    checkRight(req);
    apiProxy.web(req, res, {target: `${rest_protocol}://${rest_server}:${rest_port}${base}/integration/ucmdbAdapter/points`});
  });

  /**
   * Federate CI from UCMDB
   * /ucmdb-browser/<global_id>
   */
  app.get('/ucmdb-browser', function (req, res) {
    res.send(`http://${ucmdb_server}:${ucmdb_port}${ucmdb_param}`);
  });
};

const checkRight = (req) => {
  if (!req.session.isAdmin) {
    throw 'user has no permission';
  }
};

