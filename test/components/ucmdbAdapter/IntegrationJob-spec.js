/**
 * Created by huling on 7/29/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import IntegrationJob from '../../../src/js/components/ucmdbAdapter/IntegrationJob';
import { Provider } from 'react-redux';
import store from '../../store';
import mockData from '../../mockdata/ucmdbAdatper.json';
import {Table} from 'grommet';
import Status from 'grommet/components/icons/Status';

function setupJobs(jobType) {
  jobType = jobType || 'populationJobs';
  let props = {
    integrationJobData: mockData.jobs,
    tabName: jobType,
    pointName: 'push_GA',
    integrationJobName: 'AM Node Push 2.0',
    onIntegrationJobSelect: () => console.log(`get ${jobType} jobs\n`),
    onTabClick: () => console.log(`click ${jobType} tab\n`),
    getJob: () => console.log(`getJobs\n`)
  };

  return TestUtils.renderIntoDocument(
    <Provider store={store}>
      <IntegrationJob {...props} />
    </Provider>
  );
}

describe('ucmdbAdapter - components/ucmdbAdapter/IntegrationJob-spec.js', () => {
  it('should render IntegrationJob correctly', () => {
    const RenderedPoints = setupJobs();
    const table = TestUtils.findRenderedComponentWithType(RenderedPoints, Table);
    expect(table).toExist();

    var status = TestUtils.scryRenderedComponentsWithType(RenderedPoints, Status);
    expect(status.length).toEqual(3);
  });

  it('should render IntegrationJob correctly - push', () => {
    const RenderedPoints = setupJobs('pushJobs');
    const table = TestUtils.findRenderedComponentWithType(RenderedPoints, Table);
    expect(table).toExist();

    var ths = TestUtils.scryRenderedDOMComponentsWithTag(RenderedPoints, 'th');
    expect(ths.length).toEqual(3);

    var tds = TestUtils.scryRenderedDOMComponentsWithTag(RenderedPoints, 'td');
    expect(tds.length).toEqual(9);
  });

  it('should render IntegrationJob correctly - population', () => {
    const RenderedPoints = setupJobs();
    const table = TestUtils.findRenderedComponentWithType(RenderedPoints, Table);
    expect(table).toExist();

    var ths = TestUtils.scryRenderedDOMComponentsWithTag(RenderedPoints, 'th');
    expect(ths.length).toEqual(4);

    var tds = TestUtils.scryRenderedDOMComponentsWithTag(RenderedPoints, 'td');
    expect(tds.length).toEqual(12);
  });
});
