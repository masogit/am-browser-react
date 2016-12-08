// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import React, { Component } from 'react';
import ActionTab from './../commons/ActionTab.js';
import {Tabs, Table, Box} from 'grommet';
import Status from 'grommet/components/icons/Status';
import statusAdapter from '../../constants/StatusAdapter';
import _ from 'lodash';
import Spinning from 'grommet/components/icons/Spinning';

export default class IntegrationJobContainer extends Component {
  componentDidMount() {
    const {pointName, tabName} = this.props;
    this.setInterval(this.props.getJob, pointName, tabName);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tabName && (this.props.pointName !== nextProps.pointName || this.props.tabName !== nextProps.tabName)
      || nextProps.params.tabName && nextProps.params.tabName != nextProps.tabName) {
      this.props.clearJobSelection();
      this.setInterval(this.props.getJob, nextProps.pointName, nextProps.tabName);
    }
  }

  componentWillUnmount () {
    clearInterval(this.Interval);
  }

  setInterval(func, pointName, tabName) {
    clearInterval(this.Interval);
    func(pointName, tabName);
    this.Interval = setInterval(() => {
      func(pointName, tabName);
    }, 60 * 1000);
  }

  getJobTable() {
    const {
      integrationJobData,
      pointName,
      tabName,
      integrationJobName,
      onIntegrationJobSelect,
      clearJobItemSelection
      } = this.props;

    integrationJobData.sort((a, b) => a.name.localeCompare(b.name));
    const selected = _.findIndex(integrationJobData, ((item) => item.name == integrationJobName));
    const onSelect = (selected) => {
      clearJobItemSelection();
      onIntegrationJobSelect(tabName, pointName, integrationJobData[selected].name);
    };

    return (
      <Table selectable={true} selected={[selected]} onSelect={onSelect}>
        <thead>
        <tr>
          <th>Job Name</th>
          <th>Status</th>
          {tabName === 'populationJobs' && <th>Start Time</th>}
          {tabName === 'populationJobs' && <th>Finish Time</th>}
          {tabName === 'pushJobs' && <th>Last Synchronization Type</th>}
        </tr>
        </thead>
        <tbody>{
          integrationJobData.map((data) => {
            return (
              <tr key={data.name}>
                <td>{data.name}</td>
                <td>
                  <Status value={statusAdapter(data.status).status}/>
                  <span>{statusAdapter(data.status).text}</span>
                </td>
                {tabName === 'populationJobs' && <td>{data.startTime}</td>}
                {tabName === 'populationJobs' && <td>{data.stopTime}</td>}
                {tabName === 'pushJobs' && <td>{data.isFullSynchronization ? 'Full' : 'Changes'}</td>}
              </tr>
            );
          })
        }
        </tbody>
      </Table>
    );
  }

  render () {
    const {integrationJobDataError,
      integrationJobData,
      tabName,
      pointName,
      pushSupported,
      populationSupported,
      clearJobItemSelection,
      clearJobSelection,
      onTabClick,
      loading
      } = this.props;

    const jobTable = loading && integrationJobData.length == 0 ? <Spinning/> : (integrationJobDataError ? <Box>{integrationJobDataError}</Box> : this.getJobTable());
    const activeIndex = tabName === 'populationJobs' ? 0: 1;
    return (
      <Tabs justify="start" activeIndex={activeIndex}>
        <ActionTab title="Population" onClick={() => {
          clearJobSelection();
          clearJobItemSelection();
          onTabClick(pointName, 'populationJobs');
        }}
                   disabled={!populationSupported}>
          {jobTable}
        </ActionTab>
        <ActionTab title="Data Push" onClick={() => {
          clearJobSelection();
          clearJobItemSelection();
          onTabClick(pointName, 'pushJobs');
        }}
                   disabled={!pushSupported}>
          {jobTable}
        </ActionTab>
      </Tabs>
    );
  }
}
