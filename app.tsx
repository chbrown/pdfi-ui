import * as React from 'react';
import {render} from 'react-dom';

import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {syncHistoryWithStore, routerReducer} from 'react-router-redux';

import * as reducers from './reducers';

import Citations from './views/Citations';
import CrossReferences from './views/CrossReferences';
import Document from './views/Document';
import Navigator from './views/Navigator';
import Objects, {
  ObjectRaw,
  ObjectStream,
  ObjectContentStream,
  ObjectContentStreamLayout,
  ObjectFont,
  ObjectEncoding,
  ObjectCMap,
} from './views/Objects';
import Page, {
  PageLayout,
  PageTree,
  PageTable,
} from './views/PageLayout';
import Root from './views/Root';
import Trailer from './views/Trailer';

import './site.less';

import {setLoggerLevel} from 'pdfi';
setLoggerLevel(20);

// the routerReducer has to be keyed as "routing"
const reducer = combineReducers(Object.assign(reducers, {routing: routerReducer}));
const store = createStore(reducer);
const history = syncHistoryWithStore(browserHistory, store);

class NotFound extends React.Component<{}> {
  render() {
    return (
      <section className="hpad">
        <h2>Route not found!</h2>
      </section>
    );
  }
}

render((
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={Root}>
        <Route path=":name" component={Navigator}>
          <Route path="document" component={Document} />
          <Route path="cross-references" component={CrossReferences} />
          <Route path="citations" component={Citations} />
          <Route path="trailer" component={Trailer} />
          <Route path="pages/:page" component={Page}>
            <IndexRoute component={PageLayout} />
            <Route path="layout" component={PageLayout} />
            <Route path="tree" component={PageTree} />
            <Route path="table" component={PageTable} />
          </Route>
          <Route path="objects/:object_number" component={Objects}>
            <IndexRoute component={ObjectRaw} />
            <Route path="raw" component={ObjectRaw} />
            <Route path="stream" component={ObjectStream} />
            <Route path="content-stream" component={ObjectContentStream} />
            <Route path="content-stream-layout" component={ObjectContentStreamLayout} />
            <Route path="font" component={ObjectFont} />
            <Route path="encoding" component={ObjectEncoding} />
            <Route path="cmap" component={ObjectCMap} />
          </Route>
        </Route>
        <Route path="*" component={NotFound} />
      </Route>
    </Router>
  </Provider>
), document.getElementById('app'));
