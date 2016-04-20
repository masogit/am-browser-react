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
  }

  componentDidMount() {
    this.props.dispatch(ExplorerActions.loadTemplates());
  }

  componentWillReceiveProps(nextProps) {
    let currentId = this.props.params.id;
    let nextId = nextProps.params.id;
    let { templates } = nextProps;
    if (templates && templates.length > 0) {
      if (!currentId && !nextId) { // Click navigation link, no id param.
        this.props.dispatch(ExplorerActions.loadRecords(templates[0]));
      } else if (nextId && nextId != currentId) { // Click item in the list, with link like '/views/2', '2' is the id param.
        let selectedView = templates.filter(template => template._id == nextId)[0];
        this.props.dispatch(ExplorerActions.loadRecords(selectedView));
      }
    }
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
        <RecordList template={templates[0]} records={records} {...boundActionCreators}/>
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

let select = (state, props) => {
  return {
    templates: state.explorer.templates,
    records: state.explorer.records,
    record: state.explorer.record
  };
};

export default connect(select)(Explorer);
