import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import expect from 'expect';
import * as actions from '../../src/js/actions/ucmdbAdapter';
import * as Types from '../../src/js/constants/ActionTypes';
import Rest from '../util/rest-promise.js';
import * as config from '../../src/js/constants/ServiceConfig';
import mockResponse from '../mockdata/ucmdbAdatper.json';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('ucmdbAdapter - actions/ucmdbAdapter-spec.js', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('getIntegrationPoint - success', (done) => {
    nock(config.HOST_NAME_DEV)
      .get(config.POINT_DEF_URL)
      .reply(200, mockResponse.points);

    const store = mockStore({});
    const expectedActions = [{
      type: Types.ADAPTER_DATA_SUCCESS,
      data: mockResponse.points,
      error: null
    }];
    store.dispatch(actions.getIntegrationPoint())
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      })
      .then(done) // test pass
      .catch(done); // test failed
  });

  it('getIntegrationPoint - failure', (done) => {
    const errorMsg = 'Adapter is not enabled';
    nock(config.HOST_NAME_DEV)
      .get(config.POINT_DEF_URL)
      .reply(503, errorMsg);

    const store = mockStore({});
    const expectedActions = [{
      type: Types.ADAPTER_DATA_SUCCESS,
      data: [],
      error: errorMsg
    }];
    store.dispatch(actions.getIntegrationPoint())
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      })
      .then(done) // test pass
      .catch(done); // test failed
  });

  it('getIntegrationJob - success', (done) => {
    const pointName = 'push_GA', jobType = 'populationJobs';

    nock(config.HOST_NAME_DEV)
      .get(`${config.POINT_DEF_URL}${pointName}/${jobType}`)
      .reply(200, mockResponse.jobs);

    const store = mockStore({});
    const expectedActions = [{
      type: Types.INTEGRATION_JOB_DATA_SUCCESS,
      integrationJobData: mockResponse.jobs,
      error: null
    }];
    store.dispatch(actions.getIntegrationJob(pointName, jobType))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      })
      .then(done) // test pass
      .catch(done); // test failed
  });

  it('getIntegrationJob - failure', (done) => {
    const errorMsg = 'Job not found', pointName = 'push_GA', jobType = 'populationJobs';
    nock(config.HOST_NAME_DEV)
      .get(`${config.POINT_DEF_URL}${pointName}/${jobType}`)
      .reply(503, errorMsg);

    const store = mockStore({});
    const expectedActions = [{
      type: Types.INTEGRATION_JOB_DATA_SUCCESS,
      integrationJobData: [],
      error: errorMsg
    }];
    store.dispatch(actions.getIntegrationJob(pointName, jobType))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      })
      .then(done) // test pass
      .catch(done); // test failed
  });

  it('getIntegrationJobItem - success', (done) => {
    const pointName = 'push_sunlife', jobType = 'pushJobs', jobName = 'AM Node Push 2.0';

    nock(config.HOST_NAME_DEV)
      .get(`${config.POINT_DEF_URL}${pointName}/${jobType}/${jobName.replace(/\s/g, '%20')}`)
      .reply(200, {jobStatuses: mockResponse.jobItems});

    const store = mockStore({});

    store.dispatch(actions.getIntegrationJobItem(pointName, jobType, jobName))
      .then(() => {
        expect(store.getActions()[0].type).toEqual(Types.INTEGRATION_JOB_ITEM_DATA_SUCCESS);
        expect(store.getActions()[0].error).toEqual(null);
        expect(store.getActions()[0].integrationJobItemData.length).toEqual(mockResponse.jobItems.length);
      })
      .then(done) // test pass
      .catch(done); // test failed
  });

  it('getIntegrationJobItem - failure', (done) => {
    const errorMsg = 'Job item not found', pointName = 'push_sunlife',
      jobType = 'pushJobs', jobName = 'AM Node Push 2.0';
    nock(config.HOST_NAME_DEV)
      .get(`${config.POINT_DEF_URL}${pointName}/${jobType}/${jobName.replace(/\s/g, '%20')}`)
      .reply(503, errorMsg);

    const store = mockStore({});
    const expectedActions = [{
      type: Types.INTEGRATION_JOB_ITEM_DATA_SUCCESS,
      integrationJobItemData: [],
      error: errorMsg
    }];
    store.dispatch(actions.getIntegrationJobItem(pointName, jobType, jobName))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      })
      .then(done) // test pass
      .catch(done); // test failed
  });
});
