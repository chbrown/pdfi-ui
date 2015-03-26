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

var PDFObjectReference = React.createClass({displayName: "PDFObjectReference",
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
      return React.createElement(PDFObject, {file: this.props.file, object: this.state.object});
    }

    var href = 'pdfs/' + this.props.file.name + '/objects/' + this.props.objectNumber;
    var text = this.props.objectNumber + ':' + this.props.generationNumber;
    return React.createElement("a", {className: "reference", href: href, onClick: this.click}, text);
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

var PDFObject = React.createClass({displayName: "PDFObject",
  propTypes: {
    object: React.PropTypes.any,
    file: React.PropTypes.object.isRequired,
  },
  render: function() {
    var object = this.props.object;
    var file = this.props.file;
    if (object === undefined) {
      return React.createElement("i", null, "undefined");
    }
    else if (object === null) {
      return React.createElement("i", null, "null");
    }
    else if (object.object_number !== undefined && object.generation_number !== undefined) {
      return React.createElement(PDFObjectReference, {file: file, objectNumber: object.object_number, generationNumber: object.generation_number});
    }
    else if (Array.isArray(object)) {
      var array_children = object.map(function(child) {
        return React.createElement(PDFObject, {file: file, object: child});
      });
      return React.createElement("span", {className: "array"}, "[", array_children, "]");
    }
    else if (typeof object === 'object') {
      var object_children = Object.keys(object).map(function(key) {
        var child = object[key];
        return React.createElement("div", null, React.createElement("span", {className: "name"}, key, ":"), React.createElement(PDFObject, {file: file, object: child}));
      });
      return React.createElement("div", {className: "object"}, object_children);
    }
    else if (typeof object === 'number') {
      return React.createElement("span", {className: "number"}, object);
    }
    else if (typeof object === 'boolean') {
      return React.createElement("span", {className: "boolean"}, object);
    }
    // catch-all
    return React.createElement("span", {className: "string"}, object);
  },
});

var TextSpan = React.createClass({displayName: "TextSpan",
  propTypes: {
    // this matches the properties in shapes.TextSpan (and thus, its JSON representation)
    string: React.PropTypes.string.isRequired,
    minX: React.PropTypes.number.isRequired,
    minY: React.PropTypes.number.isRequired,
    maxX: React.PropTypes.number.isRequired,
    maxY: React.PropTypes.number.isRequired,
    fontSize: React.PropTypes.number.isRequired,
    details: React.PropTypes.object,
  },
  render: function() {
    var style = {
      left: this.props.minX.toFixed(3),
      top: this.props.minY.toFixed(3),
      width: (this.props.maxX - this.props.minX).toFixed(3),
      height: (this.props.maxY - this.props.minY).toFixed(3),
      fontSize: this.props.fontSize.toFixed(3),
    };
    var title = JSON.stringify(this.props.details);
    return React.createElement("div", {className: "text", style: style, title: title}, this.props.string);
  },
});

var PDFCanvas = React.createClass({displayName: "PDFCanvas",
  propTypes: {
    spans: React.PropTypes.array.isRequired,
  },
  render: function() {
    var spans = this.props.spans.map(function(span) {
      return React.createElement(TextSpan, React.__spread({},  span));
    });
    return React.createElement("section", null, spans);
  },
});

var PDFPage = React.createClass({displayName: "PDFPage",
  propTypes: {
    page: React.PropTypes.object.isRequired,
  },
  render: function() {
    return React.createElement(PDFCanvas, {spans: this.props.page.spans});
  },
});

var components = {
  PDFObject: PDFObject,
  PDFObjectReference: PDFObjectReference,
  PDFCanvas: PDFCanvas,
  PDFPage: PDFPage,
};
