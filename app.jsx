import React from 'react';
import ReactDOM from 'react-dom';

import {createStore, combineReducers, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import {Router, Route, browserHistory} from 'react-router';
import {syncHistory, routeReducer} from 'react-router-redux';

import * as reducers from './reducers';

import Citations from './views/Citations';
import CrossReferences from './views/CrossReferences';
import Document from './views/Document';
import Navigator from './views/Navigator';
import Objects from './views/Objects';
import PageLayout from './views/PageLayout';
import Root from './views/Root';
import Trailer from './views/Trailer';

import './site.less';

const reducer = combineReducers({...reducers, routing: routeReducer}); // has to be "routing"?
// Sync dispatched route actions to the history
const reduxRouterMiddleware = syncHistory(browserHistory);
const createStoreWithMiddleware = applyMiddleware(reduxRouterMiddleware)(createStore);
const store = createStoreWithMiddleware(reducer);

class NotFound extends React.Component {
  render() {
    return (
      <section className="hpad">
        <h2>Route not found!</h2>
      </section>
    );
  }
}

ReactDOM.render((
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={Root}>
        <Route path=":name" component={Navigator}>
          <Route path="document" component={Document} />
          <Route path="cross-references" component={CrossReferences} />
          <Route path="citations" component={Citations} />
          <Route path="trailer" component={Trailer} />
          <Route path="page/:page" component={PageLayout} />
          <Route path="objects/:object_number" component={Objects} />
        </Route>
        <Route path="*" component={NotFound} />
      </Route>
    </Router>
  </Provider>
), document.getElementById('app'));
