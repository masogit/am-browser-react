var Engine = require('tingodb')();
var tingodbFolder;
const fs = require('fs');
var logger = require('./logger.js');

exports.getUserName = (req) => {
  if(req && req.headers.authorization) {
    const user = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString();
    return user.split(':')[0];
  }
  return '';
};

const checkRight = (req) => {
  if(this.getUserName(req) != 'admin') {
    throw 'user has no permission';
  }
};

// check db folder and files
exports.init = function (dbFolder) {
  tingodbFolder = dbFolder;
  fs.exists(dbFolder, function (db) {
    if (!db) {
      logger.info("not found db folder");

      fs.mkdir(dbFolder, function (err) {
        if (err) {
          return logger.error(err);
        }

        logger.info("The db folder was created!");
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
    db.collection(collectionName).findOne({_id: id}, function (err, documents) {
      if (err)
        logger.error(err);
      else if (download)
        JSONDownloader(res, documents, id + '.json');
      else
        res.json(documents);
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
  checkRight(req);
  var db = new Engine.Db(tingodbFolder, {});
  var collectionName = req.params.collection;
  var obj = req.body;

  if (!obj._id)
    obj._id = (Math.random() + 1).toString(36).substring(7);
  // obj._id = new Engine.ObjectID().toString();

  db.collection(collectionName).update({_id: obj._id}, obj, {upsert: true}, function (err, result) {
    if (err)
      logger.error(err);
    res.send(obj._id);
    db.close();
  });
};

// tingodb Delete
exports.delete = function (req, res) {
  checkRight(req);
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
