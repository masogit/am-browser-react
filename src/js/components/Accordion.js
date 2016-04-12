import React, { Component, PropTypes } from 'react';
import AccordionItem from './AccordionItem';

export default class Accordion extends Component {

  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <AccordionItem summary={this.props.summary} details={this.props.details}/>
        <AccordionItem summary={this.props.summary} details={this.props.details}/>
        <AccordionItem summary={this.props.summary} details={this.props.details}/>
        <AccordionItem summary={this.props.summary} details={this.props.details}/>
      </div>
    );
  }
}

Accordion.propTypes = {
  summary: PropTypes.string.isRequired,
  details: PropTypes.string.isRequired
};
