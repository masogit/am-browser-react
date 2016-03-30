// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

const initialState = {
  AQLs: [],
  reports: []
};

const handlers = {
  ["RECEIVE_AQLS"]: (state, action) => {
    return {
      AQLs: action.AQLs
    };
  },
  ["RECEIVE_REPORTS"]: (state, action) => {
    return {
      reports: action.reports
    };
  }
};

export default function aqlsReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
