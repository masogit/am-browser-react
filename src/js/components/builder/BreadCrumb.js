import React, { Component, PropTypes } from 'react';
import Anchor from 'grommet/components/Anchor';

export default class BreadCrumb extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
  }

  _onClick() {
    this.props.metadataLoad();
  }

  render() {
    var elements = this.props.elements;
    var breadcrumbs = elements.map((element, index) => {
      if (index == 0) {
        return <div key={index}><Anchor onClick={this._onClick.bind(this)}>{element}</Anchor></div>;
      } else {
        return <div key={index}><b>  --  </b><Anchor>{element}</Anchor></div>;
      }
    });

    return (
      <div>
        {breadcrumbs}
      </div>
    );
  }
}

BreadCrumb.propTypes = {
  elements: PropTypes.array.isRequired
};
