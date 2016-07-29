import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import ucmdbAdapter from '../../src/js/reducers/ucmdbAdapter';

export default compose(
  applyMiddleware(thunk)
)(createStore)(combineReducers({ucmdbAdapter}));
