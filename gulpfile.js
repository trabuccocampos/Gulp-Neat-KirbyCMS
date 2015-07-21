'use strict';
// generated on 2014-07-14 using generator-gulp-webapp 0.1.0
// modified by AAT—C July 21 2015

var gulp = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')(),
    sass = require('gulp-sass'),
    neat = require('node-neat').includePaths,
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    gutil = require('gulp-util'),
    filter = require('gulp-filter'),
    plumber = require('gulp-plumber'),
    php = require('gulp-connect-php'),
    concat = require('gulp-concat');

var paths = {
  scss: './app/assets/styles/sass/*.scss',
  js: './app/assets/scripts/*.js',
  // images: './source/assets/images/*',
  // fonts: './source/assets/fonts/*'
};

gulp.task('styles', function(){
    return gulp.src(paths.scss)
    .pipe(plumber(function(error) {
            gutil.log(gutil.colors.red(error.message));
            gutil.beep();
            this.emit('end');
    }))
    .pipe(sass({
      includePaths: require('node-neat').includePaths.concat(neat)
    }))
    .pipe($.autoprefixer('last 1 version'))
    .pipe(filter('**/*.css'))
    .pipe($.csso())
    .pipe(gulp.dest('./app/assets/styles/'))
    .pipe(reload({stream:true}))
    .pipe($.size());
});

gulp.task('scripts', function(){
    return gulp.src(paths.js)
    .pipe($.jshint())
    .pipe($.jshint.reporter(require('jshint-stylish')))
    .pipe(gulp.dest('./app/assets/scripts'))
    .pipe(reload({stream:true, once: true}))
    .pipe($.size());
});

gulp.task('scripts-build', function(){
    return gulp.src('./app/assets/scripts/vendor/*.js')
    .pipe($.uglify())
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./app/assets/scripts'))
    .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src('app/assets/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 8,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/assets/images'))
        .pipe($.size());
});


gulp.task('fonts', function () {
    return gulp.src(mainBowerFiles())
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/assets/fonts'))
        .pipe($.size());
});



gulp.task('content', ['styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src('app/**/*.php')
        .pipe($.useref.assets({searchPath: '{.tmp,app}'}))
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});


gulp.task('build', ['styles', 'scripts', 'images', 'fonts']);

gulp.task('default',  function () {
    // gulp.start('build');
    console.log('Please choose build, watch, or serve');
});

gulp.task('php', function() {
    php.server({ base: 'app', port: 8010, keepalive: true});
});

gulp.task('serve', ['php','styles', 'scripts'], function () {
    browserSync({
        proxy: '127.0.0.1:8010',
        port: 8080,
        open: true,
        notify: false
    });
});


// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/assets/styles/**/*.scss')
        .pipe(wiredep({
            directory: '../bower_components'
        }))
        .pipe(gulp.dest('app/assets/styles'));

    gulp.src('app/**/*.php')
        .pipe(wiredep({
            directory: '../bower_components'
        }))
        .pipe(gulp.dest('app'));
});

// gulp.task('watch', ['connect', 'serve'], function () {
gulp.task('watch', ['serve'], function () {

    // watch for changes

    gulp.watch([
        'app/**/*.php',
        'app/assets/images/**/*',
        // 'app/content/**/*'
    ], reload);

    gulp.watch('app/assets/styles/**/*.scss', ['styles']);
    gulp.watch('app/assets/scripts/**/*.js', ['scripts']);
    gulp.watch('app/assets/images/**/*', ['images']);
    // gulp.watch('app/content/**/*', ['content']);
    gulp.watch('bower.json', ['wiredep']);
});
