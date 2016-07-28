// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { INIT, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT } from '../constants/ActionTypes';

const initialState = {
  email: null,
  error: null,
  headerNavs: null,
  loggedout: false
};

const handlers = {
  [INIT]: (_, action) => ({email: action.email, headerNavs: action.headerNavs}),
  [LOGIN_SUCCESS]: (_, action) => ({
    email: action.email,
    error: null,
    headerNavs: action.headerNavs
  }),
  [LOGIN_FAILURE]: (_, action) => ({error: action.error}),
  [LOGOUT]: () => ({
    email: null,
    error: null,
    headerNavs: null,
    loggedout: true
  })
};

export default function sessionReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
