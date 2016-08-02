import React, {Component, PropTypes} from 'react';
import RecordDetail from './RecordDetail';
import {Title, Table, TableRow, Box, Anchor, Header, Menu}from 'grommet';
import Close from 'grommet/components/icons/base/Close';
import Ascend from 'grommet/components/icons/base/Ascend';
import Descend from 'grommet/components/icons/base/Descend';
import Download from 'grommet/components/icons/base/Download';
import MenuIcon from 'grommet/components/icons/base/Menu';
import Checkbox from 'grommet/components/icons/base/Checkbox';
import Filter from 'grommet/components/icons/base/Filter';
import Aggregate from 'grommet/components/icons/base/Aggregate';
import CheckboxSelected from 'grommet/components/icons/base/CheckboxSelected';
import * as ExplorerActions from '../../actions/explorer';
import * as AQLActions from '../../actions/aql';
import Graph from '../commons/Graph';
import EmptyIcon from '../commons/EmptyIcon';
import * as Format from '../../util/RecordFormat';
import cookies from 'js-cookie';

export default class RecordList extends Component {
  constructor() {
    super();
    this.state = {
      numColumn: 5,
      numTotal: 0,
      timeQuery: 0,
      records: [],
      filtered: null,
      record: null,
      searchFields: null,
      groupby: "",
      graphType: "distribution",
      graphData: null,
      param: {
        orderby: "",
        offset: 0,
        limit: 30,
        filters: []
      },
      aqlInput: false,
      allFields: false,
      session: null,
      onMoreLock: false
    };
  }

  componentWillMount() {
    this._getSearchableFields();
    this._getRecords();
    if (this.props.body.groupby)
      this._getGroupByData();
  }

  _getSearchableFields() {
    let searchFields = this.props.body.fields.filter((field) => {
      return field.searchable;
    }).map((field) => {
      return Format.getDisplayLabel(field);
    }).join(', ');

    if (searchFields)
      this.setState({
        searchFields: searchFields
      });
  }

  _clearGroupBy(groupby) {
    if (this.state.groupby == groupby)
      this.setState({
        groupby: ''
      }, this._getGroupByData());
  }

  _getGroupByData(groupby) {
    let body = Object.assign({}, this.props.body);

    // Filter then groupby
    if (this.state.param.filters.length > 0) {
      let userFilters = this.state.param.filters.map((filter) => {
        return '(' + filter + ')';
      }).join(" AND ");
      body.filter = body.filter ? body.filter + ' AND (' + userFilters + ')' : userFilters;
    }

    if (groupby) {
      body.groupby = groupby;
      this.setState({
        groupby: groupby
      });
    }

    if (body.groupby)
      AQLActions.queryAQL(ExplorerActions.getGroupByAql(body), (data)=> {
        if (data.rows.length > 0) {
          this.setState({
            graphData: data
          });
        }
      });
    else
      this.setState({
        graphData: null
      });
  }

  _getMoreRecords() {
    console.log('get more record');
    if (this.state.numTotal > this.state.records.length) {
      var param = Object.assign({}, this.state.param);
      param.offset = this.state.records.length;
      this.refs.search.value = "";
      this._getRecords(param, true);  // sync pass param to query, then records append
    } else {
      console.log('no more record');
      return null;
    }
  }

  _getRecords(param, onMore) {
    if ((onMore && this.state.onMoreLock === false) || !onMore) {
      this.setState({onMoreLock: true});
      var body = Object.assign({}, this.props.body, {param: param || this.state.param});
      var timeStart = Date.now();
      this.setState({
        loading: true
      });
      ExplorerActions.loadRecordsByBody(body, (data) => {
        var records = this.state.records;
        this.setState({
          loading: false,
          timeQuery: Date.now() - timeStart,
          numTotal: data.count,
          records: param ? records.concat(data.entities) : data.entities, // if sync pass param to query, then records append
          filtered: null
        }, ()=> {
          if (this.state.records.length < this.state.numTotal) {
            this.setState({onMoreLock: false});
          }
        });
      });
    }
  }

  _orderBy(sqlname) {
    var param = Object.assign({}, this.state.param);
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
    var orderby = this.state.param.orderby.split(' ');
    if (orderby[0] == sqlname) {
      if (orderby[1] == 'desc') {
        return <Descend />;
      } else {
        return <Ascend />;
      }
    } else {
      return <EmptyIcon />;
    }
  }

  _viewDetailShow(record) {
    this.setState({
      record: record
    });
  }

  _filterAdd(event) {
    // press '/' switch AQL input
    if (event.target.value.trim() == '/') {
      this._toggleAQLInput();
      event.target.value = "";
    }

    // press enter to build AQL filter
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
            }, () => {
              this._getRecords();

              // re-groupby
              let groupby = this.state.groupby || this.props.body.groupby;
              this._getGroupByData(groupby);
            });
          }
        }
      }
    } else {
      if (!this.state.aqlInput) {
        if (event.target.value.trim() == "")
          this.setState({
            filtered: null
          });
        else
          this.setState({
            filtered: this.state.records.filter((obj) => this.getObjectString(obj).some((str) => {
              return str.toString().toLowerCase().indexOf(event.target.value.toLowerCase().trim()) !== -1;
            }))
          });
      }
    }
  }

  getDisplayFields() {
    const displayNum = this.state.allFields ? this.props.body.fields.length : this.state.numColumn;
    return this.props.body.fields.filter((field, index) => {
      if (index < displayNum) {
        return field;
      }
    });
  }

  getObjectString(obj) {
    return this.getDisplayFields().map((field, index) => Format.getFieldStrVal(obj, field)).concat(obj.self || '');
  }

  _aqlFilterAdd(filter) {
    let searchValue = filter || this.refs.search.value;
    if (searchValue) {
      searchValue = searchValue.trim();
      let param = this.state.param;

      // replace filter
      if (searchValue.indexOf('=') > -1) {
        let key = searchValue.split('=')[0];
        param.filters.forEach((filter, index) => {
          if (filter.indexOf(key) > -1)
            param.filters.splice(index, 1);
        });

      }

      if (param.filters.indexOf(searchValue) == -1)
        param.filters.push(searchValue);
      this.refs.search.value = "";
      this.setState({
        param: param
      }, () => {
        this._getRecords();

        // re-groupby when user manually input AQL where clause
        if (!filter) {
          let groupby = this.state.groupby || this.props.body.groupby;
          this._getGroupByData(groupby);
        }
      });
    }

  }

  _filterClear(index) {
    var param = this.state.param;
    param.filters.splice(index, 1);
    this.setState({
      param: param
    }, () => {
      this._getRecords();

      // re-groupby
      let groupby = this.state.groupby || this.props.body.groupby;
      this._getGroupByData(groupby);
    });
  }

  _filterReuse(filter) {
    this.setState({aqlInput: true});
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
    return true;
  }

  _download() {
    this.refs.downloadForm.submit();
  }

  _toggleAQLInput() {
    this.setState({
      aqlInput: !this.state.aqlInput
    });
  }

  _toggleGraphType() {
    this.setState({
      graphType: this.state.graphType=='legend' ? 'distribution' : 'legend'
    });
  }

  _toggleAllFields() {
    this.setState({
      allFields: !this.state.allFields
    });
  }

  renderFieldsHeader() {
    return this.getDisplayFields().map((field, index) => (
      <th key={index}>
        <Anchor href="#" reverse={true} icon={this._showOrderByIcon(field.sqlname)}
                label={Format.getDisplayLabel(field)} key={`fieldsheader_${index}`}
                onClick={this._orderBy.bind(this, field.sqlname)}/>
      </th>
    ));
  }

  renderRecords() {
    var records = (this.state.filtered) ? this.state.filtered : this.state.records;
    return (
      records.map((record, index) => {
        return (
          <TableRow key={index} onClick={this._viewDetailShow.bind(this, record)}>
            <td>{record.self}</td>
            {
              this.getDisplayFields().map((field, tdindex) => (
                <td key={tdindex}>
                  {Format.getFieldStrVal(record, field)}
                </td>
              ))
            }</TableRow>
        );
      })
    );
  }

  renderAQLFilter() {
    return (
      <span>
        {this.state.param.filters.map((filter, index) => {
          return (
            <span key={`aqlfilter_${index}`}>
              <Anchor href="#" icon={<Close />} onClick={this._filterClear.bind(this, index)}/>
              <Anchor href="#" onClick={this._filterReuse.bind(this, filter)} label={filter}/>
            </span>
          );
        })}
      </span>
    );
  }

  renderGroupBy() {
    let type = this.props.body.sum ? `SUM ${this.props.body.sum}` : `COUNT *`;
    let menus = this.props.body.fields.map((field, index) => {
      let selected = (field.sqlname == (this.state.groupby || this.props.body.groupby));
      let disabled = this.props.body.groupby == field.sqlname;
      let label = Format.getDisplayLabel(field);
      return (
        <Anchor key={`a_groupby_${index}`} icon={selected?<CheckboxSelected />:<Checkbox />} disabled={disabled}
                label={label} primary={this.props.body.groupby == field.sqlname}
                onClick={() => !disabled && (selected ? this._clearGroupBy(field.sqlname) : this._getGroupByData(field.sqlname))}/>
      );
    });
    menus.unshift(<Anchor key={`a_groupby_${this.props.body.fields.length}`} label={type} icon={<Aggregate />} disabled={true}/>);

    return menus;
  }

  renderToolBox() {

    const aqlStyle = {
      'fontWeight': 'bold',
      'color': '#767676',
      'borderColor': '#FFD144'
    };
    const resultRecords = this.state.filtered ? this.state.filtered : this.state.records;

    const aqlWhere = "press / input AQL where statement";
    const quickSearch = this.state.searchFields ? `press Enter to quick search in ${this.state.searchFields}; ${aqlWhere}` : aqlWhere;
    const placeholder = this.state.aqlInput ? "input AQL where statement…" : quickSearch;

    return (
      <Header justify="between">
        <Title>{this.props.title}</Title>
        <input type="text" className="flex" ref="search" style={this.state.aqlInput?aqlStyle:{}}
               placeholder={placeholder} onKeyDown={this._filterAdd.bind(this)} onChange={this._filterAdd.bind(this)}/>
        <Box direction="column">
          <Anchor onClick={this._getMoreRecords.bind(this)} disabled={this.state.loading}>
            <Box style={{fontSize: '70%', fontWeight: 'bold'}}>
              {(this.state.loading?'...':resultRecords.length) + '/' + this.state.numTotal}
            </Box>
          </Anchor>
          <Box style={{fontSize: '60%'}} align="end">
            {`${this.state.timeQuery}ms`}
          </Box>
        </Box>
        <Menu icon={<Filter />} dropAlign={{ right: 'right', top: 'top' }}>
          {this.renderGroupBy()}
        </Menu>
        <Menu icon={<MenuIcon />} closeOnClick={false} dropAlign={{ right: 'right', top: 'top' }}>
          <Anchor icon={this.state.graphType=='legend'?<CheckboxSelected />:<Checkbox />} label="Vertical Graph"
                  onClick={this._toggleGraphType.bind(this)}/>
          <Anchor icon={this.state.aqlInput?<CheckboxSelected />:<Checkbox />} label="Input AQL"
                  onClick={this._toggleAQLInput.bind(this)}/>
          <Anchor icon={this.state.allFields?<CheckboxSelected />:<Checkbox />} label="Full columns"
                  onClick={() => (this.props.body.fields.length < this.state.numColumn) && this._toggleAllFields()}
                  disabled={this.props.body.fields.length <= this.state.numColumn}/>
          <Anchor icon={<Download />} label="Download CSV" onClick={this._download.bind(this)}/>
        </Menu>
        <form name="Download" ref="downloadForm" method="post" action={ExplorerActions.getDownloadQuery(this.props.body.sqlname)}>
          <input type="hidden" name="_csrf" value={cookies.get('csrf-token')}/>
          <input type="hidden" name="param" value={JSON.stringify(ExplorerActions.getQueryByBody(Object.assign({}, this.props.body, {param: this.state.param})))}/>
          <input type="hidden" name="fields" value={JSON.stringify(this.props.body.fields)}/>
        </form>
      </Header>
    );
  }

  renderList() {
    return (
      <Table selectable={true} className='autoScroll'
             onMore={this.state.onMoreLock || this.state.filtered ? null : this._getMoreRecords.bind(this)}>
        <thead>
        <tr>
          <th><Anchor href="#" reverse={true} icon={this._showOrderByIcon('self')} label="Self"
                      onClick={this._orderBy.bind(this, 'self')}/></th>
          {this.renderFieldsHeader()}
        </tr>
        </thead>
        <tbody>
        {this.renderRecords()}
        </tbody>
      </Table>
    );
  }

  renderDetail() {
    return (
      this.state.record &&
      <RecordDetail body={this.props.body} record={this.state.record} onClose={this._viewDetailClose.bind(this)}/>
    );
  }

  renderGraph() {
    var config = {
      series_col: "1",
      label: "0",
      size: "small",
      legendTotal: false,
      full: true,
      units: "",
      total: true
    };
    return (
      <Graph type={this.state.graphType} data={this.state.graphData} config={config}
             onClick={(filter) => this._aqlFilterAdd(Format.getFilterFromField(this.props.body.fields, filter))}/>
    );
  }

  render() {
    return (
      <Box pad={{horizontal: 'medium'}} flex={true}>
        {this.renderToolBox()}
        {this.renderAQLFilter()}
        {
          this.state.graphType=='legend'&&this.state.graphData?
            <Box flex={true} direction="row" className={`fixMinSizing ${this.props.root?'fixIEScrollBar':''}`}>
            <Box pad={{vertical: 'large'}}>{this.renderGraph()}</Box>
            <Box flex={true}>{this.renderList()}</Box>
          </Box>
          :
            <Box className={`fixMinSizing ${this.props.root?'fixIEScrollBar':''}`}>{this.renderGraph()}{this.renderList()}</Box>
        }
        {this.renderDetail()}
      </Box>
    );
  }
}

RecordList.propTypes = {
  title: PropTypes.string,
  body: PropTypes.object.isRequired
};
