// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import message from '../reducers/message';
import session from '../reducers/session';
import route from '../reducers/route';
import views from '../reducers/views';
import ucmdbAdapter from '../reducers/ucmdbAdapter';
import { routerStateReducer, reduxReactRouter } from 'redux-router';
import history from '../RouteHistory';

export default compose(
  reduxReactRouter({history}),
  applyMiddleware(thunk)
)(createStore)(combineReducers({session, route, views, ucmdbAdapter, router: routerStateReducer, message}));
