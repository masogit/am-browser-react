// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { login, initAbout } from '../actions/system';
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
    this.state = {
      responsive: 'multiple',
      ambVersion: null,
      loading: false,
      error: {
        message: ''
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.session.error) {
      const error = this.state.error;
      error.message = nextProps.session.error.message;
      this.setState({error});
    }
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

    this.setState({loading: true, error: {}});
    if (fields.username) {
      this.acquireLock();
      this.props.dispatch(login(fields.username, fields.password, () => this.setState({loading: false})));
    } else {
      this.setState({
        loading: false,
        error: {
          message: 'Please type your user name'
        }
      });
    }
  }

  render() {
    const { error: loginError, responsive, loading, ambVersion } = this.state;

    var image;
    if ('multiple' === responsive) {
      image = <Section pad="none" texture="url(img/login.jpg)" full={true}/>;
    }

    const errors = [loginError.message, loginError.resolution];

    return (
      <Split flex="left" onResponsive={this._onResponsive}>
        {image}
        <Sidebar justify="center" align="center" pad="medium" size="large" colorIndex="light-1">
          <LoginForm
            title="Asset Manager Browser"
            onSubmit={loading ? null : this._onSubmit}
            errors={errors}
            usernameType='text'
            defaultValues={{
              username: cookies.get('user'),
              rememberMe: true
            }}/>
          <Footer justify="between">
            <HPELogo size="large"/>
            <Label>
              {ambVersion}
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
