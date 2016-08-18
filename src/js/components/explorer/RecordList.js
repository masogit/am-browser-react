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
import {hash, loadSetting, saveSetting} from '../../util/util';
import cookies from 'js-cookie';

export default class RecordList extends Component {
  constructor(props) {
    super();
    this.state = {
      numColumn: 5,
      numTotal: 0,
      timeQuery: 0,
      records: [],
      filtered: null,
      record: null,
      searchFields: null,
      graphData: null,
      param: loadSetting(hash(Object.assign({},props.body, {filter: ''}))) || {
        graphType: "distribution",
        allFields: false,
        groupby: props.body.groupby || '',
        aqlInput: false,
        orderby: "",
        offset: 0,
        limit: 30,
        filters: []
      },
      onMoreLock: false,
      locked: false
    };
  }

  componentWillMount() {
    this._getSearchableFields();
    this._getRecords(this.state.param);
    this._getGroupByData(this.state.param.groupby);
  }

  componentWillUnmount() {
    saveSetting(hash(Object.assign({}, this.props.body, {filter: ''})), this.state.param);
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

  _clearGroupBy() {
    let param = this.state.param;
    param.groupby = '';
    this.setState({
      graphData: null,
      param: param
    });
  }

  _getGroupByData(groupby) {
    if (groupby) {
      let body = Object.assign({}, this.props.body);

      // Filter then groupby
      if (this.state.param.filters.length > 0) {
        let userFilters = this.state.param.filters.map((filter) => {
          return '(' + filter + ')';
        }).join(" AND ");
        body.filter = body.filter ? body.filter + ' AND (' + userFilters + ')' : userFilters;
      }
      body.groupby = groupby;
      AQLActions.queryAQL(ExplorerActions.getGroupByAql(body)).then((data)=> {
        if (data && data.rows.length > 0) {
          let param = this.state.param;
          param.groupby = groupby;
          this.setState({
            graphData: data,
            param: param
          });
        }
      });
    }
  }

  _getMoreRecords() {
    if (this.state.numTotal > this.state.records.length) {
      var param = Object.assign({}, this.state.param);
      param.offset = this.state.records.length;
      this._getRecords(param, true);  // sync pass param to query, then records append
    } else {
      return null;
    }
  }

  _getRecords(param, onMore) {
    if (!this.state.locked && !(onMore && this.state.onMoreLock)) {
      this.setState({
        locked: true,
        onMoreLock: true});
      var body = Object.assign({}, this.props.body, {param: param || this.state.param});
      var timeStart = Date.now();
      this.setState({
        loading: true
      });
      ExplorerActions.loadRecordsByBody(body).then((data) => {
        const records = this.state.records;
        this.setState({
          loading: false,
          timeQuery: Date.now() - timeStart,
          numTotal: data.count,
          records: param ? records.concat(data.entities) : data.entities, // if sync pass param to query, then records append
          filtered: null,
          locked: false
        }, () => {
          if (this.state.records.length < this.state.numTotal) {
            this.setState({
              onMoreLock: false
            });
          }
        });
      });
    }
  }

  _orderBy(sqlname) {
    if (this.state.locked) {
      return;
    }

    let param = this.state.param;
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
      if (this.state.param.aqlInput) {
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
              this._getGroupByData(this.state.param.groupby);
            });
          }
        }
      }
    } else {
      if (!this.state.param.aqlInput) {
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
    const displayNum = this.state.param.allFields ? this.props.body.fields.length : this.state.numColumn;
    return this.props.body.fields.filter((field, index) => {
      if (index < displayNum) {
        return field;
      }
    });
  }

  getObjectString(obj) {
    return this.getDisplayFields().map((field, index) => Format.getFieldStrVal(obj, field));
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
      this.setState({
        param: param
      }, () => {
        this._getRecords();

        // re-groupby
        this._getGroupByData(this.state.param.groupby);
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
      this._getGroupByData(this.state.param.groupby);
    });
  }

  _filterReuse(filter) {
    let param = this.state.param;
    param.aqlInput = true;
    this.setState({param: param});
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
    let param = this.state.param;
    param.aqlInput = !param.aqlInput;
    this.setState({
      param: param
    });
  }

  _toggleGraphType() {
    let param = this.state.param;
    param.graphType = (param.graphType == 'legend') ? 'distribution' : 'legend';
    this.setState({
      param: param
    });
  }

  _toggleAllFields() {
    let param = this.state.param;
    param.allFields = !param.allFields;
    this.setState({
      param: param
    });
  }

  renderFieldsHeader() {
    return this.getDisplayFields().map((field, index) => (
        <th key={index} className={this.state.locked ? 'disabled' : ''}>
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
      let selected = (field.sqlname == this.state.param.groupby);
      let label = Format.getDisplayLabel(field);
      if (this.props.body.groupby == field.sqlname)
        label += ' [Default Group By]';
      if (field.searchable)
        label += ' [Quick Searchable]';
      let isPrimary = (this.props.body.groupby == field.sqlname) || field.searchable;
      return (
        <Anchor key={`a_groupby_${index}`} icon={selected?<CheckboxSelected />:<Checkbox />}
                label={label} primary={isPrimary}
                onClick={() => selected ? this._clearGroupBy(field.sqlname) : this._getGroupByData(field.sqlname)}/>
      );
    });

    menus.unshift(<Anchor key={`a_groupby_${this.props.body.fields.length}`} label={`${type} FROM ${this.props.body.sqlname}`} icon={<Aggregate />} disabled={true}/>);

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
    const placeholder = this.state.param.aqlInput ? "input AQL where statement…" : quickSearch;

    return (
      <Header justify="between">
        <Title>{this.props.title}</Title>
        <input type="text" className="flex" ref="search" style={this.state.param.aqlInput ? aqlStyle : {}}
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
        <Menu icon={<Filter />} dropAlign={{ right: 'right', top: 'top' }} >
          {this.renderGroupBy()}
        </Menu>
        <Menu icon={<MenuIcon />} dropAlign={{ right: 'right', top: 'top' }}>
          <Anchor icon={this.state.param.graphType=='legend'?<CheckboxSelected />:<Checkbox />} label="Vertical Graph"
                  onClick={this._toggleGraphType.bind(this)}/>
          <Anchor icon={this.state.param.aqlInput?<CheckboxSelected />:<Checkbox />} label="Input AQL"
                  onClick={this._toggleAQLInput.bind(this)}/>
          <Anchor icon={this.state.param.allFields?<CheckboxSelected />:<Checkbox />} label="Full columns"
                  onClick={() => (this.props.body.fields.length > this.state.numColumn) && this._toggleAllFields()}
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
      <Graph type={this.state.param.graphType} data={this.state.graphData} config={config}
             className={this.state.locked ? 'disabled' : ''}
             onClick={(filter) => {
               if (!this.state.locked) {
                 this._aqlFilterAdd(Format.getFilterFromField(this.props.body.fields, filter));
               }
             }}/>
    );
  }
  render() {
    const fixIEScrollBar = this.props.root ? 'fixIEScrollBar' : '';
    return (
      <Box pad={{horizontal: 'medium'}} flex={true} className={fixIEScrollBar}>
        {this.renderToolBox()}
        {this.renderAQLFilter()}
        {
          this.state.param.graphType=='legend' && this.state.graphData ?
            <Box flex={true} direction="row" className={`fixMinSizing ${fixIEScrollBar}`}>
              <Box pad={{vertical: 'large', horizontal: 'small'}}>{this.renderGraph()}</Box>
              <Box flex={true}>{this.renderList()}</Box>
            </Box>
          :
            <Box className={`fixMinSizing ${fixIEScrollBar}`}>
              {this.renderGraph()}
              {this.renderList()}
            </Box>
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
