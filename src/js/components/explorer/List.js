import React, {Component} from 'react';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
import * as ExplorerActions from '../../actions/explorer';
import Split from 'grommet/components/Split';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
export default class List extends Component {

  constructor() {
    super();
    this.state = {
      records: [],
      record: null
    };
    this._onClick.bind(this);
    this._setState.bind(this);
  }

  componentDidMount() {
    let self = this;
    ExplorerActions.loadRecordsByBody(self.props.body, function (data) {
      self._setState(data);
    });
  }

  componentWillReceiveProps(nextProps) {
    let self = this;
    ExplorerActions.loadRecordsByBody(nextProps.body, function (data) {
      self._setState(data);
    });
  }

  _onClick(record) {
    if (this.props.body.links && this.props.body.links.length > 0) {
      this.setState({
        record: record
      });
    }
  }

  _setState(data) {
    this.setState({
      records: data
    });
  }

  _genLinkBody(link, record) {
    var body = {...link.body};
    let AQL = link.reverse + '.PK=' + record[link.reversefield];
    body.filter = body.filter ? body.filter + ' AND ' + AQL : AQL;
    return body;
  }

  render() {
    var body = this.props.body;
    var header = body.fields.map((field, index) => {
      return !field.PK &&
        <th key={index}>{ field.alias ? field.alias : (field.label ? field.label : field.sqlname)}</th>;
    });
    var recordComponents = this.state.records.map((record, index) => {
      return <TableRow key={index} onClick={this._onClick.bind(this, record)}>
        <td>{record.self}</td>
        {
          body.fields.map((field, tdindex) => {
            return !field.PK &&
              <td key={tdindex}>{record[field.sqlname]}</td>;
          })
        }
      </TableRow>;
    });
    var fields;
    var linkTabs;
    if (this.state.record && this.props) {
      console.log("this.state.record: " + JSON.stringify(this.state.record));
      fields = this.props.body.fields.map((field, index) => {
        return !field.PK &&
          <TableRow key={index}>
            <td>{field.label}</td>
            <td>{this.state.record[field.sqlname]}</td>
          </TableRow>;
      });
      if (this.props.body.links && this.props.body.links.length > 0) {
        linkTabs = this.props.body.links.map((link, index) => {
          return <Tab title={link.label} key={index}>
            <List body={this._genLinkBody(link, this.state.record)}/>
          </Tab>;
        });
      }
    }

    return (
      <Split flex="both">
        <Table selectable={true} scrollable={true}>
          <thead>
          <tr>
            <th>Self</th>
            {header}
          </tr>
          </thead>
          <tbody>
          {recordComponents}
          </tbody>
        </Table>
        {
          this.state.record &&
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
        }
      </Split>
    );
  }
}
