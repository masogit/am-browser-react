var winston = require('winston');
var fs = require('fs');
var path = require('path');
const LOG_FOLDER = 'log';
const LOG_FILE = 'ambrowser.log';

var logFolder = path.join(__dirname, '../' + LOG_FOLDER);
fs.existsSync(logFolder) || fs.mkdirSync(logFolder)

var config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5,
    silly: 6
  }
};

var logger = module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (require('winston-daily-rotate-file'))({
      filename: LOG_FOLDER + "/" + LOG_FILE,
      maxsize: 5000000
    })
  ],
  levels: config.levels
});

