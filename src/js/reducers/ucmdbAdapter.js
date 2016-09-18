// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { ADAPTER_DATA_SUCCESS,
    INTEGRATION_JOB_DATA_SUCCESS,
    INTEGRATION_JOB_ITEM_DATA_SUCCESS,
    JOB_SELECT_SUCCESS,
  ADAPTER_SIDEBAR_CLICK,
  CLEAR_JOB_SELECTION,
  CLEAR_JOB_ITEM_SELECTION
} from '../constants/ActionTypes';

const initialState = {
  data: [],
  dataError: null,
  pointName: "",
  integrationJobData: [],
  integrationJobDataError: null,
  tabName: "",
  integrationJobItemData: [],
  integrationJobItemDataError: null,
  integrationJobName: "",
  loading: true
};

const handlers = {
  [ADAPTER_DATA_SUCCESS]: (state, action) => ({data: action.data, dataError: action.error, loading: false}),
  [INTEGRATION_JOB_DATA_SUCCESS]: (state, action) => ({integrationJobData: action.integrationJobData, integrationJobDataError: action.error, loading: false}),
  [INTEGRATION_JOB_ITEM_DATA_SUCCESS]: (state, action) => ({integrationJobItemData: action.integrationJobItemData, integrationJobItemDataError: action.error, loading: false}),
  [JOB_SELECT_SUCCESS]: (state, action) => ({integrationJobName: action.integrationJobName, loading: true}),
  [ADAPTER_SIDEBAR_CLICK]: (state, action) => ({
    pointName: action.pointName,
    tabName: action.tabName,
    integrationJobName: '',
    integrationJobItemData: [],
    loading: true
  }),
  [CLEAR_JOB_SELECTION]: (state, action) => ({integrationJobData: []}),
  [CLEAR_JOB_ITEM_SELECTION]: (state, action) => ({integrationJobName: '', integrationJobItemData: []})
};

export default function pushAdapterReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
