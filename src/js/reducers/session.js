// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { INIT, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, ADD_TOOL, REMOVE_TOOL,
  STOP_MONITOR_EDIT, MONITOR_EDIT, FORCE_LOGOUT, TOGGLE_SIDEBAR } from '../constants/ActionTypes';

const initialState = {
  email: null,
  error: null,
  headerNavs: null,
  loggedout: false,
  showSidebar: true,
  tools: [],
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
  [STOP_MONITOR_EDIT]: (_, action) => ({edit: null}),
  [TOGGLE_SIDEBAR]: (state, action) => ({showSidebar: !state.showSidebar}),
  [ADD_TOOL]: (state, action) => {
    const tools = state.tools, tool = action.tool;
    if (tools.filter(item => item.id == tool.id).length == 0) {
      return {tools: [...tools, tool]};
    }
  },
  [REMOVE_TOOL]: (state, action) => {
    const tools = state.tools, toolId = action.toolId;
    return {tools: tools.filter(tool => tool.id != toolId)};
  }
};

export default function sessionReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
