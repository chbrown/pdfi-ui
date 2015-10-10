import React from 'react';
import * as arrays from 'arrays';
import {connect} from 'react-redux';
const pdfi_graphics = require('pdfi/graphics');

import Document from './Document';

@connect(state => ({pdf: state.pdf}))
export default class PDFDocument extends React.Component {
  componentWillReceiveProps(nextProps) {
    console.log('PDFDocument#componentWillReceiveProps()', nextProps);
    // this.reloadState(nextProps.params.name);
  }
  render() {
    console.log('PDFDocument#render():', this.props.pdf.size, this.props, this.state);
    var pdf = this.props.pdf;
    var paper = pdf.renderPaper();

    var spans = arrays.flatMap(pdf.pages, page => {
      return pdfi_graphics.renderPageLayout(page).textSpans;
    });

    var fontSizes = spans.map(textSpan => textSpan.fontSize);
    var fontSize_quartiles = arrays.quantile(fontSizes, 4);

    // spans?
    return <Document paper={paper} fontSize_quartiles={fontSize_quartiles} />;
  }
}
