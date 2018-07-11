import * as React from 'react'
import * as PropTypes from 'prop-types'
import {Encoding as pdfiEncoding} from 'pdfi/encoding'


const Encoding: React.StatelessComponent<pdfiEncoding> = ({mapping, characterByteLength}) => (
  <div>
    <p>characterByteLength: {characterByteLength}</p>
    <p>highest index: {mapping.length}</p>
    {mapping.filter(value => value !== null).map((value, index) =>
      <div key={index} className="key-row">
        <span className="right">{index}</span>
        <span>{value || 'null'}</span>
      </div>
    )}
  </div>
)
Encoding.propTypes = {
  mapping: PropTypes.array.isRequired,
  characterByteLength: PropTypes.number.isRequired,
}

export default Encoding
