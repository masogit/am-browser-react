// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { METADATA_SUCCESS, METADATA_DETAIL_SUCCESS } from '../actions';

const initialState = {
  rows: {},
  elements: []
};

const handlers = {
  [METADATA_SUCCESS]: (state, action) => {
    return {
      rows: action.rows,
      elements: action.elements
    };
  },
  [METADATA_DETAIL_SUCCESS]: (state, action) => {
    return {
      rows: action.rows,
      elements: action.elements
    };
  }
};

export default function itemReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
