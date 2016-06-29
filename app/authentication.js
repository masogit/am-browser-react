/**
 * Created by huling on 6/29/2016.
 */
var rights = require('./constants').rights;

const checkRight = (req, level) => {
  if (req.session.rights.index > level.index) {
    throw 'user has no permission';
  }
};

module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.originalUrl.indexOf('wall') > -1) {
      checkRight(req, rights.power);
    } else {
      checkRight(req, rights.admin);
    }
    next();
  }
};