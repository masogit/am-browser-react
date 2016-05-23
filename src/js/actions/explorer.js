/**
 * Created by mansh on 4/25/2016.
 */
import {HOST_NAME} from '../util/Config';
import Rest from 'grommet/utils/Rest';

function param2aql(param) {

  let aql = '';
  aql += '?limit=' + param.limit;
  aql += '&offset=' + param.offset;
  aql += '&fields=' + param.fields.join(',');
  aql += param.filter ? '&filter=' + param.filter : '';
  aql += param.orderby ? '&orderby=' + param.orderby : '';

  return encodeURI(aql);
}

export function loadViews(callback) {
  Rest.get(HOST_NAME + '/coll/view/').end(function (err, res) {
    if (err) {
      console.log(err);
    } else
      callback(res.body);
  });
}

export function loadView(id, callback) {
  Rest.get(HOST_NAME + '/coll/view/' + id).end(function (err, res) {
    if (err) {
      console.log(err);
    } else
      callback(res.body);
  });
}

export function getCount(body, callback) {
  body.orderby = '';
  body.fields = [{
    sqlname: 'PK'
  }];
  body.param = {
    limit: 1,
    offset: 0
  };
  loadRecordsByBody(body, callback);
}

export function loadRecordsByKeyword(body, keyword, callback) {
  var aql = body.fields.filter((field) => {
    return field.searchable;
  }).map((field) => {
    return field.sqlname + " like '%" + keyword + "%'";
  }).join(' OR ');

  if (aql) {
    body.filter = (body.filter) ? body.filter + ' AND (' + aql + ')' : aql;
    loadRecordsByBody(body, callback);
  }
}
export function loadRecordsByBody(body, callback) {
  Rest.get(HOST_NAME + '/am/db/' + getQueryByBody(body)).end(function (err, res) {
    if (err) {
      console.log(err);
      callback({count: 0, entities: []});
    } else if (res.body.count && res.body.entities)
      callback(res.body);
    else
      callback({count: 0, entities: []});
  });
}

export function getQueryByBody(body) {

  var fields = [];
  body.fields.forEach(function (field) {
    fields.push(field.sqlname);
  });

  var query = body.sqlname;
  var param = {
    limit: 100,
    offset: 0,
    filter: body.filter,
    orderby: body.orderby,
    fields: fields
  };

  var userParam = body.param;
  if (userParam) {
    if (userParam.orderby)
      param.orderby = userParam.orderby;
    if (userParam.limit)
      param.limit = userParam.limit;
    if (userParam.offset)
      param.offset = userParam.offset;
    if (userParam.filters && userParam.filters.length > 0) {
      var userFilters = userParam.filters.join(" AND ");
      param.filter = param.filter ? param.filter + ' AND ' + userFilters : userFilters;
    }
  }

  var aql = param2aql(param);

  return query + aql;
}

export function getDownloadQuery(body) {
  var rawFields = [];
  body.fields.forEach((field)=> {
    if (!field.PK)
      rawFields.push({
        sqlname: field.sqlname,
        label: field.alias || field.label,
        type: field.type
      });
  });
  return HOST_NAME + '/download/db/' + getQueryByBody(body);
}
