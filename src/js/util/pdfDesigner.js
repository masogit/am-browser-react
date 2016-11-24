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

  return [{
    text: `${title} (${records.length})`, style: style.tableTitle.style
  }, {
    style: style.style,
    table: {
      headerRows: 1,
      body: body
    },
    layout: style.layout
  }];
};

const analyzeRecordList = (title, filter, allFields, records, style) => {
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

  return genTable({title, records, fields: availableFields, style});
};

function getLinkData(link, pdf_link = [], style = {tableHeader: 'tableHeader', contents: {tableTitle: {style: 'tableTitle'}},fieldBlock: {fieldTitle: {style: 'fieldTitle', text: ''}}}) {
  const title = style.contents.tableTitle.text ? replaceTableTitle(style.contents.tableTitle.text, link.label) : link.label;

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
            {text: style.fieldBlock.fieldTitle.text ? replaceLinkTitle(style.fieldBlock.fieldTitle.text, record.self) : record.self, style: style.fieldBlock.fieldTitle.style},
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
}

function genSummary(record, fields, style = {column: 2, label: 'fieldLabel', value: 'fieldValue'}) {
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
}

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

const replaceText = (originText, replacer, placehoder) => {
  const reg = new RegExp(placehoder, 'gi');
  return originText.replace(reg, replacer);
};

const replaceTitle = (originText, replacer) => replaceText(originText, replacer, GLOBAL_VARIABLES.TITLE);
const replaceTableTitle = (originText, replacer) => replaceText(originText, replacer, GLOBAL_VARIABLES.TABLE_TITLE);
const replaceLinkTitle = (originText, replacer) => replaceText(originText, replacer, GLOBAL_VARIABLES.LINK_TITLE);

const replaceDate = (originText) => replaceText(originText, (new Date()).toLocaleDateString(), GLOBAL_VARIABLES.DATE);

const replaceLogo = (originText, style) => {
  const [leftText, rightText] = originText.split(GLOBAL_VARIABLES.LOGO);

  return {
    alignment: 'justify',
    columns: [{
      "text": leftText,
      "style": style,
      "alignment": "right"
    }, {
      "image": GLOBAL_VARIABLES.LOGO,
      "width": 20,
      "height": 20
    }, {
      "text": rightText,
      "style": style,
      "alignment": "left"
    }]
  };
};

const getColumns = (originSource) => {
  return Object.keys(originSource).map(key => {
    const source = originSource[key];
    const text = replaceDate(source.text);
    const logoIndex = text.indexOf(GLOBAL_VARIABLES.LOGO);
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

const translateText = (pdfDefinition, {settings, records, fields_state, body, record, links, param}) => {
  const {fields: fields_props = []} = body;
  const fieldsName = fields_state.map(field => field.sqlname);

  const content = [];

  //content.push(replaceLogo(replaceTitle(settings.reportHead.text, label), settings.reportHead.style));
  //content.push(replaceLogo(replaceTitle(settings.reportDesc.text, label), settings.reportDesc.style));

  if (records.length > 0) {
    content.push(analyzeRecordList(replaceTableTitle(settings.contents.tableTitle.text, body.label), fieldsName, fields_props, records, settings.contents));
  }

  const promiseList = [];
  if (links && links.length > 0) {

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
