var _ = require('lodash');
exports.getCookies = function(req) {
  var cookies = _.map(req.cookies, function(val, key) {
    return key + "=" + encodeURIComponent(val);
  }).join("; ");
  return cookies;
}