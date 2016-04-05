// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { ADAPTER_DATA_SUCCESS,
    INTEGRATION_JOB_DATA_SUCCESS,
    INTEGRATION_JOB_ITEM_DATA_SUCCESS,
    JOB_SELECT_SUCCESS,
    TAB_SWITCH_SUCCESS,
    ADAPTER_SIDEBAR_CLICK
} from '../actions';

const initialState = {
  data: [],
  selectedLinkName: "",
  integrationJobData: [],
  tabName: "populationJobs",
  integrationJobItemData: [],
  integrationJobName: ""
};

const handlers = {
  [ADAPTER_DATA_SUCCESS]: (state, action) => ({data: action.data}),
  [INTEGRATION_JOB_DATA_SUCCESS]: (state, action) => ({integrationJobData: action.integrationJobData}),
  [INTEGRATION_JOB_ITEM_DATA_SUCCESS]: (state, action) => ({integrationJobItemData: action.integrationJobItemData}),
  [JOB_SELECT_SUCCESS]: (state, action) => ({integrationJobName: action.integrationJobName}),
  [TAB_SWITCH_SUCCESS]: (state, action) => ({
    tabName: action.tabName,
    integrationJobName: action.integrationJobName
  }),
  [ADAPTER_SIDEBAR_CLICK]: (state, action) => ({
    selectedLinkName: action.selectedLinkName
  })
};

export default function pushAdapterReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
