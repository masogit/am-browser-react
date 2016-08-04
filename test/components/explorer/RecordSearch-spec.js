import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import RecordSearch from '../../../src/js/components/explorer/RecordSearch';
import {Box, Header, Split, Table} from 'grommet';

describe('explorer - components/explorer/RecordSearch-spec.js', () => {
  it('should render default RecordSearch correctly', () => {
    const renderer = TestUtils.createRenderer();
    const keyword = 'dummy keyword';
    let props = {
      params: {
        keyword
      }
    };
    renderer.render(<RecordSearch {...props}/>);
    let box = renderer.getRenderOutput();
    expect(box.type).toEqual(Box);

    let header = box.props.children[0];
    let split = box.props.children[1];
    expect(header.type).toEqual(Header);
    expect(split.type).toEqual(Split);

    const table = split.props.children[0].props.children;
    expect(table.type).toEqual(Table);

    const input = header.props.children[1];
    expect(input.props.defaultValue).toEqual(keyword);
  });
});
