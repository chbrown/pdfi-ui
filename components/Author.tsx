import * as React from 'react';
import {AuthorPropTypes} from '../propTypes';

// TODO: is there a way to avoid the {' '} whitespace?
const Author = ({first, middle, last}) => (
  <span>
    <span title="first">{first}</span>
    {' '}
    <span title="middle">{middle}</span>
    {' '}
    <span title="last">{last}</span>
  </span>
);
Author['propTypes'] = AuthorPropTypes;

export default Author;
