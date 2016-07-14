import yargs from 'yargs';
const argv = yargs.argv;
import gulp from 'gulp';
import path from 'path';
//import nodemon from 'gulp-nodemon';
import grommetToolbox, {getOptions} from 'grommet-toolbox';
import git from 'gulp-git';
import del from 'del';
import mkdirp from 'mkdirp';
import child_process from 'child_process';
const spawn = child_process.spawn;
import zip from 'gulp-zip';
import unzip from 'gulp-unzip';
import clean from 'gulp-clean';
import merge from 'merge-stream';
import download from 'gulp-download';
import xml2json from 'gulp-xml2json';
import rename from 'gulp-rename';
import webpack from 'webpack';
import dateformat from 'dateformat';
import jeditor from 'gulp-json-editor';
import version from './version.json';
import config from './rest/conf/config.json';
import amb_config from './app/config';

const opts = {
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
    },
    module: {
      loaders: [
        {
          test: /\.(js|jsx)?$/,
          loader: 'babel-loader',
          include: /node_modules\/react-gravatar/
        },
        {
          test: /\.(js|jsx)?$/,
          loader: 'babel-loader',
          include: /react-gravatar/
        }
      ]
    }
  },
  devServerHost: 'localhost',
  devServerPort: 8001,
  // The 8010 port number needs to align with hostName in index.js
  devServerProxy: {
    '/*': `http://${amb_config.node_server=='0.0.0.0'?'localhost':amb_config.node_server}:${amb_config.node_port}`
  },
  websocketHost: 'localhost:8010',
  alias: {
    'grommet-index/scss': path.resolve(__dirname, '../grommet-index/src/scss'),
    'grommet-index': path.resolve(__dirname, '../grommet-index/src/js'),
    'grommet/scss': path.resolve(__dirname, '../grommet/src/scss'),
    'grommet': path.resolve(__dirname, '../grommet/src/js')
  },
  devPreprocess: ['set-webpack-alias'],
  // disable scsslint temporarily
  scsslint: false
};

var express;
var timestamp = dateformat(new Date(), 'yyyymmddHHMM');

gulp.task('set-webpack-alias', () => {
  if (opts.alias && argv.useAlias) {
    console.log('Using local alias for development.');
    opts.webpack.resolve.alias = opts.alias;
  }
});

gulp.task('release:createTmp', (done) => {
  del.sync(['./tmp']);
  mkdirp('./tmp', (err) => {
    if (err) {
      throw err;
    }
    done();
  });
});

gulp.task('release:heroku', ['dist', 'release:createTmp'], (done) => {
  if (process.env.CI) {
    git.clone('https://' + process.env.GH_TOKEN + '@github.com/grommet/grommet-ferret.git',
      {
        cwd: './tmp/'
      },
      (err) => {
        if (err) {
          throw err;
        }

        process.chdir('./tmp/grommet-ferret');
        git.checkout('heroku', (err) => {
          if (err) {
            throw err;
          }

          gulp.src([
            '../../**',
            '!../../.gitignore',
            '!../../.travis.yml'])
            .pipe(gulp.dest('./')).on('end', () => {
              git.status({
                args: '--porcelain'
              }, (err, stdout) => {
                if (err) {
                  throw err;
                }

              if (stdout && stdout !== '') {
                gulp.src('./')
                  .pipe(git.add({
                    args: '--all'
                  }))
                  .pipe(git.commit('Heroku dev version update.')).on('end', () => {
                    git.push('origin', 'heroku', { quiet: true }, (err) => {
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
  var unzip_node = gulp.src('./build/node/node-v4.4.4-x64.zip', {base : '.'})
      .pipe(unzip())
      .pipe(gulp.dest('./gen/temp/node'));
  // copy nssm for register service
  var unzip_node = gulp.src('./build/node/nssm-2.24.zip', {base : '.'})
      .pipe(unzip())
      .pipe(gulp.dest('./gen/temp/node'));
  var copy_cmd = gulp.src('./build/*.bat')
      .pipe(gulp.dest('./gen/temp'));
  // copy files to gen temp
  var copy_file = gulp.src(['./app/**', './demo/**', './dist/**', './node_modules/**', './am-browser-config.properties.default'], {base : '.'})
      .pipe(gulp.dest('./gen/temp'));
  var gen_timestamp = gulp.src('./version.json', {base : '.'})
      .pipe(jeditor({'timestamp': version.stage ? timestamp : ''}))
      .pipe(gulp.dest('./gen/temp'));
  return merge(unzip_node, copy_cmd, copy_file, gen_timestamp);
});

gulp.task('gen', ['copy-temp'], function () {
  console.log('Generate am-browser.zip from temp folder');
  //var timestamp = Math.floor(new Date().getTime()/1000);
  var build = version.stage ? '-' + timestamp + '_' + version.stage : '';
  var name = 'am-browser' + '-' + version.number + build + '.zip';
  // generate am-browser.zip from temp folder
  return gulp.src('./gen/temp/**')
      .pipe(zip(name))
      .pipe(gulp.dest('./gen'));
});

gulp.task('clean-download-ws', function () {
  console.log('Clean download ws folder');
  // clean download folder
  return gulp.src('./rest/downloads').pipe(clean({force: true}));
});

gulp.task('download-metadata-xml', ['clean-download-ws'], function () {
  console.log('Download ws/binary metadata xml');
  // download ws metadata xml
  var download_ws_metadata = download(config.Nexus + 'com/hp/am/java/ac.ws/MAIN-SNAPSHOT/maven-metadata.xml')
	  .pipe(gulp.dest('./rest/downloads/ws'));
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
  return merge(download_ws_metadata, download_x64_metadata, download_openssl_metadata, download_openldap_metadata, download_libcurl_metadata);
});

gulp.task('parse-metadata-xml', ['download-metadata-xml'], function () {
  console.log('Parse ws/binary metadata xml to json');
  // parse ws metadata xml
  var parse_ws = gulp.src('./rest/downloads/ws/maven-metadata.xml')
      .pipe(xml2json())
	  .pipe(rename({extname: '.json'}))
	  .pipe(gulp.dest('./rest/downloads/ws/json'));
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
  return merge(parse_ws, parse_x64, parse_openssl, parse_openldap, parse_libcurl);
});

gulp.task('download-ws', ['parse-metadata-xml'], function () {
  console.log('Download ws and x64 binary');
  var ws_json = require('./rest/downloads/ws/json/maven-metadata.json');
  var ws_version_info = ws_json.metadata.versioning[0].snapshot[0].timestamp + '-' + ws_json.metadata.versioning[0].snapshot[0].buildNumber;
  if (config.Release_WS) {
	  ws_version_info = config.Release_WS;
  }
  var ws_url = config.Nexus + 'com/hp/am/java/ac.ws/MAIN-SNAPSHOT/ac.ws-MAIN-'
      + ws_version_info + '.war';
  console.log('Ws url is : ' + ws_url);
  var x64_json = require('./rest/downloads/x64/json/maven-metadata.json');
  var x64_version_info = "";
  var x64_url = "";
  var snapshotVersion = x64_json.metadata.versioning[0].snapshotVersions[0].snapshotVersion;
  for (var i = 0; i < snapshotVersion.length; i++) {
	  if (snapshotVersion[i].classifier && snapshotVersion[i].classifier[0] == config.Classifier) {
	      x64_version_info = snapshotVersion[i].value[0] + '-' + config.Classifier + '.' + snapshotVersion[i].extension[0];
	  }
  }
  if (config.Release_CPP) {
	  x64_version_info = 'MAIN-' + config.Release_CPP + '-' + config.Classifier + '.zip';
  }
  x64_url = config.Nexus + 'com/hp/am/cpp/binary/MAIN-SNAPSHOT/binary-' +　x64_version_info;
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
  var copy_properties= gulp.src('./rest/conf/package.properties.default')
      .pipe(gulp.dest('./rest/gen/temp/websvc'));
  var copy_bat = gulp.src('./rest/bin/*.bat')
      .pipe(gulp.dest('./rest/gen/temp/bin'));
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
  var unzip_tomcat = gulp.src('./rest/lib/apache-tomcat-' + config.Tomcat + '-windows-x64.zip', {base : '.'})
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
  var copy_conf = gulp.src('./rest/conf/Catalina/**')
      .pipe(gulp.dest('./rest/gen/temp/apache-tomcat-' + config.Tomcat + '/conf/Catalina'));
  var copy_server = gulp.src('./rest/conf/server.xml')
      .pipe(gulp.dest('./rest/gen/temp/apache-tomcat-' + config.Tomcat + '/conf'));
  var copy_product =  gulp.src('./rest/product.str')
      .pipe(gulp.dest('./rest/gen/temp'));
  // unzip ant instance
  var unzip_ant = gulp.src('./rest/lib/apache-ant-1.8.2.zip', {base : '.'})
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
  return merge(copy_conf, copy_server, copy_product, unzip_ant, copy_dll, copy_jni, copy_res, copy_libcurl, copy_openldap, copy_openssl);
});

gulp.task('gen-ws', ['gen-ws-conf'], function () {
  console.log('Generate am-browser-rest.zip from temp folder');
  // generate am-browser-rest.zip from temp folder
  //var timestamp = Math.floor(new Date().getTime()/1000);
  var build = version.stage ? '-' + timestamp + '_' + version.stage : '';
  var name = 'am-browser-rest' + '-' + version.number + build + '.zip';
  return gulp.src('./rest/gen/temp/**')
      .pipe(zip(name))
      .pipe(gulp.dest('./rest/gen'));
});

gulp.task('register-odbc', function () {
  console.log('Register am browser odbc');
  return spawn('C:/Windows/System32/odbcconf.exe', ['CONFIGSYSDSN', 'SQL Server', 'DSN=' + config.DSN + '|Description=' + config.Description + '|SERVER=' + config.SERVER + '|Trusted_Connection=no|Database=' + config.Database], {stdio: 'inherit'});
});

grommetToolbox(gulp, opts);
