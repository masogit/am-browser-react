import React, {Component} from 'react';
import {Box, Header, Icons, Anchor, Menu, FormField} from 'grommet';
const {Download, Close, Play: Preview, Code} = Icons.Base;
import {getDisplayLabel, getFieldStrVal} from '../../util/RecordFormat';
import * as ExplorerActions from '../../actions/explorer';
import '../../../scripts/pdfmake.min';
import '../../../scripts/vfs_fonts';
import { cloneDeep } from 'lodash';
const defaultPDFDefinition = {
  header: { text: '@Title', margin: [15, 5, 0, 0] },
  pageOrientation: 'portrait', //landscape
  content: ['@content'],
  footer: {
    columns: [
      { text: '@date', alignment: 'right', margin: [0, 0, 15, 0] }
    ]
  },
  styles: {
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
      color: 'black'
    }
  }
};

const analyzeRecordList = (filter, allFields, records) => {
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
  const content = [{
    layout: 'headerLineOnly',
    table: {
      headerRows: 1,
      body: body
    }
  }];

  body.push(avalableFields.map((field, index) => (
    { text: getDisplayLabel(field), style: 'tableHeader' }
  )));

  records.map((record, index) => {
    const row = [];
    avalableFields.map((field, tdindex) => (
      row.push(getFieldStrVal(record, field))
    ));
    body.push(row);
  });


  const pdfDefinition = cloneDeep(pdfobj);
  pdfDefinition.content = content;
  return pdfDefinition;
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

export default class RecordList extends Component {
  componentWillMount() {
    this.state = {
      pdfDefinition: defaultPDFDefinition,
      mode: 'Code',
      fields: [],
      records: []
    };
    this.updateValue = this.updateValue.bind(this);
    this.preview = this.preview.bind(this);
    this.dataReady = this.dataReady.bind(this);
  }

  componentDidMount() {
    this.preview();
    ExplorerActions.loadRecordsByBody(this.props.body).then((data) => {
      this.setState({ records: data.entities });
    });
  }

  dataReady(loading = this.state.loading) {
    return true;
    if (loading) {
      return false;
    }

    //return this.state.fields.filter(field => field.selected).length > 0;
  };

  autoPreview() {
    if (this.dataReady(false)) {
      this.setState({ loading: true });
      if (this.previewTimer) {
        clearTimeout(this.previewTimer);
      }
      this.previewTimer = setTimeout(this.preview, 2000);
    }
  }

  updateValue(event, value) {
    let val = value || event.target.value;
    const name = event.target.name;

    let error = '', obj;
    try {
      obj = JSON.parse(val);
    } catch (e) {
      error = e.message;
      obj = val;
    }

    this.state.error = error;
    this.state[name] = obj;
    this.setState(this.state);
    this.autoPreview();
  }

  preview(pdfDefinition = this.state.pdfDefinition) {
    pdfDefinition = analyzeRecordList(this.state.pdfDefinition, this.props.body.fields, this.state.records);
    const date = (new Date()).toLocaleDateString();
    if (pdfDefinition.header) {
      pdfDefinition.header.text = analyzeTitle(pdfDefinition.header.text, this.props.body.label);
      pdfDefinition.header.text = analyzeDate(pdfDefinition.header.text, date);
    }

    if (pdfDefinition.footer) {
      pdfDefinition.footer.columns[0].text = analyzeDate(pdfDefinition.footer.columns[0].text, date);
    }

    if (pdfDefinition) {
      pdfMake.createPdf(cloneDeep(pdfDefinition)).getDataUrl((outDoc) => {
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

        this.setState({ loading: false });
      });
    }
  }

  download(name = this.state.headLabel) {
    this.setState({ downloading: true });
    const body = this.props.body;

    body.param = {
      offset: this.state.recordsStart - 1,
      limit: this.state.limit
    };
    ExplorerActions.loadRecordsByBody(body).then((data) => {
      const dd = recordsToPdfDoc_barcode(this.state.fields, data.entities, name, this.state);
      if (dd) {
        pdfMake.createPdf(dd).download(name + '.pdf');
        this.setState({ downloading: false });
      }
    });
  }

  format(pdfDefinition) {
    if (typeof pdfDefinition == 'string') {
      return pdfDefinition;
    }
    const text = JSON.stringify(pdfDefinition);
    let spliters = 0, result = '', inArray = false, splitted = false;
    for (let char of text) {
      result += char;
      if (char == '[') {
        inArray = true;
      } else if (char == ']') {
        inArray = false;
      }
      if (splitted) {
        splitted = false;
        continue;
      }

      if (char == '{') {
        result += '\n' + '\t'.repeat(++spliters);
        if (inArray) {
          inArray = false;
        }
        splitted = true;
      } else if (char == '}') {
        result = result.slice(0, -1);
        result += '\n' + '\t'.repeat(spliters--);
        result += char;
      } else if (char == ',' && !inArray) {
        result += '\n' + '\t'.repeat(spliters);
        splitted = true;
      }
    }

    return result;
  }

  render() {
    const {mode, pdfDefinition, error} = this.state;
    return (
      <Box pad='small' flex={true}>
        <Header justify='between' size='small'>
          <Box>PDF Generator</Box>
          <Menu direction="row" align="center" responsive={true}>
            <Anchor icon={<Code/>} onClick={() => this.setState({ mode: mode == 'Code' ? 'Form' : 'Code' })} label={mode}/>
            <Anchor icon={<Preview/>} onClick={this.preview} label='Preview'/>
            <Anchor icon={<Download />} onClick={() => this.setState({ showExportLayer: true })} label='Export'/>
            <Anchor label='Back' icon={<Close/>} onClick={() => this.props.back()}/>
          </Menu>
        </Header>
        <Box flex={true} direction='row'>
          <FormField  error={error} className='code-panel'>
            <textarea name='pdfDefinition' value={this.format(pdfDefinition)}
                      onChange={this.updateValue} />
          </FormField>
          <div style={{ width: '50vw' }} id='pdfContainer' />
        </Box>
      </Box>
    );
  }
}

