import {REPORT_DEF_URL} from '../constants/ServiceConfig';
import Rest from '../util/grommet-rest-promise';
import store from '../store';
import * as Types from '../constants/ActionTypes';
import cookies from 'js-cookie';

export function loadReport(id) {
  return Rest.get(REPORT_DEF_URL + id).then((res) => {
    delete res.body.user;
    return res.body;
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadReports() {
  const filter = {filter: JSON.stringify({"$or": [{user: cookies.get('user')}, {public: true}]})};
  return Rest.get(REPORT_DEF_URL, filter).then((res) => {
    return res.body.map(report => {
      delete report.user;
      return report;
    });
  }, (err) => {
    store.dispatch({type: Types.RECEIVE_ERROR, msg:err.response ? err.response.text : err});
  });
}

export function removeReport(id) {
  return Rest.del(REPORT_DEF_URL + id).then((res) => {
    if (res.text) {
      store.dispatch({type: Types.RECEIVE_INFO, msg: "Report removed successfully"});
      return res.text;
    }
  }, (err) => {
    store.dispatch({type: Types.RECEIVE_ERROR, msg:err.response ? err.response.text : err});
  });
}

export function saveReport(report) {
  let clonedReport = _.cloneDeep(report);
  clonedReport.user = cookies.get('user');
  return Rest.post(REPORT_DEF_URL, clonedReport).then((res) => {
    if (res.text) {
      store.dispatch({type: Types.RECEIVE_INFO, msg: "Report saved successfully"});
      return res.text;
    }
  }, (err) => {
    store.dispatch({type: Types.RECEIVE_ERROR, msg:err.response ? err.response.text : err});
  });
}
