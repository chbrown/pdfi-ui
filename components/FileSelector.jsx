import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {pushState} from 'redux-router';

import {fetchFilenames} from '../models';

@connect(state => ({router: state.router}))
export default class FileSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }
  componentDidMount() {
    fetchFilenames((error, filenames) => {
      if (error) throw error;
      var files = filenames.map(filename => ({name: filename}));
      this.setState({files});
    });
  }
  changed(ev) {
    var name = ev.target.value;
    // pushState creates an action that the routerStateReducer handles
    this.props.dispatch(pushState(null, `/${name}`));
  }
  render() {
    //   <ul>
    //     {this.state.files.map(file => (
    //       <li key={file.name}><Link to={`/${file.name}`}>{file.name}</Link></li>
    //     ))}
    //   </ul>
    var options = this.state.files.map(file => <option key={file.name} value={file.name}>{file.name}</option>);
    return (
      <select onChange={this.changed.bind(this)} value={this.props.router.params.name}>
        <option value="">-- none selected --</option>
        {options}
      </select>
    );
  }
}
