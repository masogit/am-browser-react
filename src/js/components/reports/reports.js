import React, {Component} from 'react';
import { Box, Anchor, Header, Menu, Form, FormField} from 'grommet';
import AMSideBar from '../commons/AMSideBar';
import * as ReportActions from '../../actions/reports';
import Checkmark from 'grommet/components/icons/base/Checkmark';
import Add from 'grommet/components/icons/base/Add';
import Close from 'grommet/components/icons/base/Close';
import ContentPlaceHolder from '../../components/commons/ContentPlaceHolder';
import _ from 'lodash';
import { monitorEdit, dropCurrentPop } from '../../actions/system';
import body from './body_template.json';
import records from './records_template.json';
import PDFGenerator from './PDFGenerator.js';

export default class Reports extends Component {

  constructor() {
    super();
    this.state = {
      reports:[],
      categories: [],
      report: {

      }
    };
    this.initReport={
      name: '',
      category: ''
    };

    this._dropCurrentPop = this._dropCurrentPop.bind(this);
  }

  componentDidMount() {
    this._loadReports();
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

  _onSaveReport() {
    ReportActions.saveReport(this.state.report).then(id => {
      if (id) {
        this._loadReports(this);
        this._initReport();
      }
    });
  }

  _onRemoveReport() {
    ReportActions.removeReport(this.state.report._id).then(id => {
      if (id) {
        this._loadReports();
        this.setState({
          report: this.initReport
        });
      }
    });
  }

  _setFormValues(event) {
    const val = event.target.value;
    const path = event.target.name;
    const obj = this.state.report;

    obj[path] = val;
    this.setState({report: obj});
  }
  _querySelectedReport(report) {
    this.state.report = report;
    ReportActions.loadReport(report._id).then((res) => {
      this.setState({
        report: res
      });
    });
  }

  _initReport(callback) {
    this.setState({
      report: _.cloneDeep(this.initReport)
    },callback);
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
    const toolbar = <Anchor icon={<Add />} label="New" onClick={this._onNew.bind(this)}/>;
    const contents = this.state.reports.map((report) => ({
      key: report._id,
      groupby: report.category,
      child: report.name,
      search: report.name,
      onClick: () => {
        this._querySelectedReport(report);
      }
    }));
    const focus = this.state.report && {expand: this.state.report.category, selected: this.state.report._id};

    return (
      <Box direction="row" flex={true}>
        <AMSideBar title='Reports' toolbar={toolbar} contents={contents} focus={focus}/>
        {!_.isEmpty(this.state.report)?
          <PDFGenerator body={body} records={records} onSaveReport={this._onSaveReport}
                        onRemoveReport={this._onRemoveReport}/>
          : <ContentPlaceHolder />
        }
      </Box>
    );
  }
}
