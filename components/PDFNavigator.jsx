import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import {fetchFile, readArrayBufferSync} from '../models';
import PDFObject from './PDFObject';

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
    console.log('PDFNavigator#componentDidMount()', this.props.params.name);
    this.reloadState(this.props.params.name);
  }
  componentWillReceiveProps(nextProps) {
    console.log('PDFNavigator#componentWillReceiveProps()', nextProps.params.name,
      nextProps.params.name, this.props.params.name);
    if (nextProps.params.name != this.props.params.name) {
      this.reloadState(nextProps.params.name);
    }
  }
  render() {
    console.log('PDFNavigator#render()', this.props);
    // <div ng-repeat="page in pages" class="hpad" ui-sref-active="selected" style="border-top: 1px solid #B86">
    //   <h4><a ui-sref="pdf.pages.page({pageNumber: $index + 1})">Page {{$index + 1}}</a></h4>
    //   <component name="PDFObject" file="file" model="page"></component>
    // </div>
    return (
      <main>
        <nav className="thumbnails">
          <h3>File name: <code>{this.props.params.name}</code></h3>
          <h5>File size: {this.props.pdf.size} bytes</h5>

          <h4><Link to={`/${this.props.params.name}/document`}>Document</Link></h4>
          <h4><Link to={`/${this.props.params.name}/citations`}>Citations</Link></h4>
          <h4><Link to={`/${this.props.params.name}/cross_references`}>Cross References</Link></h4>

          <h3>Trailer</h3>
          <PDFObject object={this.props.pdf.trailer} />
        </nav>
        {this.props.pdf.size ? this.props.children : 'Loading...'}
      </main>
    )
  }
}
