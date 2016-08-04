//import request from 'superagent-bluebird-promise';
import _ from 'lodash';
import * as types from '../constants/ActionTypes';
import {VIEW_DEF_URL} from '../constants/ServiceConfig';
import Rest from '../util/grommet-rest-promise';
import objectPath from 'object-path';

function requestViews() {
  return {
    type: types.REQUEST_VIEWS
  };
}

function receiveViewsSuccess(json) {
  return {
    type: types.RECEIVE_VIEWS_SUCCESS,
    views: json
  };
}

function receiveViewsFailure(err) {
  return {
    type: types.RECEIVE_VIEWS_FAILURE,
    err
  };
}

export function loadViews(selectedViewId, currentPathName) {
  return dispatch => {
    dispatch(requestViews());
    return Rest.get(VIEW_DEF_URL).then(function (res) {
      dispatch(receiveViewsSuccess(res.body));
      let views = res.body;
      // Load first record of the list in detail.
      if (views.length > 0) {
        let selectedView = selectedViewId ? views.filter(view => view._id == selectedViewId)[0] : {};
        selectedView = selectedView || {};
        //console.log("selectedView:");
        //console.log(selectedView);
        dispatch({
          type: types.SET_SELECTED_VIEW,
          selectedViewId: selectedView._id,
          selectedView: selectedView
        });
        // return the url of the first record
        // don't call 'history.push()' here, because unit test will fail ('history' can't be mocked).
        return !selectedViewId && selectedView._id ? currentPathName + "/" + selectedView._id : null;
      }
    }, function (err) {
      dispatch(receiveViewsFailure(err));
    });
  };
}

export function saveViewDef(selectedView) {
  return function (dispatch) {
    return Rest.post(VIEW_DEF_URL)
      .set("Content-Type", "application/json")
      .send(JSON.stringify(selectedView))
      .then(function (res) {
        let _id = res.text;
        dispatch({
          type: types.SAVE_VIEW_DEF,
          selectedViewId: _id,
          selectedView: selectedView
        });
        dispatch({
          type: types.RECEIVE_INFO,
          msg: "View definition saved successfully."
        });
        return _id;
      }, function (err) {
        if (err) {
          throw err;
        }
      }
    );
  };
}

export function setSelectedView(selectedViewId, selectedView) {
  return dispatch => {
    dispatch({
      type: types.SET_SELECTED_VIEW,
      selectedViewId: selectedViewId,
      selectedView: selectedView
    });
  };
}

export function clearSelectedView() {
  return dispatch => {
    dispatch({
      type: types.SET_SELECTED_VIEW,
      selectedViewId: null,
      selectedView: {}
    });
  };
}

export function newSelectedView() {
  return dispatch => {
    dispatch({
      type: types.NEW_SELECTED_VIEW
    });
  };
}

export function updateSelectedView(selectedView, path, newValue) {
  return dispatch => {
    dispatch({
      type: types.UPDATE_SELECTED_VIEW,
      selectedView: selectedView,
      path: path,
      newValue: newValue
    });
  };
}

export function deleteTableRow(selectedView, path) {
  return (dispatch) => {
    let clonedView = _.cloneDeep(selectedView);
    let bodyPath = path.substring(0, path.lastIndexOf("body") + 4);

    // check and remove orderby, groupby and sum
    let orderByPath = bodyPath.concat(".orderby");
    let groupByPath = bodyPath.concat(".groupby");
    let sumPath = bodyPath.concat(".sum");
    let orderBy = objectPath.get(clonedView, orderByPath);
    let groupBy = objectPath.get(clonedView, groupByPath);
    let sum = objectPath.get(clonedView, sumPath);
    let field = objectPath.get(clonedView, path);
    if(field.sqlname == orderBy) {
      objectPath.del(clonedView, orderByPath);
    }
    if(field.sqlname == groupBy) {
      objectPath.del(clonedView, groupByPath);
    }
    if(field.sqlname == sum) {
      objectPath.del(clonedView, sumPath);
    }

    objectPath.del(clonedView, path);
    checkAndRemoveParent(clonedView, path);
    dispatch({
      type: types.DELETE_TABLE_ROW,
      selectedView: clonedView,
      path: path
    });
  };
}

export function moveRow(selectedView, path, up) {
  return (dispatch) => {
    let clonedView = _.cloneDeep(selectedView);
    let lastIndexOfDot = path.lastIndexOf(".");
    let arrayPath = path.substring(0, lastIndexOfDot);
    let rows = objectPath.get(clonedView, arrayPath);
    let currentElementIndex = parseInt(path.substring(lastIndexOfDot + 1));
    let currentElement = objectPath.get(clonedView, path);
    let targetIndex = up ? currentElementIndex - 1 : currentElementIndex + 1;
    let targetElement = objectPath.get(clonedView, `${arrayPath}.${targetIndex}`);
    rows[currentElementIndex] = targetElement;
    rows[targetIndex] = currentElement;
    dispatch({
      type: types.SYNC_SELECTED_VIEW,
      selectedView: clonedView
    });
  };
}

function checkAndRemoveParent(clonedView, path) {
  let lastIndexOfBody = path.lastIndexOf("body");
  if(lastIndexOfBody <= 0 ) {
    return;
  }
  let bodyPath = path.substring(0, lastIndexOfBody + 4);
  let fieldsPath = bodyPath.concat(".fields");
  let fields = objectPath.get(clonedView, fieldsPath);
  let fieldsEmpty = (fields.length == 0);
  if(fieldsEmpty && fields.length > 0) {
    objectPath.empty(clonedView, fieldsPath);
  }
  let linksPath = bodyPath.concat(".links");
  let links = objectPath.get(clonedView, linksPath);

  lastIndexOfBody = bodyPath.lastIndexOf(".body");
  let lastIndexOfLinks = bodyPath.lastIndexOf(".links");
  // check if there is a parent table
  if(fieldsEmpty && (!links || links.length == 0) && lastIndexOfLinks > 0) {
    // remove current link element
    let currentLinkPath = bodyPath.substring(0, lastIndexOfBody); // links.0
    objectPath.del(clonedView, currentLinkPath);
    checkAndRemoveParent(clonedView, currentLinkPath);
  }
}

export function duplicateViewDef(selectedView) {
  return dispatch => {
    let clonedView = _.cloneDeep(selectedView);
    delete clonedView._id;
    clonedView.name = `${clonedView.name} (Duplicated)`;
    dispatch({
      type: types.DUPLICATE_VIEW_DEF,
      selectedView: clonedView
    });
    dispatch({
      type: types.RECEIVE_INFO,
      msg: "View definition duplicated as '" + clonedView.name + "'."
    });
  };
}

export function confirmDeleteViewDef(selectedView) {
  return function (dispatch) {
    return Rest.del(VIEW_DEF_URL + selectedView._id)
      .then((res) => {
        dispatch({
          type: types.DELETE_VIEW_DEF,
          selectedViewId: selectedView._id
        });
        dispatch({
          type: types.RECEIVE_INFO,
          msg: `View definition '${selectedView.name}' deleted.`
        });
      }, (err) => {
        console.log("cannot delete - ");
        console.log(err.response ? err.response.text : err);
      });
  };
}

export function updateViewDefList(selectedView) {
  return {
    type: types.UPDATE_VIEW_DEF_LIST,
    selectedView: selectedView
  };
}

export function syncSelectedView(selectedView) {
  return dispatch => {
    dispatch({
      type: types.SYNC_SELECTED_VIEW,
      selectedView: selectedView
    });
  };
}

export function openPreview() {
  return dispatch => {
    dispatch({
      type: types.OPEN_PREVIEW
    });
  };
}

export function closePreview() {
  return dispatch => {
    dispatch({
      type: types.CLOSE_PREVIEW
    });
  };
}

export function loadTemplateTable(selectedViewId, selectedView) {
  return dispatch => {
    console.log("action - loadTemplateTable - selectedViewId: " + selectedViewId);
    console.log("action - loadTemplateTable - selectedView: ");
    console.log(selectedView);
    //queryRootByTemplate(selectedView);
    //return request.get(HOST_NAME + '/json/template').then(function (res) {
    //  dispatch(receiveTemplateTableSuccess(res.body));
    //}, function (error) {
    //  dispatch(receiveTemplateTableFailure(error));
    //});
  };
}

