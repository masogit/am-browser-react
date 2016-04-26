import React, { Component, PropTypes } from 'react';
import Anchor from 'grommet/components/Anchor';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';

export default class BreadCrumb extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
  }

  _onClick() {
    this.props.clearFilter();
    this.props.metadataLoad();
  }

  _onDetailClick(obj, index) {
    this.props.clearFilter();
    this.props.metadataLoadDetail(obj, this.props.elements, index);
  }

  render() {
    let elements = this.props.elements;
    let Home = require('grommet/components/icons/base/Home');
    let CaretNext = require('grommet/components/icons/base/CaretNext');
    let breadcrumbs = elements.map((element, index) => {
      if (index == 0) {
        return <td key={index}>&nbsp;&nbsp;<Home size="large" colorIndex="brand"/>&nbsp;&nbsp;<Anchor key={index} onClick={this._onClick.bind(this)}>{element.label}</Anchor></td>;
      } else if (index == elements.length - 1) {
        return <td key={index}>&nbsp;&nbsp;<CaretNext size="large" colorIndex="brand"/>&nbsp;&nbsp;{element.label}</td>;
      } else {
        return <td key={index}>&nbsp;&nbsp;<CaretNext size="large" colorIndex="brand"/>&nbsp;&nbsp;<Anchor key={index} onClick={this._onDetailClick.bind(this, element, index)}>{element.label}</Anchor></td>;
      }
    });

    return (
      <Table>
        <tbody>
          <TableRow>
          {breadcrumbs}
          </TableRow>
        </tbody>
      </Table>
    );
  }
}

BreadCrumb.propTypes = {
  elements: PropTypes.array.isRequired
};
