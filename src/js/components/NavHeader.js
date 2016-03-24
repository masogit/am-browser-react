// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { Link } from 'react-router';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Logo from './Logo'; // './HPELogo';
//import UserSettingsIcon from 'grommet/components/icons/base/UserSettings';
//import Anchor from 'grommet/components/Anchor';
import Menu from 'grommet/components/Menu';
import SessionMenu from './SessionMenu';

class NavHeader extends Component {

  constructor() {
    super();
  }

  render() {
    return (
      <Header size="small" justify="between" colorIndex="neutral-1" pad={{vertical: 'small'}}>
        <Title><Logo /> AM Browser</Title>
        <Menu direction="row" align="center" responsive={false}>
          <Link key="1" to="/explorer" activeClassName="active">
            Explorer
          </Link>
          <Link key="2" to="/builder" activeClassName="active">
            Builder
          </Link>
          <Link key="3" to="/aql" activeClassName="active">
            AQL
          </Link>
          <SessionMenu />
        </Menu>
      </Header>
    );
  }
}

export default NavHeader;
