// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { TEMPLATE_LOAD_SUCCESS, RECORD_LOAD_SUCCESS, DETAIL_RECORD_LOAD_SUCCESS } from '../actions';

const initialState = {
  templates: [],
  records: [],
  record: []
};

const handlers = {
  [TEMPLATE_LOAD_SUCCESS]: (state, action) => {
    return {
      templates: action.templates
    };
  },
  [RECORD_LOAD_SUCCESS]: (state, action) => {
    return {
      records: action.records
    };
  },
  [DETAIL_RECORD_LOAD_SUCCESS]: (state, action) => {
    return {
      record: action.record
    };
  }
};

export default function itemReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}