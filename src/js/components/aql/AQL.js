import React, {Component} from 'react';
import * as AQLActions from '../../actions/aql';
import {
  Anchor,
  // Box,
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
  Menu
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
      aql: ""
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

  render() {
    var header;
    var rows;
    console.log(this.state);
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
                <textarea id="AQL_Box" ref="aql"></textarea>
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
            <Tab title="Charts">
              <Form pad="small">
                <Header>Chart Definition</Header>
                <FormFields>
                  <FormField label="Chart Name" htmlFor="AQL_Box">
                    <input type="text"></input>
                  </FormField>
                </FormFields>
              </Form>
            </Tab>
            <Tab title="Meter">

            </Tab>
            <Tab title="Distribution">
            </Tab>
            <Tab title="Value">
            </Tab>
          </Tabs>

        </div>
      </Split>
    );
  }
}

