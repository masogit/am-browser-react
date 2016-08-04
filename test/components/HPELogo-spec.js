/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Logo from '../../src/js/components/HPELogo';

const CLASS_ROOT = 'grommetux-logo-icon';

describe('components - components/Logo-spec.js', () => {
  it('should render Logo correctly', () => {
    const renderer = TestUtils.createRenderer();
    const logo = renderer.render(<Logo />);
    expect(logo.type).toEqual('svg');
    expect(logo.props.className).toEqual(CLASS_ROOT);
  });

  it('should render Logo correctly -small', () => {
    const renderer = TestUtils.createRenderer();
    const logo = renderer.render(<Logo size='small'/>);
    expect(logo.type).toEqual('svg');

    const classes = [CLASS_ROOT];
    classes.push(CLASS_ROOT + '--small');
    classes.push('color-index-brand');

    expect(logo.props.className).toEqual(classes.join(' '));
  });
});

