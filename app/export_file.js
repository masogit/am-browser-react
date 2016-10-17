var Client = require('node-rest-client').Client;
var client = new Client();
var Convertor = require('json-2-csv');
var logger = require('./logger');
var PdfPrinter = require('pdfmake/src/printer');
var fonts = {
  Roboto: {
    normal: './app/fonts/Roboto-Regular.ttf',
    bold: './app/fonts/Roboto-Bold.ttf',
    italics: './app/fonts/Roboto-Italic.ttf',
    bolditalics: './app/fonts/Roboto-Italic.ttf'
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
    margin: [0, 10, 0, 15]
  },
  tableFields: {
    margin: [0, 20, 20, 15]
  },
  tableExample: {
    margin: [0, 5, 0, 15]
  },
  tableHeader: {
    italics: true,
    fontSize: 13,
    color: 'black'
  }
};

module.exports = function (am) {
  this.report = function report(req, res) {
    res.setHeader('Content-disposition', 'attachment; filename=' + req.body.label + '.pdf');
    res.setHeader('Content-type', 'application/pdf');
    var pdf_data = {
      pageOrientation: 'landscape',
      content: [
        {
          text: [
            { text: 'Reports: ' + req.body.label + ' ', style: 'header'},
            { text: '(' + JSON.parse(req.body.record).self + ')', italics: true}
          ]
        },
        'Below report is generated from AM Browser.',
        {
          alignment: 'justify',
          columns: genSummary(JSON.parse(req.body.record), JSON.parse(req.body.fields))
        }
      ],
      styles: pdf_styles
    };

    // Query links' data
    let links = JSON.parse(req.body.links);
    let promises = [];
    let pdf_links = [];
    pdf_data.content.push(pdf_links);
    links.forEach((link) => {
      let pdf_link = [];
      pdf_links.push(pdf_link);
      let args = getArgs(req.session.jwt, link.body.sqlname, getQueryByBody(link.body), am.server, am.context);
      promises.push(getLinkData(args, link, pdf_link));
    });
    Promise.all(promises).then(() => {
      var pdfDoc = printer.createPdfKitDocument(pdf_data);
      pdfDoc.pipe(res);
      pdfDoc.end();
    }, (reason) => {
      console.log(reason);
    });

  };
  this.list = function(req, res) {
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
        else {
          var records = req.body.records || [];
          records = records.concat(data.entities);

          if (data.count > data.entities.length + param.offset) {
            param.offset += data.entities.length;
            req.body.param = JSON.stringify(param);
            req.body.records = records;
            export_file.list(req, res);
          } else {
            var pdfDoc = printer.createPdfKitDocument(recordsToPdfDoc(JSON.parse(req.body.fields),
              records,
              req.body.label,
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
};

function getLinkData(args, link, pdf_link) {
  let label = link.label;
  let fields = link.body.fields;
  let url = "http://${server}${context}${ref-link}";
  return new Promise((resolve, reject) => {
    request = client.get(url, args, (data) => {
      let links = link.body.links;
      if (links && links.length > 0) {
        pdf_link.push({
          text: `${label} (${data.count})`, style: 'subheader'
        });
        let pdf_ol = [];
        pdf_link.push({
          ol: pdf_ol,
          margin: [20, 0, 0, 0]
        });

        let promises = [];  // create promise for each record
        data.entities.map((record) => {
          promises.push(new Promise((res, rej) => {
            let summary = {
              stack: [
                {text: record.self, style: 'tableHeader'},
                {
                  alignment: 'justify',
                  columns: genSummary(record, fields)
                }
              ],
              margin: [0, 0, 0, 40]
            };
            pdf_ol.push(summary);

            let link_promises = [];
            links.forEach((sub_link) => {
              let link_args = Object.assign({}, args);
              link_args.path['ref-link'] = '/db/' + sub_link.body.sqlname;
              link_args.parameters = getQueryByBody(getLinkBody(sub_link, record));
              link_promises.push(getLinkData(link_args, sub_link, summary.stack));
            });
            Promise.all(link_promises).then(()=>{
              res();
            }, (reason) => {
              rej(reason);
            });
          }));

        });

        Promise.all(promises).then(()=>{
          resolve();
        }, (reason) => {
          reject(reason);
        });
      } else {
        pdf_link.push(genTable({label, records: data.entities, fields}, {length: 0}));
        resolve();
      }

    }).on('error', function (err) {
      reject(err);
      logger.error('Query REST data: ' + err.toString());
      res.status(500).send(err.toString());
    });
    request.on('error', function (err) {
      reject(err);
      logger.error('Query REST data: ' + err);
      res.status(500).send(err.toString());
    });
  });
}

function getArgs(jwt, tableName, param, server, context) {
  var auth = jwt ? jwt.secret : undefined;
  param.limit = 100;
  return {
    path: {
      server: server,
      context: context,
      "ref-link": '/db/' + tableName
    },
    parameters: param,
    headers: (auth) ? {
      "Content-Type": "application/json",
      "X-Authorization": auth
    } : undefined
  };
}

function getQueryByBody(body) {

  var fields = [];
  body.fields.forEach(function (field) {
    fields.push(field.sqlname);
  });

  // add src_fields before query
  if (body.links && body.links.length > 0) {
    var src_fields = body.links.map((link) => {
      if (link.src_field) {
        var relative_path = link.src_field.relative_path;
        return relative_path ? relative_path + '.' + link.src_field.sqlname : link.src_field.sqlname;
      }
    });

    // remove same fields
    src_fields.filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    });

    fields = fields.concat(src_fields);
  }

  var param = {
    limit: 100,
    offset: 0,
    countEnabled: true,
    fields: fields.join(',')
  };
  if (body.orderby) {
    param.orderby = body.orderby;
  }
  if (body.filter) {
    param.filter = body.filter;
  }

  var userParam = body.param;
  if (userParam) {
    if (userParam.orderby)
      param.orderby = userParam.orderby;
    if (userParam.limit)
      param.limit = userParam.limit;
    if (userParam.offset)
      param.offset = userParam.offset;
    if (userParam.filters && userParam.filters.length > 0) {
      var userFilters = userParam.filters.map((filter) => {
        return '(' + filter + ')';
      }).join(" AND ");
      param.filter = param.filter ? `(${param.filter}) AND (${userFilters})` : userFilters;
    }
  }

  return param;
}

function getLinkBody(link, record) {
  var body = Object.assign({}, link.body);

  let AQL = "";
  if (link.src_field) {
    var relative_path = link.src_field.relative_path;
    var src_field = relative_path ? relative_path + '.' + link.src_field.sqlname : link.src_field.sqlname;
    if (record[src_field]) {
      AQL = `${link.dest_field.sqlname}=${record[src_field]}`;
    }
  }

  body.filter = body.filter ? `(${body.filter}) AND ${AQL}` : AQL;
  return body;
}

function genTable({label, records, fields}, max) {
  if (!records)
    return [];

  return [
    {
      text: `${label} (${records.length})`, style: 'subheader'
    },
    {
      style: 'tableExample',
      table: {
        body: genTbody(records, fields, max)
      },
      layout: 'lightHorizontalLines'
    }
  ];
}

function genSummary(record, fields) {
  var pdf_header = [{}, {}];

  fields.forEach((field, index) => {
    var column = !(index % 2) ? pdf_header[0] : pdf_header[1];
    if (!column.table)
      Object.assign(column, {
        layout: 'noBorders',
        style: 'tableFields',
        table: {
          widths: ['auto', '*'],
          body:[]
        }
      });

    column.table.body.push([
      {text: getDisplayLabel(field), bold: true},
      getFieldStrVal(record, field, true)
    ]);
  });

  return pdf_header;
}

function genTbody(records, fields, max) {
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
    var length = 0;
    fields.forEach((field) => {
      var val = getFieldStrVal(record, field, true) || '';
      row.push(val.toString());
      length += val.length;
    });
    tbody.push(row);
    if (length > max.length)
      max.length = length;
  });

  return tbody;
}

// Generate pdf content from records
function recordsToPdfDoc(fields, records, reportLabel, param, data) {
  var max = { length: 0 };
  var tbody = genTbody(records, fields, max);

  // Groupby
  var groupby = [];
  var groupTables = [];
  if (data && data.rows) {
    data.rows.forEach((row) => {
      groupby.push([{ul: [(row[0] ? row[0] : '<empty>')]}, row[1]]);
      var sub_records = records.filter((record) => {
        var val = record[data.header[0].Content];
        if (val instanceof Object)
          val = val[Object.keys(val)[0]];
        return val == row[0];
      });

      // fields remove the groupby
      var newFields = fields.filter((field) => {
        return field.sqlname != data.header[0].Content;
      });
      var sub_tbody = genTbody(sub_records, newFields, max);
      groupTables.push([
        {text: (row[0] ? row[0] : '<empty>') + ' (' + row[1] + ')', style: 'subheader'},
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            body: sub_tbody
          },
          layout: 'lightHorizontalLines'
        }
      ]);
    });
  }

  var pdf_data = {
    pageOrientation: max.length > 80 ? 'landscape' : 'portrait',
    content: [
      { text: 'Reports: ' + reportLabel, style: 'header'},
      'Below report is generated from AM Browser.',
      { text: 'Conditions', style: 'subheader'},
      param.filter ? param.filter : '',
      data ? { text: 'Statistics by ' + getGroupbyDisplayLabel(fields, data.header[0].Content), style: 'subheader'} : '',
      groupby.length > 0 ? {
        table: {
          body: groupby
        },
        layout: 'noBorders'
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
      },
      layout: 'lightHorizontalLines'
    });
  }

  return pdf_data;
}

function getGroupbyDisplayLabel(fields, sqlname) {
  if (sqlname) {
    let groupby = fields.filter((field) => {
      return field.sqlname == sqlname;
    })[0];

    return getDisplayLabel(groupby);
  }
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