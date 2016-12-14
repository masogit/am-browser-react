import {AM_DB_DEF_URL, VIEW_DEF_URL, DOWNLOAD_DEF_URL, UCMDB_DEF_URL} from '../constants/ServiceConfig';
import Rest from '../util/grommet-rest-promise';

export function loadViews(filter) {
  return Rest.get(VIEW_DEF_URL, filter).then((res) => {
    return res.body;
  }, (err) => {
    //console.log(err.response ? err.response.text : err);
  });
}

export function loadView(id) {
  return Rest.get(VIEW_DEF_URL + id).then((res) => {
    if (res.body) {
      return res.body;
    } else {
      console.log(`view ${id} is not exists`);
    }
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function getCount(body) {
  body.orderby = '';
  body.param = {
    limit: 1,
    offset: 0
  };
  return loadRecordsByBody(body);
}

export function getUCMDB() {
  return Rest.get(UCMDB_DEF_URL).then((res) => {
    return res.text;
  }, (err) => {
    console.log(err.response ? err.response.text : err);
  });
}

export function getBodyByKeyword(body, keyword) {
  var aql = body.fields.filter((field) => {
    return field.searchable;
  }).map((field) => {
    return `${field.sqlname} like '%${keyword}%'`;
  }).join(' OR ');

  if (aql) {
    body.filter = body.filter ? `body.filter AND (${aql})` : aql;
  }
  return body;
}

export function loadRecordsByBody(body) {
  return Rest.get(AM_DB_DEF_URL + body.sqlname).query(getQueryByBody(body)).then((res) => {
    if (res.body.count && res.body.entities)
      return res.body;
    else
      return({count: 0, entities: []});
  }, (err) => {
    console.log(err.response ? err.response.text : err);
    return({count: 0, entities: []});
  });
}

export function getQueryByBody(body) {
  let fields =body.fields.map(field => field.is_calc ? undefined:  field.sqlname);

  // add src_fields before query
  if (body.links && body.links.length > 0) {
    var src_fields = body.links.map((link) => {
      if (link.src_field) {
        var relative_path = link.src_field.relative_path;
        return relative_path ? relative_path + '.' + link.src_field.sqlname : link.src_field.sqlname;
      }
    });

    // remove same fields
    src_fields.filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    });

    fields = fields.concat(src_fields);
  }

  var param = {
    limit: 100,
    offset: 0,
    countEnabled: true,
    fields: fields.join(',')
  };
  if (body.orderby) {
    param.orderby = body.orderby;
  }
  if (body.filter) {
    param.filter = body.filter;
  }

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
      param.filter = param.filter ? `(${param.filter}) AND (${userFilters})` : userFilters;
    }
  }

  return param;
}

export function getGroupByAql(body) {
  let aggregate = (body.sum) ? `sum(${body.sum})` : 'count(*)';
  let aql = `select ${body.groupby}, ${aggregate} from ${body.sqlname}`;
  // let fieldsWhere = getWhereFromFields(body.fields);
  if (body.filter)
    aql += ` where (${encodeURIComponent(body.filter)}) AND (PK <> 0)`; // PK <> 0 to avoid the invalid empty record
  else
    aql += ` where PK <> 0`; // PK <> 0 to avoid the invalid empty record
  // if (fieldsWhere)
  //   aql += ` AND ${fieldsWhere}`;
  if (body.groupby)
    aql += ` group by ${body.groupby}`;
  // order by
  aql += ` order by ${aggregate} desc`;

  return aql;
}

export function getDownloadQuery(sqlname) {
  return DOWNLOAD_DEF_URL + '/' + sqlname;
}

export const setMessage = (messages, view, time, num) => {
  if (messages[view._id]) {
    messages[view._id].timeEnd = time;
    messages[view._id].num = num;
  } else {
    messages[view._id] = { view: view, timeStart: time, num: num };
  }
};

export function getLinkFilter(link, record) {
  let AQL = "";
  if (link.src_field) {
    var relative_path = link.src_field.relative_path;
    var src_field = relative_path ? relative_path + '.' + link.src_field.sqlname : link.src_field.sqlname;
    if (typeof record[src_field] !=='undefined') {
      AQL = `${link.dest_field.sqlname}=${record[src_field]}`;
    }
  }

  return link.body.filter ? `(${link.body.filter}) AND ${AQL}` : AQL;
}

export function posOrderby(orderby = '', field = '') {
  let fields = orderby.split(',');
  let seq = fields.indexOf(field + ' desc') > -1 ? fields.indexOf(field + ' desc') : fields.indexOf(field);
  if (orderby &&  seq> -1)
    return seq + 1;
}
