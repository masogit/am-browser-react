// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
var Status = require('grommet/components/icons/Status');
import { connect } from 'react-redux';
import { getIntegrationJobItem } from '../../actions';
import {statusAdapter} from '../../constants/StatusAdapter.js';
import {IntegrationJobItemContainer} from './Templates.js';

class IntegrationJobItem extends Component {

  constructor () {
    super();
  }

  componentDidMount() {
    const { pointName, tabName, integrationJobName} = this.props;
    this.props.getIntegrationJobItem(pointName, tabName, integrationJobName);
    this.integrationJobItemInterval = setInterval(() => {
      this.props.getIntegrationJobItem(this.props.pointName, this.props.tabName, this.props.integrationJobName);
    },60*1000);
  }

  componentWillReceiveProps(nextProps) {
    const { pointName, tabName, integrationJobName} = this.props;
    if (integrationJobName !== nextProps.integrationJobName) {
      this.props.getIntegrationJobItem(pointName, tabName, nextProps.integrationJobName);
    }
  }

  componentWillUnmount () {
    clearInterval(this.integrationJobItemInterval);
  }

  render () {
    return (
      <IntegrationJobItemContainer {...this.props} />
    );
  }
}
let select = (state) => {
  return {
    integrationJobName: state.ucmdbAdapter.integrationJobName,
    tabName: state.ucmdbAdapter.tabName,
    pointName: state.ucmdbAdapter.pointName,
    integrationJobItemData: state.ucmdbAdapter.integrationJobItemData,
    integrationJobItemDataError: state.ucmdbAdapter.integrationJobItemDataError
  };
};

const jobItemDispatch = (dispatch) => {
  return {
    getIntegrationJobItem: (pointName, tabName, integrationJobName) => {
      dispatch(getIntegrationJobItem(pointName, tabName, integrationJobName));
    }
  };
};
export default connect(select, jobItemDispatch)(IntegrationJobItem);
