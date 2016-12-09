import React, {Component} from 'react';
import * as SAMActions from '../../actions/sam';
import {Box} from 'grommet';
import RecordListLayer from '../explorer/RecordListLayer';
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
        version: null,
        license: null,
        software: null
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
    let body_license = {
      label: 'Software Counters',
      sqlname: 'amSoftLicCounter',
      // groupby: 'LicType.Name',
      fields: [{
        sqlname: 'Name',
        alias: 'Version'
      }, {
        sqlname: 'dLicUseRights',
        alias: 'License'
      }, {
        sqlname: 'dSoftInstallCount',
        alias: 'Consumption'
      }, {
        sqlname: 'dCompliancy',
        alias: 'Compliancy'
      }, {
        sqlname: 'dUnusedInstall',
        alias: 'Unused'
      }, {
        sqlname: 'SoftInstQuery.TableName',
        alias: 'Table'
      }, {
        sqlname: 'SoftInstQuery.memQueryText',
        alias: 'Query'
      }],
      filter: `dSoftInstallCount> 0 AND Brand.Name='${this.state.product.data[selected].name}'`
    };

    this.setState({
      license: null,
      software: null
    }, () => {
      this.setState({
        license: body_license
      });
    });

  }

  renderSoftware(record) {
    console.log(record);
    let filter = record['SoftInstQuery.memQueryText'];
    let table = record['SoftInstQuery.TableName'];
    let parent = '';

    switch(record['SoftInstQuery.TableName']) {
      case 'amSoftInstall':
        parent = 'ParentPortfolio.Computer';
        break;
      case 'amMonitoredApp':
        parent = 'MonParentPortfolio.Computer';
        break;
      case 'amMonSWComp':
        parent = 'MonApp.MonParentPortfolio.Computer';
        break;
      case 'amIBMConsPoints':
        parent = 'Computer';
        break;
      case 'amPortfolio':
        parent = 'SoftInstall.ParentPortfolio.Computer';
        break;
      default:
        filter = `seType=0 AND bMissing=0 AND seType=0 AND Model.Name='${record.Name}'`;
    }

    let body_software = {
      "orderby": "",
      "filter": filter,
      "sqlname": table,
      "label": "Computer",
      "fields": [
        {
          "alias": "Computer",
          "sqlname": parent + ".TcpIpHostName"
        },
        {
          "alias": "IPAddress",
          "sqlname": parent + ".TcpIpAddress"
        },
        {
          "alias": "Model",
          "sqlname": parent + ".Portfolio.Model.Name"
        },
        // {
        //   "alias": "User",
        //   "sqlname": "ParentPortfolio.Portfolio.User.Name"
        // },
        {
          "alias": "Type",
          "sqlname": parent + ".ComputerType"
        },
        {
          "alias": "Assignment",
          "sqlname": parent + ".Portfolio.seAssignment"
        }
      ],
      "groupby": `${parent}.ComputerType|${parent}.Portfolio.Model.Name`
    };

    this.setState({
      software: null
    }, () => {
      this.setState({
        software: body_software
      });
    });
  }

  _onClose() {
    this.setState({
      software: null
    });
  }

  render() {
    const {product, software, vendor, license} = this.state;
    return (
      <Box flex={true} direction="row" align={!product ? 'center' : 'start'} justify={!product ? 'center' : 'start'}>
        <Box flex={!this.state.product} style={product && {'width': '260px', height: '100%'}} pad={{horizontal: "small"}} className='autoScroll'>
          {
            vendor &&
            <Card {...vendor}/>
          }
        </Box>
        {
          product &&
          <Box flex={true} pad={{horizontal: "small"}} className='autoScroll' style={{height: '100%'}}>
            <Card {...product}/>
            {
              license &&
              <RecordList body={license} title="Version" allFields={true} onClick={(record) => this.renderSoftware(record)} root={true}/>
            }
          </Box>
        }
        {
          software &&
          <RecordListLayer body={software} title="Computer" onClose={this._onClose.bind(this)} allFields={true}/>
        }
      </Box>
    );
  }
}
