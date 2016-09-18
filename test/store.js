import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import views from '../src/js/reducers/views';
import message from '../src/js/reducers/message';
import session from '../src/js/reducers/session';
import route from '../src/js/reducers/route';
import ucmdbAdapter from '../src/js/reducers/ucmdbAdapter';

export default compose(
  applyMiddleware(thunk)
)(createStore)(combineReducers({views, message, session, route, ucmdbAdapter}));
