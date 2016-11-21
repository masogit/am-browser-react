import React, {Component} from 'react';
import * as SAMActions from '../../actions/sam';
import {Box} from 'grommet';
import RecordListLayer from '../explorer/RecordListLayer';
import Card from '../commons/Card';
import RecordList from '../explorer/RecordList';
import history from '../../RouteHistory';

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
        history.push(`/sam/${name}`);
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
    let filter = record['SoftInstQuery.memQueryText'];
    let table = record['SoftInstQuery.TableName'];
    let parent = '';

    switch(record['SoftInstQuery.TableName']) {
      case 'amSoftInstall':
        parent = 'ParentPortfolio';
        break;
      case 'amMonitoredApp':
        parent = 'MonParentPortfolio';
        break;
      case 'amMonSWComp':
        parent = 'MonApp.MonParentPortfolio';
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
          "sqlname": parent + ".Computer.TcpIpHostName"
        },
        {
          "alias": "IPAddress",
          "sqlname": parent + ".Computer.TcpIpAddress"
        },
        {
          "alias": "Model",
          "sqlname": parent + ".Computer.Portfolio.Model.Name"
        },
        // {
        //   "alias": "User",
        //   "sqlname": "ParentPortfolio.Computer.Portfolio.User.Name"
        // },
        {
          "alias": "Type",
          "sqlname": parent + ".Computer.ComputerType"
        },
        {
          "alias": "Assignment",
          "sqlname": parent + ".Computer.Portfolio.seAssignment"
        }
      ],
      "groupby": `${parent}.Computer.ComputerType|${parent}.Computer.Portfolio.Model.Name`
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
    return (
      <Box flex={true} direction="row" align={!this.state.product ? 'center' : 'start'} justify={!this.state.product ? 'center' : 'start'}>
        <Box flex={!this.state.product} style={this.state.product && {'width': '260px'}} pad={{horizontal: "small"}}>
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
              this.state.license &&
              <RecordList body={this.state.license} title="Version" allFields={true} onClick={(record) => this.renderSoftware(record)} noCache={true}/>
            }
          </Box>
        }
        {
          this.state.software &&
          <RecordListLayer body={this.state.software} title="Computer" onClose={this._onClose.bind(this)} allFields={true} noCache={true}/>
        }
      </Box>
    );
  }
}
