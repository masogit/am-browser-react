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
    var auth = 'Basic ' + new Buffer(am.user + ':' + am.password).toString('base64');
    console.log("auth: " + auth);
    apiProxy.on('proxyReq', function(proxyReq, req, res, options) {
      console.log("set request header: " + auth);
      proxyReq.setHeader('Authorization', auth);
    });

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

    function view (req, res, db){
        if (am) {
          req.body.method = "get";
          req.body.server = am.server;
          req.body.user = am.user;
          req.body.password = am.password;

            var collectionName = req.params.collection;
            var id = req.params.id;
            var ref = req.params.ref;

            db.findOne(collectionName, id, function(view){


              if (view.body) {
                var record = {};
                var promiseArray = [];

                // body(req, res, view.body, record, promiseArray);
                list(req, view.body, function (data) {
                  res.send(data);
                });

              }
            });
        }
    }

    function list (req, body, callback){
                var fields = [];
                body.fields.forEach(function(field){
                  fields.push(field.sqlname);
                });
                req.body.context = "/AssetManagerWebService/rs/";
                req.body.collection = "";
                req.body.param = {
                  limit: (req.query.limit) ? req.query.limit:"100",
                  offset: (req.query.offset) ? req.query.offset:"0",
                  filter: body.filter,
                  orderby: body.orderby,
                  fields: fields.join()
                }

                var id = req.params.ref;
                var linkName = req.params.link;

                if (id)
                    req.body['ref-link'] = 'db/'+body.sqlname+'/'+id;
                else
                    req.body['ref-link'] = 'db/'+body.sqlname;

                rest.query(req, function (data) {
                  if (req.params.ref) {
                      if (body.links && body.links.length > 0) {
                        if (linkName) {
                            var link = body.links.filter(function (link) {
                              return link.sqlname == linkName;
                            })[0];

                            if (link) {
                              if (req.params.linkid) {
                                req.params.ref = req.params.linkid;
                                req.params.linkid = undefined;
                              } else
                                req.params.ref = undefined;

                              req.params.link = (req.params.link2) ? req.params.link2 : req.params.link;

                              var reverseField = link.reversefield;
                              var reverse = link.reverse;
                              var AQL = reverse+'.PK='+ data[reverseField];
                              link.body.filter += (link.body.filter)?' AND ':'' + AQL;

                              list (req, link.body, function (link_data) {
                                callback(link_data);
                              });
                            } else {
                                data.links = [];
                                body.links.forEach(function (link) {
                                  var body = link.body;
                                  delete link.body;
                                  data.links.push(link);
                                });

                              callback(data);
                            }

                        } else {
                            data.links = [];
                            body.links.forEach(function (link) {
                              var body = link.body;
                              delete link.body;
                              data.links.push(link);
                            });

                          callback(data);
                        }

                      } else
                        callback(data);

                  } else {
                    if (req.params.linkid) {
                      data.links = [];
                      body.links.forEach(function (link) {
                        var body = link.body;
                        delete link.body;
                        data.links.push(link);
                      });
                    }

                    callback(data);
                  }


                });

    }

    app.get('/coll/:collection/:id/list', function(req, res){
      view(req, res, db);
    });

    app.get('/coll/:collection/:id/list/:ref', function(req, res){
      view(req, res, db);
    });

    app.get('/coll/:collection/:id/list/:ref/:link', function(req, res){
      view(req, res, db);
    });

    app.get('/coll/:collection/:id/list/:ref/:link/:linkid', function(req, res){
      view(req, res, db);
    });

    app.get('/coll/:collection/:id/list/:ref/:link/:linkid/:link2', function(req, res){
      view(req, res, db);
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
    });

    app.use('/am/v1/schema', function (req, res) {
        // TODO: need to take care of https
        console.log('http://' + am.server + '/AssetManagerWebService/rs/v1/schema');
        apiProxy.web(req, res, {target: 'http://' + am.server + '/AssetManagerWebService/rs/v1/schema'});
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
