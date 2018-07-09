import * as React from 'react'
import {render} from 'react-dom'

import {createBrowserHistory} from 'history'
import {applyMiddleware, combineReducers, compose, createStore} from 'redux'
import {Provider} from 'react-redux'
import {connectRouter, routerMiddleware, ConnectedRouter} from 'connected-react-router'

import * as reducers from './reducers'

import Root from './views/Root'

import './site.less'

import {setLoggerLevel} from 'pdfi'
setLoggerLevel(20)

function loggerMiddleware({getState}) {
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

render((
  <Provider store={store}>
    <ConnectedRouter history={browserHistory}>
      <Root />
    </ConnectedRouter>
  </Provider>
), document.getElementById('app'))
