import * as React from 'react'
import {push} from 'connected-react-router'
import {connect} from 'react-redux'

import {ReduxState, ConnectProps} from '../models'
import {bind} from '../util'

class FileSelector extends React.Component<{filename?: string, files?: {name: string}[]} & ConnectProps> {
  @bind
  onChange(ev: React.FormEvent) {
    const {value} = ev.target as HTMLSelectElement
    // pushState creates an action that the routerStateReducer handles
    this.props.dispatch(push(`/${value}`))
  }
  render() {
    const {filename, files} = this.props
    return (
      <select onChange={this.onChange} value={filename}>
        <option value="">-- none selected --</option>
        {files.map(file => <option key={file.name} value={file.name}>{file.name}</option>)}
      </select>
    )
  }
}

const mapStateToProps = ({filename, files}: ReduxState) => ({filename, files})
const ConnectedFileSelector = connect(mapStateToProps)(FileSelector)

export default ConnectedFileSelector
