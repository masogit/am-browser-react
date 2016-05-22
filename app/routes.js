var db = require('./db.js');
var logger = require('./logger.js');

const getUserName = (req) => {
  if(req && req.headers.authorization) {
    const user = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString();
    return user.split(':')[0];
  }
  return '';
};

const checkRight = (req) => {
  if(getUserName(req) != 'admin') {
    throw 'user has no permission';
  }
};

//TODO: do the real check
const hasAdminPrivilege = (req) => {
  return getUserName(req).toLowerCase() === 'admin';
};

const getHeadNav = (isAdmin) => ({
  login: true,
  home: true,
  search: true,
  wall: true,
  explorer: true,
  tbd: true,
  ucmdbAdapter: isAdmin,
  aql: isAdmin,
  views: isAdmin
});

module.exports = function (app, am) {
    var util = require('util');

    var PropertiesReader = require('properties-reader');
    var properties = PropertiesReader('am-browser-config.properties');
    var base = properties.get('rest.base');
    logger.info("base: " + base);
    var httpProxy = require('http-proxy');
    var apiProxy = httpProxy.createProxyServer();
    var auth = 'Basic ' + new Buffer(am.user + ':' + am.password).toString('base64');
    logger.info("auth: " + auth);
    apiProxy.on('proxyReq', function(proxyReq, req, res, options) {
      logger.info("set request header: " + auth);
      proxyReq.setHeader('Authorization', auth);
    });

    apiProxy.on('error', function(e){
      logger.error(util.inspect(e));
    });

    // CRUD Tingodb
    app.get('/coll/:collection', db.find);
    app.get('/coll/:collection/:id', db.find);
    app.post('/coll/:collection', (req, res) => {
      checkRight(req);
      db.upsert(req, res);
    });
    app.delete('/coll/:collection/:id', (req, res) => {
      checkRight(req);
      db.delete(req, res);
    });

    // get ucmdb point data
    app.use('/am/ucmdbPoint/', function (req, res) {
      checkRight(req);
      apiProxy.web(req, res, {target: 'http://' + am.server + '/AssetManagerWebService/rs/integration/ucmdbAdapter/points'});
    });

    // AM Server Conf
    app.get('/am/conf', function(req, res) {
      if (am) {
        var am_rest = Object.assign({}, am);
        am_rest['password'] = "";
        am_rest.headerNavs = getHeadNav(hasAdminPrivilege(req));
        res.json(am_rest);
      } else
        res.json(am);
    });

    // Proxy the backend rest service /rs/db -> /am/db
    logger.info(am);
    app.use('/am/db', function(req, res){
        // TODO: need to take care of https
        logger.info('http://' + am.server + base + '/db');
        apiProxy.web(req,res,{target: 'http://' + am.server + base + '/db'});
    });

    app.use('/am/aql', function(req, res){
      // TODO: need to take care of https
      logger.info('http://' + am.server + base + '/aql');
      apiProxy.web(req,res,{target: 'http://' + am.server + base + '/aql'});
    });

    app.use('/am/v1/schema', function (req, res) {
        // TODO: need to take care of https
        logger.info('http://' + am.server + base + '/v1/schema');
        apiProxy.web(req, res, {target: 'http://' + am.server + base + '/v1/schema'});
    });

};
