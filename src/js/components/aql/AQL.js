import React from 'react';
import _ from 'lodash';
import ChartForm from './ChartForm';
import MeterForm from './MeterForm';
import DistributionForm from './DistributionForm';
import * as AQLActions from '../../actions/aql';
import * as ExplorerActions from '../../actions/explorer';
import RecordListLayer from '../explorer/RecordListLayer';
import * as Format from '../../util/RecordFormat';
import {updateValue} from '../../util/util';
import {monitorEdit, stopMonitorEdit, dropCurrentPop, showInfo, onDownload, onMail} from '../../actions/system';
import { Anchor, Box, Form, FormField, Layer, Tabs, Table, TableRow, Icons } from 'grommet';
const { Add, Trash, Attachment } = Icons.Base;
import {ActionLabel,EditLayer, ContentPlaceHolder, ActionTab, AMSideBar, SearchInput,
  ComponentBase, Graph, AlertForm, UploadWidget, AMHeader} from '../commons';

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
      },
      graphData: {}
    };
    this.closeLayer = this.closeLayer.bind(this);
    this.alert = this.alert.bind(this);
    this.openLayer = this.openLayer.bind(this);
    this._updateValue = this._updateValue.bind(this);
    this.initAQL = {
      str: '',
      name: '',
      category: '',
      type: 'chart',
      form: {}
    };
  }

  componentDidMount() {
    this._loadViews();
    this._loadAQLs();
    this._loadInToolReport();
  }

  _initAQL(callback) {
    this.setState({
      aql: _.cloneDeep(this.initAQL),
      data: {
        header: [],
        rows: []
      },
      graphData: {}
    }, callback);
  }

  _loadViews() {
    this.addPromise(ExplorerActions.loadViews().then(data => {
      this.setState({
        views: data
      });
    }));
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
    let graphData = {};
    if (aql.type) {
      graphData[aql.type] = aql.form;
    }
    this.setState({
      aql: {...aql},
      data: {
        header: [],
        rows: []
      },
      graphData: graphData
    }, () => {
      monitorEdit(_.cloneDeep(this.state.aql), this.state.aql);
      if (window.event && this.refs && this.refs[aql.type]) {
        this.refs[aql.type]._onClickTab(event);
      }
      this._onQuery();
    });
  }

  _loadInToolReport() {
    this.addPromise(AQLActions.loadReports().then(data => {
      if (data) {
        this.setState({
          reports: data
        });
      }
    }));
  }

  _onQuery(needCheck) {
    let queryFunc = AQLActions.queryAQL;
    if (needCheck) {
      queryFunc = AQLActions.queryAQLWithCheck;
    }

    this.addPromise(queryFunc(this.state.aql.str).then((data) => {
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

  _onSaveAQL() {
    AQLActions.saveAQL(this.state.aql).then(id => {
      if (id) {
        stopMonitorEdit();
        this._loadAQLs(this);
        var aql = this.state.aql;
        aql._id = id;
        this.setState({aql: aql});
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
        console.log("Remove AQL: " + id);
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
    switch (type) {
      case ALERT_TYPE.REMOVE : {
        title = 'Remove attached view?';
        desc = 'View name: ' + this.state.aql.view.name;
        onConfirm = ()=> this.state.aql.view=null;
        break;
      }
      case ALERT_TYPE.DELETE: {
        title = 'Delete AQL: ' + this.state.aql.name;
        desc = 'AQL string: ' +this.state.aql.str;
        onConfirm = this._removeAQL.bind(this);
        break;
      }
      case ALERT_TYPE.SAVE: {
        title = 'Save AQL: ' + this.state.aql.name + '?';
        desc = 'AQL string: ' + this.state.aql.str;
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

  _updateValue(event, val) {
    updateValue(event, {
      val: val,
      state: this.state.aql,
      callback: () => this.setState({aql: this.state.aql})
    });
  }

  _genGraph(form, type) {
    let aql = this.state.aql;
    let graphData = this.state.graphData;
    if (type) {
      aql.type = type;
    }

    if (form) {
      aql.form = form;
      graphData[type] = form;
    } else {
      aql.form = graphData[type] || {};
    }

    this.setState({aql, graphData});

    //TODO: meter: data less than 7/4
    //TODO: distribution: data must be all positive
  }

  _attachView(view) {
    var aql = this.state.aql;
    aql.view = {
      _id: view._id,
      name: view.name
    };
    this.setState({
      aql: aql,
      layer: null
    });
  }

  closeLayer() {
    this.openLayer(null);
  }

  _showViewRecords(filter, viewInAQL) {
    if (viewInAQL && viewInAQL._id)
      ExplorerActions.loadView(viewInAQL._id).then((view) => {
        var body = view.body;
        var newFilter = Format.getFilterFromField(view.body.fields, filter);
        body.filter = (body.filter) ? `(${body.filter} AND ${newFilter})` : newFilter;

        this.setState({
          layer: {
            type: LAYER_TYPE.RECORDS,
            args: {body, name: view.name}
          }
        });
      });
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
          <AMSideBar title='AQL Selector' contents={contents} colorIndex='light-1' toggle={false} margin={{horizontal: 'medium'}} pad={{vertical: 'small'}}/>
        </Layer>
      );
    } else if (type == LAYER_TYPE.VIEW) {
      const contents = views.map((view) => ({
        key: view._id,
        groupby: view.category,
        onClick: this._attachView.bind(this, view),
        search: view.name,
        child: view.name
      }));

      return (
        <Layer onClose={this.closeLayer} closer={true} align="left" flush={true}>
          <AMSideBar title='Views Selector' contents={contents} colorIndex='light-1' toggle={false} margin={{horizontal: 'medium'}} pad={{vertical: 'small'}}/>
        </Layer>
      );
    } else if (typeof type == 'object' && type.type == LAYER_TYPE.RECORDS) {
      return <RecordListLayer body={type.args.body} title={type.args.name} onClose={this.closeLayer}/>;
    } else if (type == LAYER_TYPE.AQL_STR) {
      return (
        <EditLayer label='Input AM Query Language (AQL)' name='str'
                  value={this.state.aql.str}
                  onClose={this.closeLayer}
                  onConfirm={event => {
                    this._updateValue(event);

                    if (!_.isEmpty(aql.form)) {
                      // when AQL change, reset data, form and graphData
                      aql.form = null;
                      const data = {
                        header: [],
                        rows: []
                      };

                      this.setState({aql: aql, graphData: {}, data: data});
                    }

                    this.closeLayer();
                    this._onQuery(true);
                  }} />
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
      { id: 'Query', onClick: () => this._onQuery(true), enable: hasStr },
      {
        id: 'Save',
        onClick: () => this.alert(ALERT_TYPE.SAVE),
        enable: !(!hasStr || !hasName || !hasCategory)
      },
      { id: 'Delete', onClick: () => this.alert(ALERT_TYPE.DELETE), enable: hasId}
    ];

    const subMenuButtons = [{
      id: 'Mail', onClick: () => onMail(currentAql, 'Graph', 'insight'),
      enable: hasId, hide: !hasId
    },
      {
        id: 'Download',
        onClick: () => onDownload(currentAql, currentAql.name || 'graph'),
        enable: hasId
      }, {
        icon: <Attachment />,
        onClick: () => this.openLayer(LAYER_TYPE.VIEW),
        enable: hasStr,
        label: currentAql.view ? 'Attached view: ' + currentAql.view.name : 'Attach View'
      }
    ];

    const uploadProps = {
      enable: !hasId,
      accept: '.json',
      onChange: this.uploadJson
    };

    return (<AMHeader title='AQL and Graph' buttons={buttons} subMenuButtons={subMenuButtons}
                     uploadProps={uploadProps}/>);
  }

  renderGraphForm(currentAql, data, graphData) {
    const getIndex = (type) => {
      if (type === 'chart') return 0;
      if (type === 'meter') return 1;
      if (type === 'distribution') return 2;
      return 0;
    };

    const activeIndex = getIndex(currentAql.type) || 0;

    return (
      <Box style={{position: 'relative'}} flex={false}>
        <Tabs activeIndex={activeIndex} justify='start'>
          <ActionTab title="Chart" onClick={this._genGraph.bind(this, null, 'chart')} ref='chart'>
            <ChartForm {...currentAql} {...graphData}
              genGraph={this._genGraph.bind(this)}
              data={data}/>
          </ActionTab>
          <ActionTab title="Meter" onClick={this._genGraph.bind(this, null, 'meter')} ref='meter'>
            <MeterForm {...currentAql} {...graphData} genGraph={this._genGraph.bind(this)}
                                                      data={data}/>
          </ActionTab>
          <ActionTab title="Distribution" onClick={this._genGraph.bind(this, null, 'distribution')}
                     ref='distribution'>
            <DistributionForm {...currentAql} {...graphData}
              genGraph={this._genGraph.bind(this)}
              data={data}/>
          </ActionTab>
        </Tabs>
      </Box>
    );
  }

  render() {
    const {data, aqls, aql: currentAql, alertLayer, graphData, layer, categories} = this.state;

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

    return (
      <Box direction="row" flex={true}>
        <AMSideBar title='Graphs' toolbar={toolbar} contents={contents} focus={focus}/>
        {!_.isEmpty(currentAql) ? <Box flex={true}>
          {this.getAlertLayer(alertLayer)}
          {this.renderHeader(currentAql)}
          <Box className='autoScroll fixIEScrollBar' pad={{horizontal: 'small'}} direction='row'>
            <Box className='fixMinSizing' flex={true} pad={{horizontal: 'small'}}>
              {
                validData && this.renderGraphForm(currentAql, data, graphData)
              }
              <Box pad={{vertical: 'small'}}>
                {validData && currentAql.form && !_.isEmpty(currentAql.form) && currentAql.type &&
                <Box flex={false} className='grid' margin={{vertical: 'small'}}>
                  <Graph type={currentAql.type} data={data} config={currentAql.form}
                         onClick={(filter) => this._showViewRecords(filter, currentAql.view)}/>
                </Box>}
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
            <Form compact={true}>
              <FormField label="AQL Name">
                <input type="text" name="name" value={currentAql.name}
                       onChange={this._updateValue}/>
              </FormField>
              <FormField label="Input AM Query Language (AQL)" htmlFor="AQL_STR">
                  <textarea value={currentAql.str} rows={10} onChange={() => this.openLayer(LAYER_TYPE.AQL_STR)}
                            onClick={() => this.openLayer(LAYER_TYPE.AQL_STR)}/>
              </FormField>
              <FormField label="Category" htmlFor="AQL_Category">
                <SearchInput type="text" name="category" value={currentAql.category}
                             onDOMChange={this._updateValue} suggestions={categories.sort()}
                             onSelect={event => this._updateValue(event, event.suggestion)}/>
              </FormField>
              {
                currentAql.view &&
                <FormField label="Linked to" htmlFor="AQL_LinkTo">
                  <ActionLabel label={`View: ${currentAql.view.name}`}
                               icon={<Trash/>} onClick={() => this.alert(ALERT_TYPE.REMOVE)}/>
                </FormField>
              }
            </Form>
          </Box>
        </Box>
          : <ContentPlaceHolder/>
        }
      </Box>
    );
  }
}
