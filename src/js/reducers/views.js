// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import objectPath from 'object-path';
import * as Types from '../constants/ActionTypes';
import _ from 'lodash';

const initialState = {
  isFetchingViewList: false,
  isFetchingTemplateTable: false,
  views: [],
  selectedView: {},
  selectedViewId: '',
  templateTable: {},
  err: '',
  editing: false,
  preview: false,
  alertForm: null,
  elements: [],
  rows: {}
};

const handlers = {
  [Types.REQUEST_VIEWS]: (state, action) => ({isFetchingViewList: true}),
  [Types.RECEIVE_VIEWS_SUCCESS]: (state, action) => {
    return {
      isFetchingViewList: false,
      views: action.views
    };
  },
  [Types.RECEIVE_VIEWS_FAILURE]: (state, action) => {
    return {
      isFetchingViewList: false,
      err: action.err
    };
  },
  [Types.SET_SELECTED_VIEW]: (state, action) => {
    return {
      selectedViewId: action.selectedViewId,
      selectedView: action.selectedView
    };
  },
  [Types.UPDATE_SELECTED_VIEW]: (state, action) => {
    let editing = state.editing;
    let clonedView = action.selectedView;
    if (!editing) {
      clonedView = _.cloneDeep(action.selectedView);
    }
    objectPath.set(clonedView, action.path, action.newValue);
    return {
      selectedView: clonedView,
      editing: true
    };
  },
  [Types.DELETE_TABLE_ROW]: (state, action) => {
    return {
      selectedView: action.selectedView,
      editing: true
    };
  },
  [Types.DUPLICATE_VIEW_DEF]: (state, action) => {
    return {
      selectedView: action.selectedView,
      editing: true
    };
  },
  [Types.SYNC_SELECTED_VIEW]: (state, action) => {
    return {
      selectedView: action.selectedView
    };
  },
  [Types.SAVE_VIEW_DEF]: (state, action) => {
    return {
      selectedViewId: action.selectedViewId,
      selectedView: action.selectedView,
      editing: false
    };
  },
  [Types.DELETE_VIEW_DEF]: (state, action) => {
    let views = state.views;
    let idx = action.selectedViewId ? _.findIndex(views, {_id: action.selectedViewId}) : -1;
    return {
      selectedViewId: "",
      selectedView: {},
      views: idx < 0 ? views : [...views.slice(0, idx), ...views.slice(idx + 1)]
    };
  },
  [Types.OPEN_PREVIEW]: (state, action) => {
    return {
      preview: true
    };
  },
  [Types.CLOSE_PREVIEW]: (state, action) => {
    return {
      preview: false
    };
  },
  [Types.LOAD_METADATA_DETAIL_SUCCESS]: (state, action) => {
    return {
      rows: action.rows,
      elements: action.elements
    };
  },
  [Types.LOAD_ALL_METADATA_SUCCESS]: (state, action) => {
    return {
      rows: action.rows
    };
  }
};

export default function viewsReducer(state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return {...state, ...handler(state, action)
};
}
