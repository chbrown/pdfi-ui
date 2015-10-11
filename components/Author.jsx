import React from 'react';
import {AuthorPropTypes} from './propTypes';

export default class Author extends React.Component {
  render() {
    // TODO: is there a way to avoid the {' '} whitespace?
    return (
      <span>
        <span title="first">{this.props.first}</span>
        {' '}
        <span title="middle">{this.props.middle}</span>
        {' '}
        <span title="last">{this.props.last}</span>
      </span>
    );
  }
  static propTypes = AuthorPropTypes
}
