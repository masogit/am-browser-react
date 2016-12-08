import {GRAPH_DEF_URL, INSIGHT_DEF_URL, AM_DB_DEF_URL, AM_AQL_DEF_URL, AM_AQL_VALIDATION_URL} from '../constants/ServiceConfig';
import Rest from '../util/grommet-rest-promise';
import store from '../store';
import * as Types from '../constants/ActionTypes';
import _ from 'lodash';

const dummy_promise = {
  then: () => {}
};

export function uploadAQLSuccess() {
  store.dispatch({type: Types.RECEIVE_INFO, msg: "Upload AM Browser Graph successfully"});
}

export function uploadAQLFailed() {
  store.dispatch({type: Types.RECEIVE_ERROR, msg: "Upload fail, it's not a valid AM Browser Graph"});
}

export function saveWall(wall) {
  return Rest.post(INSIGHT_DEF_URL, wall).then((res) => {
    if (res.text) {
      store.dispatch({type: Types.RECEIVE_INFO, msg: "Insight saved successfully"});
      return res.text;
    }
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadWalls(user) {
  var filter = JSON.stringify({"$or": [{ user }, {"tabs.public": {"$eq": true}}]});
  return Rest.get(INSIGHT_DEF_URL + '?filter=' + filter).then((res) => {
    return res.body;
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadAQL(id) {
  return Rest.get(GRAPH_DEF_URL + id).then((res) => {
    return res.body;
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadAQLs() {
  return Rest.get(GRAPH_DEF_URL).then((res) => {
    return res.body;
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function saveAQL(aql) {
  let clonedAql = _.cloneDeep(aql);
  // TODO: delete the following 4 lines after aql templates are cleaned up.
  delete clonedAql.data;
  return Rest.post(GRAPH_DEF_URL, clonedAql).then((res) => {
    if (res.text) {
      store.dispatch({type: Types.RECEIVE_INFO, msg: "Graph saved successfully"});
      return res.text;
    }
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function removeAQL(id) {
  return Rest.del(GRAPH_DEF_URL + id).then((res) => {
    if (res.text) {
      store.dispatch({type: Types.RECEIVE_INFO, msg: "Graph removed successfully"});
      return res.text;
    }
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadReports() {
  return Rest.get(AM_DB_DEF_URL + 'amInToolReport').then((res) => {
    return res.body;
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

function checkAqlSyntax(str) {
  return Rest.get(AM_AQL_VALIDATION_URL, {str: encodeURI(str)}).then(res => {
    if (!res.body) {
      store.dispatch({type: Types.RECEIVE_ERROR, msg: res.text});
    } else {
      return str;
    }
  }, err => {
    const errorMessage = err.rawResponse || (err.response && err.response.text || err.toString());
    store.dispatch({type: Types.RECEIVE_ERROR, msg: errorMessage});
  });
}

export function queryAQL(str) {
  if (!str) {
    return dummy_promise;
  }

  let errorMessage;

  var query = AM_AQL_DEF_URL + "?aql=" + str;

  return Rest.get(query).then((res) => {
    return simpleAQLResult(res.body);
  }, (err) => {
    if (err.status == 404) {
      errorMessage = 'Can not get response from rest server, please check your AQL string';
    } else {
      errorMessage = err.rawResponse || (err.response && err.response.text || err.toString());
    }
    store.dispatch({type: Types.RECEIVE_ERROR, msg: errorMessage});
  });
}

export function queryAQLWithCheck(str) {
  return checkAqlSyntax(str).then(queryAQL);
}

function simpleAQLResult(result) {
  var data = {
    table: "",
    header: [],
    rows: []
  };

  data.table = result.content;

  data.header = data.header.concat(result.schema);

  if (result.entities instanceof Array) {  // Multiple rows
    for (let index in result.entities) {
      let row = result.entities[index];
      var cols = [];
      Object.values(row).forEach((col) => {
        if (col instanceof Object) {
          cols.push(col.Value);
        } else {
          cols.push(col);
        }
      });
      if (cols.length > 0)
        data.rows.push(cols);

      // Truncate for Font End performance
      if (index > 100) {
        store.dispatch({
          type: Types.RECEIVE_WARNING,
          msg: 'Truncate returned query rows if over 100.'
        });
        break;
      }
    }
  }

  return data;
}
