import {reduxReactRouter, routerStateReducer} from 'redux-router';
import {combineReducers, createStore, compose} from 'redux';
import {createHistory} from 'history';

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
  storedViewConfig = JSON.parse(localStorage['viewConfig']);
}
catch (exc) { }

function viewConfigReducer(viewConfig = Object.assign(initialViewConfig, storedViewConfig), action) {
  switch (action.type) {
  case 'UPDATE_VIEW_CONFIG':
    var newViewConfig = Object.assign(viewConfig, {[action.key]: action.value});
    localStorage['viewConfig'] = JSON.stringify(newViewConfig);
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

export default store;
