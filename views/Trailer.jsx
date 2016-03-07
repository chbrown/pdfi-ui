import React from 'react';
import {connect} from 'react-redux';
import {asArray} from 'tarry';

import ObjectView from '../components/ObjectView';

@connect(state => ({pdf: state.pdf}))
export default class Trailer extends React.Component {
  render() {
    const {pdf} = this.props;
    const {trailer} = pdf;
    const trailerObjects = asArray(trailer ? trailer.objects : []);
    return (
      <section className="hpad">
        <h2>Trailer object sequence</h2>
        <ol>
          {trailerObjects.map((trailerObject, i) => (
            <li key={i}>
              <ObjectView object={trailerObject} />
            </li>
          ))}
        </ol>
      </section>
    );
  }
}
