import React from 'react';
import {connect} from 'react-redux';

import ObjectView from './ObjectView';

@connect(state => ({router: state.router, pdf: state.pdf}))
export default class PDFObject extends React.Component {
  render() {
    var pdf = this.props.pdf;
    var object_number = parseInt(this.props.router.params.object_number, 10);
    var generation_number = parseInt(this.props.router.params.generation_number || 0, 10);
    var object = pdf.getObject(object_number, generation_number);

    return (
      <section className="hpad">
        <h2>Object {object_number}:{generation_number}</h2>
        <ObjectView object={object} />
      </section>
    );
  }
}
