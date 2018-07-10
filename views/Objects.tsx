import * as React from 'react'
import {Redirect, Route, Switch, RouteComponentProps, withRouter} from 'react-router'
import {NavLink} from 'react-router-dom'
import {connect} from 'react-redux'

import {PDF} from 'pdfi'
import {PDFObject} from 'pdfi/pdfdom'
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

interface ObjectProps {
  object: PDFObject
}

const ObjectRaw: React.StatelessComponent<ObjectProps> = ({object}) => (
  <ObjectView object={object} />
)

interface ObjectWithPDFProps extends ObjectProps {
  pdf: PDF
}

const ObjectStream: React.StatelessComponent<ObjectWithPDFProps> = ({pdf, object}) => (
  <ObjectView object={new ContentStream(pdf, object).buffer} />
)

const ObjectContentStream: React.StatelessComponent<ObjectWithPDFProps> = ({pdf, object}) => {
  const contentStream = new ContentStream(pdf, object)
  const stream_buffer_iterable = new PDFBufferIterator(contentStream.buffer, 0, pdf)
  const operations = new CONTENT_STREAM(stream_buffer_iterable, 'binary', 1024).read()
  return <ContentStreamOperations operations={operations} />
}

const ObjectContentStreamLayout: React.StatelessComponent<ObjectWithPDFProps> = ({pdf, object}) => {
  return (
    <div>
      <h3>Error</h3>
      <p>ObjectContentStreamLayout is not yet implemented.</p>
    </div>
  )
  const contentStream = new ContentStream(pdf, object)
  // const layout =
  renderLayoutFromContentStream(contentStream, true) // currently throws
  // layout has fields: outerBounds, textSpans, containers
}

const ObjectCMap: React.StatelessComponent<ObjectWithPDFProps> = ({pdf, object}) => {
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

const ObjectContentStreamText: React.StatelessComponent<ObjectWithPDFProps> = ({pdf, object}) => {
  const contentStream = new ContentStream(pdf, object)
  // const spans = renderContentStreamText(contentStream)
  // return <ContentStreamText spans={spans} />
  return (
    <div>
      <h3>Error</h3>
      <p>ObjectContentStreamText is not yet implemented.</p>
      <ObjectView object={contentStream.buffer} />
    </div>
  )
}

const ObjectFont: React.StatelessComponent<ObjectWithPDFProps> = ({pdf, object}) => {
  if (!pdfiFont.isFont(object)) {
    throw new Error('Cannot load object as Font')
  }
  const FontCtor = pdfiFont.getConstructor(object.Subtype)
  const font = new FontCtor(pdf, object)
  return <Font font={font} />
}

const ObjectEncoding: React.StatelessComponent<ObjectWithPDFProps> = ({pdf, object}) => {
  if (!pdfiFont.isFont(object)) {
    throw new Error('Cannot load object as Font')
  }
  const FontCtor = pdfiFont.getConstructor(object.Subtype)
  const font = new FontCtor(pdf, object)
  return <Encoding {...font.encoding} />
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
]

interface PDFObjectsRouteParams {
  name: string
  object_number: string
  generation_number: string
}

type PDFObjectsProps = {pdf: PDF} & ConnectProps & RouteComponentProps<PDFObjectsRouteParams>

interface PDFObjectsState {
  object?: PDFObject
  error?: Error
}

class PDFObjects extends React.Component<PDFObjectsProps, PDFObjectsState> {
  state: PDFObjectsState = {}
  static getDerivedStateFromProps(props: PDFObjectsProps) {
    const {match: {params}, pdf} = props
    const object_number = parseInt(params.object_number, 10)
    const generation_number = parseInt(params.generation_number || '0', 10)
    const object = pdf.getObject(object_number, generation_number)
    return {object}
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PDFObjects#componentDidCatch', error, errorInfo)
    this.setState({error});
  }
  render() {
    const {match, pdf} = this.props
    const {params} = match
    const {object, error} = this.state
    return (
      <section className="hpad">
        <h2>Object {params.object_number}:{params.generation_number || 0}</h2>
        <div className="hlinks">
          {modes.map((mode, i) =>
            <NavLink key={i} to={`/${params.name}/objects/${params.object_number}/${mode}`}>{mode}</NavLink>
          )}
        </div>
        {error ?
          <div>
            <h4>Error:</h4>
            <p>{error.toString()}</p>
          </div> :
          <Switch>
            <Route path={`${match.path}/raw`}>
              <ObjectRaw object={object} />
            </Route>
            <Route path={`${match.path}/stream`}>
              <ObjectStream object={object} pdf={pdf} />
            </Route>
            <Route path={`${match.path}/content-stream`}>
              <ObjectContentStream object={object} pdf={pdf} />
            </Route>
            <Route path={`${match.path}/content-stream-layout`}>
              <ObjectContentStreamLayout object={object} pdf={pdf} />
            </Route>
            <Route path={`${match.path}/content-stream-text`}>
              <ObjectContentStreamText object={object} pdf={pdf} />
            </Route>
            <Route path={`${match.path}/font`}>
              <ObjectFont object={object} pdf={pdf} />
            </Route>
            <Route path={`${match.path}/encoding`}>
              <ObjectEncoding object={object} pdf={pdf} />
            </Route>
            <Route path={`${match.path}/cmap`}>
              <ObjectCMap object={object} pdf={pdf} />
            </Route>
            <Redirect to={`${match.url}/raw`} />
          </Switch>}
      </section>
    )
  }
}

const ConnectedPDFObjects = withRouter(connect(({pdf}: ReduxState) => ({pdf}))(PDFObjects))

export default ConnectedPDFObjects
