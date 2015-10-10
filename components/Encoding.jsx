import React from 'react';

export default class Encoding extends React.Component {
  render() {
    var mapping = this.props.encoding.mapping;
    var keys = Object.keys(mapping).filter(key => mapping[key] !== null);
    var rows = keys.map(key => {
      var val = mapping[key] || 'null';
      return (
        <div key={key} className="key-row">
          <span className="right">{key}</span>
          <span>{val}</span>
        </div>
      );
    });
    return (
      <section className="hpad">
        <p>characterByteLength: {this.props.encoding.characterByteLength}</p>
        <p>highest index: {mapping.length}</p>
        {rows}
      </section>
    );
  }
  static propTypes = {
    // FIXME: be more specific
    encoding: React.PropTypes.any.isRequired,
  }
}
