import React, {Component} from 'react';
import * as SAMActions from '../../actions/sam';
import {Box} from 'grommet';
import Vendor from './Vendor';

export default class SAMContainer extends Component {
  constructor() {
    super();
    this.state = {
      vendors: []
    };
  }

  componentWillMount() {
    SAMActions.vendorWithBrand((vendors) => {
      this.setState({
        vendors: vendors
      });
    });
  }

  renderVendors() {

  }

  render() {
    return (
      <Box flex={true} align="center" justify="center">
        <Vendor data={this.state.vendors} />
      </Box>
    );
  }
}
