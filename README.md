# AM Browser

A lightweight Asset Manager web browser, to search AM database, build simple data views, quick search and execute AQL, etc.


## Installation

1. Clone the repository
1. Install nodejs from [nodejs.org](http://nodejs.org)
1. Install related packages: `npm install`
	- Configure npm proxy in HP intranet:
	`npm config set proxy http://web-proxy.sgp.hp.com:8080`
    - Note: if you run into erros like SSL issue, run command: 
    `npm config set strict-ssl false` 
1. Install Redis from [redis.io](http://redis.io/)
	- Start Redis Server in local, default port should be: 6379
	- Configure Redis Client in ***server.js*** or set environment variables
	    - host:  `process.env.REDIS_HOST || "127.0.0.1"`
	    - port:  `process.env.REDIS_PORT || "6379"`
	    - auth_pass:  `process.env.REDIS_PASS || ""`
	    - enabled:  `process.env.REDIS_ENABLED || true`
	    - ttl:  `process.env.REDIS_TTL || 600` 
1. Start the server: `node server.js`
	- Configure browser port (default is 8080):
		- Windows `set PORT=8080`
		- Linux `export PORT=8080`
	- Configure AM web tire: (for example: http://admin:@16.186.74.164:8081)
		- Windows `set AM_WEB_TIER=http://user:password@server:port`
		- Linux `export AM_WEB_TIER=http://user:password@server:port`
1. View in browser at `http://localhost:8080`

## Features
1. User login AM Browser with specified AM web tie server and port with credential
2. Retrieve and display all tables and each table with its fields and links
3. Query AM DB data by selected fields, AQL, and sort
4. Further query from a record to its links data, customized display fields
5. Create views by customized fields, links and AQL
6. Explorer view's record with table and tree format
7. Support quick search records in views (need configure to Redis service)
8. Support federate CI from specified UCMDB server