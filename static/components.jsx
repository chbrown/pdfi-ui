/** @jsx React.DOM */ /*globals React */

var PDFObject = React.createClass({
  propTypes: {
    object: React.PropTypes.any,
    ctrl: React.PropTypes.object,
  },
  render: function() {
    // special handling comes first
    var object = this.props.object;
    var ctrl = this.props.ctrl;
    if (object === undefined) {
      return <i>undefined</i>;
    }
    else if (object === null) {
      return <i>null</i>;
    }
    else if (object.object_number !== undefined && object.generation_number !== undefined) {
      return <a className="reference" onClick={this.loadObject}>{object.object_number}:{object.generation_number}</a>;
    }
    // generics arrays, objects, numbers, strings...
    else if (Array.isArray(object)) {
      var array_children = object.map(function(child) {
        return <PDFObject object={child} ctrl={ctrl} />;
      });
      return <span className="array">{array_children}</span>;
    }
    else if (typeof object === 'object') {
      var object_children = Object.keys(object).map(function(key) {
        var child = object[key];
        return <div><b>{key}</b><PDFObject object={child} ctrl={ctrl} /></div>;
      });
      return <div className="object">{object_children}</div>;
    }
    else if (!isNaN(object)) {
      return <span className="number">{object}</span>;
    }
    // catch-all
    return <span className="string">{object}</span>;
  },
  loadObject: function() {
    this.props.ctrl.loadObject(this.props.object);
  },
});

var components = {PDFObject: PDFObject};
