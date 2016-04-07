import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import views from '../../src/js/reducers/views';

export default compose(
  applyMiddleware(thunk)
)(createStore)(combineReducers({views}));
