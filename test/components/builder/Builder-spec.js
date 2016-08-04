/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Builder from '../../../src/js/components/builder/Builder';
import MetaData from '../../../src/js/components/builder/MetaData';
import Spinning from 'grommet/components/icons/Spinning';
import store from '../../store';
import { Provider } from 'react-redux';
import Rest from '../../util/rest-promise.js';
import * as Types from '../../../src/js/constants/ActionTypes';
import mockMetadata from '../../mockdata/metadata.json';
import {SearchInput} from 'grommet';
import * as config from '../../../src/js/constants/ServiceConfig';
import mockViews from '../../mockdata/views.json';
import nock from 'nock';

describe('builder - components/builder/Builder-spec.js', () => {
  it('should render Builder correctly -spinning', () => {
    const builder = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Builder />
      </Provider>
    );

    const loadingIcon = TestUtils.findRenderedComponentWithType(builder, Spinning);
    expect(loadingIcon).toExist();
  });

  it('should render MetaData correctly', () => {
    nock.disableNetConnect();
    nock(config.HOST_NAME_DEV)
      .get(config.AM_SCHEMA_DEF_URL)
      .reply(200, mockViews);

    store.dispatch({
      type: Types.LOAD_METADATA_DETAIL_SUCCESS,
      rows: mockMetadata.rows,
      elements: mockMetadata.elements
    });

    const builder = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Builder linkNames={[]}/>
      </Provider>
    );

    const metaData = TestUtils.findRenderedComponentWithType(builder, MetaData);
    expect(metaData).toExist();

    const input = TestUtils.findRenderedComponentWithType(builder, SearchInput);
    expect(input).toExist();
    nock.cleanAll();
  });
});

