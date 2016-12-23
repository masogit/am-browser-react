exports.getCookies = function(req) {
  var cookies = req.cookies.map((val, key) => {
    return key + "=" + encodeURIComponent(val);
  }).join("; ");
  return cookies;
};
