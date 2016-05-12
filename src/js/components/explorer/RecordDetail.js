import React, {Component} from 'react';
import RecordList from './RecordList';
import {
  Layer,
  Tabs,
  Tab,
  Table,
  TableRow
} from 'grommet';

export default class RecordDetail extends Component {

  constructor() {
    super();
    this.state = {
      record: null,
      body: null
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  _getLinkBody(link, record) {
    var body = {...link.body};
    let AQL = link.reverse + '.PK=' + record[link.reversefield];
    body.filter = body.filter ? body.filter + ' AND ' + AQL : AQL;
    return body;
  }

  _getFieldStrVal(record, field) {
    var val = record[field.sqlname];
    if (field.user_type && field.user_type == 'System Itemized List')
      val = val[Object.keys(val)[0]];
    else if (field.type && field.type == 'Date+Time') {
      var d = new Date(val);
      val = d.toLocaleString();
    } else if (val instanceof Object)
      val = val[Object.keys(val)[0]];

    return val;
  }

  _getDisplayLabel(field) {
    return field.alias ? field.alias : (field.label ? field.label : field.sqlname);
  }

  render() {

    var fields;
    var linkTabs;
    if (this.props.record && this.props.body) {
      fields = this.props.body.fields.map((field, index) => {
        return !field.PK &&
          <TableRow key={index}>
            <td>{this._getDisplayLabel(field)}</td>
            <td>{this._getFieldStrVal(this.props.record, field)}</td>
          </TableRow>;
      });
      if (this.props.body.links && this.props.body.links.length > 0) {
        linkTabs = this.props.body.links.map((link, index) => {
          return (<Tab title={link.label} key={index}>
            <RecordList body={this._getLinkBody(link, this.props.record)}/>
          </Tab>);
        });
      }
    }

    return (
      <Layer closer={true} align="right" onClose={this.props.onClose}>
        <Tabs justify="start" initialIndex={0}>
          <Tab title={this.props.body.label}>
            <Table>
              <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
              </thead>
              <tbody>
              {fields}
              </tbody>
            </Table>
          </Tab>
          {linkTabs}
        </Tabs>
      </Layer>
    );
  }
}
