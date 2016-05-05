// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getIntegrationJobItem } from '../../actions';
import {IntegrationJobItemTemplate} from './Templates.js';

export default class IntegrationJobItemContainer extends Component {
  constructor () {
    super();
  }

  componentDidMount() {
    this.props.getIntegrationJobItem(this.props);
    this.integrationJobItemInterval = setInterval(() => {
      this.props.getIntegrationJobItem(this.props);
    },60*1000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pointName !== this.props.pointName || nextProps.tabName !== this.props.tabName || this.props.integrationJobName !== nextProps.integrationJobName) {
      const integrationJobName = nextProps.integrationJobName;
      this.props.getIntegrationJobItem(nextProps);
    }
  }

  componentWillUnmount () {
    clearInterval(this.integrationJobItemInterval);
  }

  render () {
    return (
      <IntegrationJobItemTemplate {...this.props} />
    );
  }
}
