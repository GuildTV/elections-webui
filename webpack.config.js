const config = {
  // context: __dirname + '/src', // `__dirname` is root of project and `src` is source
  entry: {
    app: './js/app.js',
  },
  output: {
    path: __dirname + '/public',
    filename: "./app.js"
  },
  module: {
    rules: [
      {
        test: /\.(sass|scss|css)$/, //Check for sass or scss file names
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.js$/, //Check for all js files
        loader: 'babel-loader',
        query: {
          presets: [ "env", "react" ]
        }
      },
      { 
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.woff2$|\.ttf$|\.eot$|\.otf$|\.wav$|\.mp3$/,
        loader: "file"
      },
    ]
  },
  devServer: {
    contentBase: __dirname + '/public',
    proxy: {
      "/api": "http://localhost:8088",
      "/socket.io": { target: "ws://localhost:8088", ws: true }
    },
  },
  resolve: {
    modules: [
      "node_modules",
      "js",
    ],
  },

  devtool: "eval-source-map", // Default development sourcemap
};

// Check if build is running in production mode, then change the sourcemap type
if (process.env.NODE_ENV === "production") {
  config.devtool = "source-map";
}

module.exports = config;