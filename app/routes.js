var db = require('./db.js');

module.exports = function (app, am, redis) {
    
    var Metadata = require('./metadata.js');
    var metadata = new Metadata();
    
    var REST = require('./rest.js');
    var rest = new REST();
    
    var Cache = require('./cache.js');
    var cache = new Cache(db, redis);
    
    // Redis Server Info
    app.get('/redis', function (req, res) {
        res.json(redis);
    }); 
        
    app.post('/redis', function (req, res) {
        redis = req.body       
    });
        
    // CRUD local loki file json db
    app.get('/json/:collection', db.get);
    app.post('/json/:collection', db.set);
    app.delete('/json/:collection/:id', db.del);
    
    // AM Server Conf
    app.get('/am/conf', function(req, res) {
        if (am) {
            var am_rest = Object.assign({}, am);
            am_rest['password'] = "";
            res.json(am_rest);
        } else
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
    app.post('/cache/search', cache.search);



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
