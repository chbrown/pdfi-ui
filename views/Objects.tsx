import * as React from 'react'
import {Redirect, Route, Switch, RouteComponentProps, withRouter} from 'react-router'
import {NavLink} from 'react-router-dom'
import {connect} from 'react-redux'

import {PDF} from 'pdfi'
import {ContentStream} from 'pdfi/models'
import {Font as pdfiFont} from 'pdfi/font'
import {renderLayoutFromContentStream} from 'pdfi/graphics'
import {PDFBufferIterator} from 'pdfi/parsers'
import {CONTENT_STREAM, CMAP} from 'pdfi/parsers/states'

import {ReduxState, ConnectProps} from '../models'
import ContentStreamOperations from '../components/ContentStream'
// import ContentStreamText from '../components/ContentStreamText'
import Encoding from '../components/Encoding'
import Font from '../components/Font'
import ObjectView from '../components/ObjectView'
import Table from '../components/Table'

class NaiveObjectRaw extends React.Component<{object: any}> {
  render() {
    const {object} = this.props
    return <ObjectView object={object} />
  }
}
export const ObjectRaw = connect(({object}: ReduxState) => ({object}))(NaiveObjectRaw)

class NaiveObjectStream extends React.Component<{pdf: PDF, object: any}> {
  render() {
    const {pdf, object} = this.props
    const contentStream = new ContentStream(pdf, object)
    return <ObjectView object={contentStream.buffer} />
  }
}
export const ObjectStream = connect(({pdf, object}: ReduxState) => ({pdf, object}))(NaiveObjectStream)

class NaiveObjectContentStream extends React.Component<{pdf: PDF, object: any}> {
  render() {
    const {pdf, object} = this.props
    const contentStream = new ContentStream(pdf, object)
    const stream_buffer_iterable = new PDFBufferIterator(contentStream.buffer, 0, pdf)
    const operations = new CONTENT_STREAM(stream_buffer_iterable, 'binary', 1024).read()
    return <ContentStreamOperations operations={operations} />
  }
}
export const ObjectContentStream = connect(({pdf, object}: ReduxState) => ({pdf, object}))(NaiveObjectContentStream)

class NaiveObjectContentStreamLayout extends React.Component<{pdf: PDF, object: any}> {
  render() {
    const {pdf, object} = this.props
    return (
      <div>
        <h3>Error</h3>
        <p>NaiveObjectContentStreamLayout is not yet implemented.</p>
      </div>
    )
    const contentStream = new ContentStream(pdf, object)
    // const layout =
    renderLayoutFromContentStream(contentStream, true) // currently throws
    // layout has fields: outerBounds, textSpans, containers
  }
}
export const ObjectContentStreamLayout = connect(({pdf, object}: ReduxState) => ({pdf, object}))(NaiveObjectContentStreamLayout)

class NaiveObjectCMap extends React.Component<{pdf: PDF, object: any}> {
  render() {
    const {pdf, object} = this.props
    const contentStream = new ContentStream(pdf, object)
    const bufferIterable = new PDFBufferIterator(contentStream.buffer, 0, pdf)
    const cMap = new CMAP(bufferIterable, 'binary', 1024).read()
    const {codeSpaceRanges, mappings, byteLength} = cMap
    return (
      <div>
        <h2>CMap byteLength={byteLength}</h2>

        <h2>codeSpaceRanges</h2>
        <Table objects={codeSpaceRanges} columns={['low', 'high']} />

        <h2>mappings</h2>
        <Table objects={mappings} columns={['src', 'dst', 'byteLength']} />
      </div>
    )
  }
}
export const ObjectCMap = connect(({pdf, object}: ReduxState) => ({pdf, object}))(NaiveObjectCMap)

class NaiveObjectContentStreamText extends React.Component<{pdf: PDF, object: any}> {
  render() {
    // const {pdf, object} = this.props
    // const contentStream = new ContentStream(pdf, object)
    // const spans = renderContentStreamText(contentStream)
    // return <ContentStreamText spans={spans} />
    return (
      <div>
        <h3>Error</h3>
        <p>NaiveObjectContentStreamText is not yet implemented.</p>
      </div>
    )
  }
}
export const ObjectContentStreamText = connect(({pdf, object}: ReduxState) => ({pdf, object}))(NaiveObjectContentStreamText)

class NaiveObjectFont extends React.Component<{pdf: PDF, object: any}> {
  render() {
    const {pdf, object} = this.props
    const FontCtor = pdfiFont.getConstructor(object.Subtype)
    const font = new FontCtor(pdf, object)
    return <Font font={font} />
  }
}
export const ObjectFont = connect(({pdf, object}: ReduxState) => ({pdf, object}))(NaiveObjectFont)

class NaiveObjectEncoding extends React.Component<{pdf: PDF, object: any}> {
  render() {
    const {pdf, object} = this.props
    const FontCtor = pdfiFont.getConstructor(object.Subtype)
    const font = new FontCtor(pdf, object)
    return <Encoding mapping={font.encoding.mapping} characterByteLength={font.encoding.characterByteLength} />
  }
}
export const ObjectEncoding = connect(({pdf, object}: ReduxState) => ({pdf, object}))(NaiveObjectEncoding)

const modes = [
  'raw',
  'stream',
  'content-stream',
  'content-stream-layout',
  'content-stream-text',
  'font',
  'encoding',
  'cmap',
]

interface PDFObjectsRouteParams {
  name: string
  object_number: string
  generation_number: string
}

type PDFObjectsProps = {pdf: PDF} & ConnectProps & RouteComponentProps<PDFObjectsRouteParams>

class PDFObjects extends React.Component<PDFObjectsProps> {
  reloadState(props: PDFObjectsProps) {
    // this just makes it easier for child components to access the current object
    const {match: {params}, pdf} = props
    const object_number = parseInt(params.object_number, 10)
    const generation_number = parseInt(params.generation_number || '0', 10)
    const object = pdf.getObject(object_number, generation_number)
    this.props.dispatch({type: 'SET_OBJECT', object})
  }
  componentWillMount() {
    this.reloadState(this.props)
  }
  render() {
    const {match} = this.props
    const {params} = match
    return (
      <section className="hpad">
        <h2>Object {params.object_number}:{params.generation_number || 0}</h2>
        <div className="hlinks">
          {modes.map((mode, i) =>
            <NavLink key={i} to={`/${params.name}/objects/${params.object_number}/${mode}`}>{mode}</NavLink>
          )}
        </div>
        <Switch>
          <Route path={`${match.path}/raw`} component={ObjectRaw} />
          <Route path={`${match.path}/stream`} component={ObjectStream} />
          <Route path={`${match.path}/content-stream`} component={ObjectContentStream} />
          <Route path={`${match.path}/content-stream-layout`} component={ObjectContentStreamLayout} />
          <Route path={`${match.path}/font`} component={ObjectFont} />
          <Route path={`${match.path}/encoding`} component={ObjectEncoding} />
          <Route path={`${match.path}/cmap`} component={ObjectCMap} />
          <Redirect to={`${match.url}/raw`} />
        </Switch>
      </section>
    )
  }
}

const ConnectedPDFObjects = withRouter(connect(({pdf}: ReduxState) => ({pdf}))(PDFObjects))

export default ConnectedPDFObjects
