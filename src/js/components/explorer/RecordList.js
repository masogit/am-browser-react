import React, {Component, PropTypes} from 'react';
import RecordDetail from './RecordDetail';
import RecordTopology from './RecordTopology';
import {Table, TableRow, Box, Anchor, Header, Menu, List, ListItem}from 'grommet';
import Close from 'grommet/components/icons/base/Close';
import Ascend from 'grommet/components/icons/base/Ascend';
import Descend from 'grommet/components/icons/base/Descend';
import Download from 'grommet/components/icons/base/Download';
import MenuIcon from 'grommet/components/icons/base/Menu';
import Checkbox from 'grommet/components/icons/base/Checkbox';
import Filter from 'grommet/components/icons/base/Filter';
import Next from 'grommet/components/icons/base/LinkNext';
import Aggregate from 'grommet/components/icons/base/Aggregate';
import CheckboxSelected from 'grommet/components/icons/base/CheckboxSelected';
import * as ExplorerActions from '../../actions/explorer';
import * as AQLActions from '../../actions/aql';
import Graph from '../commons/Graph';
import EmptyIcon from '../commons/EmptyIcon';
import * as Format from '../../util/RecordFormat';
import {hash, loadSetting, saveSetting} from '../../util/util';
import cookies from 'js-cookie';
import Cluster from 'grommet/components/icons/base/Cluster';

const getFirstGroupby = (groupby) => {
  if (groupby && groupby.split('|').length > 0)
    return groupby.split('|')[0];
  else
    return '';
};

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
      param: (!props.noCache && loadSetting(hash(Object.assign({},props.body, {filter: ''})))) || {
        showMap: props.showMap != undefined ? props.showMap : (props.body.links && props.body.links.length > 0),
        showTopology: props.showTopology != undefined ? props.showTopology : false,
        showHeader: props.showHeader != undefined ? props.showHeader : true,
        graphType: props.graphType || "legend",
        allFields: props.allField || false,
        groupby: props.groupby || getFirstGroupby(props.body.groupby),
        aqlInput: props.aqlInput || false,
        orderby: props.orderby || "",
        offset: props.offset || 0,
        limit: props.limit || 30,
        filters: props.filters || []
      },
      onMoreLock: false,
      locked: false,
      showGraph: true
    };
  }

  componentWillMount() {
    const getSearchableFields = () => {
      let searchFields = this.props.body.fields.filter((field) => {
        return field.searchable;
      }).map((field) => {
        return Format.getDisplayLabel(field);
      }).join(', ');

      if (searchFields)
        this.setState({
          searchFields: searchFields
        });
    };

    getSearchableFields();
    this._getRecords(this.state.param);
  }

  componentWillUnmount() {
    if (!this.props.noCache) {
      saveSetting(hash(Object.assign({}, this.props.body, {filter: ''})), this.state.param);
    }
  }

  _getGroupByData(groupby) {
    if (groupby) {
      if (this.state.records.length == 0) {
        let param = this.state.param;
        param.groupby = groupby;
        this.setState({param, graphData : null});
        return;
      } else {
        this.setState({
          locked: true
        });
      }
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
        let param = this.state.param;
        param.groupby = groupby;
        let graphData = (data && data.rows.length > 0) ? data : null;

        this.setState({
          graphData: graphData,
          param: param,
          locked: false
        });
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

          // re-groupby
          if (this.state.param.groupby && !onMore)
            this._getGroupByData(this.state.param.groupby);
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
            }, this._getRecords);
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

      // Find next groupby from pre-defined body
      let groupby = param.groupby || '';
      let groups = this.props.body.groupby ? this.props.body.groupby.split('|') : [];
      let pos = groups.indexOf(groupby);
      if (pos > -1 && pos < groups.length - 1)
        groupby = groups[pos + 1];

      param.groupby = groupby;
      this.setState({
        record: this.state.param.showTopology ? null : this.state.record,
        param: param
      }, this._getRecords);
    }

  }

  _filterClear(index) {
    var param = this.state.param;
    param.filters.splice(index, 1);

    // Find previous groupby from pre-defined body
    let groupby = param.groupby || '';
    let groups = this.props.body.groupby ? this.props.body.groupby.split('|') : [];
    let pos = groups.indexOf(groupby);
    if (pos > 0)
      groupby = groups[pos - 1];

    param.groupby = groupby;
    this.setState({
      param: param
    }, this._getRecords);
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

  _toggleShowTopology() {
    let param = this.state.param;
    param.showTopology = !param.showTopology;

    this.setState({
      param: param,
      record: null
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

  renderGroupBy() {
    const clearGroupBy = () => {
      let param = this.state.param;
      param.groupby = '';
      this.setState({
        graphData: null,
        param: param
      });
    };

    let type = this.props.body.sum ? `SUM ${this.props.body.sum}` : `COUNT *`;
    let menus = this.props.body.fields.map((field, index) => {
      let selected = (field.sqlname == this.state.param.groupby);
      let label = Format.getDisplayLabel(field);
      if (field.searchable)
        label = label + ' [Quick search]';
      let isPrimary = field.searchable;
      return (
        <Anchor key={`a_groupby_${index}`} icon={selected?<CheckboxSelected />:<Checkbox />}
                label={label} primary={isPrimary} disabled={this.state.locked}
                onClick={() => {
                  if (!this.state.locked) {
                    if (selected) {
                      clearGroupBy(field.sqlname);
                    } else {
                      this._getGroupByData(field.sqlname);
                    }
                  }
                }}/>
      );
    });

    menus.unshift(<Anchor key={`a_groupby_${this.props.body.fields.length}`} label={`${type} FROM ${this.props.body.sqlname}`} icon={<Aggregate />} disabled={true}/>);

    return menus;
  }

  renderToolBox() {
    if (!this.state.param.showHeader) {
      return;
    }
    const resultRecords = this.state.filtered ? this.state.filtered : this.state.records;
    const aqlWhere = "press / input AQL where statement";
    const quickSearch = this.state.searchFields ? `press Enter to quick search in ${this.state.searchFields}; ${aqlWhere}` : aqlWhere;
    const placeholder = this.state.param.aqlInput ? "input AQL where statement…" : quickSearch;

    return (
      <Header justify="between" pad='none'>
        {this.props.title && <Box margin={{right: 'small'}}>{this.props.title}</Box>}
        <input type="text" className={this.state.param.aqlInput ? 'aql flex' : 'flex'} ref="search"
             placeholder={placeholder} disabled={this.state.locked} onKeyDown={this._filterAdd.bind(this)} onChange={this._filterAdd.bind(this)}/>
        <Box direction="column" margin={{left: 'small'}}>
          <Anchor onClick={this._getMoreRecords.bind(this)} disabled={this.state.loading}>
            <Box style={{fontSize: '70%', fontWeight: 'bold'}}>
              {(this.state.loading?'...':resultRecords.length) + '/' + this.state.numTotal}
            </Box>
          </Anchor>
          <Box style={{fontSize: '60%'}} align="end">
            {`${this.state.timeQuery}ms`}
          </Box>
        </Box>
        <Menu icon={<Filter />} flex={false}>
          {this.renderGroupBy()}
        </Menu>
        <Anchor icon={<Cluster colorIndex={this.state.param.showTopology?'brand': ''}/>}
                onClick={this._toggleShowTopology.bind(this)}/>
        <Menu icon={<MenuIcon />} dropAlign={{ right: 'right', top: 'top' }}>
          <Anchor icon={this.state.param.aqlInput?<CheckboxSelected />:<Checkbox />} label="Input AQL"
                  onClick={this._toggleAQLInput.bind(this)}/>
          {!this.state.param.showTopology && <Anchor icon={this.state.param.allFields?<CheckboxSelected />:<Checkbox />} label="Full columns"
                  onClick={() => (this.props.body.fields.length > this.state.numColumn) && this._toggleAllFields()}
                  disabled={this.props.body.fields.length <= this.state.numColumn}/>}
          <Anchor icon={<Download />} label="Download CSV"
                  disabled={this.state.numTotal < 1}
                  onClick={() => (this.state.numTotal > 0) && this._download()}/>
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
    if (this.state.param.showTopology) {
      return (
        <RecordTopology {...this.state}
          body={this.state.body || this.props.body}
          getMoreRecords={this._getMoreRecords.bind(this)}
          updateDetail={(body, record) => {
            this.setState({
              body, record
            });
          }}>
          {this.renderGraph()}
        </RecordTopology>
      );
    } else {
      const renderFieldsHeader = () => {
        return this.getDisplayFields().map((field, index) => (
          <th key={index} className={this.state.locked ? 'disabled' : ''}>
            <Anchor reverse={true} icon={this._showOrderByIcon(field.sqlname)}
                    label={Format.getDisplayLabel(field)} key={`fieldsheader_${index}`}
                    onClick={this._orderBy.bind(this, field.sqlname)}/>
          </th>
        ));
      };

      const renderRecords = () => {
        var records = (this.state.filtered) ? this.state.filtered : this.state.records;
        return (
          records.map((record, index) => {
            return (
              <TableRow key={index} onClick={this.props.onClick ? this.props.onClick.bind(this, record) : this._viewDetailShow.bind(this, record)}>
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
      };

      return (
        <Box colorIndex='light-1' pad='small' flex={true}>
          <Table selectable={true} className='autoScroll'
                 onMore={this.state.onMoreLock || this.state.filtered ? null : this._getMoreRecords.bind(this)}>
            <thead>
            <tr>
              {renderFieldsHeader()}
            </tr>
            </thead>
            <tbody>
              {renderRecords()}
            </tbody>
          </Table>
        </Box>
      );
    }
  }

  renderDetail(record = this.state.record) {
    if (!record) {
      return;
    }

    if (this.state.param.showTopology) {
      const body = this.props.body;
      return (
        <Box className='topology-background-color autoScroll' flex={false}>
          <Box align='end' onClick={() => this.setState({record: null})} pad='small'><Close /></Box>
          <Box justify='center' pad={{horizontal: 'small'}} flex={true}>
            <List>
              <ListItem><Header>{body.label}</Header></ListItem>
              {
                body.fields.map((field, index) => {
                  let value = record[field.sqlname];
                  if (value && typeof value == 'object') {
                    value = value[0];
                  }
                  return (
                    <ListItem key={index} justify="between">
                      <span>
                        {field.label}
                      </span>
                          <Box pad={{horizontal: 'medium'}}/>
                      <span className="secondary">
                        {value}
                      </span>
                    </ListItem>
                  );
                })
              }
            </List>
          </Box>
        </Box>
      );
    } else {
      return <RecordDetail body={this.props.body} record={record} onClose={this._viewDetailClose.bind(this)}/>;
    }
  }

  renderGraph(graphData = this.state.graphData) {
    if (!graphData || !this.state.showGraph) {
      return;
    }

    const {locked, record, param: {showTopology, graphType: type, groupby: sqlname} }= this.state;

    const config = {
      series_col: "1",
      label: "0",
      size: "small",
      legendTotal: false,
      full: true,
      units: "",
      total: true
    };

    const getGroupbyDisplayLabel = (sqlname) => {
      if (sqlname) {
        let groupby = this.props.body.fields.filter((field) => {
          return field.sqlname == sqlname;
        })[0];

        return Format.getDisplayLabel(groupby);
      }
    };

    const renderGroupByHeader = () => {
      if (sqlname) {
        let groupbys = this.props.body.groupby ? this.props.body.groupby.split('|') : [];
        const header = [(
          <Header key='b_groupby_header'>Statistics</Header>
        )];

        groupbys.map((groupby, index) => {
          header.push((groupby && <Anchor key={`b_groupby_${index}`} label={getGroupbyDisplayLabel(groupby)}
                                     icon={(groupby == sqlname)?<Next />:<EmptyIcon />}
                                     disabled={this.state.locked || groupby == sqlname}
                                     onClick={() => !(this.state.locked || groupby == sqlname) && this._getGroupByData(groupby)} />
          ));
        });

        if (groupbys.indexOf(sqlname) < 0) {
          header.push(<Anchor key='b_groupby_last' label={getGroupbyDisplayLabel(sqlname)} icon={<Next />} disabled={true} />);
        }

        return header;
      }
    };

    let className = [];
    if (showTopology && record) {
      className.push('group-by');
    }

    if (type == 'legend') {
      className.push('legend');
      className.push('autoScroll');
    }

    return (
      <Box className={className.join(' ')} pad={type == 'legend' ? {horizontal: 'small'} : 'none'} flex={false}  margin={{right: 'small'}}>
        {type == 'legend' && renderGroupByHeader()}
        <Graph type={type} data={graphData} config={config} className={locked ? 'disabled' : ''}
             onClick={(filter) => {
               if (!locked) {
                 this._aqlFilterAdd(Format.getFilterFromField(this.props.body.fields, filter));
               }
             }}/>
      </Box>
    );
  }

  render() {
    const fixIEScrollBar = this.props.root ? 'fixIEScrollBar' : '';
    const {param: {graphType, showTopology, filters}, record} = this.state;
    let direction = 'column', pad = {vertical: 'small'};
    if (graphType=='legend') {
      direction = 'row';
      pad = 'none';
    }

    return (
      <Box flex={true} className={fixIEScrollBar}>
        {this.renderToolBox()}
        {filters.length > 0 &&
          <Box direction='row' className='topology-background-color' pad='small' flex={false}>
            {filters.map((filter, index) => (
                <Box direction='row' key={index}>
                  <Box onClick={this._filterClear.bind(this, index)}><Close /></Box>
                  <Box onClick={this._filterReuse.bind(this, filter)} pad={{horizontal: 'small'}}>{filter}</Box>
                </Box>
              )
            )}
        </Box>
        }
        <Box flex={true} direction={direction} className={`fixMinSizing ${fixIEScrollBar}`} pad={filters.length > 0 ? {vertical: 'small'} : 'none'}>
          {this.renderGraph()}
          <Box flex={true} pad={(!showTopology || !record) ? pad : 'none'} direction='row'>
            <Box className='topology-background-color' flex={true} pad='small'>
              {this.renderList()}
            </Box>
            {this.renderDetail()}
          </Box>
        </Box>
      </Box>
    );
  }
}

RecordList.propTypes = {
  title: PropTypes.string,
  body: PropTypes.object.isRequired
};
