// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import ActionTab from './../commons/ActionTab.js';
import {Tabs, Table, Box} from 'grommet';
import Status from 'grommet/components/icons/Status';
import statusAdapter from '../../constants/StatusAdapter';

export default class IntegrationJobContainer extends Component {
  componentDidMount() {
    this.props.getJob();
    this.integrationJobInterval = setInterval(() => {
      this.props.getJob();
    }, 60 * 1000);
  }

  componentWillReceiveProps(nextProps) {
    if ( nextProps.tabName && (this.props.pointName !== nextProps.pointName || this.props.tabName !== nextProps.tabName)) {
      this.props.getJob(nextProps);
    } else if (nextProps.params.tabName && nextProps.params.tabName != nextProps.tabName) {
      // if use change url manually
      this.props.onTabClick(nextProps.params.tabName, nextProps.pointName);
    }
  }

  componentWillUnmount () {
    clearInterval(this.integrationJobInterval);
  }

  getJobTable() {
    const {
      integrationJobData,
      pointName,
      tabName,
      integrationJobName,
      onIntegrationJobSelect
      } = this.props;

    integrationJobData.sort((a, b) => a.name.localeCompare(b.name));
    const selected = _.findIndex(integrationJobData, ((item) => item.name == integrationJobName));
    const onSelect = (selected) => onIntegrationJobSelect(tabName, pointName, integrationJobData[selected].name);
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
      tabName,
      pointName,
      pushSupported,
      populationSupported
      } = this.props;

    return (
      <Tabs justify="start" initialIndex={tabName === 'populationJobs' ? 0: 1}>
        <ActionTab title="Population" onClick={this.props.onTabClick.bind(this, 'populationJobs', pointName)}
                   disabled={!populationSupported}>
          {integrationJobDataError ? <Box>{integrationJobDataError}</Box> : this.getJobTable()}
        </ActionTab>
        <ActionTab title="Data Push" onClick={this.props.onTabClick.bind(this, 'pushJobs', pointName)}
                   disabled={!pushSupported}>
          {integrationJobDataError ? <Box>{integrationJobDataError}</Box> : this.getJobTable()}
        </ActionTab>
      </Tabs>
    );
  }
}
