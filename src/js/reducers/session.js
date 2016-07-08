// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { INIT, LOGIN, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, GET_SETTINGS_SUCCESS } from '../actions/system';

const initialState = {
  username: null,
  error: null,
  headerNavs: null,
  loggedout: false
};

const handlers = {
  [INIT]: (_, action) => ({username: action.username, headerNavs: action.headerNavs}),
  [LOGIN]: (_, action) => ({username: action.username, error: null}),
  [LOGIN_SUCCESS]: (_, action) => ({
    username: action.username,
    error: null,
    headerNavs: action.headerNavs
  }),
  [LOGIN_FAILURE]: (_, action) => ({error: action.error}),
  [LOGOUT]: () => ({
    username: null,
    error: null,
    headerNavs: null,
    loggedout: true
  }),
  [GET_SETTINGS_SUCCESS]: (_, action) => ({headerNavs: action.headerNavs})
};

export default function sessionReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
