/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Explorer from '../../../src/js/components/explorer/Explorer';
import {Box} from 'grommet';

describe('explorer - components/explorer/Explorer-spec.js', () => {
  /*it('should render Explorer correctly --with Id', () => {
    const id = '1234';
    let output = setupExplorer(id);
    nock(HOST_NAME_DEV)
      .get(VIEW_DEF_URL + id)
      .reply(200, mockExplorer[0]);

    let recordList = TestUtils.findRenderedComponentWithType(output, RecordList);
    expect(recordList).toExist();
  });
*/
  it('should render empty Explorer correctly', () => {
    const renderer = TestUtils.createRenderer();
    let props = {
      params: {}
    };
    renderer.render(<Explorer {...props}/>);
    let result = renderer.getRenderOutput();
    let child = result.props.children;
    let detail = child[1].props.children;
    expect(detail.props.children).toEqual('Select an item to query.');
    expect(result.type).toEqual(Box);
  });
});
