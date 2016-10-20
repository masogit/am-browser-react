import React, {Component} from 'react';
import {Box, Form, FormField, Header, CheckBox, Icons, Anchor, Menu, NumberInput, RadioButton }from 'grommet';
const {Download, Close, Play: Preview} = Icons.Base;
import {getDisplayLabel, getFieldStrVal} from '../../util/RecordFormat';
import JsBarcode from 'jsbarcode';
import * as ExplorerActions from '../../actions/explorer';
import '../../../scripts/pdfmake.min';
import '../../../scripts/vfs_fonts';

const barcodeType = [{
  name: 'CODE128',
  label: 'CODE128',
  type: 'string',
  checked: true
}, {
  name: 'CODE39',
  label: 'CODE39',
  type: 'string'
}/*, {
  name: 'EAN2',
  label: 'EAN',
  type: 'number'
}, {
  name: 'UPC',
  label: 'UPC',
  type: 'number'
}, {
  name: 'ITF14',
  label: 'ITF-14',
  type: 'number'
}, {
  name: 'pharmacode',
  label: 'Pharmacode',
  type: 'number'
}, {
  name: 'codabar',
  label: 'Codabar',
  type: 'number'
}, {
  name: 'MSI',
  label: 'MSI',
  type: 'number'
}*/];


const recordsToPdfDoc_barcode = (fields, records, reportLabel, param) => {
  const availableFields = fields.filter(field => field.selected);

  const content = [];

  if (availableFields.length > 0) {
    records.map((record, index) => {
      const barCodes = [];

      if (index > 0 && param.split) {
        barCodes.push({
          text: '',
          pageBreak: 'before'
        });
      }

      if (param.showSelf) {
        barCodes.push({
          layout: 'lightHorizontalLines',
          table: {
            widths: ['*'],
            headerRows: 1,
            body: [
              [record.self],
              ['']
            ]
          }
        });
      }

      availableFields.map(field => {
        let text = getFieldStrVal(record, field).toString();
        if (text.indexOf('"') == 0) {
          text = text.substr(1, text.length - 2);
        }

        text = text || 'No Data';
        JsBarcode('#canvas', text, param);
        const canvas = document.getElementById('canvas');

        const columns = param.showLabel ? [{
          width: 100,
          height: param.lineHeight,
          stack: [{text: getDisplayLabel(field), style: 'text', margin: [0, (param.lineHeight - 12) * 0.3]}]
        }] : [];

        columns.push({
          fit: ['100%',param.lineHeight],
          alignment: 'center',
          image: canvas.toDataURL('image/png')
        });

        barCodes.push({columns});

      });
      content.push(barCodes);
    });
  }

  const date = (new Date()).toDateString();
  return {
    header: {text: reportLabel, margin: [15, 5, 0, 0]},
    pageOrientation: 'portrait',
    content: content,
    footer: {
      columns: [
        { text: date, alignment: 'right', margin: [0, 0, 15, 0] }
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
};

const dataReady = ({records, fields, defaultValue}) => {
  let ready = defaultValue || true;
  if (records) {
    ready = records.filter(record => record.selected).length > 0;
  }
  if (fields) {
    ready = ready && fields.filter(field => field.selected).length > 0;
  }
  return ready;
};

export default class RecordList extends Component {
  componentWillMount() {
    const records = this.props.records.slice(0, 5);
    records[0].selected = true;
    this.state = {
      fields: this.props.body.fields,
      records: records,
      format: barcodeType[0].name,
      width: 2,
      height: 100,
      lineHeight: 100,
      margin: 10,
      textMargin: 10,
      showLabel: false,
      split: true,
      showSelf: true,
      loading: false,
      recordsStart: 1,
      limit: 100
    };
    this.updateValue = this.updateValue.bind(this);
  }

  componentDidMount() {
    this.preview();
  }

  updateValue(event, value) {
    let val = value || event.target.value;
    const name = event.target.name;
    const type = event.target.type;

    if (type == 'range') {
      val = parseInt(val);
    } else if (type == 'checkbox') {
      val = event.target.checked;
    } else if (type == 'select-one') {
      val = barcodeType[event.target.selectedIndex].name;
      this.state.supportType = barcodeType[event.target.selectedIndex].type;
    }

    this.state[name] = val;
    this.setState(this.state);
  }

  renderNumberInput(label, name, min, max, displayValue, step = 1) {
    //https://gist.github.com/Candy374/80bf411ff286f6785eb80a9098f01c39
    return (
      <FormField label={
          <Box justify='between' direction='row'>
            <span>{label}</span>
            {displayValue || this.state[name]}
          </Box>}>
        <input name={name} type="range" min={min} max={max} step={step} value={this.state[name]} onChange={this.updateValue}/>
      </FormField>
    );
  }

  renderForm() {
    const {showLabel, split, showSelf, limit, recordsStart} = this.state;
    const total = this.props.total;
    return (
      <Form className='no-border strong-label' >
        <FormField label='Page Setting'>
          <CheckBox checked={showLabel} name='showLabel' value={showLabel} label='Display Field Name'
                    onChange={this.updateValue}/>
          <CheckBox checked={split} name='split' value={split} label='Break Page'
                    onChange={this.updateValue} />
          <CheckBox checked={showSelf} name='showSelf' value={split} label='Display Self'
                    onChange={this.updateValue} />
        </FormField>
        <FormField label='Bar Code Type'>
          {barcodeType.map((type, index)=> {
            return (
              <RadioButton key={index} id='format' name='format' value={type.name}
                           label={type.label} checked={type.checked} onChange={this.updateValue}/>);
          })}
        </FormField>
        {this.renderNumberInput('Bar Code Thickness', 'width', 1, 4)}
        {this.renderNumberInput('Bar Code Height', 'height', 50, 200)}
        {this.renderNumberInput('Line Height', 'lineHeight', 50, 200)}
        {this.renderNumberInput('Bar Code Margin', 'margin', 1, 20)}
        {this.renderNumberInput('Text Margin', 'textMargin', 1, 20)}
        {this.renderNumberInput('Download Records From', 'recordsStart', 1, total, `${recordsStart}/${total}`)}
        {this.renderNumberInput('Records Limit', 'limit', 100, 1000, limit, 100)}
      </Form>
    );
  }

  preview(records = this.state.records) {
    this.setState({loading: true});
    this.print(records);
  }

  print(records) {
    const availableRecords = records.filter(record => record.selected);
    const dd = recordsToPdfDoc_barcode(this.state.fields, availableRecords, this.props.body.label, this.state);
    if (dd) {
      pdfMake.createPdf(dd).getDataUrl((outDoc) => {
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

        this.setState({loading: false});
      });
    }
  }

  download(name = this.props.body.label) {
    this.setState({downloading: true});
    const body = this.props.body;

    body.param = {
      offset: this.state.recordsStart - 1,
      limit: this.state.limit
    };
    ExplorerActions.loadRecordsByBody(body).then((data) => {
      const dd = recordsToPdfDoc_barcode(this.state.fields, data.entities, name, this.state);
      if (dd) {
        pdfMake.createPdf(dd).download(name + '.pdf');
        this.setState({downloading: false});
      }
    });
  }

  renderFields() {
    const fields = this.state.fields;
    let error;
    if (!dataReady({fields})) {
      error = 'No Field Selected';
    }

    return (
      <FormField label="Choose Fields" error={error}>
        <Box pad={{horizontal: 'medium'}}>{
          fields.map((field, index) => (
            <Box margin={{top: 'small'}} key={index}>
              <CheckBox checked={!!field.selected} label={getDisplayLabel(field)}
                        onChange={() => {
                          field.selected = !field.selected;
                          this.setState({fields: fields});
                        }}/>
            </Box>
          ))
        }
        </Box>
      </FormField>
    );
  }

  renderRecordChooser() {
    const records = this.state.records;
    let error;
    if (!dataReady({records})) {
      error = 'No Record Selected';
    }

    return (
        <FormField label='Choose Preview Records' error={error}>
          <Box pad={{horizontal: 'medium', vertical: 'small'}} direction='row'>{
            records.map((record, index) => {
              return (
                <CheckBox key={index} checked={!!record.selected} label={index + 1}
                        onChange={(event) => {
                          event.stopPropagation();
                          record.selected = !record.selected;
                          this.setState({records: records});
                        }
                        }/>
              );
            })}
          </Box>
        </FormField>
    );
  }

  render() {
    const records = this.props.records;
    if (records.length == 0) {
      return <Box>No Records</Box>;
    }

    const {records: stateRecords, fields, loading, downloading} = this.state;

    const previewDisabled = !dataReady({records: stateRecords, fields, defaultValue: loading});
    const downloadDisabled = !dataReady({records: stateRecords, fields, defaultValue: downloading});

    return (
      <Box pad='small' flex={true}  direction='row'>
        <Box flex={true} style={{maxWidth: '50vw'}} pad={{horizontal: 'medium'}}>
          <Header justify='between'>
            <Box>PDF Generator</Box>
            <Menu direction="row" align="center" responsive={true}>
              <Anchor icon={<Preview/>} disabled={previewDisabled} onClick={previewDisabled ? null : () => this.preview()} label='Preview'/>
              <Anchor icon={<Download />} disabled={downloadDisabled} onClick={downloadDisabled ? null : () => this.download()} label='Download'/>
              <Anchor label='Back' icon={<Close/>} onClick={() => this.props.back()}/>
            </Menu>
          </Header>
          <Box direction='row' justify='center'>
            <Form className='no-border strong-label'>
              {this.renderRecordChooser()}
              {this.renderFields()}
            </Form>
            {this.renderForm()}
          </Box>
        </Box>
        <div style={{width: '50vw'}} id='pdfContainer'/>
        <canvas id='canvas' style={{display: 'none'}} />
      </Box>
    );
  }
}

