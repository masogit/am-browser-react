/**
 * Created by Maso on 8/10/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import SortMenu from '../../../src/js/components/commons/SortMenu';
import {Anchor, Menu} from 'grommet';

const props = {
  data: [
    {label: 'Non-Compliance', value: 'nonCompliance'},
    {label: 'Over-Compliance', value: 'overCompliance'}
  ],
  onSort: (value) => console.log('Sort value: ' + value)
};

describe('commons - components/explorer/SortMenu-spec.js', () => {
  it('should render SortMenu correctly - init', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<SortMenu {...props}/>);

    // 1 box, 1 header, 1 title, 1 menu, 2 anchor, 1 tiles, 2 tile
    const menu = renderer.getRenderOutput();
    expect(menu.type).toEqual(Menu);
    const item = menu.props.children;
    expect(item[0].type).toEqual(Anchor);
    expect(item[0].props.label).toEqual('Non-Compliance');
  });
});

