var gulp       = require('gulp');
var gutil      = require('gulp-util');
var browserify = require('browserify');
var reactify   = require('reactify');
var sass       = require('gulp-sass');
var source     = require('vinyl-source-stream');
var watchify   = require('watchify');
var neat       = require('node-neat');
var connect    = require('gulp-connect');

var path = require('path');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var handlebars = require('gulp-compile-handlebars');

var notifier   = require('node-notifier');
var rsync      = require('rsyncwrapper').rsync;
var rename     = require('gulp-rename');

var window = window;

var src_paths = {
  sass: ['src/scss/**/*.scss'],
  style_images: ['src/scss/**/*.{jpg,gif,png,svg}'],
  main_js: './src/js/main.js',
  scripts: ['src/js/**/*.js', 'src/js/**/*.jsx'],
  html: ['src/index.html'],
  template: ['src/templates/**/[^_]*.hbs'],
  partials: ['src/templates/_*.hbs']
}

var dest_paths = {
  css: 'build/css',
  css_images: 'build/css/images',
  js: 'build/js',
  html: 'build/',
  template: 'build/templates/**/*.hbs'
}

gulp.task('templates', function() {
  gulp.src(src_paths.templates)
    // .pipe(handlebars())
    // .on('error', handleError)
    .pipe(gulp.dest(dest_paths.templates));
});

gulp.task('styles', function() {
  return gulp.src(src_paths.sass)
    .pipe(sass({
      includePaths: neat.includePaths
    }))
    .on('error', handleError)
    .pipe(gulp.dest(dest_paths.css))
    .pipe(connect.reload());
});

gulp.task('copy-images', function() {
  return gulp.src(['src/images/**/*.{jpg,gif,png,svg}'])
    .pipe(gulp.dest('build/images/'))
    .pipe(connect.reload());
});

// Use watchify to speed up browserify build

var bundler = watchify(browserify(src_paths.main_js, watchify.args));

bundler.transform(reactify);

gulp.task('scripts', bundle);
bundler.on('update', bundle);

function bundle() {
  return bundler.bundle()
    .on('error', handleError)
    .pipe(source('main.js'))
    .pipe(gulp.dest(dest_paths.js))
    .pipe(connect.reload());
}

gulp.task('watch', function() {
  gulp.watch(src_paths.sass, ['styles']);
  gulp.watch(src_paths.scripts, ['scripts']);
  gulp.watch(src_paths.html, ['copy']);
  gulp.watch(src_paths.partials, ['template']);
  gulp.watch(src_paths.template, ['template']);

});

gulp.task('server', function() {
  connect.server({
    root: 'build',
    livereload: true,
    port: 8888
  });
});

gulp.task('template', function () {
    var templateData = {
        liveMap: { 'liveMap': 'liveMap',
                    title: 'Map'
        },
        leaderBoard:{
          'leaderBoard': 'leaderBoard'
        }
    },
    options = {
        ignorePartials: true, //ignores the unknown footer2 partial in the handlebars template, defaults to false
        batch : ['./src/templates/partials',
                 './src/templates/map-live',
                 './src/templates/leaderboard'
                 ],
    }

    return gulp.src('src/templates/**/index.hbs')
      .pipe(handlebars(templateData, options))
      .on('error', handleError)
      .pipe(rename(function(path) {
          path.extname = '.html';
      }))
      .pipe(gulp.dest('build'));
});

gulp.task('deploy', ['build'], function() {
  rsync({
    ssh: true,
    src: './build',
    dest: 'deployer@trakit.io:/home/deployer/web-app',
    recursive: true,
    syncDest: true,
    args: ['--verbose']
  }, function(error, stdout, stderr, cmd) {
    gutil.log(stdout);
  });
});

gulp.task('build', ['styles', 'scripts', 'template']);

gulp.task('default', ['watch', 'styles', 'scripts', 'copy-images', 'template', 'server']);

// HELPER FUNCTIONS

function handleError(error) {
  var title = error.plugin + ' Error';
  var message = error.message;
  var fullMessage = title.toUpperCase() + ' ' + message;

  notifier.notify({
    title: title,
    message: message
  });

  gutil.log(gutil.colors.red(fullMessage));
  this.emit('end');
}