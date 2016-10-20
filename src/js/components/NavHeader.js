// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, {Component} from 'react';
import {Link} from 'react-router';
import {Header, Title, Menu } from 'grommet';
import SessionMenu from './SessionMenu/MenuContainer';
import {dropCurrentPop_stopMonitor, toggleSidebar} from '../actions/system';
import history from '../RouteHistory';

export default class NavHeader extends Component {
  getActive(to) {
    return this.props.path.indexOf(to) > -1 ? 'active' : '';
  }

  render() {
    const defaultLinks = [
      // {to: '/home', text: 'Home'},
      {to: '/search', text: 'Search'},
      {to: '/insight', text: 'Insight'},
      {to: '/sam', text: 'SAM'},
      {to: '/explorer', text: 'Viewer'},
      {to: '/views', text: 'Builder'},
      {to: '/aql', text: 'Graph'},
      {to: '/ucmdbAdapter', text: 'Adapter'}
    ];

    const links = [];
    if (this.props.headerNavs) {
      defaultLinks.map(link => {
        const basePath = link.to.split('/')[1];
        if (this.props.headerNavs[basePath]) {
          links.push(link);
        }
      });
    }

    return (
      <Header fixed={true} size="medium" full="horizontal" direction="row" justify="between" colorIndex="neutral-1" responsive={false} className='shadow'>
        <Title>
          <img src="../../img/favicon.png" className='logo' onClick={toggleSidebar}/> AM Browser
        </Title>
        <Menu direction="row" align="center" responsive={true}>
          {
            links.map((link, index) => (
              <Link key={index} to={link.to}
                    className={`grommetux-anchor ${this.getActive(link.to)}`}
                    onClick={e => {
                      e.preventDefault();
                      const goLink = defaultLinks.filter(linkObj => linkObj.to == link.to)[0];
                      dropCurrentPop_stopMonitor(`Go to ${goLink.text}`, () => history.push(link.to));
                    }}
                    style={{backgroundColor: 'transparent'}}>{link.text}</Link>))
          }
          <SessionMenu />
        </Menu>
      </Header>
    );
  }
}

