// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, {Component} from 'react';
import {Link} from 'react-router';
import {Box, Header, Heading, Menu, Search} from 'grommet';
import SessionMenu from './SessionMenu/MenuContainer';
import {dropCurrentPop_stopMonitor} from '../actions/system';
import history from '../RouteHistory';

export default class NavHeader extends Component {
  getActive(to) {
    return this.props.path.indexOf(to) > -1 ? 'active' : '';
  }

  onSearch(event) {
    if (event.keyCode == 13 && event.target.value.trim())
      history.push(`/search/${encodeURI(event.target.value)}`);
  }

  render() {
    const defaultLinks = [
      // {to: '/home', text: 'Home'},
      // {to: '/search', text: 'Search'},
      {to: '/insight', text: 'Insight'},
      {to: '/sam', text: 'SAM'},
      {to: '/explorer', text: 'Viewer'},
      {to: '/report', text: 'Reports'},
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
      <Header fixed={true} size="medium" direction="row" justify="between" responsive={false} className='shadow'>
        <Box direction="row">
          <Box margin={{horizontal: 'large'}} size="small" responsive={false} className="app-name">
            <Heading tag="h2" strong={true}>AM Browser</Heading>
          </Box>
          <Search placeHolder="Type anywhere to search" inline={true} iconAlign="start"
                  onKeyDown={this.onSearch.bind(this)}/>
        </Box>
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
