import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Escaper} from 'visible';

var escaper = new Escaper({
  escapeSlash: true,
  // literalVisibles: false,
  // useEscapes: true,
  literalEOL: true,
  literalSpace: true,
});

@connect(state => ({router: state.router}))
export default class ObjectView extends React.Component {
  render() {
    var object = this.props.object;
    object = escaper.simplify(object);
    if (object === undefined) {
      return <i className="undefined">undefined</i>;
    }
    else if (object === null) {
      return <b className="null">null</b>;
    }
    else if (object.object_number !== undefined && object.generation_number !== undefined) {
      return (
        <Link className="reference" to={`/${this.props.router.params.name}/object/${object.object_number}`}>
          {object.object_number}:{object.generation_number}
        </Link>
      );
    }
    else if (Array.isArray(object)) {
      var array_children = object.map((child, index) => <ObjectView key={index} object={child} />);
      return <span className="array">[{array_children}]</span>;
    }
    else if (typeof object === 'object') {
      // if (object.toJSON) {
      //   object = object.toJSON();
      // }
      // var data = JSON.stringify(simplified_value);
      // skip keys that start with an underscore
      var keys = Object.keys(object).filter(key => key[0] !== '_');
      var object_children = keys.map(key => {
        var child = object[key];
        return (
          <div key={key}>
            <span className="name">{key}:</span>
            <ObjectView object={child} />
          </div>
        );
      });
      return <div className="object">{object_children}</div>;
    }
    else if (typeof object === 'number') {
      return <span className="number">{object.toString()}</span>;
    }
    else if (typeof object === 'boolean') {
      return <span className="boolean">{object.toString()}</span>;
    }
    // catch-all
    return <span className="string">{object.toString()}</span>;
  }
  static propTypes = {
    object: React.PropTypes.any,
  }
}
