var db = require('./db.js');
var metadata = require('./metadata.js');
var rest = require('./rest.js');

module.exports = function (app) {
    // CRUD local loki file json db
    app.get('/json/:collection', db.get);
    app.post('/json/:collection', db.set);
    app.delete('/json/:collection/:id', db.del);

    // AM Metadata ---------------------------------------------------------
    app.post('/am/metadata', metadata.get);

    // redis cache search --------------------------------------------------
    app.post('/cache/search', rest.cacheSearch);

    // AM REST -------------------------------------------------------------
    app.post('/am/rest', rest.db);

    app.get('/amx', function (req, res) {
        res.sendfile('./public/browser/amx.html');
    });

    app.get('/m', function (req, res) {
        res.sendfile('./public/mobile/index.html');
    });

    app.get('/login', function (req, res) {
        res.sendfile('./public/login.html');
    });

    app.get('/', function (req, res) {
        res.sendfile('./public/login.html');
    });

};
