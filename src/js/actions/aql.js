// import request from 'superagent-bluebird-promise';
// import * as types from '../constants/ActionTypes';
import {HOST_NAME} from '../util/Config';
import Rest from 'grommet/utils/Rest';

export function loadAQLs(callback) {
  Rest.get(HOST_NAME + '/coll/aql').end((err, res) => {
    if (err) {
      console.log(err);
    } else
      callback(res.body);
  });
}

export function saveAQL(aql, callback) {
  Rest.post(HOST_NAME + '/coll/aql', aql).end((err, res) => {
    if (err) {
      console.log(err);
    } else
      callback(res.body);
  });
}

export function removeAQL(id, callback) {
  Rest.del(HOST_NAME + '/coll/aql/' + id).end((err, res) => {
    if (err) {
      console.log(err);
    } else
      callback(res.body);
  });
}

export function loadReports(callback) {
  Rest.get(HOST_NAME + '/am/db/amInToolReport').end(function (err, res) {
    if (err) {
      console.log(err);
    } else
      callback(res.body);
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

  if (idx_SELECT < 0 || idx_FROM < 0)
    callback(null);
  else {
    // get fields from SELECT .. FROM
    aql.fields = str.substring(idx_SELECT + 6, idx_FROM).trim();

    // get tableName from FROM .. WHERE (WHERE is optional)
    aql.tableName = (idx_WHERE > -1) ? str.substring(idx_FROM + 4, idx_WHERE).trim() : str.substring(idx_FROM + 4).trim();

    // get where start from WHERE (not include WHERE, where is optional)
    aql.where = (idx_WHERE < 0) ? "" : str.substring(idx_WHERE).trim();

    var query = "/am/aql/" + aql.tableName + "/" + aql.fields;
    if (aql.where)
      query += " " + aql.where;

    Rest.get(HOST_NAME + query).end(function (err, res) {
      if (err) {
        console.log(err);
      } else {
        callback(simpleAQLResult(res.body.Query));
      }
    });
  }
}

function simpleAQLResult(Query) {
  console.log(Query);
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
        });
      } else {
        if (row.Column.content)
          cols.push(row.Column.content);

      }
      if (cols.length > 0)
        data.rows.push(cols);
    });

  } else {
    var cols = [];
    if (Query.Result.Row.Column.content)
      cols.push(Query.Result.Row.Column.content);
    if (cols.length > 0)
      data.rows.push(cols);

  }

  return data;
}
