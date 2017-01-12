import React, {Component} from 'react';
import * as SAMActions from '../../actions/sam';
import { Box, Icons } from 'grommet';
import RecordListLayer from '../explorer/RecordListLayer';
import Card from '../commons/Card';
import RecordList from '../explorer/RecordList';
import SAMBreadCrumb from '../commons/SAMBreadCrumb';

export default class SAMContainer extends Component {
  constructor() {
    super();
    this.state = {
      product: null
    };
    this.renderProduct = this.renderProduct.bind(this);
    this.renderVersion = this.renderVersion.bind(this);
    this._toOverview = this._toOverview.bind(this);
  }

  componentWillMount() {
    SAMActions.vendorWithBrand().then((vendors) => {
      this.setState({
        vendor: {
          title: 'Effective License Positioning',
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
        software: null,
        itemSelected: []
      }, () => {
        this.setState({
          product: {
            title: 'Product',
            data: products,
            onSelect: this.renderVersion,
            conf: {
              header: 'name',
              body: [
                {label: 'License', value: 'license'},
                {label: 'Consumption', value: 'consumption'},
                {label: 'Surplus', value: 'surplus'},
                {label: 'Gap', value: 'gap'}
              ],
              footer: 'versions'
            },
            sortStyle: {
              color: '#0A64A0',
              fontWeight: 'bold',
              fontSize: '120%'
            }
          },
          itemSelected: this._setItemsSelected(name)
        });
      });
    });
  }

  renderVersion(selected) {
    let name = this.state.product.data[selected].name;

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
      filter: `(dSoftInstallCount> 0 OR dLicUseRights > 0 OR dLicUseRightsUpg > 0) AND Brand.Name='${this.state.product.data[selected].name}'`
    };

    this.setState({
      license: null,
      software: null
    }, () => {
      this.setState({
        license: body_license,
        itemSelected: this._setItemsSelected(name)
      });
    });

  }

  renderSoftware(record) {
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
        return true;  // Ignore query computers for other tables, for example: amEmplDept, amSoftLicCounter etc
        // filter = `seType=0 AND bMissing=0 AND seType=0 AND Model.Name='${record.Name}'`;
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
      software: body_software
    });
  }

  _setItemsSelected(name) {
    let itemSelected = this.state.itemSelected || [];
    itemSelected.push(name);
    return itemSelected;
  }

  _onClose() {
    this.setState({
      software: null
    });
  }

  _toOverview() {
    this.setState({
      product: null,
      software: null,
      license: null,
      itemSelected: null
    });
  }

  renderContent() {
    const {product, software, vendor, license} = this.state;
    const Spinning = Icons.Spinning;

    let content, level;
    if(vendor) {
      level = 0;
      if(product) {
        level = 1;
        if(license) {
          level = 2;
          if(software)
            level = 3;
        }
      }
    }

    switch(level) {
      case 0: content = <Card {...vendor}/>; break;
      case 1: content = <Card {...product} className={license ? 'single-line' : ''}/>; break;
      case 2: content = <RecordList body={license} title="Version" allFields={true} onClick={(record) => this.renderSoftware(record)} root={true}/>; break;
      case 3: content = (<Box>
                            <RecordList body={license} title="Version" allFields={true} onClick={(record) => this.renderSoftware(record)} root={true}/>
                            <RecordListLayer body={software} title="Computer" onClose={this._onClose.bind(this)} allFields={true}/>
                          </Box>); break;
      default: content = <Box flex={true} align="center" justify="center"><Spinning /></Box>; break;
    }
    return content;
  }

  render() {
    const {product, software, vendor, license, itemSelected} = this.state;
    const data = [].concat(vendor, product, license, software);

    return (
      <Box flex={true}>
        <SAMBreadCrumb hierarchyData = {data} itemSelected={itemSelected} toOverview={() => this._toOverview()}/>
        <Box flex={true} margin={{horizontal: "medium"}} className='autoScroll' colorIndex='light-2' pad={{horizontal:"small"}}>
          {this.renderContent()}
        </Box>
      </Box>
    );
  }
}
