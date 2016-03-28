// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { REQUEST_VIEWS, RECEIVE_VIEWS } from '../actions';

const initialState = {
  isFetching: false,
  views: [],
  selectedView: ''
};

const handlers = {
  [REQUEST_VIEWS]: (state, action) => ({ isFetching: true }),
  [RECEIVE_VIEWS]: (state, action) => {
    return {
      isFetching: false,
      views: action.views
    };
  }
};

export default function viewsReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
