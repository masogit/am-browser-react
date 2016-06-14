var Engine = require('tingodb')();
var tingodbFolder;
const fs = require('fs');
var logger = require('./logger.js');
var Validator = require('./validator.js');

// check db folder and files
exports.init = function (dbFolder) {
  logger.info(`Set db folder to ${dbFolder}`);
  tingodbFolder = dbFolder;
  fs.exists(dbFolder, function (db) {
    if (!db) {
      logger.info(`The db folder '${dbFolder}' not found, will create it.`);

      fs.mkdir(dbFolder, function (err) {
        if (err) {
          return logger.error(err);
        }else{
          logger.info(`The db folder '${dbFolder}' was created.`);
        }
      })

    }
  });
};

/**
 * Download feature
 * /coll/view/1234?download=true
 */
function JSONDownloader(res, json, filename) {
  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-type', 'application/json');
  res.write(JSON.stringify(json), 'binary');
  res.end();
}

// tingodb Read all or one
exports.find = function (req, res) {
  var db = new Engine.Db(tingodbFolder, {});
  var collectionName = req.params.collection;
  var id = req.params.id;
  var download = req.query.download;
  if (id)
    db.collection(collectionName).findOne({_id: id}, function (err, document) {
      if (err)
        logger.error(err);
      else if (download)
        JSONDownloader(res, document, (document.name || id) + '.json');
      else
        res.json(document);
      db.close();
    });
  else
    db.collection(collectionName).find().toArray(function (err, documents) {
      if (err)
        logger.error(err);
      else if (download)
        JSONDownloader(res, documents, collectionName + '.json');
      else
        res.json(documents);
      db.close();
    });
};

exports.findOne = function (collectionName, id, callback) {
  var db = new Engine.Db(tingodbFolder, {});

  db.collection(collectionName).findOne({_id: id}, function (err, documents) {
    if (err)
      logger.error(err);
    if (typeof callback == 'function')
      callback(documents);
    db.close();
  });
};

// tingodb Insert or Update
exports.upsert = function (req, res) {
  var db = new Engine.Db(tingodbFolder, {});
  var collectionName = req.params.collection;
  var id = req.params.id;
  var obj = req.body;

  var validator = new Validator();
  var error = validator.document(collectionName, obj);
  if (error) {
    logger.error(error);
    res.status(400).send(error);
  } else {
    if (id)
      obj._id = id;

    if (!obj._id)
      obj._id = (Math.random() + 1).toString(36).substring(7);

    db.collection(collectionName).update({_id: obj._id}, obj, {upsert: true}, function (err, result) {
      if (err)
        logger.error(err);
      res.send(obj._id);
      db.close();
    });
  }
};

// tingodb Delete
exports.delete = function (req, res) {
  var db = new Engine.Db(tingodbFolder, {});
  var collectionName = req.params.collection;
  var id = req.params.id;
  db.collection(collectionName).remove([{_id: id}], function (err, result) {
    if (err)
      logger.error(err);
    res.send(id);
    db.close();
  });
};

exports.get = function (req, res) {
  var collectionName = req.params.collection;
  db.loadDatabase({}, function () {
    var coll = db.getCollection(collectionName);
    if (!coll) {
      res.json([]);
    } else {
      // logger.info(temp.data);
      res.json(coll.data);
    }
  });

};

exports.getColl = function (collectionName, callback) {
  db.loadDatabase({}, function () {
    var coll = db.getCollection(collectionName);
    if (callback instanceof Function && coll && coll.data)
      callback(coll.data);
  });
};
