// set up =======
var compression = require('compression');
var express = require('express');
var path = require('path');
var app = express(); 								// create our app w/ express
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('./logger.js');
var credentials = require('./credentials.js');
var session = require('express-session');
var csrf = require('csurf');
var fs = require('fs'), https = require('https'), http = require('http');
var cors = require('cors');

// initial AM REST server
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('am-browser-config.properties');
// initial AM node server
var server = process.env.AMB_NODE_SERVER || properties.get('node.server');
var port = process.env.AMB_NODE_PORT || properties.get('node.port'); 				// set the port
var https_port = process.env.AMB_REST_HTTPS_PORT || properties.get('node.https_port');     // set the https port

app.use(compression());
app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
app.use(session({secret: credentials.cookieSecret}));
app.use(cors({origin: true, credentials: true}));
app.use('/', express.static(path.join(__dirname, '/../dist')));
app.use(csrf());

var indexHtml = function (req, res) {
  res.sendFile(path.resolve(path.join(__dirname, '/../dist/index.html')));
};

app.get('/login', indexHtml);
app.get('/insight', indexHtml);
app.get('/insight/*', indexHtml);
app.get('/explorer', indexHtml);
app.get('/aql', indexHtml);
app.get('/views', indexHtml);
app.get('/explorer/*', indexHtml);
app.get('/aql/*', indexHtml);
app.get('/views/*', indexHtml);
app.get('/ucmdbAdapter', indexHtml);
app.get('/ucmdbAdapter/*', indexHtml);
app.get('/ucmdbAdapter/*/*', indexHtml);

// routes ======================================================================
require('./routes.js')(app);

// listen (start app with node server.js) ======================================
app.listen(port, server);
logger.info("App listening HTTP on port " + port);

// TODO: 1. Enable this in production. 2. There are some hardcoded HTTP requests in front-end JS, which causes mixed content issues
const KEY = 'ssl/server-key.pem';
const CERT = 'ssl/server-cert.pem';
try {
  fs.statSync(KEY);
  fs.statSync(CERT);
  var server_options = {
    key: fs.readFileSync(KEY),
    cert: fs.readFileSync(CERT),
    ca: fs.readFileSync(CERT) //Optional for dev machine, but for production it's necessary!!!
  };
  https.createServer(server_options, app).listen(https_port);
  logger.info("App listening HTTPS on port " + https_port);
}
catch (e) {
  logger.warn("HTTPS is not set correctly");
}