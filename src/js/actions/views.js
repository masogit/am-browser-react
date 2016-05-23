//import request from 'superagent-bluebird-promise';
import _ from 'lodash';
import * as types from '../constants/ActionTypes';
import {HOST_NAME, VIEW_DEF_URL} from '../util/Config';
import Rest from 'grommet/utils/Rest';

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

//function requestTemplateTable(selectedViewId) {
//  return {
//    type: types.REQUEST_TEMPLATE_TABLE,
//    selectedViewId: selectedViewId
//  };
//}
//
//function receiveTemplateTableSuccess(json) {
//  return {
//    type: types.RECEIVE_TEMPLATE_TABLE_SUCCESS,
//    views: json
//  };
//}
//
//function receiveTemplateTableFailure(err) {
//  return {
//    type: types.RECEIVE_TEMPLATE_TABLE_FAILURE,
//    err
//  };
//}

//function queryRootByTemplate(template, keyword) {
//
//  //console.log('template:');
//  //console.log(template);
//  var form = getFormData();
//  form["ref-link"] = "db/" + template.$.sqlname;
//
//  // clean param fields generated by amTree
//  form.param.fields = template.fields;
//  //for (var i in template.field) {
//  //    form.param.fields.push(template.field[i]["$"]["sqlname"]);
//  //}
//  if (keyword) {
//    var AQLs = [];
//    template.fields.forEach(function (obj) {
//      AQLs.push(obj + " like '%" + keyword + "%'");
//    });
//
//    form.param.filter = AQLs.join(" OR ");
//  }
//
//  if (template.AQL) {
//    if (form.param.filter != "")
//      form.param.filter = form.param.filter + " AND " + template.AQL;
//    else
//      form.param.filter = template.AQL;
//  }
//
//  console.log('form:');
//  console.log(form);
//  $scope.tempRecords = template;
//  $scope.tempRecords['timeStart1'] = Date.now();
//  $scope.tempRecords.loading1 = true;
//
//  $http.post('/am/rest', form).success(function (data) {
//    if (data instanceof Object) {
//      $scope.tempRecords.records = data.entities;
//      $scope.tempRecords.count = data.count;
//
//      $scope.tempRecords['timeEnd1'] = Date.now();
//      $scope.tempRecords.loading1 = false;
//
//      if (temp.$loki && !keyword) {
//        temp['last'] = {
//          time: Date.now(),
//          count: data.count
//        };
//        $http.post('/json/template', temp).success(function (data) {
//
//        });
//      }
//
//      if (data.entities[0])
//        $scope.getRecordByTemp(data.entities[0], template, true);
//
//    } else {
//
//      $scope.alerts.push({
//        type: 'warning',
//        msg: JSON.stringify(form)
//      });
//
//      $scope.alerts.push({
//        type: 'danger',
//        msg: data
//      });
//
//    }
//
//  }).error(function (data) {
//    $scope.alerts.push({
//      type: 'danger',
//      msg: data
//    });
//  });
//}

export function loadViews(selectedViewId, currentPathName, callback) {
  return dispatch => {
    dispatch(requestViews());
    Rest.get(HOST_NAME + VIEW_DEF_URL).end(function (err, res) {
      if (err) {
        dispatch(receiveViewsFailure(err));
      } else {
        dispatch(receiveViewsSuccess(res.body));
        let views = res.body;
        // Load first record of the list in detail.
        if (views.length > 0) {
          let selectedView = selectedViewId ? views.filter(view => view._id == selectedViewId)[0] : views[0];
          selectedView = selectedView || views[0];
          //console.log("selectedView:");
          //console.log(selectedView);
          dispatch({
            type: types.SET_SELECTED_VIEW,
            selectedViewId: selectedView._id,
            selectedView: selectedView
          });
          // return the url of the first record
          // don't call 'history.push()' here, because unit test will fail ('history' can't be mocked).
          if (!selectedViewId && callback) {
            callback(currentPathName + "/" + selectedView._id);
          }
        }
      }
    });
  };
}

export function saveViewDef(selectedView, callback) {
  //console.log(selectedView);
  return function (dispatch) {
    Rest.post(HOST_NAME + VIEW_DEF_URL)
      .set("Content-Type", "application/json")
      .send(JSON.stringify(selectedView))
      .end(function (err, res) {
        if (err) {
          console.log("cannot save: " + err);
        } else {
          console.log("save successfully.");
          let _id = res.text;
          dispatch({
            type: types.SAVE_VIEW_DEF,
            selectedViewId: _id,
            selectedView: selectedView,
            editing: false
          });
          //dispatch({
          //  type: types.UPDATE_VIEW_DEF_LIST,
          //  selectedView: selectedView
          //});
          if (callback) {
            callback(_id);
          }
        }
      });
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
    dispatch({
      type: types.DUPLICATE_VIEW_DEF,
      selectedView: clonedView
    });
  };
}

export function deleteViewDef(selectedView, callback) {
  return function (dispatch) {
    Rest.del(HOST_NAME + VIEW_DEF_URL + "/" + selectedView._id)
      .end(function (err, res) {
        if (err) {
          console.log("cannot delete: " + err);
        } else {
          console.log("delete successfully - " + selectedView._id);
          dispatch({
            type: types.DELETE_VIEW_DEF,
            deletedViewId: selectedView._id
          });
          //dispatch({
          //  type: types.UPDATE_VIEW_DEF_LIST,
          //  selectedView: selectedView
          //});
          if (callback) {
            callback(selectedView._id);
          }
        }
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

