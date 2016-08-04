/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import EmptyIcon from '../../../src/js/components/commons/EmptyIcon';
import Edit from 'grommet/components/icons/base/Edit';

describe('commons - components/explorer/EmptyIcon-spec.js', () => {
  it('should render EmptyIcon correctly', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<EmptyIcon/>);

    let icon = renderer.getRenderOutput();
    expect(icon.type).toEqual(Edit);
    expect(icon.props.className).toEqual('icon-empty');
  });
});

