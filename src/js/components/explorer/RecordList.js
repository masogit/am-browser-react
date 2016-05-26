import React, {Component, PropTypes} from 'react';
import RecordDetail from './RecordDetail';
import Title from 'grommet/components/Title';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
import Box from 'grommet/components/Box';
import CheckBox from 'grommet/components/CheckBox';
import Anchor from 'grommet/components/Anchor';
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import Close from 'grommet/components/icons/base/Close';
import Ascend from 'grommet/components/icons/base/Ascend';
import Descend from 'grommet/components/icons/base/Descend';
import Download from 'grommet/components/icons/base/Download';
import * as ExplorerActions from '../../actions/explorer';
import * as AQLActions from '../../actions/aql';
import Graph from '../commons/Graph';
import * as Format from '../../constants/RecordFormat';
export default class RecordList extends Component {

  constructor() {
    super();
    this.state = {
      numColumn: 4, // default column number, not include Self
      numTotal: 0,
      timeQuery: 0,
      records: [],
      filtered: null,
      record: null,
      groupby: "",
      param: {
        orderby: "",
        offset: 0,
        limit: 30,
        filters: []
      },
      aqlInput: false
    };
  }

  componentDidMount() {
    this._getRecords();
    if (this.props.body.groupby)
      AQLActions.queryAQL(ExplorerActions.getGroupByAql(this.props.body), (data)=> {
        if (data.rows.length > 0) {
          var distributionConfig = {
            series_col: "1",
            label: "0",
            size: "small",
            legendTotal: false,
            full: true,
            units: ""
          };
          var distributionGraph = (
            <Box>
              <Graph type='distribution' data={data} config={distributionConfig}
                     onClick={(filter) => this._aqlFilterAdd(Format.getFilterFromField(this.props.body.fields, filter))}/>
            </Box>
          );
          this.setState({
            distributionGraph: distributionGraph
          });
        }
      });
  }

  componentWillReceiveProps(nextProps) {
    this._getRecords();
  }

  _getMoreRecords() {
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
    this.setState({
      loading: true
    });
    ExplorerActions.loadRecordsByBody(body, (data) => {
      var records = this.state.records;
      if (data.entities.length > 0)
        this.setState({
          loading: false,
          timeQuery: Date.now() - timeStart,
          numTotal: data.count,
          records: (param) ? records.concat(data.entities) : data.entities, // if sync pass param to query, then records append
          filtered: null
        });
      else if (data.entities.length === 0)
        this.setState({
          loading: false,
          numTotal: this.state.records.length,
          records: []
        });
    });
  }

  _orderBy(sqlname) {
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

  _showOrderByIcon(sqlname) {
    var orderby = this.state.param.orderby;
    var icon = (orderby.indexOf(sqlname) > -1) ? ((orderby.indexOf('desc') > -1) ? <Descend /> : <Ascend />) : null;
    return icon;
  }

  _viewDetailShow(record) {
    this.setState({
      record: record
    });
  }

  _filterAdd(event) {
    if (event.keyCode === 13 && event.target.value.trim()) {
      if (this.state.aqlInput) {
        this._aqlFilterAdd();
      } else {
        var param = this.state.param;
        if (param.filters.indexOf(event.target.value) == -1) {
          var aql = this.props.body.fields.filter((field) => {
            return field.searchable;
          }).map((field) => {
            return field.sqlname + " like '%" + event.target.value.trim() + "%'";
          }).join(' OR ');

          if (aql) {
            param.filters.push(aql);
            event.target.value = "";
            this.setState({
              param: param
            }, this._getRecords);
          }
        }
      }
    } else {
      if (!this.state.aqlInput)
        this.setState({
          filtered: this.state.records.filter((obj) => JSON.stringify(obj).toLowerCase().indexOf(event.target.value.toLowerCase().trim()) !== -1)
        });
    }
  }

  _aqlFilterAdd(filter) {
    var searchValue = filter || this.refs.search.value;
    if (searchValue) {
      var param = this.state.param;
      if (param.filters.indexOf(searchValue) == -1)
        param.filters.push(searchValue);
      this.refs.search.value = "";
      this.setState({
        param: param
      }, this._getRecords);
    }

  }

  _filterClear(index) {
    var param = this.state.param;
    param.filters.splice(index, 1);
    this.setState({
      param: param
    }, this._getRecords);
  }

  _filterReuse(filter) {
    var search = this.refs.search.value.trim();
    if (search && search !== filter)
      this.refs.search.value += ' AND ' + filter;
    else
      this.refs.search.value = filter;
  }

  _viewDetailClose(event) {
    if (event) {
      event.preventDefault();
    }
    this.setState({record: null});
  }

  _download() {
    this.refs.downloadForm.submit();
  }

  _toggleAQLInput() {
    this.setState({
      aqlInput: !this.state.aqlInput
    });
  }

  render() {
    var body = this.props.body;
    var records = (this.state.filtered) ? this.state.filtered : this.state.records;
    var header = body.fields.map((field, index) => {
      return !field.PK && index <= this.state.numColumn &&
        <th key={index}>
          <Anchor href="#" reverse={true} icon={this._showOrderByIcon(field.sqlname)}
                  label={Format.getDisplayLabel(field)}
                  onClick={this._orderBy.bind(this, field.sqlname)}/>
        </th>;
    });
    var recordComponents = records.map((record, index) => {
      return (<TableRow key={index} onClick={this._viewDetailShow.bind(this, record)}>
        <td>{record.self}</td>
        {
          body.fields.map((field, tdindex) => {
            return !field.PK && tdindex <= this.state.numColumn &&
              <td key={tdindex}>
                {Format.getFieldStrVal(record, field)}
              </td>;
          })
        }
      </TableRow>);
    });

    var filters = this.state.param.filters.map((filter, index) => {
      return (
        <span>
          <Anchor href="#" icon={<Close />} onClick={this._filterClear.bind(this, index)}/>
          <Anchor href="#" onClick={this._filterReuse.bind(this, filter)} label={filter}/>
        </span>
      );
    });

    var Spinning = require('grommet/components/icons/Spinning');

    return (
      <div>
        <Header justify="between">
          <Title>{this.props.title}</Title>
          {
            this.state.loading &&
            <Spinning />
          }
          {
            !this.state.loading &&
            <Box>{(this.state.filtered) ? this.state.filtered.length : this.state.records.length}</Box>
          }
          /{this.state.numTotal}
          {this.state.timeQuery}ms
          <input type="text" inline={true} className="flex" ref="search"
                 placeholder={this.state.aqlInput?'Input AQL...':'Quick search'}
                 onKeyDown={this._filterAdd.bind(this)} onChange={this._filterAdd.bind(this)}/>
          <Menu direction="row" align="center" responsive={false}>
            <CheckBox id="checkbox_aql" label="AQL" checked={this.state.aqlInput}
                      onChange={this._toggleAQLInput.bind(this)}
                      toggle={true}/>
            <Anchor href="#" icon={<Download />} label="CSV" onClick={this._download.bind(this)}/>
          </Menu>
          <form name="Download" ref="downloadForm"
                action={ExplorerActions.getDownloadQuery({...this.props.body, param: this.state.param})}
                method="post">
            <input type="hidden" name="fields" value={JSON.stringify(this.props.body.fields)}/>
          </form>
        </Header>
        {filters}
        {this.state.distributionGraph}
        <Table selectable={true}
               onMore={(this.state.numTotal > this.state.records.length && !this.state.filtered)?this._getMoreRecords.bind(this):null}>
          <thead>
          <tr>
            <th><Anchor href="#" reverse={true} icon={this._showOrderByIcon('self')} label="Self"
                        onClick={this._orderBy.bind(this, 'self')}/></th>
            {header}
          </tr>
          </thead>
          <tbody>
          {recordComponents}
          </tbody>
        </Table>
        {
          this.state.record &&
          <RecordDetail body={this.props.body} record={this.state.record} onClose={this._viewDetailClose.bind(this)}/>
        }
      </div>
    );
  }
}

RecordList.propTypes = {
  title: PropTypes.string,
  body: PropTypes.object.isRequired
};
