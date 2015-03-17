var http = require('http-enhanced');
var logger = require('loge');

function simplify(value, seen, depth) {
  if (value === undefined) {
    return value;
  }
  else if (value === null) {
    return value;
  }
  else if (Array.isArray(value)) {
    if (seen.indexOf(value) > -1) {
      return '[Circular Array]';
    }
    if (depth > 5) {
      return '...';
    }
    var array = value.map(function(child) {
      return simplify(child, seen, depth + 1);
    });
    seen.push(array);
    return array;
  }
  else if (Buffer.isBuffer(value)) {
    return value.toString('utf8');
  }
  else if (typeof value === 'object') {
    if (seen.indexOf(value) > -1) {
      return '[Circular Object]';
    }
    if (depth > 5) {
      return '...';
    }
    if (typeof value.toJSON === 'function') {
      value = value.toJSON();
    }
    var object = {};
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        object[key] = simplify(value[key], seen, depth + 1);
      }
    }
    seen.push(object);
    return object;
  }
  // catch-all
  return value;
}

http.ServerResponse.prototype.json = function(value) {
  this.setHeader('Content-Type', 'application/json');
  try {
    var simplified_value = simplify(value, [], 0);
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
  logger.debug('%s %s', req.method, req.url);
  controllers(req, res);
})
.on('listening', function() {
  var address = this.address();
  logger.info('server listening on http://%s:%d', address.address, address.port);
});
