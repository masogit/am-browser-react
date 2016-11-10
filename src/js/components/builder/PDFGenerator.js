import React, {Component} from 'react';
import {Box, Header, Icons, Anchor, Menu, FormField, Form, CheckBox, SVGIcon,
  RadioButton, Layer, Title, Button, Footer, NumberInput, List, ListItem, Label} from 'grommet';
const {Download, Close, Play: Preview, Code, Add} = Icons.Base;
import {getDisplayLabel, getFieldStrVal} from '../../util/RecordFormat';
import * as ExplorerActions from '../../actions/explorer';
import { cloneDeep } from 'lodash';


const Brush = (props) => (
  <SVGIcon viewBox="0 0 24 24" {...props}>
    <path fill="none" stroke="#000000" strokeWidth="2" d="M13,9 L20.5,2 C20.5,2 21.125,2.125 21.5,2.5 C21.875,2.875 22,3.5 22,3.5 L15,11 L13,9 Z M14,14 L10,10 M1.70033383,20.1053387 C1.70033383,20.1053387 3.79489719,20.0776099 5.25566729,20.060253 C6.71643739,20.0428962 8.23797002,20.0142636 10.2253759,19.9972314 C12.2127817,19.9801992 14.4826673,16.0267479 11.414668,13.0099775 C8.34666868,9.99320721 6.34639355,12.0876248 5.34441315,13.062 C2.38723495,15.9377059 1.70033383,20.1053387 1.70033383,20.1053387 Z"/>
  </SVGIcon>
);



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

const getPreviewStyle = ({bold=false, italics=false, color='#000000', margin=[0,0,0,0], fontSize=16}, ignoreMargin = false) => {
  const previewStyle = {};
  previewStyle.fontWeight = bold ? 'bold' : 'normal';
  previewStyle.fontStyle = italics ? 'italic' : 'normal';
  previewStyle.fontSize = fontSize;
  previewStyle.color = color;

  if (!ignoreMargin) {
    previewStyle.margin = margin.slice(1).join('px ') + 'px ' + margin[0] + 'px';
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
    const {styleObj} = this.props;
    const [left = 0, top = 0, right = 0, bottom = 0] = styleObj.margin || [];

    return (
      <Box className='margin-designer' pad={{horizontal: 'medium'}}>
        <Box className='grid' style={{height: 300}} align='center' justify='center'>
          <Box align='center' justify='center' >
            {this.renderInput('top', top)}
          </Box>
          <Box direction='row' justify='center' align='center'>
            {this.renderInput('left', left)}
            <Box style={{border: '1px dashed'}}>
              <input style={getPreviewStyle(styleObj)} value='AM Browser' readOnly={true}/>
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
    this.state = {
      styles: this.props.styles
    };
    this.updateValue = this.updateValue.bind(this);
    this.initStyle = this.initStyle.bind(this);
    this.initStyle();
  }

  initStyle() {
    this.setState({styleObj: Object.assign({}, init_style)});
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
      }, this.state.styleObj);
    } else {
      this.state.styleObj[name] = val;
    }

    this.setState(this.state);
  }

  renderNumberInput(label, name, min, max, step = 1) {
    let value = this.state.styleObj[name];

    //https://gist.github.com/Candy374/80bf411ff286f6785eb80a9098f01c39
    return (
      <FormField label={
          <Box justify='between' direction='row'>
            <Label margin='none'>{label}</Label>
          </Box>}>
        <NumberInput className='number-input-label' name={name} type="range" min={min} max={max} step={step} value={value} onChange={this.updateValue}/>
        <input name={name} type="range" min={min} max={max} step={step} value={value} onChange={this.updateValue}/>
      </FormField>
    );
  }

  renderSidebar(styles = this.state.styles) {
    return (
      <List>
        {Object.keys(styles).map((key, index) => {
          const onClick = () => {
            this.setState({
              styleObj: Object.assign(styles[key], {name: key})
            });
          };

          return (
            <ListItem onClick={onClick} key={index}>
              <label style={getPreviewStyle(styles[key], true)}>{key}</label>
            </ListItem>
          );
        })}
      </List>
    );
  }

  render() {
    const {onConfirm, onCancel} = this.props;
    const { styleObj }= this.state;

    return (
      <Box flex={true}>
        <Header direction='row' justify='between'>
          <Title>Style Designer</Title>
          <Box pad={{horizontal: 'medium'}}><Anchor icon={<Add />} onClick={this.initStyle} label="New Style"/></Box>
        </Header>
        <Box direction='row'>
          {this.renderSidebar()}
          <Box>
            <Form className='no-border strong-label style-designer'>
              <FormField>
                <MarginDesigner styleObj={styleObj} updateValue={this.updateValue}/>
              </FormField>
              <FormField>
                <Box direction='row' align='center' justify='between' pad='medium'>
                  <Box direction='row'><Label margin='none' style={{color: '#ff0000', fontWeight: '400'}}>Name:</Label>
                      <input className='input-field' name='name' type="text" value={styleObj.name} onChange={this.updateValue}
                             autoFocus={true} maxLength='20'/>
                  </Box>
                  <label><Label>Color:</Label><input type='color' name='color' value={styleObj.color} onChange={this.updateValue}/></label>
                  <CheckBox checked={styleObj.bold} name='bold' toggle={true}
                            value={styleObj.bold} label={<Label>Bold</Label>}
                            onChange={this.updateValue}/>
                  <CheckBox checked={styleObj.italics} name='italics' toggle={true}
                            value={styleObj.italics} label={<Label>Italics</Label>}
                            onChange={this.updateValue}/>
                </Box>
              </FormField>
              {this.renderNumberInput('Font Size', 'fontSize', 10, 64)}
            </Form>

            <Footer justify='end' pad='medium'>
              <Button label="Confirm" primary={true} strong={true} onClick={styleObj.name ? () => onConfirm(styleObj) : null}/>
              <Box pad={{horizontal: 'small'}}/>
              <Button label="Cancel" primary={true} strong={true} onClick={onCancel}/>
            </Footer>
          </Box>
        </Box>
      </Box>
    );
  }
}

export default class PDFGenerator extends Component {
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

  returnStyleField({label, name, value, styles = this.state.pdfSettings.styles, data = Object.keys(styles), noInput=false}) {
    const styleName = noInput ? name : name + '.style';
    const styleValue = noInput ? value : value.style;

    return (
      <FormField className={noInput ? '' : 'input-field'} label={
          <Box justify='between' direction='row'>
            <span>{label}</span>
            <Menu size='small' label={styleValue} dropAlign={{top: 'top', right: 'right'}}>
             {data.map(s => <Anchor onClick={(event) => this.updatePDFSettings(event, s, styleName)}>{s}</Anchor>)}
            </Menu>
          </Box>}>
        {!noInput && <input name={name + '.text'} type="text" onChange={this.updatePDFSettings}
               value={value.text} style={getPreviewStyle(styles[value.style], true)}/>}
      </FormField>
    );
  }

  returnTableStyleField({layout, style, header, text}) {
    return (
      <FormField label='Content Table'>
        <Box direction='row' pad={{horizontal: 'small'}}>
          {this.returnStyleField({label:'Layout:', name: 'contents.layout', value: layout, data: table_style, noInput: true})}
          {this.returnStyleField({label:'Style:', name: 'contents.style', value: style, noInput: true})}
        </Box>
        <Box direction='row' pad={{horizontal: 'small'}}>
          {this.returnStyleField({label:'Header:', name: 'contents.header', value: header, noInput: true})}
          {this.returnStyleField({label:'Text:', name: 'contents.text', value: text, noInput: true})}
        </Box>
      </FormField>
    );
  }

  renderStyleLayer() {
    const name = this.state.showLayer;
    if(name) {
      const closeState = {
        showLayer: null,
        new_style: Object.assign({}, init_style),
        pdfSettings: this.state.pdfSettings
      };

      return (
        <Layer>
          <StyleDesigner
            styles={this.state.pdfSettings.styles}
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
            <Anchor icon={<Code />} onClick={() => this.setState({ mode: mode == MODE.CODE ? MODE.DESIGN : MODE.CODE })} label={mode}/>
            <Anchor icon={<Brush />} onClick={() => this.setState({showLayer: 'new_style'})} label="Style Designer"/>
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
                    {this.returnTableStyleField(pdfSettings.contents)}
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

