import React, {Component} from 'react';
import {Box, Form, FormField, Header, CheckBox, Icons, Anchor, Menu, NumberInput}from 'grommet';
const {Download, Close, Spinning} = Icons.Base;
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
        let text = getFieldStrVal(record, field);
        if (text.indexOf('"') == 0) {
          text = text.substr(1, text.length - 2);
        }
        if (text) {
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
        }
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
    const records = this.props.records.slice(0, 10);
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
      activeIndex: 0
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
    this.preview();
  }

  renderForm() {
    const {hideLabel, split, width, height, margin, textMargin, format} = this.state;
    return (
      <Form>
        <FormField  label='Hide Field Name'>
          <CheckBox checked={hideLabel} name='hideLabel' value={hideLabel}
                    onChange={this.updateValue} toggle={true}/>
        </FormField>
        <FormField label='Break Page for each record'>
          <CheckBox checked={split} name='split' value={split}
                    onChange={this.updateValue} toggle={true}/>
        </FormField>
        <FormField label='Bar Code Type'>
          <select value={format} name='format' onChange={this.updateValue}>
            {barcodeType.map((type, index)=> {
              return (<option key={index}>{type.label}</option>);
            })}
          </select>
        </FormField>
        <FormField label='Width'>
          <NumberInput name='width' type="range" value={width} onChange={this.updateValue}/>
        </FormField>
        <FormField label={<Box justify='between' direction='row'><span>Height</span>{height}</Box>}>
          <input name='height' type="range" min={50} max={200} value={height} onChange={this.updateValue}/>
        </FormField>
        <FormField label={<Box justify='between' direction='row'><span>Margin</span>{margin}</Box>}>
          <input name='margin' type="range" min={1} max={20} value={margin} onChange={this.updateValue}/>
        </FormField>
        <FormField label={<Box justify='between' direction='row'><span>Text Margin</span>{textMargin}</Box>}>
          <input name='textMargin' type="range" min={1} max={20} value={textMargin} onChange={this.updateValue}/>
        </FormField>
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
        document.getElementById('pdfV').src = outDoc;
        this.setState({loading: false});
      });
    }
  }

  download(name = this.props.body.label) {
    this.setState({downloading: true});
    const body = this.props.body;

    body.param = {
      offset: 0,
      limit: 1000
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
    return this.state.fields.map((field, index) => (
        <Box pad={{vertical: 'small'}}>
          <CheckBox checked={field.selected} key={index}
                  label={getDisplayLabel(field)}
                  onChange={() => {
                    field.selected = !field.selected;
                    this.setState({fields: this.state.fields}, this.preview);
                  }}/>
        </Box>
      )
    );
  }

  renderRecordChooser() {
    return (
      <Box className='grommetux-form' style={{width: '100%'}}>
        <FormField label='Choose preview data'>
          <Box pad={{horizontal: 'medium', vertical: 'small'}} direction='row'>
        {
          this.state.records.map((record, index) => {
            return (
              <CheckBox key={index} checked={record.selected} label={index + 1}
                      onClick={(event) => {
                        event.stopPropagation();
                        record.selected = !record.selected;
                        this.setState({records: this.state.records});
                        this.preview();
                      }
                      }/>
            );
          })}
            </Box>
        </FormField>
      </Box>
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
              <Anchor icon={this.state.downloading ? <Spinning/> : <Download />} onClick={() => this.download()} label={`Download (${this.props.total})`}/>
              <Anchor label='Back' icon={<Close/>} onClick={() => this.props.back()}/>
            </Menu>
          </Header>
          <Box direction='row' justify='center'>
            <Form>
              <FormField label="Choose Field">
                <Box pad={{horizontal: 'medium'}} style={{height: '512px'}} className='autoScroll'>
                  {this.renderFields()}
                </Box>
              </FormField>
            </Form>
            {this.renderForm()}
          </Box>
          {this.renderRecordChooser()}
          {this.state.loading && <Spinning/>}
        </Box>
        <Box style={{width: '50vw'}}>
          <iframe id='pdfV' style={{height: '100%'}} title={'PDF Preview for ' + this.props.body.label} />
        </Box>
        <canvas id='canvas' style={{display: 'none'}} />
      </Box>
    );
  }
}

