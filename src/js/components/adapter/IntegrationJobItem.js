// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import Table from 'grommet/components/Table';
var Status = require('grommet/components/icons/Status');
import { connect } from 'react-redux';
import { getIntegrationJobItem } from '../../actions';
import {statusAdapter} from '../../constants/StatusAdapter.js';

class IntegrationJobItem extends Component {

  constructor () {
    super();
  }

  componentDidMount() {
    const {dispatch, selectedLinkName, tabName, integrationJobName} = this.props;
    dispatch(getIntegrationJobItem(selectedLinkName, tabName, integrationJobName));
    this.integrationJobItemInterval = setInterval(() => {
      dispatch(getIntegrationJobItem(this.props.selectedLinkName, this.props.tabName, this.props.integrationJobName));
    },60*1000);
  }

  componentWillReceiveProps(nextProps) {
    const {dispatch, selectedLinkName, tabName, integrationJobName} = this.props;
    if (integrationJobName !== nextProps.integrationJobName) {
      dispatch(getIntegrationJobItem(selectedLinkName, tabName, nextProps.integrationJobName));
    }
  }

  componentWillUnmount () {
    clearInterval(this.integrationJobItemInterval);
  }

  render () {
    const {integrationJobItemData, tabName, integrationJobItemDataError} = this.props;
    let statisticsHeader, bodyData;
    integrationJobItemData.sort((a,b) => a.name.localeCompare(b.name));
    if (tabName === 'populationJobs') {
      statisticsHeader = (
          <thead>
          <tr>
            <th>Query Name</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Deleted</th>
            <th>Failed</th>
            <th>Query Status</th>
          </tr>
          </thead>
      );
      bodyData = integrationJobItemData.map((data) => {
        return (
            <tr>
              <td>{data.name}</td>
              <td>{data.created}</td>
              <td>{data.updated}</td>
              <td>{data.deleted}</td>
              <td>{data.failed}</td>
              <td>
                <Status value={statusAdapter[data.status]}/>
                <span>{data.status}</span>
              </td>
            </tr>
        );
      });
    } else {
      statisticsHeader = (
          <thead>
          <tr>
            <th>Query Name</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Deleted</th>
            <th>Failed</th>
            <th>Query Status</th>
            <th>Start Time</th>
            <th>Finish Time</th>
          </tr>
          </thead>
      );
      bodyData = integrationJobItemData.map((data) => {
        return (
            <tr>
              <td>{data.name}</td>
              <td>{data.created}</td>
              <td>{data.updated}</td>
              <td>{data.deleted}</td>
              <td>{data.failed}</td>
              <td>
                <Status value={statusAdapter[data.status]}/>
                <span>{data.status}</span>
              </td>
              <td>{new Date(data.startTime).toDateString()}</td>
              <td>{new Date(data.stopTime).toDateString()}</td>
            </tr>
        );
      });
    }
    let tableBody = (
        <tbody>
        {bodyData}
        </tbody>
    );
    return (
        <div className="integrationJobItemTable">
          {
            integrationJobItemDataError && integrationJobItemDataError
          }
          {
            integrationJobItemData.length === 0 && !integrationJobItemDataError &&
            <h2>No data to display!</h2>
          }
          {
            integrationJobItemData.length > 0 && !integrationJobItemDataError &&
            <Table selectable={false}>
              {statisticsHeader}
              {tableBody}
            </Table>
          }
        </div>
    );
  }
}
let select = (state, props) => {
  return {
    integrationJobName: state.adapter.integrationJobName,
    tabName: state.adapter.tabName,
    selectedLinkName: state.adapter.selectedLinkName,
    integrationJobItemData: state.adapter.integrationJobItemData,
    integrationJobItemDataError: state.adapter.integrationJobItemDataError
  };
};

export default connect(select)(IntegrationJobItem);
