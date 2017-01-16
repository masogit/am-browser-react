var logger = require('./logger.js');

var map = {};
var onlineUsers = {};
exports.touch = function (session, maxAge) {
  clearTimeout(map[session.id]);
  map[session.id] = setTimeout(function () {
    var id = session.id;
    delete map[id];
    delete onlineUsers[id];
    session.destroy();
    logger.debug(`[user] [${id}] session destroyed.`);
  }, maxAge * 60 * 1000);
};

exports.clear = function (session) {
  var id = session.id;
  clearTimeout(map[id]);
  delete map[id];
};

exports.userTracking = {
  add: function (session) {
    const ipAddress = session.id;
    onlineUsers[ipAddress] = session;
    onlineUsers[ipAddress].online = true;
  },
  remove: function (ipAddress) {
    if (onlineUsers[ipAddress]) {
      delete onlineUsers[ipAddress];
    }
  },
  get: function () {
    const result = {};
    Object.keys(onlineUsers).map(sessionId => {
      if (map[sessionId]) {
        const session = onlineUsers[sessionId];
        if (session.online) {
          if (!result[session.user]) {
            result[session.user] = {
              name: session.user,
              count: 1
            };
          } else {
            result[session.user].count++;
          }
        }
      } else {
        delete onlineUsers[sessionId];
      }
    });
    return Object.keys(result).map(key => result[key]);
  }
};
