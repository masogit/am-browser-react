/**
 * Created by huling on 6/14/2016.
 */

var config = require('./config.js');
var Client = require('node-rest-client').Client;
var logger = require('./logger.js');

process.on('message', function (obj) {
  var username = obj.username, message = obj.message;

  var proxyClient;

  if (config.proxy_host && config.proxy_port) {
    var options_proxy = {
      proxy: {
        host: config.proxy_host,
        port: config.proxy_port,
        tunnel: true
      }
    };
    proxyClient = new Client(options_proxy);
  } else {
    proxyClient = new Client();
  }

  const args = {
    data: {
      channel: config.slack_channel,
      username: 'AM broswer',
      text: message,
      icon_emoji: ":skier:"
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };

  proxyClient.post(config.slack_url, args, function (result, res) {
    // TODO:  better error handle
    var status, msg, resultMessage = result && result.toString('utf-8');

    if (resultMessage === 'ok' && res.statusCode == 200) {
      status = 'info';
      msg = `Message ${message} is send to slack`;
    } else {
      status = 'warn';
      msg = 'Send message to slack failed, please check your slack setting and proxy setting. error: ' + resultMessage;
    }

    process.send({status: status, message: msg});
  }).on('error', function (err) {
    process.send({status: 'warn', message: 'Send message to slack failed. error: ' + err.message});
  });
});
