import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {asArray} from 'tarry';

import {readArrayBufferSync} from '../models';
import ObjectView from '../components/ObjectView';
import NumberFormat from '../components/NumberFormat';

@connect(state => ({router: state.router, pdf: state.pdf}))
export default class PDFNavigator extends React.Component {
  reloadState(filename) {
    fetch(`/files/${filename}`)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
      var pdf = readArrayBufferSync(arrayBuffer, {type: 'pdf'});
      this.props.dispatch({type: 'SET_PDF', pdf});
    });
    // TODO: handle errors
  }
  componentWillMount() {
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
    var pages = asArray(this.props.pdf.pages).map((page, i) => {
      return (
        <div key={i} className="hpad page">
          <h4><Link to={`/${this.props.router.params.name}/page/${i + 1}`}>Page {i + 1}</Link></h4>
          <ObjectView object={page} />
        </div>
      );
    });
    var trailer = this.props.pdf.trailer;
    var trailerObjects = asArray(trailer ? trailer.objects : []);
    return (
      <div className="pdf-container">
        <nav className="thumbnails">
          <h3>File name: <code>{this.props.params.name}</code></h3>
          <h5>File size: <NumberFormat value={this.props.pdf.size} /> bytes</h5>

          <h4><Link to={`/${this.props.router.params.name}/document`}>Document</Link></h4>
          <h4><Link to={`/${this.props.router.params.name}/citations`}>Citations</Link></h4>
          <h4><Link to={`/${this.props.router.params.name}/cross-references`}>Cross References</Link></h4>

          <h3>Trailer</h3>
          <ObjectView object={this.props.pdf.trailer} />
          <h3>Raw trailer objects</h3>
          <ObjectView object={trailerObjects} />

          <h3>Pages</h3>
          {pages}
        </nav>
        <article>
          {this.props.pdf.size ? this.props.children : <h4 className="hpad">Loading...</h4>}
        </article>
      </div>
    );
  }
}
