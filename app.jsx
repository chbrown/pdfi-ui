import React from 'react';
import ReactDOM from 'react-dom';
import {Route} from 'react-router';
import {combineReducers, createStore, compose} from 'redux';
import {Provider, connect} from 'react-redux';
import {reduxReactRouter, routerStateReducer, ReduxRouter} from 'redux-router';
import {createHistory} from 'history';
import objectAssign from 'object-assign';

import FileSelector from './components/FileSelector';
import PDFNavigator from './components/PDFNavigator';
import PDFDocument from './components/PDFDocument';
import PDFObject from './components/PDFObject';
import PDFPageLayout from './components/PDFPageLayout';
import PDFCrossReferences from './components/PDFCrossReferences';
import PDFCitations from './components/PDFCitations';

import './site.less';

@connect(state => ({viewConfig: state.viewConfig}))
class App extends React.Component {
  render() {
    var app_className = [
      ...(this.props.viewConfig.outlines ? ['viewConfig-outlines'] : []),
      ...(this.props.viewConfig.labels ? ['viewConfig-labels'] : []),
    ].join(' ');

    return (
      <div className={app_className}>
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
    viewConfig: React.PropTypes.object.isRequired,
    children: React.PropTypes.node,
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

const initialViewConfig = {
  scale: 1.0,
  outlines: true,
  labels: true,
};

var storedViewConfig = {};
try {
  storedViewConfig = JSON.parse(localStorage.viewConfig);
}
catch (exc) { }

function viewConfigReducer(viewConfig = objectAssign({}, initialViewConfig, storedViewConfig), action) {
  switch (action.type) {
  case 'UPDATE_VIEW_CONFIG':
    var newViewConfig = objectAssign({}, viewConfig, {[action.key]: action.value});
    localStorage.viewConfig = JSON.stringify(newViewConfig);
    return newViewConfig;
  default:
    return viewConfig;
  }
}

const reducer = combineReducers({
  router: routerStateReducer,
  pdf: pdfReducer,
  viewConfig: viewConfigReducer,
});

const store = compose(
  reduxReactRouter({createHistory})
)(createStore)(reducer);

ReactDOM.render((
  <Provider store={store}>
    <ReduxRouter>
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
    </ReduxRouter>
  </Provider>
), document.getElementById('app'));
