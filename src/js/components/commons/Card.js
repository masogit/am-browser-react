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
    let sortBy = this.state.sortBy;
    let {data, className, conf: {footer, header, body}, title, onSelect} = this.props;

    if (sortBy) {
      data.sort((a, b) => {
        let aa = a[sortBy] || 0;
        let bb = b[sortBy] || 0;
        return aa - bb;
      }).reverse();
    }

    const tiles = data.map((record, index) => {
      let summary = [];
      body.forEach((row, index) => {
        if (record[row.value] !== undefined)
          summary.push(row);
      });

      return (
        <Tile key={`${record[header]}-${index}`} separator="top" colorIndex="light-1" pad="small" size="small" flex={false}>
          <Header>{record[header]}</Header>
          {
            summary.map((row, index) => {
              return (
                <Box key={index} flex={true} style={this.renderSortStyle(row.value)}>
                  {record[row.value] !== undefined  ? `${record[row.value]} ${row.label}` : ''}
                </Box>
              );
            })
          }
          <Footer justify="between">
            <Box>{footer}: {record[footer]}</Box>
          </Footer>
        </Tile>
      );
    });

    return (
      <Box>
        <Header justify="between">
          <Title>{title}</Title>
          <SortMenu data={body} onSort={this.sort} />
        </Header>
        <Tiles flush={false} colorIndex="light-2" selectable={true} onSelect={onSelect} className={className}>
          {tiles}
        </Tiles>
      </Box>
    );
  }
}
