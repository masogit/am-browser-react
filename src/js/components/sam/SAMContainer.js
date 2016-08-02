import React, {Component} from 'react';
import * as SAMActions from '../../actions/sam';
import {Split, Box} from 'grommet';
import Vendor from './Vendor';
import Product from './Product';

export default class SAMContainer extends Component {
  constructor() {
    super();
    this.state = {
      vendors: [],
      products: []
    };
    this.renderProduct = this.renderProduct.bind(this);
  }

  componentWillMount() {
    SAMActions.vendorWithBrand((vendors) => {
      this.setState({
        vendors: vendors
      });
    });
  }

  renderProduct(selectedVendor) {
    let vendorName = this.state.vendors[selectedVendor].name;

    SAMActions.productInVendor(vendorName, (products) => {
      this.setState({
        products: products
      });
    });
  }

  render() {
    return (
      <Split separator={true} flex="left">
        <Box flex={true} align="center" justify="center">
          <Vendor data={this.state.vendors} onSelect={this.renderProduct}/>
        </Box>
        {
          this.state.products.length > 0 &&
          <Box flex={true} align="center" justify="center">
            <Product data={this.state.products} onSelect={this.renderProduct}/>
          </Box>
        }
      </Split>
    );
  }
}
