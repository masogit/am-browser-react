import React, {Component} from 'react';
import ChartForm from './ChartForm';
import MeterForm from './MeterForm.js';
import DistributionForm from './DistributionForm.js';
import AlertForm from './../commons/AlertForm';
import GroupList from './../commons/GroupList';
import GroupListItem from './../commons/GroupListItem';
import * as AQLActions from '../../actions/aql';
import * as ExplorerActions from '../../actions/explorer';
import {
  Anchor,
  Box,
  Chart,
  // Distribution,
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
  Menu,
  Meter,
  Distribution
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
      aql: {}
    };
  }

  componentDidMount() {
    this._initAQL();
    this._loadViews();
    this._loadAQLs();
    this._loadInToolReport();
  }

  _initAQL() {
    this.setState({
      aql: {
        str: '',
        name: '',
        category: '',
        type: '',
        form: null
      }
    });
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
      aql: {...aql}
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
      var aql = this.state.aql;
      aql.data = data;
      this.setState({
        aql: aql
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
        createdAlert: <AlertForm onClose={()=>{
          this.setState({
            createdAlert: null});}}
                                 title={'AQL: ' + aql.name + ' saved!'}
                                 desc={'AQL string: ' + aql.str}
                                 onConfirm={()=>{
                                   this.setState({
                                     createdAlert: null});}}/>
      });
    });
  }

  _onSave() {
    if (this.state.aql.str.trim() === '' || this.state.aql.name.trim() === '' || this.state.aql.category.trim() === '') {
      this.setState({
        validationAlert: <AlertForm onClose={()=>{
          this.setState({
            validationAlert: null});}}
                                    title={'Save AQL failed!'}
                                    desc={'AQL string or Name or Category empty'}
                                    onConfirm={()=>{
                                      this.setState({
                                        validationAlert: null});}}/>
      });
    } else {
      this._onSaveAQL();
    }
  }

  _onNew() {
    if (this.state.aql.str.trim() !== '') {
      this.setState({
        newAlert: <AlertForm onClose={()=>{
          this.setState({
            newAlert: null});}}
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
      deletionAlert: <AlertForm onClose={()=>{
        this.setState({
          deletionAlert: null});}}
                                title={'Delete AQL: ' + this.state.aql.name}
                                desc={'AQL string: ' + this.state.aql.str} onConfirm={this._removeAQL.bind(this)}/>
    });
  }

  _removeAQL() {
    AQLActions.removeAQL(this.state.aql._id, (id) => {
      console.log("Remove AQL: " + id);
      this._loadAQLs(this);
      this._initAQL();
    });
  }

  _loadAQLStr(str) {
    var aql = this.state.aql;
    aql.str = str;
    this.setState({aql: aql});
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
    aql.type = type;
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
          <GroupList pad={{vertical: 'small'}} searchable={true}>
            {
              this.state.views.map((view) => {
                return (
                  <GroupListItem key={view._id} groupby={view.category} search={view.name}
                                 pad={{horizontal: 'medium', vertical: 'small'}}>
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
    var header;
    var rows;
    // console.log(this.state);
    if (this.state.aql.data) {
      header = this.state.aql.data.header.map((col) => {
        return (<th key={col.Index}>{col.Name}</th>);
      });

      rows = this.state.aql.data.rows.map((row, index) => {
        return (<TableRow key={index}>
          {
            row.map((col, i) => {
              return (<td key={i}>{col}</td>);
            })
          }
        </TableRow>);
      });
    }

    var aqls = this.state.filteredAqls || this.state.aqls;
    const getGraph = () => {
      if (this.state.aql.form) {
        const activeIndex = (this.refs.graphForms && this.refs.graphForms.state.activeIndex) || 0;
        if (activeIndex === 0) {
          return <Chart {...this.state.aql.chart} />;
        }

        if (activeIndex === 1) {
          return <Meter {...this.state.aql.meter} />;
        }

        if (activeIndex === 2) {
          return <Distribution {...this.state.aql.distribution} />;
        }
      }
    };

    //TODO: switch tab will re-generate Graph
    return (
      <Split flex="right">
        <Sidebar pad="small" size="small">
          <Tabs initialIndex={0} justify="start">
            <Tab title={'AQLs ('+aqls.length+')'}>
              <GroupList selectable={true} searchable={true}>
                {
                  aqls.map((aql) => {
                    return (
                      <GroupListItem key={aql._id} groupby={aql.category} onClick={this._loadAQL.bind(this, aql)}
                                     search={aql.name}>
                        {aql.name}
                      </GroupListItem>
                    );
                  })
                }
              </GroupList>
            </Tab>
            <Tab title="Repository">
              <List selectable={true}>
                {
                  this.state.reports.entities &&
                  this.state.reports.entities.map((report) => {
                    return (
                      <ListItem key={report['ref-link']}
                                onClick={this._loadAQLStr.bind(this, report.AQL)}>{report.Name}</ListItem>
                    );
                  })
                }
              </List>
            </Tab>
          </Tabs>
        </Sidebar>
        <div>
          {this.state.newAlert}
          {this.state.createdAlert}
          {this.state.deletionAlert}
          {this.state.validationAlert}
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
              {getGraph()}
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
              this.state.aql.data &&
              <Tabs initialIndex={0} justify="start" ref='graphForms'>
                <Tab title="Chart">
                  <ChartForm {...this.state.aql} genGraph={this._genGraph.bind(this)}/>
                </Tab>
                <Tab title="Meter">
                  <MeterForm {...this.state.aql} genGraph={this._genGraph.bind(this)}/>
                </Tab>
                <Tab title="Distribution">
                  <DistributionForm {...this.state.aql} genGraph={this._genGraph.bind(this)}/>
                </Tab>
                <Tab title="Value"/>
                <Tab title="WorldMap"/>
              </Tabs>
            }
          </Split>
          {this.state.viewsLayer}
        </div>
      </Split>
    );
  }
}

