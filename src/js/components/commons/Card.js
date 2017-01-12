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
        <Box key={`tile-${index}`} colorIndex="light-2" margin="small" pad="small">
        <Tile key={`${record[header]}-${index}`} separator="top" align="stretch" justify="between" colorIndex="light-1" flex={true} pad="small" size="small" onClick={onSelect.bind(this, index)}>
          <Header size="small" justify="center"><b>{record[header]}</b></Header>
          <Box pad={{vertical: "small"}}>
          {
            summary.map((row, index) => {
              return (
                record[row.value] !== undefined  &&
                  <Box key={index} style={this.renderSortStyle(row.value)} justify="between" direction="row" >
                    <Box>{row.label}</Box>
                    <Box>{record[row.value]}</Box>
                  </Box>
              );
            })
          }
          </Box>
          <Footer justify="between">
            <Box>{footer}: {record[footer]}</Box>
          </Footer>
        </Tile>
        </Box>
      );
    });

    return (
      <Box>
        <Header justify="between" margin={{vertical: "small"}} pad={{horizontal: "small"}}>
          <Title>{title}</Title>
          <SortMenu data={body} onSort={this.sort} />
        </Header>
        <Tiles flush={false}  className={className}>
          {tiles}
        </Tiles>
      </Box>
    );
  }
}
