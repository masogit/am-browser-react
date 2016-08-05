import React, {Component} from 'react';
import {Box, Header, Title, Footer, Tiles, Tile} from 'grommet';
import SortMenu from '../commons/SortMenu';

export default class Vendor extends Component {
  constructor() {
    super();
    this.state = {
      sortBy: '',
      sortStyle: {
        color: '#DC2878',
        fontWeight: 'bold',
        fontSize: '120%'
      }
    };
    this.sort = this.sort.bind(this);
  }

  renderSortStyle(sortBy) {
    return this.state.sortBy == sortBy && this.state.sortStyle;
  }

  renderNonCompliance(nonCompliance) {
    return (
      <Box flex={true} style={this.renderSortStyle('nonCompliance')}>
        {nonCompliance ? `${nonCompliance} Non-Compliance` : ''}
      </Box>
    );
  }

  renderOverCompliance(overCompliance) {
    return (
      <Box flex={true} style={this.renderSortStyle('overCompliance')}>
        {overCompliance ? `${overCompliance} Over-Compliance` : ''}
      </Box>
    );
  }

  sort(value) {
    this.setState({
      sortBy: value
    });
  }

  renderTile() {
    let tiles = this.props.data;
    let sortBy = this.state.sortBy;
    if (sortBy)
      tiles.sort((a, b) => {
        let aa = a[sortBy] || 0;
        let bb = b[sortBy] || 0;
        return aa - bb;
      }).reverse();

    return tiles.map((vendor, index) => {
      return (
        <Tile key={index} separator="top" colorIndex="light-1" pad="small">
          <Header>
            {vendor.name}
          </Header>
          {this.renderNonCompliance(vendor.nonCompliance)}
          {this.renderOverCompliance(vendor.overCompliance)}
          <Footer justify="between">
            <Box>Total Products:</Box>
            <Box>{vendor.products}</Box>
          </Footer>
        </Tile>
      );
    });
  }

  render() {

    let sortData = [
      // {label: 'Name', value: 'name'},
      {label: 'Non-Compliance', value: 'nonCompliance'},
      {label: 'Over-Compliance', value: 'overCompliance'}
    ];

    return (
      <Box flex={true}>
        <Header justify="between">
          <Title>Vendor</Title>
          <SortMenu data={sortData} onSort={this.sort} />
        </Header>
        <Tiles flush={false} justify="center" colorIndex="light-2" full="horizontal" selectable={true} onSelect={this.props.onSelect} className="autoScroll">
          {this.renderTile()}
        </Tiles>
      </Box>
    );
  }
}
