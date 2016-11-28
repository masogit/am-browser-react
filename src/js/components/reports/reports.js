import React, { PropTypes} from 'react';
import { Box, Anchor } from 'grommet';
import AMSideBar from '../commons/AMSideBar';
import * as ReportActions from '../../actions/reports';
import Add from 'grommet/components/icons/base/Add';
import ContentPlaceHolder from '../../components/commons/ContentPlaceHolder';
import ComponentBase from '../../components/commons/ComponentBase';
import _ from 'lodash';
import { monitorEdit, dropCurrentPop, stopMonitorEdit } from '../../actions/system';
import example_body from './body_template.json';
import example_records from './records_template.json';
import PDFDesigner from './PDFDesigner.js';
import {defaultSettings, defaultPDFDefinition} from '../../constants/PDFDesigner';
import * as ExplorerActions from '../../actions/explorer';

const category_PUBLIC = 'Public';
const category_PERSONAL = 'Personal';
export default class Reports extends ComponentBase {
  componentWillMount() {
    this.state = {
      reports:[],
      categories: [],
      report: {}
    };

    this.initReport = {
      name: '',
      category: this.props.fromView ? category_PERSONAL : category_PUBLIC,
      public: !this.props.fromView,
      settings: defaultSettings
    };

    this._dropCurrentPop = this._dropCurrentPop.bind(this);
    this._onSaveReport = this._onSaveReport.bind(this);
    this._onRemoveReport = this._onRemoveReport.bind(this);
    this._onDupReport = this._onDupReport.bind(this);
    this._initReport = this._initReport.bind(this);
    this.isChanged = this.isChanged.bind(this);
    this.resetOrigin = this.resetOrigin.bind(this);
    this.getLinkRecords = this.getLinkRecords.bind(this);
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

  _onSaveReport(report, callback) {
    ReportActions.saveReport(report).then(id => {
      if (id) {
        stopMonitorEdit();
        this._loadReports();
        this.state.report._id = id;
        this.setState({report: this.state.report}, this.resetOrigin);
      }
    });
  }

  _onDupReport(report, callback) {
    this._dropCurrentPop('Duplicate a pdf template?', () => {
      this._initReport(() => {
        this.resetOrigin();
        report.category = this.props.fromView ? category_PERSONAL : category_PUBLIC;
        report.public = !this.props.fromView;
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
    this.originReport = _.cloneDeep(report);
    ReportActions.loadReport(report._id).then((res) => {
      this.setState({
        report: res
      }, this.resetOrigin);
    });
  }

  _onNew() {
    this._dropCurrentPop('Create a new pdf template?', () =>{
      this._initReport(this.resetOrigin);
    });
  }

  isChanged() {
    return !_.isEqual(this.originReport, this.state.report);
  }

  resetOrigin() {
    const report = this.state.report;
    this.originReport = _.cloneDeep(report);
    monitorEdit(this.originReport, report);
  }

  _dropCurrentPop(title, onConfirm) {
    const originReport = this.state.reports.filter(report => report._id == this.state.report._id)[0];
    const currentReport = _.cloneDeep(this.state.report);

    dropCurrentPop(originReport, currentReport, this.initReport, title, onConfirm);
  }

  getLinkRecords() {
    const links = this.props.links;
    links.map(link => {
      this.addPromise(ExplorerActions.loadRecordsByBody(link.body));
    });

    Promise.all(this.promiseList).then(result => {
      console.log(result);
    });
  }

  render() {
    const {reports, report} = this.state;
    const {fromView, body = example_body, records = example_records, isDetail, links, record, groupByData} = this.props;

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
          <PDFDesigner body={body} records={records} onSaveReport={this._onSaveReport} links={links} record={record}
                        definition={defaultPDFDefinition} onDupReport={this._onDupReport} root={!fromView} isChanged={this.isChanged()}
                        report={report} onRemoveReport={this._onRemoveReport} isDetail={isDetail} groupByData={groupByData} />
          : <ContentPlaceHolder />
        }
      </Box>
    );
  }
}

Reports.defaultProps = {
  isDetail: false
};

Reports.propTyps = {
  body: PropTypes.object.required,
  records: PropTypes.array,
  settings: PropTypes.object.required,
  record: PropTypes.object,
  definition: PropTypes.object.required,
  isDetail: PropTypes.bool.required
};
