// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getIntegrationJob, integrationJobSelect, integrationJobTabSwitch } from '../../actions';
import {IntegrationJobTemplate} from './Templates.js';

export default class IntegrationJobContainer extends Component {
  constructor () {
    super();
  }

  componentDidMount() {
    this.props.getIntegrationJob(this.props);
    this.integrationJobInterval = setInterval(() => {
      this.props.getIntegrationJob(this.props);
    },60*1000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pointName !== this.props.pointName || nextProps.tabName !== this.props.tabName) {
      this.props.getIntegrationJob(nextProps);
    }
  }

  componentWillUnmount () {
    clearInterval(this.integrationJobInterval);
  }


  onTabClick(tabName) {
    this.props.onTabClick(tabName, this.props.pointName);
  }

  render () {
    return (
      <IntegrationJobTemplate {...this.props} onTabClick={this.onTabClick.bind(this)}/>
    );
  }
}