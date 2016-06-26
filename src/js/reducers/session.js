// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { INIT, LOGIN, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, GET_SETTINGS_SUCCESS } from '../actions/system';

const initialState = {
  email: null,
  error: null,
  headerNavs: null
};

const handlers = {
  [INIT]: (_, action) => ({email: action.email, headerNavs: action.headerNavs}),
  [LOGIN]: (_, action) => ({email: action.email, error: null}),
  [LOGIN_SUCCESS]: (_, action) => ({
    email: action.email,
    error: null,
    headerNavs: action.headerNavs
  }),
  [LOGIN_FAILURE]: (_, action) => ({error: action.error}),
  [LOGOUT]: () => initialState,
  [GET_SETTINGS_SUCCESS]: (_, action) => ({headerNavs: action.headerNavs})
};

export default function sessionReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
