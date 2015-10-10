import React from 'react';
import {AuthorPropTypes} from './propTypes';

export default class Authors extends React.Component {
  render() {
    var authors = this.props.authors.map((author, index) => {
      return (
        <span key={index}>
          <span title="first">{author.first}</span>
          <span title="middle">{author.middle}</span>
          <span title="last">{author.last}</span>
        </span>
      );
    });
    return <span>{authors}</span>;
  }
  static propTypes = {
    authors: React.PropTypes.arrayOf(React.PropTypes.shape(AuthorPropTypes)).isRequired,
  }
}
