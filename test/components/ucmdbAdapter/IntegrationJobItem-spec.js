/**
 * Created by huling on 7/29/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import IntegrationJobItem from '../../../src/js/components/ucmdbAdapter/IntegrationJobItem';
import { Provider } from 'react-redux';
import store from '../../store/ucmdbAdapter';
import mockData from '../../mockdata/ucmdbAdatper.json';
import {Table} from 'grommet';
import Status from 'grommet/components/icons/Status';

function setupJobItems(jobType) {
  jobType = jobType || 'populationJobs';
  let props = {
    integrationJobItemDataError: null,
    integrationJobItemData: mockData.jobItems,
    tabName: jobType,
    pointName: 'push_GA',
    integrationJobName: 'AM Node Push 2.0',
    getJobItem: () => console.log(`get ${jobType} job items\n`)
  };

  return TestUtils.renderIntoDocument(
    <Provider store={store}>
      <IntegrationJobItem {...props} />
    </Provider>
  );
}

describe('ucmdbAdapter - components/ucmdbAdapter/IntegrationJobItem-spec.js', () => {
  it('should render IntegrationJobItem correctly', () => {
    const RenderedPoints = setupJobItems();
    const table = TestUtils.findRenderedComponentWithType(RenderedPoints, Table);
    expect(table).toExist();

    var status = TestUtils.scryRenderedComponentsWithType(RenderedPoints, Status);
    expect(status.length).toEqual(1);
  });

  it('should render IntegrationJobItem correctly - push', () => {
    const RenderedPoints = setupJobItems('pushJobs');
    const table = TestUtils.findRenderedComponentWithType(RenderedPoints, Table);
    expect(table).toExist();

    var ths = TestUtils.scryRenderedDOMComponentsWithTag(RenderedPoints, 'th');
    expect(ths.length).toEqual(8);

    var tds = TestUtils.scryRenderedDOMComponentsWithTag(RenderedPoints, 'td');
    expect(tds.length).toEqual(8);
  });

  it('should render IntegrationJobItem correctly - population', () => {
    const RenderedPoints = setupJobItems();
    const table = TestUtils.findRenderedComponentWithType(RenderedPoints, Table);
    expect(table).toExist();

    var ths = TestUtils.scryRenderedDOMComponentsWithTag(RenderedPoints, 'th');
    expect(ths.length).toEqual(6);

    var tds = TestUtils.scryRenderedDOMComponentsWithTag(RenderedPoints, 'td');
    expect(tds.length).toEqual(6);
  });
});
