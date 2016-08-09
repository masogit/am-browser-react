// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, {Component} from 'react';
import {Link} from 'react-router';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Menu from 'grommet/components/Menu';
import SessionMenu from './SessionMenu';
import {alert, stopMonitorEdit} from '../actions/system';
import history from '../RouteHistory';
import _ from 'lodash';
import store from '../store';

export default class NavHeader extends Component {
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

    return (
      <Header fixed={true} size="small" full="horizontal" direction="row" justify="between" colorIndex="neutral-1"
              pad={{vertical: 'small'}} responsive={false}>
        <Title>
          <img src="../../img/favicon.png" className='logo'/> AM Browser
        </Title>
        <Menu direction="row" align="center" responsive={true}>
          {
            links.map((link, index) => (
              <Link key={index} to={link.to}
                    className={`${this.getActive(link.to)}`}
                    onClick={e => {
                      const state = store.getState();
                      if(state.session.edit) {
                        let now = state.session.edit.now;
                        if (typeof now == 'string') {
                          const params = now.split('.');
                          now = params.reduce((state, next) => state[next], state);
                        }
                        if(!_.isEqual(state.session.edit.origin, now)) {
                          e.preventDefault();
                          const goLink = defaultLinks.filter(linkObj => linkObj.to == link.to)[0];
                          const alertInfo = {
                            onConfirm: () => {
                              stopMonitorEdit();
                              history.push(link.to);
                            },
                            msg: 'Your current change will lost, still want go?',
                            title: `Go to ${goLink.text}`
                          };

                          alert(alertInfo);
                        } else {
                          stopMonitorEdit();
                        }
                      } else {
                        stopMonitorEdit();
                      }
                    }}
                    style={{textDecoration: 'none'}}>{link.text}</Link>))
          }
          <SessionMenu />
        </Menu>
      </Header>
    );
  }
}

