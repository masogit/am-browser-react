import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import expect from 'expect';
import * as actions from '../../src/js/actions/system';
import * as types from '../../src/js/constants/ActionTypes';
import Rest from '../util/rest-promise.js';
import mockResponse from '../mockdata/views.json';
import * as config from '../../src/js/constants/ServiceConfig';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('system - actions/system-spec.js', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('init - success', () => {
    const store = mockStore({});
    const email = 'admin',
      headerString = 'j:{"login":true,"home":true,"search":true}',
      headerNavs = {login: true, home: true, search: true};
    store.dispatch(actions.init(email, headerString));
    expect(store.getActions()).toEqual([{
      type: types.INIT, email, headerNavs
    }]);
  });

  it('init - failure', () => {
    const store = mockStore({});
    const email = 'admin';
    store.dispatch(actions.init(email, 'will fail'));
    expect(store.getActions()).toEqual([{
      type: types.INIT
    }]);
  });

  it('initToken - failure', (done) => {
    nock(config.HOST_NAME_DEV)
      .get(config.CSRF_DEF_URL)
      .reply(500);

    actions.initToken()
      .then(() => { // return of async actions
        expect(() => 'initToken').toThrow(); // test failed
      })
      .catch(() => {
        expect('Error throw').toEqual('Error throw'); // test passed
      })
      .done(done);
  });

  it('initAbout - failure', (done) => {
    nock(config.HOST_NAME_DEV)
      .get(config.ABOUT_DEF_URL)
      .reply(500);

    actions.initAbout()
      .then(() => { // return of async actions
        expect(() => 'initAbout').toThrow(); // test failed
      })
      .catch((error) => {
        expect('Error throw').toEqual('Error throw'); // test passed
      })
      .done(done);
  });

  it('login - success', (done) => {
    const username = 'admin', headerNavs = {login: true, home: true, search: true};
    const expectedActions = [{type: types.LOGIN_SUCCESS, email: username, headerNavs}];

    nock(config.HOST_NAME_DEV)
      .get(config.LOGIN_DEF_URL)
      .reply(200, {headerNavs, text: ''});

    const store = mockStore({});

    store.dispatch(actions.login(username, ''))
      .then(() => { // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
      })
      .then(done) // test pass
      .catch(done); // test failed
  });

  it('login - failure', (done) => {
    const username = 'test';
    const errorMsg = 'Unauthorized';
    const expectedActions = [{type: types.LOGIN_FAILURE, error: {message: `Login failed. ${errorMsg}`}}];

    nock(config.HOST_NAME_DEV)
      .get(config.LOGIN_DEF_URL)
      .reply(401, errorMsg);

    const store = mockStore({});

    store.dispatch(actions.login(username, ''))
      .then(() => { // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
      })
      .then(done) // test pass
      .catch(done); // test failed
  });

  it('logout - success', (done) => {
    const expectedActions = [{type: types.LOGOUT}];

    nock(config.HOST_NAME_DEV)
      .get(config.LOGOUT_DEF_URL)
      .reply(200);

    const store = mockStore({});

    store.dispatch(actions.logout())
      .then(() => { // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
      })
      .then(done) // test pass
      .catch(done); // test failed
  });

  it('logout - failure', (done) => {
    nock(config.HOST_NAME_DEV)
      .get(config.LOGOUT_DEF_URL)
      .reply(500);

    const store = mockStore({});

    store.dispatch(actions.logout())
      .then(() => { // return of async actions
        expect(() => 'logout').toThrow(); // test failed
      })
      .catch((error) => {
        expect('Error throw').toEqual('Error throw'); // test passed
      })
      .done(done);
  });

  it('sendMessageToSlack - success', (done) => {
    const msg = 'send success';
    const expectedActions = [{type: types.RECEIVE_WARNING, msg}];

    nock(config.HOST_NAME_DEV)
      .get(config.SLACK_DEF_URL)
      .reply(200, msg);

    const store = mockStore({});

    store.dispatch(actions.sendMessageToSlack(msg))
      .then(() => { // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
      })
      .then(done) // test pass
      .catch(done); // test failed
  });

  it('sendMessageToSlack - failure', (done) => {
    nock(config.HOST_NAME_DEV)
      .get(config.SLACK_DEF_URL)
      .reply(500);

    const store = mockStore({});

    store.dispatch(actions.sendMessageToSlack('send message'))
      .then(() => { // return of async actions
        expect(store.getActions()[0].type).toEqual(types.RECEIVE_WARNING);
      })
      .then(done) // test pass
      .catch(done); // test failed
  });

  it('test metadataLoad', (done) => {
    nock(config.HOST_NAME_DEV)
      .get(config.AM_SCHEMA_DEF_URL)
      .reply(200, mockResponse);

    actions.metadataLoad()
      .then((result) => { // return of async actions
        expect(result).toEqual(mockResponse);
      })
      .then(done) // test pass
      .catch(done); // test failed
  });

  it('test metadataLoadDetail', (done) => {
    const obj = {
      label: "IT equipment",
      sqlname: "amComputer",
      url: "schema/amComputer"
    };
    const elements = [];
    const mockResponse = {...obj, fields: [{label: "Browser"}]};

    nock(config.HOST_NAME_DEV)
      .get(config.AM_DEF_URL + obj.url)
      .reply(200, mockResponse);

    actions.metadataLoadDetail(obj, [])
      .then((result) => { // return of async actions
        expect(result.rows).toEqual(mockResponse);
        expect(result.elements.length).toEqual(elements.length + 1);
        expect(result.elements[0].body_label).toEqual(obj.label);
        expect(result.elements[0].body_sqlname).toEqual(obj.sqlname);
      })
      .then(done) // test pass
      .catch(done); // test failed
  });
});
