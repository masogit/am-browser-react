// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, {Component} from 'react';
import {Link} from 'react-router';
import { Box, Header, Heading, Menu, Search, Anchor, Icons } from 'grommet';


import SessionMenu from './SessionMenu/MenuContainer';
import {dropCurrentPop_stopMonitor} from '../actions/system';
import history from '../RouteHistory';

export default class NavHeader extends Component {
  componentDidMount() {
    setTimeout(this.refs.header._onResize, 200);
  }

  componentDidUpdate() {
    setTimeout(this.refs.header._onResize, 200);
  }

  getActive(to) {
    let active = false;
    if (typeof to == 'string') {
      active = this.props.path.indexOf(to) > -1;
    } else {
      active = to.some(path => this.props.path.indexOf(path) > -1);
    }

    return active ? 'active grommetux-anchor' : 'grommetux-anchor';
  }

  onSearch(event) {
    if (event.keyCode == 13 && event.target.value.trim())
      history.push(`/search/${encodeURI(event.target.value)}`);
  }

  render() {
    const defaultLinks = [
      {to: '/insight', text: 'Insight'},
      {to: '/sam', text: 'SAM'},
      {to: '/explorer', text: 'Viewer'},
      {to: '/ucmdbAdapter', text: 'Adapter'}
    ];


    const builderDefaultLinks = [
      {to: '/report', text: 'Template', icon: 'DocumentPdf'},
      {to: '/views', text: 'View', icon: 'Resources'},
      {to: '/aql', text: 'Graph', icon: 'LineChart'}
    ];

    const links = [];
    const builderLinks = [];
    if (this.props.headerNavs) {
      defaultLinks.map(link => {
        const basePath = link.to.split('/')[1];
        if (this.props.headerNavs[basePath]) {
          links.push(link);
        }
      });

      builderDefaultLinks.map(link => {
        const basePath = link.to.split('/')[1];
        if (this.props.headerNavs[basePath]) {
          builderLinks.push(link);
        }
      });
    }

    return (
      <Header fixed={true} ref='header' size="small" direction="row" justify="between" responsive={false}
              className='shadow'>
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
                    className={this.getActive(link.to)}
                    onClick={e => {
                      e.preventDefault();
                      const goLink = defaultLinks.filter(linkObj => linkObj.to == link.to)[0];
                      dropCurrentPop_stopMonitor(`Go to ${goLink.text}`, () => history.push(link.to));
                    }}>{link.text}</Link>))
          }
          {builderLinks.length > 0 &&
            <Menu inline={false} dropAlign={{right: 'right'}} responsive={true} className={'header-menu ' + this.getActive(['report', 'views', 'aql'])} label='Builder'>
              {
                builderLinks.map((link, index) => {
                  const Icon = Icons.Base[link.icon];
                  return (
                    <Anchor key={index} to={link.to} label={link.text} icon={<Icon />}
                            onClick={e => {
                              e.preventDefault();
                              const goLink = builderLinks.filter(linkObj => linkObj.to == link.to)[0];
                              dropCurrentPop_stopMonitor(`Go to ${goLink.text}`, () => history.push(link.to));
                            }}/>
                  );
                })
              }
            </Menu>
          }
          <SessionMenu />
        </Menu>
      </Header>
    );
  }
}
