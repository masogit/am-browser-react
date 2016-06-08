// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {navResponsive} from '../actions';
import AlertForm from './commons/AlertForm';
import {App, Box} from 'grommet';
import NavHeader from './NavHeader';
import store from '../store';
import * as Types from '../constants/ActionTypes';

class Indexer extends Component {

  constructor() {
    super();
    this._onResponsive = this._onResponsive.bind(this);
  }

  _onResponsive(responsive) {
    this.props.dispatch(navResponsive(responsive));
  }

  _newErrorRead() {
    store.dispatch({type: Types.NEW_ERROR_READ});
  }

  render() {
    const {newError, headerNavs} = this.props;
    let header;
    if (headerNavs) {
      header = <NavHeader headerNavs={headerNavs}/>;
    }
    let alert;
    if (newError) {
      alert = (
          // <Notification status="critical" message={newError} onClick={this._newErrorRead}/>
        <AlertForm onClose={this._newErrorRead} status="critical" title={"Error alert"}
                   desc={newError} onConfirm={this._newErrorRead}/>
      );
    }
    return (
      <App>
        <Box full={true} className='main-container'>
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
    {newError: state.error ? state.error.new : null}
  );
};

export default connect(select)(Indexer);
