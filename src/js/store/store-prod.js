// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import DevTools from '../DevTools';

import error from '../reducers/error';
import session from '../reducers/session';
import route from '../reducers/route';
import views from '../reducers/views';
import metadata from '../reducers/metadata';
import ucmdbAdapter from '../reducers/ucmdbAdapter';
import { routerStateReducer, reduxReactRouter } from 'redux-router';
import history from '../RouteHistory';

export default compose(
  reduxReactRouter({history}),
  applyMiddleware(thunk),
  DevTools.instrument()
)(createStore)(combineReducers({session, route, views, metadata, ucmdbAdapter, router: routerStateReducer, error}));
