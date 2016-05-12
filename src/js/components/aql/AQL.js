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

  _assignObjectProp(from, to, propName) {
    if (from[propName]) {
      to[propName] = from[propName];
    }
  }

  _genChart(form, type) {
    if (type == 'chart') {
      if (form.series_col.size > 0) {
        // gen series
        const series = [...form.series_col].map(col => ({
          label: this.state.data.header[col].Name,
          values: [],
          index: col
        }));

        form.xAxis.data = [];
        this.state.data.rows.map((row, i) => {
          // gen series
          series.forEach(item => {
            const value = row[item.index];
            item.values.push([i, value / 1.0]);
          });

          // gen xAxis
          if (form.xAxis.placement) {
            const xAxisLabel = form.xAxis_col ? row[form.xAxis_col] : i;
            form.xAxis.data.push({"label": '' + xAxisLabel, "value": i});
          }
        });

        const chart = {
          a11yTitleId: 'lineChartTitle',
          a11yDescId: 'lineChartDesc',
          important: form.important,
          threshold: form.threshold,
          type: form.type,
          series: series,
          size: form.size,
          points: form.points,
          segmented: form.segmented,
          smooth: form.smooth,
          sparkline: form.sparkline,
          units: form.units
        };

        this._assignObjectProp(form, chart, 'max');
        this._assignObjectProp(form, chart, 'min');

        // gen legend
        if (form.legend.position || form.legend.total) {
          chart.legend = {
            position: form.legend.position,
            total: form.legend.total
          };
        }

        // gen xAxis
        if (form.xAxis.placement && form.xAxis.data.length > 0) {
          chart.xAxis = form.xAxis;
        }
        this.setState({chart: chart});
      } else {
        this.setState({chart: null});
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
                      <ListItem key={report['ref-link']} onClick={
                        () => {
                          this.setState({aql: report.AQL});
                        }
                      }>{report.Name}</ListItem>
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
                this.state.chart &&
                <Chart {...this.state.chart} />
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
                  <ChartForm header={this.state.data.header} genChart={this._genChart.bind(this)}
                             chart={this.state.chart}/>
                </Tab>
                <Tab title="Meter"/>
                <Tab title="Distribution"/>
                <Tab title="Value"/>
                <Tab title="WorldMap"/>
              </Tabs>
            }
          </Split>
        </div>
      </Split>
    );
  }
}

