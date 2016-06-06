// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import {RECEIVE_ERROR, NEW_ERROR_READ} from '../constants/ActionTypes';

const initialState = {
  msgs: [],
  new: null
};

const handlers = {
  [RECEIVE_ERROR]: (state, action) => {
    let date = new Date();
    let msg = {
      time: date.toLocaleString(),
      msg: action.msg
    };
    return {
      msgs: [...state.msgs, msg],
      new: action.msg
    };
  },
  [NEW_ERROR_READ]: (state, action) => {
    return {
      new: null
    };
  }
};

export default function sessionReducer(state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return {...state, ...handler(state, action)};
}
