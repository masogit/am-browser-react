import React, {Component} from 'react';
import {Box, Header, Footer, Tiles, Tile} from 'grommet';

export default class Vendor extends Component {
  constructor() {
    super();
  }

  renderNonCompliance(nonCompliance) {
    return (
      <Box flex={true}>
        {nonCompliance ? `${nonCompliance} Non-Compliance` : ''}
      </Box>
    );
  }

  renderOverCompliance(overCompliance) {
    return (
      <Box flex={true}>
        {overCompliance ? `${overCompliance} Over-Compliance` : ''}
      </Box>
    );
  }

  render() {
    let tiles = this.props.data.map((vendor, index) => {
      return (
        <Tile key={index} separator="top" colorIndex="light-1" pad="small">
          <Header>{vendor.name}</Header>
          {this.renderNonCompliance(vendor.nonCompliance)}
          {this.renderOverCompliance(vendor.overCompliance)}
          <Footer justify="between">
            <Box>Total Products:</Box>
            <Box>{vendor.products}</Box>
          </Footer>
        </Tile>
      );
    });

    return (
      <Tiles flush={false} justify="center" colorIndex="light-2" full="horizontal" selectable={true}>
        {tiles}
      </Tiles>
    );
  }
}
