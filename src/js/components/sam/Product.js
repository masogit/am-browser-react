import React, {Component} from 'react';
import {Box, Header, Footer, Tiles, Tile} from 'grommet';

export default class Product extends Component {
  constructor() {
    super();
  }

  render() {
    let tiles = this.props.data.map((product, index) => {
      return (
        <Tile key={`${product.name}-${index}`} separator="top" colorIndex="light-1" pad="small">
          <Header>{product.name}</Header>
          <Box flex={true}>{product.unused} Unused</Box>
          <Box flex={true}>{product.entitled} Entitled</Box>
          <Footer justify="between">
            <Box>Versions: {product.versions}</Box>
          </Footer>
        </Tile>
      );
    });

    return (
      <Tiles flex={false} flush={false} justify="start" colorIndex="light-2" selectable={true} onSelect={this.props.onSelect}>
        {tiles}
      </Tiles>
    );
  }
}
