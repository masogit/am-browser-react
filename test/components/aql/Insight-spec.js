/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Insight from '../../../src/js/components/aql/Insight';
import {Box, Header} from 'grommet';

describe('aql - components/aql/Insight-spec.js', () => {
  it('should render Insight correctly', () => {
    const renderer = TestUtils.createRenderer();
    const props = {
      params: {}
    };
    renderer.render(<Insight {...props}/>);

    const box = renderer.getRenderOutput();
    expect(box.type).toEqual(Box);

    const header = box.props.children[0];
    expect(header.type).toEqual(Header);
  });
});

