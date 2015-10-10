var path = require('path');
var webpack = require('webpack');

var production = process.env.NODE_ENV == 'production';

var entry = production ? [
  './app',
] : [
  'webpack-hot-middleware/client',
  './app',
];

var plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin()
].concat(production ? [
  new webpack.optimize.UglifyJsPlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
] : []);


module.exports = {
  devtool: 'source-map', // 'eval'
  entry: entry,
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/'
  },
  plugins: plugins,
  resolve: {
    extensions: [
      '',
      // '.json',
      '.js',
      // .ts should come after .js so that we don't try to compile external modules
      '.ts',
      '.jsx',
      '.tsx',
      '.less',
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
        loaders: ['ts-loader'],
        include: __dirname,
        exclude: /node_modules|~/,
      },
      {
        test: /\.js$/,
        loaders: ['ng-annotate-loader', 'babel-loader'],
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
    ]
  },
  node: {
    console: true,
    process: true,
  }
};
