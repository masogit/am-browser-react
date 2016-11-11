/**
 * Created by huling on 11/10/2016.
 */
import {getDisplayLabel, getFieldStrVal } from './RecordFormat';
const MODE = {
  CODE: 'Code',
  DESIGN: 'Design'
};

const init_style = {
  name: '',
  fontSize: 16,
  bold: false,
  margin: [0, 0, 0, 0],
  color: '#000000',
  italics: false
};

const table_style = [
  'noBorders', 'headerLineOnly', 'lightHorizontalLines'
];

const styles = {
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
  text: {
    fontSize: 12
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
    color: '#000000'
  }
};

const defaultPDFDefinition = {
  header: {
    columns: [{
      width: '33%',
      text: 'left'
    }, {
      width: '33%',
      text: 'center',
      alignment: 'center'
    }, {
      width: '33%',
      text: 'right',
      alignment: 'right'
    }]
  },
  pageOrientation: 'portrait', //landscape
  content: [],
  footer: {
    columns: [{
      width: '33%',
      text: 'left'
    }, {
      width: '33%',
      text: 'center',
      alignment: 'center'
    }, {
      width: '33%',
      text: 'Date: @date',
      alignment: 'right'
    }]
  }
};

const analyzeRecordList = (filter, allFields, records, style = {layout: 'headerLineOnly', header: 'tableHeader', text: 'text'}) => {
  let avalableFields = [];
  if (filter.length > 0) {
    allFields.map(field => {
      for (let f of filter) {
        if (field.sqlname.toLowerCase() == f.toLowerCase()) {
          avalableFields.push(field);
          break;
        }
      }
    });
  }

  if (avalableFields.length == 0) {
    avalableFields = allFields;
  }

  const body = [];
  const table = {
    layout: style.layout,
    style: style.style,
    table: {
      headerRows: 1,
      body: body
    }
  };

  body.push(avalableFields.map((field, index) => (
  { text: getDisplayLabel(field), style: style.header }
  )));

  records.map((record) => {
    const row = [];
    avalableFields.map((field, tdindex) => (
      row.push({text: getFieldStrVal(record, field), style: style.text})
    ));
    body.push(row);
  });

  return table;
};

const analyzeTitle = (text, title) => {
  if (text.toLowerCase().includes('@title')) {
    return text.replace(/@title/gi, title);
  }

  return text;
};

const analyzeDate = (text, date) => {
  if (text.toLowerCase().includes('@date')) {
    return text.replace(/@date/gi, date);
  }

  return text;
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

const getPdfLine = (label, {text='', style=''}) => {
  let result = analyzeTitle(text, label);

  const date = (new Date()).toLocaleDateString();
  result = analyzeDate(result, date);
  return {
    text: result, style
  };
};

const setTextLine = (target, source, label) => {
  const textObj = getPdfLine(label, source);
  target.text = textObj.text;
  target.style = textObj.style;
};

const translateText = (pdfDefinition, {settings, records, fields_state, body}) => {
  const {fields: fields_props = [], label = ''} = body;
  const fieldsName = fields_state.filter(field => field.selected).map(field => field.sqlname);

  const content = [];

  content.push(getPdfLine(label, settings.reportHead));
  content.push(getPdfLine(label, settings.reportDesc));
  content.push(analyzeRecordList(fieldsName, fields_props, records, settings.contents));
  pdfDefinition.content = content;

  setTextLine(pdfDefinition.header.columns[0], settings.pageHeader.left, label);
  setTextLine(pdfDefinition.header.columns[1], settings.pageHeader.center, label);
  setTextLine(pdfDefinition.header.columns[2], settings.pageHeader.right, label);

  setTextLine(pdfDefinition.footer.columns[0], settings.pageFooter.left, label);
  setTextLine(pdfDefinition.footer.columns[1], settings.pageFooter.center, label);
  setTextLine(pdfDefinition.footer.columns[2], settings.pageFooter.right, label);

  pdfDefinition.pageOrientation = settings.pageOrientation;
  pdfDefinition.styles = settings.styles;
  return pdfDefinition;
};

export {
  MODE,
  init_style,
  table_style,
  styles,
  defaultPDFDefinition,
  analyzeRecordList,
  getPreviewStyle,
  updateValue,
  translateText
};
