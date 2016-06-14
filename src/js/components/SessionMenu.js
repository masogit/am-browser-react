// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {logout} from '../actions';
import Menu from 'grommet/components/Menu';
import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import Layer from 'grommet/components/Layer';
import User from 'grommet/components/icons/base/User';
import ErrorHistory from './ErrorHistory';

class SessionMenu extends Component {

  constructor() {
    super();
    this._onLogout = this._onLogout.bind(this);
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

  showErrorDialog() {
    var layer = (
      <Layer onClose={this.closeDialog.bind(this)} closer={true}>
        <ErrorHistory />
      </Layer>
    );
    this.setState({
      dialog: layer
    });
  }

  render() {
    return (
      <Box>
        <Menu icon={<User />} label="User">
          <Anchor href="#" className="active">Settings</Anchor>
          <Anchor onClick={this.showErrorDialog.bind(this)}>Error Log</Anchor>
          <Anchor href="#">Help</Anchor>
          <Anchor href="#">About</Anchor>
          <Anchor href="#" onClick={this._onLogout}>Logout</Anchor>
        </Menu>
        {this.state.dialog}
      </Box>
    );
  }

}

let select = (state) => ({session: state.session});

export default connect(select)(SessionMenu);
