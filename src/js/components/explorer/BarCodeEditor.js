import React, {Component} from 'react';
import {Box, Form, FormField, Header, CheckBox, Icons, Anchor, Menu, RadioButton, NumberInput} from 'grommet';
const {Download, Close, Play: Preview} = Icons.Base;
import {getDisplayLabel, getFieldStrVal} from '../../util/RecordFormat';
import JsBarcode from 'jsbarcode';
import {ExportLayer} from '../commons/PDFWidgets';
import { updateValue, download, preview } from '../../util/pdfGenerator';

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

  const content = [];

  if (availableFields.length > 0) {
    records.map((record, index) => {
      const barCodes = [], body = [];

      if (param.showSelf) {
        body.push([record.self]);
      } else {
        body.push(['']);
      }

      barCodes.push({
        layout: 'headerLineOnly',
        table: {
          widths: ['*'],
          headerRows: 1,
          body: body
        }
      });

      availableFields.map(field => {
        const label = getDisplayLabel(field);
        const textMargin = [0, (param.lineHeight - 12) * 0.3];
        const columns = param.showLabel ? [{
          height: param.lineHeight,
          width: param.labelWidth,
          stack: [{text: label, style: 'text', margin: textMargin}]
        }] : [];

        let text = getFieldStrVal(record, field).toString();
        if (text.indexOf('"') == 0) {
          text = text.substr(1, text.length - 2);
        }

        if (text) {
          try {
            JsBarcode('#canvas', text, param);
            const canvas = document.getElementById('canvas');
            columns.push({
              fit: ['100%', param.lineHeight],
              alignment: 'center',
              image: canvas.toDataURL('image/png')
            });
          } catch (e) {
            columns.push({
              height: param.lineHeight,
              alignment: 'center',
              stack: [{text: e, style: 'text', margin: textMargin}]
            });
          }
        } else {
          columns.push({
            height: param.lineHeight,
            alignment: 'center',
            stack: [{text: label + ' is empty', style: 'text', margin: textMargin}]
          });
        }
        body.push([{columns}]);
      });

      if (index > 0 && param.split) {
        content.push({
          text: '',
          pageBreak: 'after'
        });
      }

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

export default class RecordList extends Component {
  componentWillMount() {
    this.state = {
      fields: this.props.body.fields,
      previewCount: 1,
      format: barcodeType[0].name,
      width: 2,
      labelWidth: 100,
      height: 100,
      lineHeight: 100,
      margin: 10,
      textMargin: 10,
      showLabel: false,
      split: true,
      showSelf: true,
      loading: false,
      recordsStart: 1,
      limit: 100,
      showExportLayer: false
    };
    this._updateValue = this._updateValue.bind(this);
    this._preview = this._preview.bind(this);
    this.dataReady = this.dataReady.bind(this);
  }

  componentDidMount() {
    this._preview();
  }

  dataReady(loading = this.state.loading) {
    if (loading) {
      return false;
    }

    return this.state.fields.filter(field => field.selected).length > 0;
  };

  autoPreview() {
    if (this.dataReady(false)) {
      this.setState({loading: true});
      if (this.previewTimer) {
        clearTimeout(this.previewTimer);
      }

      this.previewTimer = setTimeout(this._preview, 2000);
    }
  }

  _updateValue(event, val = event.target.value) {
    updateValue(event, {val, 
      name: event.target.name, 
      state: this.state, 
      callback: ()=> this.setState(this.state, this.autoPreview)
    });
  }

  renderNumberInput(label, name, min, max, step = 1) {
    //https://gist.github.com/Candy374/80bf411ff286f6785eb80a9098f01c39
    return (
      <FormField label={
          <Box justify='between' direction='row'>
            <span>{label}</span>
          </Box>}>
        <NumberInput className='number-input-label' name={name} type="range" min={min} max={max} step={step} value={this.state[name]} onChange={this._updateValue}/>
        <input name={name} type="range" min={min} max={max} step={step} value={this.state[name]} onChange={this._updateValue}/>
      </FormField>
    );
  }

  renderForm() {
    const {showLabel, split, showSelf, format} = this.state;
    return (
      <Form className='no-border strong-label' >
        <FormField label='Page Setting'>
          <CheckBox checked={showLabel} name='showLabel' value={showLabel} label='Display Field Name'
                    onChange={this._updateValue}/>
          <CheckBox checked={split} name='split' value={split} label='Break Page'
                    onChange={this._updateValue} />
          <CheckBox checked={showSelf} name='showSelf' value={split} label='Display Self'
                    onChange={this._updateValue} />
        </FormField>
        <FormField label='Barcode Type'>
          {barcodeType.map((type, index)=> {
            return (
              <RadioButton key={index} id='format' name='format' label={type.label}
                           checked={type.name == format} onChange={(event) => this._updateValue(event, type.name)}/>);
          })}
        </FormField>
        {this.renderNumberInput('Barcode Thickness', 'width', 1, 4)}
        {this.renderNumberInput('Field Width', 'labelWidth', 20, 200)}
        {this.renderNumberInput('Barcode Height', 'height', 50, 200)}
        {this.renderNumberInput('Line Height', 'lineHeight', 50, 200)}
        {this.renderNumberInput('Barcode Margin', 'margin', 1, 20)}
        {this.renderNumberInput('Text Margin', 'textMargin', 1, 20)}
      </Form>
    );
  }

  _preview() {
    const records = this.props.records.slice(0, this.state.previewCount);
    this.setState({loading: true});
    const dd = recordsToPdfDoc_barcode(this.state.fields, records, this.props.body.label, this.state);
    preview(dd, () => this.setState({loading: false}));
  }

  _download({recordsStart, limit}) {
    const onBefore = () => this.setState({downloading: true});
    const body = this.props.body;
    const props = {recordsStart, limit, body};
    const getPDFDefinition = (data) => recordsToPdfDoc_barcode(this.state.fields, data, body.label, this.state);
    const onDone = () => this.setState({downloading: false});
    download({onBefore, props, getPDFDefinition, onDone});
  }

  renderFields() {
    const fields = this.state.fields;
    let error;
    if (!this.dataReady(false)) {
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
                          this.setState({fields}, this.autoPreview);
                        }}/>
            </Box>
          ))
        }
        </Box>
      </FormField>
    );
  }

  renderExportLayer() {
    const {recordsStart, limit, showExportLayer} = this.state;
    const {total}= this.props;
    if (showExportLayer) {
      const onConfirm = (props) => {
        this._download(props);
        this.setState({showExportLayer: false});
      };

      const onClose = () => this.setState({showExportLayer: false});
      return <ExportLayer onConfirm={onConfirm} onClose={onClose} recordsStart={recordsStart} total={total} limit={limit}/>;
    }
  }

  render() {
    const {records}= this.props;
    if (records.length == 0) {
      return <Box>No Records</Box>;
    }

    const {loading, downloading} = this.state;

    const previewDisabled = !this.dataReady(loading);
    const downloadDisabled = !this.dataReady(downloading);

    return (
      <Box pad='small' flex={true}>
        <Header justify='between'>
          <Box>PDF Generator</Box>
          <Menu direction="row" align="center" responsive={true}>
            <Anchor icon={<Preview/>} disabled={previewDisabled} onClick={previewDisabled ? null : this._preview} label='Preview'/>
            <Anchor icon={<Download />} disabled={downloadDisabled} onClick={downloadDisabled ? null : () => this.setState({showExportLayer: true})} label='Export'/>
          </Menu>
        </Header>
        <Box flex={true} direction='row' pad='none'>
          <Box flex={true} style={{maxWidth: '50vw'}} direction='row'>
            <Form className='no-border strong-label'>
              {this.renderNumberInput('Preview Records', 'previewCount', 1, 5)}
              {this.renderFields()}
            </Form>
            {this.renderForm()}
          </Box>
          <div id='pdfContainer'/>
          {this.renderExportLayer()}
        </Box>
        <canvas id='canvas' style={{display: 'none'}} />
      </Box>
    );
  }
}

