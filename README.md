To run this application, execute the following commands:

  1. Install NPM modules
    ```
    $ cd am-browser
    $ npm install
    ```
  2. Start the server

    ```
    $ cd app
    $ gulp dev
    ```

  3. Start the UI development server
    ```
    $ gulp dev
    ```

  4. Check Ferret production server
    ```
    $ cd am-browser
    $ gulp dist
    $ node app/server.js
    ```

For unit testing and code coverage, run the following commands:

  1. Unit tests:
    $ cd am-browser
    $ npm run test
  
  2. Code coverage:
    $ cd am-browser
    $ npm run coverage
    
    The code coverage report is generated in am-browser/coverage folder.
      