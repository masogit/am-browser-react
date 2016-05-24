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
import ActionTab from '../commons/ActionTab';

import {
  Anchor,
  Box,
  Sidebar,
  Split,
  Form,
  FormField,
  Layer,
  List,
  ListItem,
  Header,
  Tabs,
  Tab,
  Table,
  TableRow,
  Title,
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
      aql: {},
      data: {
        header: [],
        rows: []
      }
    };
  }

  componentDidMount() {
    this._initAQL();
    this._loadViews();
    this._loadAQLs();
    this._loadInToolReport();
  }

  _initAQL(callback) {
    this.setState({
      aql: {
        str: '',
        name: '',
        category: '',
        type: '',
        form: null
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
      if (this.refs && this.refs[aql.type]) {
        this.refs[aql.type]._onClickTab(event);
      }
      this._onQuery();
    });
  }

  _loadInToolReport() {
    AQLActions.loadReports((data) => {
      console.log(data);
      this.setState({
        reports: data
      });
    });
  }

  _onQuery() {
    AQLActions.queryAQL(this.state.aql.str, (data) => {
      this.setState({
        data
      });
    });
  }

  _onSaveAQL() {
    AQLActions.saveAQL(this.state.aql, (id) => {
      console.log("Save AQL: " + id);
      this._loadAQLs(this);
      var aql = this.state.aql;
      aql._id = id;
      this.setState({aql: aql});
      this.setState({
        alertLayer: <AlertForm onClose={this._removeAlertLayer.bind(this)}
                               title={'AQL: ' + aql.name + ' saved!'}
                               desc={'AQL string: ' + aql.str}
                               onConfirm={this._removeAlertLayer.bind(this)}/>
      });
    });
  }

  _onSave() {
    if (this.state.aql.str.trim() === '' || this.state.aql.name.trim() === '' || this.state.aql.category.trim() === '') {
      this.setState({
        alertLayer: <AlertForm onClose={this._removeAlertLayer.bind(this)}
                               title={'Save AQL failed!'}
                               desc={'AQL string or Name or Category empty'}
                               onConfirm={this._removeAlertLayer.bind(this)}/>
      });
    } else {
      this._onSaveAQL();
    }
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

  _loadOOBAQL(report) {
    this._initAQL(()=> {
      var aql = this.state.aql;
      aql.str = report.AQL;
      aql.name = report.Name;
      aql.category = 'OOB';
      this.setState({aql: aql}, this._onQuery());
    });
  }

  _setFormValues(event) {
    let val;
    if (event.target.type === 'checkbox') {
      val = event.target.checked;
    } else if (event.target.type === 'number') {
      val = event.target.value / 1;
    } else {
      val = event.target.value;
    }

    const path = event.target.name;
    const obj = this.state.aql;
    this.setValueByJsonPath(path, val, obj);
    this.setState({aql: obj});
  }

  setValueByJsonPath(path, val, obj) {
    var fields = path.split('.');
    var result = obj;
    for (var i = 0, n = fields.length; i < n && result !== undefined; i++) {
      var field = fields[i];
      if (i === n - 1) {
        result[field] = val;
      } else {
        if (typeof result[field] === 'undefined' || !_.isObject(result[field])) {
          result[field] = {};
        }
        result = result[field];
      }
    }
  }

  _genGraph(form, type) {
    var aql = this.state.aql;
    if (type) {
      aql.type = type;
    }
    form = form || aql[type];
    aql.form = form;
    aql[type] = form;

    this.setState({aql: aql});

    //TODO: meter: data less than 7/4
    //TODO: distribution: data must be all positive
  }

  _attachView(view) {
    var aql = this.state.aql;
    aql.view = view;
    this.setState({
      aql: aql,
      viewsLayer: null
    });
  }

  _selectView() {
    var viewsLayer = (
      <Layer onClose={this._onClose.bind(this)} closer={true} align="left">
        <Box full="vertical" justify="center">
          <Box pad={{vertical: 'medium'}}><Title>Views Selector ({this.state.views.length})</Title></Box>
          <GroupList pad={{vertical: 'small'}} searchable={true}>
            {
              this.state.views.map((view) => {
                return (
                  <GroupListItem key={view._id} groupby={view.category} search={view.name}
                                 pad="small">
                    <Anchor href="#" onClick={this._attachView.bind(this, view)}>{view.name}</Anchor>
                  </GroupListItem>
                );
              })
            }
          </GroupList>
        </Box>
      </Layer>
    );
    this.setState({
      viewsLayer: viewsLayer
    });
  }

  _onClose() {
    this.setState({
      viewsLayer: null
    });
  }

  render() {
    const header = this.state.data.header.map((col) => <th key={col.Index}>{col.Name}</th>);

    const  rows = this.state.data.rows.map((row, index) => (
      <TableRow key={index}> {
        row.map((col, i) => {
          return (<td key={i}>{col}</td>);
        })
      }</TableRow>
    ));

    const getIndex = (type) => {
      if (type === 'chart') return 0;
      if (type === 'meter') return 1;
      if (type === 'distribution') return 2;
      return 0;
    };

    const sideBar = (
      <Sidebar primary={true} pad="small" fixed={false} full={false} separator="right">
        <Tabs initialIndex={0} justify="start">
          <Tab title={'AQLs ('+this.state.aqls.length+')'}>
            <GroupList pad={{vertical: 'small'}} selectable={true} searchable={true}>
              {
                this.state.aqls.map((aql) => {
                  return (
                    <GroupListItem key={aql._id} groupby={aql.category} onClick={this._loadAQL.bind(this, aql)}
                                   search={aql.name} pad="small">
                      {aql.name}
                    </GroupListItem>
                  );
                })
              }
            </GroupList>
          </Tab>
          <Tab title={this.state.reports.count?`Repository (${this.state.reports.count})`:'Repository'}>
            <List selectable={true}>
              {
                this.state.reports.entities &&
                this.state.reports.entities.map((report) => {
                  return (
                    <ListItem key={report['ref-link']}
                              onClick={this._loadOOBAQL.bind(this, report)}>{report.Name}</ListItem>
                  );
                })
              }
            </List>
          </Tab>
        </Tabs>
      </Sidebar>
    );

    return (
      <Split flex="right">
        {sideBar}
        <Box pad={{horizontal: 'small'}}>
          <div>
            {this.state.alertLayer}
            <Header justify="between" size="small" pad={{'horizontal': 'small'}}>
              <Title>AM Insight</Title>
              <Menu direction="row" align="center" responsive={false}>
                <Anchor link="#" icon={<Play />} onClick={this._onQuery.bind(this)}>Query</Anchor>
                <Anchor link="#" icon={<Add />} onClick={this._onNew.bind(this)}>New</Anchor>
                <Anchor link="#" icon={<Checkmark />} onClick={this._onSave.bind(this)}>Save</Anchor>
                <Anchor link="#" icon={<Close />} onClick={this._onDelete.bind(this)}>Delete</Anchor>
                <Anchor link="#" icon={<Attachment />} onClick={this._selectView.bind(this)}>
                  {this.state.aql.view ? 'Attached view: ' + this.state.aql.view.name : 'Attach View'}
                </Anchor>
              </Menu>
            </Header>
            <Box justify="between" direction="row" pad={{between:'medium'}} size="small">
              <FormField label="Input AM Query Language (AQL)" htmlFor="AQL_Box">
              <textarea id="AQL_Box" name="str" value={this.state.aql.str} rows="3"
                        onChange={this._setFormValues.bind(this)}/>
              </FormField>
              <Form pad="none" compact={true}>
                <FormField label="AQL Name" htmlFor="AQL_Box">
                  <input id="AQL_Name" type="text" name="name" value={this.state.aql.name}
                         onChange={this._setFormValues.bind(this)}/>
                </FormField>
                <FormField label="Category" htmlFor="AQL_Category">
                  <input id="AQL_Category" type="text" name="category" value={this.state.aql.category}
                         onChange={this._setFormValues.bind(this)}/>
                </FormField>
              </Form>
            </Box>
            <Split flex="left" fixed={false}>
              <Box>
                {this.state.data.rows.length > 0 && this.state.aql.form && this.state.aql.type &&
                    <Graph type={this.state.aql.type} data={this.state.data} config={this.state.aql.form} onClick={(filter) => console.log(filter.key + '=' + filter.value)} />}
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
                this.state.data && this.state.aql.form &&
                <Tabs initialIndex={getIndex(this.state.aql.type)} justify="start">
                  <ActionTab title="Chart" onClick={this._genGraph.bind(this, null, 'chart')} ref='chart'>
                    <ChartForm {...this.state.aql} genGraph={this._genGraph.bind(this)} data={this.state.data}/>
                  </ActionTab>
                  <ActionTab title="Meter" onClick={this._genGraph.bind(this, null, 'meter')} ref='meter'>
                    <MeterForm {...this.state.aql} genGraph={this._genGraph.bind(this)} data={this.state.data}/>
                  </ActionTab>
                  <ActionTab title="Distribution" onClick={this._genGraph.bind(this, null, 'distribution')} ref='distribution'>
                    <DistributionForm {...this.state.aql} genGraph={this._genGraph.bind(this)} data={this.state.data}/>
                  </ActionTab>
                  <Tab title="Value"/>
                  <Tab title="WorldMap"/>
                </Tabs>
              }
              {this.state.viewsLayer}
            </Split>
          </div>
        </Box>
      </Split>
    );
  }
}

