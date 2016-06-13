var map = {};
exports.touch = function (session, maxAge) {
  clearTimeout(map[session.id]);
  map[session.id] = setTimeout(function () {
    delete map[session.id];
    session.destroy();
  }, maxAge * 60 * 1000);
};