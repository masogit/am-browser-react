/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import NavHeader from '../../src/js/components/NavHeader';
import {Header, Menu, Title} from 'grommet';

describe('components - components/NavHeader-spec.js', () => {
  it('should render NavHeader correctly', () => {
    const renderer = TestUtils.createRenderer();

    renderer.render(<NavHeader />);

    const header = renderer.getRenderOutput();
    expect(header.type).toEqual(Header);

    const title = header.props.children[0];
    expect(title.type).toEqual(Title);

    const img = title.props.children[0];
    expect(img.type).toEqual('img');

    const menu = header.props.children[1];
    expect(menu.type).toEqual(Menu);
  });
});

