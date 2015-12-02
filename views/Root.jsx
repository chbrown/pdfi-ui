import React from 'react';
import {connect} from 'react-redux';

import FileSelector from '../components/FileSelector';

@connect(state => ({viewConfig: state.viewConfig}))
export default class Root extends React.Component {
  render() {
    var app_className = [
      ...(this.props.viewConfig.outlines ? ['viewConfig-outlines'] : []),
      ...(this.props.viewConfig.labels ? ['viewConfig-labels'] : []),
    ].join(' ');

    return (
      <div className={app_className}>
        <header>
          <nav>
            <span>
              <b>Load PDF:</b>
              <FileSelector />
            </span>
            <span>
              <b>Add PDF:</b>
              <input type="file" disabled />
            </span>
          </nav>
        </header>
        {this.props.children}
      </div>
    );
  }
  static propTypes = {
    viewConfig: React.PropTypes.object.isRequired,
    children: React.PropTypes.node,
  }
}
