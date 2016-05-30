var argv = require('yargs').argv;
var gulp = require('gulp');
var path = require('path');
//var nodemon = require('gulp-nodemon');
var gulpTasks = require('grommet/utils/gulp/gulp-tasks');
var git = require('gulp-git');
var del = require('del');
var mkdirp = require('mkdirp');
var spawn = require('child_process').spawn;
var zip = require('gulp-zip');
var unzip = require('gulp-unzip');
var clean = require('gulp-clean');
var merge = require('merge-stream');
var download = require("gulp-download");
var xml2json = require('gulp-xml2json');
var rename = require('gulp-rename');
var config = require('./rest/config.json');

var opts = {
  base: '.',
  dist: path.resolve(__dirname, 'dist/'),
  copyAssets: [
    'src/index.html',
    {
      asset: 'src/img/**',
      dist: 'dist/img/'
    }
  ],
  scssAssets: ['src/scss/**/*.scss'],
  jsAssets: ['src/js/**/*.js'],
  mainJs: 'src/js/index.js',
  mainScss: 'src/scss/index.scss',
  sync: {
    hostname: 'grommet.us.rdlabs.hpecorp.net',
    username: 'ligo',
    remoteDestination: '/var/www/html/examples/ferret/dist'
  },
  webpack: {
    resolve: {
      root: [
        path.resolve(__dirname, 'src/js'),
        path.resolve(__dirname, 'src/scss'),
        path.resolve(__dirname, 'node_modules')
      ]
    }
  },
  devServerHost: 'localhost',
  devServerPort: 8001,
  // The 8010 port number needs to align with hostName in index.js
  devServerProxy: {
    "/rest/*": 'http://localhost:8010'
  },
  websocketHost: 'localhost:8010',
  alias: {
    'grommet-index/scss': path.resolve(__dirname, '../grommet-index/src/scss'),
    'grommet-index': path.resolve(__dirname, '../grommet-index/src/js'),
    'grommet/scss': path.resolve(__dirname, '../grommet/src/scss'),
    'grommet': path.resolve(__dirname, '../grommet/src/js')
  },
  devPreprocess: ['set-webpack-alias'],
  distPreprocess: ['copy-demo']
};

gulp.task('set-webpack-alias', function () {
  if (opts.alias && argv.useAlias) {
    console.log('Using local alias for development.');
    opts.webpack.resolve.alias = opts.alias;
  }
});

gulp.task('release:createTmp', function(done) {
  del.sync(['./tmp']);
  mkdirp('./tmp', function(err) {
    if (err) {
      throw err;
    }
    done();
  });
});

gulp.task('release:heroku', ['dist', 'release:createTmp'], function(done) {
  if (process.env.CI) {
    git.clone('https://' + process.env.GH_TOKEN + '@github.com/grommet/grommet-ferret.git',
      {
        cwd: './tmp/'
      },
      function(err) {
        if (err) {
          throw err;
        }

        process.chdir('./tmp/grommet-ferret');
        git.checkout('heroku', function(err) {
          if (err) {
            throw err;
          }

          gulp.src([
            '../../**',
            '!../../.gitignore',
            '!../../.travis.yml'])
          .pipe(gulp.dest('./')).on('end', function() {
            git.status({
              args: '--porcelain'
            }, function(err, stdout) {
              if (err) {
                throw err;
              }

              if (stdout && stdout !== '') {
                gulp.src('./')
                  .pipe(git.add({
                    args: '--all'
                  }))
                  .pipe(git.commit('Heroku dev version update.')).on('end', function() {
                    git.push('origin', 'heroku', { quiet: true }, function(err) {
                      if (err) {
                        throw err;
                      }

                      process.chdir(__dirname);
                      done();
                    });
                  });
              } else {
                console.log('No difference since last commit, skipping heroku release.');

                process.chdir(__dirname);
                done();
              }
            });
          });
        });
      }
    );
  } else {
    console.warn('Skipping release. Release:heroku task should be executed by CI only.');
  }
});

gulp.task('copy-demo', function () {
  console.log('Copy files in ./demo/ folder into the corespondent folders.');
  gulp.src('./demo/**').pipe(gulp.dest('./', {overwrite: false}));
});

var express;
gulp.task('start-node', function () {
  console.log('Starting node app/server.js');
  if (express) express.kill();
  express = spawn('node', ['app/server.js'], {stdio: 'inherit'});
  express.on('close', function (code) {
    console.log('Close express child_process by signal:' + code);
  });
});
process.on('exit', function() {
    if (express) express.kill();
});

gulp.task('amdev',['copy-demo','start-node','dev']);

gulp.task('clean-gen', function () {
  console.log('Clean gen folder');
  // clean gen folder
  return gulp.src('./gen').pipe(clean({force: true}));
});

gulp.task('copy-temp', ['dist', 'clean-gen'], function () {
  console.log('Copy all neccessary files into the gen temp folder');
  // copy node installation folder and cmd to gen temp
  var unzip_node = gulp.src('./build/node-v4.4.4-x64.zip', {base : '.'})
      .pipe(unzip())
      .pipe(gulp.dest('./gen/temp'));
  // copy nssm for register service
  var unzip_node = gulp.src('./build/nssm-2.24.zip', {base : '.'})
      .pipe(unzip())
      .pipe(gulp.dest('./gen/temp'));
  var copy_cmd = gulp.src('./build/*.cmd')
      .pipe(gulp.dest('./gen/temp'));
  // copy files to gen temp
  var copy_file = gulp.src(['./app/**', './db/**', './dist/**', './node_modules/**', './ssl/**', './am-browser-config.properties'], {base : '.'})
      .pipe(gulp.dest('./gen/temp'));
  return merge(unzip_node, copy_cmd, copy_file);
});

gulp.task('gen', ['copy-temp'], function () {
  console.log('Generate am-browser.zip from temp folder');
  // generate am-browser.zip from temp folder
  return gulp.src('./gen/temp/**')
      .pipe(zip('am-browser.zip'))
      .pipe(gulp.dest('./gen'));
});

gulp.task('download-ws-metadata-xml', function () {
  console.log('Download ws metadata xml');
  // download ws metadata xml
  return download(config.Nexus + 'com/hp/am/java/ac.ws/MAIN-SNAPSHOT/maven-metadata.xml')
	  .pipe(gulp.dest('./rest/downloads/'));
});

gulp.task('parse-ws-metadata-xml', ['download-ws-metadata-xml'], function () {
  console.log('Parse ws metadata xml to json');
  // parse ws metadata xml
  return gulp.src('./rest/downloads/maven-metadata.xml')
      .pipe(xml2json())
	  .pipe(rename({extname: '.json'}))
	  .pipe(gulp.dest('./rest/downloads/json'));
});

gulp.task('download-ws', ['parse-ws-metadata-xml'], function () {
  console.log('Download ws');
  var json = require('./rest/downloads/json/maven-metadata.json');
  var url = config.Nexus + 'com/hp/am/java/ac.ws/MAIN-SNAPSHOT/ac.ws-MAIN-'
      + json.metadata.versioning[0].snapshot[0].timestamp + '-' + json.metadata.versioning[0].snapshot[0].buildNumber + '.war';
  console.log('Ws url is : ' + url);
  // download ws
  return download(url)
	  .pipe(gulp.dest('./rest/downloads/'));
});

gulp.task('clean-gen-ws', function () {
  console.log('Clean gen ws folder');
  // clean gen folder
  return gulp.src('./rest/gen').pipe(clean({force: true}));
});

gulp.task('gen-ws-base', ['clean-gen-ws', 'download-ws'], function () {
  console.log('Generate ws package');
  // copy folder and files
  var copy_properties= gulp.src('./rest/package.properties')
      .pipe(gulp.dest('./rest/gen/temp/websvc'));
  var copy_bat = gulp.src('./rest/*.bat')
      .pipe(gulp.dest('./rest/gen/temp'));
  // copy x64 folder
  var copy_x64 = gulp.src('./rest/x64/**')
      .pipe(gulp.dest('./rest/gen/temp/x64'));
  var rename_war = gulp.src('./rest/downloads/*.war')
      .pipe(rename({basename: 'AssetManagerWebService'}))
      .pipe(gulp.dest('./rest/gen/temp/websvc'));
  // unzip tomcat instance
  var unzip_tomcat = gulp.src('./rest/apache-tomcat-8.0.18-windows-x64.zip', {base : '.'})
      .pipe(unzip())
      .pipe(gulp.dest('./rest/gen/temp'));
  // unzip deploy
  var unzip_deploy = gulp.src('./rest/*.zip', {base : '.'})
      .pipe(unzip())
      .pipe(gulp.dest('./rest/gen/temp'));
  return merge(copy_properties, copy_bat, copy_x64, rename_war, unzip_tomcat, unzip_deploy);
});

gulp.task('gen-ws-conf', ['gen-ws-base'], function () {
  console.log('Copy ws conf');
  // generate ws package
  return gulp.src('./rest/conf/**').pipe(gulp.dest('./rest/gen/temp/apache-tomcat-8.0.18/conf'));
});

gulp.task('gen-ws', ['gen-ws-conf'], function () {
  console.log('Generate am-browser-rest.zip from temp folder');
  // generate am-browser-rest.zip from temp folder
  return gulp.src('./rest/gen/temp/**')
      .pipe(zip('am-browser-rest.zip'))
      .pipe(gulp.dest('./rest/gen'));
});

gulp.task('register-odbc', function () {
  console.log('Register am browser odbc');
  return spawn('C:/Windows/System32/odbcconf.exe', ['CONFIGSYSDSN', 'SQL Server', 'DSN=' + config.DSN + '|Description=' + config.Description + '|SERVER=' + config.SERVER + '|Trusted_Connection=no|Database=' + config.Database], {stdio: 'inherit'});
});

gulpTasks(gulp, opts);
