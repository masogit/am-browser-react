import React, {Component} from 'react';
import {Box, Header, Title, Footer, Tiles, Tile, Search} from 'grommet';
import SortMenu from './SortMenu';

export default class Card extends Component {
  constructor() {
    super();
    this.state = {
      sortBy: '',
      filter: ''
    };
    this.sort = this.sort.bind(this);
    this._onSearch = this._onSearch.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps != this.props) {
      this.refs.searchInput._inputRef.value = '';
      this.setState({
        filter: ''
      });
    }
  }

  renderSortStyle(sortBy) {
    return this.state.sortBy == sortBy && this.props.sortStyle;
  }

  sort(value) {
    this.setState({
      sortBy: value
    });
  }

  _onSearch(event) {
    const value = event.target.value.trim().toLowerCase();
    this.setState({
      filter: value
    });
  }

  render() {
    let {sortBy, filter} = this.state;
    let {data, className, conf: {footer, header, body}, title, onSelect} = this.props;

    if (sortBy) {
      data.sort((a, b) => {
        let aa = a[sortBy] || 0;
        let bb = b[sortBy] || 0;
        return aa - bb;
      }).reverse();
    }

    const cards = !filter ? data : data.filter((record) => (record[header].toLowerCase().indexOf(filter) > -1));

    const tiles = cards.map((record, index) => {
      let summary = [];
      body.forEach((row, index) => {
        if (record[row.value] !== undefined)
          summary.push(row);
      });

      return (
        <Box key={`tile-${index}`} colorIndex="light-2" margin="small" pad="small">
        <Tile key={`${record[header]}-${index}`} separator="top" align="stretch" justify="between" colorIndex="light-1" flex={true} pad="small" size="small" onClick={onSelect.bind(this, record.name)}>
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
          <Box direction="row">
            <Search ref="searchInput" inline={true} placeHolder="Type to search" onDOMChange={this._onSearch}/>
            <SortMenu data={body} onSort={this.sort} />
          </Box>
        </Header>
        <Tiles flush={false}  className={className}>
          {tiles}
        </Tiles>
      </Box>
    );
  }
}
