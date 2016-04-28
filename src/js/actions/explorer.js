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

export function loadRecordsByBody(body, callback) {

  var fields = [];
  body.fields.forEach(function (field) {
    fields.push(field.sqlname);
  });

  var query = body.sqlname;
  var param = {
    limit: "100",
    offset: "0",
    filter: body.filter,
    orderby: body.orderby,
    fields: fields
  };

  var aql = param2aql(param);

  Rest.get(HOST_NAME + '/am/db/' + query + aql).end(function (err, res) {
    if (err)
      console.log(err);
    else if (res.body.count && res.body.entities)
      callback(res.body);
    else
      callback({count: 0, entities: []});
  });

}

