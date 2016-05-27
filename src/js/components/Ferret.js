// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { navResponsive } from '../actions';
import { App } from 'grommet';
//import Split from 'grommet/components/Split';
//import NavSidebar from './NavSidebar';
import NavHeader from './NavHeader';

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

    var pane1 = localStorage.token ? <NavHeader /> : null; //navActive ? <NavSidebar /> : null;
    var pane2 = this.props.children;

    return (
      <App centered={false}>
        {pane1}
        <div className='main-body-container'>
          <div className='main-body'>
            {pane2}
          </div>
        </div>
      </App>
    );
  }
}

let select = (state) => state.nav;

export default connect(select)(Indexer);
