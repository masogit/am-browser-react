var db = require('./db.js');

module.exports = function (app, am, redis) {


    var Adapter = require('./adapter.js');
    var adapter = new Adapter();
    var Metadata = require('./metadata.js');
    var metadata = new Metadata();

    var REST = require('./rest.js');
    var rest = new REST();

    var Cache = require('./cache.js');
    var cache = new Cache(db, redis);

    var httpProxy = require('http-proxy');
    var apiProxy = httpProxy.createProxyServer();

    // Redis Server Info
    app.get('/redis', function (req, res) {
        res.json(redis);
    });

    app.post('/redis', function (req, res) {
        redis = req.body
    });

    // CRUD Tingodb
    app.get('/coll/:collection', db.read);
    app.post('/coll/:collection', db.upsert);
    app.delete('/coll/:collection/:id', db.delete);
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

    // get ucmdb point data
    app.post('/am/ucmdbPoint', adapter.getUCMDB);

    // get ucmdb job data
    app.post('/am/ucmdbJob', adapter.getUCMDB);

    // get ucmdb job item data
    app.post('/am/ucmdbJobItem', adapter.getUCMDBJob);

    // AM Metadata ---------------------------------------------------------
    app.post('/am/metadata', metadata.get);
    app.post('/am/rest', rest.db);

    // Proxy the backend rest service /rs/db -> /am/db
    console.log(am);
    app.use('/am/db', function(req, res){
        // TODO: need to take care of https
        console.log('http://'+am.server+'/AssetManagerWebService/rs/db');
        apiProxy.web(req,res,{target: 'http://'+am.server+'/AssetManagerWebService/rs/db'});
    })

    // redis cache search --------------------------------------------------
    app.post('/cache/search', cache.search);



    //app.get('/browser', function (req, res) {
    //    res.sendfile('./public/browser/index.html');
    //});

    app.get('/m', function (req, res) {
        res.sendfile('./public/mobile/index.html');
    });

    //app.get('/login', function (req, res) {
    //    res.sendfile('./public/login.html');
    //});
    //
    //app.get('/', function (req, res) {
    //    res.redirect("/login");
    //});

};
