import React from 'react';
import {connect} from 'react-redux';
import {renderPageLayout} from 'pdfi/graphics';

import Layout from '../components/Layout';
import ViewConfigScale from '../components/ViewConfigScale';
import ViewConfigCheckbox from '../components/ViewConfigCheckbox';

/**
PDFPageLayout just reads the pdf out of the store, renders it to a Layout,
and sends that layout over the Layout component.
*/
@connect(state => ({pdf: state.pdf}))
export default class PDFPageLayout extends React.Component {
  render() {
    const {pdf, params} = this.props;

    var page_index = parseInt(params.page, 10) - 1;
    var page = pdf.pages[page_index];
    var layout = renderPageLayout(page, false);

    return (
      <section className="hpad">
        <h2>Page Layout</h2>
        <div>
          <ViewConfigCheckbox name="outlines" label="Draw outlines" />
          <ViewConfigCheckbox name="labels" label="Draw labels" />
        </div>
        <ViewConfigScale />
        <Layout {...layout} />
      </section>
    );
  }
  static propTypes = {
    pdf: React.PropTypes.any.isRequired,
  }
}
