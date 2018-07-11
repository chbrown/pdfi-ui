import * as React from 'react'
import {connect} from 'react-redux'

import {ViewConfig, ReduxState, ConnectProps} from '../models'
import {bind} from '../util'

export interface ViewConfigCheckboxProps {
  viewConfig: ViewConfig
  name: 'outlines' | 'labels' // keyof ViewConfig
  label: string
}

/**
We use 'name' instead of 'key' since 'key' is absorbed by React and not sent to the component.
*/
class ViewConfigCheckbox extends React.Component<ViewConfigCheckboxProps & ConnectProps> {
  @bind
  onChange(ev: React.FormEvent) {
    const {checked} = ev.target as HTMLInputElement
    const {name} = this.props
    this.props.dispatch({type: 'UPDATE_VIEW_CONFIG', key: name, value: checked})
  }
  render() {
    const {viewConfig, name, label} = this.props
    return (
      <label>
        <input type="checkbox" checked={viewConfig[name]} onChange={this.onChange} />
        <span>{label}</span>
      </label>
    )
  }
}

const ConnectedViewConfigCheckbox = connect(({viewConfig}: ReduxState) => ({viewConfig}))(ViewConfigCheckbox)

export default ConnectedViewConfigCheckbox
