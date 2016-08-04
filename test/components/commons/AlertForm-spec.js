/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import AlertForm from '../../../src/js/components/commons/AlertForm';
import {Notification, Layer, Box} from 'grommet';

const getAlertForm = (status) => {
  const renderer = TestUtils.createRenderer();
  const props = {
    status: status,
    onClose: () => {},
    onConfirm: () => {},
    desc: 'dummy desc'
  };
  renderer.render(<AlertForm {...props}/>);

  return renderer.getRenderOutput();
};

describe('commons - components/explorer/AlertForm-spec.js', () => {
  it('should render AlertForm correctly -with status', () => {
    let box = getAlertForm('ok');
    expect(box.type).toEqual(Box);
    let notification = box.props.children;
    expect(notification.type).toEqual(Notification);
  });

  it('should render AlertForm correctly -without status', () => {
    let box = getAlertForm();
    expect(box.type).toEqual(Box);
    let layer = box.props.children;
    expect(layer.type).toEqual(Layer);
  });
});

