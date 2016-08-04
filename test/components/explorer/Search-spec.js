import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Search from '../../../src/js/components/explorer/Search';
import {Box, Headline, Tiles} from 'grommet';

describe('explorer - components/explorer/Search-spec.js', () => {
  it('should render Search correctly', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Search />);
    let box = renderer.getRenderOutput();
    expect(box.type).toEqual(Box);

    let header = box.props.children[0];
    let input = box.props.children[1].props.children;
    let tiles = box.props.children[2];
    expect(header.type).toEqual(Headline);
    expect(input.type).toEqual('input');
    expect(tiles.type).toEqual(Tiles);
  });
});
