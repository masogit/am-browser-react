// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { REQUEST_VIEWS, RECEIVE_VIEWS_SUCCESS, RECEIVE_VIEWS_FAILURE } from '../constants/ActionTypes';

const initialState = {
  isFetching: false,
  views: [],
  selectedView: '',
  err: ''
};

const handlers = {
  [REQUEST_VIEWS]: (state, action) => ({ isFetching: true }),
  [RECEIVE_VIEWS_SUCCESS]: (state, action) => {
    return {
      isFetching: false,
      views: action.views
    };
  },
  [RECEIVE_VIEWS_FAILURE]: (state, action) => {
    return {
      isFetching: false,
      err: action.err
    };
  }
};

export default function viewsReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
