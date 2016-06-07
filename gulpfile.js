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
  var download_ws_metadata = download(config.Nexus + 'com/hp/am/java/ac.ws/MAIN-SNAPSHOT/maven-metadata.xml')
	  .pipe(gulp.dest('./rest/downloads/ws'));
  return download_ws_metadata;
});

gulp.task('download-binary-metadata-xml', function () {
  console.log('Download binary metadata xml');
  // download x64 binary metadata xml
  var download_x64_metadata = download(config.Nexus + 'com/hp/am/cpp/binary/MAIN-SNAPSHOT/maven-metadata.xml')
	  .pipe(gulp.dest('./rest/downloads/x64'));
  // download openssl metadata xml
  var download_openssl_metadata = download(config.Nexus3rd + 'com/hp/am/3rd/openssl/maven-metadata.xml')
	  .pipe(gulp.dest('./rest/downloads/openssl'));
  // download openldap metadata xml
  var download_openldap_metadata = download(config.Nexus3rd + 'com/hp/am/3rd/openldap/maven-metadata.xml')
	  .pipe(gulp.dest('./rest/downloads/openldap'));
  // download libcurl metadata xml
  var download_libcurl_metadata = download(config.Nexus3rd + 'com/hp/am/3rd/libcurl/maven-metadata.xml')
	  .pipe(gulp.dest('./rest/downloads/libcurl'));
  return merge(download_x64_metadata, download_openssl_metadata, download_openldap_metadata, download_libcurl_metadata);
});

gulp.task('parse-ws-metadata-xml', ['download-ws-metadata-xml'], function () {
  console.log('Parse ws metadata xml to json');
  // parse ws metadata xml
  var parse_ws = gulp.src('./rest/downloads/ws/maven-metadata.xml')
      .pipe(xml2json())
	  .pipe(rename({extname: '.json'}))
	  .pipe(gulp.dest('./rest/downloads/ws/json'));
  return parse_ws;
});

gulp.task('parse-binary-metadata-xml', ['download-binary-metadata-xml'], function () {
  console.log('Parse binary metadata xml to json');
  // parse x64 binary metadata xml
  var parse_x64 = gulp.src('./rest/downloads/x64/maven-metadata.xml')
      .pipe(xml2json())
	  .pipe(rename({extname: '.json'}))
	  .pipe(gulp.dest('./rest/downloads/x64/json'));
  // parse openssl metadata xml
  var parse_openssl = gulp.src('./rest/downloads/openssl/maven-metadata.xml')
      .pipe(xml2json())
	  .pipe(rename({extname: '.json'}))
	  .pipe(gulp.dest('./rest/downloads/openssl/json'));
  // parse openldap metadata xml
  var parse_openldap = gulp.src('./rest/downloads/openldap/maven-metadata.xml')
      .pipe(xml2json())
	  .pipe(rename({extname: '.json'}))
	  .pipe(gulp.dest('./rest/downloads/openldap/json'));
  // parse libcurl metadata xml
  var parse_libcurl = gulp.src('./rest/downloads/libcurl/maven-metadata.xml')
      .pipe(xml2json())
	  .pipe(rename({extname: '.json'}))
	  .pipe(gulp.dest('./rest/downloads/libcurl/json'));
  return merge(parse_x64, parse_openssl, parse_openldap, parse_libcurl);
});

gulp.task('download-ws', ['parse-ws-metadata-xml', 'parse-binary-metadata-xml'], function () {
  console.log('Download ws and x64 binary');
  var ws_json = require('./rest/downloads/ws/json/maven-metadata.json');
  var ws_url = config.Nexus + 'com/hp/am/java/ac.ws/MAIN-SNAPSHOT/ac.ws-MAIN-'
      + ws_json.metadata.versioning[0].snapshot[0].timestamp + '-' + ws_json.metadata.versioning[0].snapshot[0].buildNumber + '.war';
  console.log('Ws url is : ' + ws_url);
  var x64_json = require('./rest/downloads/x64/json/maven-metadata.json');
  var x64_url = "";
  var snapshotVersion = x64_json.metadata.versioning[0].snapshotVersions[0].snapshotVersion;
  for (var i = 0; i < snapshotVersion.length; i++) {
	  if (snapshotVersion[i].classifier && snapshotVersion[i].classifier[0] == config.Classifier) {
	      x64_url = config.Nexus + 'com/hp/am/cpp/binary/MAIN-SNAPSHOT/binary-'
              + snapshotVersion[i].value[0] + '-' + config.Classifier + '.' + snapshotVersion[i].extension[0];
	  }
  }
  console.log('x64 binary url is : ' + x64_url);
  var openssl_json = require('./rest/downloads/openssl/json/maven-metadata.json');
  var openssl_url = config.Nexus3rd + 'com/hp/am/3rd/openssl/'
      + openssl_json.metadata.versioning[0].release[0] + '/openssl-' + openssl_json.metadata.versioning[0].release[0] + '.zip';
  console.log('openssl url is : ' + openssl_url);
  var openldap_json = require('./rest/downloads/openldap/json/maven-metadata.json');
  var openldap_url = config.Nexus3rd + 'com/hp/am/3rd/openldap/'
      + openldap_json.metadata.versioning[0].release[0] + '/openldap-' + openldap_json.metadata.versioning[0].release[0] + '.zip';
  console.log('openldap url is : ' + openldap_url);
  var libcurl_json = require('./rest/downloads/libcurl/json/maven-metadata.json');
  var libcurl_url = config.Nexus3rd + 'com/hp/am/3rd/libcurl/'
      + libcurl_json.metadata.versioning[0].release[0] + '/libcurl-' + libcurl_json.metadata.versioning[0].release[0] + '.zip';
  console.log('libcurl url is : ' + libcurl_url);
  // download ws
  var download_ws = download(ws_url)
	  .pipe(gulp.dest('./rest/downloads'));
  // download x64 binary
  var download_x64 = download(x64_url)
	  .pipe(gulp.dest('./rest/downloads'));
  // download openssl
  var download_openssl = download(openssl_url)
	  .pipe(gulp.dest('./rest/downloads'));
  // download openldap
  var download_openldap = download(openldap_url)
	  .pipe(gulp.dest('./rest/downloads'));
  // download libcurl
  var download_libcurl = download(libcurl_url)
	  .pipe(gulp.dest('./rest/downloads'));
  return merge(download_ws, download_x64, download_openssl, download_openldap, download_libcurl);
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
  // copy deploy folder
  var copy_deploy = gulp.src('./rest/deploy/**')
      .pipe(gulp.dest('./rest/gen/temp/deploy'));
  var rename_war = gulp.src('./rest/downloads/*.war')
      .pipe(rename({basename: 'AssetManagerWebService'}))
      .pipe(gulp.dest('./rest/gen/temp/websvc'));
  // unzip tomcat instance
  var unzip_tomcat = gulp.src('./rest/apache-tomcat-8.0.18-windows-x64.zip', {base : '.'})
      .pipe(unzip())
      .pipe(gulp.dest('./rest/gen/temp'));
  // unzip download zip
  var unzip_download = gulp.src('./rest/downloads/*.zip', {base : '.'})
      .pipe(unzip())
	  .pipe(gulp.dest('./rest/downloads/temp'));
  return merge(copy_properties, copy_bat, copy_x64, copy_deploy, rename_war, unzip_tomcat, unzip_download);
});

gulp.task('gen-ws-conf', ['gen-ws-base'], function () {
  console.log('Copy ws conf');
  // generate ws package
  var copy_conf = gulp.src('./rest/conf/**')
      .pipe(gulp.dest('./rest/gen/temp/apache-tomcat-8.0.18/conf'));
  // unzip ant instance
  var unzip_ant = gulp.src('./rest/apache-ant-1.8.2.zip', {base : '.'})
      .pipe(unzip())
      .pipe(gulp.dest('./rest/gen/temp/deploy'));
  // copy x64 files
  var copy_dll = gulp.src('./rest/downloads/temp/en/aamapi96_X64.dll')
      .pipe(rename({basename: 'aamapi96'}))
	  .pipe(gulp.dest('./rest/gen/temp/x64'));
  var copy_jni = gulp.src('./rest/downloads/temp/en/amjni96_X64.dll')
      .pipe(rename({basename: 'amjni96'}))
	  .pipe(gulp.dest('./rest/gen/temp/x64'));
  var copy_res = gulp.src('./rest/downloads/temp/en/aamapi96_X64.res')
      .pipe(rename({basename: 'aamapi96'}))
	  .pipe(gulp.dest('./rest/gen/temp/x64'));
  var copy_libcurl= gulp.src('./rest/downloads/temp/libcurl/7.21.6/X64/lib/libcurl64.dll')
	  .pipe(gulp.dest('./rest/gen/temp/x64'));
  var copy_openldap= gulp.src('./rest/downloads/temp/openldap/openldap-2.4.44/lib/win/X64/oldap.dll')
	  .pipe(gulp.dest('./rest/gen/temp/x64'));
  var copy_openssl= gulp.src(['./rest/downloads/temp/openssl/openssl-1.0.2h/lib/win/X64/libeay64-10.dll', './rest/downloads/temp/openssl/openssl-1.0.2h/lib/win/X64/ssleay64-10.dll'])
	  .pipe(gulp.dest('./rest/gen/temp/x64'));
  return merge(copy_conf, unzip_ant, copy_dll, copy_jni, copy_res, copy_libcurl, copy_openldap, copy_openssl);
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
