// set up ======================================================================
var express = require('express');
var app = express(); 								// create our app w/ express
var fs = require('fs'), https = require('https'), http = require('http');
var cors = require('cors');
app.use(cors());

var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var dbFile = { folder: './db', json: '/template.json' };
var redis = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || "6379",
    auth_pass: process.env.REDIS_PASS || "",
    enabled: process.env.REDIS_ENABLED || false,
    ttl: process.env.REDIS_TTL || 600
};

// initial AM REST server
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('am-browser-config.properties');
var rest_protocol = properties.get('rest.protocol');
var rest_server = properties.get('rest.server');
var rest_port = properties.get('rest.port');
var rest_username = properties.get('rest.username');
var rest_password = properties.getRaw('rest.password');
// initial AM node server
//var protocol = properties.get('node.protocol'); 
var server = properties.get('node.server'); 
var port = properties.get('node.port'); 				// set the port
var https_port = properties.get('node.https_port');     // set the https port

var am = {
    //server: rest_protocol + "://" + rest_server + ":" + rest_port,
	server: rest_server + ":" + rest_port,
    user: rest_username,
    password: rest_password
};

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
app.get('/ucmdbAdapter', indexHtml);
app.get('/ucmdbAdapter/*', indexHtml);
app.get('/ucmdbAdapter/*/*', indexHtml);

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request


// routes ======================================================================
require('./routes.js')(app, am, redis);

// listen (start app with node server.js) ======================================
app.listen(port, server);
console.log("App listening HTTP on port " + port );

// TODO: 1. Enable this in production. 2. There are some hardcoded HTTP requests in front-end JS, which causes mixed content issues
const KEY = 'ssl/server-key.pem';
const CERT = 'ssl/server-cert.pem';
try {
    fs.statSync(KEY);
    fs.statSync(CERT);
    var server_options = {
        key  : fs.readFileSync( KEY ),
        cert : fs.readFileSync( CERT ),
        ca   : fs.readFileSync( CERT ) //Optional for dev machine, but for production it's necessary!!!
    };
    https.createServer(server_options, app).listen(https_port);
    console.log("App listening HTTPS on port " + https_port);
}
catch (e){
    console.warn("HTTPS is not set correctly");
}



// sub process to cache view data in Redis
// if (am) {
//     var cp = require('child_process');
//     var child = cp.fork('app/worker.js');
//
//     // Send child process some work
//     child.send(JSON.stringify({ am: am, db: dbFile, redis: redis }));
// }