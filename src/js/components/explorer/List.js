import React, {Component} from 'react';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
import * as ExplorerActions from '../../actions/explorer';
import Split from 'grommet/components/Split';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
// import Search from 'grommet/components/Search';
import Box from 'grommet/components/Box';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Button from 'grommet/components/Button';
import Close from 'grommet/components/icons/base/Close';
import Distribution from 'grommet/components/Distribution';
export default class List extends Component {

  constructor() {
    super();
    this.state = {
      total: 0,
      records: [],
      record: null,
      param: {
        offset: 0,
        limit: 30,
        filters: []
      }
    };
    this._onClick.bind(this);
    this._onGroupBy.bind(this);
    this._getFieldStrVal.bind(this);
    this._getRecords.bind(this);
    this._onOrderBy.bind(this);
    this._onMore.bind(this);
    this._onFilterClear.bind(this);
  }

  componentDidMount() {
    this._getRecords();
    var groups_select = this.props.body.fields.map((field, index) => {
      return !field.PK &&
        <option key={index} value={JSON.stringify(field)}>{this._getDisplayLabel(field)}</option>;
    });
    this.setState({
      group_select: groups_select
    });
  }

  componentWillReceiveProps(nextProps) {
    this._getRecords();
  }

  _onMore() {
    if (this.state.total > this.state.records.length) {
      var param = {...this.state.param};
      param.offset = this.state.records.length + 1;
      this.setState({
        param: param
      }, this._getRecords(true));
    }
  }

  /**
   * @param more true: append records
   */
  _getRecords(more) {
    var body = {...this.props.body, param: this.state.param};
    ExplorerActions.loadRecordsByBody(body, (data) => {
      var records = this.state.records;
      this.setState({
        total: data.count,
        records: (more) ? records.concat(data.entities) : data.entities,
        filtered: null
      }, this._onGroupBy);
    });
  }

  _onOrderBy(sqlname) {
    console.log(sqlname);
    // var param = {...this.state.param};
    // if (param.orderby == sqlname)
    //   param.orderby = sqlname + ' desc';
    // else
    //   param.orderby = sqlname;
    // this.setState({
    //   param: param
    // }, this._getRecords);
  }

  _onClick(record) {
    if (this.props.body.links && this.props.body.links.length > 0) {
      this.setState({
        record: record
      });
    }
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

  _onFilter(event) {
    // console.log(event);
    if (event.keyCode === 13 && event.target.value.trim()) {
      var param = this.state.param;
      if (param.filters.indexOf(event.target.value) == -1)
        param.filters.push(event.target.value);
      event.target.value = "";
      this.setState({
        param: param
      }, this._getRecords);
    } else {
      this.setState({
        filtered: this.state.records.filter((obj) => JSON.stringify(obj).toLowerCase().indexOf(event.target.value.toLowerCase().trim()) !== -1)
      }, this._onGroupBy);
    }
  }

  _onFilterClear(index) {
    var param = this.state.param;
    param.filters.splice(index, 1);
    this.setState({
      param: param
    }, this._getRecords);
  }

  _onGroupBy() {
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
    } else {
      this.setState({
        groups_dist: null
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
            <List body={this._getLinkBody(link, this.state.record)}/>
          </Tab>;
        });
      }
    }
    var filters = this.state.param.filters.map((filter, index) => {
      return <Button key={index} label={filter} plain={true} icon={<Close />}
                     onClick={this._onFilterClear.bind(this, index)}/>;
    });

    return (
      <Split flex="both">
        <div>
          <Header justify="between">
            <Title>
              Count: {(this.state.filtered) ? this.state.filtered.length : this.state.records.length}/{this.state.total}
            </Title>
            <input type="text" inline={true} className="flex" placeholder="Filter Records"
                   onKeyDown={this._onFilter.bind(this)}/>
            <select onChange={this._onGroupBy.bind(this)} ref="select_group">
              <option value="">Group By</option>
              {this.state.group_select}
            </select>
          </Header>
          {filters}
          {
            this.state.groups_dist && this.state.groups_dist.length > 0 &&
            <Box dirction="row">
              <Distribution size="small" series={this.state.groups_dist} legend={false}
                            a11yTitleId="distribution-title-1" a11yDescId="distribution-desc-1"/>
            </Box>
          }
          <Table selectable={true} scrollable={true} onMore={this._onMore.bind(this)}>
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
