/** @jsx React.DOM */ /*jslint browser: true */ /*globals React */

function get(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onerror = function(error) {
    callback(error);
  };
  xhr.onload = function(event) {
    if (xhr.status >= 300) {
      var error = new Error(xhr.responseText);
      return callback(error);
    }

    var body = xhr.responseText;
    var content_type = (xhr.getResponseHeader('content-type') || 'text/plain').toLowerCase();
    if (content_type == 'application/json') {
      body = JSON.parse(body);
    }
    callback(null, body);
  };
  xhr.send();
}

var PDFObjectReference = React.createClass({
  propTypes: {
    objectNumber: React.PropTypes.number.isRequired,
    generationNumber: React.PropTypes.number.isRequired,
    file: React.PropTypes.object.isRequired,
  },
  getInitialState: function() {
    return {object: undefined};
  },
  render: function() {
    if (this.state.object) {
      // if the object has been resolved, use it
      return <PDFObject file={this.props.file} object={this.state.object} />;
    }

    var href = 'pdfs/' + this.props.file.name + '/objects/' + this.props.objectNumber;
    var text = this.props.objectNumber + ':' + this.props.generationNumber;
    return <a className="reference" href={href} onClick={this.click}>{text}</a>;
    // return <div className="reference" onClick={this.click}><a href={href}>{text}</a></div>;
  },
  load: function() {
    var self = this;
    var url = 'files/' + this.props.file.name + '/objects/' + this.props.objectNumber;
    get(url, function(error, object) {
      if (error) return console.error('Error getting %s: %o', url, error);
      self.setState({object: object});
    });
  },
  click: function(ev) {
    // command+alt-click to load the object in-place
    if (ev.metaKey && ev.altKey) {
      ev.preventDefault();
      this.load();
    }
  }
});

var PDFObject = React.createClass({
  propTypes: {
    object: React.PropTypes.any,
    file: React.PropTypes.object.isRequired,
  },
  render: function() {
    var object = this.props.object;
    var file = this.props.file;
    if (object === undefined) {
      return <i>undefined</i>;
    }
    else if (object === null) {
      return <i>null</i>;
    }
    else if (object.object_number !== undefined && object.generation_number !== undefined) {
      return <PDFObjectReference file={file} objectNumber={object.object_number} generationNumber={object.generation_number} />;
    }
    else if (Array.isArray(object)) {
      var array_children = object.map(function(child) {
        return <PDFObject file={file} object={child} />;
      });
      return <span className="array">[{array_children}]</span>;
    }
    else if (typeof object === 'object') {
      var object_children = Object.keys(object).map(function(key) {
        var child = object[key];
        return <div><span className="name">{key}:</span><PDFObject file={file} object={child} /></div>;
      });
      return <div className="object">{object_children}</div>;
    }
    else if (typeof object === 'number') {
      return <span className="number">{object}</span>;
    }
    else if (typeof object === 'boolean') {
      return <span className="boolean">{object}</span>;
    }
    // catch-all
    return <span className="string">{object}</span>;
  },
});

function mirrorY(point, total_height) {
  // mirror the page across a central horizontal line
  return {
    x: point.x,
    y: total_height - point.y,
  };
}

var PDFPage = React.createClass({
  propTypes: {
    page: React.PropTypes.object.isRequired,
  },
  render: function() {
    var page = this.props.page;
    var page_width = page.MediaBox[2];
    var page_height = page.MediaBox[3];
    var spans = page.spans.map(function(span) {
      var transformed_position = mirrorY(span.position, page_height);
      var spanStyle = {left: transformed_position.x, top: transformed_position.y, fontSize: span.size};
      return <div style={spanStyle}>{span.text}</div>;
    });
    var pageStyle = {width: page_width, height: page_height};
    return <div className="page" style={pageStyle}>{spans}</div>;
  },
});

var components = {
  PDFObject: PDFObject,
  PDFObjectReference: PDFObjectReference,
  PDFPage: PDFPage,
};
