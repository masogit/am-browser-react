// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import {RECEIVE_ERROR, RECEIVE_INFO, RECEIVE_WARNING, MESSAGE_READ, ALERT } from '../constants/ActionTypes';

const getId = () => new Date() - new Date('2016-01-01');

const initialState = {
  msgs: [],
  status: null,
  msg: null,
  onConfirm: null,
  title: '',
  id: getId()
};



const handlers = {
  [RECEIVE_ERROR]: (state, action) => {
    let date = new Date();
    let msg = {
      time: date.toLocaleString(),
      status: 'critical',
      msg: action.msg,
      id: getId()
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
      msg: action.msg,
      id: getId()
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
      msg: action.msg,
      id: getId()
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
  },
  [ALERT]: (_, action) => ({msg: action.msg, onConfirm: action.onConfirm, title: action.title, status: null})
};

export default function sessionReducer(state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return {...state, ...handler(state, action)};
}
