import * as React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {asArray} from 'tarry';

import {PDF} from 'pdfi';

import {ReduxProps, readArrayBufferSync} from '../models';
import ObjectView from '../components/ObjectView';
import NumberFormat from '../components/NumberFormat';

@connect(state => ({pdf: state.pdf}))
export default class Navigator extends React.Component<{params?: any, pdf?: PDF} & React.Props<any> & ReduxProps> {
  reloadState(filename) {
    fetch(`/files/${filename}`)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
      const pdf = readArrayBufferSync(arrayBuffer, {type: 'pdf'});
      this.props.dispatch({type: 'SET_PDF', pdf, filename});
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
    const {params, pdf, children} = this.props;
    return (
      <div className="pdf-container">
        <nav className="thumbnails">
          <h3>File name: <code>{params.name}</code></h3>
          <h5>File size: <NumberFormat value={pdf.size} /> bytes</h5>

          <h4><Link to={`/${params.name}/document`}>Document</Link></h4>
          <h4><Link to={`/${params.name}/citations`}>Citations</Link></h4>
          <h4><Link to={`/${params.name}/cross-references`}>Cross References</Link></h4>
          <h4><Link to={`/${params.name}/trailer`}>Trailer</Link></h4>
          <ObjectView object={pdf.trailer} />

          <h4>Pages</h4>
          {asArray(pdf.pages).map((page, i) =>
            <div key={i} className="hpad page">
              <h4><Link to={`/${params.name}/pages/${i + 1}`}>Page {i + 1}</Link></h4>
              <ObjectView object={page} />
            </div>
          )}
        </nav>
        <article>
          {pdf.size ? children : <h4 className="hpad">Loading...</h4>}
        </article>
      </div>
    );
  }
}
