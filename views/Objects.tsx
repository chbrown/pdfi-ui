import * as React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {BufferIterator} from 'lexing';

import {PDF} from 'pdfi';
import {ContentStream} from 'pdfi/models';
import {Font as pdfiFont} from 'pdfi/font';
import {renderLayoutFromContentStream} from 'pdfi/graphics';
import {PDFBufferIterator} from 'pdfi/parsers';
import {CONTENT_STREAM, CMAP} from 'pdfi/parsers/states';

import {ReduxProps} from '../models';
import ContentStreamOperations from '../components/ContentStream';
// import ContentStreamText from '../components/ContentStreamText';
import Encoding from '../components/Encoding';
import Font from '../components/Font';
import ObjectView from '../components/ObjectView';
import Table from '../components/Table';

@connect(state => ({object: state.object}))
export class ObjectRaw extends React.Component<{object: any}, {}> {
  render() {
    const {object} = this.props;
    return <ObjectView object={object} />;
  }
}

@connect(state => ({pdf: state.pdf, object: state.object}))
export class ObjectStream extends React.Component<{pdf: PDF, object: any}, {}> {
  render() {
    const {pdf, object} = this.props;
    const contentStream = new ContentStream(pdf, object);
    return <ObjectView object={contentStream.buffer} />;
  }
}

@connect(state => ({pdf: state.pdf, object: state.object}))
export class ObjectContentStream extends React.Component<{pdf: PDF, object: any}, {}> {
  render() {
    const {pdf, object} = this.props;
    const contentStream = new ContentStream(pdf, object);
    const stream_buffer_iterable = new PDFBufferIterator(contentStream.buffer, 0, pdf);
    const operations = new CONTENT_STREAM(stream_buffer_iterable, 'binary', 1024).read();
    return <ContentStreamOperations operations={operations} />;
  }
}

@connect(state => ({pdf: state.pdf, object: state.object}))
export class ObjectContentStreamLayout extends React.Component<{pdf: PDF, object: any}, {}> {
  render() {
    const {pdf, object} = this.props;
    const contentStream = new ContentStream(pdf, object);
    const layout = renderLayoutFromContentStream(contentStream, true);
    console.log('layout', layout);
    // layout has fields: outerBounds, textSpans, containers
    return <div>Not yet implemented: "content-stream-layout"</div>;
  }
}

@connect(state => ({pdf: state.pdf, object: state.object}))
export class ObjectCMap extends React.Component<{pdf: PDF, object: any}, {}> {
  render() {
    const {pdf, object} = this.props;
    const contentStream = new ContentStream(pdf, object);
    const bufferIterable = new PDFBufferIterator(contentStream.buffer, 0, pdf);
    const cMap = new CMAP(bufferIterable, 'binary', 1024).read();
    const {codeSpaceRanges, mappings, byteLength} = cMap;
    return (
      <div>
        <h2>CMap byteLength={byteLength}</h2>

        <h2>codeSpaceRanges</h2>
        <Table objects={codeSpaceRanges} columns={['low', 'high']} />

        <h2>mappings</h2>
        <Table objects={mappings} columns={['src', 'dst', 'byteLength']} />
      </div>
    );
  }
}


// @connect(state => ({pdf: state.pdf, object: state.object}))
// export class ObjectContentStreamText extends React.Component<{pdf: PDF, object: any}, {}> {
//   render() {
//     const {pdf, object} = this.props;
//     const contentStream = new ContentStream(pdf, object);
//     const spans = renderContentStreamText(contentStream);
//     return <ContentStreamText spans={spans} />;
//   }
// }

@connect(state => ({pdf: state.pdf, object: state.object}))
export class ObjectFont extends React.Component<{pdf: PDF, object: any}, {}> {
  render() {
    const {pdf, object} = this.props;
    const FontCtor = pdfiFont.getConstructor(object.Subtype);
    const font = new FontCtor(pdf, object);
    return <Font font={font} />;
  }
}

@connect(state => ({pdf: state.pdf, object: state.object}))
export class ObjectEncoding extends React.Component<{pdf: PDF, object: any}, {}> {
  render() {
    const {pdf, object} = this.props;
    const FontCtor = pdfiFont.getConstructor(object.Subtype);
    const font = new FontCtor(pdf, object);
    return <Encoding mapping={font.encoding.mapping} characterByteLength={font.encoding.characterByteLength} />;
  }
}

const modes = [
  'raw',
  'stream',
  'content-stream',
  'content-stream-layout',
  'content-stream-text',
  'font',
  'encoding',
  'cmap',
];

@connect(state => ({pdf: state.pdf}))
export default class PDFObjects extends React.Component<{params?: any} & React.Props<any> & ReduxProps, {}> {
  reloadState(props) {
    // this just makes it easier for child components to access the current object
    const {params, pdf} = props;
    const object_number = parseInt(params.object_number, 10);
    const generation_number = parseInt(params.generation_number || 0, 10);
    const object = pdf.getObject(object_number, generation_number);
    this.props.dispatch({type: 'SET_OBJECT', object});
  }
  componentWillMount() {
    this.reloadState(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.params.object_number != this.props.params.object_number) {
      this.reloadState(nextProps);
    }
  }
  render() {
    const {children, params} = this.props;
    return (
      <section className="hpad">
        <h2>Object {params.object_number}:{params.generation_number || 0}</h2>
        <div className="hlinks">
          {modes.map((mode, i) =>
            <Link key={i} to={`/${params.name}/objects/${params.object_number}/${mode}`}>{mode}</Link>
          )}
        </div>
        {children}
      </section>
    );
  }
}
