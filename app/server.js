// set up ======================================================================
var express = require('express');
var app = express(); 								// create our app w/ express

var cors = require('cors');
app.use(cors());

var port = process.env.PORT || 8080; 				// set the port
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var am_href = process.env.AM_WEB_TIER || "http://Admin@localhost:8081";    // http://user:pass@hostname:8081
var dbFile = { folder: './db', json: '/template.json' };
var redis = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || "6379",
    auth_pass: process.env.REDIS_PASS || "",
    enabled: process.env.REDIS_ENABLED || false,
    ttl: process.env.REDIS_TTL || 600
};
// initial AM server
var URL = require('url');

var am;
if (am_href != "") {
    am = {
        server: URL.parse(am_href).host,
        user: URL.parse(am_href).auth.split(":")[0],
        password: URL.parse(am_href).auth.split(":")[1]
    };
}


// initial db folder and files =================================================
var db = require('./db.js');
db.init(dbFile.folder, dbFile.json);

var path = require('path');

app.use('/', express.static(path.join(__dirname, '/../dist')));
var indexHtml = function (req, res) {
  res.sendFile(path.resolve(path.join(__dirname, '/../dist/index.html')));
};
app.get('/login', indexHtml);
app.get('/explorer', indexHtml);
app.get('/builder', indexHtml);
app.get('/aql', indexHtml);
app.get('/views', indexHtml);
app.get('/explorer/*', indexHtml);
app.get('/builder/*', indexHtml);
app.get('/aql/*', indexHtml);
app.get('/views/*', indexHtml);
app.get('/adapter', indexHtml);
app.get('/adapter/*', indexHtml);
app.get('/adapter/*/*', indexHtml);

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request


// routes ======================================================================
require('./routes.js')(app, am, redis);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);

// sub process to cache view data in Redis
if (am) {
    var cp = require('child_process');
    var child = cp.fork('app/worker.js');

    // Send child process some work
    child.send(JSON.stringify({ am: am, db: dbFile, redis: redis }));
}