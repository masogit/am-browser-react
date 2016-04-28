import React, {Component} from 'react';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
import * as ExplorerActions from '../../actions/explorer';
import Split from 'grommet/components/Split';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
import Search from 'grommet/components/Search';
import Box from 'grommet/components/Box';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Distribution from 'grommet/components/Distribution';
export default class List extends Component {

  constructor() {
    super();
    this.state = {
      records: [],
      record: null
    };
    this._onClick.bind(this);
    this._onGroupBy.bind(this);
    this._getFieldStrVal.bind(this);
  }

  componentDidMount() {
    ExplorerActions.loadRecordsByBody(this.props.body, (data) => {
      this.setState({
        records: data
      });
    });
    var groups_select = this.props.body.fields.map((field, index) => {
      return !field.PK &&
        <option key={index} value={JSON.stringify(field)}>{this._getDisplayLabel(field)}</option>;
    });
    this.setState({
      group_select: groups_select
    });
  }

  componentWillReceiveProps(nextProps) {
    ExplorerActions.loadRecordsByBody(nextProps.body, (data) => {
      this.setState({
        records: data
      });
    });
  }

  _onClick(record) {
    if (this.props.body.links && this.props.body.links.length > 0) {
      this.setState({
        record: record
      });
    }
  }

  _genLinkBody(link, record) {
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

  _onSearch(event) {
    this.setState({
      filtered: this.state.records.filter((obj) => JSON.stringify(obj).toLowerCase().indexOf(event.target.value.toLowerCase().trim()) !== -1)
    }, this._onGroupBy);
  }

  _onGroupBy() {
    this.setState({
      groups_dist: null
    });
    if (this.refs.select_group.value) {
      var field = JSON.parse(this.refs.select_group.value);

      let groups = [];
      let records = (this.state.filtered) ? this.state.filtered : this.state.records;

      records.forEach((record) => {
        var val = record[field.sqlname];
        val = this._getFieldStrVal(record, field);

        var group = groups.filter(function (group) {
          return group.label == val; //_getFieldStrVal(record, field);
        })[0];

        if (group) {
          group.value += 1;
          group.records.push(record);
        } else {
          let g = {
            label: val, value: 1, records: [record], onClick: (event) => {
              var group = this.state.groups_dist.filter((group) => group.label == val)[0];
              this.setState({
                filtered: group.records
              });
            }
          };
          groups.push(g);
        }

      });

      this.setState({
        groups_dist: groups
      });
    }
  }

  render() {
    var body = this.props.body;
    var records = (this.state.filtered) ? this.state.filtered : this.state.records;
    var header = body.fields.map((field, index) => {
      return !field.PK &&
        <th key={index}>{ this._getDisplayLabel(field)}</th>;
    });
    var recordComponents = records.map((record, index) => {
      return <TableRow key={index} onClick={this._onClick.bind(this, record)}>
        <td>{record.self}</td>
        {
          body.fields.map((field, tdindex) => {
            return !field.PK &&
              <td key={tdindex}>
                {this._getFieldStrVal(record, field)}
              </td>;
          })
        }
      </TableRow>;
    });
    var fields;
    var linkTabs;
    if (this.state.record && this.props) {
      fields = this.props.body.fields.map((field, index) => {
        return !field.PK &&
          <TableRow key={index}>
            <td>{this._getDisplayLabel(field)}</td>
            <td>{this._getFieldStrVal(this.state.record, field)}</td>
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
        <div>
          <Header justify="between">
            <Title>
              Count: {(this.state.filtered) ? this.state.filtered.length : this.state.records.length}
            </Title>
            <Search inline={true} className="flex" placeHolder="Filter Records" size="small"
                    onDOMChange={this._onSearch.bind(this)}/>
            <select onChange={this._onGroupBy.bind(this)} ref="select_group">
              <option value="">Group By</option>
              {this.state.group_select}
            </select>
          </Header>
          {
            this.state.groups_dist && this.state.groups_dist.length > 0 &&
            <Box dirction="row">
              <Distribution size="small" series={this.state.groups_dist} a11yTitleId="distribution-title-1"
                            a11yDescId="distribution-desc-1"/>
            </Box>
          }
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
        </div>
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
