import * as React from 'react';
import {browserHistory} from 'react-router';
import {connect} from 'react-redux';

import {ReduxProps} from '../models';
import {assertSuccess, parseContent} from '../util';
import FileSelector from './FileSelector';

@connect(state => ({viewConfig: state.viewConfig}))
export default class Root extends React.Component<{viewConfig: any} & React.Props<any> & ReduxProps, {uploadResult?: string}> {
  constructor(props) {
    super(props);
    this.state = {uploadResult: ''};
  }
  componentWillMount() {
    fetch('/files')
    .then(response => response.json())
    .then(files => {
      this.props.dispatch({type: 'ADD_FILES', files});
    });
    // TODO: handle errors
  }
  onFileChange(ev: React.FormEvent) {
    const el = ev.target as HTMLInputElement;
    // const files = el.multiple ? el.files : el.files[0];
    const body = new FormData()
    Array.from(el.files).forEach(file => {
      body.append('file', file);
    });
    // send to /upload endpoint
    fetch('/upload', {method: 'PUT', body})
    .then(parseContent)
    .then(assertSuccess)
    .then(response => {
      const {files} = response.content as {files: {name: string}[]};
      this.props.dispatch({type: 'ADD_FILES', files});
      const [file] = files;
      browserHistory.push(`/${file.name}`);
      return `Uploaded ${files.length} file${files.length > 1 ? 's' : ''}: ${files.map(({name}) => name).join(', ')}`;
    }, response => {
      const {error} = response.content as {error: string};
      return `Error: ${error}`;
    })
    .then(uploadResult => {
      this.setState({uploadResult});
      setTimeout(() => {
        const form = this.refs['form'] as HTMLFormElement;
        form.reset();
        this.setState({uploadResult: ''});
      }, 3000);
    });
  }
  render() {
    const {children, viewConfig} = this.props;
    const {uploadResult} = this.state;
    const app_className = [
      ...(viewConfig.outlines ? ['viewConfig-outlines'] : []),
      ...(viewConfig.labels ? ['viewConfig-labels'] : []),
    ].join(' ');

    return (
      <div className={app_className}>
        <header>
          <nav>
            <span>
              <b>Load PDF: </b>
              <FileSelector />
            </span>
            <span>
              <b>Add PDF: </b>
              <form ref="form">
                <input type="file" onChange={this.onFileChange.bind(this)} />
              </form>
              <i>{uploadResult}</i>
            </span>
          </nav>
        </header>
        {children}
      </div>
    );
  }
  static propTypes: React.ValidationMap<any> = {
    viewConfig: React.PropTypes.object.isRequired,
    children: React.PropTypes.node,
  };
}
