import React, {Component} from 'react';
import {
  Chart,
  Split,
  Form,
  FormFields,
  FormField,
} from 'grommet';

export default class AChart extends Component {
  constructor() {
    super();
    this.state = {
      data: null,
      type: 'bar',
      series: [],
      xAxis: {placement: 'top', data:[]},
      legend: {position: 'inline', total: true}
    };
  }

  componentDidMount() {
    this.setState({
      data: this.props.data
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: this.props.data
    });
  }

  _setSeries() {
    var index = this.refs.col4series.value;
    if(index && this.state.data) {
      var series = [];
      this.state.data.rows.map((row, i) => {
        series.push([i, row[index]]);
      });
      this.setState({
        series: series
      });
    }
  }

  _setXaxis() {
    var index = this.refs.col4xAxis.value;
    if(index && this.state.data) {
      var xAxis = this.state.xAxis;
      this.state.data.rows.map((row, i) => {
        xAxis.data.push({"label": row[index], "value": i});
      });
      this.setState({
        xAxis: xAxis
      });
    }
  }

  _setChartType() {
    this.setState({
      type: this.refs.chartType.value
    });
  }

  render() {
    var col_options;
    if (this.state.data)
      col_options = this.state.data.header.map((header, index) => {
      return <option key={index} value={header.Index}>{header.Name} (Type: {header.Type})</option>;
    });

    return (
      <Split flex="right">
        <Form pad="small" compact={true}>
          <FormFields>
            <FormField label="Chart Type">
              <select ref="chartType" onChange={this._setChartType.bind(this)}>
                <option>line</option>
                <option>bar</option>
                <option>area</option>
              </select>
            </FormField>
            <FormField label="Series">
              <select ref="col4series" onChange={this._setSeries.bind(this)}>
                <option></option>
                {
                  this.state.data && col_options
                }
              </select>
            </FormField>
            <FormField label="xAxis">
              <select ref="col4xAxis" onChange={this._setXaxis.bind(this)}>
                <option></option>
                {
                  this.state.data && col_options
                }
              </select>
            </FormField>
            <FormField label="size">
              <select name="size">
                <option>small</option>
                <option>medium</option>
                <option>large</option>
              </select>
            </FormField>
          </FormFields>
        </Form>
        {
          this.state.series.length > 0 &&
          <Chart series={[
                  {
                    "values": this.state.series,
                    "colorIndex": "graph-1"
                  }
                ]} xAxis={this.state.xAxis} max={5} threshold={3} type={this.state.type}
                 legend={this.state.legend}
                 a11yTitleId="lineChartTitle" a11yDescId="lineChartDesc"/>
        }

      </Split>
    );
  }
}