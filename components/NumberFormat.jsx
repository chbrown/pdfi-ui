import React from 'react';

/**
<NumberFormat value={16090.0010413} digits={3} /> is a component for rendering
numbers with thousands separators and truncated decimals. The example above
renders to <span>16,090.001</span>.
*/
export default class NumberFormat extends React.Component {
  render() {
    var formatted = this.props.value ? this.props.value.toLocaleString(undefined, {maximumFractionDigits: this.props.digits}) : '';
    return <span>{formatted}</span>;
  }
  static propTypes = {
    value: React.PropTypes.number,
    digits: React.PropTypes.number,
  }
}
