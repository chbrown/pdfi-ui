import * as React from 'react'
import {connect} from 'react-redux'

import {LogEntry, LogLevel, ReduxState, ConnectProps} from '../models'

type LogProps = {log: LogEntry[]} & ConnectProps

class Log extends React.Component<LogProps> {
  render() {
    const {log} = this.props
    return (
      <div className="log">
        {log.map((entry, i) =>
          <article key={i} className={LogLevel[entry.level]}>
            <h4>{LogLevel[entry.level]}</h4>
            <time dateTime={entry.created.toISOString()}>{entry.created.toLocaleString()}</time>
            <p>{entry.message}</p>
          </article>
        )}
      </div>
    )
  }
}

const ConnectedLog = connect(({log}: ReduxState) => ({log}))(Log)

export default ConnectedLog
