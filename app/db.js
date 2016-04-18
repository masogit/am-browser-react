var Engine = require('tingodb')();
var loki = require('lokijs');
var db;
var tingodbFolder;
const fs = require('fs');

// check db folder and files
exports.init = function (dbFolder, json) {
    tingodbFolder = dbFolder;
    db = new loki(dbFolder + json);
    fs.exists(dbFolder, function (db) {
        if (!db) {
            console.log("not found db folder");

            fs.mkdir(dbFolder, function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The db folder was created!");
            })

        }

        fs.exists(dbFolder + json, function (template) {
            if (!template)
                fs.writeFile(dbFolder + json, "", function (err) {
                    if (err) {
                        return console.log(err);
                    }

                    console.log("The template file was created!");
                });
        });

    });

    // init create public/csv folder
    fs.exists("csv", function (db) {
        if (!db) {
            console.log("not found csv folder");

            fs.mkdir("csv", function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The csv folder was created!");
            })

        }
    });
};

/**
 * tingodb Collection download
 * /download/:collectionName?id=:id
 */
exports.download = function (req, res) {
  var collectionName = req.params.collection;
  var id = req.params.id;
  if (id) {
    var db = new Engine.Db(tingodbFolder, {});
    db.collection(collectionName).findOne({_id: id}, function(err, documents) {
      if (err)
        console.log(err);
      res.setHeader('Content-disposition', 'attachment; filename='+collectionName+'_'+id+'.json');
      res.setHeader('Content-type', 'application/json');
      res.setHeader('Content-Length', Object.keys(documents).length);
      res.write(JSON.stringify(documents), 'binary');
      res.end();
      db.close();
    });
  }
  else {
    var file = fs.readFileSync(tingodbFolder+'/'+collectionName, 'binary');
    res.setHeader('Content-disposition', 'attachment; filename='+collectionName);
    res.setHeader('Content-type', 'application/json');
    res.setHeader('Content-Length', file.length);
    res.write(file, 'binary');
    res.end();
  }

};


// tingodb Read all or one
exports.find = function (req, res) {
    var db = new Engine.Db(tingodbFolder, {});
    var collectionName = req.params.collection;
    db.collection(collectionName).find().toArray(function(err, documents) {
      if (err)
        console.log(err);
      res.json(documents);
      db.close();
    });
};

exports.findOne = function (req, res) {
    var db = new Engine.Db(tingodbFolder, {});
    var collectionName = req.params.collection;
    var id = req.params.id;
    db.collection(collectionName).findOne({_id: id}, function(err, documents) {
      if (err)
        console.log(err);
      res.json(documents);
      db.close();
    });
};

// tingodb Insert or Update
exports.upsert = function (req, res) {
    var db = new Engine.Db(tingodbFolder, {});
    var collectionName = req.params.collection;
    var obj = req.body;

    if (!obj._id)
      obj._id = (Math.random() + 1).toString(36).substring(7);
      // obj._id = new Engine.ObjectID().toString();

    db.collection(collectionName).update({_id: obj._id}, obj, {upsert: true}, function(err, result){
      if (err)
        console.log(err);
      res.json(result);
      db.close();
    });
};

// tingodb Delete
exports.delete = function (req, res) {
    var db = new Engine.Db(tingodbFolder, {});
    var collectionName = req.params.collection;
    var id = req.params.id;
    db.collection(collectionName).remove([{_id: id}], function(err, result){
      if (err)
        console.log(err);
      res.json(result);
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
            // console.log(temp.data);
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

exports.set = function (req, res) {
    var collectionName = req.params.collection;
    var coll = db.getCollection(collectionName);
    if (!coll) {
        coll = db.addCollection(collectionName);
    }
    var obj = req.body;

    var data;
    if (obj.$loki)
        data = coll.update(obj);
    else
        data = coll.insert(obj);
    res.json(data);

    db.saveDatabase();
};

exports.setColl = function (collectionName, obj) {
    var coll = db.getCollection(collectionName);
    if (!coll) {
        coll = db.addCollection(collectionName);
    }

    var data;
    if (obj.$loki)
        data = coll.update(obj);
    else
        data = coll.insert(obj);

    db.saveDatabase();
};

exports.del = function (req, res) {
    var collectionName = req.params.collection;
    var id = req.params.id;
    var coll = db.getCollection(collectionName);
    console.log("Delete collection: " + collectionName + " id: " + id);
    var data = coll.remove({$loki: id});
    res.json(data);

    db.saveDatabase();
};
