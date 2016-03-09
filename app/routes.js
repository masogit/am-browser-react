var db = require('./db.js');

module.exports = function (app, am_href) {
    var URL = require('url');    
    var amUrl = URL.parse(am_href);
    var am = {
        server:     amUrl.host,
        user:       amUrl.auth.split(":")[0],
        password:   amUrl.auth.split(":")[1]
    };   
    
    var Metadata = require('./metadata.js');
    var metadata = new Metadata(am);
    var REST = require('./rest.js');
    var rest = new REST(am)
         
    // CRUD local loki file json db
    app.get('/json/:collection', db.get);
    app.post('/json/:collection', db.set);
    app.delete('/json/:collection/:id', db.del);
    
    // AM Server Conf
    app.get('/am/conf', function (req, res) {
        res.json(am);
    });
    
    app.post('/am/conf', function (req, res) {
        am.server = req.body.server;       
        am.user = req.body.user;
        am.password = req.body.password;
    });

    // AM Metadata ---------------------------------------------------------
    app.post('/am/metadata', metadata.get);
    app.post('/am/rest', rest.db);

    // redis cache search --------------------------------------------------
    app.post('/cache/search', rest.cacheSearch);



    app.get('/browser', function (req, res) {
        res.sendfile('./public/browser/index.html');
    });

    app.get('/m', function (req, res) {
        res.sendfile('./public/mobile/index.html');
    });

    app.get('/login', function (req, res) {
        res.sendfile('./public/login.html');
    });

    app.get('/', function (req, res) {
        res.redirect("/login");
    });

};
