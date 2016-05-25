export function getFieldStrVal(record, field) {
  var val = record[field.sqlname];
  if (field.user_type && field.user_type == 'System Itemized List')
    val = val[Object.keys(val)[0]];
  else if (field.type && field.type.indexOf('Date') > -1) {
    var d = new Date(val * 1000);
    val = d.toLocaleString();
  } else if (val instanceof Object)
    val = val[Object.keys(val)[0]];

  return val;
}

export function getDisplayLabel(field) {
  return field.alias ? field.alias : (field.label ? field.label : field.sqlname);
}
