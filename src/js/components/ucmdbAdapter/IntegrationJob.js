// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getIntegrationJob, integrationJobSelect, integrationJobTabSwitch } from '../../actions';
import {IntegrationJobContainer} from './Templates.js';


class IntegrationJob extends Component {

  constructor () {
    super();
  }

  componentDidMount() {
    const {pointName, tabName} = this.props;
    this.props.getIntegrationJob(pointName, tabName);
    this.integrationJobInterval = setInterval(() => {
      this.props.getIntegrationJob(this.props.pointName, this.props.tabName);
    },60*1000);
  }

  componentWillReceiveProps(nextProps) {
    const {pointName, tabName} = this.props;
    if (pointName !== nextProps.pointName || tabName !== nextProps.tabName) {
      if (pointName !== nextProps.pointName) {
        this.props.getIntegrationJob(nextProps.pointName, tabName);
      } else {
        this.props.getIntegrationJob(pointName, nextProps.tabName);
      }
    }
  }

  componentWillUnmount () {
    clearInterval(this.integrationJobInterval);
  }

  render () {
    return (
      <IntegrationJobContainer {...this.props}/>
    );
  }
}
let select = (state) => {
  return {
    tabName: state.ucmdbAdapter.tabName,
    pointName: state.ucmdbAdapter.pointName,
    integrationJobData: state.ucmdbAdapter.integrationJobData,
    integrationJobDataError: state.ucmdbAdapter.integrationJobDataError,
    integrationJobName: state.ucmdbAdapter.integrationJobName
  };
};

const integrationJobAction = (dispatch, ownProps) => {
  return {
    onIntegrationJobSelect: (pointName, jobType, jobName) => dispatch(integrationJobSelect(jobType, pointName, jobName)),
    onTabClick: (pointName, tabName) => {
      dispatch(integrationJobTabSwitch(pointName, tabName));
    },
    getIntegrationJob: (pointName, tabName) => {
      return dispatch(getIntegrationJob(pointName, tabName));
    }
  };
};

export default connect(select, integrationJobAction)(IntegrationJob);
