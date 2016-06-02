var util = require('util');
var db = require('./db.js');
var logger = require('./logger.js');
var REST = require('./rest.js');

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
    server: rest_server + ":" + rest_port
  });

  apiProxy.on('error', function (e) {
    logger.error(util.inspect(e));
  });

  // AM Server Login
  app.get('/am/login', rest.login);

  app.get("/*", function (req, res, next) {
    var session = req.session;
    if (!session || !session.user) {
      res.clearCookie('connect.sid');
      res.clearCookie('csrf-token');
      res.clearCookie('user');
      res.redirect(401, '/am/login');
    } else {
      //TODO: do the real check
      res.locals._user = session.user;
      next(); // Call the next middleware
    }
  });

  app.get('/am/csrf', function (req, res) {
    const user = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString();
    const username = user.split(':')[0];
    const password = user.split(':')[1];
    // TODO login
    var am_rest = {};
    res.cookie('csrf-token', req.csrfToken());
    am_rest['_csrf'] = req.session ? req.csrfToken() : ''; // CSRF
    res.json(am_rest);
  });

  app.get('/am/logout', function (req, res) {
    // TODO logout
    var am_rest = {};
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.clearCookie('csrf-token');
    res.clearCookie('user');
    res.json(am_rest);
  });


  app.get('/am/config', function (req, res) {
    const headerNavs = rest.getHeadNav(req.session.isAdmin);
    res.json(headerNavs);
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

