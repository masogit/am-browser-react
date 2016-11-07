import {GRAPH_DEF_URL, INSIGHT_DEF_URL, AM_DB_DEF_URL, AM_AQL_DEF_URL} from '../constants/ServiceConfig';
import Rest from '../util/grommet-rest-promise';
import store from '../store';
import * as Types from '../constants/ActionTypes';
import _ from 'lodash';

const dummy_promise = {
  then: () => {}
};

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

export function queryAQL(str) {
  var aql = {
    tableName: "",
    where: "",
    fields: ""
  };

  let errorMessage;
  // get key word position
  // todo: check if AQL can contain multipule key words
  var idx_SELECT = str.toLowerCase().indexOf("select");
  var idx_FROM = str.toLowerCase().indexOf("from");
  var idx_WHERE = str.toLowerCase().indexOf("where");

  if (idx_SELECT < 0 || idx_FROM < 0) {
    errorMessage =  "AQL is invalid! Can not query data for Graph";
    store.dispatch({type: Types.RECEIVE_ERROR, msg: errorMessage});
    return dummy_promise;
  } else {
    // get fields from SELECT .. FROM
    aql.fields = str.substring(idx_SELECT + 6, idx_FROM).trim();

    // get tableName from FROM .. WHERE (WHERE is optional)
    aql.tableName = (idx_WHERE > -1) ? str.substring(idx_FROM + 4, idx_WHERE).trim() : str.substring(idx_FROM + 4).trim();

    // get where start from WHERE (not include WHERE, where is optional)
    aql.where = (idx_WHERE < 0) ? "" : str.substring(idx_WHERE).trim();

    var query = AM_AQL_DEF_URL + aql.tableName + "/" + aql.fields;
    if (aql.where) {
      query += " " + encodeURI(aql.where);
    }

    return Rest.get(query).then((res) => {
      return simpleAQLResult(res.body.Query);
    }, (err) => {
      if (err.status == 404) {
        errorMessage = 'Can not get response from rest server, please check your AQL string';
      } else {
        errorMessage = err.rawResponse || (err.response && err.response.text || err.toString());
      }
      store.dispatch({type: Types.RECEIVE_ERROR, msg: errorMessage});
    });
  }
}

function simpleAQLResult(Query) {
  var data = {
    table: "",
    header: [],
    rows: []
  };

  data.table = Query.Schema.Content;

  if (Query.Schema.Column instanceof Array) {
    data.header = Query.Schema.Column;
  } else {
    data.header.push(Query.Schema.Column);
  }


  if (Query.Result.Row instanceof Array) {  // Multiple rows
    for (let index in Query.Result.Row) {
      let row = Query.Result.Row[index];
      var cols = [];
      if (row.Column instanceof Array) {
        row.Column.forEach((col) => {
          if (col.content)
            cols.push(col.content);
          else
            cols.push('');
        });
      } else {
        if (row.Column.content)
          cols.push(row.Column.content);
        else
          cols.push('');
      }
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
  } else if (Query.Result.Row && Query.Result.Row.Column instanceof Array) {  // Only one row
    var cols = [];
    Query.Result.Row.Column.forEach((col) => {
      if (col.content)
        cols.push(col.content);
      else
        cols.push('');
    });
    if (cols.length > 0)
      data.rows.push(cols);

  } else {  // Only one row and one column
    var cols = [];
    if (Query.Result.Row && Query.Result.Row.Column.content)
      cols.push(Query.Result.Row.Column.content);
    if (cols.length > 0)
      data.rows.push(cols);
  }

  if (data.rows[0] && data.header.length !== data.rows[0].length) {
    store.dispatch({
      type: Types.RECEIVE_WARNING,
      msg: 'AQL str is invalid: query columns is inconsistent with return columns.'
    });
  }
  return data;
}
