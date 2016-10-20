var Engine;
var db;
const fs = require('fs');
var logger = require('./logger.js');
var Validator = require('./validator.js');
var modules = require('./constants').modules;

// check db folder and files
exports.init = function (dbFolder) {
  logger.info("[server]", `Set db folder to ${dbFolder}`);
  Engine = require('tingodb')();
  db = new Engine.Db(dbFolder, {});
  fs.exists(dbFolder, function (db) {
    if (!db) {
      logger.info("[server]", `The db folder '${dbFolder}' not found, will create it.`);

      fs.mkdir(dbFolder, function (err) {
        if (err) {
          return logger.error(err);
        }else{
          logger.info("[server]", `The db folder '${dbFolder}' was created.`);
        }
      });

    }
  });
};

exports.mongo = function (mongo) {
  logger.info("[server]", `Connecting mongodb`);

  var MongoClient = require('mongodb').MongoClient;
  var authUrl = `${mongo.username}:${mongo.password}@`;
  var url = `mongodb://${mongo.username ? authUrl : ''}${mongo.server}:${mongo.port}/${mongo.db}`;
  MongoClient.connect(url, function(err, ambdb) {
    if(!err) {
      db = ambdb;
      logger.info("[server]", `Mongodb ${mongo.server} connected`);
    } else {
      logger.error("[mongodb]", err);
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
  var collectionName = req.params.collection;
  var id = req.params.id;
  var download = req.query.download;

  // Insight get data by user
  var filter = {};
  if (req.originalUrl.indexOf(modules.insight) > -1) {
    filter = {user: req.session.user};
  }

  if (id)
    db.collection(collectionName).findOne(Object.assign({_id: id}, filter), function (err, document) {
      if (err)
        logger.error("[tingo]", err);
      else if (download)
        JSONDownloader(res, document, (document.name || id) + '.json');
      else
        res.json(document);
    });
  else
    db.collection(collectionName).find(filter).toArray(function (err, documents) {
      if (err)
        logger.error("[tingo]", err);
      else if (download)
        JSONDownloader(res, documents, collectionName + '.json');
      else
        res.json(documents);
    });
};

exports.findOne = function (collectionName, id, callback) {
  // Insight get data by user
  var filter = {};
  if (req.originalUrl.indexOf(modules.insight) > -1) {
    filter = {user: req.session.user};
  }

  db.collection(collectionName).findOne(Object.assign({_id: id}, filter), function (err, documents) {
    if (err)
      logger.error("[tingo]", err);
    if (typeof callback == 'function')
      callback(documents);
  });
};

// tingodb Find by filter
exports.findBy = function (collectionName, filter) {
  return new Promise(function (resolve, reject) {
    db.collection(collectionName).find(filter).toArray(function (err, documents) {
      if (err) {
        logger.error("[tingo]", err);
        reject(err);
      }

      resolve(documents);
    });
  });
};

// tingodb Insert or Update
exports.upsert = function (req, res) {
  var collectionName = req.params.collection;
  var id = req.params.id;
  var obj = req.file ? JSON.parse(req.file.buffer) : req.body;

  // Insight save by user
  if (req.originalUrl.indexOf(modules.insight) > -1) {
    obj = Object.assign(obj, {user: req.session.user});
  }

  // Validation then save or update
  var validator = new Validator();
  var error = validator.document(collectionName, obj);
  if (typeof error == 'string') {  // Simple String error
    logger.error(`[tingo]`, error);
    res.status(400).send(error);
  } else if (error instanceof Promise) {  // Promise
    error.then((message) => {
      if (message) {
        logger.error(`[tingo]`, message);
        res.status(400).send(message);
      } else {
        if (id)
          obj._id = id;

        if (!obj._id)
          obj._id = (Math.random() + 1).toString(36).substring(7);

        db.collection(collectionName).update({_id: obj._id}, obj, {upsert: true}, function (err, result) {
          if (err)
            logger.error("[tingo]", err);
          res.send(obj._id);
        });
      }
    });
  } else {  // no error message
    if (id)
      obj._id = id;

    if (!obj._id)
      obj._id = (Math.random() + 1).toString(36).substring(7);

    db.collection(collectionName).update({_id: obj._id}, obj, {upsert: true}, function (err, result) {
      if (err)
        logger.error("[tingo]", err);
      res.send(obj._id);
    });
  }
};

// tingodb Delete
exports.delete = function (req, res) {
  var collectionName = req.params.collection;
  var id = req.params.id;
  db.collection(collectionName).remove([{_id: id}], function (err, result) {
    if (err)
      logger.error("[tingo]", err);
    res.send(id);
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
