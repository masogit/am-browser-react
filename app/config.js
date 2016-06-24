/**
 * Created by huling on 6/14/2016.
 */
// init variables from properties

var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('am-browser-config.properties.default');
var logger = require('./logger.js');
properties.append('am-browser-config.properties');
// logger.info("[server]", "Server configuration: " + JSON.stringify(properties));

module.exports = {
  session_secret: properties.get('node.session_secret'),

  rest_protocol: properties.get('rest.protocol'),
  rest_server: properties.get('rest.server'),
  rest_port: properties.get('rest.port'),

  node_server: properties.get('node.server'),
  node_port: properties.get('node.port'),
  node_https_port: properties.get('node.https_port'),

  isDebug: properties.get('node.is_debug'),
  enable_csrf: properties.get('node.enable_csrf'),

  ucmdb_adapter_enabled: properties.get('ucmdb.adapter'),
  ucmdb_browser_server: properties.get('ucmdb.browser_server'),
  ucmdb_browser_port: properties.get('ucmdb.browser_port'),
  ucmdb_browser_param: properties.get('ucmdb.browser_param'),

  base: properties.get('rest.base'),
  version: properties.get('rest.version'),
  db_folder: properties.get('db.folder'),

  slack_url: properties.get('slack.url'),
  slack_channel: properties.get('slack.channel'),

  proxy_host: properties.get('proxy.host'),
  proxy_port: properties.get('proxy.port'),

  session_max_age: properties.get('node.session_max_age'),

  jwt_max_age: properties.get('rest.jwt_max_age')
};
