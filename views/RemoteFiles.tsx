import * as React from 'react'
import {RouteComponentProps, withRouter} from 'react-router'
import {push} from 'connected-react-router'
import {connect} from 'react-redux'

import {ConnectProps, readArrayBufferSync} from '../models'
import {RemoteFile, uploadFiles, listFiles, readFile} from '../remote'
import {bind, readArrayBuffer} from '../util'

type FileSelectorProps = ConnectProps & RouteComponentProps<{name: string}>
interface FileSelectorState {files?: RemoteFile[]}

class RemoteFiles extends React.Component<FileSelectorProps, FileSelectorState> {
  state: FileSelectorState = {}
  componentWillMount() {
    listFiles().then(files => {
      this.setState({files})
    }, error => {
      this.props.dispatch({type: 'LOG', error})
    })
    // take responsibility for loading the desired PDF,
    // though this is a sort of roundabout hack
    const {name} = this.props.match.params
    readFile(name).then(arrayBuffer => {
      const pdf = readArrayBufferSync(arrayBuffer, {type: 'pdf'})
      this.props.dispatch({type: 'SET_PDF', pdf})
    }, error => {
      this.props.dispatch({type: 'LOG', error})
    })
  }
  @bind
  onSelect({currentTarget: {value}}: React.FormEvent<HTMLSelectElement>) {
    readFile(value).then(arrayBuffer => {
      const pdf = readArrayBufferSync(arrayBuffer, {type: 'pdf'})
      this.props.dispatch({type: 'SET_PDF', pdf})
      // push creates an action that the connected-react-router reducer handles
      this.props.dispatch(push(`/${value}`))
    }, error => {
      this.props.dispatch({type: 'LOG', error})
    })
  }
  @bind
  onUpload(ev: React.FormEvent<HTMLInputElement>) {
    const el = ev.currentTarget
    uploadFiles(el.files).then(files => {
      const message = `Uploaded ${files.length} file${files.length > 1 ? 's' : ''}: ${files.map(({name}) => name).join(', ')}`
      this.props.dispatch({type: 'LOG', message})
      this.setState(prevState => ({files: prevState.files.concat(files)}))
      // reset the form after 3 seconds
      setTimeout(() => {
        el.form.reset()
      }, 3000)
      // immediately load the uploaded file
      const [file] = Array.from(el.files)
      return readArrayBuffer(file).then(({name, arrayBuffer}) => {
        const pdf = readArrayBufferSync(arrayBuffer, {type: 'pdf'})
        this.props.dispatch({type: 'SET_PDF', pdf})
        this.props.dispatch(push(`/${name}`))
      })
    }, error => {
      this.props.dispatch({type: 'LOG', error})
    })
  }
  render() {
    const {files} = this.state
    const {name} = this.props.match.params
    return (
      <section>
        <span>
          <b>Load PDF: </b>
          {files ?
            <select onChange={this.onSelect} value={name}>
              <option value="">-- none selected --</option>
              {files.map(file => <option key={file.name} value={file.name}>{file.name}</option>)}
            </select> :
            <i>Loading...</i>}
        </span>
        <span>
          <b>Add PDF: </b>
          <form>
            <input type="file" onChange={this.onUpload} />
          </form>
        </span>
      </section>
    )
  }
}

const ConnectedRemoteFiles = withRouter(connect()(RemoteFiles))

export default ConnectedRemoteFiles
