// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import {IntegrationJobItemTemplate} from './IntegrationJobItemTemplate.js';

export default class IntegrationJobItemContainer extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    this.props.getJobItem();
    this.integrationJobItemInterval = setInterval(() => {
      this.props.getJobItem();
    }, 60 * 1000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pointName !== this.props.pointName || nextProps.tabName !== this.props.tabName || this.props.integrationJobName !== nextProps.integrationJobName) {
      this.props.getJobItem();
    }
  }

  componentWillUnmount() {
    clearInterval(this.integrationJobItemInterval);
  }

  render() {
    return (
      <IntegrationJobItemTemplate {...this.props} />
    );
  }
}
