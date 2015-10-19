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
  new webpack.optimize.OccurenceOrderPlugin(true),
].concat(production ? [
  // production-only
  // TODO: get this working again (it reduces the size from 3.93 MB to 1.73 MB)
  // new webpack.optimize.UglifyJsPlugin({
  //   compress: {
  //     keep_fnames: true, // hack; allows @checkArguments to work
  //   }
  // }),
] : [
  // development-only
  new webpack.NoErrorsPlugin(),
  new webpack.HotModuleReplacementPlugin(),
]);


module.exports = {
  // devtool: 'source-map', // 'eval'
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
      '.jsx',
      // .ts should come after .js so that we don't try to compile external modules
      '.ts',
      '.tsx',
      '.json', // is this necessary? I saw somewhere it was one of the default extensions
      '.less',
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
    ]
  },
  node: {
    console: true,
    process: true,
  }
};
