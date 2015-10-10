import React from 'react';
import {OperationPropTypes} from './propTypes';

export default class ContentStream extends React.Component {
  render() {
    var operations = this.props.operations.map(operation => {
      var operands = JSON.stringify(operation.operands, null, '  ');
      return (
        <div key={key} className="key-row">
          <span>{operation.operator}</span>
          <span>{operands}</span>
        </div>
      );
    });
    return <section className="hpad">{operations}</section>;
  }
  static propTypes = {
    operations: React.PropTypes.arrayOf(React.PropTypes.shape(OperationPropTypes)).isRequired,
  }
}
