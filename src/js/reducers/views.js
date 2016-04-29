// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { REQUEST_VIEWS, RECEIVE_VIEWS_SUCCESS, RECEIVE_VIEWS_FAILURE, SET_SELECTED_VIEW,
  REQUEST_TEMPLATE_TABLE, RECEIVE_TEMPLATE_TABLE_SUCCESS, RECEIVE_TEMPLATE_TABLE_FAILURE,
  UPDATE_SELECTED_VIEW, SYNC_SELECTED_VIEW}
  from '../constants/ActionTypes';
import _ from 'lodash';

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

const createObj= (reverse, baseInfo) => {
  var obj = {
    reversefield: reverse.reversefield,
    sqlname: reverse.sqlname,
    label: reverse.label,
    reverse: reverse.reverse,
    body: {
      sqlname: baseInfo.sqlname,
      label: baseInfo.label
    }
  };
  return obj;
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
    let baseInfo = action.baseInfo;
    let body = clonedView.body;
    // sqlname is same as current table
    let elemLength = elements.length;
    if (elemLength > 0 && body.sqlname == elements[0].sqlname) {
      // fields
      if (elements.length == 1) {
        body.fields.push({
          alias: row.label,
          label: row.label,
          size: row.size,
          sqlname: row.sqlname,
          type: row.type
        });
      } else {
        var isLink = false;
        var sqlname = "";
        // first one2many position
        var one2manyPosition = 1;
        // check current row if it is one2one link
        for (var i = 1; i < elemLength; i ++) {
          var element = elements[i];
          if (!element.card11) {
            isLink = true;
            one2manyPosition = i;
            break;
          }
          // one2one sqlname
          if (i != elemLength - 1) {
            sqlname += element.sqlname + ".";
          } else {
            sqlname += element.sqlname;
          }
        }
        // one2one links will push into fields
        if (!isLink) {
          body.fields.push({
            alias: row.label,
            label: row.label,
            size: row.size,
            sqlname: sqlname,
            type: row.type
          });
        } else {
          if (one2manyPosition == elemLength - 1) {
            // include one2many links
            let link = createObj({
              reversefield: elements[one2manyPosition].reversefield,
              sqlname: elements[one2manyPosition].sqlname,
              label: elements[one2manyPosition].label,
              reverse: elements[one2manyPosition].reverse
            }, baseInfo);
            link.body.fields = [];
            link.body.fields.push({
              alias: row.label,
              label: row.label,
              size: row.size,
              sqlname: row.sqlname,
              type: row.type
            });
            body.links.push(link);
            console.log(body);
          } else {
            // other cases need to handle
          }
        }
      }
    }
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
