//import request from 'superagent-bluebird-promise';
import _ from 'lodash';
import * as types from '../constants/ActionTypes';
import {HOST_NAME, VIEW_DEF_URL} from '../util/Config';
import Rest from '../util/grommet-rest-promise';

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

export function loadViews(selectedViewId, currentPathName, callback) {
  return dispatch => {
    dispatch(requestViews());
    return Rest.get(HOST_NAME + VIEW_DEF_URL).then(function (res) {
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

export function saveViewDef(selectedView, callback) {
  //console.log(selectedView);
  return function (dispatch) {
    return Rest.post(HOST_NAME + VIEW_DEF_URL)
      .set("Content-Type", "application/json")
      .send(JSON.stringify(selectedView))
      .then(function (res) {
        console.log("save successfully.");
        let _id = res.text;
        dispatch({
          type: types.SAVE_VIEW_DEF,
          selectedViewId: _id,
          selectedView: selectedView,
          editing: false
        });
        dispatch({
          type: types.RECEIVE_INFO,
          msg: "View definition saved successfully."
        });
        return _id;
        //if (callback) {
        //  callback(_id);
        //}
      }, function (err) {
        if (err) {
          console.log("cannot save: " + err);
          throw err;
        }
      }
    )
      ;
  };
}

export function setSelectedView(selectedViewId, selectedView) {
  return dispatch => {
    //console.log("setSelectedView: " + selectedViewId);
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
  return dispatch => {
    dispatch({
      type: types.DELETE_TABLE_ROW,
      selectedView: selectedView,
      path: path
    });
  };
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

export function confirmDeleteViewDef(selectedView, callback) {
  return function (dispatch, getState) {
    Rest.del(HOST_NAME + VIEW_DEF_URL + "/" + selectedView._id)
      .then((res) => {
        console.log("delete successfully - " + selectedView._id);
        let views = getState().views.views;
        let idx = _.findIndex(views, {_id: selectedView._id});
        let updatedViews = [...views.slice(0, idx), ...views.slice(idx + 1)];
        dispatch({
          type: types.DELETE_VIEW_DEF,
          selectedViewId: "",
          selectedView: {},
          views: updatedViews
        });
        dispatch({
          type: types.RECEIVE_INFO,
          msg: `View definition '${selectedView.name}' deleted.`
        });
        //dispatch({
        //  type: types.UPDATE_VIEW_DEF_LIST,
        //  selectedView: selectedView
        //});
        if (callback) {
          callback(selectedView._id);
        }
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

export function syncSelectedView(elements, row) {
  return dispatch => {
    dispatch({
      type: types.SYNC_SELECTED_VIEW,
      elements: elements,
      row: row
    });
  };
}

export function openPreview() {
  return dispatch => {
    dispatch({
      type: types.OPEN_PREVIEW,
      preview: true
    });
  };
}

export function closePreview() {
  return dispatch => {
    dispatch({
      type: types.CLOSE_PREVIEW,
      preview: false
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

