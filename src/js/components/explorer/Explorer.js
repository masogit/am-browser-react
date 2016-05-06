import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
import * as ExplorerActions from '../../actions';
// import Accordion from '../Accordion';
import RecordList from './RecordList';

export default class Explorer extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
    this.props.dispatch(ExplorerActions.loadTemplates());
  }

  render() {
    var templates = this.props.templates;
    let currentId = this.props.params.id;
    let selectedView = templates.filter(template => template._id == currentId)[0];
    return (
      <RecordList body={selectedView.body} />
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
    record: state.explorer.record,
    links: state.explorer.links
  };
};

export default connect(select)(Explorer);
