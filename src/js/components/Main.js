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
let msgRemainTime = 5000;
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

  isNewMessage() {
    const length = this.props.message.msgs.length;
    if (length > 1) {
      const lastMessage = this.props.message.msgs[length - 1];
      const newMessage = this.props.message;
      return lastMessage.id != newMessage.id;
    }
    return length != 1;
  }

  render() {
    const {message, headerNavs, path} = this.props;
    let header;
    if (headerNavs) {
      header = <NavHeader headerNavs={headerNavs} path={path}/>;
    }
    let alert;
    if (headerNavs && message.msg) { // not display in login page
      if (timeout && this.isNewMessage()) {
        clearTimeout(timeout);
      }
      alert = (
        <AlertForm onClose={this._newMsgRead} status={message.status} title={message.title || "Message alert"}
                   desc={message.msg} onConfirm={message.onConfirm || this._newMsgRead}/>
      );
      if (message.status) {
        timeout = setTimeout(this._newMsgRead, msgRemainTime);
      }
    }
    return (
      <App centered={false}>
        <Box full='vertical' style={{height: '100%'}}>
          {alert || header}
          {this.props.children}
        </Box>
      </App>
    );
  }
}

let select = (state) => ({...state.nav,
    headerNavs: state.session.headerNavs,
    message: state.message,
    path: state.router.location.pathname
});

export default connect(select)(Indexer);
