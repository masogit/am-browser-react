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
    app.get('/download/:collection', db.download);
    app.get('/coll/:collection', db.find);
    app.get('/coll/:collection/:id', db.find);
    app.post('/coll/:collection', db.upsert);
    app.delete('/coll/:collection/:id', db.delete);

    // app.get('/view/:collection/:id/count', function(req, res){

    // });

    app.get('/coll/:collection/:id/list', function(req, res){
      if (am) {
        req.body.method = "get";
        req.body.server = am.server;
        req.body.user = am.user;
        req.body.password = am.password;

        var collectionName = req.params.collection;
        var id = req.params.id;

        db.findOne(collectionName, id, function(view){
          if (view.body) {
            var fields = [];
            view.body.fields.forEach(function(field){
              fields.push(field.sqlname);
            });
            req.body.context = "/AssetManagerWebService/rs/";
            req.body['ref-link'] = 'db/'+view.body.sqlname;
            req.body.collection = "";
            req.body.param = {
              limit: (req.query.limit) ? req.query.limit:"100",
              offset: (req.query.offset) ? req.query.offset:"0",
              filter: view.body.filter,
              orderby: view.body.orderby,
              fields: fields.join()
            }
          }

          if (req.query.form) // show REST obj
            res.json(req.body);
          else
            rest.db(req, res);
        });
      }
    });

    // app.get('/view/:collection/:id/csv', function(req, res){

    // });

    // app.get('/view/:collection/:id/list/:ref', function(req, res){

    // });

    // app.get('/view/:collection/:id/list/:ref/link', function(req, res){

    // });
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
