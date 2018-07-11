import * as React from 'react'
import {render} from 'react-dom'

import {createHashHistory} from 'history'
import {applyMiddleware, combineReducers, compose, createStore, Middleware} from 'redux'
import {Provider} from 'react-redux'
import {Route, Switch} from 'react-router'
import {NavLink} from 'react-router-dom'
import {connectRouter, routerMiddleware, ConnectedRouter} from 'connected-react-router'

import * as reducers from './reducers'

import BrowserFile from './views/BrowserFile'
import RemoteFiles from './views/RemoteFiles'
import Navigator from './views/Navigator'
import Log from './views/Log'

import './site.less'

import {setLoggerLevel} from 'pdfi'
setLoggerLevel(20)

const loggerMiddleware: Middleware = ({getState}) => {
  return next => action => {
    console.info('will dispatch', action)
    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action)
    console.info('state after dispatch', getState())
    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue
  }
}

const history = createHashHistory()
const reducer = combineReducers(reducers)
const store = createStore(
  connectRouter(history)(reducer),
  compose(
    applyMiddleware(
      routerMiddleware(history),
      loggerMiddleware
    )
  )
)

const NotFound = () => (
  <section className="hpad" style={{maxWidth: '40em'}}>
    <h2><code>pdfi-ui</code></h2>
    <p>
      <code>pdfi-ui</code> is a web demo of the PDF parsing capabilities of <a href="https://github.com/chbrown/pdfi"><code>pdfi</code></a>.
    </p>
    <p>
      To get started, use the "Open PDF" file input above to read in a PDF.
    </p>
    <p>
      This file is temporarily loaded into your browser — it is not sent off to a server.
      <br />
      All PDF processing happens in your browser.
    </p>
    <p>
      When developing <code>pdfi</code> or <code>pdfi-ui</code> locally,
      there is support for listing and reading files from a local directory,
      via nginx's <code>autoindex</code> module.
      When this fails, the navbar will read "Remote files unavailable."
    </p>
    <h4>Source code</h4>
    <ul>
      <li><code>pdfi</code>: <a href="https://github.com/chbrown/pdfi"><code>https://github.com/chbrown/pdfi</code></a></li>
      <li><code>pdfi-ui</code>: <a href="https://github.com/chbrown/pdfi-ui"><code>https://github.com/chbrown/pdfi-ui</code></a></li>
    </ul>
  </section>
)

render((
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <header>
          <nav>
            {/* provide optional match.params.name to RemoteFiles
                for setting current value of select dropdown */}
            <Route path="/:name?" component={RemoteFiles} />
            <BrowserFile />
            <section className="right last">
              <NavLink exact to="/">Reset</NavLink>
            </section>
          </nav>
        </header>
        <Switch>
          <Route path="/:name" component={Navigator} />
          <Route component={NotFound} />
        </Switch>
        <Log />
      </div>
    </ConnectedRouter>
  </Provider>
), document.getElementById('app'))
