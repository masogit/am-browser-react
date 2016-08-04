/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Login from '../../src/js/components/Login';
import {Split, LoginForm, Footer} from 'grommet';
import store from '../store';
import { Provider } from 'react-redux';
import Rest from '../util/rest-promise.js';
import * as config from '../../src/js/constants/ServiceConfig';
import nock from 'nock';

describe('components - components/Login-spec.js', () => {
  it('should render MessageHistory correctly', () => {
    nock.disableNetConnect();
    nock(config.HOST_NAME_DEV)
      .get(config.ABOUT_DEF_URL)
      .reply(200, {about: {ambVersion: '1.1'}});

    const login = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    const split = TestUtils.findRenderedComponentWithType(login, Split);
    expect(split).toExist();

    const loginForm = TestUtils.findRenderedComponentWithType(login, LoginForm);
    expect(loginForm).toExist();

    const footer = TestUtils.scryRenderedComponentsWithType(login, Footer);
    // sidebar has footer
    expect(footer.length).toEqual(2);
    nock.cleanAll();
  });
});

