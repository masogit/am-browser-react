import nock from 'nock';
import expect from 'expect';
import * as actions from '../../src/js/actions/explorer';
import mockResponse from '../mockdata/explorer.json';
import Rest from '../util/rest-promise.js';
import {HOST_NAME_DEV, UCMDB_DEF_URL, VIEW_DEF_URL, AM_DB_DEF_URL} from '../../src/js/constants/ServiceConfig';

const body = mockResponse[0].body;
describe('explorer - actions/explorer-spec.js', () => {
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

    actions.loadViews()
      .then((result) => { // return of async actions
        expect(result).toEqual(mockResponse);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });

  it('load view - success', (done) => {
    const id = mockResponse[0]._id;
    nock(HOST_NAME_DEV)
      .get(VIEW_DEF_URL + id)
      .reply(200, mockResponse[0]);

    actions.loadView(id)
      .then((result) => { // return of async actions
        expect(result).toEqual(mockResponse[0]);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });

  it('getUCMDB - success', (done) => {
    const successMsg = 'dummy message';
    nock(HOST_NAME_DEV)
      .get(UCMDB_DEF_URL)
      .reply(200, successMsg);

    actions.getUCMDB(mockResponse[0]._id)
      .then((result) => { // return of async actions
        expect(result).toEqual(successMsg);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });

  it('loadRecordsByBody - success', (done) => {
    body.param = {
      filters: [],
      limit: 30,
      offset: 0,
      orderby: ""
    };
    nock(HOST_NAME_DEV)
      .get(AM_DB_DEF_URL + body.sqlname)
      .query(actions.getQueryByBody(body))
      .reply(200, mockResponse[3]);

    actions.loadRecordsByBody(body)
      .then((result) =>{
        expect(result).toEqual(mockResponse[3]);
      })
      .then(done) // test passed
      .catch(done); // test failed

  });

  it('loadRecordsByBody - empty', (done) => {
    body.param = {
      filters: [],
      limit: 30,
      offset: 0,
      orderby: ""
    };
    const expectedResult = {count: 0, entities: []};
    nock(HOST_NAME_DEV)
      .get(AM_DB_DEF_URL + body.sqlname)
      .query(actions.getQueryByBody(body))
      .reply(500);

    actions.loadRecordsByBody(body)
      .then((result) =>{
        expect(result).toEqual(expectedResult);
      })
      .then(done) // test passed
      .catch(done); // test failed

  });

  it('getBodyByKeyword - success', () => {
    const expectedResult = "Ref like '%IL-347677%' OR ContractNo like '%IL-347677%'";
    expect(actions.getBodyByKeyword(mockResponse[1].body, 'IL-347677').filter).toEqual(expectedResult);
    expect(actions.getBodyByKeyword(body, 'IL-347677').filter).toEqual('');
  });

  it('getQueryByBody - success', () => {
    const expectedResult = {
      limit: body.param ? body.param.limit : 100,
      offset: 0,
      countEnabled: true,
      orderby: body.orderby,
      fields: "mDebit,DebitCur,dBilling,sePurpose,seStatus,Portfolio.lPortfolioItemId"
    };

    expect(actions.getQueryByBody(body)).toEqual(expectedResult);
  });

  it('getGroupByAql - success', () => {
    body.groupby = 'CostCenter.Title';
    const expectedResult = "select CostCenter.Title, sum(mDebit) from amExpenseLine where PK <> 0 group by CostCenter.Title";
    expect(actions.getGroupByAql(body)).toEqual(expectedResult);
    body.groupby = '';
  });
});
