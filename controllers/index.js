var path = require('path');
var send = require('send');
var Router = require('regex-router');

var R = new Router(function(req, res) {
  res.status(404).die('No resource at: ' + req.url);
});

R.get(/^\/($|pdfs)/, function(req, res, m) {
  req.url = '/static/ng/layout.html';
  R.route(req, res);
});

R.any(/^\/(static|ng)\/([^?]+)(\?|$)/, function(req, res, m) {
  var root = path.join(__dirname, '..', m[1]);
  send(req, m[2], {root: root})
    .on('error', function(err) {
      res.status(err.status || 500).die('send error: ' + err.message);
    })
    .pipe(res);
});

R.any(/^\/files/, require('./files'));

module.exports = R.route.bind(R);
