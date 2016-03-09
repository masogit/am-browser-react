// set up ======================================================================
var express = require('express');
var app = express(); 								// create our app w/ express
var port = process.env.PORT || 8080; 				// set the port
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var am_href = process.env.AM_WEB_TIER || "http://admin:@16.186.74.164:8081";    //http://user:pass@hostname:8081
var redis = {
    host:       process.env.REDIS_HOST || "127.0.0.1",
    port:       process.env.REDIS_PORT || "6379",
    auth_pass:  process.env.REDIS_PASS || "",
    enabled:    process.env.REDIS_ENABLED || true,
    ttl:        process.env.REDIS_TTL || 600  
};

// initial db folder and files =================================================
var db = require('./app/db.js');
db.init('db', '/template.json');

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request

// initial AM server
var URL = require('url');    
var amUrl = URL.parse(am_href);
var am = {
    server:     amUrl.host,
    user:       amUrl.auth.split(":")[0],
    password:   amUrl.auth.split(":")[1]
}; 

// routes ======================================================================
require('./app/routes.js')(app, am, redis);

// scheduler cache

// require('./app/cache.js')(db, am);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
