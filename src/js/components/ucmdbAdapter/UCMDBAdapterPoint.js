// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {getIntegrationPoint, getIntegrationJob, getIntegrationJobItem,
  adapterSideBarClick, integrationJobSelect, integrationJobTabSwitch} from '../../actions/ucmdbAdapter';
import {UCMDBAdapterContainerTemplate, PointListContainer} from './PointTemplates.js';
import IntegrationJobContainer from './IntegrationJob.js';
import IntegrationJobItemContainer from './IntegrationJobItem.js';

let firstStart = true;
class UCMDBAdapterContainer extends Component {
  constructor () {
    super();
    this.getRecentPoint = this.getRecentPoint.bind(this);
    this.onMenuClick = this.onMenuClick.bind(this);
  }

  componentDidMount() {
    this.props.getIntegrationPoint();
    this.integrationPointInterval = setInterval(() => {
      this.props.getIntegrationPoint();
    },60*1000);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.params.pointName && !nextProps.params.tabName) {
      firstStart = true;
    }
    if (firstStart && nextProps.data.length > 0) {
      // find the point name from:  url > props > data
      let { pointName, tabName } = nextProps.params;
      pointName = pointName ? pointName : nextProps.pointName;
      pointName = pointName ? pointName : nextProps.data[0].name;
      const point = this.getRecentPoint(nextProps.data, pointName);

      if (point) {
        // find the tab name from:  url >  point supported tab type
        tabName = tabName ? tabName : nextProps.tabName;

        /*const supportedJobs = [];
        if (point.populationSupported) {
          supportedJobs.push('populationJobs');
        }
        if (point.pushSupported) {
          supportedJobs.push('pushJobs');
        }

        if (!supportedJobs.includes(tabName)) {
          tabName = supportedJobs[0];
        }*/
      }

      this.props.onMenuClick(pointName, tabName);
      //this.props.onTabClick(tabName, pointName);
      firstStart = false;
    } else if (nextProps.params.pointName && nextProps.params.pointName != nextProps.pointName) {
      this.props.onMenuClick(nextProps.params.pointName, nextProps.tabName);
    }
  }

  componentWillUnmount () {
    clearInterval(this.integrationPointInterval);
    firstStart = true;
  }

  onMenuClick(pointName, tabName) {
    /*const point = this.getRecentPoint(this.props.data, pointName);
    const supportedJobs = [];
    if (point.populationSupported) {
      supportedJobs.push('populationJobs');
    }
    if (point.pushSupported) {
      supportedJobs.push('pushJobs');
    }

    if (!supportedJobs.includes(tabName)) {
      tabName = supportedJobs[0];
    }*/

    this.props.onMenuClick(pointName, tabName);
    //this.props.onTabClick(tabName, pointName);
  }

  getRecentPoint(points, pointName) {
    for (let point of points) {
      if (point.name == pointName) {
        return point;
      }
    }
    return null;
  }

  render () {
    let jobList, jobItemList, pointListContainer, point;
    if (this.props.pointName) {
      pointListContainer = <PointListContainer {...this.props} onMenuClick={this.onMenuClick}/>;

      point = this.getRecentPoint(this.props.data, this.props.pointName);
    }

    if (point && this.props.tabName) {
      jobList = (
        <IntegrationJobContainer {...this.props}
          pushSupported={point.pushSupported}
          populationSupported={point.populationSupported}/>
      );
    }

    if (jobList && this.props.integrationJobName) {
      jobItemList = <IntegrationJobItemContainer {...this.props}/>;
    }

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
    onMenuClick: (pointName, tabName) => dispatch(adapterSideBarClick(pointName, tabName)),
    getIntegrationPoint: () => dispatch(getIntegrationPoint()),
    onTabClick: (tabName, pointName) => dispatch(integrationJobTabSwitch(tabName, pointName)),
    onIntegrationJobSelect: (tabName, pointName, jobName) => dispatch(integrationJobSelect(tabName, pointName, jobName)),
    getIntegrationJob: (props) => {
      const {pointName, tabName} = props;
      dispatch(getIntegrationJob(pointName, tabName));
    },
    getIntegrationJobItem: (props) => {
      const {pointName, tabName, integrationJobName} = props;
      dispatch(getIntegrationJobItem(pointName, tabName, integrationJobName));
    }
  };
};

export default connect(select, menuAction)(UCMDBAdapterContainer);
