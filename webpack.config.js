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
      }
    ]
  },
};
