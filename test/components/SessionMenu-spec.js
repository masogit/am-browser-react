/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import SessionMenu from '../../src/js/components/SessionMenu/MenuContainer';
import {Anchor, Menu} from 'grommet';
import store from '../store';
import { Provider } from 'react-redux';

describe('components - components/SessionMenu-spec.js', () => {
  it('should render SessionMenu correctly', () => {
    const sessionMenu = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <SessionMenu />
      </Provider>
    );

    let menu = TestUtils.findRenderedComponentWithType(sessionMenu, Menu);
    expect(menu).toExist();


    let anchor = TestUtils.scryRenderedComponentsWithType(sessionMenu, Anchor);
    expect(anchor.length).toEqual(0);

    // TODO: click button anchor will show
    /*let button = TestUtils.findRenderedDOMComponentWithTag(sessionMenu, 'button');
    TestUtils.Simulate.click(button);
    let anchor = TestUtils.scryRenderedComponentsWithType(sessionMenu, Anchor);
    expect(anchor.length).toEqual(5);*/
  });
});

