/**
 * Created by huling on 5/9/2016.
 */

import {statusAdapter} from '../../constants/StatusAdapter.js';
import React from 'react';
var Status = require('grommet/components/icons/Status');
import Table from 'grommet/components/Table';

export const IntegrationJobItemTemplate = ({
  integrationJobItemDataError,
  integrationJobItemData,
  tabName
  }) => {
  if (integrationJobItemDataError) {
    return (
      <div className="integrationJobItemTable">
        {integrationJobItemDataError}
      </div>
    );
  }

  if (integrationJobItemData.length === 0) {
    return (
      <div className="integrationJobItemTable">
        <h2>No data to display!</h2>
      </div>
    );
  }

  integrationJobItemData.sort((a,b) => a.name.localeCompare(b.name));
  const tableHeader = tabName === 'populationJobs' ? (
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
  ) : (
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

  const tableBody = tabName === 'populationJobs' ? (
    <tbody>{
      integrationJobItemData.map(data => {
        return (<tr key={data.name}>
          <td>{data.name}</td>
          <td>{data.created}</td>
          <td>{data.updated}</td>
          <td>{data.deleted}</td>
          <td>{data.failed}</td>
          <td>
            <Status value={statusAdapter[data.status].status}/>
            <span>{statusAdapter[data.status].text}</span>
          </td>
        </tr>);
      })
    }
    </tbody>
  ) : (
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
              <Status value={statusAdapter[data.status].status}/>
              <span>{statusAdapter[data.status].text}</span>
            </td>
            <td>{data.startTime}</td>
            <td>{data.stopTime}</td>
          </tr>);
      })
    }
    </tbody>
  );

  return (
    <div className="integrationJobItemTable">
      <Table selectable={false}>
        {tableHeader}
        {tableBody}
      </Table>
    </div>
  );
};
