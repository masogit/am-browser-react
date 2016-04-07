//import Rest from 'grommet/utils/Rest';
import request from 'superagent-bluebird-promise';
import * as types from '../constants/ActionTypes';
import {HOST_NAME} from '../constants/Config';

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

export function loadViews() {
  return dispatch => {
    dispatch(requestViews());
    //return Rest.get(HOST_NAME + '/json/template').end((err, res) => {
    //  if (err) {
    //    dispatch(receiveViewsFailure(err));
    //  } else if (res.ok) {
    //    dispatch(receiveViewsSuccess(res.body));
    //  }
    //});
    return request.get(HOST_NAME + '/json/template').then(function (res) {
      dispatch(receiveViewsSuccess(res.body));
    }, function (error) {
      dispatch(receiveViewsFailure(error));
    });
  };
}
