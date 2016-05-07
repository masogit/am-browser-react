import React, {Component} from 'react';
import * as AQLActions from '../../actions/aql';
import {
  // Anchor
  Box,
  Sidebar,
  Split,
  Form,
  FormFields,
  FormField,
  SearchInput,
  List,
  ListItem,
  // Header,
  Footer,
  Tabs,
  Tab,
  Table,
  TableRow
} from 'grommet';
// import Descend from 'grommet/components/icons/base/Descend';

export default class AQL extends Component {
  constructor() {
    super();
    this.state = {
      reports: {},
      aqls: [],
      data: null
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
        data: data
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
          <Box dirction="row">

              <FormFields>
                <FormField label="Input AM Query Language (AQL)" htmlFor="AQL_Box">
                  <textarea id="AQL_Box" ref="aql"></textarea>
                </FormField>
              </FormFields>
              <Footer>
                <button onClick={this._onQuery.bind(this)}>OK</button>
              </Footer>
            
          </Box>
          {
            this.state.data &&
            <Table>
              <thead>
              <tr>{header}</tr>
              </thead>
              <tbody>
              {rows}
              </tbody>
            </Table>
          }
        </div>
      </Split>
    );
  }
}

