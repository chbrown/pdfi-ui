import * as React from 'react';
import {connect} from 'react-redux';

import {ReduxProps} from '../models';

/**
We use 'name' instead of 'key' since 'key' is absorbed by React and not sent to the component.
*/
@connect(state => ({viewConfig: state.viewConfig}))
export default class ViewConfigCheckbox extends React.Component<{viewConfig?: any, name: string, label: string} & ReduxProps, {}> {
  onChange(ev: React.FormEvent) {
    const {checked} = ev.target as HTMLInputElement;
    const {name} = this.props;
    this.props.dispatch({type: 'UPDATE_VIEW_CONFIG', key: name, value: checked});
  }
  render() {
    const {viewConfig, name, label} = this.props;
    return (
      <label>
        <input type="checkbox" checked={viewConfig[name]} onChange={this.onChange.bind(this)} />
        <span>{label}</span>
      </label>
    );
  }
  static propTypes: React.ValidationMap<any> = {
    viewConfig: React.PropTypes.any.isRequired,
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
  };
}
