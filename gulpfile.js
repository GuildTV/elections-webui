// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var util = require('gulp-util');
var less = require('gulp-less');

// webpack bits
var webpack = require("webpack");
var webpackConfig = require("./webpack.config.js");

// Define base folders
var dest = 'static/';

// Compile CSS from less files
gulp.task('less', function() {
  return gulp.src('less/app.less')
    .pipe(less())
    .pipe(gulp.dest(dest))
    .on('error', util.log);
});

//production webpack build
gulp.task("webpack:build", function(callback) {
  // modify some webpack config options

  var myConfig = Object.create(webpackConfig);
  myConfig.plugins = myConfig.plugins.concat(
    new webpack.DefinePlugin({
      "process.env": {
        // This has effect on the react lib size
        "NODE_ENV": JSON.stringify("production")
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  );

  // run webpack
  webpack(myConfig, function(err, stats) {
    if(err) throw new util.PluginError("webpack:build", err);
    util.log("[webpack:build]", stats.toString({
      colors: true
    }));
    callback();
  });
});

//webpack dev build
gulp.task("webpack:dev", function(callback) {
  var WebpackDevServer = require("webpack-dev-server");
  
  // modify some webpack config options
  var myConfig = Object.create(webpackConfig);
  myConfig.devtool = "eval";
  myConfig.debug = true;

  // Start a webpack-dev-server
  new WebpackDevServer(webpack(myConfig), {
    // noInfo: true,
    stats: {
      colors: true
    }
  }).listen(8087, "0.0.0.0", function(err) {
    if(err) throw new util.PluginError("webpack-dev-server", err);
    util.log("[webpack-dev-server]", "http://localhost:8087/webpack-dev-server/index.html");
  });
});

// Watch Files For Changes
gulp.task('default', ['webpack:dev', 'less'], function() {
  gulp.watch('less/*.less', ['less']);
  gulp.watch('less/*/*.less', ['less']);
});

// Default Task
gulp.task('build', ['less', "webpack:build"]);

gulp.task('watch', ['less'], function() {
  gulp.watch('less/*.less', ['less']);
  gulp.watch('less/*/*.less', ['less']);
});