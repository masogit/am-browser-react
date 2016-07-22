// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {logout, sendMessageToSlack } from '../actions/system';
import User from 'grommet/components/icons/base/User';
import { Menu, Anchor, Layer, Box } from 'grommet';
import MessageHistory from './MessageHistory';
import SlackDialog from './SlackDialog';
import AboutDialog from './AboutDialog';
var Close = require('grommet/components/icons/base/Close');
var Slack = require('grommet/components/icons/base/SocialSlack');
var Logout = require('grommet/components/icons/base/Logout');
var History = require('grommet/components/icons/base/History');
var About = require('grommet/components/icons/base/Information');
var Help = require('grommet/components/icons/base/Help');

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

  _sendMessage(messages) {
    this.props.dispatch(sendMessageToSlack(messages));
  }

  showDialog(type) {
    this.setState({
      dialog: type
    });
  }

  render() {
    let dialog = {
      about: <AboutDialog />,
      history: <MessageHistory />,
      slack: <SlackDialog onClick={this._sendMessage.bind(this)} onClose={this.closeDialog}/>
    };

    return (
      <Box>
        <Menu icon={<User />} label={cookies.get('user')} dropAlign={{ right: 'right', top: 'top' }}>
          {/*
          <Anchor href="#" className="active">Settings</Anchor>
          <Anchor href="#">Help</Anchor>
           */}
          <Anchor icon={<Help />} href="http://ambrowser.readthedocs.io" target="about:blank" label="Help" className="fontNormal"/>
          <Anchor icon={<About />} onClick={() => this.showDialog("about")} label="About" className="fontNormal"/>
          <Anchor icon={<History />} onClick={() => this.showDialog("history")} label="Message History"
                  className="fontNormal"/>
          <Anchor icon={<Slack />} onClick={() => this.showDialog("slack")} label="Slack" className="fontNormal"/>
          <Anchor icon={<Logout />} onClick={this._onLogout.bind(this)} label="Logout" className="fontNormal"/>
        </Menu>
        {this.state.dialog &&
        <Layer align="center" closer={<Anchor className='grommetux-layer__closer' icon={<Close/>} onClick={this.closeDialog}/>}>
          {dialog[this.state.dialog]}
        </Layer>
        }
      </Box>
    );
  }
}

let select = (state) => ({session: state.session});

export default connect(select)(SessionMenu);
