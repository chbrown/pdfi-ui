import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, Link, IndexRoute, NotFoundRoute} from 'react-router';
import {combineReducers, createStore, applyMiddleware, compose} from 'redux';
import {Provider, connect} from 'react-redux';
import {reduxReactRouter, routerStateReducer, ReduxRouter} from 'redux-router';
// const createHashHistory = require('history/lib/createHashHistory');
import {createHistory} from 'history';

import * as arrays from 'arrays';
// import {NotifyUI} from 'notify-ui';

import FileSelector from './components/FileSelector';
import PDFNavigator from './components/PDFNavigator';
import PDFDocument from './components/PDFDocument';

import './site.less';

@connect(state => ({routerState: state.router}))
class App extends React.Component {
  render() {
    // <span ng-controller="uploadCtrl">
    //   <span><b>Add PDF:</b></span>
    //   <input type="file" on-upload="uploadFile($file, $event)">
    // </span>
    return (
      <div>
        <nav className="selector">
          <span>
            <b>Load PDF:</b>
            <FileSelector />
          </span>
        </nav>
        {this.props.children}
      </div>
    );
  }
  static propTypes = {
    children: React.PropTypes.node
  }
}

class NotFound extends React.Component {
  render() {
    return <h1 className="hpad">Route not found!</h1>;
  }
}

function pdfReducer(pdf = {}, action) {
  switch (action.type) {
  case 'SET_PDF':
    return action.pdf;
  default:
    return pdf;
  }
}

const reducer = combineReducers({
  router: routerStateReducer,
  pdf: pdfReducer,
});

const store = compose(
  reduxReactRouter({
    createHistory
  })
)(createStore)(reducer);

var react_mount = document.getElementById('app');
ReactDOM.render((
  <Provider store={store}>
    <ReduxRouter>
      <Router history={history}>
        <Route path="/" component={App}>
          <Route path=":name" component={PDFNavigator}>
            <Route path="document" component={PDFDocument} />
          </Route>
          <Route path="*" component={NotFound} />
        </Route>
      </Router>
    </ReduxRouter>
  </Provider>
), react_mount);
