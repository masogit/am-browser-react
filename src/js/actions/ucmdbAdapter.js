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

export const getIntegrationPoint = () =>
  (dispatch) =>{
    const url = `${HOST_NAME}/am/ucmdbPoint/`;
    Rest.get(url).end(function (err, res) {
      const data = res && res.ok && res.body || [];
      const error = err && err.rawResponse;
      dispatch(adapterDataFetch(data, error));
    });
  };

const adapterDataFetch = (result, error) => ({
  type: ADAPTER_DATA_SUCCESS,
  data: result,
  error: error
});

export const getIntegrationJob = (pointName, jobType) =>
   (dispatch) => {
      const url = `${HOST_NAME}/am/ucmdbPoint/${pointName}/${jobType}`;
      Rest.get(url).end(function (err, res) {
        const data = res && res.ok && res.body || [];
        const error = err && err.rawResponse;
        dispatch(integrationJobDataSuccess(data, error));
        });
   };

const integrationJobDataSuccess = (result, error) =>({
  type: INTEGRATION_JOB_DATA_SUCCESS,
  integrationJobData: result,
  error: error
});

export const getIntegrationJobItem = (pointName, jobType, jobName) =>
  (dispatch) => {
    const url = `${HOST_NAME}/am/ucmdbPoint/${pointName}/${jobType}/${jobName}`;
    Rest.get(url).end(function (err, res) {
        const data = res && res.ok && res.body && res.body.jobStatuses || [];
        const error = err && err.rawResponse;
        dispatch(integrationJobItemDataSuccess(data, error));
      });
  };

const integrationJobItemDataSuccess = (result, error) =>({
  type: INTEGRATION_JOB_ITEM_DATA_SUCCESS,
  integrationJobItemData: result,
  error: error
});

export const adapterSideBarClick = (pointName) => ({type: ADAPTER_SIDEBAR_CLICK, pointName: pointName});

export const integrationJobSelect = (tabName, pointName, integrationJobName) => {
  history.pushState(null, '/ucmdbAdapter/' + tabName + '/' + pointName);
  //history.pushState(null, '/ucmdbAdapter/' + tabName + '/' + pointName + '/' + integrationJobName);
  return { type: JOB_SELECT_SUCCESS, integrationJobName: integrationJobName };
};

export const integrationJobTabSwitch = (tabName, pointName) => {
  history.pushState(null, '/ucmdbAdapter/' + tabName + '/' + pointName);
  return {
    type: TAB_SWITCH_SUCCESS,
    tabName: tabName
  };
};
