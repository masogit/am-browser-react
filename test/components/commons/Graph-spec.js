/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Graph from '../../../src/js/components/commons/Graph';
import mockData from '../../mockdata/graph.json';
import {Chart, Meter, Distribution, Legend} from 'grommet';

const getGraph = (type, config, data) => {
  const renderer = TestUtils.createRenderer();
  const props = {
    config: config || {
      series_col: []
    },
    data: data || {
      rows: []
    },
    type: type || 'unknown'
  };
  return renderer.render(<Graph {...props}/>);
};

describe('commons - components/explorer/Graph-spec.js', () => {
  it('should render Graph correctly - unknown type', () => {
    let graph = getGraph();
    expect(graph.type).toEqual('div');
  });

  it('should render Graph correctly - chart', () => {
    let graph = getGraph('chart', mockData.config.chart, mockData.data);
    expect(graph.type).toEqual(Chart);
  });

  it('should render Graph correctly - meter', () => {
    let graph = getGraph('meter', mockData.config.meter, mockData.data);
    expect(graph.type).toEqual(Meter);
  });

  it('should render Graph correctly - distribution', () => {
    let graph = getGraph('distribution', mockData.config.distribution, mockData.data);
    expect(graph.type).toEqual(Distribution);
  });

  it('should render Graph correctly - legend', () => {
    let graph = getGraph('legend', mockData.config.legend, mockData.data);
    expect(graph.type).toEqual(Legend);
  });
});

