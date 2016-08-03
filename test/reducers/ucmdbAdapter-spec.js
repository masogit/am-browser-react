import expect from 'expect';
import reducer from '../../src/js/reducers/ucmdbAdapter';
import * as Types from '../../src/js/constants/ActionTypes';
import mockData from '../mockdata/ucmdbAdatper.json';

describe('ucmdbAdatper - reducers/ucmdbAdatper-spec.js', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual(
      {
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
      }
    );
  });

  it('should handle ADAPTER_DATA_SUCCESS', () => {
    expect(
      reducer({}, {
        type: Types.ADAPTER_DATA_SUCCESS,
        data: mockData.points,
        error: null
      })
    ).toEqual(
      {
        data: mockData.points,
        dataError: null,
        loading: false
      }
    );
  });

  it('should handle INTEGRATION_JOB_DATA_SUCCESS', () => {
    expect(
      reducer({}, {
        type: Types.INTEGRATION_JOB_DATA_SUCCESS,
        integrationJobData: mockData.jobs,
        error: null
      })
    ).toEqual(
      {
        integrationJobDataError: null,
        integrationJobData: mockData.jobs,
        loading: false
      }
    );
  });

  it('should handle INTEGRATION_JOB_ITEM_DATA_SUCCESS', () => {
    expect(
      reducer({}, {
        type: Types.INTEGRATION_JOB_ITEM_DATA_SUCCESS,
        error: null,
        integrationJobItemData: mockData.jobItems
      })
    ).toEqual(
      {
        integrationJobItemDataError: null,
        integrationJobItemData: mockData.jobItems,
        loading: false
      }
    );
  });

  it('should handle JOB_SELECT_SUCCESS', () => {
    expect(
      reducer({}, {
        type: Types.JOB_SELECT_SUCCESS,
        integrationJobName: mockData.jobs[0].name
      })
    ).toEqual(
      {
        integrationJobName: mockData.jobs[0].name,
        loading: true
      }
    );
  });

  it('should handle ADAPTER_SIDEBAR_CLICK', () => {
    expect(
      reducer({}, {
        type: Types.ADAPTER_SIDEBAR_CLICK,
        tabName: 'pushJobs',
        pointName: mockData.points[0].name
      })
    ).toEqual(
      {
        tabName: 'pushJobs',
        pointName: mockData.points[0].name,
        integrationJobName: '',
        integrationJobItemData: [],
        loading: true
      }
    );
  });

  it('should handle CLEAR_JOB_SELECTION', () => {
    expect(
      reducer({}, {
        type: Types.CLEAR_JOB_SELECTION
      })
    ).toEqual(
      {
        integrationJobData: []
      }
    );
  });

  it('should handle CLEAR_JOB_ITEM_SELECTION', () => {
    expect(
      reducer({}, {
        type: Types.CLEAR_JOB_ITEM_SELECTION
      })
    ).toEqual(
      {
        integrationJobName: '',
        integrationJobItemData: []
      }
    );
  });
});
