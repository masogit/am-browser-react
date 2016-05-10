import React, {Component} from 'react';
// import AChart from './AChart';
import ChartForm from './ChartForm';
import * as AQLActions from '../../actions/aql';
import {
  Anchor,
  Box,
  Chart,
  // Distribution,
  Sidebar,
  Split,
  // Form,
  // FormFields,
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
  // Meter
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
      chartForm: null,
      meterForm: null,
      distributionForm: null,
      valueForm: null,
      worldmapForm: null
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

  _genChart(form, type) {
    if (type == 'chart') {
      if (form.series_col) {
        // gen series
        var header = this.state.data.header.filter((h) => {
          return h.Index == form.series_col;
        })[0];
        var s = {label: header.Name, values: []};
        this.state.data.rows.map((row, i) => {
          // gen series
          s.values.push([i, row[form.series_col]]);
          // gen xAxis
          if (form.xAxis_col && form.xAxis.placement)
            form.xAxis.data.push({"label": row[form.xAxis_col], "value": i});
        });
        form.series.push(s);
        this.setState({chartForm: form});
      }
    }

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

    // var chartTab = <Tab title="Chart"> <AChart data={this.state.data}/> </Tab>;

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
          <FormField label="Input AM Query Language (AQL)" htmlFor="AQL_Box">
            <textarea id="AQL_Box" ref="aql" onChange={this._setAQL.bind(this)} value={this.state.aql}></textarea>
          </FormField>
          <Split flex="left" fixed={false}>
            <Box>
              {
                this.state.chartForm &&
                <Chart a11yTitleId="lineChartTitle" a11yDescId="lineChartDesc" series={this.state.chartForm.series}
                       xAxis={this.state.chartForm.xAxis} type={this.state.chartForm.type}
                       legend={this.state.chartForm.legend} size={this.state.chartForm.size}/>
              }
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
              this.state.data &&
              <Tabs initialIndex={0} justify="start">
                <Tab title="Chart">
                  <ChartForm header={this.state.data.header} genChart={this._genChart.bind(this)}/>
                </Tab>
                <Tab title="Meter"></Tab>
                <Tab title="Distribution"></Tab>
                <Tab title="Value"></Tab>
                <Tab title="WorldMap"></Tab>
              </Tabs>
            }
          </Split>
        </div>
      </Split>
    );
  }
}

