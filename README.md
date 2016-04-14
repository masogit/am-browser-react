To run this application, execute the following commands:

  1. Install NPM modules
    ```
    $ cd am-browser
    $ npm install
    ```
  2. Start the server

    ```
    $ cd am-browser
    $ node app\server.js
      or 'node app/server.js' if you use git bash.
    ```

  3. Start the UI development server
    ```
    $ cd am-browser
    $ gulp dev
    ```

  4. Distribution build
    ```
    $ cd am-browser
    $ gulp dist
    $ node app/server.js
      or 'node app/server.js' if you use git bash.
    ```

For unit testing and code coverage, run the following commands:

  1. Unit tests:
    $ cd am-browser
    $ npm run test
  
  2. Code coverage:
    $ cd am-browser
    $ npm run coverage
    
    The code coverage report is generated in am-browser/coverage folder.
  
  If you failed to run the test/coverage, try to:
  
    1. Install node.js 4.4.0+
    2. Install latest npm (currently 3.8.3) by running:
      npm install -g npm
  
