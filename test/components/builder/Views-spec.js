import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import View from '../../../src/js/components/builder/ViewDefDetail';
import Views from '../../../src/js/components/builder/ViewDefList';
import Sidebar from 'grommet/components/Sidebar';
import Split from 'grommet/components/Split';
import { Link } from 'react-router';
import * as types from '../../../src/js/constants/ActionTypes'
import { Provider } from 'react-redux';
import store from '../../store/views';
import mockViews from '../../mockdata/views.json';

function setupView() {
  let props = {
    selectedView: mockViews[0],
    onValueChange: () => console.log('onValueChange'),
    onSubmit: () => console.log('onSubmit')
  }
  let output = TestUtils.renderIntoDocument(
    <View {...props} />
  );
  return {
    props,
    output
  }
}

function setupViews(fetching) {
  let props = {
    isFetchingViewList: fetching,
    views: fetching ? mockViews : []
  }
  let output = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <Views {...props} />
    </Provider>
  );
  return {
    store,
    output
  }
}

describe('views - components/builder/Views-spec.js', () => {
  it('should render View correctly', () => {
    let { output } = setupView();
    let form = TestUtils.findRenderedDOMComponentWithTag(output, 'form');
    expect(form).toExist();
    var inputs = TestUtils.scryRenderedDOMComponentsWithTag(output, 'input');
    expect(inputs.length).toEqual(12);
    //let [li1, li2, li3] = lis.map(li => li.textContent);
    //expect(li1).toEqual("Asset template 1");
    //expect(li2).toEqual("Asset template 1");
    //expect(li3).toEqual("Assets");
  })

  it('should render Views correctly', () => {
    let { store, output } = setupViews(true);
    let links = TestUtils.scryRenderedComponentsWithType(output, Link);
    expect(links.length).toEqual(3);
    let [link1, link2, link3] = links.map(link => link);
    expect(link1.props.to).toEqual("/views/" + mockViews[0]._id);
    expect(link2.props.to).toEqual("/views/" + mockViews[1]._id);
    expect(link3.props.to).toEqual("/views/" + mockViews[2]._id);
  })

  it('should render Views with no data', () => {
    let { store, output } = setupViews(false);
    let links = TestUtils.scryRenderedComponentsWithType(output, Link);
    expect(links.length).toEqual(0);
  })

})