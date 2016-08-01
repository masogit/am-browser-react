import React, {Component} from 'react';
import {Box, Header, Footer, Tiles, Tile} from 'grommet';

export default class Vendor extends Component {
  constructor() {
    super();
  }

  render() {
    let tiles = this.props.data.map((vendor) => {
      return (
        <Tile separator="top" colorIndex="light-1" pad="small">
          <Header>{vendor.name}</Header>
          <Footer justify="between">
            <Box>Total Products:</Box>
            <Box>{vendor.products}</Box>
          </Footer>
        </Tile>
      );
    });

    console.log(tiles);

    return (
      <Tiles flush={false} justify="center" colorIndex="light-2" full="horizontal" selectable={true}>
        {tiles}
      </Tiles>
    );
  }
}
