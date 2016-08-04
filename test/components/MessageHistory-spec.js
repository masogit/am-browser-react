/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import MessageHistory from '../../src/js/components/MessageHistory';
import {Header, Table, TableRow} from 'grommet';
import store from '../store';
import { Provider } from 'react-redux';
import {RECEIVE_ERROR} from '../../src/js/constants/ActionTypes';
import Status from 'grommet/components/icons/Status';

describe('components - components/MessageHistory-spec.js', () => {
  beforeEach(() => {
    store.dispatch({
      type: RECEIVE_ERROR,
      msg: 'dummy msg'
    });
  });

  it('should render MessageHistory correctly', () => {
    const sessionMenu = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <MessageHistory />
      </Provider>
    );

    const header = TestUtils.findRenderedComponentWithType(sessionMenu, Header);
    expect(header).toExist();

    const table = TestUtils.scryRenderedComponentsWithType(sessionMenu, Table);
    expect(table).toExist();

    const status = TestUtils.findRenderedComponentWithType(sessionMenu, Status);
    expect(status).toExist();
    expect(status.props.value).toExist('critical');

    const tr = TestUtils.scryRenderedComponentsWithType(sessionMenu, TableRow);
    expect(tr).toExist();
    expect(tr.length).toEqual(1);
    const td = tr[0].props.children;
    expect(td.length).toEqual(3);
    expect(td[2].props.children).toEqual('dummy msg');
  });
});

