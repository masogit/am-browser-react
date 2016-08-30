// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { INIT, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, STOP_MONITOR_EDIT, MONITOR_EDIT, FORCE_LOGOUT  } from '../constants/ActionTypes';

const initialState = {
  email: null,
  error: null,
  headerNavs: null,
  loggedout: false,
  edit: {
    origin: {},
    now: {}
  }
};

const handlers = {
  [INIT]: (_, action) => ({email: action.email, headerNavs: action.headerNavs}),
  [LOGIN_SUCCESS]: (_, action) => ({
    email: action.email,
    error: null,
    headerNavs: action.headerNavs,
    edit: {
      origin: {},
      now: {}
    }
  }),
  [LOGIN_FAILURE]: (_, action) => ({error: action.error}),
  [LOGOUT]: () => ({
    email: null,
    error: null,
    headerNavs: null,
    loggedout: true
  }),
  [FORCE_LOGOUT]: (_, action) => ({
    email: null,
    error: {message: action.error},
    headerNavs: null,
    loggedout: true
  }),
  [MONITOR_EDIT]: (_, action) => ({edit: action.edit}),
  [STOP_MONITOR_EDIT]: (_, action) => ({edit: null})
};

export default function sessionReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
