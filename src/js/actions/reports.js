import {REPORT_DEF_URL} from '../constants/ServiceConfig';
import Rest from '../util/grommet-rest-promise';
import store from '../store';
import * as Types from '../constants/ActionTypes';

export function loadReport(id) {
  return Rest.get(REPORT_DEF_URL + id).then((res) => {
    return res.body;
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadReports() {
  return Rest.get(REPORT_DEF_URL).then((res) => {
    return res.body;
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function removeReport(id) {
  return Rest.del(REPORT_DEF_URL + id).then((res) => {
    if (res.text) {
      store.dispatch({type: Types.RECEIVE_INFO, msg: "Report removed successfully"});
      return res.text;
    }
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function saveReport(report) {
  let clonedReport = _.cloneDeep(report);
  return Rest.post(REPORT_DEF_URL, clonedReport).then((res) => {
    if (res.text) {
      store.dispatch({type: Types.RECEIVE_INFO, msg: "Report saved successfully"});
      return res.text;
    }
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}
