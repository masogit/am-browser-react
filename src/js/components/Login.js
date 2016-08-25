// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { login, initAbout, loginFailure } from '../actions/system';
import Split from 'grommet/components/Split';
import {Section, Label, Sidebar, LoginForm, Footer} from 'grommet';
import ComponentBase from './commons/ComponentBase';
import HPELogo from './HPELogo';
import cookies from 'js-cookie';

class IndexerLogin extends ComponentBase {

  constructor() {
    super();
    this._onSubmit = this._onSubmit.bind(this);
    this._onResponsive = this._onResponsive.bind(this);
    this.state = {responsive: 'multiple', ambVersion: null};
    this._isUnmount = false;
  }

  componentDidMount() {
    initAbout().then((res) => {
      if (!this._isUnmount) {
        this.setState({ambVersion: res.about.ambVersion});
      }
    });
  }

  componentWillUnmount() {
    this._isUnmount = true;
  }

  _onResponsive(responsive) {
    this.setState({
      responsive: responsive
    });
  }

  _onSubmit(fields) {
    if (this.locked) {
      return;
    }
    
    if (fields.username) {
      this.acquireLock();
      this.props.dispatch(login(fields.username, fields.password));
    } else {
      this.props.dispatch(loginFailure({message: 'Please type your user name'}));
    }
  }

  render() {
    const { session } = this.props;

    var image;
    if ('multiple' === this.state.responsive) {
      image = <Section pad="none" texture="url(img/login.jpg)"/>;
    }

    var loginError = session.error;
    var errors = [];
    if (loginError) {
      var message;
      var resolution;
      message = loginError.message;
      if (loginError.resolution) {
        resolution = loginError.resolution;
      }
      errors.push(message);
      errors.push(resolution);
    }

    return (
      <Split flex="left" separator={true} onResponsive={this._onResponsive}>
        {image}
        <Sidebar justify="center" align="center" pad="medium" size="large">
          <LoginForm
            title="Asset Manager Browser"
            onSubmit={this._onSubmit}
            errors={errors}
            usernameType='text'
            defaultValues={{
              username: cookies.get('user'),
              rememberMe: true
            }}/>
          <Footer justify="between">
            <HPELogo size="large"/>
            <Label>
              {this.state.ambVersion}
            </Label>
          </Footer>
        </Sidebar>
      </Split>
    );
  }
}

IndexerLogin.propTypes = {
  session: PropTypes.shape({
    email: PropTypes.string,
    error: PropTypes.shape({
      message: PropTypes.string,
      resolution: PropTypes.string
    }),
    token: PropTypes.string
  })
};

let select = (state) => ({session: state.session});

export default connect(select)(IndexerLogin);
