// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import Table from 'grommet/components/Table';
import Tabs from 'grommet/components/Tabs';
import CustomTab from './CustomTab.js';
var Status = require('grommet/components/icons/Status');
import Split from 'grommet/components/Split';
import { connect } from 'react-redux';
import { getIntegrationJob, integrationJobSelect, integrationJobTabSwitch } from '../../actions';
import {statusAdapter} from '../../constants/StatusAdapter.js';


class IntegrationJob extends Component {

  constructor () {
    super();
    this._onIntegrationJobSelect = this._onIntegrationJobSelect.bind(this);
  }

  componentDidMount() {
    const {dispatch, selectedLinkName, tabName} = this.props;
    dispatch(getIntegrationJob(selectedLinkName, tabName));
    this.integrationJobInterval = setInterval(() => {
      dispatch(getIntegrationJob(this.props.selectedLinkName, this.props.tabName));
    },60*1000);
  }

  componentWillReceiveProps(nextProps) {
    const {selectedLinkName, tabName} = this.props;
    if (selectedLinkName !== nextProps.selectedLinkName || tabName !== nextProps.tabName) {
      if (selectedLinkName !== nextProps.selectedLinkName) {
        this.props.dispatch(getIntegrationJob(nextProps.selectedLinkName, tabName));
      } else {
        this.props.dispatch(getIntegrationJob(selectedLinkName, nextProps.tabName));
      }
    }
  }

  componentWillUnmount () {
    clearInterval(this.integrationJobInterval);
  }

  _onIntegrationJobSelect(selected) {
    const {dispatch, selectedLinkName, integrationJobData, tabName} = this.props;
    let integrationJobName = integrationJobData[selected].name;
    dispatch(integrationJobSelect(tabName, selectedLinkName, integrationJobName));
  }

  _onTabClick(tabName) {
    const {dispatch, selectedLinkName} = this.props;
    dispatch(integrationJobTabSwitch(selectedLinkName, tabName));
  }

  render () {
    const {integrationJobData, tabName, integrationJobDataError} = this.props;
    let bodyData, tableBody, tableHeader;
    integrationJobData.sort((a,b) => a.name.localeCompare(b.name));
    if (this.props.tabName === 'populationJobs') {
      tableHeader = (
          <thead>
          <tr>
            <th>Job Name</th>
            <th>Status</th>
            <th>Start Time</th>
            <th>Finish Time</th>
          </tr>
          </thead>
      );
      bodyData = integrationJobData.map((data) => {
        return (
            <tr key={data.name}>
              <td>{data.name}</td>
              <td>
                <Status value={statusAdapter[data.status]}/>
                <span>{data.status}</span>
              </td>
              <td>{new Date(data.startTime).toDateString()}</td>
              <td>{new Date(data.stopTime).toDateString()}</td>
            </tr>
        );
      });
      tableBody = (
          <tbody>
          {bodyData}
          </tbody>
      );
    } else {
      tableHeader = (
          <thead>
          <tr>
            <th>Job Name</th>
            <th>Status</th>
            <th>isFullSynchronization</th>
          </tr>
          </thead>
      );
      bodyData = integrationJobData.map((data) => {
        return (
            <tr key={data.name}>
              <td>{data.name}</td>
              <td>
                <Status value={statusAdapter[data.status]}/>
                <span>{data.status}</span>
              </td>
              <td>{`${data.isFullSynchronization}`}</td>
            </tr>
        );
      });
      tableBody = (
          <tbody>
          {bodyData}
          </tbody>
      );
    }
    return (
        <Tabs justify="start" initialIndex={tabName === 'populationJobs' ? 0: 1}>
          <CustomTab title="Population" clickHandler={this._onTabClick.bind(this, "populationJobs")}>
            <Split separator={true}>
              <div className="integrationJobTable">
                {
                  integrationJobData.length === 0 && !integrationJobDataError &&
                  <h2>No data to display!</h2>
                }
                {
                  integrationJobDataError && integrationJobDataError
                }
                {
                  integrationJobData.length > 0 && !integrationJobDataError &&
                  <Table selectable={true} onSelect={this._onIntegrationJobSelect}>
                    {tableHeader}
                    {tableBody}
                  </Table>
                }
              </div>
              {this.props.children}
            </Split>
          </CustomTab>
          <CustomTab title="Data Push" clickHandler={this._onTabClick.bind(this, "pushJobs")}>
            <Split flex="both" separator={true}>
              <div className="integrationJobTable">
                {
                  integrationJobData.length === 0 && !integrationJobDataError &&
                  <h2>No data to display!</h2>
                }
                {
                  integrationJobDataError && integrationJobDataError
                }
                {
                  integrationJobData.length > 0 && !integrationJobDataError &&
                  <Table selectable={true} onSelect={this._onIntegrationJobSelect}>
                    {tableHeader}
                    {tableBody}
                  </Table>
                }
              </div>
              {this.props.children}
            </Split>
          </CustomTab>
        </Tabs>
    );
  }
}
let select = (state) => {
  return {
    tabName: state.adapter.tabName,
    selectedLinkName: state.adapter.selectedLinkName,
    integrationJobData: state.adapter.integrationJobData,
    integrationJobDataError: state.adapter.integrationJobDataError,
    integrationJobName: state.adapter.integrationJobName
  };
};

export default connect(select)(IntegrationJob);
