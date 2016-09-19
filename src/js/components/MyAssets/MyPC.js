import React, {Component, PropTypes} from 'react';
import RecordDetail from '../explorer/RecordDetail';
import PCDetail from './PCDetail';
import {Table, TableRow, Box, Anchor, Header, Label, Menu, CheckBox, Topology}from 'grommet';
const Parts = Topology.Parts;
const Part = Topology.Part;
import Ascend from 'grommet/components/icons/base/Ascend';
import Descend from 'grommet/components/icons/base/Descend';
import Close from 'grommet/components/icons/base/Close';
import More from 'grommet/components/icons/base/More';
import Download from 'grommet/components/icons/base/Download';
import Checkbox from 'grommet/components/icons/base/Checkbox';
import Cluster from 'grommet/components/icons/base/Cluster';
import Previous from 'grommet/components/icons/base/Previous';
import ComputerPersonal from 'grommet/components/icons/base/ComputerPersonal';
import CheckboxSelected from 'grommet/components/icons/base/CheckboxSelected';
import * as ExplorerActions from '../../actions/explorer';
import * as AQLActions from '../../actions/aql';
import Graph from '../commons/Graph';
import EmptyIcon from '../commons/EmptyIcon';
import * as Format from '../../util/RecordFormat';
import cookies from 'js-cookie';

const topologyKey = 'TcpIpHostName';
const topologyParentKey = 'Portfolio.Parent.Computer.Name';
export default class MyPC extends Component {
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
      param: {
        allFields: false,
        groupby: props.body.groupby || '',
        aqlInput: false,
        orderby: "",
        offset: 0,
        limit: 30,
        filters: []
      },
      onMoreLock: false,
      locked: false,
      showTopology: false,
      topologyRecords: null
    };
  }

  componentWillMount() {
    this._getSearchableFields();
    this._getRecords(this.state.param);
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
        let graphData = this.state.graphData;
        if (!this.state.showTopology) {
          graphData = data && data.rows.length > 0 ? data : null;
        }
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
    let param = this.state.param;
    param.aqlInput = true;
    this.setState({param: param});
    var search = this.refs.search.value.trim();
    if (search && search !== filter)
      this.refs.search.value += ' AND ' + filter;
    else
      this.refs.search.value = filter;
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

  _toggleAllFields(event) {
    let param = this.state.param;
    param.allFields = !param.allFields;
    this.setState({
      param: param
    });
  }

  renderGroupBy() {
    const groupByFields = ['Portfolio.Model.Name', 'ComputerType', 'Portfolio.seAssignment', 'TcpIpDomain', 'OperatingSystem', 'CPUType'];
    return this.props.body.fields.map((field, index) => {
      if (groupByFields.indexOf(field.sqlname) > -1) {
        let selected = (field.sqlname == this.state.param.groupby);
        let label = Format.getDisplayLabel(field);
        let isPrimary = (this.props.body.groupby == field.sqlname) || field.searchable;
        return (
          <Anchor key={index} icon={selected?<CheckboxSelected />:<Checkbox />}
                  label={label} primary={isPrimary} disabled={this.state.locked}
                  onClick={() => {
                    if (!this.state.locked) {
                      if (selected) {
                        this._clearGroupBy(field.sqlname);
                      } else {
                        this._getGroupByData(field.sqlname);
                      }
                    }
                  }}/>
        );
      }
    });
  }

  renderToolBox() {
    let content;
    if (!this.state.showTopology) {
      content = (
        <Box direction='row' align='center'>
          <Menu dropAlign={{ right: 'right', top: 'top' }} label='Group By:'>
            {this.renderGroupBy()}
          </Menu>
          <CheckBox toggle={true} label="Full columns"
                    checked={this.state.param.allFields} onChange={() =>this._toggleAllFields()}/>

          <Anchor icon={<Download />} label="Download CSV" onClick={this._download.bind(this)}/>
          <form name="Download" ref="downloadForm" method="post" action={ExplorerActions.getDownloadQuery(this.props.body.sqlname)}>
            <input type="hidden" name="_csrf" value={cookies.get('csrf-token')}/>
            <input type="hidden" name="param" value={JSON.stringify(ExplorerActions.getQueryByBody(Object.assign({}, this.props.body, {param: this.state.param})))}/>
            <input type="hidden" name="fields" value={JSON.stringify(this.props.body.fields)}/>
          </form>
        </Box>
      );
    } else {
      content = <Box direction='row' align='center'/>;
    }

    return (
      <Header justify="between" align='end' size='small'>
        {content}
        <Anchor icon={this.state.showTopology ? <Previous /> : <Cluster />} label={this.state.showTopology ? 'Back to List' : 'Topology'}
                disabled={this.state.locked}
                onClick={() => {
                  if (!this.state.locked) {
                    if (this.state.showTopology) {
                      this.setState({
                        showTopology: false,
                        topologyRecords: null
                      });
                    } else {
                      this.getTopology();
                      this.setState({showTopology: true});
                    }
                  }
                }}/>
      </Header>
    );
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

  renderGraph(graphData = this.state.graphData) {
    if (!graphData) {
      return;
    }

    const config = {
      series_col: "1",
      label: "0",
      size: "small",
      legendTotal: false,
      full: true,
      units: "",
      total: true
    };

    return (
      <Box pad='small'>
        <Graph type='legend' data={graphData} config={config}
               className={this.state.locked ? 'disabled' : ''}
               onClick={(filter) => {
               if (!this.state.locked) {
                 this._aqlFilterAdd(Format.getFilterFromField(this.props.body.fields, filter));
               }
             }}/>
      </Box>
    );
  }

  splitLine(records, num = 10) {
    const parts = [];
    const group = new Array(Math.ceil(records.length/num));
    records.map((record, index) => {
      const i = Math.floor(index / num);
      if (!group[i]) {
        group[i] = [];
      }
      group[i].push(record);
      if ((index + 1 )% num == 0 || index == records.length - 1) {
        parts.push(
          <Parts direction="row" key={index}>
            {group[i]}
          </Parts>
        );
      }
    });
    return parts;
  }

  singleElement(record, link, reverse) {
    return (
      <Part id={record[topologyKey]} direction="column" status={link ? 'ok' : ''} label={reverse ? record[topologyKey] : ''}
            demarcate={false} reverse={reverse} align="center" key={record[topologyKey]}>
        <Anchor icon={<ComputerPersonal/>} onClick={() => {
          this.setState({record: record});
        }} />
        {!reverse && <Label size='small'>{record[topologyKey]}</Label>}
      </Part>
    );
  }

  getTopology(records = this.state.records, param = this.state.param) {
    const body = Object.assign({}, this.props.body);
    body.param = param;

    const filterMap ={};
    const filterList = [];
    for(let i = 0; i< records.length; i++) {
      const record = records[i];
      if (record[topologyParentKey]) {
        if (!filterMap[record[topologyParentKey]]) {
          filterList.push(`${topologyKey}='${record[topologyParentKey]}'`);
          filterMap[record[topologyParentKey]] = true;
        }
        if (!filterMap[record[topologyKey]]) {
          filterList.push(`${topologyKey}='${record[topologyKey]}'`);
          filterMap[record[topologyKey]] = true;
        }
      }

      if (filterList.length >= body.param.limit) {
        break;
      }
    }

    if (filterList.length < body.param.limit) {
      for(let i = 0; i< records.length; i++) {
        const record = records[i];
        if (!filterMap[record[topologyKey]]) {
          filterList.push(`${topologyKey}='${record[topologyKey]}'`);
        }

        if (filterList.length >= body.param.limit) {
          break;
        }
      }
    }
    if (filterList.length > 0) {
      body.filter = `${body.filter} AND (${filterList.join(' OR ')})`;
    }
    ExplorerActions.loadRecordsByBody(body).then((data) => {
      this.setState({topologyRecords: data.entities}, this.renderTopology);
    });
  }

  getTopologyRecords() {
    const body = Object.assign({}, this.props.body);
    body.param = Object.assign({}, this.state.param, {limit: this.state.topologyRecords.length + this.state.param.limit});

    ExplorerActions.loadRecordsByBody(body).then((data) => {
      this.getTopology(data.entities, body.param);
    });
  }

  renderTopology(records = this.state.topologyRecords) {
    if (!records || records.length == 0) {
      return;
    }

    const linkMap = {};
    const recordMap = {};
    records.map(record => {
      const parent = record[topologyParentKey];
      recordMap[record[topologyKey]] = record;
      if (parent) {
        if (!linkMap[parent]) {
          linkMap[parent] = [parent, record[topologyKey]];
        } else {
          linkMap[parent].push(record[topologyKey]);
        }
      }
    });

    const orderList = [];
    const links = Object.keys(linkMap).map(key => {
      linkMap[key].map(link => {
        if (recordMap[link]) {
          orderList.push(recordMap[link]);
          delete recordMap[link];
        }
      });

      orderList.push('split');
      return {ids: linkMap[key], colorIndex: 'graph-1'};
    });

    const parts = [];
    const group = new Array(Math.ceil(links.length/5));
    let i = 0;
    orderList.map((record, index) => {
      if (typeof record == 'object') {
        if (!group[i]) {
          group[i] = [this.singleElement(record, true, true)];
        } else {
          group[i].push(this.singleElement(record, true));
        }
      }

      if (record == 'split' || index == orderList.length - 1) {
        parts.push(
          <Part direction="column" key={index}>
            <Parts direction="column">
              {group[i][0]}
              <Parts direction="row" className='child'>
                {group[i].slice(1)}
              </Parts>
            </Parts>
          </Part>
        );
        i++;
      }
    });

    const single = this.splitLine(Object.keys(recordMap).map(key => this.singleElement(recordMap[key])));

    return (
      <Topology links={links} className='autoScroll'>
        {this.splitLine(parts, 5)}
        {single}
        {this.state.numTotal > records.length &&
        <Anchor icon={<More/>}
                onClick={() => this.getTopologyRecords()} />
        }
      </Topology>
    );
  }

  render() {
    const {record, showTopology} = this.state;
    const body= this.props.body;

    let content;
    if (showTopology) {
      if (record) {
        content = <PCDetail record={record} body={body}/>;
      } else {
        content = this.renderTopology();
      }
    } else {
      content = this.renderList();
    }

    return (
      <Box pad={{horizontal: 'medium'}} flex={true} className='fixIEScrollBar' style={{width: '100%'}} >
        {this.renderToolBox()}
        {!showTopology && this.renderAQLFilter()}
        <Box flex={true} direction='row' className='fixIEScrollBar fixMinSizing'>
          {!showTopology && this.renderGraph()}
          <Box flex={true}>
            {content}
          </Box>
        </Box>
        {!showTopology && record &&
        <RecordDetail onClose={this._viewDetailClose.bind(this)}
                      record={record} body={body}/>}
      </Box>
    );
  }
}

MyPC.propTypes = {
  title: PropTypes.string,
  body: PropTypes.object.isRequired
};
