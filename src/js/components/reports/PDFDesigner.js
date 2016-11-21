import React, {Component, PropTypes} from 'react';
import {Box, Header, Icons, Anchor, Menu, FormField, Form,
  RadioButton, Layer} from 'grommet';
const {Download, Close, Play: Preview, Code, Checkmark, Duplicate} = Icons.Base;
import {loadRecordsByBody} from '../../actions/explorer';
import { cloneDeep } from 'lodash';
import { MODE, init_style, table_style, preview,
  getPreviewStyle, updateValue, translateText, format, download } from '../../util/pdfDesigner';
import {Brush, StyleDesigner, ExportLayer} from './../commons/PDFWidgets';
import AlertForm from '../commons/AlertForm';

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
    this.isChanged = this.isChanged.bind(this);
    this.onDuplicate = this.onDuplicate.bind(this);
    this.originReport = _.cloneDeep(report);
  }

  componentDidMount() {
    this._preview();

    if (this.state.records.length == 0) {
      loadRecordsByBody(this.props.body).then((data) => {
        this.setState({records: data.entities, total: data.count}, this._preview);
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const {body: {fields}, records, definition, report} = nextProps;
    if (report._id !== this.state.report._id) {
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

  _translateText(pdfDefinition, records = this.state.records) {
    const settings = this.state.report.settings,
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

  returnStyleField({label, name, value, styles = this.state.report.settings.styles, data = Object.keys(styles), noInput=false}) {
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
      return <ExportLayer onConfirm={onConfirm} onClose={onClose} recordsStart={recordsStart} total={total} limit={limit}/>;
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

  render() {
    const {mode, pdfDefinition, error, report, loading} = this.state;
    const {settings, name, _id} = report;
    const canEdit = this.props.root || !report.public;
    return (
      <Box pad='small' flex={true}>
        <Header justify='between' size='small'>
          <Box pad={{horizontal: 'small'}}>PDF Template</Box>
          <Menu direction="row" align="center" responsive={true}>
            <Anchor icon={<Code />} onClick={() => this.setState({ mode: mode == MODE.CODE ? MODE.DESIGN : MODE.CODE })} label={mode}/>
            <Anchor icon={<Brush />} onClick={() => this.setState({showLayer: 'new_style'})} label="Style Designer"/>
            <Anchor icon={<Preview/>} disabled={loading} onClick={loading ? null : this._preview} label='Preview'/>
            <Anchor icon={<Download />} disabled={loading} onClick={() => !loading && this.setState({showExportLayer: true})} label='Export'/>
            <Anchor icon={<Duplicate />} onClick={_id ? this.onDuplicate : null} label="Duplicate" disabled={!_id} />
            {canEdit && <Anchor icon={<Checkmark />} onClick= {() => name && this.isChanged() && this.props.onSaveReport(report)}
                    label="Save" disabled = {!name || !this.isChanged()} />}
            {canEdit && <Anchor icon={<Close />} onClick= {_id ? this.props.onRemoveReport : null}
                    label="Delete" disabled={!_id}/>}
          </Menu>
        </Header>
        <Box flex={true} direction='row'>
          {mode == MODE.CODE ? <FormField error={error} className='code-panel'>
            <textarea name='pdfDefinition' value={format(pdfDefinition)} onChange={this.updateCode}/>
          </FormField> :
            <Box flex={true} style={{maxWidth: '50vw'}} direction='row'>
              <Form className='strong-label flex no-border'>
                <FormField>
                  <Box direction='row'><span style={{color: '#ff0000', fontWeight: '400'}}>Name:</span>
                    <input className='input-field' name='report.name' type="text" value={name} onChange={this._updateValue} maxLength='20'/>
                  </Box>
                </FormField>
                <FormField label='Page Header'>
                  <Box direction='row' pad='small'>
                    {this.returnStyleField({label: 'Left', name:"pageHeader.left", value:settings.pageHeader.left})}
                    {this.returnStyleField({label: 'Center', name:"pageHeader.center", value:settings.pageHeader.center})}
                    {this.returnStyleField({label: 'Right', name:"pageHeader.right", value:settings.pageHeader.right})}
                  </Box>
                </FormField>
                <FormField label='Report Body'>
                  <Box pad='small'>
                    {this.returnStyleField({label: 'Header', name:"reportHead", value:settings.reportHead})}
                    {this.returnStyleField({label: 'Descriptions', name:"reportDesc", value:settings.reportDesc})}
                    {this.returnTableStyleField(settings.contents)}
                  </Box>
                </FormField>
                <FormField label='Page Footer'>
                  <Box direction='row' pad='small'>
                    {this.returnStyleField({label: 'Left', name:"pageFooter.left", value:settings.pageFooter.left})}
                    {this.returnStyleField({label: 'Center', name:"pageFooter.center", value:settings.pageFooter.center})}
                    {this.returnStyleField({label: 'Right', name:"pageFooter.right", value:settings.pageFooter.right})}
                  </Box>
                </FormField>
                <FormField label="Page Orientation" className='multi-check'>
                  <RadioButton id='pageOrientation' name='pageOrientation' label='portrait'
                               checked={settings.pageOrientation == 'portrait'} onChange={(event) => this.updatePDFSettings(event, 'portrait')}/>
                  <RadioButton id='pageOrientation' name='pageOrientation' label='landscape'
                               checked={settings.pageOrientation == 'landscape'} onChange={(event) => this.updatePDFSettings(event, 'landscape')}/>
                </FormField>
              </Form>
            </Box>
          }
          <div id='pdfContainer' />
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
  body: PropTypes.object.required,
  records: PropTypes.array,
  settings: PropTypes.object.required,
  definition: PropTypes.object.required
};
