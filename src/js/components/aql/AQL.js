import React from 'react';
import _ from 'lodash';
import ChartForm from './ChartForm';
import MeterForm from './MeterForm';
import DistributionForm from './DistributionForm';
import Graph from './../commons/Graph';
import AlertForm from './../commons/AlertForm';
import * as AQLActions from '../../actions/aql';
import * as ExplorerActions from '../../actions/explorer';
import RecordListLayer from '../explorer/RecordListLayer';
import ActionTab from '../commons/ActionTab';
import AMSideBar from '../commons/AMSideBar';
import * as Format from '../../util/RecordFormat';
import Download from 'grommet/components/icons/base/Download';
import More from 'grommet/components/icons/base/More';
import Mail from 'grommet/components/icons/base/Mail';
import Trash from 'grommet/components/icons/base/Trash';
import {saveAs} from 'file-saver';
import {monitorEdit, stopMonitorEdit, dropCurrentPop, showInfo} from '../../actions/system';
import SearchInput from '../commons/SearchInput';
import ComponentBase from '../commons/ComponentBase';
import {
  Anchor, Box, Form, FormField, Layer, Tabs, Table, TableRow, Header, Menu
} from 'grommet';
import Play from 'grommet/components/icons/base/Play';
import Checkmark from 'grommet/components/icons/base/Checkmark';
import Close from 'grommet/components/icons/base/Close';
import Add from 'grommet/components/icons/base/Add';
import Attachment from 'grommet/components/icons/base/Attachment';
import ActionLabel from '../commons/ActionLabel';
import EditLayer from '../../components/commons/EditLayer';
import ContentPlaceHolder from '../../components/commons/ContentPlaceHolder';

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
    this._onClose = this._onClose.bind(this);
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

  _onDownload(obj) {
    let blob = new Blob([JSON.stringify(obj)], {type: "data:application/json;charset=utf-8"});
    saveAs(blob, (obj.name || 'graph') + ".json");
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
    ExplorerActions.loadViews().then(data => {
      this.setState({
        views: data
      });
    });
  }

  _loadAQLs() {
    this.addPromise(AQLActions.loadAQLs().then((data) => {
      let categories = _.uniq(data.map((aql) => {
        return aql.category;
      }));
      this.setState({
        aqls: data,
        categories: categories
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

  _onQuery() {
    this.addPromise(AQLActions.queryAQL(this.state.aql.str).then((data) => {
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

  _onMail(aql) {
    // let br = "%0D%0A";
    let subject = `AM Browser Graph: ${aql.name}`;
    if (!window.location.origin) {
      window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }
    let url = window.location.origin + '/insight/' + aql._id;
    let content = `URL: ${url}`;
    window.open(`mailto:test@example.com?subject=${subject}&body=${content}`, '_self');
  }

  _removeAlertLayer() {
    this.setState({
      alertLayer: null
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

  _removeView() {
    this.setState({ alertLayer: 'remove_view' });
  }

  _onDelete() {
    this.setState({alertLayer: 'delete'});
  }

  _onSave() {
    this.setState({alertLayer: 'save'});
  }

  getAlertLayer(type) {
    let title, desc, onConfirm;
    switch (type) {
      case 'remove_view' : {
        title = 'Remove attached view?';
        desc = 'View name: ' + this.state.aql.view.name;
        onConfirm = ()=> this.state.aql.view=null;
        break;
      }
      case 'delete': {
        title = 'Delete AQL: ' + this.state.aql.name;
        desc = 'AQL string: ' +this.state.aql.str;
        onConfirm = this._removeAQL.bind(this);
        break;
      }
      case 'save': {
        title = 'Save AQL: ' + this.state.aql.name + '?';
        desc = 'AQL string: ' + this.state.aql.str;
        onConfirm = this._onSaveAQL.bind(this);
        break;
      }
    }

    return title && <AlertForm title={title} desc={desc} onConfirm={onConfirm} onClose={this._removeAlertLayer.bind(this)}/>;
  }

  _loadOOBAQL(report) {
    this._initAQL(()=> {
      var aql = this.state.aql;
      aql.str = report.AQL;
      aql.name = report.Name;
      aql.category = 'OOB';
      this.setState({aql: aql}, this._onQuery());
    }, this._onClose());
  }

  _setFormValues(event) {
    const val = event.target.value;

    const path = event.target.name;
    const obj = this.state.aql;
    let graphData = this.state.graphData;
    let data = this.state.data;
    obj[path] = val;
    if (path === 'str' && !_.isEmpty(obj.form)) {
      // when AQL change, reset data, form and graphData
      obj.form = null;
      data = {
        header: [],
        rows: []
      };
      graphData = {};
    }
    this.setState({aql: obj, graphData: graphData, data: data});
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

  _selectView() {
    this.setState({
      layer: 'view'
    });
  }

  _selectReports() {
    this.setState({
      layer: 'reports'
    });
  }

  _showViewRecords(filter, viewInAQL) {
    if (viewInAQL && viewInAQL._id)
      ExplorerActions.loadView(viewInAQL._id).then((view) => {
        var body = view.body;
        var newFilter = Format.getFilterFromField(view.body.fields, filter);
        body.filter = (body.filter) ? `(${body.filter} AND ${newFilter})` : newFilter;

        this.setState({
          layer: {
            type: 'records',
            args: {body, name: view.name}
          }
        });
      });
  }

  _getFieldStrVal(val) {
    if (val instanceof Object)
      val = val[Object.keys(val)[0]];
    return val;
  }

  _setCategory(event) {
    var aql = this.state.aql;
    aql.category = event.suggestion;
    this.setState({
      aql: aql
    });
  }

  _onClose() {
    this.setState({
      layer: null
    });
  }

  _updateAQLStr() {
    this.setState({layer: 'aql_str'});
  }

  popupLayer(type) {
    const {reports, views} = this.state;
    if (type == 'reports') {
      const contents = reports.entities && reports.entities.map((report) => ({
        key: report['ref-link'],
        groupby: this._getFieldStrVal(report.seType),
        onClick: this._loadOOBAQL.bind(this, report),
        search: report.Name,
        child: report.Name
      }));

      return (
        <Layer onClose={this._onClose} closer={true} align="left" flush={true}>
          <AMSideBar title='AQL Selector' contents={contents} colorIndex='light-1' toggle={false} margin={{horizontal: 'medium'}} pad={{vertical: 'small'}}/>
        </Layer>
      );
    } else if (type == 'view') {
      const contents = views.map((view) => ({
        key: view._id,
        groupby: view.category,
        onClick: this._attachView.bind(this, view),
        search: view.name,
        child: view.name
      }));

      return (
        <Layer onClose={this._onClose} closer={true} align="left" flush={true}>
          <AMSideBar title='Views Selector' contents={contents} colorIndex='light-1' toggle={false} margin={{horizontal: 'medium'}} pad={{vertical: 'small'}}/>
        </Layer>
      );
    } else if (typeof type == 'object' && type.type == 'records') {
      return <RecordListLayer body={type.args.body} title={type.args.name} onClose={this._onClose.bind(this)}/>;
    } else if (type == 'aql_str') {
      return (
        <EditLayer onChange={this._setFormValues.bind(this)}
                  label='Input AM Query Language (AQL)' name='str'
                  value={this.state.aql.str}
                  onClose={() => {
                    this._onClose();
                    this._onQuery();
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

  render() {
    const header = this.state.data.header.map((col) => <th key={col.Index}>{col.Name}</th>);

    const rows = this.state.data.rows.map((row, index) => (
      <TableRow key={index}>{
        row.map((col, i) => <td key={i}>{col}</td>)
      }</TableRow>
    ));

    const getIndex = (type) => {
      if (type === 'chart') return 0;
      if (type === 'meter') return 1;
      if (type === 'distribution') return 2;
      return 0;
    };

    const toolbar = <Anchor icon={<Add />} onClick={this._onNew.bind(this)} label="New"/>;
    const contents = this.state.aqls.map((aql) => ({
      key: aql._id,
      groupby: aql.category,
      onClick: () => {
        if (aql._id != this.state.aql._id) {
          this.dropCurrentPop(`Open ${aql.name}`, this._loadAQL.bind(this, aql));
        }
      },
      search: aql.name,
      child: aql.name
    }));

    const focus = this.state.aql && {expand: this.state.aql.category, selected: this.state.aql._id};
    const validData = this.state.data.rows.length > 0 && this.state.data.header.length === this.state.data.rows[0].length;
    const activeIndex = validData ? getIndex(this.state.aql.type) : 0;
    return (
      <Box direction="row" flex={true}>
        <AMSideBar title='Graphs' toolbar={toolbar} contents={contents} focus={focus}/>
        {!_.isEmpty(this.state.aql) ? <Box flex={true}>
          {this.getAlertLayer(this.state.alertLayer)}
          <Header justify="between" pad={{'horizontal': 'medium'}}>
            <Box>AQL and Graph</Box>
            <Menu direction="row" align="center" responsive={true}>
              <Anchor link="#" icon={<Play />} onClick={() => this.state.aql.str && this._onQuery()} label="Query"
                      disabled={!this.state.aql.str}/>
              <Anchor link="#" icon={<Checkmark />}
                      onClick={() => this.state.aql.str && this.state.aql.name && this.state.aql.category && this._onSave()}
                      label="Save"
                      disabled={!this.state.aql.str || !this.state.aql.name || !this.state.aql.category}/>
              <Anchor link="#" icon={<Close />} onClick={() => this.state.aql._id && this._onDelete()} label="Delete"
                      disabled={!this.state.aql._id}/>
              <Menu icon={<More />} dropAlign={{ right: 'right', top: 'top' }}>
                {
                  this.state.aql._id &&
                  <Anchor icon={<Mail />} onClick={() => this.state.aql._id && this._onMail(this.state.aql)}
                          label="Mail" disabled={!this.state.aql._id}/>
                }
                <Anchor icon={<Download />}
                        onClick={() => this.state.aql._id && this._onDownload(this.state.aql)}
                        label="Download" disabled={!this.state.aql._id}/>
                <Anchor icon={<Attachment />} onClick={() => this.state.aql.str && this._selectView()}
                        disabled={!this.state.aql.str}
                        label={this.state.aql.view ? 'Attached view: ' + this.state.aql.view.name : 'Attach View'}/>
                <Anchor icon={<Add />} label="Widgets" onClick={this._selectReports.bind(this)}/>
              </Menu>
            </Menu>
          </Header>
          <Box className='autoScroll fixIEScrollBar' pad={{horizontal: 'medium'}} direction='row'>
            <Box className='fixMinSizing' flex={true}>
              {
                validData &&
                <Box style={{position: 'relative'}} flex={false}>
                  <Tabs activeIndex={activeIndex} initialIndex={activeIndex} justify='start'>
                    <ActionTab title="Chart" onClick={this._genGraph.bind(this, null, 'chart')} ref='chart'>
                      <ChartForm {...this.state.aql} {...this.state.graphData} genGraph={this._genGraph.bind(this)}
                                                                               data={this.state.data}/>
                    </ActionTab>
                    <ActionTab title="Meter" onClick={this._genGraph.bind(this, null, 'meter')} ref='meter'>
                      <MeterForm {...this.state.aql} {...this.state.graphData} genGraph={this._genGraph.bind(this)}
                                                                               data={this.state.data}/>
                    </ActionTab>
                    <ActionTab title="Distribution" onClick={this._genGraph.bind(this, null, 'distribution')}
                               ref='distribution'>
                      <DistributionForm {...this.state.aql} {...this.state.graphData}
                        genGraph={this._genGraph.bind(this)}
                        data={this.state.data}/>
                    </ActionTab>
                    {
                      /*<Tab title="Value"/>
                       <Tab title="WorldMap"/>*/
                    }
                  </Tabs>
                </Box>
              }
              <Box pad={{vertical: 'small'}}>
                {validData && this.state.aql.form && !_.isEmpty(this.state.aql.form) && this.state.aql.type &&
                <Box flex={false} className='grid' margin={{vertical: 'small'}}>
                  <Graph type={this.state.aql.type} data={this.state.data} config={this.state.aql.form}
                         onClick={(filter) => this._showViewRecords(filter, this.state.aql.view)}/>
                </Box>}
                <Table>
                  <thead>
                  <tr>{header}</tr>
                  </thead>
                  <tbody>
                  {rows}
                  </tbody>
                </Table>
              </Box>
              {this.state.layer && this.popupLayer(this.state.layer)}
            </Box>
            <Box justify="between" className='header' pad={{horizontal: 'small'}}>
              <Form pad='none' compact={true}>
                <FormField label="AQL Name" htmlFor="AQL_Name">
                  <input id="AQL_Name" type="text" name="name" value={this.state.aql.name}
                         onChange={this._setFormValues.bind(this)}/>
                </FormField>
                <FormField label="Input AM Query Language (AQL)" htmlFor="AQL_STR">
                    <textarea id="AQL_STR" value={this.state.aql.str} rows={10} onChange={this._updateAQLStr.bind(this)}
                              onClick={this._updateAQLStr.bind(this)}/>
                </FormField>
                <FormField label="Category" htmlFor="AQL_Category">
                  <SearchInput id="AQL_Category" type="text" name="category" value={this.state.aql.category}
                               onDOMChange={this._setFormValues.bind(this)} suggestions={this.state.categories}
                               onSelect={this._setCategory.bind(this)}/>
                </FormField>
                {
                  this.state.aql.view &&
                  <FormField label="Linked to" htmlFor="AQL_LinkTo">
                    <ActionLabel label={`View: ${this.state.aql.view.name}`}
                                 icon={<Trash/>} onClick={this._removeView.bind(this)}/>
                  </FormField>
                }
              </Form>
            </Box>
          </Box>
        </Box>
          : <ContentPlaceHolder/>
        }
      </Box>
    );
  }
}

