var _ = require('lodash');
var async = require('async');
var path = require('path');
var fs = require('fs');
var url = require('url');
var lexing = require('lexing');
var formidable = require('formidable');

var logger = require('loge');
var Router = require('regex-router');

var pdflib = require('pdf');
var pdf_models = require('pdf/models');
var StackOperationParser = require('pdf/parsers/StackOperationParser');

pdflib.logger.level = logger.level;

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
      res.json(files);
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
function loadPDF(uri_name, res, callback) {
  var name = decodeURIComponent(uri_name);
  try {
    if (!(name in pdf_cache)) {
      var filepath = path.join(files_dirpath, name);
      pdf_cache[name] = pdflib.PDF.open(filepath);
    }
    callback(pdf_cache[name]);
  }
  catch (error) {
    return res.die(error);
  }
}

function parseStackOperations(string) {
  var string_iterable = new lexing.StringIterator(string);
  var stack_operation_iterator = new StackOperationParser().map(string_iterable);
  var tokens = [];
  try {
    while (1) {
      var token = stack_operation_iterator.next();
      if (token.name === 'EOF') {
        break;
      }
      var token_object = {};
      token_object[token.name] = token.value;
      tokens.push(token_object);
    }
  }
  catch (error) {
    logger.error('StackOperationParser exception: %s', error.message);
  }
  return tokens;
}

/** GET /files/:name
*/
R.get(/^\/files\/([^\/]+)$/, function(req, res, m) {
  var name = decodeURIComponent(m[1]);
  loadPDF(m[1], res, function(pdf) {
    res.json({
      // Angular model updating wants the name here too:
      name: name,
      size: pdf.size,
      trailer: _.omit(pdf.trailer._object, 'ID'), // who needs the ID?
      cross_references: pdf.cross_references,
    });
  });
});

/** GET /files/:name/pages
*/
R.get(/^\/files\/([^\/]+)\/pages$/, function(req, res, m) {
  loadPDF(m[1], res, function(pdf) {
    var raw_pages = pdf.pages.map(function(page) {
      return page._object;
    });
    res.json(raw_pages);
  });
});

/** GET /files/:name/pages/:page_number

In the user interface, page numbers are 1-based. In the pdf representation,
they are 0-based.
*/
R.get(/^\/files\/([^\/]+)\/pages\/(\d+)$/, function(req, res, m) {
  loadPDF(m[1], res, function(pdf) {
    var page_number = parseInt(m[2], 10);

    // subtract one to change indexing from 1-based to 0-based
    var page = pdf.pages[page_number - 1];
    var canvas = page.renderCanvas();

    res.json({
      MediaBox: page.MediaBox,
      canvas: canvas,
    });
  });
});

/** GET /files/:name/pages/:page_number/contents
*/
R.get(/^\/files\/([^\/]+)\/pages\/(\d+)\/contents$/, function(req, res, m) {
  loadPDF(m[1], res, function(pdf) {
    var page_number = parseInt(m[2], 10);

    // subtract one to change indexing from 1-based to 0-based
    var page = pdf.pages[page_number - 1];
    var Contents = page.joinContents('\n'); // returns a string
    // var tokens = parseStackOperations(Contents);

    res.json({
      Contents: Contents,
      // tokens: tokens,
    });
  });
});

/** GET /files/:name/objects */
R.get(/^\/files\/([^\/]+)\/objects$/, function(req, res, m) {
  res.die('Not yet implemented');
});

/** GET /files/:name/objects/:object_id?generation:number=0
*/
R.get(/^\/files\/([^\/]+)\/objects\/(\d+)(\?.+|$)/, function(req, res, m) {
  var urlObj = url.parse(req.url, true);
  loadPDF(m[1], res, function(pdf) {
    var object_number = parseInt(m[2], 10);
    var generation_number = parseInt(urlObj.query.generation || 0, 10);

    var object = pdf.getObject(object_number, generation_number);

    if (pdf_models.ContentStream.isContentStream(object)) {
      var content_stream = new pdf_models.ContentStream(pdf, object);
      var decoded_object = _.clone(object);
      decoded_object.buffer = content_stream.buffer;
      return res.json(decoded_object);
    }

    res.json(object);
  });
});

/** GET /files/:name/objects/:object_id/extra?generation:number=0
*/
R.get(/^\/files\/([^\/]+)\/objects\/(\d+)\/extra(\?.+|$)/, function(req, res, m) {
  var urlObj = url.parse(req.url, true);
  loadPDF(m[1], res, function(pdf) {
    var object_number = parseInt(m[2], 10);
    var generation_number = parseInt(urlObj.query.generation || 0, 10);

    // getObject returns the cached object from the pdf lib -- don't modify it!
    var object = pdf.getObject(object_number, generation_number);

    if (pdf_models.ContentStream.isContentStream(object)) {
      var content_stream = new pdf_models.ContentStream(pdf, object);

      var decoded_object = _.clone(object);
      decoded_object.buffer = content_stream.buffer;

      if (content_stream.dictionary.Type == 'XObject' && content_stream.dictionary.Subtype == 'Form') {
        var canvas = new pdflib.drawing.Canvas(content_stream.dictionary.BBox);
        var stream_string = content_stream.buffer.toString('binary');
        var stream_string_iterable = new lexing.StringIterator(stream_string);
        try {
          canvas.render(stream_string_iterable, content_stream.Resources);
        }
        catch (exception) {
          return res.json({object: decoded_object, error: exception.stack});
        }
        // object.tokens = parseStackOperations(object.buffer);
        return res.json({object: decoded_object.dictionary, canvas: canvas, buffer: decoded_object.buffer});
      }

      return res.json({object: decoded_object});
    }
    else if (pdf_models.Font.isFont(object)) {
      var font = new pdf_models.Font(pdf, object);
      return res.json({object: object, Mapping: font.getCharCodeMapping()});
    }
    else if (pdf_models.Encoding.isEncoding(object)) {
      var encoding = new pdf_models.Encoding(pdf, object);
      return res.json({object: object, Mapping: encoding.Mapping});
    }

    res.json(object);
  });
});

module.exports = function(req, res) {
  logger.debug('%s %s', req.method, req.url);
  R.route(req, res);
};
