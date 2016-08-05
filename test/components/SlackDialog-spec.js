/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import SlackDialog from '../../src/js/components/SlackDialog';
import {Box, Form} from 'grommet';

describe('components - components/SlackDialog-spec.js', () => {
  it('should render SlackDialog correctly', () => {
    const renderer = TestUtils.createRenderer();

    renderer.render(<SlackDialog />);

    const box = renderer.getRenderOutput();
    expect(box.type).toEqual(Box);

    const form = box.props.children;
    expect(form.type).toEqual(Form);
  });
});

