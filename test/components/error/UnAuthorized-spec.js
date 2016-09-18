import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import UnAuthorized from '../../../src/js/components/error/UnAuthorized';
import {Box} from 'grommet';

describe('error - components/explorer/UnAuthorized-spec.js', () => {
  it('should render UnAuthorized correctly', () => {
    const renderer = TestUtils.createRenderer();

    renderer.render(<UnAuthorized />);

    let box = renderer.getRenderOutput();
    expect(box.type).toEqual(Box);

    let child = box.props.children;
    expect(child.props.children).toEqual('You are not Authorized');
  });
});
