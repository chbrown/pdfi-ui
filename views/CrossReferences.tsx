import * as React from 'react';
import {connect} from 'react-redux';

import {PDF} from 'pdfi';

import CrossReferencesTable from '../components/CrossReferences';

@connect(state => ({pdf: state.pdf}))
export default class PDFCrossReferencesTable extends React.Component<{pdf?: PDF}, {}> {
  render() {
    const {pdf} = this.props;
    return (
      <section className="hpad">
        <h2>Cross References</h2>
        <CrossReferencesTable cross_references={pdf.cross_references} />
      </section>
    );
  }
}
