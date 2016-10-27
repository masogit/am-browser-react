/**
 * Created by huling on 6/14/2016.
 */
// init variables from properties

var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('am-browser-config.properties.default');
//var logger = require('./logger.js');
properties.append('am-browser-config.properties');
// logger.info("[server]", "Server configuration: " + JSON.stringify(properties));

module.exports = {
  session_secret: properties.get('node.session_secret'),

  rest_protocol: process.env.AMB_REST_PROTOCOL || properties.get('rest.protocol'),
  rest_server: process.env.AMB_REST_SERVER || properties.get('rest.server'),
  rest_port: process.env.AMB_REST_PORT || properties.get('rest.port'),
  base: properties.get('rest.base'),
  version: properties.get('rest.version'),

  node_server: process.env.AMB_NODE_SERVER || properties.get('node.server'),
  node_port: process.env.AMB_NODE_PORT || properties.get('node.port'),
  node_https_port: process.env.AMB_NODE_HTTPS_PORT || properties.get('node.https_port'),
  node_base: process.env.AMB_NODE_BASE_NAME || properties.get('node.base') || '/',

  isDebug: process.env.AMB_NODE_DEBUG || properties.get('node.is_debug'),
  enable_csrf: process.env.AMB_NODE_CSRF || properties.get('node.enable_csrf'),
  enable_lwsso: process.env.AMB_NODE_LWSSO || properties.get('node.enable_lwsso'),

  ucmdb_adapter_enabled: properties.get('ucmdb.adapter'),
  ucmdb_browser_server: process.env.UCMDB_BROWSER_SERVER || properties.get('ucmdb.browser_server'),
  ucmdb_browser_port: process.env.UCMDB_BROWSER_PORT || properties.get('ucmdb.browser_port'),
  ucmdb_browser_param: properties.get('ucmdb.browser_param'),

  db_folder: properties.get('db.folder'),
  db_type: properties.get('db.type'),

  mongo: {
    server: properties.get('mongo.server'),
    port: properties.get('mongo.port'),
    db: properties.get('mongo.db'),
    username: properties.get('mongo.username'),
    password: properties.get('mongo.password')
  },

  slack_url: properties.get('slack.url'),
  slack_channel: properties.get('slack.channel'),

  proxy_host: properties.get('proxy.host'),
  proxy_port: properties.get('proxy.port'),

  session_max_age: process.env.AMB_SESSION_MAX_AGE || properties.get('node.session_max_age'),

  jwt_max_age: process.env.AMB_JWT_MAX_AGE || properties.get('rest.jwt_max_age'),

  rights_admin: properties.get('user.admin'),
  rights_power: properties.get('user.power'),
  rights_guest: properties.get('user.guest'),

  logging_level: properties.get('logging.level')
};
