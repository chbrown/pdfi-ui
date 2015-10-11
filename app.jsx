import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, Link, IndexRoute, NotFoundRoute} from 'react-router';
import {combineReducers, createStore, applyMiddleware, compose} from 'redux';
import {Provider, connect} from 'react-redux';
import {reduxReactRouter, routerStateReducer, ReduxRouter} from 'redux-router';
// const createHashHistory = require('history/lib/createHashHistory');
import {createHistory} from 'history';

// import {NotifyUI} from 'notify-ui';

import FileSelector from './components/FileSelector';
import PDFNavigator from './components/PDFNavigator';
import PDFDocument from './components/PDFDocument';
import PDFObject from './components/PDFObject';
import PDFPageLayout from './components/PDFPageLayout';
import PDFCrossReferences from './components/PDFCrossReferences';
import PDFCitations from './components/PDFCitations';

import './site.less';

@connect(state => ({routerState: state.router}))
class App extends React.Component {
  render() {
    return (
      <div>
        <header>
          <nav>
            <span>
              <b>Load PDF:</b>
              <FileSelector />
            </span>
            <span>
              <b>Add PDF:</b>
              <input type="file" disabled />
            </span>
          </nav>
        </header>
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
            <Route path="cross-references" component={PDFCrossReferences} />
            <Route path="citations" component={PDFCitations} />
            <Route path="page/:page" component={PDFPageLayout} />
            <Route path="object/:object_number" component={PDFObject} />
          </Route>
          <Route path="*" component={NotFound} />
        </Route>
      </Router>
    </ReduxRouter>
  </Provider>
), react_mount);
