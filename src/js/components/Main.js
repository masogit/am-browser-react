// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {navResponsive} from '../actions/system';
import AlertForm from './commons/AlertForm';
import {App, Box} from 'grommet';
import NavHeader from './NavHeader';
import store from '../store';
import * as Types from '../constants/ActionTypes';
let timeout;

class Indexer extends Component {

  constructor() {
    super();
    this._onResponsive = this._onResponsive.bind(this);
  }

  _onResponsive(responsive) {
    this.props.dispatch(navResponsive(responsive));
  }

  _newMsgRead() {
    store.dispatch({type: Types.MESSAGE_READ});
  }

  render() {
    const {message, headerNavs} = this.props;
    let header;
    if (headerNavs) {
      header = <NavHeader headerNavs={headerNavs}/>;
    }
    let alert;
    if (headerNavs && message.msg) { // not display in login page
      if (timeout) {
        clearTimeout(timeout);
      }
      alert = (
        <AlertForm onClose={this._newMsgRead} status={message.status} title={"Message alert"}
                   desc={message.msg} onConfirm={this._newMsgRead}/>
      );
      timeout = setTimeout(this._newMsgRead, 5000);
    }
    return (
      <App >
        <Box className='main-container'>
          {header}
          {alert}
          {this.props.children}
        </Box>
      </App>
    );
  }
}

let select = (state) => {
  return Object.assign(
    {},
    state.nav,
    {headerNavs: state.session.headerNavs},
    {message: state.message}
  );
};

export default connect(select)(Indexer);