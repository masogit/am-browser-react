var logger = require('./logger.js');

var map = {};
exports.touch = function (session, maxAge) {
  clearTimeout(map[session.id]);
  map[session.id] = setTimeout(function () {
    delete map[session.id];
    session.destroy();
    logger.debug(`[user] [${session.id}] session destroyed.`);
  }, maxAge * 60 * 1000);
};