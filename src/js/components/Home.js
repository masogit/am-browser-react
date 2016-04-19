import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadTemplates } from '../actions';
import Widget from './Widget';

export default class Home extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
    this.props.dispatch(loadTemplates());
  }

  render() {
    const {templates} = this.props;
    return (
      <div>
        <Widget templates={templates}/>
      </div>
    );
  }
}

Home.propTypes = {
  templates: PropTypes.array.isRequired
};

let select = (state, props) => {
  return {
    templates: state.explorer.templates
  };
};

export default connect(select)(Home);
