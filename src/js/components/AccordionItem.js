import React, { Component, PropTypes } from 'react';
import Section from 'grommet/components/Section';

const styles = {
  active: {
    display: 'block',
    backgroundColor: '#008667'
  },
  inactive: {
    display: 'none',
    backgroundColor: '#008667'
  }
};

export default class AccordionItem extends Component {

  constructor() {
    super();
    this.state = {
      active: false
    };
    this._onToggle = this._onToggle.bind(this);
  }

  _onToggle() {
    this.setState({
      active: !this.state.active
    });
  }

  render() {
    const stateStyle = this.state.active ? styles.active : styles.inactive;
    return (
      <Section pad={{"horizontal": "medium", "vertical": "medium", "between": "medium"}}>
        <a onClick={this._onToggle}>
            {this.props.category}
        </a>
        <p style={stateStyle}>
            {this.props.children}
        </p>
      </Section>
    );
  }
}

AccordionItem.propTypes = {
  category: PropTypes.string.isRequired
};
