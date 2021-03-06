'use strict'

var browserSync = require('browser-sync').create()
var ghPages = require('gulp-gh-pages')
var gulp = require('gulp')
var header = require('gulp-header')
var karma = require('karma').server
var mocha = require('gulp-mocha')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')

// Test
// ----

var jsFilesToBeStyleChecked = [
  './src/*.js',
  './test/**/*.js',
  'gulpfile.js'
]

gulp.task('mocha', function() {
  return gulp.src(['test/server/*.js', 'test/server.js'])
    .pipe(mocha())
})

gulp.task('karma', ['mocha'], function(done) {
  karma.start({
    configFile: __dirname + '/test/karma.conf.js',
    singleRun: true
  }, done)
})

gulp.task('karma-travisci', ['mocha'], function(done) {
  karma.start({
    configFile: __dirname + '/test/karma-travisci.conf.js',
    singleRun: true
  }, done)
})

gulp.task('test', ['karma'])
gulp.task('test:travisci', ['karma-travisci'])

// Build
// -----

gulp.task('build', function() {
  var pkg = require('./package.json')
  var banner = [
    '/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' *',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @author <%= pkg.author %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

  gulp.src('src/index.js')
    .pipe(uglify())
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest('dist'))
    .pipe(rename({
      basename: 'logdown'
    }))
    .pipe(gulp.dest('./example/lib'))
})

// Development
// -----------

gulp.task('dev', ['build'], function() {
  gulp.watch('example/**/*.*').on('change', browserSync.reload);
  gulp.watch('src/**/*.*', ['build'])

  browserSync.init({
    port: 3636,
    server: {baseDir: './'},
    startPath: '/example'
  })
})

// Deploy
// ------

gulp.task('deploy:example', ['build'], function() {
  return gulp.src('./example/**')
    .pipe(ghPages())
})
