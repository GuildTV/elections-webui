var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './js/app.js',
  output: {
    path: __dirname,
    filename: 'static/app.js',
    publicPath: "static"
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react', 'stage-0']
        }
      },
      { test: /\.less$/, loader: "style!css!less" },
      { test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.woff2$|\.ttf$|\.eot$|\.otf$|\.wav$|\.mp3$/, loader: "file" }
    ]
  },
  resolve: {
    root: path.resolve('./js'),
    extensions: ['', '.js']
  },
  plugins: []
};
