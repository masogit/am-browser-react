import React, {Component} from 'react';
import {Box, Header, Icons, Anchor, Menu, FormField, Form, CheckBox,
  RadioButton, Layer, Title, Button, Footer, NumberInput} from 'grommet';
const {Download, Close, Play: Preview, Code, Add} = Icons.Base;
import {getDisplayLabel, getFieldStrVal} from '../../util/RecordFormat';
import * as ExplorerActions from '../../actions/explorer';
import { cloneDeep } from 'lodash';

const MODE = {
  CODE: 'code',
  DESIGN: 'design'
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

  records.map((record, index) => {
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

const getPreviewStyle = (styleObj, ignoreMargin) => {
  const previewStyle = {};
  if (styleObj.bold) {
    previewStyle.fontWeight = 'bold';
  }
  if (styleObj.italics) {
    previewStyle.fontStyle = 'italic';
  }
  if (styleObj.fontSize) {
    previewStyle.fontSize = styleObj.fontSize;
  }
  if (styleObj.color) {
    previewStyle.color = styleObj.color;
  }
  if (styleObj.margin && !ignoreMargin) {
    previewStyle.margin = styleObj.margin.slice(1).join('px ') + 'px ' + styleObj.margin[0] + 'px';
    previewStyle.border = '1px dashed';
  }
  return previewStyle;
};

class MarginDesigner extends Component {
  componentWillMount() {
    this.updateValue = this.updateValue.bind(this);
  }

  updateValue(event) {
    const value = [parseInt(this.left.value), parseInt(this.top.value), parseInt(this.right.value), parseInt(this.bottom.value)];
    this.props.updateValue(event, value, 'margin', 'text');
  }

  renderInput(refName, value) {
    return (<input type='number' ref={node=> this[refName] = node} min={0} max={64} value={value} onChange={this.updateValue}/>);
  }

  render() {
    const {styleObj, updateValue} = this.props;
    const {name, margin: [left, top, right, bottom]} = styleObj;
    const inputStyle = getPreviewStyle(styleObj);
    if (!name) {
      inputStyle.borderColor = '#ff0000';
    }

    return (
      <Box className='margin-designer' pad={{horizontal: 'medium'}}>
        <Box colorIndex='light-2'>
          <Box align='center' justify='center' >
            {this.renderInput('top', top)}
          </Box>
          <Box direction='row' justify='center' align='center'>
            {this.renderInput('left', left)}
            <Box separator='all'>
              <input name='name' type="text" value={name} onChange={updateValue} style={inputStyle} autoFocus={true}/>
            </Box>
            {this.renderInput('right', right)}
          </Box>
          <Box align='center' justify='center'>
            {this.renderInput('bottom', bottom)}
          </Box>
        </Box>
      </Box>
    );
  }
}

class StyleDesigner extends Component {
  componentWillMount() {
    const styleObj = this.props.styleObj;
    this.state = Object.assign({}, init_style, styleObj);
    this.title = (styleObj.name ? 'Edit' : 'Add') + ' style';
    this.updateValue = this.updateValue.bind(this);
  }

  updateValue(event, val = event.target.value, name = event.target.name, type = event.target.type) {
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
      }, this.state);
    } else {
      this.state[name] = val;
    }

    this.setState(this.state);
  }

  renderNumberInput(label, name, min, max, step = 1) {
    let value = this.state[name];

    //https://gist.github.com/Candy374/80bf411ff286f6785eb80a9098f01c39
    return (
      <FormField label={
          <Box justify='between' direction='row'>
            <span>{label}</span>
          </Box>}>
        <NumberInput className='number-input-label' name={name} type="range" min={min} max={max} step={step} value={value} onChange={this.updateValue}/>
        <input name={name} type="range" min={min} max={max} step={step} value={value} onChange={this.updateValue}/>
      </FormField>
    );
  }

  render() {
    const {onConfirm, onCancel} = this.props;
    const styleObj = this.state;

    return (
      <Box flex={true}>
        <Header><Title>{this.title}</Title></Header>
        <Form className='no-border strong-label style-designer'>
          <FormField label='Name'>
            <MarginDesigner styleObj={styleObj} updateValue={this.updateValue}/>
          </FormField>
          <FormField>
            <Box direction='row' align='center' justify='between' pad='medium'>
              <label>Color:<input type='color' name='color' value={styleObj.color} onChange={this.updateValue}/></label>
              <CheckBox checked={styleObj.bold} name='bold'
                        value={styleObj.bold} label='Bold'
                        onChange={this.updateValue}/>
              <CheckBox checked={styleObj.italics} name='italics'
                        value={styleObj.italics} label='Italics'
                        onChange={this.updateValue}/>
            </Box>
          </FormField>
          {this.renderNumberInput('Font Size', 'fontSize', 10, 64)}
        </Form>

        <Footer justify='end' pad='large'>
          <Button label="Confirm" primary={true} strong={true} onClick={styleObj.name ? () => onConfirm(styleObj) : null}/>
          <Box pad={{horizontal: 'small'}}/>
          <Button label="Cancel" primary={true} strong={true} onClick={onCancel}/>
        </Footer>
      </Box>
    );
  }
}

export default class RecordList extends Component {
  componentWillMount() {
    this.state = {
      pdfDefinition: defaultPDFDefinition,
      mode: MODE.DESIGN,
      fields: this.props.body.fields,
      records: [],
      pdfSettings: {
        styles: _.cloneDeep(styles),
        pageOrientation: 'portrait',
        pageHeader: {
          left: {text: 'Generated by AMB', style: 'text'},
          center: {text: '', style: 'text'},
          right: {text: '', style: 'text'}
        },
        contents: {
          style: 'tableExample',
          layout: 'headerLineOnly',
          header: 'tableHeader',
          text: 'text'
        },
        reportDesc: {
          text: '',
          style: 'subheader'
        },
        pageFooter: {
          left: {text: '', style: 'text'},
          center: {text: '', style: 'text'},
          right: {text:'Date: @date', style: 'text'}
        },
        reportHead:  {
          text: '@title',
          style: 'header'
        }
      },
      new_style: {},
      showLayer: null
    };
    this.updatePDFSettings = this.updatePDFSettings.bind(this);
    this.updateCode = this.updateCode.bind(this);
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

  updateCode(event, val = event.target.value) {
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
    this.setState(this.state, this.autoPreview);
  }

  updatePDFSettings(event, val = event.target.value, name = event.target.name) {
    if (name.indexOf('.') > -1) {
      const nameParts = name.split('.');
      nameParts.reduce((pdfSettings, key, index) => {
        if (index == nameParts.length - 1) {
          if (event.target.type == 'textarea') {
            try {
              pdfSettings[key] = JSON.parse('{' + val + '}');
            } catch (e) {
              pdfSettings[key].error = e.message;
              pdfSettings[key] = val;
            }
          } else {
            pdfSettings[key] = val;
          }
        }
        return pdfSettings[key];
      }, this.state.pdfSettings);
    } else {
      this.state.pdfSettings[name] = val;
    }

    this.setState(this.state, this.autoPreview);
  }

  getPdfLine({text='', style=''}) {
    let result = analyzeTitle(text, this.props.body.label);

    const date = (new Date()).toLocaleDateString();
    result = analyzeDate(result, date);
    return {
      text: result, style
    };
  }

  setTextLine(target, source) {
    const textObj = this.getPdfLine(source);
    target.text = textObj.text;
    target.style = textObj.style;
  }

  translateText(pdfDefinition) {
    const settings = this.state.pdfSettings;
    const fieldsName = this.state.fields.filter(field => field.selected).map(field => field.sqlname);

    const content = [];

    content.push(this.getPdfLine(settings.reportHead));
    content.push(this.getPdfLine(settings.reportDesc));
    content.push(analyzeRecordList(fieldsName, this.props.body.fields, this.state.records, settings.contents));
    pdfDefinition.content = content;

    this.setTextLine(pdfDefinition.header.columns[0], settings.pageHeader.left);
    this.setTextLine(pdfDefinition.header.columns[1], settings.pageHeader.center);
    this.setTextLine(pdfDefinition.header.columns[2], settings.pageHeader.right);

    this.setTextLine(pdfDefinition.footer.columns[0], settings.pageFooter.left);
    this.setTextLine(pdfDefinition.footer.columns[1], settings.pageFooter.center);
    this.setTextLine(pdfDefinition.footer.columns[2], settings.pageFooter.right);

    pdfDefinition.pageOrientation = settings.pageOrientation;
    pdfDefinition.styles = settings.styles;
    return pdfDefinition;
  }

  preview() {
    let pdfDefinition = this.state.pdfDefinition;
    if (this.state.mode != MODE.CODE) {
      pdfDefinition = this.translateText(pdfDefinition);
    }

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

      this.setState({loading: false});
    });

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
        splitted = true;
      } else if (char == '}') {
        result = result.slice(0, -1);
        result += '\n' + '\t'.repeat(--spliters);
        result += char;
      } else if (char == ',' && !inArray) {
        result += '\n' + '\t'.repeat(spliters);
        splitted = true;
      }
    }

    return result;
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

  returnStyleField({label, name, value, styles = this.state.pdfSettings.styles}) {
    return (
      <FormField className='input-field' label={
          <Box justify='between' direction='row'>
            <span>{label}</span>
            <Menu size='small' label={value.style}>
            {Object.keys(styles).map(s => {
              return <Anchor onClick={(event) => this.updatePDFSettings(event, s, name + '.style')}>{s}</Anchor>;
            }
            )}</Menu>
          </Box>}>
        <input name={name + '.text'} type="text" onChange={this.updatePDFSettings}
               value={value.text} style={getPreviewStyle(styles[value.style], true)}/>
      </FormField>
    );
  }

  returnTableStyleField({value}) {
    const styles = this.state.pdfSettings.styles;
    return (
      <FormField label='Content Table'>
        <Box direction='row' pad={{horizontal: 'small'}}>
          <FormField label={
            <Box justify='between' direction='row'>
              <span>Layout:</span>
              <Menu size='small' label={value.layout}>
              {table_style.map(s => {
                return <Anchor onClick={(event) => this.updatePDFSettings(event, s, 'contents.layout')}>{s}</Anchor>;
              }
              )}</Menu>
            </Box>}/>
          <FormField label={
            <Box justify='between' direction='row'>
              <span>Style:</span>
              <Menu size='small' label={value.style}>
              {Object.keys(styles).map(s => {
                return <Anchor onClick={(event) => this.updatePDFSettings(event, s, 'contents.style')}>{s}</Anchor>;
              }
              )}</Menu>
            </Box>}/>
          <FormField label={
            <Box justify='between' direction='row'>
              <span>Header:</span>
             <Menu size='small' label={value.header}>
              {Object.keys(styles).map(s => {
                return <Anchor onClick={(event) => this.updatePDFSettings(event, s, 'contents.header')}>{s}</Anchor>;
              }
              )}</Menu>
            </Box>}/>
          <FormField label={
            <Box justify='between' direction='row'>
              <span>Text:</span>
              <Menu size='small' label={value.text}>
              {Object.keys(styles).map(s => {
                return <Anchor onClick={(event) => this.updatePDFSettings(event, s, 'contents.text')}>{s}</Anchor>;
              }
              )}</Menu>
            </Box>}/>
        </Box>
      </FormField>
    );
  }

  renderStyleSettings() {
    const styles = this.state.pdfSettings.styles;
    return (
      <Box>
        <Form compact={true} className='strong-label'>
          {Object.keys(styles).map((key, index) => {
            const stylePropKeys = Object.keys(styles[key]);
            //const value = stylePropKeys.map((style, j) => `${style}: ${styles[key][style]}`).join('\n');
            const styleObj = _.cloneDeep(styles[key]);
            delete styleObj.name;
            const value = JSON.stringify(styleObj).replace(/,"/g, ',\n"').slice(1, -1);
            const onClick = () => {
              this.setState({
                new_style: Object.assign({}, styles[key], {name: key}),
                showLayer: 'new_style'
              });
            };

            return (
              <FormField label={<Box onClick={onClick}>{key}</Box>} key={index} error={styles[key].error}>
                <textarea rows={stylePropKeys.length} value={value} readOnly={true}/>
              </FormField>
            );
          })}
        </Form>
      </Box>
    );
  }

  renderStyleLayer() {
    const name = this.state.showLayer;
    if(name) {
      const styleObj = this.state.new_style;
      const closeState = {
        showLayer: null,
        new_style: Object.assign({}, init_style),
        pdfSettings: this.state.pdfSettings
      };

      return (
        <Layer>
          <StyleDesigner
            styleObj={styleObj}
            onCancel={() => this.setState(closeState)}
            onConfirm={(styleObj) => {
              closeState.pdfSettings.styles[styleObj.name] = styleObj;
              this.setState(closeState, this.autoPreview);
            }}/>
        </Layer>
      );
    }
  }

  render() {
    const {mode, pdfDefinition, error, pdfSettings} = this.state;
    return (
      <Box pad='small' flex={true}>
        <Header justify='between' size='small'>
          <Box>PDF Generator</Box>
          <Menu direction="row" align="center" responsive={true}>
            <Anchor icon={<Code/>} onClick={() => this.setState({ mode: mode == MODE.CODE ? MODE.DESIGN : MODE.CODE })} label={mode}/>
            <Anchor icon={<Add />} onClick={() => this.setState({showLayer: 'new_style'})} label="Add style"/>
            <Anchor icon={<Preview/>} onClick={this.preview} label='Preview'/>
            <Anchor icon={<Download />} onClick={() => this.setState({ showExportLayer: true })} label='Export'/>
            <Anchor label='Back' icon={<Close/>} onClick={() => this.props.back()}/>
          </Menu>
        </Header>
        <Box flex={true} direction='row'>
          {mode == MODE.CODE ? <FormField error={error} className='code-panel'>
            <textarea name='pdfDefinition' value={this.format(pdfDefinition)}
                      onChange={this.updateCode}/>
          </FormField> :
            <Box flex={true} style={{maxWidth: '50vw'}} direction='row'>
              <Form className='strong-label flex no-border'>
                <FormField label='Page Header'>
                  <Box direction='row' pad='small'>
                    {this.returnStyleField({label: 'Left', name:"pageHeader.left", value:pdfSettings.pageHeader.left})}
                    {this.returnStyleField({label: 'Center', name:"pageHeader.center", value:pdfSettings.pageHeader.center})}
                    {this.returnStyleField({label: 'Right', name:"pageHeader.right", value:pdfSettings.pageHeader.right})}
                  </Box>
                </FormField>
                <FormField label='Report Body'>
                  <Box pad='small'>
                    {this.returnStyleField({label: 'Header', name:"reportHead", value:pdfSettings.reportHead})}
                    {this.returnStyleField({label: 'Descriptions', name:"reportDesc", value:pdfSettings.reportDesc})}
                    {this.returnTableStyleField({label: 'Contents Table', name:"contents", value:pdfSettings.contents})}
                  </Box>
                </FormField>
                {/*this.renderFields()*/}
                <FormField label='Page Footer'>
                  <Box direction='row' pad='small'>
                    {this.returnStyleField({label: 'Left', name:"pageFooter.left", value:pdfSettings.pageFooter.left})}
                    {this.returnStyleField({label: 'Center', name:"pageFooter.center", value:pdfSettings.pageFooter.center})}
                    {this.returnStyleField({label: 'Right', name:"pageFooter.right", value:pdfSettings.pageFooter.right})}
                  </Box>
                </FormField>
                <FormField label="Page Orientation" className='multi-check'>
                  <RadioButton id='pageOrientation' name='pageOrientation' label='portrait'
                               checked={pdfSettings.pageOrientation == 'portrait'} onChange={(event) => this.updatePDFSettings(event, 'portrait')}/>
                  <RadioButton id='pageOrientation' name='pageOrientation' label='landscape'
                               checked={pdfSettings.pageOrientation == 'landscape'} onChange={(event) => this.updatePDFSettings(event, 'landscape')}/>
                </FormField>
              </Form>
              {/*this.renderStyleSettings()*/}
            </Box>
          }
          <div style={{ width: '50vw' }} id='pdfContainer' />
        </Box>
        {this.renderStyleLayer()}
      </Box>
    );
  }
}

