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

app.use('/img', express.static('img'));

app.use('/files', express.static('/Users/chbrown/pdfs'));
/**
nginx's `autoindex_format json;` setting renders an array of files like:
[
  { "name":"subdir", "type":"directory", "mtime":"Fri, 09 May 2015 21:57:50 GMT" },
  { "name":"Article_B.pdf", "type":"file", "mtime":"Thu, 12 Apr 2015 12:17:18 GMT", "size":239182 }
]
But we only need the "name" fields.
*/
function directoryRenderer(path) {
  return function(req, res) {
    fs.readdir(path, function(err, filenames) {
      if (err) res.render('error', {error: err});
      var files = filenames.map(function(filename) {
        return {name: filename};
      });

      res.json(files);
    });
  };
}
app.get('/files', directoryRenderer('/Users/chbrown/pdfs'));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(process.env.PORT, 'localhost', function(err) {
  if (err) {
    return console.log(err);
  }
  var address = this.address();
  console.log('Listening at %s:%s', address.address, address.port);
});
