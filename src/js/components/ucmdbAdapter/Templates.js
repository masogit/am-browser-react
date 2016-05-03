/**
 * Created by huling on 5/3/2016.
 */

import Split from 'grommet/components/Split';
import React from 'react';
var Status = require('grommet/components/icons/Status');
var Sidebar = require('grommet/components/Sidebar');
var Menu = require('grommet/components/Menu');
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import { Link } from 'react-router';
import Table from 'grommet/components/Table';
import {statusAdapter} from '../../constants/StatusAdapter.js';
import Tabs from 'grommet/components/Tabs';
import CustomTab from './CustomTab.js';

const MenuItem = ({
  name,
  status,
  tabName,
  onMenuClick
  }) => {
  return (
    <Link to={`/ucmdbAdapter/${tabName}/${name}`} activeClassName="active" onClick={() => onMenuClick(name)}>
      <Status value={statusAdapter[status]}/>
      <span>{name}</span>
    </Link>
  );
};

export const UCMDBAdapter = ({
  dataError,
  data,
  tabName,
  onMenuClick,
  children
  }) => (
  <Split flex="right" separator={true} priority="left" fixed={false}>
    {!dataError &&
    <Sidebar colorIndex="light-2" className="adapterSideBar">
      <Header pad="medium" justify="between">
        <Title>Integration Point</Title>
      </Header>
      <Menu primary={true}>
        {
          data.map(adapter => (
            <MenuItem key={adapter.name}
                    status={adapter.status}
                    name={adapter.name}
                    tabName={tabName}
                    onMenuClick={onMenuClick}/>
          ))
        }
      </Menu>
    </Sidebar>
    }
    {dataError && dataError}
    {children}
  </Split>
);

const IntegrationJobTable = ({
  integrationJobDataError,
  integrationJobData,
  tabName,
  onIntegrationJobSelect
  }) => {
  if(integrationJobDataError) {
    return integrationJobDataError;
  }

  if(integrationJobData.length === 0) {
    return <h2>No data to display!</h2>;
  }

  const populationTableHeader = (
    <thead>
    <tr>
      <th>Job Name</th>
      <th>Status</th>
      <th>Start Time</th>
      <th>Finish Time</th>
    </tr>
    </thead>
  );

  const populationTableBody = (
    <tbody>{
      integrationJobData.map((data) => {
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
      })
    }
    </tbody>
  );

  const pushTableHeader = (
    <thead>
    <tr>
      <th>Job Name</th>
      <th>Status</th>
      <th>isFullSynchronization</th>
    </tr>
    </thead>
  );
  const pushTableBody = (
    <tbody>{
      integrationJobData.map((data) => {
        return (
          <tr key={data.name}>
            <td>{data.name}</td>
            <td>
              <Status value={statusAdapter[data.status]}/>
              <span>{data.status}</span>
            </td>
            <td>{data.isFullSynchronization}</td>
          </tr>
        );
      })
    }
    </tbody>
  );

  return (
    <Table selectable={true} onSelect={onIntegrationJobSelect}>
      {tabName === 'populationJobs' ? populationTableHeader : pushTableHeader}
      {tabName === 'populationJobs' ? populationTableBody : pushTableBody}
    </Table>
  );
};

export const IntegrationJobContainer = ({
  integrationJobDataError,
  integrationJobData,
  pointName,
  tabName,
  onIntegrationJobSelect,
  onTabClick,
  children
  }) => {
  integrationJobData.sort((a,b) => a.name.localeCompare(b.name));
  return (
    <Tabs justify="start" initialIndex={tabName === 'populationJobs' ? 0: 1}>
      <CustomTab title="Population" onClick={() => onTabClick(pointName, 'populationJobs')} >
        <Split flex="both" separator={true}>
          <div className="integrationJobTable">
            <IntegrationJobTable
              tabName={tabName}
              integrationJobData={integrationJobData}
              integrationJobDataError={integrationJobDataError}
              onIntegrationJobSelect={(selected) => onIntegrationJobSelect(pointName, tabName, integrationJobData[selected].name)}/>
          </div>
          {children}
        </Split>
      </CustomTab>
      <CustomTab title="Data Push" onClick={() => onTabClick(pointName, 'pushJobs')} >
        <Split flex="both" separator={true}>
          <div className="integrationJobTable">
            <IntegrationJobTable
              tabName={tabName}
              integrationJobData={integrationJobData}
              integrationJobDataError={integrationJobDataError}
              onIntegrationJobSelect={(selected) => onIntegrationJobSelect(pointName, tabName, integrationJobData[selected].name)}/>
          </div>
          {children}
        </Split>
      </CustomTab>
    </Tabs>
  );
};

export const IntegrationJobItemContainer = ({
  integrationJobItemDataError,
  integrationJobItemData,
  tabName
  }) => {
  if(integrationJobItemDataError) {
    return (
      <div className="integrationJobItemTable">
        {integrationJobItemDataError}
      </div>
    );
  }

  if(integrationJobItemData.length === 0) {
    return (
      <div className="integrationJobItemTable">
        <h2>No data to display!</h2>
      </div>
    );
  }

  integrationJobItemData.sort((a,b) => a.name.localeCompare(b.name));
  const populationStatisticsHeader = (
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
  const populationTableBody = (
    <tbody>{
      integrationJobItemData.map(data => {
        return (<tr key={data.name}>
          <td>{data.name}</td>
          <td>{data.created}</td>
          <td>{data.updated}</td>
          <td>{data.deleted}</td>
          <td>{data.failed}</td>
          <td>
            <Status value={statusAdapter[data.status]}/>
            <span>{data.status}</span>
          </td>
        </tr>);
      })
    }
    </tbody>
  );

  const pushStatisticsHeader = (
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
  const pushTableBody = (
    <tbody>{
      integrationJobItemData.map(data => {
        return (
          <tr key={data.name}>
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
          </tr>);
      })
    }
    </tbody>
  );

  return (
    <div className="integrationJobItemTable">
      <Table selectable={false}>
        {tabName === 'populationJobs' ? populationStatisticsHeader : pushStatisticsHeader}
        {tabName === 'populationJobs' ? populationTableBody : pushTableBody}
      </Table>
    </div>
  );
};