/**
 * Created by huling on 5/4/2016.
 */
import Rest from 'grommet/utils/Rest';
import {HOST_NAME} from '../util/Config';
import history from '../RouteHistory';


export const ADAPTER_DATA_SUCCESS = 'ADAPTER_DATA_SUCCESS';
export const INTEGRATION_JOB_DATA_SUCCESS = 'INTEGRATION_JOB_DATA_SUCCESS';
export const INTEGRATION_JOB_ITEM_DATA_SUCCESS = 'INTEGRATION_JOB_ITEM_DATA_SUCCESS';
export const JOB_SELECT_SUCCESS = 'JOB_SELECT_SUCCESS';
export const TAB_SWITCH_SUCCESS = 'TAB_SWITCH_SUCCESS';
export const ADAPTER_SIDEBAR_CLICK = 'ADAPTER_SIDEBAR_CLICK';

const dateFormatter = (date) => date === 0 ? '' : new Date(date).toUTCString();

const adapterDataFetch = (data, error) => ({
  type: ADAPTER_DATA_SUCCESS,
  data,
  error
});

export const getIntegrationPoint = () =>
  (dispatch) => {
    const url = `${HOST_NAME}/am/ucmdbPoint/`;
    Rest.get(url).end(function (err, res) {
      const data = res && res.ok && res.body || [];
      const error = err && (err.rawResponse || err.message);
      dispatch(adapterDataFetch(data, error));
    });
  };

const integrationJobDataSuccess = (integrationJobData, error) =>({
  type: INTEGRATION_JOB_DATA_SUCCESS,
  integrationJobData,
  error
});

export const getIntegrationJob = (pointName, jobType) =>
  (dispatch) => {
    const url = `${HOST_NAME}/am/ucmdbPoint/${pointName}/${jobType}`;
    Rest.get(url).end(function (err, res) {
      const data = res && res.ok && res.body || [];
      const error = err && (err.rawResponse || err.message);

      const points = data.map((point)=> {
        if (point.startTime !== undefined) point.startTime = dateFormatter(point.startTime);
        if (point.stopTime !== undefined) point.stopTime = dateFormatter(point.stopTime);
        return point;
      });

      dispatch(integrationJobDataSuccess(points, error));
    });
  };

const integrationJobItemDataSuccess = (integrationJobItemData, error) =>({
  type: INTEGRATION_JOB_ITEM_DATA_SUCCESS,
  integrationJobItemData,
  error
});

export const getIntegrationJobItem = (pointName, jobType, jobName) =>
  (dispatch) => {
    const url = `${HOST_NAME}/am/ucmdbPoint/${pointName}/${jobType}/${jobName}`;
    Rest.get(url).end(function (err, res) {
      const data = res && res.ok && res.body && res.body.jobStatuses || [];
      const error = err && (err.rawResponse || err.message);
      const jobStatuses = data.map((jobStatus)=> {
        if (jobStatus.startTime !== undefined) jobStatus.startTime = dateFormatter(jobStatus.startTime);
        if (jobStatus.stopTime !== undefined) jobStatus.stopTime = dateFormatter(jobStatus.stopTime);
        return jobStatus;
      });

      dispatch(integrationJobItemDataSuccess(jobStatuses, error));
    });
  };

export const adapterSideBarClick = (pointName, tabName) => {
  //history.pushState(null, '/ucmdbAdapter/' + pointName + '/' + tabName);
  //return {type: ADAPTER_SIDEBAR_CLICK, pointName, tabName};
  return {type: ADAPTER_SIDEBAR_CLICK, pointName};
};

export const integrationJobSelect = (tabName, pointName, integrationJobName) => {
  //history.pushState(null, '/ucmdbAdapter/' + pointName + '/' + tabName);
  //history.pushState(null, '/ucmdbAdapter/' + tabName + '/' + pointName + '/' + integrationJobName);
  return {type: JOB_SELECT_SUCCESS, integrationJobName};
};

export const integrationJobTabSwitch = (tabName, pointName) => {
  history.pushState(null, '/ucmdbAdapter/' + pointName + '/' + tabName);
  return {
    type: TAB_SWITCH_SUCCESS,
    tabName
  };
};
