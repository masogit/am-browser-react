import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import expect from 'expect';
import * as actions from '../../src/js/actions/views';
import * as types from '../../src/js/constants/ActionTypes';
import {HOST_NAME, HOST_NAME_DEV} from '../../src/js/util/Config';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('views - actions/views-spec.js', () => {
  afterEach(() => {
    nock.cleanAll();
  })

  it('load views - success', (done) => {
    expect(HOST_NAME).toEqual(HOST_NAME_DEV);
    nock(HOST_NAME)
      .get('/json/template')
      .reply(200, [{
        "name": "Asset template 1",
        "description": "Asset template 1",
        "group": "Assets",
      }]);

    const expectedActions = [
      {type: types.REQUEST_VIEWS},
      {
        type: types.RECEIVE_VIEWS_SUCCESS,
        views: [{
          "name": "Asset template 1",
          "description": "Asset template 1",
          "group": "Assets",
        }]
      }
    ]

    const store = mockStore({views: []});

    store.dispatch(actions.loadViews())
      .then(() => { // return of async actions
        //console.log('store.getActions():');
        //console.log(store.getActions());
        expect(store.getActions()).toEqual(expectedActions)
      })
      .then(done) // test passed
      .catch(done) // test failed
  })

  it('load views - failure', (done) => {
    expect(HOST_NAME).toEqual(HOST_NAME_DEV);
    nock(HOST_NAME)
      .get('/json/template')
      .reply(500, "Server error");

    const expectedActions = [
      {type: types.REQUEST_VIEWS},
      {
        type: types.RECEIVE_VIEWS_SUCCESS,
        err: "Server error"
      }
    ]

    const store = mockStore({views: []});

    store.dispatch(actions.loadViews())
      .then(() => { // return of async actions
        expect(store.getActions()[1].type).toEqual(types.RECEIVE_VIEWS_FAILURE)
      })
      .then(done) // test passed
      .catch(done) // test failed
  })
})