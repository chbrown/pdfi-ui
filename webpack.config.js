var path = require('path');
var webpack = require('webpack');

var production = process.env.NODE_ENV == 'production';

module.exports = {
  entry: [
    './app',
  ].concat(production ? [] : [
    'webpack-hot-middleware/client',
  ]),
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/',
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(true),
  ].concat(production ? [
    // production-only
    new webpack.optimize.UglifyJsPlugin(),
  ] : [
    // development-only
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ]),
  resolve: {
    extensions: [
      '',
      '.js',
      '.jsx',
      '.json',
    ],
  },
  resolveLoader: {
    // otherwise, webpack will look for json-loader relative to the modules
    // themselves, which will break on `npm link`'ed modules
    root: path.join(__dirname, 'node_modules'),
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.json$/,
        loaders: ['json-loader'],
      },
    ],
  },
};
