import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import View from '../../../src/js/components/builder/ViewDefDetail';
import Views from '../../../src/js/components/builder/ViewDefList';
import { Provider } from 'react-redux';
import store from '../../store';
import mockViews from '../../mockdata/views.json';
import GroupListItem from '../../../src/js/components/commons/GroupListItem';

function setupView() {
  let props = {
    selectedView: mockViews[0],
    onValueChange: () => console.log('onValueChange'),
    onSubmit: () => console.log('onSubmit')
  };
  let output = TestUtils.renderIntoDocument(
    <View {...props} />
  );
  return {
    props,
    output
  };
}

function setupViews(fetching) {
  let props = {
    selectedView: mockViews[0],
    isFetchingViewList: fetching,
    views: fetching ? mockViews : []
  };
  let output = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <Views {...props} />
    </Provider>
  );
  return {
    output
  };
}

describe('views - components/builder/Views-spec.js', () => {
  it('should render View correctly', () => {
    let { output } = setupView();
    let form = TestUtils.findRenderedDOMComponentWithTag(output, 'form');
    expect(form).toExist();
    var inputs = TestUtils.scryRenderedDOMComponentsWithTag(output, 'input');
    //11 fields * 5 + name + category - fields which is orderby * 3
    expect(inputs.length).toEqual(54);
    //let [li1, li2, li3] = lis.map(li => li.textContent);
    //expect(li1).toEqual("Asset template 1");
    //expect(li2).toEqual("Asset template 1");
    //expect(li3).toEqual("Assets");
  });

  it('should render Views correctly', () => {
    let { output } = setupViews(true);
    let links = TestUtils.scryRenderedComponentsWithType(output, GroupListItem);
    expect(links.length).toEqual(2);

    let [link1, link2] = [...links];
    expect(link1.props.child).toEqual('Computer Push From UCMDB');
    expect(link2.props.child).toEqual('Nature');
  });

  it('should render Views with no data', () => {
    let { output } = setupViews(false);
    let links = TestUtils.scryRenderedComponentsWithType(output, GroupListItem);
    expect(links.length).toEqual(0);
  });
});
