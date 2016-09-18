export function getFieldStrVal(record, field) {
  var val = record[field.sqlname] || '';
  if (val) {
    if (field.user_type == 'System Itemized List' || val instanceof Object) {
      val = val[Object.keys(val)[0]];
    } else if (field.type && field.type == 'Date+Time') {
      val = new Date(val * 1000).toLocaleString();
    } else if (field.type && field.type == 'Date') {
      val = new Date(val * 1000).toLocaleDateString();
    }
  }

  return val;
}

export function getDisplayLabel(field) {
  return field.alias ? field.alias : (field.label ? field.label : field.sqlname);
}

export function getFilterFromField(fields, filter) {
  var field = fields.filter((field) => {
    return field.sqlname == filter.key;
  });

  if (field && field[0] && field[0].user_type && field[0].user_type == 'System Itemized List') {
    var format = field[0].user_type_format.split('|');
    var index = format.indexOf(filter.value);
    return `${filter.key}='${format[index + 1]}'`;
  } else {
    return `${filter.key}='${filter.value}'`;
  }
}
