var winston = require('winston');
var fs = require('fs');
var path = require('path');
const LOG_FOLDER = 'log';
const LOG_FILE = 'ambrowser.log';
var config = require('./config');

var logFolder = path.join(__dirname, '../' + LOG_FOLDER);
fs.existsSync(logFolder) || fs.mkdirSync(logFolder)

var logger = module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({level: config.logging_level}),
    new (require('winston-daily-rotate-file'))({
      filename: LOG_FOLDER + "/" + LOG_FILE,
      maxsize: 5000000,
      level: config.logging_level
    })
  ]
});

