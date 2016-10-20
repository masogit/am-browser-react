// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {logout, dropCurrentPop_stopMonitor } from '../../actions/system';
import {sendMessageToSlack} from '../../actions/sessionMenu';
import { Menu, Anchor, Layer, Box } from 'grommet';
import MessageHistory from './MessageHistory';
import SlackDialog from './SlackDialog';
import AboutDialog from './AboutDialog';
import Close from 'grommet/components/icons/base/Close';
import Slack from 'grommet/components/icons/base/SocialSlack';
import Logout from 'grommet/components/icons/base/Logout';
import History from 'grommet/components/icons/base/History';
import About from 'grommet/components/icons/base/Information';
import Help from 'grommet/components/icons/base/Help';
import User from 'grommet/components/icons/base/User';
import Archive from 'grommet/components/icons/base/Archive';
import history from '../../RouteHistory';

import cookies from 'js-cookie';

class SessionMenu extends Component {

  constructor() {
    super();
    this.closeDialog = this.closeDialog.bind(this);
    this.state = {
      dialog: null,
      versions: {
        list: [],
        err: ''
      }
    };
  }

  _onLogout(event) {
    event.preventDefault();
    dropCurrentPop_stopMonitor('Log out', () => this.props.dispatch(logout()));
  }

  closeDialog() {
    this.setState({
      dialog: null
    });
  }

  _sendMessage(messages) {
    sendMessageToSlack(messages);
  }

  showDialog(type) {
    this.setState({
      dialog: type
    });
  }

  getDialog(dialog) {
    switch(dialog) {
      case 'about': return <AboutDialog versions={this.state.versions}/>;
      case 'history': return <MessageHistory />;
      case 'slack': return <SlackDialog onClick={this._sendMessage.bind(this)} onClose={this.closeDialog}/>;
    }
  }
  render() {
    const dialog = this.state.dialog;

    return (
      <Box>
        <Menu icon={<User />} label={cookies.get('user')} dropAlign={{ right: 'right', top: 'top' }}>
          {/*
           <Anchor href="#" className="active">Settings</Anchor>
           <Anchor href="#">Help</Anchor>
           */}
          <Anchor icon={<Help />} href="http://ambrowser.readthedocs.io" target="about:blank" label="Help"/>
          <Anchor icon={<About />} onClick={() => this.showDialog("about")} label="About"/>
          <Anchor icon={<History />} onClick={() => this.showDialog("history")} label="Message History"/>
          <Anchor icon={<Slack />} onClick={() => this.showDialog("slack")} label="Slack"/>
          <Anchor icon={<Archive />} onClick={() =>  history.push('/my')} label="My Assets"/>
          <Anchor icon={<Logout />} onClick={this._onLogout.bind(this)} label="Logout"/>
        </Menu>
        {dialog &&
          <Layer align="center" closer={<Anchor className='grommetux-layer__closer' icon={<Close/>} onClick={this.closeDialog}/>}>
            {this.getDialog(dialog)}
          </Layer>
        }
      </Box>
    );
  }
}

let select = (state) => state;

export default connect(select)(SessionMenu);
