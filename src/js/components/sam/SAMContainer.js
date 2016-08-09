import React, {Component} from 'react';
import * as SAMActions from '../../actions/sam';
import {Box} from 'grommet';
import Card from '../commons/Card';
import RecordList from '../explorer/RecordList';

export default class SAMContainer extends Component {
  constructor() {
    super();
    this.state = {
      product: null
    };
    this.renderProduct = this.renderProduct.bind(this);
    this.renderVersion = this.renderVersion.bind(this);
  }

  componentWillMount() {
    SAMActions.vendorWithBrand().then((vendors) => {
      this.setState({
        vendor: {
          title: 'Vendor',
          data: vendors,
          onSelect: this.renderProduct,
          conf: {
            header: 'name',
            body: [
              {label: 'Non-Compliance', value: 'nonCompliance'},
              {label: 'Over-Compliance', value: 'overCompliance'}
            ],
            footer: 'products'
          },
          sortStyle: {
            color: '#DC2878',
            fontWeight: 'bold',
            fontSize: '120%'
          }
        },
        version: null
      });
    });
  }

  renderProduct(selected) {
    let name = this.state.vendor.data[selected].name;

    SAMActions.productInVendor(name).then((products) => {
      this.setState({
        product: null,
        version: null
      }, () => {
        this.setState({
          product: {
            title: 'Product',
            data: products,
            onSelect: this.renderVersion,
            conf: {
              header: 'name',
              body: [
                {label: 'Unused', value: 'unused'},
                {label: 'Entitled', value: 'entitled'}
              ],
              footer: 'versions'
            },
            sortStyle: {
              color: '#0A64A0',
              fontWeight: 'bold',
              fontSize: '120%'
            }
          }
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
      filter: `dSoftInstallCount> 0 AND Brand.Name='${this.state.product.data[selected].name}'`
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
      <Box flex={true} direction="row" align={!this.state.product ? 'center' : 'start'} justify={!this.state.product ? 'center' : 'start'}>
        <Box flex={!this.state.product} style={this.state.product && {'width': '500px'}} pad={{horizontal: "small"}}>
          {
            this.state.vendor &&
            <Card {...this.state.vendor}/>
          }
        </Box>
        {
          this.state.product &&
          <Box flex={true}>
            <Card {...this.state.product}/>
            {
              this.state.version &&
              <RecordList body={this.state.version} title="Version" allFields={true}/>
            }
          </Box>
        }
      </Box>
    );
  }
}
