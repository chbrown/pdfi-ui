import React from 'react';
import {OperationPropTypes} from '../propTypes';

class Operation extends React.Component {
  render() {
    return (
      <div className="key-row">
        <span>{this.props.operator}</span>
        <span>{JSON.stringify(this.props.operands, null, '  ')}</span>
      </div>
    );
  }
  static propTypes = OperationPropTypes
}

export default class ContentStream extends React.Component {
  render() {
    return (
      <section className="hpad">
        {this.props.operations.map((operation, i) => <Operation key={i} {...operation} />)}
      </section>
    );
  }
  static propTypes = {
    operations: React.PropTypes.arrayOf(React.PropTypes.shape(OperationPropTypes)).isRequired,
  }
}
