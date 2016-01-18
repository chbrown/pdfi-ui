import React from 'react';
import {connect} from 'react-redux';
import {routeActions} from 'redux-simple-router';

@connect(state => ({filename: state.filename}))
export default class FileSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
    };
  }
  componentWillMount() {
    fetch('/files')
    .then(response => response.json())
    .then(files => this.setState({files}));
    // TODO: handle errors
  }
  onChange(ev) {
    var name = ev.target.value;
    // pushState creates an action that the routerStateReducer handles
    this.props.dispatch(routeActions.push(`/${name}`));
  }
  render() {
    const {filename} = this.props;
    return (
      <select onChange={this.onChange.bind(this)} value={filename}>
        <option value="">-- none selected --</option>
        {this.state.files.map(file => <option key={file.name} value={file.name}>{file.name}</option>)}
      </select>
    );
  }
}
