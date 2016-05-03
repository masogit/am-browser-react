// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getIntegrationPoint, adapterSideBarClick } from '../../actions';
import history from '../../RouteHistory';
import {UCMDBAdapter} from './Templates.js';

let firstStart = true;
class UCMDBAdapterComp extends Component {
  constructor () {
    super();
  }

  componentDidMount() {
    this.props.getIntegrationPoint();
    this.integrationPointInterval = setInterval(() => {
      this.props.getIntegrationPoint();
    },60*1000);
  }

  componentWillReceiveProps(nextProps) {
    if (firstStart && nextProps.data.length > 0) {
      this.props.onMenuClick(nextProps.data[0].name);
      history.pushState(null, `/ucmdbAdapter/populationJobs/${nextProps.data[0].name}`);
      firstStart = false;
    }
  }

  componentWillUnmount () {
    firstStart = true;
    clearInterval(this.integrationPointInterval);
  }

  render () {
    return (
        <UCMDBAdapter {...this.props}/>
    );
  }
}

const select = (state) => {
  return {
    data: state.ucmdbAdapter.data,
    dataError: state.ucmdbAdapter.dataError,
    tabName: state.ucmdbAdapter.tabName
  };
};

const menuAction = (dispatch) => {
  return {
    onMenuClick: pointName => dispatch(adapterSideBarClick(pointName)),
    getIntegrationPoint: () => dispatch(getIntegrationPoint())
  };
};


export default connect(select, menuAction)(UCMDBAdapterComp);
