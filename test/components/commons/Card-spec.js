/**
 * Created by Maso on 8/10/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Card from '../../../src/js/components/commons/Card';
import SortMenu from '../../../src/js/components/commons/SortMenu';
import {Box, Header} from 'grommet';

const props = {
  title: 'Vendor',
  data: [{"name":"Microsoft","products":6,"nonCompliance":2,"overCompliance":10}, {"name":"Hewlett Packard","products":1,"nonCompliance":1}],
  onSelect: (value) => console.log('Selected value: ' + value),
  conf: {
    header: 'name',
    body: [
      {label: 'Non-Compliance', value: 'nonCompliance'},
      {label: 'Over-Compliance', value: 'overCompliance'}
    ],
    footer: 'products'
  },
  sortStyle: {
    color: '#DC2878',
    fontWeight: 'bold',
    fontSize: '120%'
  }
};

describe('commons - components/explorer/Card-spec.js', () => {
  it('should render Card correctly - init', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Card {...props}/>);

    // 1 box, 1 header, 1 title, 1 menu, 2 anchor, 1 tiles, 2 tile
    const box = renderer.getRenderOutput();
    expect(box.type).toEqual(Box);
    const header = box.props.children[0];
    expect(header.type).toEqual(Header);
    const headerTitle = header.props.children[0];
    expect(headerTitle.props.children).toEqual('Vendor');
    const headerMenu = header.props.children[1];
    expect(headerMenu.type).toEqual(SortMenu);
  });
});

