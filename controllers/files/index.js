var async = require('async');
var path = require('path');
var fs = require('fs');
var url = require('url');
var formidable = require('formidable');

var logger = require('loge');
var Router = require('regex-router');

var pdf = require('pdf');

var files_dirpath = process.env.UPLOADS;

var R = new Router(function(req, res) {
  res.status(404).die('No resource at: ' + req.url);
});

// R.any(/^\/files\/[^\/]+\/objects/, require('./objects'));

/** GET /files

Get uploaded files.
*/
R.get(/^\/files$/, function(req, res) {
  fs.readdir(files_dirpath, function(err, filenames) {
    if (err) return res.die(err);
    filenames = filenames.filter(function(filename) {
      // stupid Mac OS X with your .DS_Store files
      return !filename.match(/^\./);
    });

    async.map(filenames, function(filename, callback) {
      var filepath = path.join(files_dirpath, filename);
      fs.stat(filepath, function(err, stats) {
        callback(err, {name: filename, size: stats.size});
      });
    }, function(err, files) {
      if (err) return res.die(err);
      res.ngjson(files);
    });
  });
});

/** POST /files

Upload new file.
*/
R.post(/^\/files$/, function(req, res, m) {
  /** formidable.IncomingForm#parse(request: http.IncomingMessage,
                                    callback: (...))

  The `files` object in the callback is keyed by the field name used by the
  client.

  Depending on the whether the client sent one or multiple files with
  the same field name, the `files` object's values will be a File, or an Array
  of Files. Not the API design I would have chosen, but easy enough to coalesce
  to an Array.

  Example `files` object (where the client sent a single file on with the field
  name "file":

      {
        "file": {
          "size": 899791,
          "path": "/var/folders/m8/cq7z9jxj0774qz_3yg0kw5k40000gn/T/upload_c93ff63b9905c00ca7c8b778dab527f0",
          "name": "5th-cat.jpg",
          "type": "application/pdf",
          "mtime": "2015-02-13T11:34:47.811Z"
        }
      }
  */
  var form = new formidable.IncomingForm({multiples: true})
  .on('fileBegin', function(name, file) {
    file.path = path.join(files_dirpath, file.name);
    logger.info('fileBegin', name, file);
  })
  .parse(req, function(err, fields, files) {
    if (err) return res.die(err);
    var file = files.file || {};
    res.json({name: file.name, size: file.size, type: file.type, lastModifiedDate: file.lastModifiedDate});
  });
});

var pdf_cache = {};
function loadPDF(name) {
  if (!pdf_cache[name]) {
    var filepath = path.join(files_dirpath, name);
    pdf_cache[name] = pdf.PDF.open(filepath);
  }
  return pdf_cache[name];
}

/** GET /files/:name

*/
R.get(/^\/files\/([^\/]+)$/, function(req, res, m) {
  var name = decodeURIComponent(m[1]);
  var pdf = loadPDF(name);

  // var Info = pdf.findObject(trailer.Info);
  // var Root = pdf.findObject(trailer.Root);
  // var RootPages = pdf.findObject(Root.Pages);
  // var pages = <pdfdom.ArrayObject>Pages['Kids'];

  res.json({
    name: name,
    size: pdf.size,
    trailer: pdf.trailer,
    cross_references: pdf.cross_references,
  });
});

/** GET /files/:name/pages

*/
R.get(/^\/files\/([^\/]+)\/pages$/, function(req, res, m) {
  var name = decodeURIComponent(m[1]);
  var pdf = loadPDF(name);

  res.json(pdf.pages);
});


/** GET /files/:name/objects

*/
R.get(/^\/files\/([^\/]+)\/objects$/, function(req, res, m) {
  res.die('Not yet implemented');
});

/** GET /files/:name/objects/:object_id

  ?generation: number

*/
R.get(/^\/files\/([^\/]+)\/objects\/(\d+)(\?.+|$)/, function(req, res, m) {
  var name = decodeURIComponent(m[1]);
  var pdf = loadPDF(name);
  var object_number = m[2];

  var urlObj = url.parse(req.url, true);
  var generation_number = urlObj.query.generation_number || 0;

  var object = pdf.findObject({
    object_number: parseInt(object_number, 10),
    generation_number: parseInt(generation_number, 10),
  });

  if (Buffer.isBuffer(object.buffer) && object.dictionary && object.dictionary.Length !== undefined) {
    // it's a stream, but bytes aren't very useful, so render them as a string instead
    object.string = object.buffer.toString('ascii');
    delete object.buffer;
  }

  // it could be an array
  res.ngjson(object);
});

module.exports = R.route.bind(R);
