/** @jsx React.DOM */ /*globals React */

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
      var href = 'pdfs/' + file.name + '/objects/' + object.object_number;
      return React.createElement("a", {className: "reference", href: href}, object.object_number, ":", object.generation_number);
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
    else if (!isNaN(object)) {
      return React.createElement("span", {className: "number"}, object);
    }
    // catch-all
    return React.createElement("span", {className: "string"}, object);
  },
});

var components = {PDFObject: PDFObject};
