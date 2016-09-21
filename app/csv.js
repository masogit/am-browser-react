var Client = require('node-rest-client').Client;
var client = new Client();
var Convertor = require('json-2-csv');
var logger = require('./logger');
var PdfPrinter = require('pdfmake/src/printer');
var fonts = {
  Roboto: {
    normal: './app/fonts/Roboto-Regular.ttf',
    bold: './app/fonts/Roboto-Bold.ttf',
    italics: './app/fonts/Roboto-Regular.ttf',
    bolditalics: './app/fonts/Roboto-Regular.ttf'
  }
};
var printer = new PdfPrinter(fonts);
var pdf_styles = {
  header: {
    fontSize: 18,
    bold: true,
    margin: [0, 0, 0, 10]
  },
  subheader: {
    fontSize: 16,
    bold: true,
    margin: [0, 10, 0, 5]
  },
  tableExample: {
    margin: [0, 5, 0, 15]
  },
  tableHeader: {
    bold: true,
    fontSize: 13,
    color: 'black'
  }
};

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
      // type: 'csv' or 'pdf'
      var type = req.query.type;
      var isOffset = !param.offset || param.offset === 0 || param.offset === "0";
      if (isOffset) {
        param.offset = 0;
        res.setHeader('Content-disposition', 'attachment; filename=' + req.params.tableName + '.' + type);
        res.setHeader('Content-type', (type=='csv')?'text/csv':'application/pdf');
      }

      if (data.count >= 10000)
        param.limit = 1000;
      else if (data.count < 10000 && data.count >= 1000)
        param.limit = parseInt(data.count / 10);
      else
        param.limit = 100;

      if (data.entities && data.entities.length > 0) {
        if (type == 'csv')
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
        else {
          var records = req.body.records || [];
          records = records.concat(data.entities);

          if (data.count > data.entities.length + param.offset) {
            param.offset += data.entities.length;
            var CSV = require('./csv.js');
            var csv = new CSV(am);
            req.body.param = JSON.stringify(param);
            req.body.records = records;
            csv.download(req, res);
          } else {
            var pdfDoc = printer.createPdfKitDocument(recordsToPdfDoc(JSON.parse(req.body.fields),
                                                                      records,
                                                                      req.params.tableName,
                                                                      JSON.parse(req.body.param),
                                                                      JSON.parse(req.body.graphData)));
            pdfDoc.pipe(res);
            pdfDoc.end();
          }
        }
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

  function genTbody(records, fields) {
    var tbody = [];
    var header = [];
    fields.forEach((field) => {
      header.push({
        text: getDisplayLabel(field),
        style: 'tableHeader'
      });
    });
    tbody.push(header);
    records.forEach((record) => {
      var row = [];
      fields.forEach((field) => {
        row.push(getFieldStrVal(record, field, true));
      });
      tbody.push(row);
    });

    return tbody;
  }

  // Generate pdf content from records
  function recordsToPdfDoc(fields, records, tableName, param, data) {
    var tbody = [];
    tbody = genTbody(records, fields);

    // Groupby
    var groupby = [];
    var groupTables = [];
    if (data && data.rows) {
      data.rows.forEach((row) => {
        groupby.push([(row[0] ? row[0] : '<empty>'), row[1]]);
        var sub_records = records.filter((record) => {
          var val = record[data.header[0].Content];
          if (val instanceof Object)
            val = val[Object.keys(val)[0]];
          return val == row[0];
        });
        var sub_tbody = genTbody(sub_records, fields);
        groupTables.push([
          {text: (row[0] ? row[0] : '<empty>') + ' (' + row[1] + ')', style: 'subheader'},
          {
            style: 'tableExample',
            table: {
              headerRows: 1,
              body: sub_tbody
            }
          }
        ]);
      });
    }

    var pdf_data = {
      content: [
        { text: 'Reports: ' + tableName, style: 'header'},
        'Below report is generated from AM Browser.',
        { text: 'Conditions', style: 'subheader'},
        param.filter ? param.filter : '',
        data ? { text: 'Statistics by ' + data.header[0].Content, style: 'subheader'} : '',
        groupby.length > 0 ? {
          table: {
            body: groupby
          },
          layout: 'noBorders',
          margin: [30, 0, 0, 0]
        } : ''
      ],
      styles: pdf_styles
    };

    if (data && groupTables.length > 0) {
      groupTables.forEach((table) => {
        pdf_data.content.push(table);
      });
    } else {
      pdf_data.content.push({
        style: 'tableExample',
        table: {
          headerRows: 1,
          body: tbody
        }
      });
    }

    return pdf_data;
  }

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

    return noEscape ? val : escapeStr(val);
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
