var path = require('path');
var webpack = require('webpack');

var production = process.env.NODE_ENV == 'production';

// TODO: get this working again (it reduces the size from 3.93 MB to 1.73 MB)
// new webpack.optimize.UglifyJsPlugin({
//   compress: {
//     keep_fnames: true, // hack; allows @checkArguments to work
//   }
// }),

module.exports = {
  entry: [
    './app',
  ].concat(production ? [] : ['webpack-hot-middleware/client']),
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/',
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(true),
  ].concat(production ? [
    // production-only
  ] : [
    // development-only
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ]),
  resolve: {
    extensions: [
      '',
      '.ts',
      '.tsx',
      // .ts may need to come after .js so that we don't try to compile external modules
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
        test: /\.tsx?$/,
        loaders: ['babel-loader', 'ts-loader'],
        include: __dirname,
        exclude: /node_modules|~/,
      },
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        include: __dirname,
        exclude: /node_modules/,
      },
      {
        test: /\.jsx$/,
        loaders: ['babel-loader'],
        include: __dirname,
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
  node: {
    console: true,
    process: true,
  },
};
