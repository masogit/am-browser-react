// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { METADATA_SUCCESS, METADATA_DETAIL_SUCCESS, METADATA_FILTER_SUCCESS, METADATA_NODE_SUCCESS, METADATA_CURSOR_SUCCESS } from '../actions';

const initialState = {
  rows: [],
  allData: [],
  data: {},
  node: {},
  cursor: {}
};

const handlers = {
  [METADATA_SUCCESS]: (state, action) => {
    return {
      rows: action.rows
    };
  },
  [METADATA_DETAIL_SUCCESS]: (state, action) => {
    return {
      allData: action.allData,
      data: action.data
    };
  },
  [METADATA_FILTER_SUCCESS]: (state, action) => {
    return {
      data: action.data
    };
  },
  [METADATA_NODE_SUCCESS]: (state, action) => {
    return {
      node: action.node
    };
  },
  [METADATA_CURSOR_SUCCESS]: (state, action) => {
    return {
      cursor: action.cursor
    };
  }
};

export default function itemReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
