import React, {Component, PropTypes} from 'react';
import {Box, Header, Icons, Anchor, Menu, FormField, Form,
  RadioButton, Layer} from 'grommet';
const {Download, Close, Play: Preview, Code, Checkmark, Duplicate} = Icons.Base;
import {loadRecordsByBody} from '../../actions/explorer';
import { cloneDeep } from 'lodash';
import { preview,
  getPreviewStyle, updateValue, translateText, download } from '../../util/pdfDesigner';
import {MODE, init_style, table_style, GLOBAL_VARIABLES} from '../../constants/PDFDesigner';
import {Brush, StyleDesigner, ExportLayer, NumberInputField, ExportLayerForDetail} from './../commons/PDFWidgets';
import AlertForm from '../commons/AlertForm';
import {UploadWidget} from '../commons/Widgets';

Menu.propTypes.label = PropTypes.oneOfType([PropTypes.object, PropTypes.string]);

export default class PDFDesigner extends Component {
  componentWillMount() {
    const {body: {fields}, records, report, definition} = this.props;
    this.state = {
      pdfDefinition: definition,
      mode: MODE.DESIGN,
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
  }

  componentWillReceiveProps(nextProps) {
    const {body: {fields}, records, definition, report} = nextProps;
    if (!report._id || report._id !== this.state.report._id) {
      this.setState({
        fields, records, report, definition
      }, this._preview);
    }
    this.originReport = _.cloneDeep(report);
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
      val, name, state: this.state.report.settings,
      callback: () => this.setState(this.state, this.autoPreview)
    });
  }

  _translateText(pdfDefinition, records = this.state.records, param = {limit: 10, offset: 0}) {
    const settings = this.state.report.settings,
      body = this.props.body, fields_state= this.state.fields,
      links = this.props.links;
    if (links && links.length > 0) {
      records = [];
    }

    return translateText(pdfDefinition, {settings, records, body, fields_state, record: this.props.record, links:this.props.links, param});
  }

  _preview() {
    let pdfDefinition = this.state.pdfDefinition;
    this.setState({loading: true});
    if (this.state.mode != MODE.CODE) {
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
        {!noInput && <input name={name + '.text'} type="text" onChange={this.updatePDFSettings} placeholder={placeHolder}
               value={value.text} style={getPreviewStyle(styles[value.style], true)}/>}
      </FormField>
    );
  }

  returnTableStyleField({layout, style, header, text}) {
    return (
      <FormField label='Table'>
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
            <NumberInputField state={fieldBlock} label='Columns' name='column'
                              updateValue={(event) => this._updateValue(event, {state: fieldBlock, callback: this.autoPreview})}
                              min={1} max={3} compact={true}/>
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

  uploadLogo() {

  }

  render() {
    const {mode, pdfDefinition, error, report, loading} = this.state;
    const {settings, name, _id} = report;
    const root = this.props.root;
    const canEdit = root || !report.public;
    let formClasses = 'strong-label flex no-border background-';
    formClasses += root ? 'white' : 'grey';

    return (
      <Box pad={{horizontal: 'small'}} flex={true}>
        <Header justify='between' size='small'>
          <Box direction='row' align='center' className='no-border'>
            <Box style={{color: '#ff0000'}}>Name:</Box>
            <FormField>
              <input className='input-field' name='report.name' type="text" value={name} onChange={this._updateValue}
                   maxLength='20'/>
            </FormField>
          </Box>
          <Menu direction="row" align="center" responsive={true}>
            <Anchor icon={<Code />} onClick={() => this.setState({ mode: mode == MODE.CODE ? MODE.DESIGN : MODE.CODE })}
                    label={mode}/>
            <Anchor icon={<Brush />} onClick={() => this.setState({showLayer: 'new_style'})} label="Style Designer"/>
            <Anchor icon={<Preview/>} disabled={loading} onClick={loading ? null : this._preview} label='Preview'/>
            <Anchor icon={<Download />} disabled={loading}
                    onClick={() => !loading && this.setState({showExportLayer: true})} label='Export'/>
            <Anchor icon={<Duplicate />} onClick={_id ? this.onDuplicate : null} label="Duplicate" disabled={!_id}/>
            {canEdit &&
            <Anchor icon={<Checkmark />} onClick={() => name && this.isChanged() && this.props.onSaveReport(report)}
                    label="Save" disabled={!name || !this.isChanged()}/>}
            {canEdit && <Anchor icon={<Close />} onClick={_id ? this.props.onRemoveReport : null}
                                label="Delete" disabled={!_id}/>}
          </Menu>
        </Header>
        <Box flex={true} direction='row' margin={{bottom: 'small'}}>
          {mode == MODE.CODE ? <FormField error={error} className='code-panel'>
            <textarea name='pdfDefinition' value={JSON.stringify(pdfDefinition, null, ' ')} onChange={this.updateCode}/>
          </FormField> :
            <Box flex={true} style={{maxWidth: '50vw'}} direction='row' className='autoScroll'>
              <Form className={formClasses}>
                <FormField label='Page Header'>
                  <Box direction='row' pad={{horizontal:'small'}}>
                    {this.returnStyleField({label: 'Left', name: "pageHeader.left", value: settings.pageHeader.left, placeHolder: '@date or @title'})}
                    {this.returnStyleField({
                      label: 'Center',
                      name: "pageHeader.center",
                      value: settings.pageHeader.center,
                      placeHolder: '@date or @title'
                    })}
                    {this.returnStyleField({
                      label: 'Right',
                      name: "pageHeader.right",
                      value: settings.pageHeader.right,
                      placeHolder: '@date or @title'
                    })}
                  </Box>
                </FormField>
                <FormField label='Report Body'>
                  <Box pad={{horizontal:'small'}}>
                    <Box direction='row'>
                      {this.returnStyleField({label: 'Header', name: "reportHead", value: settings.reportHead, placeHolder: '@date or @title'})}
                      {this.returnStyleField({label: 'Descriptions', name: "reportDesc", value: settings.reportDesc, placeHolder: '@date or @title'})}
                    </Box>
                    {this.returnTableStyleField(settings.contents)}
                    {this.returnFieldBlockStyleField(settings.fieldBlock)}
                  </Box>
                </FormField>
                <FormField label='Page Footer'>
                  <Box direction='row' pad={{horizontal:'small'}}>
                    {this.returnStyleField({label: 'Left', name: "pageFooter.left", value: settings.pageFooter.left})}
                    {this.returnStyleField({
                      label: 'Center',
                      name: "pageFooter.center",
                      value: settings.pageFooter.center
                    })}
                    {this.returnStyleField({
                      label: 'Right',
                      name: "pageFooter.right",
                      value: settings.pageFooter.right
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
                  <UploadWidget accept=".ico" onChange={this.uploadLogo.bind(this)}/>/>
                </FormField>
              </Form>
            </Box>
          }
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
