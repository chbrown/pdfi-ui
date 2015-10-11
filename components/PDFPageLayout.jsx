import React from 'react';
import {connect} from 'react-redux';
const pdfi_graphics = require('pdfi/graphics');

import Layout from './Layout';

/**
PDFPageLayout just reads the pdf out of the store, renders it to a Layout,
and sends that layout over the Layout component.
*/
@connect(state => ({pdf: state.pdf}))
export default class PDFPageLayout extends React.Component {
  render() {
    var pdf = this.props.pdf;

    var page_index = parseInt(this.props.params.page, 10) - 1;
    var page = pdf.pages[page_index];
    var layout = pdfi_graphics.renderPageLayout(page, false);

    return <Layout {...layout} />;
  }
  static propTypes = {
    pdf: React.PropTypes.any.isRequired
  }
}
