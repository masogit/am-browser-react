// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, {Component} from 'react';
import {Link} from 'react-router';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Menu from 'grommet/components/Menu';
import SessionMenu from './SessionMenu';

class NavHeader extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
  }

  getActive(to) {
    return this.props.path.indexOf(to) > -1 ? 'active' : '';
  }

  render() {
    const defaultLinks = [
      // {to: '/home', text: 'Home'},
      {to: '/search', text: 'Search'},
      {to: '/insight', text: 'Insight'},
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

    let logoStyle = {
      marginLeft: '20px',
      marginRight: '20px'
    };


    return (
      <Header fixed={true} size="small" full="horizontal" direction="row" justify="between" colorIndex="neutral-1"
              pad={{vertical: 'small'}} responsive={false}>
        <Title>
          <img src="../../img/favicon.png" style={logoStyle}/> AM Browser
        </Title>
        <Menu direction="row" align="center" responsive={true}>
          {
            links.map((link, index) => <Link key={index} to={link.to} className={`anchor ${this.getActive(link.to)}`}>{link.text}</Link>)
          }
          <SessionMenu />
        </Menu>
      </Header>
    );
  }
}

export default NavHeader;
