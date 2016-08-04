/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import AQL from '../../../src/js/components/aql/AQL';
import {Box} from 'grommet';

describe('aql - components/aql/AQL-spec.js', () => {
  it('should render AQL correctly', () => {
    const renderer = TestUtils.createRenderer();
    const aql = renderer.render(<AQL />);
    expect(aql.type).toEqual(Box);

  });
});

