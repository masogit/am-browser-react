import React, {Component} from 'react';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import Header from 'grommet/components/Header';
import Button from 'grommet/components/Button';
import Close from 'grommet/components/icons/base/Close';
import Distribution from 'grommet/components/Distribution';
import Layer from 'grommet/components/Layer';
import DocumentCsv from 'grommet/components/icons/base/DocumentCsv';
import Ascend from 'grommet/components/icons/base/Ascend';
import Descend from 'grommet/components/icons/base/Descend';
import * as ExplorerActions from '../../actions/explorer';
export default class RecordList extends Component {

  constructor() {
    super();
    this.state = {
      numColumn: 4, // default column number, not include Self
      numTotal: 0,
      time: 0,
      records: [],
      filtered: null,
      record: null,
      param: {
        orderby: "",
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
    this._onClose.bind(this);
    this._onDownload.bind(this);
    this._getOrderByIcon.bind(this);
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
    if (this.state.numTotal > this.state.records.length) {
      var param = {...this.state.param};
      param.offset = this.state.records.length;
      this._getRecords(param);  // sync pass param to query, then records append
    } else {
      console.log('no more record');
      return null;
    }
  }

  _getRecords(param) {
    var body = {...this.props.body, param: (param) ? param : this.state.param}; // if sync pass param to query, then records append
    var timeStart = Date.now();
    ExplorerActions.loadRecordsByBody(body, (data) => {
      var records = this.state.records;
      this.setState({
        time: Date.now() - timeStart,
        numTotal: data.count,
        records: (param) ? records.concat(data.entities) : data.entities, // if sync pass param to query, then records append
        filtered: null
      }, this._onGroupBy);
    });
  }

  _onDownload() {
    var body = {...this.props.body, param: this.state.param};
    ExplorerActions.exportRecordsByBody(body, (data) => {
      this.setState({});
    });
  }

  _onOrderBy(sqlname) {
    var param = {...this.state.param};
    if (param.orderby == (sqlname + ' desc'))
      param.orderby = "";
    else if (param.orderby == sqlname)
      param.orderby = sqlname + ' desc';
    else
      param.orderby = sqlname;
    this.setState({
      param: param
    }, this._getRecords);
  }

  _getOrderByIcon(sqlname) {
    var orderby = this.state.param.orderby;
    var icon = (orderby.indexOf(sqlname) > -1) ? ((orderby.indexOf('desc') > -1) ? <Descend /> : <Ascend />) : null;
    return icon;
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

  _onClose(event) {
    if (event) {
      event.preventDefault();
    }
    this.setState({record: null});
  }

  render() {
    var body = this.props.body;
    var records = (this.state.filtered) ? this.state.filtered : this.state.records;
    var header = body.fields.map((field, index) => {
      return !field.PK && index <= this.state.numColumn &&
        <th key={index}>
          <Anchor href="#" reverse={true} icon={this._getOrderByIcon(field.sqlname)}
                  label={this._getDisplayLabel(field)}
                  onClick={this._onOrderBy.bind(this, field.sqlname)}/>
        </th>;
    });
    var recordComponents = records.map((record, index) => {
      return (<TableRow key={index} onClick={this._onClick.bind(this, record)}>
        <td>{record.self}</td>
        {
          body.fields.map((field, tdindex) => {
            return !field.PK && tdindex <= this.state.numColumn &&
              <td key={tdindex}>
                {this._getFieldStrVal(record, field)}
              </td>;
          })
        }
      </TableRow>);
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
          return (<Tab title={link.label} key={index}>
            <RecordList body={this._getLinkBody(link, this.state.record)}/>
          </Tab>);
        });
      }
    }
    var filters = this.state.param.filters.map((filter, index) => {
      return (<Button key={index} label={filter} plain={true} icon={<Close />}
                      onClick={this._onFilterClear.bind(this, index)}/>);
    });

    return (
      <div>
        <Header justify="between">
          <input type="text" inline={true} className="flex" placeholder="Filter Records"
                 onKeyDown={this._onFilter.bind(this)} onChange={this._onFilter.bind(this)}/>
          {(this.state.filtered) ? this.state.filtered.length : this.state.records.length}/{this.state.numTotal}
          ({this.state.time}ms)
          <Anchor href="#" label="CSV" icon={<DocumentCsv />}/>
          <select onChange={this._onGroupBy.bind(this)} ref="select_group">
            <option value="">Group By</option>
            {this.state.group_select}
          </select>
        </Header>
        {filters}
        {
          this.state.groups_dist && this.state.groups_dist.length > 0 &&
          <Box dirction="row">
            <Distribution size="small" series={this.state.groups_dist} legend={false}/>
          </Box>
        }
        <Table selectable={true}
               onMore={(this.state.numTotal > this.state.records.length)?this._onMore.bind(this):null}>
          <thead>
          <tr>
            <th><Anchor href="#" reverse={true} icon={this._getOrderByIcon('self')} label="Self"
                        onClick={this._onOrderBy.bind(this, 'self')}/></th>
            {header}
          </tr>
          </thead>
          <tbody>
          {recordComponents}
          </tbody>
        </Table>

        {
          this.state.record &&
          <Layer closer={true} align="right" onClose={this._onClose.bind(this)}>
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
        }
      </div>
    );
  }
}