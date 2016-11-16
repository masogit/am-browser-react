import React, {Component} from 'react';
import history from '../../RouteHistory';
import { Box } from 'grommet';
import {LongSearchInput} from '../commons/SearchInput';

export default class Search extends Component {

  constructor() {
    super();
  }

  goRecordSearch(keyword) {
    history.push(`/search/${encodeURI(keyword)}`);
  }

  render() {

    return (
      <Box align="center" justify="center" style={{flexShrink: 0, flexGrow: 1}}>
        <LongSearchInput onSearch={this.goRecordSearch.bind(this)} direction='column'/>
      </Box>
    );
  }
}
