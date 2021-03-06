/**
 * Document logic validation
 * @param documentName
 * @param document
 * @returns error message
 */
var db = require('./db.js');
var coll = require('./constants').collections;
var rest = require('./rest.js').rest;

module.exports = function () {

  // default type is save or update
  this.document = function (documentName, document, options = {}) {
    if (options.type) {
      if (this[documentName + '_' + options.type])
        return this[documentName + '_' + options.type](document, options);
      else
        return {then: (callback) => callback()};
    } else {
      return this[documentName](document, options);
    }
  };

  // register validate document
  this.view = (document) => view(document);
  this.aql = (document, options) => checkAqlSyntax(document, options);
  this.wall = (document) => wall(document);
  this.report = (document, {session}) => report(document, session);
  this.report_delete = (document, {rightIndex}) => report_delete(document, rightIndex);
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

  // check duplicate
  return db.findBy(coll.view, {name: {'$regex' : `^${obj.name.trim()}$`, '$options' : 'i'}, category: {'$regex' : `^${obj.category.trim()}$`, '$options' : 'i'}}).then((documents) => {
    if (documents.length > 0 && documents[0]._id != obj._id)
      return "View name can not duplicate in same category!";
    else
      return null;
  });
}

function report(obj, session) {

  // existing validation
  if (invalidLength(obj.name, 1, 100))
    return "Report's name is required, limit length: 1 to 100!";
  if (invalidLength(obj.category, 1, 100))
    return "Report's category is required, limit length: 1 to 100!";

  //check only admin can save public
  if (session.rights.index >= 1 && obj.public) {
    return `Only admin can save public PDF template!`;
  }

  // check duplicate
  const rules = {
    name: {'$regex': `^${obj.name.trim()}$`, '$options': 'i'},
    category: {'$regex': `^${obj.category.trim()}$`, '$options': 'i'},
    user: {'$regex': `^${session.user.trim()}$`, '$options': 'i'}
  };

  return db.findBy(coll.report, rules).then((documents) => {
    if (documents.length > 0 && documents[0]._id != obj._id)
      return "Report name can not duplicate in same category!";
    else
      return null;
  });
}

function report_delete(obj, rightIndex) {
  return db.findBy(coll.report, { _id: obj._id }).then((documents) => {
    //check only admin can delete public
    if (documents.length > 0 && documents[0].public && rightIndex >= 1) {
      return `Only admin can delete public PDF template!`;
    }
    return null;
  });
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

function checkAqlSyntax(document, options) {
  return rest.checkAqlSyntax(options.session, document.str).then((data) => {
    return aql(document);
  }).catch((err) => {
    return err.message;
  });
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
  if (!aql[aql.type])
    return "Need Graph settings!";

  if (error = form(aql[aql.type]))
    return error;

  const rules = {
    name: {'$regex': `^${aql.name.trim()}$`, '$options': 'i'},
    category: {'$regex': `^${aql.category.trim()}$`, '$options': 'i'}
  };

  // check duplicate
  return db.findBy(coll.graph, rules).then((documents) => {
    if (documents.length > 0 && documents[0]._id != aql._id)
      return "Graph name can not duplicate in same category!";
    else
      return null;
  });
}

function form(chartSettings) {
  // TODO validate graph settings

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
