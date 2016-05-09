import request from 'superagent-bluebird-promise';
import * as types from '../constants/ActionTypes';
import {HOST_NAME, VIEW_DEF_URL/*, getFormData*/} from '../util/Config';
//import history from '../RouteHistory';

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

export function loadViews(selectedViewId, currentPathName) {
  return dispatch => {
    dispatch(requestViews());
    return request.get(HOST_NAME + VIEW_DEF_URL).then(function (res) {
      dispatch(receiveViewsSuccess(res.body));
      let views = res.body;
      // Load first record of the list in detail.
      if (views.length > 0) {
        let selectedView = selectedViewId ? views.filter(view => view._id == selectedViewId)[0] : views[0];
        //console.log("selectedView:");
        //console.log(selectedView);
        dispatch({
          type: types.SET_SELECTED_VIEW,
          selectedViewId: selectedView._id,
          selectedView: selectedView
        });
        // return the url of the first record
        // don't call 'history.push()' here, because unit test will fail ('history' can't be mocked).
        return !selectedViewId ? currentPathName + "/" + selectedView._id : null;
      }
    }, function (error) {
      dispatch(receiveViewsFailure(error));
      return null;
    });
  };
}

export function saveViewDef(selectedView) {
  //console.log(selectedView);
  return function (dispatch) {
    let formData = {};
    var AM_FORM_DATA = "amFormData";
    if (localStorage && localStorage[AM_FORM_DATA]) {
      var form = JSON.parse(localStorage.getItem(AM_FORM_DATA));
      if (form.user) formData.user = form.user;
      if (form.password) formData.password = form.password;
    }
    //let  headers = { 'Accept': 'application/json' };
    //Rest.setHeaders(headers);
    let auth = 'Basic ' + new Buffer(formData.user + ':' + formData.password).toString('base64');
    return request.post(HOST_NAME + VIEW_DEF_URL)
      .set("Content-Type", "application/json")
      .set("Authorization", auth)
      .send(JSON.stringify(selectedView))
      .then(function (res) {
        console.log("save successfully.");
        dispatch({
          type: types.SAVE_VIEW_DEF,
          selectedViewId: selectedView._id,
          selectedView: selectedView,
          editing: false
        });
        return selectedView;
      }, function (err) {
        console.log("cannot save: " + err);
        return null;
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

export function syncSelectedView(elements, row) {
  return dispatch => {
    dispatch({
      type: types.SYNC_SELECTED_VIEW,
      elements: elements,
      row: row
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

