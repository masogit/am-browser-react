import React, {Component} from 'react';
import {Box, Header, Footer, Tiles, Tile} from 'grommet';

export default class Product extends Component {
  constructor() {
    super();
  }

  render() {
    let tiles = this.props.data.map((product, index) => {
      return (
        <Tile key={index} separator="top" colorIndex="light-1" pad="small">
          <Header>{product.name}</Header>
          <Box flex={true}>Unused: {product.unused}</Box>
          <Box flex={true}>Entitled: {product.entitled}</Box>
          <Footer justify="between">
            <Box>Versions: {product.versions}</Box>
          </Footer>
        </Tile>
      );
    });

    return (
      <Tiles flush={false} justify="center" colorIndex="light-2" full="horizontal" selectable={true} onSelect={this.props.onSelect}>
        {tiles}
      </Tiles>
    );
  }
}
