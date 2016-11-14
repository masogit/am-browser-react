import React, {Component, PropTypes} from 'react';
import {Box, Header, Icons, Anchor, Menu as GMenu, FormField, Form,
  RadioButton, Layer} from 'grommet';
const {Download, Close, Play: Preview, Code} = Icons.Base;
import {loadRecordsByBody} from '../../actions/explorer';
import { cloneDeep } from 'lodash';
import { MODE, init_style, table_style, styles, defaultPDFDefinition, preview,
  getPreviewStyle, updateValue, translateText, format, download } from '../../util/pdfGenerator';
import {Brush, StyleDesigner, ExportLayer} from './../commons/PDFWidgets';

class Menu extends GMenu {
  render() {
    return super.render();
  }
}

Menu.propTypes = {
  label: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
};

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
      showLayer: null,
      recordsStart: 1,
      limit: 100,
      showExportLayer: false,
      total: 0
    };
    this.updatePDFSettings = this.updatePDFSettings.bind(this);
    this.updateCode = this.updateCode.bind(this);
    this._updateValue = this._updateValue.bind(this);
    this._preview = this._preview.bind(this);
  }

  componentDidMount() {
    this._preview();

    loadRecordsByBody(this.props.body).then((data) => {
      this.setState({ records: data.entities, total: data.count }, this._preview);
    });
  }

  autoPreview() {
    if (!this.state.loading) {
      this.setState({ loading: true });
      if (this.previewTimer) {
        clearTimeout(this.previewTimer);
      }
      this.previewTimer = setTimeout(this._preview, 2000);
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

  _updateValue(event, props = {}) {
    const {val = event.target.value, name = event.target.name, state = this.state, callback = ()=> this.setState(this.state)} = props;
    updateValue(event, {val, name, state, callback });
  }

  updatePDFSettings(event, val = event.target.value, name = event.target.name) {
    this._updateValue(event, {
      val, name, state: this.state.pdfSettings,
      callback: () => this.setState(this.state, this.autoPreview)
    });
  }

  _translateText(pdfDefinition, records = this.state.records) {
    const settings = this.state.pdfSettings,
      body = this.props.body, fields_state= this.state.fields;

    return translateText(pdfDefinition, {settings, records, body, fields_state});
  }

  _preview() {
    let pdfDefinition = this.state.pdfDefinition;
    if (this.state.mode != MODE.CODE) {
      pdfDefinition = this._translateText(pdfDefinition);
    }

    preview(cloneDeep(pdfDefinition), () => this.setState({loading: false}));
  }

  _download({recordsStart, limit}) {
    const onBefore = () => this.setState({downloading: true});
    const props = {recordsStart, limit, body: this.props.body};
    const getPDFDefinition = (data) =>  this._translateText(this.state.pdfDefinition, data);
    const onDone = () => this.setState({downloading: false});
    download({onBefore, props, getPDFDefinition, onDone});
  }

  returnStyleField({label, name, value, styles = this.state.pdfSettings.styles, data = Object.keys(styles), noInput=false}) {
    const styleName = noInput ? name : name + '.style';
    const styleValue = noInput ? value : value.style;

    return (
      <FormField className={noInput ? '' : 'input-field'} label={
          <Box justify='between' direction='row'>
            <span>{label}</span>
            <Menu size='small' label={<span style={getPreviewStyle(styles[styleValue])}>{styleValue}</span>} dropAlign={{top: 'top', right: 'right'}}>
             {data.map((s, index) => <Anchor key={index} onClick={(event) => this.updatePDFSettings(event, s, styleName)}>
              <span style={getPreviewStyle(styles[s])}>{s}</span>
              </Anchor>)}
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

      let readyToClose;
      const onClose =() => {
        if (readyToClose) {
          this.setState(closeState, this.autoPreview);
        }
      };

      return (
        <Layer closer={true} onClose={onClose}>
          <StyleDesigner
            setCloseStatus={(status) => readyToClose = status}
            styles={this.state.pdfSettings.styles}
            onConfirm={(styles) => {
              closeState.pdfSettings.styles = styles;
            }}/>
        </Layer>
      );
    }
  }

  renderExportLayer() {
    const {recordsStart, total, limit, showExportLayer} = this.state;
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
    const {mode, pdfDefinition, error, pdfSettings, loading} = this.state;

    return (
      <Box pad='small' flex={true}>
        <Header justify='between' size='small'>
          <Box>PDF Generator</Box>
          <Menu direction="row" align="center" responsive={true}>
            <Anchor icon={<Code />} onClick={() => this.setState({ mode: mode == MODE.CODE ? MODE.DESIGN : MODE.CODE })} label={mode}/>
            <Anchor icon={<Brush />} onClick={() => this.setState({showLayer: 'new_style'})} label="Style Designer"/>
            <Anchor icon={<Preview/>} disabled={loading} onClick={loading ? null : this._preview} label='Preview'/>
            <Anchor icon={<Download />} disabled={loading} onClick={() => !loading && this.setState({showExportLayer: true})} label='Export'/>
            <Anchor label='Back' icon={<Close/>} onClick={() => this.props.back()}/>
          </Menu>
        </Header>
        <Box flex={true} direction='row'>
          {mode == MODE.CODE ? <FormField error={error} className='code-panel'>
            <textarea name='pdfDefinition' value={format(pdfDefinition)}
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
            </Box>
          }
          <div style={{ width: '50vw' }} id='pdfContainer' />
        </Box>
        {this.renderStyleLayer()}
        {this.renderExportLayer()}
      </Box>
    );
  }
}

PDFGenerator.propTyps = {
  body: PropTypes.object.required
};
