import React from 'react';
import {connect} from 'react-redux';

/**
We use 'name' instead of 'key' since 'key' is absorbed by React and not sent to the component.
*/
@connect(state => ({viewConfig: state.viewConfig}))
export default class ViewConfigCheckbox extends React.Component {
  onChange(ev) {
    const {name} = this.props;
    this.props.dispatch({type: 'UPDATE_VIEW_CONFIG', key: name, value: ev.target.checked});
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
  static propTypes = {
    viewConfig: React.PropTypes.any.isRequired,
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
  }
}
