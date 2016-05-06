// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { REQUEST_VIEWS, RECEIVE_VIEWS_SUCCESS, RECEIVE_VIEWS_FAILURE, SET_SELECTED_VIEW,
  REQUEST_TEMPLATE_TABLE, RECEIVE_TEMPLATE_TABLE_SUCCESS, RECEIVE_TEMPLATE_TABLE_FAILURE,
  NEW_SELECTED_VIEW, UPDATE_SELECTED_VIEW, SYNC_SELECTED_VIEW}
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
  err: ''
};

const setValueByJsonPath = (path, val, obj) => {
  var fields = path.split('.');
  var result = obj;
  for (var i = 0, n = fields.length; i < n && result !== undefined; i++) {
    var field = fields[i];
    if (i === n - 1) {
      result[field] = val;
    } else {
      if (typeof result[field] === 'undefined' || !_.isObject(result[field])) {
        result[field] = {};
      }
      result = result[field];
    }
  }
};

const createObj= (reverse) => {
  var obj = {
    reversefield: reverse.reversefield,
    sqlname: reverse.sqlname,
    label: reverse.label,
    reverse: reverse.reverse,
    body: {
      sqlname: reverse.body_sqlname,
      label: reverse.body_label
    }
  };
  return obj;
};

const generateLinks= (body, elements, row) => {
  // initialize sqlname
  var sqlname = "";
  // check current row if it is one2one link
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    sqlname += ((i == 0) ? "" : ".") + element.sqlname;
    if (!element.card11) {
      if (!body.links) {
        body.links = [];
      }
      let filterLinks = body.links.filter(link => link.sqlname == sqlname);
      let link;
      if (filterLinks && filterLinks.length == 0) {
        // include one2many links
        link = createObj({
          reversefield: element.reversefield,
          sqlname: sqlname,
          label: element.label,
          reverse: element.reverse,
          body_label: element.body_label,
          body_sqlname: element.body_sqlname
        });
      } else {
        link = filterLinks[0];
      }
      // generate fields
      if (i == elements.length - 1) {
        if (!link.body.fields) {
          link.body.fields = [];
        }
        link.body.fields.push({
          label: row.label,
          size: row.size,
          sqlname: row.sqlname,
          type: row.type
        });
      } else {
        generateLinks(link.body, elements.slice(i + 1), row);
      }
      if (filterLinks && filterLinks.length == 0) {
        body.links.push(link);
      }
      // one2many links will break the loop
      break;
    } else {
      // one2one links will push into fields
      if (i == elements.length - 1) {
        if (!body.fields) {
          body.fields = [];
        }
        body.fields.push({
          label: row.label,
          size: row.size,
          sqlname: sqlname + "." + row.sqlname,
          type: row.type
        });
      }
    }
  }
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
  },
  [NEW_SELECTED_VIEW]: (state, action) => {
    return {
      selectedView: _.cloneDeep(emptyViewDef)
    };
  },
  [UPDATE_SELECTED_VIEW]: (state, action) => {
    //console.log("reducer - action.selectedView:");
    //console.log(action.selectedView);
    console.log(state);
    console.log(action);
    let clonedView = _.cloneDeep(action.selectedView);
    setValueByJsonPath(action.path, action.newValue, clonedView);
    return {
      selectedView: clonedView
    };
  },
  [SYNC_SELECTED_VIEW]: (state, action) => {
    //console.log(state.selectedView);
    // temp logic only for function works
    // will refactor later
    let clonedView = _.cloneDeep(state.selectedView);
    let elements = action.elements;
    let row = action.row;
    let body = clonedView.body;
    // only sqlname is same as current table
    let elemLength = elements.length;
    if (elemLength > 0 && (!body || !body.sqlname || body.sqlname == elements[0].sqlname)) {
      // new a view
      if (!body) {
        body = {
          sqlname : elements[0].sqlname,
          label : elements[0].label
        };
      }
      // fields
      if (elemLength == 1) {
        if (!body.fields) {
          body.fields = [];
        }
        let filterFields = body.fields.filter(field => field.sqlname == row.sqlname);
        if (filterFields && filterFields.length == 0 ) {
          body.fields.push({
            label: row.label,
            size: row.size,
            sqlname: row.sqlname,
            type: row.type
          });
        }
      } else {
        // for loop to generate links forever
        generateLinks(body, elements.slice(1), row);
      }
    }
    clonedView.body = body;
    //setValueByJsonPath(action.path, action.newValue, clonedView);
    return {
      selectedView: clonedView
    };
  }
};

export default function viewsReducer(state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return {...state, ...handler(state, action)
};
}
