// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('sync', function() {
  gulp.src('.');
});

gulp.task('dev', function() {
  nodemon({
    script: 'server.js'
  });
});
