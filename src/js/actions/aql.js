import {GRAPH_DEF_URL, INSIGHT_DEF_URL, AM_DB_DEF_URL, AM_AQL_DEF_URL} from '../constants/ServiceConfig';
import Rest from '../util/grommet-rest-promise';
const store = require('../store');
import * as Types from '../constants/ActionTypes';
import _ from 'lodash';

export function saveWall(wall, callback) {
  Rest.post(INSIGHT_DEF_URL, wall).then((res) => {
    if (res.text) {
      store.default.dispatch({type: Types.RECEIVE_INFO, msg: "Insight saved successfully"});
      callback(res.text);
    }
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadWalls(callback) {
  Rest.get(INSIGHT_DEF_URL).then((res) => {
    callback(res.body);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadAQL(id, callback) {
  Rest.get(GRAPH_DEF_URL + id).then((res) => {
    callback(res.body);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadAQLs(callback) {
  Rest.get(GRAPH_DEF_URL).then((res) => {
    callback(res.body);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function saveAQL(aql, callback) {
  let clonedAql = _.cloneDeep(aql);
  // TODO: delete the following 4 lines after aql templates are cleaned up.
  delete clonedAql.data;
  delete clonedAql.meter;
  delete clonedAql.distribution;
  delete clonedAql.chart;
  Rest.post(GRAPH_DEF_URL, clonedAql).then((res) => {
    if (res.text) {
      store.default.dispatch({type: Types.RECEIVE_INFO, msg: "Graph saved successfully"});
      callback(res.text);
    }
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function removeAQL(id, callback) {
  Rest.del(GRAPH_DEF_URL + id).then((res) => {
    if (res.text) {
      store.default.dispatch({type: Types.RECEIVE_INFO, msg: "Graph removed successfully"});
      callback(res.text);
    }
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadReports(callback) {
  Rest.get(AM_DB_DEF_URL + 'amInToolReport').then((res) => {
    callback(res.body);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function queryAQL(str, callback) {
  var aql = {
    tableName: "",
    where: "",
    fields: ""
  };

  // get key word position
  // todo: check if AQL can contain multipule key words
  var idx_SELECT = str.toLowerCase().indexOf("select");
  var idx_FROM = str.toLowerCase().indexOf("from");
  var idx_WHERE = str.toLowerCase().indexOf("where");

  if (idx_SELECT < 0 || idx_FROM < 0) {
    // callback(null);
    store.default.dispatch({type: Types.RECEIVE_ERROR, msg: "AQL is invalid! Can not query data for Graph"});
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

    Rest.get(query).then((res) => {
      callback(simpleAQLResult(res.body.Query));
    }, (err) => {
      const errorMessage = err.rawResponse || (err.response && err.response.text || err.toString());
      store.default.dispatch({type: Types.RECEIVE_ERROR, msg: errorMessage});
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


  if (Query.Result.Row instanceof Array) {
    Query.Result.Row.forEach((row) => {
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
    });

  } else if (Query.Result.Row && Query.Result.Row.Column instanceof Array) {
    var cols = [];
    Query.Result.Row.Column.forEach((col) => {
      if (col.content)
        cols.push(col.content);
      else
        cols.push('');
    });
    if (cols.length > 0)
      data.rows.push(cols);

  } else {
    var cols = [];
    if (Query.Result.Row && Query.Result.Row.Column.content)
      cols.push(Query.Result.Row.Column.content);
    if (cols.length > 0)
      data.rows.push(cols);
  }

  if (data.rows[0] && data.header.length !== data.rows[0].length) {
    store.default.dispatch({
      type: Types.RECEIVE_WARNING,
      msg: 'AQL str is invalid: query columns is inconsistent with return columns.'
    });
  }
  return data;
}
