var winston = require('winston');
var fs = require('fs');
var path = require('path');
const LOG_FOLDER = 'log';
const LOG_FILE = 'ambrowser.log';

try {
  var logFolder = path.join(__dirname, '../' + LOG_FOLDER);
  fs.exists(logFolder, function (folder) {
    if (!folder) {
      console.log("log folder not found");

      fs.mkdir(logFolder, function (err) {
        if (err) {
          return console.log(err);
        }

        console.log("log folder created!");
      })
    }
  });
}
catch (e) {
  console.error("Cannot create log folder!");
}

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

