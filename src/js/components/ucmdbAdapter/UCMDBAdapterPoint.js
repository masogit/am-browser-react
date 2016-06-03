// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as UCMDBAdapterActions from '../../actions/ucmdbAdapter';
import IntegrationJobContainer from './IntegrationJob.js';
import IntegrationJobItemContainer from './IntegrationJobItem.js';

import {statusAdapter} from '../../constants/StatusAdapter.js';
var Status = require('grommet/components/icons/Status');
import SideBar from '../commons/SideBar';
import {Container, Content} from '../commons/Split';

let firstStart = true;
class UCMDBAdapterContainer extends Component {
  constructor () {
    super();
    this.getRecentPoint = this.getRecentPoint.bind(this);
    this.onMenuClick = this.onMenuClick.bind(this);
  }

  componentDidMount() {
    this._getPoints();
    this.integrationPointInterval = setInterval(() => {
      this._getPoints();
    },60*1000);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.params.pointName && !nextProps.params.tabName) {
      firstStart = true;
    }
    if (firstStart && nextProps.data.length > 0) {
      // find the point name from:  url > props > data
      let { pointName, tabName } = nextProps.params;
      pointName = pointName || nextProps.pointName;
      pointName = pointName || nextProps.data[0].name;
      const point = this.getRecentPoint(nextProps.data, pointName);

      if (point) {
        // find the tab name from:  url >  point supported tab type
        tabName = tabName || nextProps.tabName;

        if (!tabName) {
          const supportedJobs = [];
          if (point.populationSupported) {
            supportedJobs.push('populationJobs');
          }
          if (point.pushSupported) {
            supportedJobs.push('pushJobs');
          }

          if (!supportedJobs.includes(tabName)) {
            tabName = supportedJobs[0];
          }
        }
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

  _getPoints() {
    UCMDBAdapterActions.getIntegrationPoint(this.props.getIntegrationPoint);
  }

  _getJob() {
    const {pointName, tabName, getIntegrationJob} = this.props;
    UCMDBAdapterActions.getIntegrationJob(pointName, tabName, getIntegrationJob);
  }

  _getJobItem() {
    const {pointName, tabName, integrationJobName, getIntegrationJobItem} = this.props;
    UCMDBAdapterActions.getIntegrationJobItem(pointName, tabName, integrationJobName, getIntegrationJobItem);
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
    if (this.props.dataError) {
      return (<div>{this.props.dataError}</div>);
    }

    let jobList, jobItemList, point, pointList, focus;
    if (this.props.pointName) {
      if (this.props.dataError) {
        pointList = <div>{this.props.dataError}</div>;
      } else {
        pointList = this.props.data.map(adapter => ({
          key: adapter.name,
          groupby: adapter.adapterType,
          onClick: this.onMenuClick.bind(this, adapter.name, this.props.tabName),
          search: adapter.name,
          child: adapter.name,
          icon: <Status value={statusAdapter[adapter.status].status}/>
        }));
      }

      point = this.getRecentPoint(this.props.data, this.props.pointName);
      focus = {expand: point.adapterType, selected: this.props.pointName};
    }

    if (point && this.props.tabName) {
      jobList = (
        <IntegrationJobContainer {...this.props}
          pushSupported={point.pushSupported}
          populationSupported={point.populationSupported}
          getJob={this._getJob.bind(this)}/>
      );
    }

    if (jobList && this.props.integrationJobName) {
      jobItemList = <IntegrationJobItemContainer {...this.props} getJobItem={this._getJobItem.bind(this)}/>;
    }

    return (
      <Container>
        <SideBar title='Integration Point' contents={pointList} focus={focus}/>
        <Content justify='between'>
          {jobList}
          {jobItemList}
        </Content>
      </Container>
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
    onMenuClick: (pointName, tabName) => dispatch(UCMDBAdapterActions.adapterSidebarClick(pointName, tabName)),
    getIntegrationPoint: (data, error) => dispatch(UCMDBAdapterActions.adapterDataFetch(data, error)),
    onTabClick: (tabName, pointName) => dispatch(UCMDBAdapterActions.integrationJobTabSwitch(tabName, pointName)),
    onIntegrationJobSelect: (tabName, pointName, jobName) => dispatch(UCMDBAdapterActions.integrationJobSelect(tabName, pointName, jobName)),
    getIntegrationJob: (points, error) => dispatch(UCMDBAdapterActions.integrationJobDataSuccess(points, error)),
    getIntegrationJobItem: (jobStatuses, error) => dispatch(UCMDBAdapterActions.integrationJobItemDataSuccess(jobStatuses, error))
  };
};

export default connect(select, menuAction)(UCMDBAdapterContainer);
