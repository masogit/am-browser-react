// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import objectPath from 'object-path';
import { REQUEST_VIEWS, RECEIVE_VIEWS_SUCCESS, RECEIVE_VIEWS_FAILURE, SET_SELECTED_VIEW,
  REQUEST_TEMPLATE_TABLE, RECEIVE_TEMPLATE_TABLE_SUCCESS, RECEIVE_TEMPLATE_TABLE_FAILURE,
  NEW_SELECTED_VIEW, UPDATE_SELECTED_VIEW, SYNC_SELECTED_VIEW, SAVE_VIEW_DEF, DELETE_TABLE_ROW,
  DUPLICATE_VIEW_DEF, DELETE_VIEW_DEF, UPDATE_VIEW_DEF_LIST, OPEN_PREVIEW, CLOSE_PREVIEW,
  ALERT_FORM}
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
  alertForm: null
};

const createReverse = (reverse) => {
  var obj = {
    sqlname: reverse.sqlname,
    label: reverse.label,
    src_field: reverse.src_field,
    dest_field: reverse.dest_field,
    body: {
      sqlname: reverse.body_sqlname,
      label: reverse.body_label,
      fields: [],
      links: []
    }
  };
  return obj;
};

const generateFieldsLinks = (body, elements, row) => {
  // initialize variable sqlname
  var sqlname = "";
  // check current row if it is one2one link
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    sqlname += ((i == 0) ? "" : ".") + element.sqlname;
    if (!element.card11) {
      if (!body.links) {
        body.links = [];
      }
      var filterLinks = body.links.filter(link => link.sqlname == sqlname);
      var link = {};
      var isLinkNotExisted = filterLinks && filterLinks.length == 0;
      // check loop one2many link if exists in current links array
      if (isLinkNotExisted) {
        // create a new link with body
        var reverse = _.cloneDeep(element);
        // set reverse sqlname
        reverse.sqlname = sqlname;
        // set relative_path
        var position = sqlname.lastIndexOf(".");
        var prefix = "";
        if (position != -1) {
          prefix = sqlname.substring(0, position);
        }
        reverse.src_field.relative_path = prefix;
        // create a reverse link
        link = createReverse(reverse);
      } else {
        // get first match
        link = filterLinks[0];
      }
      // generate fields
      if (i == elements.length - 1) {
        if (!link.body.fields) {
          link.body.fields = [];
        }
        link.body.fields.push(row);
      } else {
        generateFieldsLinks(link.body, elements.slice(i + 1), row);
      }
      // push new link to links
      if (isLinkNotExisted) {
        body.links.push(link);
      }
      // one2many links will break the loop
      break;
    } else {
      // one2one links will be pushed into body fields
      if (i == elements.length - 1) {
        if (!body.fields) {
          body.fields = [];
        }
        var newRow = _.cloneDeep(row);
        newRow.sqlname = sqlname + "." + row.sqlname;
        var filterFields = body.fields.filter(field => field.sqlname == newRow.sqlname);
        // current field can only be pushed once
        if (filterFields && filterFields.length == 0) {
          body.fields.push(newRow);
        } else {
          console.log("Current one2one field exists on table:" + body.sqlname);
        }
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
    // temp logic only for function works
    // will refactor later
    var clonedView = _.cloneDeep(state.selectedView);
    var elements = action.elements;
    var row = action.row;
    var body = clonedView.body;
    var elemLength = elements.length;
    // 1) create a new view: body.sqlname is empty
    // 2) update an existed view: body.sqlname should be equal to root table
    if (elemLength > 0 && (!body.sqlname || body.sqlname == elements[0].sqlname)) {
      // new a view
      if (!body.sqlname) {
        body.sqlname = elements[0].sqlname;
        body.label = elements[0].label;
        console.log("Created a new by sqlname:" + body.sqlname);
      }
      // fields
      if (elemLength == 1) {
        // check first level fields if exists
        if (!body.fields) {
          body.fields = [];
        }
        var filterFields = body.fields.filter(field => field.sqlname == row.sqlname);
        // current field can only be pushed once
        if (filterFields && filterFields.length == 0) {
          body.fields.push(row);
        } else {
          console.log("Current field exists on table:" + body.sqlname);
        }
      } else {
        // for loop to generate links
        generateFieldsLinks(body, elements.slice(1), row);
      }
    }
    return {
      selectedView: clonedView
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
  }

};

export default function viewsReducer(state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return {...state, ...handler(state, action)
};
}
