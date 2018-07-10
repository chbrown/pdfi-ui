import * as React from 'react'
import {render} from 'react-dom'

import {createBrowserHistory} from 'history'
import {applyMiddleware, combineReducers, compose, createStore, Middleware} from 'redux'
import {Provider} from 'react-redux'
import {Route, Switch} from 'react-router'
import {connectRouter, routerMiddleware, ConnectedRouter} from 'connected-react-router'

import * as reducers from './reducers'

import BrowserFile from './views/BrowserFile'
import RemoteFiles from './views/RemoteFiles'
import Navigator from './views/Navigator'

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

const browserHistory = createBrowserHistory()
const reducer = combineReducers(reducers)
const store = createStore(
  connectRouter(browserHistory)(reducer),
  compose(
    applyMiddleware(
      routerMiddleware(browserHistory),
      loggerMiddleware
    )
  )
)

const NotFound = () => (
  <section className="hpad">
    <h2>Route not found!</h2>
  </section>
)

render((
  <Provider store={store}>
    <ConnectedRouter history={browserHistory}>
      <div>
        <header>
          <nav>
            {/* provide optional match.params.name to RemoteFiles
                for setting current value of select dropdown */}
            <Route path="/:name?" component={RemoteFiles} />
            <BrowserFile />
          </nav>
        </header>
        <Switch>
          <Route path="/:name" component={Navigator} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </ConnectedRouter>
  </Provider>
), document.getElementById('app'))
