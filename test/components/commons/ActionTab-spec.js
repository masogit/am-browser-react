/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import ActionTab from '../../../src/js/components/commons/ActionTab';
import {Box} from 'grommet';

describe('commons - components/explorer/ActionTab-spec.js', () => {
  it('should render ActionTab correctly - onEdit', () => {
    const renderer = TestUtils.createRenderer();
    const props = {
      onDoubleClick: () => console.log('ActionTab onDoubleClick'),
      onEdit: () => console.log('ActionTab onEdit'),
      active: true,
      disabled: true
    };
    renderer.render(<ActionTab {...props}/>);

    let box = renderer.getRenderOutput();
    expect(box.type).toEqual(Box);
    expect(box.props.className).toEqual('grommetux-tab--active');
    let tab = box.props.children;
    expect(tab.type).toEqual(Box);
    expect(tab.props.className).toEqual('grommetux-tab__label');
  });
});

