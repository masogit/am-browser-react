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
  type: 'string'
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

  const content = [
    {text: 'Bar Codes for: ' + reportLabel, style: 'header'}
  ];

  if (availableFields.length > 0) {
    records.map((record, index) => {
      const barCodes = [];
      if (index > 0 && param.split) {
        barCodes.push({
          text: '',
          pageBreak: 'after'
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

        const columns = param.hideLabel ? [] : [{
          width: 100,
          height: 100,
          stack: [{text: getDisplayLabel(field),  margin: [0, 30]}]
        }];

        columns.push({
          height: 100,
          image: canvas.toDataURL('image/png')
        });

        barCodes.push({columns});

      });
      content.push(barCodes);
    });
  }

  const date = (new Date()).toDateString();
  return {
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
      margin: 10,
      textMargin: 10,
      hideLabel: false,
      split: true,
      loading: false,
      recordsStart: 1,
      recordsEnd: this.props.total > 1000 ? 1000 : this.props.total
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

  renderNumberInput(label, name, min, max) {
    //https://gist.github.com/Candy374/80bf411ff286f6785eb80a9098f01c39
    return (
      <FormField label={
          <Box justify='between' direction='row'>
            <span>{label}</span>
            {this.state[name]}
          </Box>}>
        <input name={name} type="range" min={min} max={max} value={this.state[name]} onChange={this.updateValue}/>
      </FormField>
    );
  }

  renderForm() {
    const {hideLabel, split, width, recordsStart} = this.state;
    return (
      <Form className='no-border strong-label'>
        <FormField  label='Hide Field Name'>
          <CheckBox checked={hideLabel} name='hideLabel' value={hideLabel}
                    onChange={this.updateValue} toggle={true}/>
        </FormField>
        <FormField label='Break Page for each record'>
          <CheckBox checked={split} name='split' value={split}
                    onChange={this.updateValue} toggle={true}/>
        </FormField>
        <FormField label='Bar Code Type'>
          {barcodeType.map((type, index)=> {
            return (
              <RadioButton key={index} id='format' name='format' value={type.name}
                           label={type.label} checked={type.checked} onChange={this.updateValue}/>);
          })}
        </FormField>
        <FormField label='Bar Code Width'>
          <NumberInput name='width' type="range" value={width} onChange={this.updateValue}/>
        </FormField>
        {this.renderNumberInput('Height', 'height', 50, 200)}
        {this.renderNumberInput('Margin', 'margin', 1, 20)}
        {this.renderNumberInput('Text Margin', 'textMargin', 1, 20)}
        {this.renderNumberInput('Print Records From', 'recordsStart', 1, this.props.total)}
        {this.renderNumberInput('Print Records To', 'recordsEnd', recordsStart, this.props.total)}
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
      limit: this.state.recordsEnd - this.state.recordsStart + 1
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
    if (fields.filter(field => field.selected).length == 0) {
      error = 'No field selected';
    }
    return (
      <FormField label="Choose Field" error={error}>
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
    if (records.filter(record => record.selected).length == 0) {
      error = 'No Record selected';
    }
    return (
        <FormField label='Choose Preview Data' error={error}>
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

    return (
      <Box pad='small' flex={true}  direction='row'>
        <Box flex={true} style={{maxWidth: '50vw'}} pad={{horizontal: 'medium'}}>
          <Header justify='between'>
            <Box>PDF Generator</Box>
            <Menu direction="row" align="center">
              <Anchor icon={<Preview/>} disabled={this.state.loading} onClick={this.state.loading ? null : () => this.preview()} label='Preview'/>
              <Anchor icon={<Download />} disabled={this.state.downloading} onClick={this.state.downloading ? null : () => this.download()} label='Download'/>
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

