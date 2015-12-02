import React from 'react';
import ReactDOM from 'react-dom';
import {Route, IndexRoute} from 'react-router';
import {Provider} from 'react-redux';
import {ReduxRouter} from 'redux-router';

import store from './store';

import Root from './views/Root';
import Navigator from './views/Navigator';
import Document from './views/Document';
import Objects from './views/Objects';
import PageLayout from './views/PageLayout';
import CrossReferences from './views/CrossReferences';
import Citations from './views/Citations';

import './site.less';

class NotFound extends React.Component {
  render() {
    return <h1 className="hpad">Route not found!</h1>;
  }
}

ReactDOM.render((
  <Provider store={store}>
    <ReduxRouter>
      <Route path="/" component={Root}>
        <Route path=":name" component={Navigator}>
          <Route path="document" component={Document} />
          <Route path="cross-references" component={CrossReferences} />
          <Route path="citations" component={Citations} />
          <Route path="page/:page" component={PageLayout} />
          <Route path="objects/:object_number" component={Objects} />
        </Route>
        <Route path="*" component={NotFound} />
      </Route>
    </ReduxRouter>
  </Provider>
), document.getElementById('app'));
