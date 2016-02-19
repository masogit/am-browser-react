var loki = require('lokijs');

// check db folder and files
exports.init = function (dbFolder) {
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

        fs.exists(dbFolder + '/template.json', function (template) {
            if (!template)
                fs.writeFile(dbFolder + "/template.json", "", function (err) {
                    if (err) {
                        return console.log(err);
                    }

                    console.log("The template file was created!");
                });
        });
        fs.exists(dbFolder + '/metadata.json', function (metadata) {
            if (!metadata)
                fs.writeFile(dbFolder + "/metadata.json", "", function (err) {
                    if (err) {
                        return console.log(err);
                    }

                    console.log("The metadata file was created!");
                });
        });

    });
};

exports.get = function (req, res) {
    var db = new loki('db/template.json');

    var collectionName = req.params.collection;
    db.loadDatabase({}, function () {
        var coll = db.getCollection(collectionName);
        if (!coll) {
            coll = db.addCollection(collectionName);
        } else {
            // console.log(temp.data);
            res.json(coll.data);
        }
        db.saveDatabase();
    });
};

exports.set = function (req, res) {
    var db = new loki('db/template.json');

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
    var db = new loki('db/template.json');

    var collectionName = req.params.collection;
    var id = req.params.id;
    var coll = db.getCollection(collectionName);
    console.log("Delete collection: " + collectionName + " id: " + id);
    var data = coll.remove({$loki: id});
    res.json(data);

    db.saveDatabase();
};
