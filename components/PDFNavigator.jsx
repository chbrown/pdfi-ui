import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import {fetchFile, readArrayBufferSync} from '../models';
import PDFObject from './PDFObject';
import NumberFormat from './NumberFormat';
import {RectanglePropTypes} from './propTypes';

@connect(state => ({pdf: state.pdf}))
export default class PDFNavigator extends React.Component {
  reloadState(name) {
    fetchFile(name, (error, arrayBuffer) => {
      if (error) throw error;
      var pdf = readArrayBufferSync(arrayBuffer, {type: 'pdf'});
      this.props.dispatch({type: 'SET_PDF', pdf});
    });
  }
  componentDidMount() {
    // I wish there were a better way for hooking into path changes and loading
    // a PDF into the store/context, but this is the best I can think up.
    this.reloadState(this.props.params.name);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.params.name != this.props.params.name) {
      this.reloadState(nextProps.params.name);
    }
  }
  render() {
    var pages = this.props.pdf.pages ? this.props.pdf.pages.map((page, i) => {
      return (
        <div key={i} className="hpad page">
          <h4><Link to={`/${this.props.params.name}/page/${i + 1}`}>Page {i + 1}</Link></h4>
          <PDFObject object={page} />
        </div>
      );
    }) : [];
    return (
      <div className="pdf-container">
        <nav className="thumbnails">
          <h3>File name: <code>{this.props.params.name}</code></h3>
          <h5>File size: <NumberFormat value={this.props.pdf.size} /> bytes</h5>

          <h4><Link to={`/${this.props.params.name}/document`}>Document</Link></h4>
          <h4><Link to={`/${this.props.params.name}/citations`}>Citations</Link></h4>
          <h4><Link to={`/${this.props.params.name}/cross_references`}>Cross References</Link></h4>

          <h3>Trailer</h3>
          <PDFObject object={this.props.pdf.trailer} />

          <h3>Pages</h3>
          {pages}
        </nav>
        <article>
          {this.props.pdf.size ? this.props.children : 'Loading...'}
        </article>
      </div>
    )
  }
}
