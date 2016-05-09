import React, {Component} from 'react';
import {
  Chart,
  Split,
  Form,
  FormFields,
  FormField
} from 'grommet';

export default class AChart extends Component {

  constructor() {
    super();
    this.state = {
      data: null,
      chart: {
        type: 'bar',
        series: [],
        xAxis: {placement: 'bottom', data: []},
        legend: {position: 'after', total: false},
        size: 'medium'
      }
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

  _setSeries() {
    var index = this.refs.col4series.value;
    if (index && this.state.data) {
      var chart = this.state.chart;
      var s = {label: this.state.data.header[index], values: []};
      this.state.data.rows.map((row, i) => {
        s.values.push([i, row[index]]);
      });
      chart.series.push(s);
      this.setState({
        chart: chart
      });
    }
  }

  _setXaxis() {
    var index = this.refs.col4xAxis.value;
    if (index && this.state.data) {
      var chart = this.state.chart;
      this.state.data.rows.map((row, i) => {
        chart.xAxis.data.push({"label": row[index], "value": i});
      });
      this.setState({
        chart: chart
      });
    }
  }

  _setFormValues(event) {
    var val = event.target.value;
    var path = event.target.name;
    var obj = this.state.chart;
    console.log("val: " + val);
    console.log("path: " + path);
    console.log("before");
    console.log(obj);
    this.setValueByJsonPath(path, val, obj);
    console.log("after");
    console.log(obj);
    this.setState({chart: obj});
  }

  render() {
    var col_options;
    if (this.state.data)
      col_options = this.state.data.header.map((header, index) => {
        return <option key={index} value={header.Index}>{header.Type}: {header.Name}</option>;
      });

    return (
      <Split flex="right">
        <Form pad="small" compact={true}>
          <legend>Basic</legend>
          <FormFields>
            <FormField label="Chart Type">
              <select name="type" onChange={this._setFormValues.bind(this)}>
                <option value="line">line</option>
                <option value="bar">bar</option>
                <option value="area">area</option>
              </select>
            </FormField>
            <FormField label="xAxis">
              <select ref="col4xAxis" onChange={this._setXaxis.bind(this)}>
                <option></option>
                {this.state.data && col_options}
              </select>
            </FormField>
            <FormField label="Size">
              <select name="size" onChange={this._setFormValues.bind(this)}>
                <option value="small">small</option>
                <option value="medium">medium</option>
                <option value="large">large</option>
              </select>
            </FormField>
          </FormFields>
          <legend>Series</legend>
          <FormFields>
            <FormField label="Series">
              <select ref="col4series" onChange={this._setSeries.bind(this)}>
                <option></option>
                {this.state.data && col_options}
              </select>
            </FormField>
          </FormFields>
          <button>Generate</button>
        </Form>

        <Chart series={this.state.chart.series}
          xAxis={this.state.chart.xAxis} type={this.state.chart.type}
          legend={this.state.chart.legend} size={this.state.chart.size}
          a11yTitleId="lineChartTitle" a11yDescId="lineChartDesc"/>

      </Split>
    );
  }
}
