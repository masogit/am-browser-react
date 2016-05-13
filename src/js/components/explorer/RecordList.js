import React, {Component} from 'react';
import Converter from 'json-2-csv';
import RecordDetail from './RecordDetail';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import Header from 'grommet/components/Header';
import Close from 'grommet/components/icons/base/Close';
import Distribution from 'grommet/components/Distribution';
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
      timeQuery: 0,
      timeDownloadStart: 0,
      timeDownloadEnd: 0,
      records: [],
      filtered: null,
      downloaded: [],
      numDownload: null,
      record: null,
      param: {
        orderby: "",
        offset: 0,
        limit: 30,
        filters: []
      }
    };
  }

  componentDidMount() {
    this._getRecords();
    var groups_select = this.props.body.fields.map((field, index) => {
      return !field.PK &&
        <option key={index} value={JSON.stringify(field)} selected={(field.groupby) ? true : false}>
          {this._getDisplayLabel(field)}
        </option>;
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

  _getAllRecord(downloadRecords, callback) {
    if (this.state.numTotal > downloadRecords.length) {
      var param = {...this.state.param};
      param.offset = downloadRecords.length;
      if (this.state.numTotal >= 10000)
        param.limit = 1000;
      else if (this.state.numTotal < 10000 && this.state.numTotal >= 1000)
        param.limit = parseInt(this.state.numTotal / 10);
      else
        param.limit = 100;
      var body = {...this.props.body, param};
      ExplorerActions.loadRecordsByBody(body, (data) => {
        if (data.entities.length == 0) {
          this.setState({
            numTotal: downloadRecords.length
          });
          callback(downloadRecords);
        } else {
          downloadRecords = downloadRecords.concat(data.entities);
          this.setState({
            numDownload: downloadRecords.length,
            timeDownloadEnd: Date.now()
          });
          this._getAllRecord(downloadRecords, callback);
        }
      });
    } else {
      callback(downloadRecords);
    }
  }

  _getRecords(param) {
    var body = {...this.props.body, param: (param) ? param : this.state.param}; // if sync pass param to query, then records append
    var timeStart = Date.now();
    ExplorerActions.loadRecordsByBody(body, (data) => {
      var records = this.state.records;
      if (data.entities.length > 0)
        this.setState({
          timeQuery: Date.now() - timeStart,
          numTotal: data.count,
          records: (param) ? records.concat(data.entities) : data.entities, // if sync pass param to query, then records append
          filtered: null
        }, this._onGroupBy);
      else if (data.entities.length === 0)
        this.setState({
          numTotal: this.state.records.length
        });
    });
  }

  _json2csv(json) {
    Converter.json2csv(json, (err, csv) => {
      if (err)
        console.log(err);
      else {
        console.log("save csv: " + this.props.body.label);
        var csvContent = "data:text/csv;charset=utf-8,";
        var encodedUri = encodeURI(csvContent + csv);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", this.props.body.label + ".csv");
        link.click();
        // console.log(csv);
      }
    }, {prependHeader: false});
  }

  _onDownload() {
    if (this.state.downloaded.length < this.state.numTotal) {
      var downloadRecord = [...this.state.records];
      this.setState({
        numDownload: this.state.records.length,
        timeDownloadStart: Date.now(),
        timeDownloadEnd: Date.now()
      });
      this._getAllRecord(downloadRecord, (records) => {
        this.setState({
          downloaded: records
        });
        this._json2csv(records);
      });
    } else {
      this._json2csv(this.state.downloaded);
    }
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

  _onFilterBack(filter) {
    var search = this.refs.search.value.trim();
    if (search && search !== filter)
      this.refs.search.value += ' AND ' + filter;
    else
      this.refs.search.value = filter;
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

  _getDownloadProgress() {
    return parseInt(this.state.numDownload / this.state.numTotal * 100) + '% '
      + parseInt((this.state.timeDownloadEnd - this.state.timeDownloadStart)/1000) + 's';
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

    var filters = this.state.param.filters.map((filter, index) => {
      return (
        <span>
          <Anchor href="#" icon={<Close />} onClick={this._onFilterClear.bind(this, index)}/>
          <Anchor href="#" onClick={this._onFilterBack.bind(this, filter)} label={filter}/>
        </span>
      );
    });

    return (
      <div>
        <Header justify="between">
          <input type="text" inline={true} className="flex" placeholder="Filter Records" ref="search"
                 onKeyDown={this._onFilter.bind(this)} onChange={this._onFilter.bind(this)}/>
          {(this.state.filtered) ? this.state.filtered.length : this.state.records.length}/{this.state.numTotal}
          ({this.state.timeQuery}ms)
          <Anchor href="#"
                  label={this.state.numDownload?this._getDownloadProgress(this):'CSV'}
                  icon={<DocumentCsv />} onClick={this._onDownload.bind(this)}/>
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
               onMore={(this.state.numTotal > this.state.records.length && !this.state.filtered)?this._onMore.bind(this):null}>
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
          <RecordDetail body={this.props.body} record={this.state.record} onClose={this._onClose.bind(this)}/>
        }
      </div>
    );
  }
}
