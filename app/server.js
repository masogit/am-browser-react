// set up =======
var compression = require('compression');
var express = require('express');
var path = require('path');
var app = express(); 								// create our app w/ express
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('./logger.js');
var session = require('express-session');
var csrf = require('csurf');
var fs = require('fs'), https = require('https'), http = require('http');
var cors = require('cors');
var config = require('./config.js');


// initial AM node server
var server = process.env.AMB_NODE_SERVER || config.node_server;
var port = process.env.AMB_NODE_PORT || config.node_port; // set the port
var https_port = process.env.AMB_REST_HTTPS_PORT || config.node_https_port;     // set the https port

var isDebug = process.env.AMB_NODE_DEBUG || config.isDebug;
var enable_csrf = process.env.AMB_NODE_CSRF || config.enable_csrf;

app.use(compression());
//app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.session_secret
}));
if (isDebug) {
  app.use(cors({origin: true, credentials: true}));
} else {
  app.use(cors());
}

if (enable_csrf) {
  app.use(csrf());
}

app.use('/', express.static(path.join(__dirname, '/../dist')));

var indexHtml = function (req, res) {
  res.cookie('csrf-token', req.csrfToken());
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

// redirect morgan log to winston
morgan.token('sessionId', function getSessionId (req) {
  return req.session ? req.session.id : '';
})
var morganFormat = "[express] [:sessionId] [:remote-addr] [:remote-user] :method :url HTTP/:http-version :status :res[content-length] - :response-time ms";
var stream = {
  write: function (message, encoding) {
    logger.debug(message);
  }
};
app.use(morgan(morganFormat, {stream: stream}));

// routes ======================================================================
require('./routes.js')(app);

app.use(function(err, req, res, next){
  logger.error(`[csrf] [${req.sessionID}] [${req.session && req.session.csrfSecret}] [${err.name}: ${err.message}] ${req.method} ${req.url}`);
  if (enable_csrf && (err.code === 'EBADCSRFTOKEN') ) {
    res.cookie('csrf-token', req.csrfToken());
  }
  next(err);
});

// listen (start app with node server.js) ======================================
var http_server = http.createServer(app);
http_server.listen(port, server, () => {
  logger.info("[server]", "App listening HTTP on port " + port);
});
http_server.on('error', (e) => {
  if (e.code == 'EADDRINUSE') {
    logger.error(e.code + ': Port ' + port + ' already in use, please change it in am-browser-config.properties');
  }
});

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
  var https_server = https.createServer(server_options, app);
  https_server.listen(https_port, () => {
    logger.info("[server]", "App listening HTTPS on port " + https_port);
  });
  https_server.on('error', (e) => {
    if (e.code == 'EADDRINUSE') {
      logger.error(e.code + ': Port ' + https_port + ' already in use, please change it in am-browser-config.properties');
    }
  });
}
catch (e) {
  logger.warn("[server]", "HTTPS is not set correctly");
}

var shutdown = function () {
  logger.info("[server]", "Received kill signal, shut down server.");
  process.exit();
};

// listen for TERM signal e.g. kill
process.on('SIGTERM', shutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', shutdown);
