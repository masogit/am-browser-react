// check db folder and files
module.exports = function (dbFolder) {
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
}
