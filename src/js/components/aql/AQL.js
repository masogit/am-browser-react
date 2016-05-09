import React, {Component} from 'react';
import AChart from './AChart';
import * as AQLActions from '../../actions/aql';
import {
  Anchor,
  // Box,
  // Chart,
  Distribution,
  Sidebar,
  Split,
  Form,
  FormFields,
  FormField,
  SearchInput,
  List,
  ListItem,
  Header,
  // Footer,
  Tabs,
  Tab,
  Table,
  TableRow,
  Title,
  Menu,
  Meter
} from 'grommet';
import Play from 'grommet/components/icons/base/Play';
import Checkmark from 'grommet/components/icons/base/Checkmark';
import Close from 'grommet/components/icons/base/Close';

export default class AQL extends Component {
  constructor() {
    super();
    this.state = {
      reports: {},
      aqls: [],
      data: null,
      aql: "",
      chart: null,
      meter: null,
      distribution: null,
      value: null,
      worldmap: null
    };
    // this._onQuery.bind(this);
  }

  componentDidMount() {
    AQLActions.loadAQLs((data) => {
      // this.setState({
      //   aqls: data
      // });
    });
    AQLActions.loadReports((data) => {
      console.log(data);
      this.setState({
        reports: data
      });
    });
  }

  componentWillReceiveProps(newProps) {
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  _onQuery(e) {
    e.preventDefault();
    AQLActions.queryAQL(this.refs.aql.value, (data) => {
      console.log(data);
      this.setState({
        data: data,
        aql: this.refs.aql.value
      });
    });
  }

  _setAQL() {
    this.setState({
      aql: this.refs.aql.value
    });
  }

  render() {
    var header;
    var rows;
    // console.log(this.state);
    if (this.state.data) {
      header = this.state.data.header.map((col) => {
        return (<th key={col.Index}>{col.Name}</th>);
      });

      rows = this.state.data.rows.map((row, index) => {
        return (<TableRow key={index}>
          {
            row.map((col, i) => {
              return (<td key={i}>{col}</td>);
            })
          }
        </TableRow>);
      });

    }
    
    var chartTab = <Tab title="Chart"> <AChart data={this.state.data} /> </Tab>;

    return (

      <Split flex="right">
        <Sidebar primary={true} pad="small" size="small">
          <SearchInput suggestions={['123', '2344']}/>
          <Tabs initialIndex={0} justify="start">
            <Tab title="Reports">
              <List selectable={true}>
                {
                  this.state.reports.entities &&
                  this.state.reports.entities.map((report) => {
                    return (
                      <ListItem key={report['ref-link']}>{report.Name}</ListItem>
                    );
                  })
                }
              </List>
            </Tab>
            <Tab title="Saved AQLs">
              <List selectable={true}>
                {
                  this.state.aqls.map((aql) => {
                    return (
                      <ListItem key={aql._id}>{aql.name}</ListItem>
                    );
                  })
                }
              </List>
            </Tab>
          </Tabs>
        </Sidebar>
        <div>
          <Header justify="between" size="small" pad={{'horizontal': 'small'}}>
            <Title>AM Insight</Title>
            <Menu direction="row" align="center" responsive={false}>
              <Anchor link="#" icon={<Play />} onClick={this._onQuery.bind(this)}>Query</Anchor>
              <Anchor link="#" icon={<Checkmark />} onClick={this._onQuery.bind(this)}>Save</Anchor>
              <Anchor link="#" icon={<Close />} onClick={this._onQuery.bind(this)}>Delete</Anchor>
            </Menu>
          </Header>
          <Tabs initialIndex={0} justify="start">
            <Tab title="Data">
              <FormField label="Input AM Query Language (AQL)" htmlFor="AQL_Box">
                <textarea id="AQL_Box" ref="aql" onChange={this._setAQL.bind(this)} value={this.state.aql}></textarea>
              </FormField>
              <Table>
                <thead>
                <tr>{header}</tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
              </Table>
            </Tab>
            {chartTab}
            <Tab title="Meter">
              <Split flex="right">
                <Form pad="small" compact={true}>
                  <FormFields>
                    <FormField label="Meter Type">
                      <select name="meterType">
                        <option>bar</option>
                        <option>arc</option>
                        <option>circle</option>
                        <option>spiral</option>
                      </select>
                    </FormField>
                  </FormFields>
                </Form>
                <Meter type="arc" legend={true} series={[
                  {"label": "Physical", "value": 700},
                  {"label": "Subscribed", "value": 1200},
                  {"label": "Allocated", "value": 500}
                ]} vertical={true} units="TB" a11yTitleId="meter-title-15" a11yDescId="meter-desc-15"/>
              </Split>
            </Tab>

            <Tab title="Distribution">
              <Split flex="right">
                <Form pad="small" compact={true}>
                  <FormFields>
                    <FormField label="Meter Type">
                      <select name="meterType">
                        <option>bar</option>
                        <option>arc</option>
                        <option>circle</option>
                        <option>spiral</option>
                      </select>
                    </FormField>
                  </FormFields>
                </Form>
                <Distribution size="small" series={[
                  {"label": "First", "value": 40, "colorIndex": "graph-1"},
                  {"label": "Second", "value": 30, "colorIndex": "accent-2"},
                  {"label": "Third", "value": 20, "colorIndex": "unset"},
                  {"label": "Fourth", "value": 10, "colorIndex": "graph-1"}
                ]} a11yTitleId="distribution-title-3" a11yDescId="distribution-desc-3" />
              </Split>
            </Tab>

            <Tab title="Value">
              <Split flex="right">
                <Form pad="small" compact={true}>
                  <FormFields>
                    <FormField label="Meter Type">
                      <select name="meterType">
                        <option>bar</option>
                        <option>arc</option>
                        <option>circle</option>
                        <option>spiral</option>
                      </select>
                    </FormField>
                  </FormFields>
                </Form>
                <span>Value</span>
              </Split>
            </Tab>

            <Tab title="WorldMap">
              <Split flex="right">
                <Form pad="small" compact={true}>
                  <FormFields>
                    <FormField label="Meter Type">
                      <select name="meterType">
                        <option>bar</option>
                        <option>arc</option>
                        <option>circle</option>
                        <option>spiral</option>
                      </select>
                    </FormField>
                  </FormFields>
                </Form>
                <span>Wold Map</span>
              </Split>
            </Tab>

          </Tabs>

        </div>
      </Split>
    );
  }
}

