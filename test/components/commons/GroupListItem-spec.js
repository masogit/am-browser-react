/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import GroupListItem from '../../../src/js/components/commons/GroupListItem';
import {ListItem} from 'grommet';

describe('commons - components/explorer/GroupListItem-spec.js', () => {
  it('should render GroupListItem correctly', () => {
    const renderer = TestUtils.createRenderer();
    const groupby = 'dummy groupby';
    const listItem = renderer.render(<GroupListItem groupby={groupby}/>);

    expect(listItem.type).toEqual(ListItem);
    expect(listItem.props.separator).toEqual('none');
    expect(listItem.props.groupby).toEqual(groupby);
  });
});

