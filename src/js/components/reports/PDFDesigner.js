import React, {Component, PropTypes} from 'react';
import {Box, Header, Icons, Anchor, Menu, FormField, Form, Label,
  RadioButton, Layer, NumberInput} from 'grommet';
const {Download, Play: Preview} = Icons.Base;
import {loadRecordsByBody} from '../../actions/explorer';
import {showError} from '../../actions/system';
import { cloneDeep } from 'lodash';
import { preview, getPreviewStyle, updateValue, translateText, download } from '../../util/pdfDesigner';
import { init_style, table_style, GLOBAL_VARIABLES} from '../../constants/PDFDesigner';
import {AlertForm, UploadWidget, AMHeader, Brush, StyleDesigner, ExportLayer, ExportLayerForDetail} from '../commons';

Menu.propTypes.label = PropTypes.oneOfType([PropTypes.object, PropTypes.string]);

export default class PDFDesigner extends Component {
  componentWillMount() {
    const {body: {fields}, records, report, definition} = this.props;
    this.state = {
      pdfDefinition: definition,
      code: '',
      fields: fields,
      records: records || [],
      report: report,
      new_style: {},
      showLayer: null,
      recordsStart: 1,
      limit: 100,
      showExportLayer: false,
      total: records ? records.length : 0
    };
    this.updatePDFSettings = this.updatePDFSettings.bind(this);
    this.updateCode = this.updateCode.bind(this);
    this._updateValue = this._updateValue.bind(this);
    this._preview = this._preview.bind(this);
    this.autoPreview = this.autoPreview.bind(this);
    this.isChanged = this.isChanged.bind(this);
    this.onDuplicate = this.onDuplicate.bind(this);
    this.originReport = _.cloneDeep(report);
  }

  componentDidMount() {
    this._preview();

    const body = this.props.body;
    body.param = {limit: 10, offset: 0};
    loadRecordsByBody(body).then((data) => {
      this.setState({records: data.entities, total: data.count}, this._preview);
    });
    this.updatePic();
  }

  componentWillReceiveProps(nextProps) {
    const {body: {fields}, records, definition, report} = nextProps;
    if (!report._id || report._id !== this.state.report._id) {
      this.setState({
        fields, records, report, definition
      }, () => {
        this.updatePic();
        this.autoPreview();
      });
    }
    this.originReport = _.cloneDeep(report);
  }

  updatePic(src = this.state.report.settings.images[GLOBAL_VARIABLES.LOGO]) {
    document.getElementById('logo').src = src;
  }

  autoPreview() {
    if (!this.state.loading) {
      if (this.previewTimer) {
        clearTimeout(this.previewTimer);
      }
      this.previewTimer = setTimeout(this._preview, 2000);
    }
  }

  updateCode(event, code = event.target.value) {
    let error = '';
    try {
      JSON.parse(code);
    } catch (e) {
      error = e.message;
    }
    this.setState({code, error});
  }

  _updateValue(event, props = {}) {
    const {val = event.target.value, name = event.target.name, state = this.state, callback = ()=> this.setState(this.state)} = props;
    updateValue(event, {val, name, state, callback });
  }

  updatePDFSettings(event, val = event.target.value, name = event.target.name) {
    this._updateValue(event, {
      val, name, state: this.state.report.settings,
      callback: () => this.setState(this.state, this.autoPreview)
    });
  }

  _translateText(pdfDefinition, records = this.state.records, param = {limit: 10, offset: 0}) {
    const {body, links, groupByData, record} = this.props;
    const {report: {settings}, fields: fields_state} = this.state;
    if ((links && links.length > 0) || this.props.record) {
      records = [];
    }

    return translateText(pdfDefinition, {settings, records, body, fields_state, record, links, param, groupByData});
  }

  _preview() {
    let pdfDefinition = this.state.pdfDefinition;
    this.setState({loading: true});
    if (!this.state.code) {
      this._translateText(pdfDefinition).then(data => {
        preview(cloneDeep(data), () => this.setState({loading: false}));
      });
    } else {
      preview(cloneDeep(pdfDefinition), () => this.setState({loading: false}));
    }
  }

  _download({recordsStart, limit}) {
    const onBefore = () => this.setState({loading: true});
    const props = {recordsStart, limit, body: this.props.body};
    const getPDFDefinition = (data) => this._translateText(this.state.pdfDefinition, data, {offset: recordsStart, limit});
    const onDone = () => this.setState({loading: false});

    download({onBefore, props, getPDFDefinition, onDone});
  }

  returnStyleField({label, name, value, placeHolder, styles = this.state.report.settings.styles, data = Object.keys(styles), noInput=false}) {
    const styleName = noInput ? name : name + '.style';
    let styleValue = noInput ? value : value.style;
    if (!noInput && data.indexOf(styleValue) == -1) {
      styleValue = 'text'; // if the style name can not be found, use text as default
    }

    const fieldLabel = (
      <Box justify='between' direction='row'>
        <span>{label}</span>
        <Menu size='small' label={<span style={getPreviewStyle(styles[styleValue])}>{styleValue}</span>}>
          {data.map((s, index) => <Anchor key={index} onClick={(event) => this.updatePDFSettings(event, s, styleName)}>
            <span style={getPreviewStyle(styles[s])}>{s}</span>
          </Anchor>)}
        </Menu>
      </Box>
    );

    return (
      <FormField className={noInput ? '' : 'input-field'} label={fieldLabel} ref={node => node && (node._onClick = () => {})}>
        {!noInput &&
        <input name={name + '.text'} type="text" onChange={this.updatePDFSettings} placeholder={placeHolder}
               value={value.text} style={getPreviewStyle(styles[value.style], true)}/>}
      </FormField>
    );
  }

  returnTableStyleField({layout, style, header, text}) {
    return (
      <FormField label='Table' ref={node => node && (node._onClick = () => {})}>
        <Box pad={{horizontal: 'small'}}>
          {this.returnStyleField({
            label: 'Title',
            name: "contents.tableTitle",
            value: this.state.report.settings.contents.tableTitle,
            placeHolder: '@tableTitle'
          })}

          <Box direction='row'>
            {this.returnStyleField({
              label: 'Layout:',
              name: 'contents.layout',
              value: layout,
              data: table_style,
              noInput: true
            })}
            {this.returnStyleField({label: 'Style:', name: 'contents.style', value: style, noInput: true})}
          </Box>
          <Box direction='row'>
            {this.returnStyleField({label: 'Header:', name: 'contents.header', value: header, noInput: true})}
            {this.returnStyleField({label: 'Text:', name: 'contents.text', value: text, noInput: true})}
          </Box>
        </Box>
      </FormField>
    );
  }

  returnFieldBlockStyleField(fieldBlock) {
    return (
      <FormField label='Field Block'>
        <Box pad={{horizontal: 'medium'}}>
          <Box direction='row'>
            {this.returnStyleField({
              label: 'Title',
              name: "fieldBlock.fieldTitle",
              value: fieldBlock.fieldTitle,
              placeHolder: '@linkTitle'
            })}
            <FormField label='Columns'>
              <NumberInput name='column' type="range" min={1} max={3} value={fieldBlock.column}
                           onChange={(event) => this._updateValue(event, {state: fieldBlock, callback: this.autoPreview})}/>
            </FormField>
          </Box>
          <Box direction='row'>
            {this.returnStyleField({label: 'Label:', name: 'fieldBlock.label', value: fieldBlock.label, noInput: true})}
            {this.returnStyleField({label: 'Value:', name: 'fieldBlock.value', value: fieldBlock.value, noInput: true})}
          </Box>
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
        report: this.state.report
      };

      const onClose =() => {
        if (_.isEqual(this.styleDesigner.state.styles, this.styleDesigner.styles)) {
          this.setState(closeState, this.autoPreview);
        } else {
          this.setState({alert: true});
        }

      };

      return (
        <Layer closer={true} onClose={onClose}>
          <StyleDesigner
            ref={node=> this.styleDesigner = node}
            styles={this.state.report.settings.styles}
            onConfirm={styles => closeState.report.settings.styles = styles}/>
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
      if (this.props.record) {
        return (<ExportLayerForDetail
                  onConfirm={onConfirm}
                  total={1000} recordsStart={0}
                  limit={limit} onClose={onClose}/>);
      } else {
        return (<ExportLayer onConfirm={onConfirm}
                             recordsStart={recordsStart} total={total}
                             limit={limit} onClose={onClose} />);
      }
    }
  }

  onDuplicate() {
    const report = this.state.report;
    const dupReport = _.cloneDeep(report);
    dupReport._id = null;
    dupReport.name = report.name  + '_duplicate';
    this.props.onDupReport(dupReport, this.resetOrigin);
  }

  isChanged() {
    return this.props.isChanged || !_.isEqual(this.originReport, this.state.report);
  }

  uploadLogo(src) {
    let data, match;
    if (match = /^data:.+;base64,(.*)$/.exec(src)) {
      data = new Buffer(match[1], 'base64');
    }
    if ((data[0] === 0xff && data[1] === 0xd8) // jpg
      || (data[0] === 0x89 && data.toString('ascii', 1, 4) === 'PNG')) { // png

      this.state.report.settings.images = {};
      this.state.report.settings.images[GLOBAL_VARIABLES.LOGO] = src;
      this.setState({report: this.state.report}, this.autoPreview);
      this.updatePic(src);
    } else {
      showError('Only png and jpg image are supported');
    }
  }

  renderCode() {
    const {error, code} = this.state;
    return (
      <Box flex>
        <FormField error={error} className='code-panel'>
          <textarea value={code} onChange={this.updateCode}
                    onBlur={event => this._updateValue(event, {val: JSON.parse(code), name: 'pdfDefinition', callback: ()=> this.setState(this.state, this._preview)})} />
        </FormField>
      </Box>
    );
  }

  renderSettingsForm() {
    const settings = this.state.report.settings;
    let formClasses = 'strong-label flex no-border background-';
    formClasses += this.state.root ? 'white' : 'grey';
    return (
      <Box direction='row' flex={true}>
        <Form className={formClasses}>
          <FormField label='Page Header'>
            <Box direction='row' pad={{horizontal:'small'}}>
              {this.returnStyleField({
                label: 'Left',
                name: "pageHeader.left",
                value: settings.pageHeader.left,
                placeHolder: '@date or @logo'
              })}
              {this.returnStyleField({
                label: 'Center',
                name: "pageHeader.center",
                value: settings.pageHeader.center,
                placeHolder: '@date or @logo'
              })}
              {this.returnStyleField({
                label: 'Right',
                name: "pageHeader.right",
                value: settings.pageHeader.right,
                placeHolder: '@date or @logo'
              })}
            </Box>
          </FormField>
          <FormField label='Report Body'>
            <Box pad={{horizontal:'small'}}>
              <Box direction='row'>
                {this.returnStyleField({
                  label: 'Header',
                  name: "reportHead",
                  value: settings.reportHead,
                  placeHolder: '@date or @logo or @title'
                })}
                {this.returnStyleField({
                  label: 'Descriptions',
                  name: "reportDesc",
                  value: settings.reportDesc,
                  placeHolder: '@date or @logo or @title'
                })}
              </Box>
              {this.returnTableStyleField(settings.contents)}
              {this.returnFieldBlockStyleField(settings.fieldBlock)}
            </Box>
          </FormField>
          <FormField label='Page Footer'>
            <Box direction='row' pad={{horizontal:'small'}}>
              {this.returnStyleField({
                label: 'Left',
                name: "pageFooter.left",
                value: settings.pageFooter.left,
                placeHolder: '@date or @logo'
              })}
              {this.returnStyleField({
                label: 'Center',
                name: "pageFooter.center",
                value: settings.pageFooter.center,
                placeHolder: '@date or @logo'
              })}
              {this.returnStyleField({
                label: 'Right',
                name: "pageFooter.right",
                value: settings.pageFooter.right,
                placeHolder: '@date or @logo'
              })}
            </Box>
          </FormField>

          <FormField label="Page Orientation">
            <Box pad={{vertical: 'small',horizontal: 'large'}} direction='row'>
              <RadioButton id='pageOrientation' name='pageOrientation' label='portrait'
                           checked={settings.pageOrientation == 'portrait'}
                           onChange={(event) => this.updatePDFSettings(event, 'portrait')}/>
              <RadioButton id='pageOrientation' name='pageOrientation' label='landscape'
                           checked={settings.pageOrientation == 'landscape'}
                           onChange={(event) => this.updatePDFSettings(event, 'landscape')}/>
            </Box>
          </FormField>
        </Form>
      </Box>
    );
  }

  renderHeader() {
    const {report, loading, code, pdfDefinition} = this.state;
    const {name, _id} = report;
    const root = this.props.root;
    const canEdit = root || !report.public;

    const buttons = [{
      icon: <Download />,
      onClick: () => this.setState({showExportLayer: true}),
      enable: !loading,
      label: 'Export'
    }];
    if (canEdit) {
      buttons.push({
        id: 'Save',
        onClick: () => this.props.onSaveReport(report),
        enable: name && this.isChanged()
      });
      buttons.push({id: 'Delete', onClick: this.props.onRemoveReport, enable: _id});
    }

    const subMenuButtons = [{
      icon: <Preview />,
      onClick: this._preview,
      enable: !loading,
      label: 'Preview'
    }, {
      id: 'Duplicate',
      onClick: this.onDuplicate,
      enable: _id
    }
    ];

    const toggleCodeMode = () => {
      if (code) {
        this.setState({code: ''});
      } else {
        this.setState({code: JSON.stringify(pdfDefinition, null, ' ')});
      }
    };

    return (<AMHeader title={<Box onDoubleClick={toggleCodeMode}>Template Builder</Box>}
                     buttons={buttons} subMenuButtons={subMenuButtons}/>);
  }

  render() {
    const {code, report: {name}} = this.state;

    return (
      <Box flex={true}>
        {this.renderHeader()}
        <Box flex={true} direction='row' margin={{bottom: 'small'}} pad={{'horizontal': 'medium'}}>
          <Box flex={true} style={{maxWidth: '50vw'}} className='autoScroll'>
            <Header justify='between' size='small' direction='row'>
              <Box direction='row' align='center' className='no-border'>
                <Label style={{color: '#ff0000'}}>Name:</Label>
                <FormField>
                  <input className='input-field' name='report.name' type="text" value={name}
                         onChange={this._updateValue} maxLength='20'/>
                </FormField>
              </Box>
              <Box direction='row' align='center'>
                <UploadWidget accept=".jpg,.png" label='Logo' onChange={this.uploadLogo.bind(this)}/>
                <Box pad={{horizontal: 'small'}}/>
                <img id='logo' height='24px'/>
              </Box>
              <Box pad={{horizontal: 'small'}}>
                <Anchor icon={<Brush />} onClick={() => this.setState({showLayer: 'new_style'})} label="Style Designer"/>
              </Box>
            </Header>
            {code ? this.renderCode() : this.renderSettingsForm() }
          </Box>
          <div id='pdfContainer'/>
        </Box>
        {this.renderStyleLayer()}
        {this.renderExportLayer()}
        {this.state.alert &&
        <AlertForm onClose={() => this.setState({alert: false})}
                   title='Leave Style Designer'
                   desc='Do you want to leave without save your modifications?'
                   onCancel={() => this.setState({alert: false})}
                   onConfirm={() => this.setState({showLayer: false})}/>
        }
      </Box>
    );
  }
}

PDFDesigner.propTyps = {
  body: PropTypes.object.isRequired,
  records: PropTypes.array,
  record: PropTypes.object,
  links: PropTypes.array,
  settings: PropTypes.object.isRequired,
  definition: PropTypes.object.isRequired
};
