// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, {Component} from 'react';
import {Link} from 'react-router';
import Header from 'grommet/components/Header';
import Box from 'grommet/components/Box';
import Title from 'grommet/components/Title';
import Logo from './Logo'; // './HPELogo';
import Menu from 'grommet/components/Menu';
import SessionMenu from './SessionMenu';
import { getHeaderNavs } from '../actions';

class NavHeader extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
  }

  render() {
    const defaultLinks = [
      // {to: '/home', text: 'Home'},
      {to: '/search', text: 'Search'},
      {to: '/insight', text: 'Insight'},
      {to: '/explorer', text: 'Records'},
      {to: '/views', text: 'Builder'},
      {to: '/aql', text: 'Graph'},
      {to: '/ucmdbAdapter', text: 'Adapter'}
    ];

    const links = [];
    const headerNavs = getHeaderNavs();
    defaultLinks.map(link => {
      const basePath = link.to.split('/')[1];
      if (!headerNavs || headerNavs[basePath]) {
        links.push(link);
      }
    });

    return (
      <Header fixed={true} size="small">
        <Box full="horizontal" direction="row" justify="between" colorIndex="neutral-1" pad={{vertical: 'small'}}>
          <Title><Logo /> AM Browser</Title>
          <Menu direction="row" align="center" responsive={false}>
            {
              links.map((link, index) => <Link key={index} to={link.to}
                                               activeClassName="active link-disabled">{link.text}</Link>)
            }
            <SessionMenu />
          </Menu>
        </Box>
      </Header>
    );
  }
}

export default NavHeader;
