/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import AMSideBar from '../../../src/js/components/commons/AMSideBar';
import {Sidebar, Header, Footer} from 'grommet';

describe('commons - components/explorer/Sidebar-spec.js', () => {
  it('should render Sidebar correctly', () => {
    const renderer = TestUtils.createRenderer();
    const sidebar = renderer.render(<AMSideBar />);

    expect(sidebar.type).toEqual(Sidebar);

    const box = sidebar.props.children;
    const header = box.props.children[0];
    expect(header.type).toEqual(Header);

    const footer = sidebar.props.children.props.children[2];
    expect(footer.type).toEqual(Footer);
  });
});

