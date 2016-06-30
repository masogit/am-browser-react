/**
 * Document logic validation
 * @param documentName
 * @param document
 * @returns error message
 */
module.exports = function () {

  this.document = function (documentName, document) {
    return this[documentName](document);
  };

  // register validate document
  this.view = (document) => view(document);
  this.aql = (document) => aql(document);
  this.wall = (document) => wall(document);
};

/************ Unit validation functions *************/

function view(obj) {
  // existing validation
  if (invalidLength(obj.name, 1, 100))
    return "View's name is required, limit length: 1 to 100!";
  if (invalidLength(obj.category, 1, 100))
    return "View's category is required, limit length: 1 to 100!";
  if (!obj.body)
    return "View's body is required!";

  // content validation
  if (error = body(obj.body))
    return error;

  return null;
}

function body(obj) {
  // existing validation
  if (invalidLength(obj.sqlname))
    return "sqlname (table's name) is required in body";
  if (invalidLength(obj.label))
    return "label is required in body!";
  if (!(obj.fields && obj.fields instanceof Array && obj.fields.length > 0)
     && !(obj.links && obj.links instanceof Array && obj.links.length > 0))
    return "At least one field or one link in body!";

  // content validation
  obj.fields.forEach((obj) => {
    if (error = field(obj))
      return error;
  });

  if (obj.links) {
    if (!obj.links instanceof Array)
      return "links must is array!";

    obj.links.forEach((obj) => {
      if (error = link(obj))
        return error;
    });

  }


  /*
   TODO check: filter, orderby, groupby and searchable limit to 2
   */

  return null;
}

function field(obj) {

  // existing validation
  if (invalidLength(obj.sqlname))
    return "sqlname is required in Field!";
  if (invalidLength(obj.label))
    return "label is required in Field!";
  if (invalidLength(obj.type))
    return "type is required in Field!";

  // TODO check if have user_type, must have user_type_format, and format style

  return null;
}

function link(obj) {
  /*
   TODO: sqlname, label, src_field.sqlname, src_field.relative_path, dest_field.sqlname
   */
  // existing validation
  if (invalidLength(obj.sqlname))
    return "sqlname is required in link";
  if (invalidLength(obj.label))
    return "label is required in body!";
  if (!obj.src_field || !obj.src_field.sqlname || !obj.src_field.relative_path)
    return "src_field is required in link; sqlname and relative_path are required in src_field";
  if (!obj.dest_field || !obj.dest_field.sqlname)
    return "dest_field is required in link; sqlname is required in dest_field";

  if (!obj.body)
    return "link's body is required!";

  // content validation
  if (error = body(obj.body))
    return error;

  return null;
}

function aql(aql) {
  // existing validation
  if (invalidLength(aql.name, 1, 100))
    return "Name is required, limit length: 1 to 100!";
  if (invalidLength(aql.category, 1, 100))
    return "Category is required, limit length: 1 to 100!";
  if (invalidLength(aql.str))
    return "AQL is required!";
  if (['chart', 'meter', 'distribution'].indexOf(aql.type) < 0)
    return "type must in: chart, meter, distribution!";
  if (!aql.form)
    return "form is required!";

  if (error = form(form))
    return error;

  return null;
}

function form(form) {
  // TODO validate form

  return null;
}

function wall(wall) {
  if (!wall.tabs)
    return "box is required!";

  return box(wall.tabs);
}

function box(tabs) {
  // TODO validate box
  tabs.forEach(function (tab) {
    var box = tab.box;
    if (!box.direction || !(box.direction == 'column' || box.direction == 'row'))
      return "direction is required in a layout element, value: column or row";
  });

  // if (box.child && box.child instanceof Array)
  //   box.child.forEach((obj)=> {
  //     if (error = this.box(obj))
  //       return error;
  //   });
  // else if (box.child && !box.child._id)
  //   return "Graph's _id is required for layout element";

  return null;
}

/*********** Util *************/
function invalidLength(obj, min, max) {
  if (!obj || obj.trim().length == 0)
    return true;
  if (min && obj.trim().length < min)
    return true;
  if (max && obj.trim().length > max)
    return true;

  return false;
}