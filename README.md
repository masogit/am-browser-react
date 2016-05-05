# To run this application, execute the following commands: 

##  1. Install NPM modules
    $ cd am-browser
    $ npm install
##  2. Start the server
    $ cd am-browser
    $ node app\server.js
      or 'node app/server.js' if you use git bash.
## 3. Start the UI development server
    $ cd am-browser
    $ gulp dev
##  4. Distribution build
    $ cd am-browser
    $ gulp dist
    $ node app/server.js
##  5. (Trial) One click to start server
  It combines the express server and UI dev server together, and copy the demo data into db folder.
```
$ npm start
```
##  6. (Optional) Setup DEMO env
 * Setup demo data for AM Browser
```
$ gulp copy-demo
```
 * Run dev env with demo data
```
$ gulp amdev
```

# For unit testing and code coverage, run the following commands:
##  1. Unit tests:
    $ cd am-browser
    $ npm run test

##  2. Run a single test file

    For example: 
    
    $ cd am-browser
    $ npm run test --grep ./test/actions/views-spec.js   
     
    or:
    
    $ npm run test --grep ./test/actions/views-*.js   
            
  
## 3. Code coverage:
    $ cd am-browser
    $ npm run coverage
    
The code coverage report is generated in am-browser/coverage folder.

If you failed to run the test/coverage, try to:
  
    1. Install node.js 4.4.0+
    2. Install latest npm (currently 3.8.3) by running:
      npm install -g npm

# Configurations
## For generating the SSL certificate for dev
### 1. Set the SSL CONF in the git bash 
  ```
  $ export OPENSSL_CONF=/ssl/openssl.cnf
  ```
### 2. Server key
  ```
  $ openssl genrsa -out server-key.pem 1024
  ```
### 3. CSR for the server key
  ```
  $ openssl req -new -key server-key.pem -out server-csr.pem
  ```
### 4. Self signed certificate
  ```
  $ openssl x509 -req -in server-csr.pem -signkey server-key.pem -out server-cert.pem
  ```