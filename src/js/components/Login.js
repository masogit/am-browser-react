// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { login, initAbout, loginFailure } from '../actions';
import Split from 'grommet/components/Split';
import Section from 'grommet/components/Section';
import Sidebar from 'grommet/components/Sidebar';
import LoginForm from 'grommet/components/LoginForm';
import Footer from 'grommet/components/Footer';
import Label from 'grommet/components/Label';
import Logo from './Logo';
import cookies from 'js-cookie';

class IndexerLogin extends Component {

  constructor() {
    super();
    this._onSubmit = this._onSubmit.bind(this);
    this._onResponsive = this._onResponsive.bind(this);
    this.state = {responsive: 'multiple', ambVersion: null};
  }

  componentDidMount() {
    initAbout().then((res) => {
      this.setState({ambVersion: res.about.ambVersion});
    });
  }

  _onResponsive(responsive) {
    this.setState({responsive: responsive});
  }

  _onSubmit(fields) {
    if (fields.username) {
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
            logo={<Logo size="large" />}
            title="Asset Manager Browser"
            onSubmit={this._onSubmit}
            errors={errors}
            usernameType='text'
            defaultValues={{
              username: cookies.get('user'),
              rememberMe: true
            }}/>
          <Footer justify="end">
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
