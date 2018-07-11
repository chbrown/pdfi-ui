import * as React from 'react'
import {Name} from 'academia/types'

import {AuthorPropTypes} from '../propTypes'

// TODO: is there a way to avoid the {' '} whitespace?
const Author: React.StatelessComponent<Name> = ({first, middle, last}) => (
  <span>
    <span title="first">{first}</span>
    {' '}
    <span title="middle">{middle}</span>
    {' '}
    <span title="last">{last}</span>
  </span>
)
Author.propTypes = AuthorPropTypes

export default Author
