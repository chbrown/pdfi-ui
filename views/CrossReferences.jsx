import React from 'react';
import {connect} from 'react-redux';

import {CrossReferencePropTypes} from '../propTypes';
import ObjectView from '../components/ObjectView';


const CrossReferenceRow = ({object_number, generation_number, offset, in_use}) => (
  <tr>
    <td>
      <ObjectView object={{object_number, generation_number}} />
    </td>
    <td>{object_number}</td>
    <td>{generation_number}</td>
    <td>{in_use ? 'Yes' : 'No'}</td>
    <td className="right">{offset}</td>
  </tr>
);
// cross_references: React.PropTypes.arrayOf(React.PropTypes.shape(CrossReferencePropTypes)).isRequired,
CrossReferenceRow.propTypes = CrossReferencePropTypes;

@connect(state => ({pdf: state.pdf}))
export default class CrossReferencesTable extends React.Component {
  render() {
    const {pdf} = this.props;
    return (
      <section className="hpad">
        <h2>Cross References</h2>
        <table className="fill padded striped lined">
          <thead>
            <tr>
              <th>View</th>
              <th>Object</th>
              <th>Generation</th>
              <th>In use?</th>
              <th>Offset</th>
            </tr>
          </thead>
          <tbody>
            {pdf.cross_references.map(cross_reference => (
              <CrossReferenceRow key={`${cross_reference.object_number}:${cross_reference.generation_number}`} {...cross_reference} />
            ))}
          </tbody>
        </table>
      </section>
    );
  }
  // cross_references: React.PropTypes.arrayOf(React.PropTypes.shape(CrossReferencePropTypes)).isRequired,
}
