// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { REQUEST_VIEWS, RECEIVE_VIEWS_SUCCESS, RECEIVE_VIEWS_FAILURE, SET_SELECTED_VIEW, REQUEST_TEMPLATE_TABLE, RECEIVE_TEMPLATE_TABLE_SUCCESS, RECEIVE_TEMPLATE_TABLE_FAILURE }
  from '../constants/ActionTypes';

const initialState = {
  isFetchingViewList: false,
  isFetchingTemplateTable: false,
  views: [],
  selectedView: {},
  selectedViewId: '',
  templateTable: {},
  err: ''
};

const handlers = {
  [REQUEST_VIEWS]: (state, action) => ({isFetchingViewList: true}),
  [RECEIVE_VIEWS_SUCCESS]: (state, action) => {
    return {
      isFetchingViewList: false,
      views: action.views
    };
  },
  [RECEIVE_VIEWS_FAILURE]: (state, action) => {
    return {
      isFetchingViewList: false,
      err: action.err
    };
  },
  [SET_SELECTED_VIEW]: (state, action) => {
    return {
      selectedViewId: action.selectedViewId,
      selectedView: action.selectedView
    };
  },
  [REQUEST_TEMPLATE_TABLE]: (state, action) => {
    console.log("reducer REQUEST_TEMPLATE_TABLE - selectedViewId: " + action.selectedViewId);
    return {
      isFetchingTemplateTable: true,
      selectedViewId: action.selectedViewId
    };
  },
  [RECEIVE_TEMPLATE_TABLE_SUCCESS]: (state, action) => {
    return {
      isFetchingTemplateTable: false,
      views: action.templateTable
    };
  },
  [RECEIVE_TEMPLATE_TABLE_FAILURE]: (state, action) => {
    return {
      isFetchingTemplateTable: false,
      err: action.err
    };
  }
};

export default function viewsReducer(state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return {...state, ...handler(state, action)
};
}
