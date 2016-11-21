/**
 * Created by huling on 11/10/2016.
 */
import {getDisplayLabel, getFieldStrVal } from './RecordFormat';
import {loadRecordsByBody, getQueryByBody} from '../actions/explorer';

function getLinkData(link, pdf_link = []) {
  let label = link.label;
  let fields = link.body.fields;
  link.body.param = {limit: 1};

  return loadRecordsByBody(link.body).then(data => {
    const links = link.body.links;
    const promises = [];
    if (links && links.length > 0) {
      const pdf_ol = [];

      pdf_link.push({
        text: `${label} (${data.count})`, style: 'subheader'
      });

      pdf_link.push({
        ol: pdf_ol,
        margin: [20, 0, 0, 0]
      });

      data.entities.map((record) => {
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

        links.forEach((sub_link) => {
          sub_link.body.params = getQueryByBody(getLinkBody(sub_link, record));
          promises.push(getLinkData(sub_link, summary.stack));
        });
      });
    } else {
      pdf_link.push(genTable({label, records: data.entities, fields}, {length: 0}));
    }
    return Promise.all(promises);
  });
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

/*
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
*/

export {
  getLinkData,
  genSummary
};
