/** @jsx React.DOM */ /*globals React */

var PDFObject = React.createClass({displayName: "PDFObject",
  propTypes: {
    object: React.PropTypes.any,
    ctrl: React.PropTypes.object,
  },
  render: function() {
    // special handling comes first
    var object = this.props.object;
    var ctrl = this.props.ctrl;
    if (object === undefined) {
      return React.createElement("i", null, "undefined");
    }
    else if (object === null) {
      return React.createElement("i", null, "null");
    }
    else if (object.object_number !== undefined && object.generation_number !== undefined) {
      return React.createElement("a", {className: "reference", onClick: this.loadObject}, object.object_number, ":", object.generation_number);
    }
    // generics arrays, objects, numbers, strings...
    else if (Array.isArray(object)) {
      var array_children = object.map(function(child) {
        return React.createElement(PDFObject, {object: child, ctrl: ctrl});
      });
      return React.createElement("span", {className: "array"}, array_children);
    }
    else if (typeof object === 'object') {
      var object_children = Object.keys(object).map(function(key) {
        var child = object[key];
        return React.createElement("div", null, React.createElement("b", null, key), React.createElement(PDFObject, {object: child, ctrl: ctrl}));
      });
      return React.createElement("div", {className: "object"}, object_children);
    }
    else if (!isNaN(object)) {
      return React.createElement("span", {className: "number"}, object);
    }
    // catch-all
    return React.createElement("span", {className: "string"}, object);
  },
  loadObject: function() {
    this.props.ctrl.loadObject(this.props.object);
  },
});

var components = {PDFObject: PDFObject};
