// import request from 'superagent-bluebird-promise';
// import * as types from '../constants/ActionTypes';
import {HOST_NAME} from '../constants/Config';
import Rest from 'grommet/utils/Rest';

export function loadAQLs() {
  return dispatch => {

    Rest.get(HOST_NAME + '/json/aql').end((err, res) => {
      if (err) {
        throw err;
      } else if (res.ok) {
        dispatch({
          type: "RECEIVE_AQLS",
          AQLs: res.body
        }
        );
      }
    });
  };
}

export function loadReports() {
  return dispatch => {
    Rest.get(HOST_NAME + '/am/db/amInToolReport').end((err, res) => {
      if (err) {
        throw err;
      } else if (res.ok) {
        dispatch({
          type: "RECEIVE_REPORTS",
          reports: res.body
        }
        );
      }
    });
  };
}

