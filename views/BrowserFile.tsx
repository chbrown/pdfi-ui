import * as React from 'react'
import {push} from 'connected-react-router'
import {connect} from 'react-redux'

import {ConnectProps, readArrayBufferSync} from '../models'
import {bind, readArrayBuffer} from '../util'

class BrowserFile extends React.Component<ConnectProps> {
  @bind
  onFileChange(ev: React.FormEvent) {
    const el = ev.target as HTMLInputElement
    const [file] = Array.from(el.files)
    const {name} = file
    readArrayBuffer(file).then(({arrayBuffer}) => {
      const pdf = readArrayBufferSync(arrayBuffer, {type: 'pdf'})
      this.props.dispatch({type: 'SET_PDF', pdf})
      this.props.dispatch(push(`/${name}`))
    }, error => {
      this.props.dispatch({type: 'LOG', error})
    })
  }
  render() {
    return (
      <section>
        <span>
          <b>Open PDF: </b>
          <form>
            <input type="file" onChange={this.onFileChange} />
          </form>
        </span>
      </section>
    )
  }
}

const ConnectedRemoteFiles = connect()(BrowserFile)

export default ConnectedRemoteFiles
