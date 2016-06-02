/**
 * Created by mansh on 4/25/2016.
 */
import {HOST_NAME} from '../util/Config';
import Rest from '../util/grommet-rest-promise';

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
  Rest.get(HOST_NAME + '/coll/view/').then((res) => {
    callback(res.body);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function loadView(id, callback) {
  Rest.get(HOST_NAME + '/coll/view/' + id).then((res) => {
    callback(res.body);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
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

export function getUCMDB(callback) {
  Rest.get(HOST_NAME + '/ucmdb-browser').then((res) => {
    callback(res.text);
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function getBodyByKeyword(body, keyword) {
  var aql = body.fields.filter((field) => {
    return field.searchable;
  }).map((field) => {
    return field.sqlname + " like '%" + keyword + "%'";
  }).join(' OR ');

  if (aql) {
    body.filter = (body.filter) ? body.filter + ' AND (' + aql + ')' : aql;
  }
  return body;
}

export function loadRecordsByBody(body, callback) {
  Rest.get(HOST_NAME + '/am/db/' + getQueryByBody(body)).then((res) => {
    if (res.body.count && res.body.entities)
      callback(res.body);
    else
      callback({count: 0, entities: []});
  }, (err) => {
    console.log(err.response ? err.response.text : err);
    callback({count: 0, entities: []});
  });
}

export function getQueryByBody(body) {

  var fields = [];
  body.fields.forEach(function (field) {
    fields.push(field.sqlname);
  });

  // add src_fields before query
  if (body.links && body.links.length > 0) {
    var src_fields = body.links.map((link) => {
      if (link.src_field) {
        var relative_path = link.src_field.relative_path;
        return relative_path ? relative_path + '.' + link.src_field.sqlname : link.src_field.sqlname;
      }

      // TODO remove this part reversefield was replaced by src_field
      if (link.reversefield)
        return link.reversefield;
    });

    // remove same fields
    src_fields.filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    });

    fields = fields.concat(src_fields);
  }

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
      var userFilters = userParam.filters.map((filter) => {
        return '(' + filter + ')';
      }).join(" AND ");
      param.filter = param.filter ? param.filter + ' AND (' + userFilters + ')' : userFilters;
    }
  }

  var aql = param2aql(param);
  return query + aql;
}

export function getGroupByAql(body) {
  if (body.groupby) {
    var aggregate = (body.sum) ? `sum(${body.sum})` : 'count(*)';
    var aql = `select ${body.groupby}, ${aggregate} from ${body.sqlname}`;
    if (body.filter)
      aql += ` where ${body.filter}`;
    if (body.groupby)
      aql += ` group by ${body.groupby}`;
    if (body.orderby && body.orderby.indexOf(body.groupby) > -1)
      aql += ` order by ${body.orderby}`;

    console.log(aql);
    return aql;
  } else {
    return '';
  }
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
