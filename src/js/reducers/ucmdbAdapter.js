// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { ADAPTER_DATA_SUCCESS,
    INTEGRATION_JOB_DATA_SUCCESS,
    INTEGRATION_JOB_ITEM_DATA_SUCCESS,
    JOB_SELECT_SUCCESS,
    TAB_SWITCH_SUCCESS,
    ADAPTER_SIDEBAR_CLICK
} from '../actions/ucmdbAdapter';

const initialState = {
  data: [],
  dataError: null,
  pointName: "",
  integrationJobData: [],
  integrationJobDataError: null,
  tabName: "populationJobs",
  integrationJobItemData: [],
  integrationJobItemDataError: null,
  integrationJobName: ""
};

const handlers = {
  [ADAPTER_DATA_SUCCESS]: (state, action) => ({data: action.data, dataError: action.error}),
  [INTEGRATION_JOB_DATA_SUCCESS]: (state, action) => ({integrationJobData: action.integrationJobData, integrationJobDataError: action.error}),
  [INTEGRATION_JOB_ITEM_DATA_SUCCESS]: (state, action) => ({integrationJobItemData: action.integrationJobItemData, integrationJobItemDataError: action.error}),
  [JOB_SELECT_SUCCESS]: (state, action) => ({integrationJobName: action.integrationJobName}),
  [TAB_SWITCH_SUCCESS]: (state, action) => ({tabName: action.tabName, integrationJobName: ''}),
  [ADAPTER_SIDEBAR_CLICK]: (state, action) => ({pointName: action.pointName, integrationJobName: ''})
};

export default function pushAdapterReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
