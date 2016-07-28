/**
 * Created by huling on 5/4/2016.
 */
import Rest from '../util/grommet-rest-promise';
import history from '../RouteHistory';
import {POINT_DEF_URL, ADAPTER_DEF_URL} from '../constants/ServiceConfig';

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

export const getIntegrationPoint = () => {
  return dispatch => {
    return Rest.get(POINT_DEF_URL).then((res) => {
      const data = res && res.ok && res.body || [];
      dispatch(adapterDataFetch(data, null));
    }, (err) => {
      const error = err.response.text;
      dispatch(adapterDataFetch([], error));
    });
  };
};

const integrationJobDataSuccess = (integrationJobData, error) =>({
  type: INTEGRATION_JOB_DATA_SUCCESS,
  integrationJobData,
  error
});

export const getIntegrationJob = (pointName, jobType) => {
  const url = `${POINT_DEF_URL}${pointName}/${jobType}`;
  return dispatch => {
    return Rest.get(url).then((res) => {
      const data = res && res.ok && res.body || [];
      const points = data.map((point)=> {
        if (point.startTime !== undefined) point.startTime = dateFormatter(point.startTime);
        if (point.stopTime !== undefined) point.stopTime = dateFormatter(point.stopTime);
        return point;
      });
      dispatch(integrationJobDataSuccess(points, null));
    }, (err) => {
      const error = err.response.text;
      dispatch(integrationJobDataSuccess([], error));
    });
  };
};

const integrationJobItemDataSuccess = (integrationJobItemData, error) =>({
  type: INTEGRATION_JOB_ITEM_DATA_SUCCESS,
  integrationJobItemData,
  error
});

export const getIntegrationJobItem = (pointName, jobType, jobName) => {
  const url = `${POINT_DEF_URL}${pointName}/${jobType}/${jobName}`;
  return dispatch => {
    return Rest.get(url).then((res) => {
      const data = res && res.ok && res.body && res.body.jobStatuses || [];
      const jobStatuses = data.map((jobStatus)=> {
        if (jobStatus.startTime !== undefined) jobStatus.startTime = dateFormatter(jobStatus.startTime);
        if (jobStatus.stopTime !== undefined) jobStatus.stopTime = dateFormatter(jobStatus.stopTime);
        return jobStatus;
      });
      dispatch(integrationJobItemDataSuccess(jobStatuses, null));
    }, (err) => {
      const error = err.response.text;
      dispatch(integrationJobItemDataSuccess([], error));
    });
  };
};

export const adapterSideBarClick = (pointName, tabName) => {
  history.pushState(null, ADAPTER_DEF_URL + pointName + '/' + tabName);
  return {type: ADAPTER_SIDEBAR_CLICK, pointName, tabName};
};

export const integrationJobSelect = (tabName, pointName, integrationJobName) => {
  return {type: JOB_SELECT_SUCCESS, integrationJobName};
};

export const integrationJobTabSwitch = (tabName, pointName) => {
  history.pushState(null, ADAPTER_DEF_URL + pointName + '/' + tabName);
  return {
    type: TAB_SWITCH_SUCCESS,
    tabName
  };
};
