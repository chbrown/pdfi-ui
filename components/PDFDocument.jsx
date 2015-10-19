import React from 'react';
import * as arrays from '@chbrown/arrays';
import {connect} from 'react-redux';
import pdfi_graphics from 'pdfi/graphics';

import NumberFormat from './NumberFormat';
import Paper from './Paper';

@connect(state => ({pdf: state.pdf}))
export default class PDFDocument extends React.Component {
  render() {
    var pdf = this.props.pdf;
    var paper = pdf.renderPaper();
    // paper: React.PropTypes.shape(PaperPropTypes).isRequired,

    var spans = arrays.flatMap(pdf.pages, page => {
      return pdfi_graphics.renderPageLayout(page).textSpans;
    });

    var fontSizes = spans.map(textSpan => textSpan.fontSize);
    var fontSize_quartiles = arrays.quantile(fontSizes, 4);
    // fontSize_quartiles: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,

    // spans?
    // return <Document paper={paper} fontSize_quartiles={fontSize_quartiles} />;
    return (
      <section className="hpad">
        <h2>Document</h2>
        <table className="quantile">
          <caption>fontSize_quartiles</caption>
          <tbody>
            <tr>
              <th>0% (minimum)</th>
              <th>25%</th>
              <th>50%</th>
              <th>75%</th>
              <th>100% (maximum)</th>
            </tr>
            <tr>
              {fontSize_quartiles.map((quartile, i) => <td key={i}><NumberFormat value={quartile} digits={2} /></td>)}
            </tr>
          </tbody>
        </table>
        <Paper {...paper} />
      </section>
    );
  }
}
