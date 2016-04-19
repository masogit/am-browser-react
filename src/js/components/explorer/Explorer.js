import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as ExplorerActions from '../../actions';
import Split from 'grommet/components/Split';
import Accordion from '../Accordion';
import RecordList from './RecordList';
import RecordDetail from './RecordDetail';

export default class Explorer extends Component {

  constructor() {
    super();
    this._onSearch = this._onSearch.bind(this);
  }

  componentDidMount() {
    this.props.actions.loadTemplates();
  }

  componentWillReceiveProps(nextProps) {
    let currentId = this.props.params.id;
    let nextId = nextProps.params.id;
    let { templates } = nextProps;
    if (templates && templates.length > 0) {
      if (!currentId && !nextId) { // Click navigation link, no id param.
        this.props.actions.loadRecords(templates[0]);
      } else if (nextId && nextId != currentId) { // Click item in the list, with link like '/views/2', '2' is the id param.
        let selectedView = templates.filter(template => template.$loki == nextId)[0];
        this.props.actions.loadRecords(selectedView);
      }
    }
  }

  _onSearch(value) {
    console.log(value);
  }

  _onListClick(template, record) {
    this.props.actions.loadDetailRecord(template, record);
  }

  render() {
    var templates = this.props.templates;
    var records = this.props.records;
    var record = this.props.record;
    let { dispatch } = this.props;
    let boundActionCreators = bindActionCreators(ExplorerActions, dispatch);
    return (
      <Split flex="right">
        <Accordion views={templates} isFetching={false} type="explorer"/>
        <RecordList records={records} {...boundActionCreators}/>
        <RecordDetail record={record} {...boundActionCreators}/>
      </Split>
    );
  }
}

Explorer.propTypes = {
  templates: PropTypes.array.isRequired,
  records: PropTypes.array.isRequired,
  record: PropTypes.array.isRequired
};

let mapStateToProps = (state) => {
  return {
    templates: state.explorer.templates,
    records: state.explorer.records,
    record: state.explorer.record
  };
};

let mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(ExplorerActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Explorer);
