// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { Link } from 'react-router';
import Header from 'grommet/components/Header';
import Box from 'grommet/components/Box';
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
      <Header fixed={true} size="small">
      <Box full="horizontal" direction="row" justify="between" colorIndex="neutral-1" pad={{vertical: 'small'}}>
        <Title><Logo /> AM Browser</Title>
        <Menu direction="row" align="center" responsive={false}>
          <Link key="0" to="/home" activeClassName="active link-disabled">
            Home
          </Link>
          <Link key="1" to="/views" activeClassName="active link-disabled">
            Views
          </Link>
          <Link key="2" to="/aql" activeClassName="active link-disabled">
            AQL
          </Link>
          <Link key="3" to="/ucmdbAdapter" activeClassName="active link-disabled">
            Adapter
          </Link>
          <SessionMenu />
        </Menu>
      </Box>
      </Header>
    );
  }
}

export default NavHeader;
