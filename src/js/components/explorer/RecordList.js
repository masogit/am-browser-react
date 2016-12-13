import React, {PropTypes} from 'react';
import RecordDetail from './RecordDetail';
import RecordTopology from './RecordTopology';
import {Table, TableRow, Box, Anchor, Header, Menu, Icons, Layer, Title} from 'grommet';
const { Close, Ascend, Descend, Checkbox, Filter, BarChart, LineChart, Aggregate,
   CheckboxSelected, Cluster, Menu: MenuIcon, DocumentPdf: Pdf, DocumentCsv: Csv}= Icons.Base;
import Status from 'grommet/components/icons/Status';
import SearchInputWithTags from '../commons/SearchInputWithTags';
import * as ExplorerActions from '../../actions/explorer';
import * as AQLActions from '../../actions/aql';
import Graph from '../commons/Graph';
import ComponentBase from '../commons/ComponentBase';
import EmptyIcon from '../commons/EmptyIcon';
import * as Format from '../../util/RecordFormat';
import {hash, loadSetting, saveSetting} from '../../util/util';
import cookies from 'js-cookie';
import BarCodeEditor from './BarCodeEditor';
import Reports from '../reports/reports';

const getFirstGroupby = (groupby) => {
  if (groupby && groupby.split('|').length > 0)
    return groupby.split('|')[0];
  else
    return '';
};

const init = (props) => {
  let searchFields = props.body.fields.filter((field) => {
    return field.searchable;
  }).map((field) => {
    return Format.getDisplayLabel(field);
  }).join(', ');

  return {
    numColumn: 5,
    numTotal: 0,
    timeQuery: 0,
    records: [],
    filtered: null,
    record: null,
    searchFields: searchFields,
    graphData: null,
    param: (props.cache && loadSetting(hash(Object.assign({},props.body, {filter: ''})))) || {
      showTopology: props.showTopology != undefined ? props.showTopology : false,
      graphType: props.graphType || "legend",
      allFields: props.allField || false,
      groupby: props.groupby || getFirstGroupby(props.body.groupby),
      aqlInput: props.aqlInput || false,
      orderby: props.orderby || "",
      offset: props.offset || 0,
      limit: props.limit || 30,
      filters: props.filters || []
    },
    reusedFilters: "",
    onMoreLock: false,
    locked: false,
    showGraph: true,
    body: props.body,
    pdfSettings: null
  };

};

export default class RecordList extends ComponentBase {
  componentWillMount() {
    this.state = init(this.props);
    this._getRecords(this.state.param);
    if (this.props.body.groupby)
      this._getGroupByData();
    this.setState({
      allFields: this.props.allFields
    });
  }

  componentWillReceiveProps(props) {
    super.cancelPromises();
    this.setState(init(props), () => this._getRecords(this.state.param));
  }

  componentWillUnmount() {
    if (this.props.cache) {
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
      this.addPromise(AQLActions.queryAQL(ExplorerActions.getGroupByAql(body)).then((data)=> {
        let param = this.state.param;
        param.groupby = groupby;
        let graphData = (data && data.rows.length > 0) ? data : null;

        this.setState({
          graphData: graphData,
          param: param,
          locked: false
        });
      }));
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
      this.addPromise(ExplorerActions.loadRecordsByBody(body).then((data) => {
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
      }));
    }
  }

  _orderBy(sqlname) {
    if (this.state.locked) {
      return;
    }

    let param = this.state.param;
    let fields = param.orderby.split(',');
    let index = fields.indexOf(sqlname + ' desc') > -1 ? fields.indexOf(sqlname + ' desc') : fields.indexOf(sqlname);
    if (index > -1 ) {
      if (fields[index] == (sqlname + ' desc'))
        fields.splice(index, 1);
      else
        fields[index] = sqlname + ' desc';
    }else
      fields.push(sqlname);

    param.orderby = fields.filter(f => !(f == '')).join(',');

    this.setState({
      param: param
    }, this._getRecords);
  }

  _showOrderByIcon(sqlname, orderByParam = '') {
    let fields = orderByParam.split(',');
    let index = fields.indexOf(sqlname + ' desc') > -1 ? fields.indexOf(sqlname + ' desc') : fields.indexOf(sqlname);

    if (index > -1) {
      const orderBy = fields[index].split(' ');
      const icon = [];
      if (orderBy[0] == sqlname) {
        if (orderBy[1] == 'desc') {
          icon.push(<Descend key='rl_icon'/>);
        } else {
          icon.push(<Ascend key='rl_icon'/>);
        }
        icon.push(<div className='icon-side-sequence' key='rl_index'>{ExplorerActions.posOrderby(orderByParam, sqlname)}</div>);
        return <Box direction='row' align='center'>{icon}</Box>;
      }
    } else {
      return <EmptyIcon className='icon-empty3'/>;
    }
  }

  _viewDetailShow(record) {
    this.setState({
      record: record
    });
  }

  _filterAdd(event, searches=this.state.searchFields, aqlInput=false, aqlQuery="") {
    // press enter to build AQL filter
    if (event.keyCode === 13 && event.target.value.trim()) {
      if (aqlInput) {
        this._aqlFilterAdd(aqlQuery);
      } else {
        var param = this.state.param;
        if (param.filters.indexOf(event.target.value) == -1) {
          var aql = this.props.body.fields.filter((field) => {
            return field.searchable && (searches.indexOf(field.label) > -1 || searches.indexOf(field.alias) > -1);
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
      if (!aqlInput) {
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

  _aqlFilterAdd(filter, aqlQuery="") {
    let searchValue = filter || aqlQuery;
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

    let reusedFilters = this.state.reusedFilters || filter;
    if(reusedFilters !== filter)
      reusedFilters += 'AND ' + filter;
    else
      reusedFilters = filter;
    this.setState({
      param: param,
      reusedFilters: reusedFilters
    });
  }

  _viewDetailClose(event) {
    if (event) {
      event.preventDefault();
    }
    this.setState({
      record: null,
      body: this.props.body
    });
    return true;
  }

  _download(type) {
    this.refs.downloadForm.action = ExplorerActions.getDownloadQuery(this.props.body.sqlname) + `?type=${type}`;
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
      return (
        <Box direction="row" align="center" key={`icon_${index}`}>
          <Box direction="row" className='orderbyIcon-margin-left' >
            {!_.isEmpty(this.props.body.orderby) && this._showOrderByIcon(field.sqlname, this.props.body.orderby)}
          </Box>
          <Anchor key={`a_groupby_${index}`} icon={selected?<CheckboxSelected />:<Checkbox />}
                  label={label} disabled={this.state.locked}
                  onClick={() => {
                    if (!this.state.locked) {
                      if (selected) {
                        clearGroupBy(field.sqlname);
                      } else {
                        this._getGroupByData(field.sqlname);
                      }
                    }
                  }}/>
        </Box>
      );
    });

    menus.unshift(<Anchor key={`a_groupby_${this.props.body.fields.length}`} label={`${type} FROM ${this.props.body.sqlname}`} icon={<Aggregate />} disabled={true}/>);

    return menus;
  }

  renderToolBox() {
    const {editMode, body, title} = this.props;
    const {filtered, searchFields, records, locked, loading, numTotal, timeQuery, numColumn,
      param: { allFields, showTopology}, graphData, reusedFilters} = this.state;
    const resultRecords = filtered ? filtered : records;

    return (
      <Header justify="between" pad='none'>
        {title && <Title margin={{right: 'small'}}>{title}</Title>}
        <SearchInputWithTags searchFields={searchFields} reusedFilters={reusedFilters}
          onSearch={(this._filterAdd.bind(this))} locked={locked} onChange={this._filterAdd.bind(this)} />
        <Menu direction="column" margin={{left: 'small'}}>
          <Anchor onClick={this._getMoreRecords.bind(this)} disabled={loading}>
            <Box style={{fontSize: '70%', fontWeight: 'bold'}}>
              {(loading?'...':resultRecords.length) + '/' + numTotal}
            </Box>
          </Anchor>
          <Box style={{fontSize: '60%'}} align="end">
            {`${timeQuery}ms`}
          </Box>
        </Menu>
        <Menu icon={<Filter />}>
          {this.renderGroupBy()}
        </Menu>
        <Anchor icon={<Cluster colorIndex={showTopology?'brand': ''}/>}
                onClick={this._toggleShowTopology.bind(this)}/>
        <Menu icon={<MenuIcon />} dropAlign={{ right: 'right', top: 'top' }}>
          {!showTopology && <Anchor icon={allFields?<CheckboxSelected />:<Checkbox />} label="Full columns"
                  onClick={() => (body.fields.length > numColumn) && this._toggleAllFields()}
                  disabled={body.fields.length <= numColumn}/>}
          <Anchor icon={<Csv />} label="Download CSV"
                  disabled={numTotal < 1 || editMode}
                  onClick={() => (numTotal > 0) && !editMode && this._download('csv')}/>
          <Anchor icon={<Pdf />} label="Download PDF"
                  disabled={numTotal < 1}
                  onClick={() => (numTotal > 0) && this.printPdf('template')}/>
          <Anchor icon={<Pdf />} label="Print Barcode"
                  disabled={numTotal < 1}
                  onClick={() => (numTotal > 0) && this.printPdf('BarCode')}/>
        </Menu>
        <form name="Download" ref="downloadForm" method="post">
          <input type="hidden" name="_csrf" value={cookies.get('csrf-token')}/>
          <input type="hidden" name="param" value={JSON.stringify(ExplorerActions.getQueryByBody(Object.assign({}, body, {param: this.state.param})))}/>
          <input type="hidden" name="fields" value={JSON.stringify(body.fields)}/>
          <input type="hidden" name="graphData" value={JSON.stringify(graphData)} />
          <input type="hidden" name="label" value={title || body.label} />
        </form>
      </Header>
    );
  }

  printPdf(type) {
    const {body, records, graphData, numTotal} = this.state;
    this.setState({pdfSettings: {type, body, records, total: numTotal, groupByData: graphData}});
  }

  renderPDFPreview() {
    const pdfSettings = this.state.pdfSettings;
    if (pdfSettings.type == 'BarCode') {
      return (
        <Layer closer={true} onClose={() => this.setState({pdfSettings: null})}>
          <BarCodeEditor {...pdfSettings}/>
        </Layer>
      );
    } else {
      return (
        <Layer closer={true} onClose={() => this.setState({pdfSettings: null})}>
          <Reports {...pdfSettings} fromView={true} />
        </Layer>
      );
    }
  }

  renderList() {
    if (this.state.param.showTopology) {
      return (
        <RecordTopology {...this.state}
          body={this.state.body}
          recordBody={this.props.body}
          getMoreRecords={this._getMoreRecords.bind(this)}
          updateDetail={(body, record, callback) => {
            this.setState({
              body, record
            }, callback);
          }}>
          {this.renderGraph()}
        </RecordTopology>
      );
    } else {
      const renderFieldsHeader = () => {
        return this.getDisplayFields().map((field, index) => (
          <th key={index} className={this.state.locked ? 'disabled' : ''}>
            <Box direction='row'>
              <Box onClick={this._orderBy.bind(this, field.sqlname)}>
                {Format.getDisplayLabel(field)}
              </Box>
              {this._showOrderByIcon(field.sqlname, this.state.param.orderby)}
            </Box>
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
          <Table selectable={true} className='autoScroll fixIEScrollBar'
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
      return <RecordDetail body={this.props.body} record={record} onClose={this._viewDetailClose.bind(this)} choosenRecord={this.state.body} showTopology={this.state.param.showTopology}/>;
    } else {
      return <RecordDetail body={this.props.body} record={record} onClose={this._viewDetailClose.bind(this)}/>;
    }
  }

  renderGraph(graphData = this.state.graphData) {
    if (!graphData || !this.state.showGraph) {
      return;
    }

    const {locked, param: {graphType: type, groupby: sqlname} }= this.state;

    const config = {
      series_col: "1",
      label: "0",
      size: 'small',
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
        const anchor = (groupby, key) => (
          <Anchor label={getGroupbyDisplayLabel(groupby)} key={key}
                  icon={<Box pad={{horizontal: 'small'}}><Status value={groupby == sqlname ? 'ok' : 'blank'} size='small'/></Box>}
                  onClick={() => !(locked || groupby == sqlname) && this._getGroupByData(groupby)}
                  disabled={locked || groupby == sqlname} />
        );

        const groupbys = this.props.body.groupby ? this.props.body.groupby.split('|') : [];
        const breadCrumb = groupbys.map((groupby, index) => groupby && anchor(groupby, index));

        if (groupbys.indexOf(sqlname) < 0) {
          breadCrumb.push(anchor(sqlname, 'b_groupby_last'));
        }

        return (
          <Box direction={type == 'legend' ? 'column' : 'row'}>
            {breadCrumb}
          </Box>
        );
      }
    };

    let className = ['topology-background-color'];
    if (type == 'legend') {
      className.push('legend');
    }

    return (
      <Box className={className.join(' ')} flex={false}  margin={type == 'legend' ? {right: 'small'} : ''}>
        <Header size='small' justify='between'>
          <Box margin={{left: 'small'}}>Statistics</Box>
          <Anchor icon={type =='legend'?<BarChart />:<LineChart />} onClick={this._toggleGraphType.bind(this)}/>
        </Header>
        {renderGroupByHeader()}
        <Box className='autoScroll' flex={type == 'legend'} margin={{horizontal: 'small'}}>
          <Graph type={type} data={graphData} config={config} className={locked ? 'disabled' : ''}
             onClick={(filter) => {
               if (!locked) {
                 this._aqlFilterAdd(Format.getFilterFromField(this.props.body.fields, filter));
               }
             }}/>
        </Box>
      </Box>
    );
  }

  render() {
    const {record, pdfSettings, param: {graphType, filters, showTopology}} = this.state;

    if (pdfSettings) {
      return this.renderPDFPreview();
    } else {
      return (
        <Box flex={true}>
          {this.renderToolBox()}
          {filters.length > 0 &&
          <Box direction='row' className='topology-background-color' pad='small' flex={false} margin={{bottom: 'small'}}>
            {filters.map((filter, index) => (
                <Box direction='row' key={index}>
                  {(this.state.param.showTopology && !_.isEmpty(this.state.record)) ?
                      <Box pad={{horizontal: 'small'}}>{filter}
                    </Box>
                  : <Box direction='row'>
                      <Box onClick={this._filterClear.bind(this, index)}><Close /></Box>
                      <Box onClick={this._filterReuse.bind(this, filter)} pad={{horizontal: 'small'}}>{filter}</Box>
                  </Box>
                  }
                </Box>
              )
            )}
          </Box>
          }
          <Box flex={true} direction={graphType=='legend' ? 'row' : 'column'} className='fixMinSizing'>
            {!(showTopology && record) && this.renderGraph()}
            <Box flex={true} pad={graphType=='legend' ? 'none' : {vertical: 'small'}} direction='row'>
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
}

RecordList.propTypes = {
  title: PropTypes.string,
  body: PropTypes.object.isRequired
};
