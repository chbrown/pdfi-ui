import * as React from 'react';
import * as PropTypes from 'prop-types';

/**
<NumberFormat value={16090.0010413} digits={3} /> is a component for rendering
numbers with thousands separators and truncated decimals. The example above
renders to <span>16,090.001</span>.
*/
const NumberFormat = ({value, digits}: {value: number, digits?: number}) => {
  const formatted = value ? value.toLocaleString(undefined, {maximumFractionDigits: digits}) : '';
  return <span>{formatted}</span>;
};
NumberFormat['propTypes'] = {
  value: PropTypes.number,
  digits: PropTypes.number,
};

export default NumberFormat;
