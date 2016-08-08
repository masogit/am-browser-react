import React, {Component} from 'react';
import * as SAMActions from '../../actions/sam';
import {Box} from 'grommet';
import Vendor from './Vendor';
import Product from './Product';
import Version from './Version';


export default class SAMContainer extends Component {
  constructor() {
    super();
    this.state = {
      vendors: [],
      products: []
    };
    this.renderProduct = this.renderProduct.bind(this);
    this.renderVersion = this.renderVersion.bind(this);
  }

  componentWillMount() {
    SAMActions.vendorWithBrand().then((vendors) => {
      this.setState({
        vendors: vendors,
        version: null
      });
    });
  }

  renderProduct(selected) {
    let name = this.state.vendors[selected].name;

    SAMActions.productInVendor(name).then((products) => {
      this.setState({
        products: [],
        version: null
      }, () => {
        this.setState({
          products: products
        });
      });
    });
  }

  renderVersion(selected) {
    let body = {
      label: 'Software Counters',
      sqlname: 'amSoftLicCounter',
      groupby: 'LicType.Name',
      fields: [{
        sqlname: 'LicType.Name',
        alias: 'License Metric'
      }, {
        sqlname: 'dLicUseRights',
        alias: 'License Rights'
      }, {
        sqlname: 'dSoftInstallCount',
        alias: 'Consumption'
      }, {
        sqlname: 'dCompliancy',
        alias: 'Compliancy'
      }, {
        sqlname: 'dUnusedInstall',
        alias: 'Unused Installation'
      }],
      filter: `dSoftInstallCount> 0 AND Brand.Name='${this.state.products[selected].name}'`
    };

    this.setState({
      version: null
    }, () => {
      this.setState({
        version: body
      });
    });

  }

  render() {
    return (
      <Box flex={true} direction="row" align={this.state.products.length == 0 && "center"} justify={this.state.products.length == 0 && "center"}>
        <Box flex={this.state.products.length == 0} style={this.state.products.length > 0 && {'width': '500px'}} pad={{horizontal: "small"}}>
          <Vendor data={this.state.vendors} onSelect={this.renderProduct}/>
        </Box>
        {
          this.state.products.length > 0 &&
          <Box flex={true}>
            <Product data={this.state.products} onSelect={this.renderVersion}/>
            <Version data={this.state.version} />
          </Box>
        }
      </Box>
    );
  }
}
