// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import {RECEIVE_ERROR, RECEIVE_INFO, RECEIVE_WARNING, MESSAGE_READ} from '../constants/ActionTypes';

const initialState = {
  msgs: [],
  status: null,
  msg: null
};

const handlers = {
  [RECEIVE_ERROR]: (state, action) => {
    let date = new Date();
    let msg = {
      time: date.toLocaleString(),
      status: 'critical',
      msg: action.msg
    };
    return {
      msgs: [...state.msgs, msg],
      status: 'critical',
      msg: action.msg
    };
  },
  [RECEIVE_INFO]: (state, action) => {
    let date = new Date();
    let msg = {
      time: date.toLocaleString(),
      status: 'ok',
      msg: action.msg
    };
    return {
      msgs: [...state.msgs, msg],
      status: 'ok',
      msg: action.msg
    };
  },
  [RECEIVE_WARNING]: (state, action) => {
    let date = new Date();
    let msg = {
      time: date.toLocaleString(),
      status: 'warning',
      msg: action.msg
    };
    return {
      msgs: [...state.msgs, msg],
      status: 'warning',
      msg: action.msg
    };
  },
  [MESSAGE_READ]: (state, action) => {
    return {
      msg: null
    };
  }
};

export default function sessionReducer(state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return {...state, ...handler(state, action)};
}
