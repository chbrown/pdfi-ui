import * as React from 'react'
import {RouteComponentProps, withRouter} from 'react-router'
import {push} from 'connected-react-router'
import {connect} from 'react-redux'

import {ReduxState, ConnectProps} from '../models'
import {bind} from '../util'

type FileSelectorProps = {files?: {name: string}[]} & ConnectProps & RouteComponentProps<{name: string}>

class FileSelector extends React.Component<FileSelectorProps> {
  @bind
  onChange(ev: React.FormEvent) {
    const {value} = ev.target as HTMLSelectElement
    // pushState creates an action that the routerStateReducer handles
    this.props.dispatch(push(`/${value}`))
  }
  render() {
    const {files} = this.props
    const {name} = this.props.match.params
    return (
      <select onChange={this.onChange} value={name}>
        <option value="">-- none selected --</option>
        {files.map(file => <option key={file.name} value={file.name}>{file.name}</option>)}
      </select>
    )
  }
}

const ConnectedFileSelector = withRouter(connect(({files}: ReduxState) => ({files}))(FileSelector))

export default ConnectedFileSelector
