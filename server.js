import express from 'express';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import { webui_port } from "./config"

// Serve the Relay app
var compiler = webpack({
  entry: path.resolve(__dirname, 'js', 'app.js'),
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        loader: 'babel',
        test: /\.js$/,
      }
    ]
  },
  output: {filename: 'app.js', path: '/'}
});

var app = new WebpackDevServer(compiler, {
  contentBase: '/public/',
  publicPath: '/js/',
  stats: {colors: true}
});

// Serve static resources
app.use('/', express.static(path.resolve(__dirname, 'public')));
app.listen(webui_port, () => {
  console.log(`App is now running on http://localhost:${webui_port}`);
});
