import React from 'react';
import {CrossReferencePropTypes} from './propTypes';

/**
Interaction with CrossReferencesTable should consist of listening to click
events on `a` elements with `data-object` attributes.
*/
export default class CrossReferencesTable extends React.Component {
  render() {
    var trs = this.props.cross_references.map(cross_reference => {
      var key = `${cross_reference.object_number}:0`;
      return (
        <tr key={key}>
          <td><a data-object={cross_reference.object_number}>open</a></td>
          <td>{cross_reference.object_number}</td>
          <td>{cross_reference.generation_number}</td>
          <td>{cross_reference.in_use}</td>
        </tr>
      )
    });
    // <h3 class="hpad">Cross References</h3>
    return (
      <table class="fill padded striped lined">
        <thead>
          <tr>
            <th></th>
            <th>Object</th>
            <th>Generation</th>
            <th>In use?</th>
          </tr>
        </thead>
        <tbody>
          {trs}
        </tbody>
      </table>
    );
  }
  static propTypes = {
    cross_references: React.PropTypes.arrayOf(React.PropTypes.shape(CrossReferencePropTypes)).isRequired,
  }
}
