# AM Browser

A Simple AM Browser developed based on AM DB and Metadata REST services. Try it [here](http://16.165.217.57:8088).

## Installation

1. Clone the repository
1. Install nodejs from [nodejs.org](http://nodejs.org)
1. Install related packages: `npm install`
		note: if you run into erros like SSL issue, run command: npm config set strict-ssl false 
	- Configure npm proxy in HP intranet:
	`npm config set proxy http://web-proxy.sgp.hp.com:8080`
1. Start the server: `node server.js`
	- Configure port (default is 8080):
	Windows `set PORT=8080`
	Linux `export PORT=8080`
1. View in browser at `http://localhost:8080`

## Features
1. User login AM Browser with specified AM web tie server and port with credential
2. Retrieve and display all tables and each table with its fields and links
3. Query AM DB data by selected fields, AQL, and sort
4. Further query from a record to its links data, customized display fields
5. Create views by customized fields, links and AQL
6. Explorer view's record with table and tree format


