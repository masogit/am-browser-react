/**
 * Document logic validation
 * @param documentName
 * @param document
 * @returns error message
 */
module.exports = function () {

  this.document = function (documentName, document) {
    return eval('this.' + documentName)(document);
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
    return "Name is required, limit length: 1 to 100!";
  if (invalidLength(obj.category, 1, 100))
    return "Category is required, limit length: 1 to 100!";
  if (!obj.body)
    return "Body is required!";

  // content validation
  if (error = body(obj.body))
    return error;

  return null;
}

function body(obj) {
  // existing validation
  if (invalidLength(obj.sqlname))
    return "Provide a table!";
  if (invalidLength(obj.label))
    return "label is required in body!";
  if (!(obj.fields && obj.fields instanceof Array && obj.fields.length > 0))
    return "Fields is required in body!";

  // content validation
  obj.fields.forEach((obj) => {
    if (error = field(obj))
      return error;
  });

  if (obj.links) {
    if (!obj.links instanceof Array)
      return "links must is array!";

    obj.links.forEach((obj)=> {
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

function link(link) {
  /*
   TODO: sqlname, label, src_field.sqlname, src_field.relative_path, dest_field.sqlname
   */

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
  return null;
}

function wall(wall) {
  if (!wall.user)
    return "user is required!";
  if (!wall.box)
    return "box is required!";
  if (error = box(wall.box))
    return error;

  return null;
}

function box(box) {
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