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
  var base = properties.get('rest.base');
  var db_folder = properties.get('db.folder');
  db.init(db_folder);

  var httpProxy = require('http-proxy');
  var apiProxy = httpProxy.createProxyServer();

  // TODO replace Authorization by session id
  var auth = 'Basic ' + new Buffer(rest_username + ':' + rest_password).toString('base64');
  apiProxy.on('proxyReq', function (proxyReq, req, res, options) {
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
  app.get('/am/login', function (req, res) {
    var username = getUserName(req);
    // TODO login
    var am_rest = {};
    res.cookie('user', username);
    res.cookie('csrf-token', req.sessionID);
    req.session.user = username;
    am_rest['_csrf'] = req.session ? req.sessionID : ''; // CSRF
    am_rest.headerNavs = getHeadNav(hasAdminPrivilege(username));
    am_rest.server = rest_server + ":" + rest_port;
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

  app.get("/*", function (req, res, next) {
    var session = req.session;
    if (!session || !session.user) {
      session.destroy();
      res.clearCookie('connect.sid');
      res.clearCookie('csrf-token');
      res.clearCookie('user');
      res.redirect(401, '/am/login');
    } else {
      //TODO: do the real check
      res.locals._user = session.user;
      res.locals._headerNavs = getHeadNav(session.user == 'admin');
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
  app.use('/ucmdb-browser', function (req, res) {
    var server = properties.get('ucmdb.server');
    var port = properties.get('ucmdb.port');
    var param = properties.get('ucmdb.param');
    checkRight(req);
    apiProxy.web(req, res, {target: `http://${server}:${port}${param}`});
  });
};

const getUserName = (req) => {
  if (req && req.headers.authorization) {
    const user = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString();
    return user.split(':')[0];
  }
  return '';
};

const checkRight = (req) => {
  return true; // expect login, others request header no authentication
  if (getUserName(req) != 'admin') {
    throw 'user has no permission';
  }
};

//TODO: do the real check
const hasAdminPrivilege = (name) => {
  return name.toLowerCase() === 'admin';
};

const getHeadNav = (isAdmin) => ({
  login: true,
  home: true,
  search: true,
  insight: true,
  explorer: true,
  tbd: true,
  ucmdbAdapter: isAdmin,
  aql: isAdmin,
  views: isAdmin
});

