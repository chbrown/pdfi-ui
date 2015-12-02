import React from 'react';
import {connect} from 'react-redux';
import {pushState} from 'redux-router';

@connect(state => ({router: state.router}))
export default class FileSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }
  componentWillMount() {
    fetch('/files')
    .then(response => response.json())
    .then(files => this.setState({files}));
    // TODO: handle errors
  }
  changed(ev) {
    var name = ev.target.value;
    // pushState creates an action that the routerStateReducer handles
    this.props.dispatch(pushState(null, `/${name}`));
  }
  render() {
    return (
      <select onChange={this.changed.bind(this)} value={this.props.router.params.name}>
        <option value="">-- none selected --</option>
        {this.state.files.map(file => <option key={file.name} value={file.name}>{file.name}</option>)}
      </select>
    );
  }
}
