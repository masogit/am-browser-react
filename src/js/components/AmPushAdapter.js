// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import Split from 'grommet/components/Split';
import { connect } from 'react-redux';
import { getIntegrationPoint, pushAdapterSideBarClick } from '../actions';
var Status = require('grommet/components/icons/Status');
var Sidebar = require('grommet/components/Sidebar');
var Menu = require('grommet/components/Menu');
import { Link } from 'react-router';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import history from '../RouteHistory';
import {statusAdapter} from '../constants/StatusAdapter.js';

let firstStart = true;

class AmPushAdapter extends Component {

  constructor () {
    super();
  }

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch(getIntegrationPoint());
    this.integrationPointInterval = setInterval(() => {
      dispatch(getIntegrationPoint());
    },30*1000);
  }

  componentWillReceiveProps(nextProps) {
    if (firstStart && nextProps.data.length > 0) {
      this.props.dispatch(pushAdapterSideBarClick(nextProps.data[0].name));
      history.pushState(null, `/pushAdapter/populationJobs/${nextProps.data[0].name}`);
      firstStart = false;
    }
  }

  componentWillUnmount () {
    firstStart = true;
    clearInterval(this.integrationPointInterval);
  }

  _pushAdapterSideBarClick(selectedLinkName) {
    this.props.dispatch(pushAdapterSideBarClick(selectedLinkName));
  }

  render () {
    const {data} = this.props;
    let menuItems = data.map((data) => {
      return (
          <Link key={data.name} to={`/pushAdapter/${this.props.params.tabName}/${data.name}`} activeClassName="active" onClick={this._pushAdapterSideBarClick.bind(this,data.name)}>
            <Status value={statusAdapter[data.status]}/>
            <span>{data.name}</span>
          </Link>
      );
    });
    return (
        <Split flex="right" separator={true} priority="left" fixed={false}>
          <Sidebar colorIndex="light-2" className="pushAdapterSideBar">
            <Header pad="medium" justify="between">
              <Title>Integration Point</Title>
            </Header>
            <Menu primary={true}>
              {menuItems}
            </Menu>
          </Sidebar>
          {this.props.children}
        </Split>
    );
  }
}
let select = (state, props) => {
  return {
    data: state.pushadapter.data
  };
};

export default connect(select)(AmPushAdapter);
