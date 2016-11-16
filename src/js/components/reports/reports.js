import React, {Component} from 'react';
import { Box, Anchor } from 'grommet';
import AMSideBar from '../commons/AMSideBar';
import * as ReportActions from '../../actions/reports';
import Add from 'grommet/components/icons/base/Add';
import ContentPlaceHolder from '../../components/commons/ContentPlaceHolder';
import _ from 'lodash';
import { monitorEdit, dropCurrentPop, stopMonitorEdit } from '../../actions/system';
import body from './body_template.json';
import records from './records_template.json';
import PDFGenerator from './PDFGenerator.js';
import {defaultSettings, defaultPDFDefinition} from '../../util/pdfGenerator';

export default class Reports extends Component {
  componentWillMount() {
    this.state = {
      reports:[],
      categories: [],
      report: {}
    };

    this.initReport = {
      name: '',
      category: '',
      //TODO: get user from cookie
      user: '',
      settings: defaultSettings
    };

    this._dropCurrentPop = this._dropCurrentPop.bind(this);
    this._onSaveReport = this._onSaveReport.bind(this);
    this._onRemoveReport = this._onRemoveReport.bind(this);
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
    this._dropCurrentPop('Create a new report?', () =>{
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
      <Box direction="row" flex={true}>
        <AMSideBar title='Reports' toolbar={toolbar} contents={contents} focus={focus}/>
        {!_.isEmpty(report) ?
          <PDFGenerator body={body} records={records} onSaveReport={this._onSaveReport}
                        definition={defaultPDFDefinition}
                        report={report} onRemoveReport={this._onRemoveReport} />
          : <ContentPlaceHolder />
        }
      </Box>
    );
  }
}
