import React from 'react';
import {AuthorPropTypes} from '../propTypes';

const Author = ({first, middle, last}) => {
  // TODO: is there a way to avoid the {' '} whitespace?
  return (
    <span>
      <span title="first">{first}</span>
      {' '}
      <span title="middle">{middle}</span>
      {' '}
      <span title="last">{last}</span>
    </span>
  );
};
Author.propTypes = AuthorPropTypes;

export default Author;
