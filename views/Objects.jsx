import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {BufferIterator} from 'lexing';

import {ContentStream} from 'pdfi/models';
import {Font} from 'pdfi/font';
import {renderContentStreamLayout, renderContentStreamText} from 'pdfi/graphics';
import {CONTENT_STREAM} from 'pdfi/parsers/states';

import ContentStreamOperations from '../components/ContentStream';
import ContentStreamText from '../components/ContentStreamText';
import Encoding from '../components/Encoding';
import ObjectView from '../components/ObjectView';

@connect(state => ({pdf: state.pdf, object: state.object}))
export class ObjectRaw extends React.Component {
  render() {
    const {object} = this.props;
    return <ObjectView object={object} />;
  }
}

@connect(state => ({pdf: state.pdf, object: state.object}))
export class ObjectStream extends React.Component {
  render() {
    const {pdf, object} = this.props;
    const content_stream = new ContentStream(pdf, object);
    return <ObjectView object={content_stream.buffer} />;
  }
}

@connect(state => ({pdf: state.pdf, object: state.object}))
export class ObjectContentStream extends React.Component {
  render() {
    const {pdf, object} = this.props;
    const content_stream = new ContentStream(pdf, object);
    const stream_buffer_iterable = new BufferIterator(content_stream.buffer);
    const operations = new CONTENT_STREAM(stream_buffer_iterable, 'binary', 1024).read();
    return <ContentStreamOperations operations={operations} />;
  }
}

@connect(state => ({pdf: state.pdf, object: state.object}))
export class ObjectContentStreamLayout extends React.Component {
  render() {
    const {pdf, object} = this.props;
    const content_stream = new ContentStream(pdf, object);
    const layout = renderContentStreamLayout(content_stream, true, 0);
    console.log('layout', layout);
    // layout has fields: outerBounds, textSpans, containers
    return <div>Not yet implemented: "content-stream-layout"</div>;
  }
}

@connect(state => ({pdf: state.pdf, object: state.object}))
export class ObjectContentStreamText extends React.Component {
  render() {
    const {pdf, object} = this.props;
    const content_stream = new ContentStream(pdf, object);
    const spans = renderContentStreamText(content_stream);
    return <ContentStreamText spans={spans} />;
  }
}

@connect(state => ({pdf: state.pdf, object: state.object}))
export class ObjectEncoding extends React.Component {
  render() {
    const {pdf, object} = this.props;
    const FontCtor = Font.getConstructor(object.Subtype);
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
  'encoding',
];

@connect(state => ({pdf: state.pdf}))
export default class PDFObjects extends React.Component {
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
