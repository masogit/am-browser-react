/*
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import RecordList from '../../../src/js/components/explorer/RecordList';
import Graph from '../../../src/js/components/commons/Graph';
//import RecordDetail from '../../../src/js/components/explorer/RecordDetail';
import {Table, Header} from 'grommet';
import mockRecord from '../../mockdata/recordList.json';
import Rest from '../../util/rest-promise.js';
import mockExplorer from '../../mockdata/explorer.json';

const body = mockExplorer[0].body;
body.param = {
  filters: [],
  limit: 30,
  offset: 0,
  orderby: 'self'
};

function setupRecordList() {
  let props = {
    body: body,
    title: mockRecord.name,
    root: true
  };
  return TestUtils.renderIntoDocument(
    <RecordList {...props} />
  );
}

let output = setupRecordList();
describe('explorer - components/explorer/RecordList-spec.js', () => {
  it('should render RecordList correctly', () => {
    let header = TestUtils.findRenderedComponentWithType(output, Header);
    let graph = TestUtils.findRenderedComponentWithType(output, Graph);
    expect(header).toExist();
    expect(graph).toExist();
  });

  it('should render ascend Icon correctly', () => {
    let table = TestUtils.findRenderedComponentWithType(output, Table);
    expect(table).toExist();
    let heads = TestUtils.scryRenderedDOMComponentsWithTag(table, 'a');

    TestUtils.Simulate.click(heads[0]);
    let ascend = TestUtils.findRenderedDOMComponentWithClass(table, 'grommetux-control-icon-ascend');
    expect(ascend).toExist();
  });

  it('should render descend Icon correctly', () => {
    let table = TestUtils.findRenderedComponentWithType(output, Table);
    expect(table).toExist();
    let heads = TestUtils.scryRenderedDOMComponentsWithTag(table, 'a');

    TestUtils.Simulate.click(heads[0]);
    let descend = TestUtils.findRenderedDOMComponentWithClass(table, 'grommetux-control-icon-descend');
    expect(descend).toExist();
  });
});

