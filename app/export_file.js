var Client = require('node-rest-client').Client;
var client = new Client();
var Convertor = require('json-2-csv');
var logger = require('./logger');
var cookiesUtil = require('./cookiesUtil');

module.exports = function (am) {
  this.list = function(req, res) {
    if (!req.body.param || !req.body.fields || !req.body.fields instanceof Array || req.body.fields.length < 1) {
      res.status(400).send('Bad parameters for exporting csv!');
    }

    var url = "http://${server}${context}${ref-link}";
    var auth = req.session.jwt ? req.session.jwt.secret : undefined;
    var headers = (auth) ? {
      "Content-Type": "application/json",
      "X-Authorization": auth
    } : undefined;
    // LWSSO enabled
    if (am.enable_lwsso) {
      if (headers) {
        headers.Cookies = cookiesUtil.getCookies(req);
      } else {
        headers = {
          "Content-Type": "application/json",
          "Cookies": cookiesUtil.getCookies(req)
        };
      }

    }
    var request;
    var param = JSON.parse(req.body.param);
    var args = {
      path: {
        server: am.server,
        context: am.context,
        "ref-link": '/db/' + req.params.tableName
      },
      parameters: param,
      headers: headers
    };

    request = client.get(url, args, (data) => {
      // type: 'csv' or 'pdf'
      var type = req.query.type;
      var isOffset = !param.offset || param.offset === 0 || param.offset === "0";
      if (isOffset) {
        param.offset = 0;
        res.setHeader('Content-disposition', 'attachment; filename=' + req.body.label + '.' + type);
        res.setHeader('Content-type', (type=='csv')?'text/csv':'application/pdf');
      }

      param.limit = 1000;

      if (data.entities && data.entities.length > 0) {
        var Export_file = require('./export_file.js');
        var export_file = new Export_file(am);
        if (type == 'csv')
          Convertor.json2csv(getFormattedRecords(JSON.parse(req.body.fields), data.entities), (err, csv) => {
            res.write(csv, 'binary');

            if (data.count > data.entities.length + param.offset) {
              param.offset += data.entities.length;
              req.body.param = JSON.stringify(param);
              export_file.list(req, res);
            } else
              res.end();

          }, {delimiter: {field: ',', array: ';', wrap: '', eol: '\n'}, prependHeader: isOffset});
      } else
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

function getFieldStrVal(record, field, noEscape) {
  var val = record[field.sqlname] || '';
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

  return noEscape ? val.toString() : escapeStr(val);
}

function escapeStr(val) {
  if (typeof val == 'string') {
    val = val.replace(/"/g, '""');
    return '"' + val + '"';
  } else
    return val.toString();
}

function getDisplayLabel(field) {
  return field.alias ? field.alias : (field.label ? field.label : field.sqlname);
}
