// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {getIntegrationPoint, getIntegrationJob, getIntegrationJobItem,
  adapterSideBarClick, integrationJobSelect, integrationJobTabSwitch} from '../../actions/ucmdbAdapter';
import history from '../../RouteHistory';
import {UCMDBAdapterContainerTemplate, PointListContainer} from './Templates.js';
import IntegrationJobContainer from './IntegrationJob.js';
import IntegrationJobItemContainer from './IntegrationJobItem.js';

class UCMDBAdapterContainer extends Component {
  constructor () {
    super();
  }

  componentDidMount() {
    this.props.getIntegrationPoint();
    this.integrationPointInterval = setInterval(() => {
      this.props.getIntegrationPoint();
    },60*1000);
  }

  componentWillReceiveProps(nextProps) {
    let { pointName, tabName } = nextProps.routeParams;
    if(pointName !== nextProps.pointName || tabName !== nextProps.tabName) {
      pointName = pointName ? pointName : nextProps.pointName;
      tabName = tabName ? tabName : nextProps.tabName;
      tabName = tabName ? tabName : 'populationJobs';

      if(!pointName && nextProps.data.length > 0) {
        pointName = nextProps.data[0].name;
      }

      if(pointName) {
        this.props.onMenuClick(pointName);
        this.props.onTabClick(tabName, pointName);
      }
    }
  }

  componentWillUnmount () {
    clearInterval(this.integrationPointInterval);
  }

  render () {
    const pointListContainer = <PointListContainer {...this.props}/> ;
    const jobList = this.props.pointName ? <IntegrationJobContainer {...this.props} /> : undefined;
    const jobItemList = this.props.integrationJobName ? <IntegrationJobItemContainer {...this.props}/> : undefined;

    return (
      <UCMDBAdapterContainerTemplate
        pointList={pointListContainer}
        jobList={jobList}
        jobItemList={jobItemList}
      />
    );
  }
}

const select = (state) => {
  return {
    data: state.ucmdbAdapter.data,
    dataError: state.ucmdbAdapter.dataError,
    tabName: state.ucmdbAdapter.tabName,
    pointName: state.ucmdbAdapter.pointName,
    integrationJobData: state.ucmdbAdapter.integrationJobData,
    integrationJobDataError: state.ucmdbAdapter.integrationJobDataError,
    integrationJobName: state.ucmdbAdapter.integrationJobName,
    integrationJobItemData: state.ucmdbAdapter.integrationJobItemData,
    integrationJobItemDataError: state.ucmdbAdapter.integrationJobItemDataError
  };
};

const menuAction = (dispatch, ownProps) => {
  return {
    onMenuClick: pointName => dispatch(adapterSideBarClick(pointName)),
    getIntegrationPoint: () => dispatch(getIntegrationPoint()),

    onTabClick: (tabName, pointName) => {
      dispatch(integrationJobTabSwitch(tabName, pointName))
    },
    onIntegrationJobSelect: (tabName, pointName, jobName) => {
      dispatch(integrationJobSelect(tabName, pointName, jobName))
    },
    getIntegrationJob: (props) => {
      const {pointName, tabName} = props;
      dispatch(getIntegrationJob(pointName, tabName))
    },
    getIntegrationJobItem: (props) => {
      const {pointName, tabName, integrationJobName} = props;
      dispatch(getIntegrationJobItem(pointName, tabName, integrationJobName))
    }
  };
};

export default connect(select, menuAction)(UCMDBAdapterContainer);
