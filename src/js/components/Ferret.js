// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { navResponsive } from '../actions';
import { App, Box } from 'grommet';
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
    let header;
    if (cookies.get('csrf-token')) {
      header = <NavHeader headerNavs={this.props.headerNavs}/>;
    }

    return (
      <App>
        <Box full={true} className='main-container'>
        {header}
          {this.props.children}
        </Box>
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
