var http = require('http-enhanced');
var logger = require('loge');

function replacer(key, value) {
  // a buffer isn't very useful in JSON, so render it as a string instead.
  // logger.info('key, value', key, value, Buffer.isBuffer(value));
  // huh. apparently Buffer#toJSON() gets called before we get a hold of the
  // Buffer.
  // if (Buffer.isBuffer(value)) {
  //   return value.toString('utf8');
  // }
  // TODO: recurse the object to be stringified _before_ calling JSON.stringify
  if (value && value.type === 'Buffer') {
    return new Buffer(value.data).toString('utf8');
  }
  return value;
}

function stringify(value) {
  try {
    return JSON.stringify(value, replacer);
  } catch (error) {
    logger.error('Encountered error stringifying JSON: %s', error.stack);
    return JSON.stringify({error: error.toString()});
  }
}

http.ServerResponse.prototype.json = function(value) {
  this.setHeader('Content-Type', 'application/json');
  this.end(stringify(value));
  return this;
};

var controllers = require('./controllers');

var server = module.exports = http.createServer(function(req, res) {
  logger.debug('%s %s', req.method, req.url);
  controllers(req, res);
})
.on('listening', function() {
  var address = this.address();
  logger.info('server listening on http://%s:%d', address.address, address.port);
});
