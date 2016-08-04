import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import RecordDetail from '../../../src/js/components/explorer/RecordDetail';
import {Layer, Tabs} from 'grommet';

describe('explorer - components/explorer/RecordDetail-spec.js', () => {
  it('should render default RecordDetail correctly', () => {
    const renderer = TestUtils.createRenderer();
    const label = 'dummy label';
    let props = {
      body: {
        fields: [],
        links: [],
        label
      },
      record: {
        self: 'self'
      },
      onClose: () => {}
    };
    renderer.render(<RecordDetail {...props}/>);
    let layer = renderer.getRenderOutput();
    expect(layer.type).toEqual(Layer);

    let tabs = layer.props.children;
    expect(tabs.type).toEqual(Tabs);

    const tab = tabs.props.children[0];
    expect(tab.props.title).toEqual(label);
  });
});
