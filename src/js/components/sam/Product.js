import React, {Component} from 'react';
import {Box, Header, Title, Footer, Tiles, Tile} from 'grommet';
import SortMenu from '../commons/SortMenu';

export default class Product extends Component {
  constructor() {
    super();
    this.state = {
      sortBy: '',
      sortStyle: {
        color: '#0A64A0',
        fontWeight: 'bold',
        fontSize: '120%'
      }
    };
    this.sort = this.sort.bind(this);
  }

  renderSortStyle(sortBy) {
    return this.state.sortBy == sortBy && this.state.sortStyle;
  }

  sort(value) {
    this.setState({
      sortBy: value
    });
  }

  render() {
    let tiles = this.props.data;
    let sortBy = this.state.sortBy;
    if (sortBy)
      tiles.sort((a, b) => {
        let aa = a[sortBy] || 0;
        let bb = b[sortBy] || 0;
        return aa - bb;
      }).reverse();

    tiles = tiles.map((product, index) => {
      return (
        <Tile key={`${product.name}-${index}`} separator="top" colorIndex="light-1" pad="small">
          <Header>{product.name}</Header>
          <Box flex={true} style={this.renderSortStyle('unused')}>{product.unused} Unused</Box>
          <Box flex={true} style={this.renderSortStyle('entitled')}>{product.entitled} Entitled</Box>
          <Footer justify="between">
            <Box>Versions: {product.versions}</Box>
          </Footer>
        </Tile>
      );
    });

    let sortData = [
      {label: 'Unused', value: 'unused'},
      {label: 'Entitled', value: 'entitled'}
    ];

    return (
      <Box flex={false}>
        <Header justify="between">
          <Title>Product</Title>
          <SortMenu data={sortData} onSort={this.sort} />
        </Header>
        <Tiles flush={false} justify="start" colorIndex="light-2" selectable={true} onSelect={this.props.onSelect}>
          {tiles}
        </Tiles>
      </Box>
    );
  }
}
