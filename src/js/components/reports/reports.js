import React, {Component} from 'react';
import { Box, Anchor } from 'grommet';
import AMSideBar from '../commons/AMSideBar';
import * as ReportActions from '../../actions/reports';
import Add from 'grommet/components/icons/base/Add';
import ContentPlaceHolder from '../../components/commons/ContentPlaceHolder';
import _ from 'lodash';
import { monitorEdit, dropCurrentPop, stopMonitorEdit } from '../../actions/system';
import example_body from './body_template.json';
import example_records from './records_template.json';
import PDFGenerator from './PDFGenerator.js';
import {defaultSettings, defaultPDFDefinition} from '../../util/pdfGenerator';
import cookies from 'js-cookie';

const USER = cookies.get('user');
const category_PUBLIC = 'Public';
const category_PERSONAL = 'Personal';
export default class Reports extends Component {
  componentWillMount() {
    this.state = {
      reports:[],
      categories: [],
      report: {}
    };

    this.initReport = {
      name: '',
      category: this.props.fromView ? category_PERSONAL : category_PUBLIC,
      isPublic: !this.props.fromView,
      user: USER,
      settings: defaultSettings
    };

    this._dropCurrentPop = this._dropCurrentPop.bind(this);
    this._onSaveReport = this._onSaveReport.bind(this);
    this._onRemoveReport = this._onRemoveReport.bind(this);
    this._onDupReport = this._onDupReport.bind(this);
    this._initReport = this._initReport.bind(this);
  }

  componentDidMount() {
    this._loadReports();
  }

  _initReport(callback) {
    this.setState({
      report: _.cloneDeep(this.initReport)
    }, callback);
  }

  _loadReports() {
    ReportActions.loadReports().then((data) => {
      let categories = _.uniq(data.map((report) => {
        return report.category;
      }));
      this.setState({
        reports: data,
        categories: categories
      });
    });
  }

  _onSaveReport(report) {
    ReportActions.saveReport(report).then(id => {
      if (id) {
        stopMonitorEdit();
        this._loadReports();
        this.state.report._id = id;
      }
    });
  }

  _onDupReport(report) {
    this._dropCurrentPop('Duplicate a pdf template?', () => {
      this._initReport(() => {
        monitorEdit(_.cloneDeep(this.state.report), this.state.report);
        report.category = this.props.fromView ? category_PERSONAL : category_PUBLIC;
        report.isPublic = false;
        this.setState({report});
      });
    });
  }

  _onRemoveReport() {
    ReportActions.removeReport(this.state.report._id).then(id => {
      if (id) {
        this._loadReports();
        this.setState({report: {}});
      }
    });
  }

  _querySelectedReport(report) {
    this.state.report = report;
    ReportActions.loadReport(report._id).then((res) => {
      this.setState({
        report: res
      }, () => monitorEdit(_.cloneDeep(res), this.state.report));
    });
  }

  _onNew() {
    this._dropCurrentPop('Create a new pdf template?', () =>{
      this._initReport(() => monitorEdit(_.cloneDeep(this.state.report), this.state.report));
    });
  }

  _dropCurrentPop(title, onConfirm) {
    const originReport = this.state.reports.filter(report => report._id == this.state.report._id)[0];
    const currentReport = _.cloneDeep(this.state.report);

    dropCurrentPop(originReport, currentReport, this.initReport, title, onConfirm);
  }

  render() {
    const {reports, report} = this.state;
    const {fromView, body, records} = this.props;

    const toolbar = <Anchor icon={<Add />} label="New" onClick={this._onNew.bind(this)}/>;
    const contents = reports.map(rpt => ({
      key: rpt._id,
      groupby: rpt.category,
      child: rpt.name,
      search: rpt.name,
      onClick: () => {
        if (rpt._id != report._id) {
          this._dropCurrentPop(`Open ${rpt.name}`, this._querySelectedReport.bind(this, rpt));
        }
      }
    }));
    const focus = report && {expand: report.category, selected: report._id};

    return (
      <Box direction="row" flex={true} pad={fromView ? 'small' : 'none'} style={{minWidth: '90vw', minHeight: '90vh'}}>
        <AMSideBar title='Templates' toolbar={toolbar} contents={contents} focus={focus}/>
        {!_.isEmpty(report) ?
          <PDFGenerator body={body || example_body} records={records || example_records} onSaveReport={this._onSaveReport}
                        definition={defaultPDFDefinition} onDupReport={this._onDupReport} root={!fromView}
                        report={report} onRemoveReport={this._onRemoveReport} />
          : <ContentPlaceHolder />
        }
      </Box>
    );
  }
}
