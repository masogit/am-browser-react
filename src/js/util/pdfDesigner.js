/**
 * Created by huling on 11/10/2016.
 */
import { getDisplayLabel, getFieldStrVal } from './RecordFormat';
import { loadRecordsByBody } from '../actions/explorer';
import {GLOBAL_VARIABLES} from '../constants/PDFDesigner';

const genTable = ({title, records, fields, style = {layout: 'headerLineOnly', header: 'tableHeader', text: 'text', tableTitle: {style: 'tableTitle'}}}) => {
  if (!records)
    return [];

  const body = [];
  body.push(fields.map((field, index) => (
  {text: getDisplayLabel(field), style: style.header}
  )));

  records.map((record) => {
    const row = [];
    fields.map((field, tdindex) => (
      row.push({text: getFieldStrVal(record, field), style: style.text})
    ));
    body.push(row);
  });

  const table = [];
  if (title) {
    table.push({text: `${title} (${records.length})`, style: style.tableTitle.style});
  }

  table.push({
    style: style.style,
    table: {
      headerRows: 1,
      body: body
    },
    layout: style.layout
  });

  return table;
};

const getLinkData = (link, pdf_link = [], style = {tableHeader: 'tableHeader', contents: {tableTitle: {style: 'tableTitle'}},fieldBlock: {fieldTitle: {style: 'fieldTitle', text: ''}}}) => {
  const title = style.contents.tableTitle.text ? replacer(style.contents.tableTitle.text, link.label, replaceTableTitle) : link.label;

  const fields = link.body.fields;

  return loadRecordsByBody(link.body).then(data => {
    const links = link.body.links;
    const promises = [];
    if (links && links.length > 0) {
      const pdf_ol = [];

      pdf_link.push({
        text: `${title} (${data.count})`, style: style.contents.tableTitle.style
      });

      pdf_link.push({
        ol: pdf_ol,
        margin: [20, 0, 0, 0]
      });

      data.entities.map((record) => {
        const summary = {
          stack: [
            {text: style.fieldBlock.fieldTitle.text ? replacer(style.fieldBlock.fieldTitle.text, record.self, replaceLinkTitle) : record.self, style: style.fieldBlock.fieldTitle.style},
            {
              alignment: 'justify',
              columns: genSummary(record, fields, style.fieldBlock)
            }
          ],
          margin: [0, 0, 0, 40]
        };
        pdf_ol.push(summary);

        links.forEach((sub_link) => {
          sub_link.body.param = link.body.param;
          promises.push(getLinkData(sub_link, summary.stack, style));
        });
      });
    } else {
      pdf_link.push(genTable({title, records: data.entities, fields}));
    }
    return Promise.all(promises);
  });
};

const updateValue = (event, {state, callback, val = event.target.value, name = event.target.name, type = event.target.type}) => {
  if (type == 'range' || type == 'number') {
    val = parseInt(val);
  } else if (type == 'checkbox') {
    val = event.target.checked;
  }

  if (name.indexOf('.') > -1) {
    const nameParts = name.split('.');
    nameParts.reduce((state, key, index) => {
      if (index == nameParts.length - 1) {
        state[key] = val;
      }
      return state[key];
    }, state);
  } else {
    state[name] = val;
  }

  if (typeof callback == 'function') {
    callback();
  }
};


const analyzeRecordList = (title, filter, allFields, records, style, param, groupByData) => {
  let availableFields = [];
  if (filter.length > 0) {
    allFields.map(field => {
      for (let f of filter) {
        if (field.sqlname.toLowerCase() == f.toLowerCase()) {
          availableFields.push(field);
          break;
        }
      }
    });
  }

  if (availableFields.length == 0) {
    availableFields = allFields;
  }


  return recordsToPdfDoc(title, allFields, records, groupByData, style);
};

const getGroupbyDisplayLabel = (fields, sqlname) => {
  if (sqlname) {
    let groupby = fields.filter((field) => field.sqlname == sqlname)[0];

    return getDisplayLabel(groupby);
  }
};


// Generate pdf content from records
function recordsToPdfDoc(title, fields, records, data, style) {
  // Groupby
  const groupby = [];
  const groupTables = [];
  if (data && data.rows) {
    data.rows.forEach((row) => {
      groupby.push([{ul: [(row[0] ? row[0] : '<empty>')]}, row[1]]);
      const sub_records = records.filter((record) => {
        let val = record[data.header[0].Content];
        if (val instanceof Object)
          val = val[Object.keys(val)[0]];
        return val == row[0];
      });

      // fields remove the groupby
      const newFields = fields.filter((field) => field.sqlname != data.header[0].Content);
      //const title = (row[0] ? row[0] : '<empty>') + ' (' + row[1] + ')';
      groupTables.push(genTable({title: row[0], records: sub_records, fields: newFields, style}));
    });
  }

  const contents = [
    data ? { text: 'Statistics by ' + getGroupbyDisplayLabel(fields, data.header[0].Content), style: style.header} : '',
    groupby.length > 0 ? {
      table: {
        body: groupby
      },
      layout: 'noBorders'
    } : ''];

  if (data && groupTables.length > 0) {
    contents.push(groupTables);
  } else {
    contents.push(genTable({title, records, fields, style}));
  }

  return contents;
}

const genSummary = (record, fields, style = {column: 2, label: 'fieldLabel', value: 'fieldValue'}) => {
  const columns = style.column;
  //const pdf_header = new Array(columns).fill({});
  const pdf_header = [];
  _.times(columns, () => pdf_header.push({}));
  fields.forEach((field, index) => {
    const column = pdf_header[index % columns];
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
      {text: getDisplayLabel(field), style: style.label},
      {text: getFieldStrVal(record, field, true), style: style.value}
    ]);
  });

  return pdf_header;
};

const getPreviewStyle = (style = null, ignoreMargin = false) => {
  const previewStyle = {};
  if (style) {
    const {bold=false, italics=false, color='#000000', margin=[0, 0, 0, 0], fontSize=16} = style;
    previewStyle.fontWeight = bold ? 'bold' : 'normal';
    previewStyle.fontStyle = italics ? 'italic' : 'normal';
    previewStyle.fontSize = fontSize;
    previewStyle.color = color;

    if (!ignoreMargin) {
      previewStyle.margin = margin.slice(1).join('px ') + 'px ' + margin[0] + 'px';
    }
  }
  return previewStyle;
};

const replacer = (originText, replacer,...func) => {
  if (typeof replacer == 'string' ) {
    replacer = [replacer];
  }

  return func.reduce((current, pre, index) => pre(current, replacer[index]), originText);
};

const replaceText = (originText, replacer, placehoder) => {
  const reg = new RegExp(placehoder, 'gi');
  return originText.replace(reg, replacer);
};

const replaceTitle = (originText, replacer) => replaceText(originText, replacer, GLOBAL_VARIABLES.TITLE);
const replaceTableTitle = (originText, replacer) => replaceText(originText, replacer, GLOBAL_VARIABLES.TABLE_TITLE);
const replaceLinkTitle = (originText, replacer) => replaceText(originText, replacer, GLOBAL_VARIABLES.LINK_TITLE);

const replaceDate = (originText) => replaceText(originText, (new Date()).toLocaleDateString(), GLOBAL_VARIABLES.DATE);

const replaceLogo = (originText, style) => {
  if (originText.indexOf(GLOBAL_VARIABLES.LOGO) > -1) {
    const [leftText = '', rightText = ''] = originText.split(GLOBAL_VARIABLES.LOGO);

    const columns = [];
    if (leftText) {
      columns.push({
        "text": leftText,
        "style": style,
        "alignment": "right"
      });
    }

    columns.push({
      "image": GLOBAL_VARIABLES.LOGO/*,
      "width": 20,
      "height": 20*/
    });

    if (rightText) {
      columns.push({
        "text": rightText,
        "style": style,
        "alignment": "left"
      });
    }

    return {
      alignment: 'left',
      columns: columns
    };
  } else {
    return {
      text: originText,
      style: style
    };
  }
};

const getColumns = (originSource) => {
  return Object.keys(originSource).map(key => {
    const source = originSource[key];
    let text = replaceDate(source.text);
    const logoIndex = text.indexOf(GLOBAL_VARIABLES.LOGO);
    if (key == 'left') {
      text = text + ' ';
    }

    if (key == 'right') {
      text = ' ' + text;
    }

    let newObj;
    if (logoIndex == -1) {
      newObj = Object.assign({}, source, {text});
    } else {
      newObj = replaceLogo(text, source.style);
    }
    newObj.alignment = key;
    return newObj;
  });
};

const translateText = (pdfDefinition, {settings, records, fields_state, body, record, links, param, groupByData}) => {
  const {fields: fields_props = [], label = ''} = body;
  const fieldsName = fields_state.map(field => field.sqlname);

  const content = [];

  content.push(replacer(settings.reportHead.text, [label, null, settings.reportHead.style], replaceTitle, replaceDate, replaceLogo));
  content.push(replacer(settings.reportDesc.text, [label, null, settings.reportDesc.style], replaceTitle, replaceDate, replaceLogo));

  if (records.length > 0) {
    const title = replacer(settings.contents.tableTitle.text, body.label, replaceTableTitle);
    content.push(analyzeRecordList(title, fieldsName, fields_props, records, settings.contents, param, groupByData));
  }

  const promiseList = [];
  if ((links && links.length > 0) || record) {

    const summary = {
      stack: [
        {text: record.self, style: settings.fieldBlock.fieldTitle.style},
        {
          alignment: 'justify',
          columns: genSummary(record, fields_props, settings.fieldBlock)
        }
      ],
      margin: [0, 0, 0, 40]
    };
    content.push(summary);

    links.forEach(link => {
      link.body.param = param;
      promiseList.push(getLinkData(link, content, settings));
    });
  }

  return Promise.all(promiseList).then(() => {
    pdfDefinition.content = content;

    pdfDefinition.header.columns = getColumns(settings.pageHeader);
    pdfDefinition.footer.columns = getColumns(settings.pageFooter);

    pdfDefinition.pageOrientation = settings.pageOrientation;
    pdfDefinition.styles = settings.styles;
    pdfDefinition.images = settings.images;
    return pdfDefinition;
  });
};

const download = ({onBefore, props, getPDFDefinition, onDone}) => {
  onBefore();
  const {body, recordsStart: offset, limit, name = body.label} = props;
  body.param = {offset,limit};

  loadRecordsByBody(body).then((data) => {
    const pdfDefinition = getPDFDefinition(data.entities);
    if (pdfDefinition instanceof Promise) {
      pdfDefinition.then(data => {
        pdfMake.createPdf(data).download(name + '.pdf');
        onDone();
      });
    } else {
      if (pdfDefinition) {
        pdfMake.createPdf(pdfDefinition).download(name + '.pdf');
        onDone();
      }
    }
  });
};

const preview = (pdfDefinition, callBack) => {
  pdfMake.createPdf(pdfDefinition).getDataUrl((outDoc) => {
    const pdfContainer = document.getElementById('pdfContainer');
    if (pdfContainer) {
      const lastPDF = document.getElementById('pdfV');
      if (lastPDF) {
        lastPDF.remove();
      }

      const pdfContent = document.createElement('embed');
      pdfContent.id = 'pdfV';
      pdfContent.width = '100%';
      pdfContent.height = '100%';
      pdfContent.src = outDoc;

      document.getElementById('pdfContainer').appendChild(pdfContent);

      if (typeof callBack == 'function') {
        callBack();
      }
    }
  });
};

export {
  analyzeRecordList,
  getPreviewStyle,
  updateValue,
  translateText,
  download,
  preview,
  getLinkData,
  genSummary
};
