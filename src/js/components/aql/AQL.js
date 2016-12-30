import React from 'react';
import _ from 'lodash';
import ChartForm from './ChartForm';
import MeterForm from './MeterForm';
import DistributionForm from './DistributionForm';
import * as AQLActions from '../../actions/aql';
import * as ExplorerActions from '../../actions/explorer';
import RecordListLayer from '../explorer/RecordListLayer';
import {updateValue} from '../../util/util';
import {monitorEdit, stopMonitorEdit, dropCurrentPop, showInfo, onDownload, onMail} from '../../actions/system';
import { Anchor, Box, Form, FormField, Layer, Tabs, Table, TableRow, Icons } from 'grommet';
const { Add, Trash, Attachment } = Icons.Base;
import {ActionLabel, EditLayer, ContentPlaceHolder, ActionTab, AMSideBar, SearchInput,
  ComponentBase, Graph, AlertForm, AMHeader} from '../commons';

const ALERT_TYPE = {
  REMOVE: 'remove',
  DELETE: 'delete',
  SAVE: 'save'
};

const LAYER_TYPE = {
  AQL_STR: 'aql_str',
  VIEW: 'view',
  REPORTS: 'reports',
  RECORDS: 'records'
};

const isValidateView = (json) => {
  return (json.name && json.category && json.str);
};

const getFieldStrVal = (val) => {
  if (val instanceof Object) {
    val = val[Object.keys(val)[0]];
  }
  return val;
};

export default class AQL extends ComponentBase {
  constructor() {
    super();
    this.state = {
      reports: {},
      aqls: [],
      categories: [],
      aql: {},
      data: {
        header: [],
        rows: []
      }
    };
    this.closeLayer = this.closeLayer.bind(this);
    this.alert = this.alert.bind(this);
    this.openLayer = this.openLayer.bind(this);
    this.uploadJson = this.uploadJson.bind(this);
    this._updateValue = this._updateValue.bind(this);
    this._updateGraphData = this._updateGraphData.bind(this);
    this.initAQL = {
      str: '',
      name: '',
      category: '',
      type: 'chart',
      condition: {}
    };
  }

  componentDidMount() {
    // load reports
   /* this.addPromise(AQLActions.loadReports().then(data => {
      if (data) {
        this.setState({
          reports: data
        });
      }
    }));*/

    // load views
    this.addPromise(ExplorerActions.loadViews().then(data => {
      this.setState({
        views: data
      });
    }));

    this._loadAQLs();
  }

  _initAQL(callback) {
    this.setState({
      aql: _.cloneDeep(this.initAQL),
      data: {
        header: [],
        rows: []
      }
    }, callback);
  }

  _loadAQLs() {
    this.addPromise(AQLActions.loadAQLs().then((data) => {
      this.setState({
        aqls: data,
        categories: _.uniq(data.map((aql) => aql.category))
      });
    }));
  }

  _loadAQL(aql) {
    const type = aql.type || 'chart';
    let graph = aql[type];
    if (!graph) {
      graph = aql.form; // try to get data from the old form
    }
    if (!aql.condition) {
      aql.condition = {};
    }

    this.setState({
      aql: Object.assign({}, aql),
      data: {
        header: [],
        rows: []
      }
    }, () => {
      monitorEdit(_.cloneDeep(this.state.aql), this.state.aql);
      if (window.event && this.refs && this.refs[aql.type]) {
        this.refs[aql.type]._onClickTab(event);
      }
      this._onQuery();
    });
  }

  _onQuery(needCheck) {
    const str = this.state.aql.str;
    if (str) {
      let queryFunc = AQLActions.queryAQL;
      if (needCheck) {
        queryFunc = AQLActions.queryAQLWithCheck;
      }

      this.addPromise(queryFunc(encodeURI(str)).then((data) => {
        if (data) {
          if (data.rows.length == 0) {
            showInfo('No records found for this AQL');
          } else {
            this.setState({
              aql: this.state.aql,
              data
            });
          }
        }
      }));
    }
  }

  _onSaveAQL() {
    AQLActions.saveAQL(this.state.aql).then(id => {
      if (id) {
        stopMonitorEdit();
        this._loadAQLs(this);
        this.state.aql._id = id;
        this.setState({aql: this.state.aql});
      }
    });
  }

  _onNew() {
    this.dropCurrentPop('Create a new AQL?', () => {
      this._initAQL(() => monitorEdit(_.cloneDeep(this.state.aql), this.state.aql));
    });
  }

  _removeAQL() {
    AQLActions.removeAQL(this.state.aql._id).then(id => {
      if (id) {
        this._loadAQLs(this);
        this._initAQL();
      }
    });
  }

  closeAlert() {
    this.alert(null);
  }

  alert(type) {
    this.setState({ alertLayer: type });
  }

  getAlertLayer(type) {
    let title, desc, onConfirm;
    let { view, name, str } = this.state.aql;
    switch (type) {
      case ALERT_TYPE.REMOVE : {
        title = 'Remove attached view?';
        desc = 'View name: ' + view.name;
        onConfirm = () => this.state.aql.view = {};
        break;
      }
      case ALERT_TYPE.DELETE: {
        title = 'Delete AQL: ' + name;
        desc = 'AQL string: ' + str;
        onConfirm = this._removeAQL.bind(this);
        break;
      }
      case ALERT_TYPE.SAVE: {
        title = 'Save AQL: ' + name + '?';
        desc = 'AQL string: ' + str;
        onConfirm = this._onSaveAQL.bind(this);
        break;
      }
    }

    return title && <AlertForm title={title} desc={desc} onConfirm={onConfirm} onClose={this.closeAlert.bind(this)}/>;
  }

  _loadOOBAQL(report) {
    this._initAQL(()=> {
      var aql = this.state.aql;
      aql.str = report.AQL;
      aql.name = report.Name;
      aql.category = 'OOB';
      this.setState({aql: aql}, this._onQuery());
    }, this.closeLayer());
  }

  _showViewRecords(filter, viewInAQL) {
    ExplorerActions.showViewRecords(filter, viewInAQL, (body, name) => {
      this.setState({
        layer: {
          type: LAYER_TYPE.RECORDS,
          args: {body, name: name}
        }
      });
    });
  }

  closeLayer() {
    this.openLayer(null);
  }

  openLayer(type) {
    this.setState({layer: type});
  }

  popupLayer(type) {
    const {reports, views, aql} = this.state;
    if (type == LAYER_TYPE.REPORTS) {
      const contents = reports.entities && reports.entities.map((report) => ({
        key: report['ref-link'],
        groupby: getFieldStrVal(report.seType),
        onClick: this._loadOOBAQL.bind(this, report),
        search: report.Name,
        child: report.Name
      }));

      return (
        <Layer onClose={this.closeLayer} closer={true} align="left" flush={true}>
          <AMSideBar title='AQL Selector' contents={contents} toggle={false} showInLayer={true}
                     margin={{horizontal: 'medium'}} pad={{vertical: 'small'}}/>
        </Layer>
      );
    } else if (type == LAYER_TYPE.VIEW) {
      const attachView = (view) => {
        this.state.aql.view = {
          _id: view._id,
          name: view.name
        };
        this.setState({
          aql: this.state.aql,
          layer: null
        });
      };

      const contents = views.map((view) => ({
        key: view._id,
        groupby: view.category,
        onClick: () => attachView(view),
        search: view.name,
        child: view.name
      }));

      return (
        <Layer onClose={this.closeLayer} closer={true} align="left" flush={true}>
          <AMSideBar title='Views Selector' contents={contents} colorIndex="light-1" toggle={false} showInLayer={true}
                     margin={{horizontal: 'medium'}} pad={{vertical: 'small'}}/>
        </Layer>
      );
    } else if (typeof type == 'object' && type.type == LAYER_TYPE.RECORDS) {
      return <RecordListLayer body={type.args.body} title={type.args.name} onClose={this.closeLayer}/>;
    } else if (type == LAYER_TYPE.AQL_STR) {
      const clearGraphSetting = () => {
        const data = {
          header: [],
          rows: []
        };

        if (aql.meter) {
          aql.meter.series_col = "";
        }
        if (aql.chart) {
          aql.chart.series_col = [];
        }
        if (aql.distribution) {
          aql.distribution.series_col = "";
        }
        this.setState({aql: aql, data: data});
      };

      return (
        <EditLayer label='Input AM Query Language (AQL)' name='str'
                   value={this.state.aql.str} onClose={this.closeLayer}
                   onConfirm={event => {
                     this._updateValue(event);
                     clearGraphSetting();
                     this.closeLayer();
                     this._onQuery(true);
                   }}/>
      );
    }
  }

  dropCurrentPop(title, onConfirm) {
    const originAQL = this.state.aqls.filter(aql => aql._id == this.state.aql._id)[0];
    const currentAQL = _.cloneDeep(this.state.aql);

    delete currentAQL.data;
    dropCurrentPop(originAQL, currentAQL, this.initAQL, title, onConfirm);
  }

  uploadJson(result, closeMenu) {
    let json = JSON.parse(result);
    if (isValidateView(json)) {
      if (json._id)
        json._id = null;

      this._loadAQL(json);
      closeMenu();
      AQLActions.uploadAQLSuccess();
    } else {
      AQLActions.uploadAQLFailed();
    }
  }

  renderHeader(currentAql) {
    const hasId = Boolean(currentAql._id);
    const hasStr = Boolean(currentAql.str);
    const hasName = Boolean(currentAql.name);
    const hasCategory = Boolean(currentAql.category);

    const buttons = [
      {id: 'Query', onClick: () => this._onQuery(true), enable: hasStr},
      {
        id: 'Save',
        onClick: () => this.alert(ALERT_TYPE.SAVE),
        enable: !(!hasStr || !hasName || !hasCategory)
      },
      {id: 'Delete', onClick: () => this.alert(ALERT_TYPE.DELETE), enable: hasId}
    ];

    const subMenuButtons = [{
      id: 'Mail', onClick: () => onMail(currentAql, 'Graph', 'insight'),
      enable: hasId, hide: !hasId
    }, {
      id: 'Download',
      onClick: () => onDownload(currentAql, currentAql.name || 'graph'),
      enable: hasId
    }];

    const uploadProps = {
      enable: !hasId,
      accept: '.json',
      onChange: this.uploadJson
    };

    return (<AMHeader title='Graph Builder' buttons={buttons} subMenuButtons={subMenuButtons}
                      uploadProps={uploadProps}/>);
  }

  _updateValue(event, val, state = this.state.aql) {
    updateValue(event, {
      val: val,
      state: state,
      callback: () => this.setState({aql: this.state.aql})
    });
  }

  _updateGraphData(event, val) {
    const aql = this.state.aql;
    this._updateValue(event, val, aql[aql.type]);
  }

  renderGraphForm(currentAql, data) {
    const getIndex = (type) => {
      if (type === 'chart') return 0;
      if (type === 'meter') return 1;
      if (type === 'distribution') return 2;
      return 0;
    };

    const updateType = type => {
      const aql = this.state.aql;
      aql.type = type;

      this.setState({aql: aql});
    };

    const setInitSetting = (type, settings) => {
      const aql = this.state.aql;
      aql[type] = settings;
      this.setState({aql: aql});
    };

    return (
      <Box style={{position: 'relative'}} flex={false}>
        <Tabs activeIndex={getIndex(currentAql.type)} justify='start'>
          <ActionTab title="Chart" onClick={() => updateType('chart')} ref='chart'>
            <ChartForm chart={currentAql.chart} data={data} genGraph={this._updateGraphData}
                       setInitSetting={(settings) => setInitSetting('chart', settings)} />
          </ActionTab>
          <ActionTab title="Meter" onClick={() => updateType('meter')} ref='meter'>
            <MeterForm meter={currentAql.meter} genGraph={this._updateGraphData} data={data}
                       setInitSetting={(settings) => setInitSetting('meter', settings)}/>
          </ActionTab>
          <ActionTab title="Distribution" onClick={() => updateType('distribution')} ref='distribution'>
            <DistributionForm distribution={currentAql.distribution} genGraph={this._updateGraphData} data={data}
                              setInitSetting={(settings) => setInitSetting('distribution', settings)} />
          </ActionTab>
        </Tabs>
      </Box>
    );
  }

  renderBasicForm(currentAql, categories, data) {
    const {name, str, category, view, type, condition} = currentAql;
    const fields = [{
      label: 'AQL Name',
      content: <input type="text" name="name" value={name} onChange={this._updateValue}/>
    }, {
      label: 'Input AM Query Language (AQL)',
      content: (
        <textarea value={str} rows={10} onChange={() => this.openLayer(LAYER_TYPE.AQL_STR)}
                  onClick={() => this.openLayer(LAYER_TYPE.AQL_STR)}/>
      )
    }, {
      label: 'Category',
      content: (
        <SearchInput type="text" name="category" value={category}
                     onDOMChange={this._updateValue} suggestions={categories.sort()}
                     onSelect={event => this._updateValue(event, event.suggestion)}/>
      )
    }];

    const viewFields = [];
    viewFields.push({
      label: 'Attached View',
      content: (
        <ActionLabel label={view && view.name || '<Empty>'} icon={view && view.name ? <Trash/> : <Attachment />}
                     onClick={() => view && view.name ? this.alert(ALERT_TYPE.REMOVE) : this.openLayer(LAYER_TYPE.VIEW)}/>
      )
    });

    if (view && view.name) {
      if (currentAql[type]) {
        const getFields = id => {
          const currentView = this.state.views.filter(view => view._id == id)[0];
          if (currentView && currentView.body.fields) {
            return currentView.body.fields.map((field) => field.sqlname);
          }
          return [];
        };

        viewFields.push({
          label: 'Field (View)',
          content: (
          <SearchInput type="text" name="condition.key" value={condition.key || ''}
                       onDOMChange={this._updateValue} suggestions={getFields(view._id)}
                       onSelect={event => this._updateValue(event, event.suggestion)} />
          )
        });

        if (condition.key) {
          if (data && data.header[0] && !condition.value) {
            condition.value = data.header[0].Name;
          }

          viewFields.push(
            {
              label: 'Value (Column)',
              content: (
                <select name='condition.value' value={condition.value} onChange={this._updateValue}>
                  {data && data.header.map((item, index) => <option key={index} value={item.Name}>{item.Name}</option>)}
                </select>
              )
            }
          );
        }
      }
    }

    const viewComp = (
      <Box separator='all' colorIndex="light-1">
        <div className='grommetux-form no-border'>
          {viewFields.map(({label, content}, index) => <FormField label={label} key={index}>{content}</FormField>)}
        </div>
      </Box>
    );

    return (
      <Form compact={true}>
        {fields.map(({label, content}, index) => <FormField label={label} key={index}>{content}</FormField>)}
        {viewComp}
      </Form>
    );
  }

  render() {
    const {data, aqls, aql: currentAql, alertLayer, layer, categories} = this.state;

    const toolbar = <Anchor icon={<Add />} onClick={this._onNew.bind(this)} label="New"/>;
    const contents = aqls.map((aql) => ({
      key: aql._id,
      groupby: aql.category,
      onClick: () => {
        if (aql._id != currentAql._id) {
          this.dropCurrentPop(`Open ${aql.name}`, this._loadAQL.bind(this, aql));
        }
      },
      search: aql.name,
      child: aql.name
    }));

    const focus = currentAql && {expand: currentAql.category, selected: currentAql._id};
    const validData = data.rows.length > 0 && data.header.length === data.rows[0].length;
    const NODATA = '<No Data>';

    return (
      <Box direction="row" flex={true}>
        <AMSideBar title='Graphs' toolbar={toolbar} contents={contents} focus={focus}/>
        {!_.isEmpty(currentAql) ? <Box flex={true}>
          {this.getAlertLayer(alertLayer)}
          {this.renderHeader(currentAql)}
          <Box className='autoScroll fixIEScrollBar' pad={{horizontal: 'small'}} direction='row'>
            <Box className='fixMinSizing' flex={true} pad={{horizontal: 'small'}}>
              {this.renderGraphForm(currentAql, data)}
              <Box pad={{vertical: 'small'}}>
                <Box flex={false} className='grid' margin={{vertical: 'small'}}>
                {validData && data && currentAql.type && currentAql[currentAql.type] ?
                  <Graph type={currentAql.type} data={data} config={currentAql[currentAql.type]} condition={currentAql.condition}
                           onClick={(filter) => this._showViewRecords(filter, currentAql.view)}/>
                :
                  <Box direction='row' flex={true} justify='center' align='center'>{NODATA}</Box>}
                </Box>
                <Table>
                  <thead><tr>
                    {data.header.map((col, index) => <th key={index}>{col.Name}</th>)}
                  </tr></thead>
                  <tbody>
                    {data.rows.map((row, index) => (
                      <TableRow key={index}>{
                        row.map((col, i) => <td key={i}>{col}</td>)
                      }</TableRow>
                    ))}
                  </tbody>
                </Table>
              </Box>
              {layer && this.popupLayer(layer)}
            </Box>
            {this.renderBasicForm(currentAql, categories, validData && data)}
          </Box>
        </Box>
          : <ContentPlaceHolder/>
        }
      </Box>
    );
  }
}
