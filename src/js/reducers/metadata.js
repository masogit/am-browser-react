// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { METADATA_SUCCESS } from '../actions';

const initialState = {
  rows: []
};

const handlers = {
  [METADATA_SUCCESS]: (state, action) => {
    return {
      rows: action.rows
    };
  }
};

export default function itemReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
