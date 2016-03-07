import React from 'react';
import {connect} from 'react-redux';
import {StringIterator} from 'lexing';

import pdfi_models from 'pdfi/models';
import pdfi_font from 'pdfi/font';
import {renderContentStreamLayout, renderContentStreamText} from 'pdfi/graphics';
import {CONTENT_STREAM} from 'pdfi/parsers/states';

import ContentStream from '../components/ContentStream';
import ContentStreamText from '../components/ContentStreamText';
import Encoding from '../components/Encoding';
import ObjectView from '../components/ObjectView';

function renderMode(mode, pdf, object_number, generation_number) {
  let object = pdf.getObject(object_number, generation_number);

  if (mode.includes('stream')) {
    // if (pdfi_models.ContentStream.isContentStream(req.object))
    let content_stream = new pdfi_models.ContentStream(pdf, object);
    if (mode === 'stream') {
      let stream_string = content_stream.buffer.toString('binary');
      return <ObjectView object={stream_string} />;
    }
    else if (mode === 'content-stream') {
      let stream_string = content_stream.buffer.toString('binary');
      let stream_string_iterable = new StringIterator(stream_string);
      let operations = new CONTENT_STREAM(stream_string_iterable, 1024).read();
      return <ContentStream operations={operations} />;
    }
    else if (mode === 'content-stream-layout') {
      let layout = renderContentStreamLayout(content_stream, true, 0);
      // layout has fields: outerBounds, textSpans, containers
      return <div>Not yet implemented: "content-stream-layout"</div>;
    }
    else if (mode === 'content-stream-text') { // aka. 'text-canvas'
      let spans = renderContentStreamText(content_stream);
      return <ContentStreamText spans={spans} />;
    }
  }
  else if (mode === 'encoding') {
    let font_object = new pdfi_models.Model(pdf, object).object;
    let Font = pdfi_font.Font.getConstructor(font_object.Subtype);
    let font = new Font(pdf, font_object);
    return <Encoding mapping={font.encoding.mapping} characterByteLength={font.encoding.characterByteLength} />;
  }
  else { // if (mode === 'raw')
    return <ObjectView object={object} />;
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
  constructor(props) {
    super(props);
    this.state = {mode: 'raw'};
  }
  onModeChange(mode) {
    this.setState({mode});
  }
  render() {
    const {params, pdf} = this.props;
    const object_number = parseInt(params.object_number, 10);
    const generation_number = parseInt(params.generation_number || 0, 10);

    const modeLinks = modes.map((mode, i) => {
      return <span key={i} onClick={this.onModeChange.bind(this, mode)}>{mode}</span>;
    });

    const children = renderMode(this.state.mode, pdf, object_number, generation_number);

    return (
      <section className="hpad">
        <h2>Object {object_number}:{generation_number}</h2>
        <div className="hlinks">{modeLinks}</div>
        {children}
      </section>
    );
  }
}
