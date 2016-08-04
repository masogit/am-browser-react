import React, {Component} from 'react';
import {Box} from 'grommet';
import RecordList from '../explorer/RecordList';

export default class Product extends Component {
  constructor() {
    super();
  }

  render() {

    return (
      <Box flex={true}>
      {
        this.props.data &&
        <RecordList body={this.props.data} title="Version"/>
      }
      </Box>
    );
  }
}
