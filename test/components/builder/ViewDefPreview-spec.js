/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import ViewDefPreview from '../../../src/js/components/builder/ViewDefPreview';
import RecordList from '../../../src/js/components/explorer/RecordList';
import {Layer} from 'grommet';

describe('builder - components/builder/ViewDefPreview-spec.js', () => {
  it('should render ViewDefPreview correctly -active', () => {
    const renderer = TestUtils.createRenderer();
    const props = {
      active: true,
      closePreview: () => {},
      selectedView: {
        body: {
          fields: [],
          links: []
        },
        name: 'dummy name'
      }
    };
    const preview = renderer.render(<ViewDefPreview {...props}/>);
    expect(preview.type).toEqual(Layer);

    const list = preview.props.children.props.children;
    expect(list.type).toEqual(RecordList);
  });

  it('should render ViewDefPreview correctly -inActive', () => {
    const renderer = TestUtils.createRenderer();
    const props = {
      active: false
    };
    const preview = renderer.render(<ViewDefPreview {...props}/>);
    expect(preview.type).toEqual('span');

  });
});

