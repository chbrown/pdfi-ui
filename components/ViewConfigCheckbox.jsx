import React from 'react';
import {connect} from 'react-redux';

/**
We use 'name' instead of 'key' since 'key' is absorbed by React and not sent to the component.
*/
@connect(state => ({viewConfig: state.viewConfig}))
export default class ViewConfigCheckbox extends React.Component {
  onChange(ev) {
    this.props.dispatch({type: 'UPDATE_VIEW_CONFIG', key: this.props.name, value: ev.target.checked});
  }
  render() {
    return (
      <label>
        <input type="checkbox" checked={this.props.viewConfig[this.props.name]} onChange={this.onChange.bind(this)} />
        <span>{this.props.label}</span>
      </label>
    );
  }
  static propTypes = {
    viewConfig: React.PropTypes.any.isRequired,
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
  }
}
