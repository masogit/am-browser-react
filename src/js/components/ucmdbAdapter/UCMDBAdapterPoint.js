// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as UCMDBAdapterActions from '../../actions/ucmdbAdapter';
import IntegrationJobContainer from './IntegrationJob.js';
import IntegrationJobItemContainer from './IntegrationJobItem.js';

import statusAdapter from '../../constants/StatusAdapter';
import Status from 'grommet/components/icons/Status';
import AMSideBar from '../commons/AMSideBar';
import Box from 'grommet/components/Box';
import {bindActionCreators} from 'redux';

const getRecentPoint = (points, pointName) => {
  return  points.filter(point => point.name == pointName)[0];
};

let firstStart = true;
class UCMDBAdapterContainer extends Component {
  componentDidMount() {
    this.props.actions.getIntegrationPoint();
    this.integrationPointInterval = setInterval(() => {
      this.props.actions.getIntegrationPoint();
    }, 60 * 1000);
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
      const point = getRecentPoint(nextProps.data, pointName);

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

          if (!(tabName in supportedJobs)) {
            tabName = supportedJobs[0];
          }
        }
      }

      this.props.actions.adapterSideBarClick(pointName, tabName);
      firstStart = false;
    } else if (nextProps.params.pointName && nextProps.params.pointName != nextProps.pointName) {
      this.props.actions.adapterSideBarClick(nextProps.params.pointName, nextProps.tabName);
    }
  }

  componentWillUnmount () {
    clearInterval(this.integrationPointInterval);
    firstStart = true;
  }

  render () {
    const {dataError, pointName, tabName, actions, data, loading} = this.props;
    if (dataError) {
      return (<div>{dataError}</div>);
    }

    let point, pointList, focus;
    if (pointName) {
      if (dataError) {
        pointList = <Box flex={true}>{dataError}</Box>;
      } else {
        pointList = data.map(adapter => ({
          key: adapter.name,
          groupby: adapter.adapterType,
          //onClick: this.onMenuClick.bind(this, adapter.name, this.props.tabName),
          onClick: () => {
            actions.clearJobSelection();
            actions.adapterSideBarClick(adapter.name, tabName);
          },
          search: adapter.name,
          child: adapter.name,
          icon: <Status value={statusAdapter(adapter.status).status}/>
        }));
      }

      point = getRecentPoint(data, pointName);
      focus = {expand: point.adapterType, selected: pointName};
    }

    return (
      <Box direction="row" flex={true}>
        <AMSideBar title='Integration Point' contents={pointList || []} focus={focus} loading={loading && !pointList}/>
        {point && tabName &&
        <Box pad={{horizontal: 'medium'}} flex={true} justify='between'>
          <IntegrationJobContainer {...this.props}
            pushSupported={point.pushSupported}
            populationSupported={point.populationSupported}
            onTabClick={actions.adapterSideBarClick}
            onIntegrationJobSelect={actions.integrationJobSelect}
            clearJobSelection={actions.clearJobSelection}
            clearJobItemSelection={actions.clearJobItemSelection}
            getJob={actions.getIntegrationJob}/>
          <IntegrationJobItemContainer {...this.props}
            getJobItem={actions.getIntegrationJobItem}/>
        </Box>
        }
      </Box>
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
    integrationJobItemDataError: state.ucmdbAdapter.integrationJobItemDataError,
    loading: state.ucmdbAdapter.loading
  };
};

let mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(UCMDBAdapterActions, dispatch)
});

export default connect(select, mapDispatchToProps)(UCMDBAdapterContainer);
