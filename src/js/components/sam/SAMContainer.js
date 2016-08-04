import React, {Component} from 'react';
import * as SAMActions from '../../actions/sam';
import {Box, Header, Title} from 'grommet';
import RecordList from '../explorer/RecordList';
import Vendor from './Vendor';
import Product from './Product';
// import Version from './Version';


export default class SAMContainer extends Component {
  constructor() {
    super();
    this.state = {
      vendors: [],
      products: [],
      versionQuery: ''
    };
    this.renderProduct = this.renderProduct.bind(this);
    this.renderVersion = this.renderVersion.bind(this);
  }

  componentWillMount() {
    SAMActions.vendorWithBrand().then((vendors) => {
      this.setState({
        vendors: vendors
      });
    });
  }

  renderProduct(selected) {
    let name = this.state.vendors[selected].name;

    SAMActions.productInVendor(name).then((products) => {
      this.setState({
        products: products
      });
    });
  }

  renderVersion(selected) {
    let body = {
      sqlname: 'amSoftLicCounter',
      groupby: 'Brand.Name',
      fields: [{
        sqlname: 'dCompliancy',
        alias: 'Compliancy'
      }, {
        sqlname: 'dSoftInstallCount',
        alias: 'Installed'
      }, {
        sqlname: 'dUnusedInstall',
        alias: 'Un-Installed'
      }, {
        sqlname: 'dEntitled',
        alias: 'Entitled'
      }],
      filter: `dSoftInstallCount> 0 AND Brand.Name='${this.state.products[selected].name}'`
    };

    this.setState({
      versionQuery: body,
      version: null
    }, () => {
      this.setState({
        version: <RecordList body={body} title="Version" root={true}/>
      });
    });

  }

  render() {
    return (
      <Box flex={true} direction="row">
        <Box flex={true} align="center" justify="center" style={this.state.products.length > 0 && {'width': '500px'}}>
          <Header>
            <Title>Vendor</Title>
          </Header>
          <Vendor data={this.state.vendors} onSelect={this.renderProduct}/>
        </Box>
        {
          this.state.products.length > 0 &&
          <Box flex={true} align="stretch" justify="center">
            <Header>
              <Title>Product</Title>
            </Header>
            <Product data={this.state.products} onSelect={this.renderVersion}/>
            {this.state.version}
          </Box>
        }
      </Box>
    );
  }
}
