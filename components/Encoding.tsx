import * as React from 'react';
import * as PropTypes from 'prop-types';

const Encoding = ({mapping, characterByteLength}) => (
  <div>
    <p>characterByteLength: {characterByteLength}</p>
    <p>highest index: {mapping.length}</p>
    {Object.keys(mapping).filter(key => mapping[key] !== null).map(key =>
      <div key={key} className="key-row">
        <span className="right">{key}</span>
        <span>{mapping[key] || 'null'}</span>
      </div>
    )}
  </div>
);
Encoding.propTypes = {
  mapping: PropTypes.array.isRequired,
  characterByteLength: PropTypes.number.isRequired,
};

export default Encoding;
