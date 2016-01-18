import React from 'react';

const Encoding = ({mapping, characterByteLength}) => {
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
      <p>characterByteLength: {characterByteLength}</p>
      <p>highest index: {mapping.length}</p>
      {rows}
    </section>
  );
};
Encoding.propTypes = {
  mapping: React.PropTypes.object.isRequired,
  characterByteLength: React.PropTypes.number.isRequired,
};

export default Encoding;
