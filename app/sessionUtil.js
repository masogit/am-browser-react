var logger = require('./logger.js');

var map = {};
var onlineUsers = {};
exports.touch = function (session, maxAge) {
  clearTimeout(map[session.id]);
  map[session.id] = setTimeout(function () {
    delete map[session.id];
    session.destroy();
    logger.debug(`[user] [${session.id}] session destroyed.`);
  }, maxAge * 60 * 1000);
};

exports.userTracking = {
  add: function (session) {
    const ipAddress = session.id;
    onlineUsers[ipAddress] = session;
    onlineUsers[ipAddress].online = true;
  },
  remove: function (ipAddress) {
    if (onlineUsers[ipAddress]) {
      onlineUsers[ipAddress].online = false;
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
