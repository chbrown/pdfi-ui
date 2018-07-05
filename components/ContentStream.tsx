import * as React from 'react';
import {OperationPropTypes} from '../propTypes';

import ObjectView from './ObjectView';

const Operation = ({operator, operands}) => (
  <div className="key-row">
    <span>{operator}</span>
    <span><ObjectView object={operands} /></span>
  </div>
);
Operation['propTypes'] = OperationPropTypes;

const ContentStream = ({operations}) => (
  <section className="hpad">
    {operations.map((operation, i) => <Operation key={i} {...operation} />)}
  </section>
);
ContentStream['propTypes'] = {
  operations: React.PropTypes.arrayOf(React.PropTypes.shape(OperationPropTypes)).isRequired,
};

export default ContentStream;
