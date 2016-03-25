// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

// TODO: fix webpack loader to allow import * from './reducers'
import session from '../reducers/session';
import route from '../reducers/route';
import nav from '../reducers/nav';
import index from '../reducers/index';
import views from '../reducers/views';

export default compose(
  applyMiddleware(thunk)
)(createStore)(combineReducers({session, route, nav, index, views}));
