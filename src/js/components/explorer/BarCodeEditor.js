import React, {Component} from 'react';
import {Box, Form, FormField, Header, CheckBox, Icons, Anchor, Menu, RadioButton, Layer,
  Title, Footer, Button, Paragraph, NumberInput}from 'grommet';
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
    this.updateValue = this.updateValue.bind(this);
    this.preview = this.preview.bind(this);
    this.dataReady = this.dataReady.bind(this);
  }

  componentDidMount() {
    this.preview();
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

      this.previewTimer = setTimeout(this.preview, 2000);
    }
  }

  updateValue(event, value) {
    let val = value || event.target.value;
    const name = event.target.name;
    const type = event.target.type;

    if (type == 'range' || type == 'number') {
      val = parseInt(val);
    } else if (type == 'checkbox') {
      val = event.target.checked;
    } else if (type == 'radio') {
      val = value || event.target.typeValue;
    }

    this.state[name] = val;
    this.setState(this.state);
    this.autoPreview();
  }

  renderNumberInput(label, name, min, max, step = 1) {
    //https://gist.github.com/Candy374/80bf411ff286f6785eb80a9098f01c39
    return (
      <FormField label={
          <Box justify='between' direction='row'>
            <span>{label}</span>
          </Box>}>
        <NumberInput className='number-input-label' name={name} type="range" min={min} max={max} step={step} value={this.state[name]} onChange={this.updateValue}/>
        <input name={name} type="range" min={min} max={max} step={step} value={this.state[name]} onChange={this.updateValue}/>
      </FormField>
    );
  }

  renderForm() {
    const {showLabel, split, showSelf, format} = this.state;
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
        <FormField label='Barcode Type'>
          {barcodeType.map((type, index)=> {
            return (
              <RadioButton key={index} id='format' name='format' label={type.label}
                           checked={type.name == format} onChange={(event) => this.updateValue(event, type.name)}/>);
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

  preview(records = this.props.records.slice(0, this.state.previewCount)) {
    this.setState({loading: true});
    const dd = recordsToPdfDoc_barcode(this.state.fields, records, this.props.body.label, this.state);
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
    const {total}= this.props;
    const {recordsStart, limit} = this.state;

    const getRecordNumber = () => {
      if (recordsStart + limit > total) {
        return total - recordsStart;
      } else {
        return limit;
      }
    };

    return (
      <Layer closer={true} onClose={() => this.setState({showExportLayer: false})}>
        <Box flex={true} size='large'>
          <Header><Title>Choose records to export</Title></Header>

          <Form className='no-border strong-label'>
            {this.renderNumberInput('How many records do you want to export?', 'limit', 100, 1000, 100)}
            {this.renderNumberInput('From which record do you want to export?', 'recordsStart', 1, total - 1)}
          </Form>

          <Box pad={{horizontal: 'medium'}}>
            <Paragraph size='small'>{'You have '}<strong>{total}</strong>{' records in total.'}</Paragraph>
            <Paragraph size='small'>{`You will export records `}<strong>{`${recordsStart} ~ ${getRecordNumber() + recordsStart - 1}`}</strong></Paragraph>
          </Box>

          <Footer justify='end' pad={{vertical: 'medium'}}>
            <Button label={`Export ${getRecordNumber()} records`} primary={true} strong={true} onClick={() => {
              this.download();
              this.setState({showExportLayer: false});
            }}/>
          </Footer>
        </Box>
      </Layer>
    );
  }

  render() {
    const {records}= this.props;
    if (records.length == 0) {
      return <Box>No Records</Box>;
    }

    const {loading, downloading, showExportLayer} = this.state;

    const previewDisabled = !this.dataReady(loading);
    const downloadDisabled = !this.dataReady(downloading);

    return (
      <Box pad='small' flex={true}  direction='row'>
        <Box flex={true} style={{maxWidth: '50vw'}} pad={{horizontal: 'medium'}}>
          <Header justify='between'>
            <Box>PDF Generator</Box>
            <Menu direction="row" align="center" responsive={true}>
              <Anchor icon={<Preview/>} disabled={previewDisabled} onClick={previewDisabled ? null : () => this.preview()} label='Preview'/>
              <Anchor icon={<Download />} disabled={downloadDisabled} onClick={downloadDisabled ? null : () => this.setState({showExportLayer: true})} label='Export'/>
              <Anchor label='Back' icon={<Close/>} onClick={() => this.props.back()}/>
            </Menu>
          </Header>
          <Box direction='row' justify='center'>
            <Form className='no-border strong-label'>
              {this.renderNumberInput('Preview Records', 'previewCount', 1, 5)}
              {this.renderFields()}
            </Form>
            {this.renderForm()}
          </Box>
        </Box>
        <div style={{width: '50vw'}} id='pdfContainer'/>
        <canvas id='canvas' style={{display: 'none'}} />
        {showExportLayer && this.renderExportLayer()}
      </Box>
    );
  }
}

