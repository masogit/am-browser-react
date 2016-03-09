var loki = require('lokijs');
var db;

// check db folder and files
exports.init = function (dbFolder, json) {
    db = new loki(dbFolder + json);
    const fs = require('fs');
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
//        fs.exists(dbFolder + '/metadata.json', function (metadata) {
//            if (!metadata)
//                fs.writeFile(dbFolder + "/metadata.json", "", function (err) {
//                    if (err) {
//                        return console.log(err);
//                    }
//
//                    console.log("The metadata file was created!");
//                });
//        });

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

exports.getColl = function (collectionName) {
    db.loadDatabase({}, function () {
        var coll = db.getCollection(collectionName);
        if (!coll) {
            return [];
        } else {
            return coll.data;
        }
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

exports.del = function (req, res) {
    var collectionName = req.params.collection;
    var id = req.params.id;
    var coll = db.getCollection(collectionName);
    console.log("Delete collection: " + collectionName + " id: " + id);
    var data = coll.remove({$loki: id});
    res.json(data);

    db.saveDatabase();
};
