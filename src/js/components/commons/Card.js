import React, {Component} from 'react';
import {Box, Header, Title, Footer, Tiles, Tile} from 'grommet';
import SortMenu from './SortMenu';

export default class Card extends Component {
  constructor() {
    super();
    this.state = {
      sortBy: ''
    };
    this.sort = this.sort.bind(this);
  }

  renderSortStyle(sortBy) {
    return this.state.sortBy == sortBy && this.props.sortStyle;
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

    tiles = tiles.map((record, index) => {
      return (
        <Tile key={`${record[this.props.conf.header]}-${index}`} separator="top" colorIndex="light-1" pad="small" size="small">
          <Header>{record[this.props.conf.header]}</Header>
          {
            this.props.conf.body.map((row, index) => {
              return record[row.value] &&
                <Box key={index} flex={true} style={this.renderSortStyle(row.value)}>{`${record[row.value]} ${row.label}`}</Box>;
            })
          }
          <Footer justify="between">
            <Box>{this.props.conf.footer}: {record[this.props.conf.footer]}</Box>
          </Footer>
        </Tile>
      );
    });

    return (
      <Box>
        <Header justify="between">
          <Title>{this.props.title}</Title>
          <SortMenu data={this.props.conf.body} onSort={this.sort} />
        </Header>
        <Tiles flush={false} colorIndex="light-2" selectable={true} onSelect={this.props.onSelect}>
          {tiles}
        </Tiles>
      </Box>
    );
  }
}
