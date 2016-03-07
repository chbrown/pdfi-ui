import React from 'react';
import ReactDOM from 'react-dom';

import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import {Router, Route, browserHistory} from 'react-router';
import {syncHistoryWithStore, routerReducer} from 'react-router-redux';

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

// the routerReducer has to be keyed as "routing"
const reducer = combineReducers({...reducers, routing: routerReducer});
const store = createStore(reducer);

const history = syncHistoryWithStore(browserHistory, store);

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
    <Router history={history}>
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
