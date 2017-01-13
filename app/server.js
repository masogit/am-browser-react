// set up =======
var compression = require('compression');
var express = require('express');
var cookieParser = require('cookie-parser');
var path = require('path');
var app = express(); 								// create our app w/ express
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('./logger.js');
var session = require('express-session');
var csrf = require('csurf');
var fs = require('fs'), https = require('https'), http = require('http');
var cors = require('cors');
var config = require('./config.js');
var sessionUtil = require('./sessionUtil.js');

// initial AM node server
var server = config.node_server;
var port = config.node_port; // set the port
var https_port = config.node_https_port;     // set the https port

var isDebug = config.isDebug;
var enable_csrf = config.enable_csrf;
var enable_lwsso = config.enable_lwsso;

app.use(cookieParser());
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

app.use(config.node_base, express.static(path.join(__dirname, '/../dist')));
// routes ======================================================================
var AMBRouter;
if (config.node_base == '/') {
  AMBRouter = app;
} else {
  AMBRouter = express.Router();
  app.use(config.node_base, AMBRouter);
}

require('./routes.js')(AMBRouter);

logger.info('[server]', 'App CSRF ' + (enable_csrf ? 'enabled' : 'disabled') + '.');
logger.info('[server]', 'App LWSSO ' + (enable_lwsso ? 'enabled' : 'disabled') + '.');

// error handle
app.use(function (err, req, res, next) {
  if (enable_csrf && (err.code === 'EBADCSRFTOKEN') ) {
    logger.error(`[csrf] [${req.sessionID}] [${req.session && req.session.csrfSecret}] [${err.name}: ${err.message}] ${req.method} ${req.url}`);
    res.cookie('csrf-token', req.csrfToken());
  }
  next(err);
});

// listen (start app with node server.js) ======================================
var http_server = http.createServer(app);
http_server.listen(port, server, () => {
  logger.info('[server]', 'App listening HTTP on port ' + port);
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
    logger.info('[server]', 'App listening HTTPS on port ' + https_port);
  });
  https_server.on('error', (e) => {
    if (e.code == 'EADDRINUSE') {
      logger.error(e.code + ': Port ' + https_port + ' already in use, please change it in am-browser-config.properties');
    }
  });
} catch (e) {
  logger.warn('[server]', 'HTTPS is not set correctly');
}

var sessionClearer = setTimeout(function () {
  sessionUtil.userTracking.get();
}, config.session_max_age * 2 * 60 * 1000);

var shutdown = function () {
  logger.info('[server]', 'Received kill signal, shut down server.');
  clearTimeout(sessionClearer);
  process.exit();
};

// listen for TERM signal e.g. kill
process.on('SIGTERM', shutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', shutdown);
