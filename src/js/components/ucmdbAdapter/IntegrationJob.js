// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import {IntegrationJobTemplate} from './IntegrationJobTemplate.js';

export default class IntegrationJobContainer extends Component {
  constructor () {
    super();
  }

  componentDidMount() {
    this.props.getJob();
    this.integrationJobInterval = setInterval(() => {
      this.props.getJob();
    },60*1000);
  }

  componentWillReceiveProps(nextProps) {
    if ( nextProps.tabName && (this.props.pointName !== nextProps.pointName || this.props.tabName !== nextProps.tabName)) {
      this.props.getJob(nextProps);
    } else if (nextProps.params.tabName && nextProps.params.tabName != nextProps.tabName) {
      // if use change url manually
      this.onTabClick(nextProps.params.tabName, nextProps.pointName);
    }
  }

  componentWillUnmount () {
    clearInterval(this.integrationJobInterval);
  }


  onTabClick(tabName, pointName = this.props.pointName) {
    this.props.onTabClick(tabName, pointName);
  }

  render () {
    return <IntegrationJobTemplate {...this.props} onTabClick={this.onTabClick.bind(this)} className='ssdf'/>;
  }
}
