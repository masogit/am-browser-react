// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {logout, sendMessageToSlack } from '../actions';
import User from 'grommet/components/icons/base/User';
import { Menu, Anchor, Layer, Box } from 'grommet';
import MessageHistory from './MessageHistory';
import SlackDialog from './SlackDialog';
var Close = require('grommet/components/icons/base/Close');
var Slack = require('grommet/components/icons/base/SocialSlack');
var Logout = require('grommet/components/icons/base/Logout');
var History = require('grommet/components/icons/base/History');

import cookies from 'js-cookie';

class SessionMenu extends Component {

  constructor() {
    super();
    this.closeDialog = this.closeDialog.bind(this);
    this.state = {
      dialog: null
    };
  }

  _onLogout(event) {
    event.preventDefault();
    this.props.dispatch(logout());
  }

  closeDialog() {
    this.setState({
      dialog: null
    });
  }

  showMessageDialog() {
    this.setState({
      dialog: <MessageHistory />
    });
  }

  showSlackDialog() {
    this.setState({
      dialog: <SlackDialog onClick={this._sendMessage.bind(this)} onClose={this.closeDialog}/>
    });
  }

  _sendMessage(messages) {
    this.props.dispatch(sendMessageToSlack(messages));
  }

  render() {
    return (
      <Box>
        <Menu icon={<User />} label={cookies.get('user')}>
          {/*
          <Anchor href="#" className="active">Settings</Anchor>
          <Anchor href="#">Help</Anchor>
          <Anchor href="#">About</Anchor>
           */}
          <Anchor icon={<History />} onClick={this.showMessageDialog.bind(this)}>Message History</Anchor>
          <Anchor icon={<Slack />} onClick={this.showSlackDialog.bind(this)}>Slack</Anchor>
          <Anchor icon={<Logout />} onClick={this._onLogout.bind(this)}>Logout</Anchor>
        </Menu>
        {this.state.dialog &&
        <Layer align="center" closer={<Anchor className='layer__closer' icon={<Close/>} onClick={this.closeDialog}/>}>
          {this.state.dialog}
        </Layer>
        }
      </Box>
    );
  }
}

let select = (state) => ({session: state.session});

export default connect(select)(SessionMenu);
