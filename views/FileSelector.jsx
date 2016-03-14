import React from 'react';
import {browserHistory} from 'react-router';
import {connect} from 'react-redux';

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
    const name = ev.target.value;
    // pushState creates an action that the routerStateReducer handles
    browserHistory.push(`/${name}`);
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
