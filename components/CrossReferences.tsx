import * as React from 'react';

import {CrossReferencePropTypes} from '../propTypes';
import ObjectView from './ObjectView';

const CrossReferencesTable = ({cross_references}) => (
  <table className="fill padded striped lined">
    <thead>
      <tr>
        <th>View</th>
        <th>Object</th>
        <th>Generation</th>
        <th>In use?</th>
        <th className="right">Offset</th>
      </tr>
    </thead>
    <tbody>
      {cross_references.map(({object_number, generation_number, offset, in_use}) =>
        <tr key={`${object_number}:${generation_number}`}>
          <td><ObjectView object={{object_number, generation_number}} /></td>
          <td>{object_number}</td>
          <td>{generation_number}</td>
          <td><ObjectView object={in_use} /></td>
          <td className="right">{offset}</td>
        </tr>
      )}
    </tbody>
  </table>
);
CrossReferencesTable['propTypes'] = {
  cross_references: React.PropTypes.arrayOf(React.PropTypes.shape(CrossReferencePropTypes)).isRequired,
};
export default CrossReferencesTable;
