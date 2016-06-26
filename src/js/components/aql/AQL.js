import React, {Component} from 'react';
import ChartForm from './ChartForm';
import MeterForm from './MeterForm';
import DistributionForm from './DistributionForm';
import Graph from './../commons/Graph';
import AlertForm from './../commons/AlertForm';
import GroupList from './../commons/GroupList';
import GroupListItem from './../commons/GroupListItem';
import * as AQLActions from '../../actions/aql';
import * as ExplorerActions from '../../actions/explorer';
import RecordList from '../explorer/RecordList';
import ActionTab from '../commons/ActionTab';
import SideBar from '../commons/SideBar';
import EmptyIcon from '../commons/EmptyIcon';
import * as Format from '../../constants/RecordFormat';
import Download from 'grommet/components/icons/base/Download';
import More from 'grommet/components/icons/base/More';
import Mail from 'grommet/components/icons/base/Mail';
import Trash from 'grommet/components/icons/base/Trash';

import {
  Anchor,
  Box,
  Split,
  Form,
  FormField, FormFields,
  Layer,
  Tabs,
  Table,
  TableRow,
  Title, Header,
  Menu
} from 'grommet';
import Play from 'grommet/components/icons/base/Play';
import Checkmark from 'grommet/components/icons/base/Checkmark';
import Close from 'grommet/components/icons/base/Close';
import Add from 'grommet/components/icons/base/Add';
import Attachment from 'grommet/components/icons/base/Attachment';

export default class AQL extends Component {

  constructor() {
    super();
    this.state = {
      reports: {},
      aqls: [],
      aql: {
        name: '',
        category: ''
      },
      data: {
        header: [],
        rows: []
      }
    };
    this._onClose = this._onClose.bind(this);
  }

  componentDidMount() {
    this._initAQL();
    this._loadViews();
    this._loadAQLs();
    this._loadInToolReport();
  }

  _onDownload(obj) {
    var content = "data:application/json;charset=utf-8,";
    var encodedUri = encodeURI(content + JSON.stringify(obj));
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", (obj.name || 'graph') + ".json");
    link.click();
  }

  _initAQL(callback) {
    this.setState({
      aql: {
        str: '',
        name: '',
        category: '',
        type: 'chart',
        form: 'init'
      },
      data: {
        header: [],
        rows: []
      }
    }, callback);
  }

  _loadViews() {
    ExplorerActions.loadViews((data) => {
      this.setState({
        views: data
      });
    });
  }

  _loadAQLs() {
    AQLActions.loadAQLs((data) => {
      this.setState({
        aqls: data
      });
    });
  }

  _loadAQL(aql) {
    this.setState({
      aql: {...aql},
      data: {
        header: [],
        rows: []
      }
    }, () => {
      if (window.event && this.refs && this.refs[aql.type]) {
        this.refs[aql.type]._onClickTab(event);
      }
      this._onQuery();
    });
  }

  _loadInToolReport() {
    AQLActions.loadReports((data) => {
      this.setState({
        reports: data
      });
    });
  }

  _onQuery() {
    AQLActions.queryAQL(this.state.aql.str, (data) => {
      if (this.state.aql.update) {
        const aql = this.state.aql;
        aql.form = 'init';
        aql.update = false;
        aql.meter = undefined;
        aql.chart = undefined;
        aql.distribution = undefined;
        this.setState({
          data,
          aql
        });
      } else {
        this.setState({
          data
        });
      }
    });
  }

  _onSaveAQL() {
    AQLActions.saveAQL(this.state.aql, (id) => {
      this._loadAQLs(this);
      var aql = this.state.aql;
      aql._id = id;
      this.setState({aql: aql});
    });
  }

  _onSave() {
    this.setState({
      alertLayer: <AlertForm onClose={this._removeAlertLayer.bind(this)}
                             title={'Save AQL: ' + this.state.aql.name + '?'}
                             desc={'AQL string: ' + this.state.aql.str} onConfirm={this._onSaveAQL.bind(this)}/>
    });
  }

  _onNew() {
    if (this.state.aql.str.trim() !== '') {
      this.setState({
        alertLayer: <AlertForm onClose={this._removeAlertLayer.bind(this)}
                               title={'Create a new AQL?'}
                               desc={'You have not saved AQL string: ' + this.state.aql.str}
                               onConfirm={this._initAQL.bind(this)}/>
      });
    } else {
      this._initAQL();
    }
  }

  _onDelete() {
    this.setState({
      alertLayer: <AlertForm onClose={this._removeAlertLayer.bind(this)}
                             title={'Delete AQL: ' + this.state.aql.name}
                             desc={'AQL string: ' + this.state.aql.str} onConfirm={this._removeAQL.bind(this)}/>
    });
  }

  _onMail(aql) {
    // let br = "%0D%0A";
    let subject = `AM Browser Graph: ${aql.name}`;
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
    AQLActions.removeAQL(this.state.aql._id, (id) => {
      console.log("Remove AQL: " + id);
      this._loadAQLs(this);
      this._initAQL();
    });
  }

  _removeView() {
    this.setState({
      alertLayer: <AlertForm onClose={this._removeAlertLayer.bind(this)}
                             title={'Remove attached view?'}
                             desc={'View name: ' + this.state.aql.view.name}
                             onConfirm={()=>{this.state.aql.view=null}} />
    });
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
    obj[path] = val;
    if (path === 'str' && obj.form !== 'init') {
      obj.update = true;
    }
    this.setState({aql: obj});
  }

  _genGraph(form, type) {
    var aql = this.state.aql;
    if (type) {
      aql.type = type;
    }

    if (form) {
      aql.form = form;
      aql[type] = form;
    } else {
      aql.form = aql[type] || 'init';
    }

    this.setState({aql: aql});

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
      ExplorerActions.loadView(viewInAQL._id, (view) => {
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

  _onClose() {
    this.setState({
      layer: null
    });
  }

  popupLayer(type) {
    if (type == 'reports') {
      return (
        <Layer onClose={this._onClose} closer={true} align="left">
          <Box full="vertical" justify="center">
            <Box
              pad={{vertical: 'medium'}}><Title>{`AQL Selector (${this.state.reports.entities.length})`}</Title></Box>
            <GroupList pad={{vertical: 'small'}} searchable={true}>
              {
                this.state.reports.entities &&
                this.state.reports.entities.map((report) => (
                  <GroupListItem key={report['ref-link']} groupby={this._getFieldStrVal(report.seType)}
                                 search={report.Name} pad="small" onClick={this._loadOOBAQL.bind(this, report)}>
                    <EmptyIcon />{report.Name}
                  </GroupListItem>
                ))
              }
            </GroupList>
          </Box>
        </Layer>
      );
    } else if (type == 'view') {
      return (
        <Layer onClose={this._onClose} closer={true} align="left">
          <Box full="vertical" justify="center">
            <Box pad={{vertical: 'medium'}}>
              <Title>{`Views Selector (${this.state.views && this.state.views.length})`}</Title>
            </Box>
            <GroupList pad={{vertical: 'small'}} searchable={true}>
              {
                this.state.views.map((view) => (
                  <GroupListItem key={view._id} groupby={view.category} search={view.name}
                                 pad={{horizontal: 'medium', vertical: 'small'}}
                                 onClick={this._attachView.bind(this, view)}>
                    <EmptyIcon />{view.name}
                  </GroupListItem>
                ))
              }
            </GroupList>
          </Box>
        </Layer>
      );
    } else if (typeof type == 'object' && type.type == 'records') {
      return (
        <Layer onClose={this._onClose} closer={true} flush={true} align="center">
          <Box full={true} pad="large">
            <RecordList body={type.args.body} title={type.args.name}/>
          </Box>
        </Layer>
      );
    }
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

    const toolbar = <Anchor href="#" icon={<Add />} label="Widgets" onClick={this._selectReports.bind(this)}/>;
    const contents = this.state.aqls.map((aql) => ({
      key: aql._id,
      groupby: aql.category,
      onClick: this._loadAQL.bind(this, aql),
      search: aql.name,
      child: aql.name
    }));

    const focus = this.state.aql && {expand: this.state.aql.category, selected: this.state.aql._id};
    const validData = this.state.data.rows.length > 0 && this.state.data.header.length === this.state.data.rows[0].length;

    return (
      <Box direction="row" flex={true}>
        <SideBar title={`Graphs (${this.state.aqls.length})`} toolbar={toolbar} contents={contents} focus={focus}/>
        <Box flex={true}>
          {this.state.alertLayer}
          <Header justify="between" size="small" pad={{'horizontal': 'small'}}>
            <Title>AQL and Graph</Title>
            <Menu direction="row" align="center" responsive={true}>
              <Anchor link="#" icon={<Play />} onClick={this._onQuery.bind(this)} label="Query"/>
              <Anchor link="#" icon={<Add />} onClick={this._onNew.bind(this)} label="New"/>
              <Anchor link="#" icon={<Checkmark />} onClick={this._onSave.bind(this)} label="Save"/>
              <Anchor link="#" icon={<Close />} onClick={this._onDelete.bind(this)} label="Delete"/>
              <Menu icon={<More />}>
                {
                  this.state.aql._id &&
                  <Anchor link="#" icon={<Mail />} onClick={this._onMail.bind(this, this.state.aql)} label="Mail"/>
                }
                <Anchor link="#" icon={<Download />} onClick={this._onDownload.bind(this, this.state.aql)}
                        label="Download"/>
                <Anchor link="#" icon={<Attachment />} onClick={this._selectView.bind(this)}
                        label={this.state.aql.view ? 'Attached view: ' + this.state.aql.view.name : 'Attach View'}/>
              </Menu>
            </Menu>
          </Header>
          <Box className='autoScroll' pad={{horizontal: 'medium'}}>
            <Box justify="between" direction="row" className='header'>
              <FormField label="Input AM Query Language (AQL)" htmlFor="AQL_Box">
                  <textarea id="AQL_Box" name="str" value={this.state.aql.str} rows="3"
                            onChange={this._setFormValues.bind(this)}/>
              </FormField>
              <Form pad={{horizontal: 'small'}}>
                <FormFields className='short-form'>
                  <FormField label="AQL Name" htmlFor="AQL_Box">
                    <input id="AQL_Name" type="text" name="name" value={this.state.aql.name}
                           onChange={this._setFormValues.bind(this)}/>
                  </FormField>
                  <FormField label="Category" htmlFor="AQL_Category">
                    <input id="AQL_Category" type="text" name="category" value={this.state.aql.category}
                           onChange={this._setFormValues.bind(this)}/>
                  </FormField>
                  {
                    this.state.aql.view &&
                    <FormField label="Link to" htmlFor="AQL_LinkTo">
                      <Anchor link="#" icon={<Trash />} onClick={this._removeView.bind(this)}
                              label={'View: ' + this.state.aql.view.name}/>
                    </FormField>
                  }
                </FormFields>
              </Form>
            </Box>
            <Split flex="left" fixed={false} className='fixMinSizing'>
              <Box pad={{vertical: 'small'}}>
                {validData && this.state.aql.form && this.state.aql.form != 'init' && this.state.aql.type &&
                <Graph type={this.state.aql.type} data={this.state.data} config={this.state.aql.form}
                       onClick={(filter) => this._showViewRecords(filter, this.state.aql.view)}/>}
                <Table>
                  <thead>
                  <tr>{header}</tr>
                  </thead>
                  <tbody>
                  {rows}
                  </tbody>
                </Table>
              </Box>
              {
                validData && this.state.aql.form &&
                <Box pad={{horizontal: 'small'}}>
                  <Tabs initialIndex={getIndex(this.state.aql.type)} justify='end'>
                    <ActionTab title="Chart" onClick={this._genGraph.bind(this, null, 'chart')} ref='chart'>
                      <ChartForm {...this.state.aql} genGraph={this._genGraph.bind(this)} data={this.state.data}/>
                    </ActionTab>
                    <ActionTab title="Meter" onClick={this._genGraph.bind(this, null, 'meter')} ref='meter'>
                      <MeterForm {...this.state.aql} genGraph={this._genGraph.bind(this)} data={this.state.data}/>
                    </ActionTab>
                    <ActionTab title="Distribution" onClick={this._genGraph.bind(this, null, 'distribution')}
                               ref='distribution'>
                      <DistributionForm {...this.state.aql} genGraph={this._genGraph.bind(this)}
                                                            data={this.state.data}/>
                    </ActionTab>
                    {
                      /*<Tab title="Value"/>
                       <Tab title="WorldMap"/>*/
                    }
                  </Tabs>
                </Box>
              }
              {this.state.layer && this.popupLayer(this.state.layer)}
            </Split>
          </Box>
        </Box>
      </Box>
    );
  }
}

