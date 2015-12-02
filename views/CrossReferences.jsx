import React from 'react';
import {connect} from 'react-redux';

import ObjectView from '../components/ObjectView';

@connect(state => ({pdf: state.pdf}))
export default class PDFCrossReferences extends React.Component {
  render() {
    // cross_references: React.PropTypes.arrayOf(React.PropTypes.shape(CrossReferencePropTypes)).isRequired,
    var trs = this.props.pdf.cross_references.map(cross_reference => {
      return (
        <tr key={`${cross_reference.object_number}:${cross_reference.generation_number}`}>
          <td>
            <ObjectView object={cross_reference} />
          </td>
          <td>{cross_reference.object_number}</td>
          <td>{cross_reference.generation_number}</td>
          <td>{cross_reference.in_use ? 'Yes' : 'No'}</td>
        </tr>
      );
    });
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
            </tr>
          </thead>
          <tbody>
            {trs}
          </tbody>
        </table>
      </section>
    );
  }
}
