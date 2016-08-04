import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import expect from 'expect';
import * as actions from '../../src/js/actions/views';
import * as types from '../../src/js/constants/ActionTypes';
import mockResponse from '../mockdata/views.json';
import Rest from '../util/rest-promise.js';
import {HOST_NAME_DEV, VIEW_DEF_URL} from '../../src/js/constants/ServiceConfig';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const mockView = {
  "name": "Nature",
  "desc": "",
  "category": "Assets",
  "body": {
    "orderby": "",
    "filter": "",
    "label": "Absences",
    "sqlname": "amAbsence",
    "fields": [
      {
        "user_type_format": "No|0|Yes|1",
        "long_desc": "Absence archived",
        "sqlname": "bArchived",
        "user_type": "System Itemized List",
        "is_calc": false,
        "label": "Absence archived",
        "type": "Short",
        "ref-link": "schema/amAbsence/field/bArchived",
        "size": 2
      }
    ],
    "links": []
  }
};

describe('views - actions/views-spec.js', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('load views - success', (done) => {
    nock(HOST_NAME_DEV)
      .get(VIEW_DEF_URL)
      .reply(200, mockResponse);

    const expectedActions = [
      {type: types.REQUEST_VIEWS},
      {
        type: types.RECEIVE_VIEWS_SUCCESS,
        views: mockResponse
      },
      {
        type: types.SET_SELECTED_VIEW,
        selectedViewId: mockResponse[0]._id,
        selectedView: mockResponse[0]
      }
    ];

    const store = mockStore({views: []});

    store.dispatch(actions.loadViews(mockResponse[0]._id))
      .then(() => { // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });

  it('load views - failure', (done) => {
    nock(HOST_NAME_DEV)
      .get(VIEW_DEF_URL)
      .reply(500, "Server error");

    const store = mockStore({views: []});

    store.dispatch(actions.loadViews())
      .then(() => { // return of async actions
        expect(store.getActions()[1].type).toEqual(types.RECEIVE_VIEWS_FAILURE);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });

  it('saveViewDef - success', (done) => {
    const fakeId = '5owritqpvi';
    nock(HOST_NAME_DEV)
      .get(VIEW_DEF_URL)
      .reply(200, fakeId);

    const expectedActions = [{
      type: types.SAVE_VIEW_DEF,
      selectedViewId: fakeId,
      selectedView: mockView
    }, {
      type: types.RECEIVE_INFO,
      msg: "View definition saved successfully."
    }];
    const store = mockStore({views: []});
    store.dispatch(actions.saveViewDef(mockView))
      .then(() => { // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });

  it('saveViewDef - failed', (done) => {
    const errorMsg = 'View name can not duplicate in same category!';
    nock(HOST_NAME_DEV)
      .get(VIEW_DEF_URL)
      .reply(400, errorMsg);

    const store = mockStore({views: []});

    store.dispatch(actions.saveViewDef(mockView))
      .then(() => { // return of async actions
        expect(() => 'saveViewDef').toThrow(errorMsg); // test failed
      })
      .catch((error) => {
        expect(error.response.text).toEqual(errorMsg); // test passed
      })
      .done(done);
  });

  it('deleteTableRow - delete link field', () => {
    const store = mockStore({views: {editing: true, views: []}});
    const fieldsCount = mockResponse[0].body.links[0].body.fields.length;
    store.dispatch(actions.deleteTableRow(mockResponse[0], 'body.links.0.body.fields.0'));
    expect(store.getActions()[0].selectedView.body.links[0].body.fields.length).toEqual(fieldsCount - 1);
  });

  it('deleteTableRow - delete field', () => {
    const store = mockStore({views: {editing: true, views: []}});
    const fieldsCount = mockResponse[0].body.fields.length;
    store.dispatch(actions.deleteTableRow(mockResponse[0], 'body.fields.0'));
    expect(store.getActions()[0].selectedView.body.fields.length).toEqual(fieldsCount - 1);
  });

  it('moveRow - move up', () => {
    const store = mockStore({views: []});
    const field1 = mockResponse[0].body.fields[0].sqlname;
    const field2 = mockResponse[0].body.fields[1].sqlname;
    store.dispatch(actions.moveRow(mockResponse[0], 'body.fields.1', true));
    expect(store.getActions()[0].selectedView.body.fields[0].sqlname).toEqual(field2);
    expect(store.getActions()[0].selectedView.body.fields[1].sqlname).toEqual(field1);
  });

  it('moveRow - move down', () => {
    const store = mockStore({views: []});
    const field1 = mockResponse[0].body.fields[1].sqlname;
    const field2 = mockResponse[0].body.fields[2].sqlname;
    store.dispatch(actions.moveRow(mockResponse[0], 'body.fields.1'));
    expect(store.getActions()[0].selectedView.body.fields[1].sqlname).toEqual(field2);
    expect(store.getActions()[0].selectedView.body.fields[2].sqlname).toEqual(field1);
  });

  it('duplicateViewDef ', () => {
    const store = mockStore({views: []});
    store.dispatch(actions.duplicateViewDef(mockResponse[0]));
    expect(store.getActions()[0].selectedView.name).toEqual(`${mockResponse[0].name} (Duplicated)`);
  });

  it('confirmDeleteViewDef - success', (done) => {
    const store = mockStore({views: {views: mockResponse}});
    const selectedView = mockResponse[0];

    nock(HOST_NAME_DEV)
      .get(VIEW_DEF_URL + selectedView._id)
      .reply(200);

    const expectedActions = [{
      type: types.DELETE_VIEW_DEF,
      selectedViewId: selectedView._id
    }, {
      type: types.RECEIVE_INFO,
      msg: `View definition '${selectedView.name}' deleted.`
    }];

    store.dispatch(actions.confirmDeleteViewDef(selectedView))
      .then(() => { // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });
});
