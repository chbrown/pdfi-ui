/** @jsx React.DOM */ /*globals React */

var PDFObject = React.createClass({
  propTypes: {
    object: React.PropTypes.any,
    emit: React.PropTypes.func.isRequired,
  },
  render: function() {
    var object = this.props.object;
    var emit = this.props.emit;
    if (object === undefined) {
      return <i>undefined</i>;
    }
    else if (object === null) {
      return <i>null</i>;
    }
    else if (object.object_number !== undefined && object.generation_number !== undefined) {
      return <a className="reference" onClick={this.emitLoadObject}>{object.object_number}:{object.generation_number}</a>;
    }
    else if (Array.isArray(object)) {
      var array_children = object.map(function(child) {
        return <PDFObject object={child} emit={emit} />;
      });
      return <span className="array">[{array_children}]</span>;
    }
    else if (typeof object === 'object') {
      var object_children = Object.keys(object).map(function(key) {
        var child = object[key];
        return <div><span className="name">{key}:</span><PDFObject object={child} emit={emit} /></div>;
      });
      return <div className="object">{object_children}</div>;
    }
    else if (!isNaN(object)) {
      return <span className="number">{object}</span>;
    }
    // catch-all
    return <span className="string">{object}</span>;
  },
  emitLoadObject: function() {
    this.props.emit('loadObject', this.props.object);
  },
});

var components = {PDFObject: PDFObject};
