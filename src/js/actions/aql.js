// import request from 'superagent-bluebird-promise';
// import * as types from '../constants/ActionTypes';
import {HOST_NAME} from '../util/Config';
import Rest from '../util/grommet-rest-promise';

export function saveWall(wall, callback) {
  Rest.post(HOST_NAME + '/coll/wall', wall).then((res) => {
    callback(res.text);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadWall(callback) {
  Rest.get(HOST_NAME + '/coll/wall').then((res) => {
    callback(res.body[0]);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadAQL(id, callback) {
  Rest.get(HOST_NAME + '/coll/aql/' + id).then((res) => {
    callback(res.body);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadAQLs(callback) {
  Rest.get(HOST_NAME + '/coll/aql').then((res) => {
    callback(res.body);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function saveAQL(aql, callback) {
  Rest.post(HOST_NAME + '/coll/aql', aql).then((res) => {
    callback(res.text);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function removeAQL(id, callback) {
  Rest.del(HOST_NAME + '/coll/aql/' + id).then((res) => {
    callback(res.text);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadReports(callback) {
  Rest.get(HOST_NAME + '/am/db/amInToolReport').then((res) => {
    callback(res.body);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function queryViewAQL(body, callback) {
  var groupby = body.fields.filter((field) => {
    return field.groupby;
  });

  if (groupby.length > 0) {
    // get first groupby field, but it should only one field
    var field = groupby[0];
    var aggregate = (field.groupby.toLowerCase() === 'sum') ? field.groupby : 'count(*)';
    var aql = 'SELECT ' + field.sqlname + ', ' + aggregate + ' FROM ' + body.sqlname;

    if (body.filter)
      aql += ' WHERE ' + body.filter;

    aql += ' GROUP BY ' + field.sqlname;

    if (body.orderby && body.orderby.toLowerCase().indexOf(field.sqlname.toLowerCase()) > -1)
      aql += ' ORDER BY ' + body.orderby;
    if (body.orderby && body.orderby.toLowerCase().indexOf(field.sqlname.toLowerCase() + 'desc') > -1)
      aql += ' DESC';

    queryAQL(aql, callback);
  }
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
    if (aql.where) {
      query += " " + aql.where;
    }

    Rest.get(HOST_NAME + query).then((res) => {
      callback(simpleAQLResult(res.body.Query));
    }, (err) => {
      console.log(err.response ? err.response.text : err);
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
    if (Query.Result.Row && Query.Result.Row.Column.content)
      cols.push(Query.Result.Row.Column.content);
    if (cols.length > 0)
      data.rows.push(cols);
  }

  return data;
}
