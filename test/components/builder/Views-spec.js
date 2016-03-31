import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import View from '../../../src/js/components/builder/View';
import Views from '../../../src/js/components/builder/Views';
import Sidebar from 'grommet/components/Sidebar';
import Split from 'grommet/components/Split';
import { Link } from 'react-router';
import * as types from '../../../src/js/constants/ActionTypes'
import { Provider } from 'react-redux';
import store from '../../store/views';

let views = [{
  "$loki": 1,
  "name": "Asset template 1",
  "description": "Asset template 1",
  "group": "Assets"
}, {
  "$loki": 2,
  "name": "Asset template 2",
  "description": "Asset template 2",
  "group": "Assets"
}, {
  "$loki": 3,
  "name": "Asset template 3",
  "description": "Asset template 3",
  "group": "Assets"
}];

function setupView() {
  let props = {
    view: views //expect.createSpy()
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
    isFetching: fetching,
    params: {id: 1}
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
    let lis = TestUtils.scryRenderedDOMComponentsWithTag(output, 'li');
    expect(lis.length).toEqual(3);
    let [li1, li2, li3] = lis.map(li => li.textContent);
    expect(li1).toEqual("Asset template 1");
    expect(li2).toEqual("Asset template 1");
    expect(li3).toEqual("Assets");
  })

  it('should render Views correctly', () => {
    let { store, output } = setupViews(true);
    store.dispatch({
      type: types.RECEIVE_VIEWS_SUCCESS,
      views: views
    });
    let links = TestUtils.scryRenderedComponentsWithType(output, Link);
    expect(links.length).toEqual(3);
    let [link1, link2, link3] = links.map(link => link);
    expect(link1.props.children).toEqual("Asset template 1");
    expect(link1.props.to).toEqual("/views/1");
    expect(link2.props.children).toEqual("Asset template 2");
    expect(link2.props.to).toEqual("/views/2");
    expect(link3.props.children).toEqual("Asset template 3");
    expect(link3.props.to).toEqual("/views/3");
  })

  it('should render Views with no data', () => {
    let { store, output } = setupViews(false);
    store.dispatch({
      type: types.RECEIVE_VIEWS_SUCCESS,
      views: []
    });
    let links = TestUtils.scryRenderedComponentsWithType(output, Link);
    expect(links.length).toEqual(0);
  })

})