/** @jsx React.DOM */ /*globals React */

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
      var href = 'pdfs/' + file.name + '/objects/' + object.object_number;
      return <a className="reference" href={href}>{object.object_number}:{object.generation_number}</a>;
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
    else if (!isNaN(object)) {
      return <span className="number">{object}</span>;
    }
    // catch-all
    return <span className="string">{object}</span>;
  },
});

var components = {PDFObject: PDFObject};
