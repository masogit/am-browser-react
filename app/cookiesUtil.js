exports.getCookies = function (req) {
  var cookies = Object.keys(req.cookies).map((key) => {
    return key + "=" + encodeURIComponent(req.cookies[key]);
  }).join("; ");
  return cookies;
};
