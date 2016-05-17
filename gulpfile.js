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
  devPreprocess: ['set-webpack-alias']
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
  gulp.src('./demo/**').pipe(gulp.dest('./'));
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

gulp.task('copy-temp', ['copy-demo', 'dist', 'clean-gen'], function () {
  console.log('Copy all neccessary files into the gen temp folder');
  // copy node installation folder and cmd to gen temp
  var unzip_node = gulp.src('./build/node-v4.4.4-x64.zip', {base : '.'})
      .pipe(unzip())
      .pipe(gulp.dest('./gen/temp'));
  var copy_cmd = gulp.src('./build/startup.cmd')
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

gulpTasks(gulp, opts);
