// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import objectPath from 'object-path';
import { REQUEST_VIEWS, RECEIVE_VIEWS_SUCCESS, RECEIVE_VIEWS_FAILURE, SET_SELECTED_VIEW,
  REQUEST_TEMPLATE_TABLE, RECEIVE_TEMPLATE_TABLE_SUCCESS, RECEIVE_TEMPLATE_TABLE_FAILURE,
  NEW_SELECTED_VIEW, UPDATE_SELECTED_VIEW, SYNC_SELECTED_VIEW, SAVE_VIEW_DEF, DELETE_TABLE_ROW,
  DUPLICATE_VIEW_DEF, DELETE_VIEW_DEF, UPDATE_VIEW_DEF_LIST, OPEN_PREVIEW, CLOSE_PREVIEW,
  ALERT_FORM, LOAD_METADATA_DETAIL_SUCCESS, LOAD_ALL_METADATA_SUCCESS}
  from '../constants/ActionTypes';
import _ from 'lodash';
import emptyViewDef from './EmptyViewDef.json';

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
  [REQUEST_VIEWS]: (state, action) => ({isFetchingViewList: true}),
  [RECEIVE_VIEWS_SUCCESS]: (state, action) => {
    return {
      isFetchingViewList: false,
      views: action.views
    };
  },
  [UPDATE_VIEW_DEF_LIST]: (state, action) => {
    let views = state.views;
    let idx = _.findIndex(state.views, {_id: action.selectedView._id});
    if (idx >= 0) {
      views[idx] = action.selectedView;
    } else {
      views.push(action.selectedView);
    }
    return {
      views: [...views]
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
  },
  [NEW_SELECTED_VIEW]: (state, action) => {
    return {
      selectedView: _.cloneDeep(emptyViewDef)
    };
  },
  [UPDATE_SELECTED_VIEW]: (state, action) => {
    //console.log("reducer - action.selectedView:");
    //console.log(action.selectedView);
    let editing = state.views.editing;
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
  [DELETE_TABLE_ROW]: (state, action) => {
    return {
      selectedView: action.selectedView,
      editing: true
    };
  },
  [DUPLICATE_VIEW_DEF]: (state, action) => {
    return {
      selectedView: action.selectedView,
      editing: true,
      alertForm: action.alertForm
    };
  },
  [SYNC_SELECTED_VIEW]: (state, action) => {
    return {
      selectedView: action.selectedView
    };
  },
  [SAVE_VIEW_DEF]: (state, action) => {
    return {
      selectedViewId: action.selectedViewId,
      selectedView: action.selectedView,
      editing: action.editing,
      alertForm: action.alertForm
    };
  },
  [DELETE_VIEW_DEF]: (state, action) => {
    return {
      selectedViewId: action.selectedViewId,
      selectedView: action.selectedView,
      views: action.views
    };
  },
  [OPEN_PREVIEW]: (state, action) => {
    return {
      preview: action.preview
    };
  },
  [CLOSE_PREVIEW]: (state, action) => {
    return {
      preview: action.preview
    };
  },
  [ALERT_FORM]: (state, action) => {
    return {
      alertForm: action.alertForm
    };
  },
  [LOAD_METADATA_DETAIL_SUCCESS]: (state, action) => {
    return {
      rows: action.rows,
      elements: action.elements
    };
  },
  [LOAD_ALL_METADATA_SUCCESS]: (state, action) => {
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
