// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import {Table, Box} from 'grommet';
import statusAdapter from '../../constants/StatusAdapter';
import Status from 'grommet/components/icons/Status';

export default class IntegrationJobItemContainer extends Component {
  componentDidMount() {
    this.props.getJobItem();
    this.integrationJobItemInterval = setInterval(() => {
      this.props.getJobItem();
    }, 60 * 1000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pointName !== this.props.pointName || nextProps.tabName !== this.props.tabName || this.props.integrationJobName !== nextProps.integrationJobName) {
      this.props.getJobItem();
    }
  }

  componentWillUnmount() {
    clearInterval(this.integrationJobItemInterval);
  }

  render() {
    const {
      integrationJobItemDataError,
      integrationJobItemData,
      tabName
      } = this.props;

    if (integrationJobItemDataError) {
      return <Box>{integrationJobItemDataError}</Box>;
    }

    integrationJobItemData.sort((a, b) => a.name.localeCompare(b.name));

    return (
      <Table selectable={false}>
        <thead>
        <tr>
          <th>Query Name</th>
          <th>Created</th>
          <th>Updated</th>
          <th>Deleted</th>
          <th>Failed</th>
          <th>Query Status</th>
          {tabName === 'pushJobs' && <th>Start Time</th>}
          {tabName === 'pushJobs' && <th>Finish Time</th>}
        </tr>
        </thead>
        <tbody>{
          integrationJobItemData.map(data => {
            return (<tr key={data.name}>
              <td>{data.name}</td>
              <td>{data.created}</td>
              <td>{data.updated}</td>
              <td>{data.deleted}</td>
              <td>{data.failed}</td>
              <td>
                <Status value={statusAdapter(data.status).status}/>
                <span>{statusAdapter(data.status).text}</span>
              </td>
              {tabName === 'pushJobs' && <td>{data.startTime}</td>}
              {tabName === 'pushJobs' && <td>{data.stopTime}</td>}
            </tr>);
          })
        }
        </tbody>
      </Table>
    );
  }
}
