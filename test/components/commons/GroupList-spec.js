/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import GroupList from '../../../src/js/components/commons/GroupList';
import {Box, SearchInput} from 'grommet';
import Spinning from 'grommet/components/icons/Spinning';

const getGroupList = (props) => {
  const renderer = TestUtils.createRenderer();
  return renderer.render(<GroupList {...props}/>);
};

describe('commons - components/explorer/GroupList-spec.js', () => {
  it('should render GroupList correctly -searchable', () => {
    const props = {
      children: [],
      searchable: true
    };
    const groupList = getGroupList(props);
    expect(groupList.type).toEqual(Box);
    const input = groupList.props.children[0].props.children;
    expect(input.type).toEqual(SearchInput);
  });

  it('should render GroupList correctly -loading', () => {
    const props = {
      children: [],
      loading: true
    };
    const groupList = getGroupList(props);
    const box = groupList.props.children[1];
    const listItem = box.props.children;
    const spinning = listItem.props.children;
    expect(spinning.type).toEqual(Spinning);
  });
});

