var Client = require('node-rest-client').Client;
var client = new Client();
var Convertor = require('json-2-csv');
var logger = require('./logger');

module.exports = function (am) {

  this.download = function (req, res) {

    if (!req.body.param || !req.body.fields || !req.body.fields instanceof Array || req.body.fields.length < 1) {
      res.status(400).send('Bad parameters for exporting csv!');
    }

    var url = "http://${server}${context}${ref-link}";
    var auth = req.session.jwt ? req.session.jwt.secret : undefined;
    var request;
    var param = JSON.parse(req.body.param);
    var args = {
      path: {
        server: am.server,
        context: am.context,
        "ref-link": '/db/' + req.params.tableName
      },
      parameters: param,
      headers: (auth) ? {
        "Content-Type": "application/json",
        "X-Authorization": auth
      } : undefined
    };

    request = client.get(url, args, (data, response) => {
      var isOffset = !param.offset || param.offset === 0 || param.offset === "0";
      if (isOffset) {
        param.offset = 0;
        res.setHeader('Content-disposition', 'attachment; filename=' + req.params.tableName + '.csv');
        res.setHeader('Content-type', 'text/csv');
      }

      if (data.count >= 10000)
        param.limit = 1000;
      else if (data.count < 10000 && data.count >= 1000)
        param.limit = parseInt(data.count / 10);
      else
        param.limit = 100;

      if (data.entities && data.entities.length > 0)
        Convertor.json2csv(getFormattedRecords(JSON.parse(req.body.fields), data.entities), (err, csv) => {
          res.write(csv, 'binary');

          if (data.count > data.entities.length + param.offset) {
            param.offset += data.entities.length;
            var CSV = require('./csv.js');
            var csv = new CSV(am);
            req.body.param = JSON.stringify(param);
            csv.download(req, res);
          } else
            res.end();

        }, {delimiter: {field: ',', array: ';', wrap: '', eol: '\n'}, prependHeader: isOffset});

      else
        res.end();

    }).on('error', function (err) {
      logger.error('Export CSV: ' + err.toString());
      res.status(500).send(err.toString());
    });
    //console.log("request.options: " + JSON.stringify(request.options));
    request.on('error', function (err) {
      logger.error('Export CSV: ' + err);
      console.log('request error: ' + err);
    });

  };

  // Util functions for exporting csv
  function getFormattedRecords(fields, rawRecords) {
    var records = [];
    rawRecords.forEach((rawRecord) => {
      var record = {};
      fields.forEach((field) => {
        record[getDisplayLabel(field)] = getFieldStrVal(rawRecord, field);
      });
      records.push(record);
    });
    return records;
  }

  function getFieldStrVal(record, field) {
    var val = record[field.sqlname];
    if (field.user_type && field.user_type == 'System Itemized List')
      val = val[Object.keys(val)[0]];
    else if (field.type && field.type == 'Date+Time') {
      if (val) {
        var d = new Date(val * 1000);
        val = d.toLocaleString();
      }
    } else if (field.type && field.type == 'Date') {
      if (val) {
        var d = new Date(val * 1000);
        val = d.toLocaleDateString();
      }
    } else if (val instanceof Object)
      val = val[Object.keys(val)[0]];

    return escapeStr(val);
  }

  function escapeStr(val) {
    if (typeof val == 'string') {
      val = val.replace(/"/g, '""');
      return '"' + val + '"';
    } else
      return val;
  }

  function getDisplayLabel(field) {
    return field.alias ? field.alias : (field.label ? field.label : field.sqlname);
  }

};
