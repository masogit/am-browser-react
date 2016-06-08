/**
 * Created by huling on 5/9/2016.
 */

import {statusAdapter} from '../../constants/StatusAdapter.js';
var Status = require('grommet/components/icons/Status');
import {Tabs, Table, Box} from 'grommet';
import ActionTab from './../commons/ActionTab.js';
import React from 'react';
import _ from 'lodash';

const IntegrationJobTable = ({
  integrationJobDataError,
  integrationJobData,
  tabName,
  integrationJobName,
  onIntegrationJobSelect
  }) => {
  if (integrationJobDataError) {
    return (<Box>{integrationJobDataError}</Box>);
  }

  if (integrationJobData.length === 0) {
    return (<Box><h2>No data to display!</h2></Box>);
  }

  let tableHeader, tableBody;
  if (tabName === 'populationJobs') {
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

    tableBody = (
      <tbody>{
        integrationJobData.map((data) => {
          return (
            <tr key={data.name}>
              <td>{data.name}</td>
              <td>
                <Status value={statusAdapter[data.status].status}/>
                <span>{statusAdapter[data.status].text}</span>
              </td>
              <td>{data.startTime}</td>
              <td>{data.stopTime}</td>
            </tr>
          );
        })
      }
      </tbody>
    );
  } else if (tabName === 'pushJobs') {
    tableHeader = (
      <thead>
      <tr>
        <th>Job Name</th>
        <th>Status</th>
        <th>Last Synchronization Type</th>
      </tr>
      </thead>
    );
    tableBody = (
      <tbody>{
        integrationJobData.map((data) => (
            <tr key={data.name}>
              <td>{data.name}</td>
              <td>
                <Status value={statusAdapter[data.status].status}/>
                <span>{statusAdapter[data.status].text}</span>
              </td>
              <td>{data.isFullSynchronization ? 'Full' : 'Changes'}</td>
            </tr>
          )
        )
      }
      </tbody>
    );
  }

  const selected = _.findIndex(integrationJobData, ((item) => item.name == integrationJobName));
  return (
    <Table selectable={true} selected={[selected]} onSelect={onIntegrationJobSelect}>
      {tableHeader}
      {tableBody}
    </Table>
  );
};


export const IntegrationJobTemplate = ({
  integrationJobDataError,
  integrationJobData,
  pointName,
  tabName,
  integrationJobName,
  pushSupported,
  populationSupported,
  onIntegrationJobSelect,
  onTabClick
  }) => {
  integrationJobData.sort((a,b) => a.name.localeCompare(b.name));
  return (
    <Tabs justify="start" initialIndex={tabName === 'populationJobs' ? 0: 1}>
      <ActionTab title="Population" onClick={() => onTabClick('populationJobs')} disabled={!populationSupported}>
        <IntegrationJobTable
          tabName={tabName}
          integrationJobData={integrationJobData}
          integrationJobDataError={integrationJobDataError}
          integrationJobName={integrationJobName}
          onIntegrationJobSelect={(selected) => onIntegrationJobSelect(tabName, pointName, integrationJobData[selected].name)}/>
      </ActionTab>
      <ActionTab title="Data Push" onClick={() => onTabClick('pushJobs')} disabled={!pushSupported}>
        <IntegrationJobTable
          tabName={tabName}
          integrationJobData={integrationJobData}
          integrationJobDataError={integrationJobDataError}
          integrationJobName={integrationJobName}
          onIntegrationJobSelect={(selected) => onIntegrationJobSelect(tabName, pointName, integrationJobData[selected].name)}/>
      </ActionTab>
    </Tabs>
  );
};
