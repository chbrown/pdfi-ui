var http = require('http-enhanced');
var logger = require('loge');
var visible = require('visible');

var escaper = new visible.Escaper({
  escapeSlash: true,
  // literalVisibles: false,
  // useEscapes: true,
  literalEOL: true,
  literalSpace: true,
});

http.ServerResponse.prototype.json = function(value) {
  this.setHeader('Content-Type', 'application/json');
  try {
    var simplified_value = escaper.simplify(value);
    var data = JSON.stringify(simplified_value);
    this.end(data);
  } catch (error) {
    logger.error('Encountered error stringifying JSON: %s', error.stack);
    this.die(error);
  }
  return this;
};

http.ServerResponse.prototype.die = function(error) {
  if (this.statusCode == 200) {
    this.statusCode = 500;
  }
  var message = error ? error.stack : 'Failure';
  return this.text(message);
};

var controllers = require('./controllers');

var server = module.exports = http.createServer(function(req, res) {
  controllers(req, res);
})
.on('listening', function() {
  var address = this.address();
  logger.info('server listening on http://%s:%d', address.address, address.port);
});
