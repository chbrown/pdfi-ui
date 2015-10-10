var path = require('path');
var express = require('express');
// var serveIndex = require('serve-index')
var fs = require('fs');
var webpack = require('webpack');
var config = require('./webpack.config');

var app = express();
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.use('/templates', express.static('templates'));

app.use('/files', express.static('/Users/chbrown/pdfs'));
function directoryRenderer(path) {
  return function(req, res) {
    fs.readdir(path, function(err, files) {
      if (err) res.render('error', {error: err});
      // res.json(files);
      res.send(files.join('\n'));
    });
  };
}
app.get('/files', directoryRenderer('/Users/chbrown/pdfs'));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(process.env.PORT, 'localhost', function (err) {
  if (err) {
    return console.log(err);
  }
  var address = this.address();
  console.log('Listening at %s:%s', address.address, address.port);
});
