// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { navResponsive } from '../actions';
import { App } from 'grommet';
//import Split from 'grommet/components/Split';
//import NavSidebar from './NavSidebar';
import NavHeader from './NavHeader';
import cookies from 'js-cookie';

class Indexer extends Component {

  constructor() {
    super();
    this._onResponsive = this._onResponsive.bind(this);
  }

  _onResponsive(responsive) {
    this.props.dispatch(navResponsive(responsive));
  }

  render() {
    //const { active: navActive } = this.props;
    let children, header;
    if (cookies.get('csrf-token')) {
      header = <NavHeader headerNavs={this.props.headerNavs}/>;
      children = (
        <div className='main-body-container'>
          <div className='main-body'>
            {this.props.children}
          </div>
        </div>
      );
    } else {
      children = this.props.children;
    }

    return (
      <App centered={false}>
        {header}
        {children}
      </App>
    );
  }
}

let select = (state) => {
  return Object.assign({}, state.nav, {
    headerNavs: state.session.headerNavs
  });
};

export default connect(select)(Indexer);
