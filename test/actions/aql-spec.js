import nock from 'nock';
import expect from 'expect';
import * as actions from '../../src/js/actions/aql';
import mockWall from '../mockdata/wall.json';
import mockAql from '../mockdata/aql.json';
import mockAqlResult from '../mockdata/aqlResult.json';
import Rest from '../util/rest-promise.js';
import {HOST_NAME_DEV, INSIGHT_DEF_URL, GRAPH_DEF_URL, AM_DB_DEF_URL} from '../../src/js/constants/ServiceConfig';

describe('aql - actions/aql-spec.js', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('saveWall - success', (done) => {
    const mockWall = {id: 1};
    nock(HOST_NAME_DEV)
      .get(INSIGHT_DEF_URL)
      .query(mockWall)
      .reply(200, mockWall.id);

    actions.saveWall(mockWall)
      .then((result) => { // return of async actions
        expect(result).toEqual(mockWall.id);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });

  it('loadWalls - success', (done) => {
    nock(HOST_NAME_DEV)
      .get(INSIGHT_DEF_URL)
      .reply(200, [mockWall]);

    actions.loadWalls()
      .then((result) => { // return of async actions
        expect(result).toEqual([mockWall]);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });

  it('loadAQL - success', (done) => {
    const id = mockAql[0]._id;
    nock(HOST_NAME_DEV)
      .get(GRAPH_DEF_URL + id)
      .reply(200, mockAql[0]);

    actions.loadAQL(id)
      .then((result) => { // return of async actions
        expect(result).toEqual(mockAql[0]);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });

  it('loadAQLs - success', (done) => {
    nock(HOST_NAME_DEV)
      .get(GRAPH_DEF_URL)
      .reply(200, mockAql);

    actions.loadAQLs()
      .then((result) => { // return of async actions
        expect(result).toEqual(mockAql);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });

  it('saveAQL - success', (done) => {
    const mockAql = {id: 1};
    nock(HOST_NAME_DEV)
      .get(GRAPH_DEF_URL)
      .query(mockAql)
      .reply(200, mockAql.id);

    actions.saveAQL(mockAql)
      .then((result) => { // return of async actions
        expect(result).toEqual(mockAql.id);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });

  //TODO test saveAQL dispatch RECEIVE_INFO

  it('removeAQL - success', (done) => {
    const id = mockAql[0]._id;
    nock(HOST_NAME_DEV)
      .get(GRAPH_DEF_URL + id)
      .reply(200, id);

    actions.removeAQL(id)
      .then((result) => { // return of async actions
        expect(result).toEqual(mockAql[0]._id);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });
  //TODO test removeAQL dispatch RECEIVE_INFO

  it('loadReports - success', (done) => {
    nock(HOST_NAME_DEV)
      .get(AM_DB_DEF_URL + 'amInToolReport')
      .reply(200, mockAql);

    actions.loadReports()
      .then((result) => { // return of async actions
        expect(result).toEqual(mockAql);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });

  it('queryAQL - success', (done) => {
    const str = "SELECT Asset. PortfolioItem. Computer.ComputerType, count(0) 'number of asset', SUM(mDebit) 'US$' FROM amExpenseLine WHERE lTenantId=0 AND lCostId>0 AND Asset.Model.Nature.OverflowTbl = 'amComputer' AND dBilling > (SELECT dStart FROM amFinancialYear where getDate() >= dStart and getDate() <= dEnd) group by Asset.PortfolioItem.Computer.ComputerType";
    const query = "/am/aql/amExpenseLine/Asset.%20PortfolioItem.%20Computer.ComputerType,%20count(0)%20%27number%20of%20asset%27,%20SUM(mDebit)%20%27US$%27%20WHERE%20lTenantId=0%20AND%20lCostId%3E0%20AND%20Asset.Model.Nature.OverflowTbl%20=%20%27amComputer%27%20AND%20dBilling%20%3E%20(SELECT%20dStart%20FROM%20amFinancialYear%20where%20getDate()%20%3E=%20dStart%20and%20getDate()%20%3C=%20dEnd)%20group%20by%20Asset.PortfolioItem.Computer.ComputerType";

    nock(HOST_NAME_DEV)
      .get(query)
      .reply(200, mockAqlResult[1]);

    actions.queryAQL(str)
      .then((result) => { // return of async actions
        expect(result).toEqual(mockAqlResult[0]);
      })
      .then(done) // test passed
      .catch(done); // test failed
  });
  // TODO test removeAQL dispatch RECEIVE_ERROR ( 3 different Error)
});
