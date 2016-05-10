import React, {Component} from 'react';
import {
  CheckBox,
  // Split,
  Form,
  FormFields,
  FormField,
  NumberInput,
  Tabs,
  Tab
} from 'grommet';

export default class ChartForm extends Component {

  constructor() {
    super();
    this.state = {
      chart: {
        important: 0,
        max: 0,
        min: 0,
        threshold: 0,
        type: 'bar',
        series: [],
        xAxis: {placement: '', data: []},
        xAxis_col: null,
        series_col: null
      }
    };
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
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

  _setFormValues(event) {
    var val = event.target.value;
    var path = event.target.name;
    var obj = this.state.chart;

    this.setValueByJsonPath(path, val, obj);
    console.log(obj);
    this.setState({chart: obj}, this.props.genChart(obj, 'chart'));
  }

  render() {
    var col_options;
    if (this.props.header)
      col_options = this.props.header.map((header, index) => {
        return <option key={index} value={header.Index}>{header.Type}: {header.Name}</option>;
      });

    return (

      <Tabs initialIndex={0} justify="end">
        <Tab title="Basic">
          <Form pad="none" compact={true}>
            <FormFields>
              <FormField label="type">
                <select name="type" onChange={this._setFormValues.bind(this)}>
                  <option value=""></option>
                  <option value="line">line</option>
                  <option value="bar">bar</option>
                  <option value="area">area</option>
                </select>
              </FormField>
              <FormField label="size">
                <select name="size" onChange={this._setFormValues.bind(this)}>
                  <option value=""></option>
                  <option value="small">small</option>
                  <option value="medium">medium</option>
                  <option value="large">large</option>
                </select>
              </FormField>
              <legend>xAxis</legend>
              <FormField label="placement">
                <select name="xAxis.placement" onChange={this._setFormValues.bind(this)}>
                  <option value=""></option>
                  <option value="top">top</option>
                  <option value="bottom">bottom</option>
                </select>
              </FormField>
              <FormField label="column">
                <select name="xAxis_col" onChange={this._setFormValues.bind(this)}>
                  {col_options}
                </select>
              </FormField>
              <legend>Series</legend>
              <FormField label="column">
                <select name="series_col" onChange={this._setFormValues.bind(this)}>
                  {col_options}
                </select>
              </FormField>
              <legend>Legend</legend>
              <FormField label="position">
                <select name="legend.position" onChange={this._setFormValues.bind(this)}>
                  <option value=""></option>
                  <option value="overlay">overlay</option>
                  <option value="after">after</option>
                  <option value="inline">inline</option>
                </select>
              </FormField>
              <FormField label="total">
                <CheckBox id="legend.total" name="legend.total" toggle={true}
                          onChange={this._setFormValues.bind(this)}/>
              </FormField>
            </FormFields>
          </Form>
        </Tab>
        <Tab title="Advance">
          <Form pad="none" compact={true}>
            <FormFields>
              <FormField label="important">
                <NumberInput name="important" value={this.state.chart.important}
                             onChange={this._setFormValues.bind(this)}/>
              </FormField>
              <FormField label="threshold">
                <NumberInput name="threshold" value={this.state.chart.threshold}
                             onChange={this._setFormValues.bind(this)}/>
              </FormField>
              <FormField label="max">
                <NumberInput name="max" value={this.state.chart.max} onChange={this._setFormValues.bind(this)}/>
              </FormField>
              <FormField label="min">
                <NumberInput name="min" value={this.state.chart.min} onChange={this._setFormValues.bind(this)}/>
              </FormField>
              <FormField label="points">
                <CheckBox id="points" name="points" toggle={true} onChange={this._setFormValues.bind(this)}/>
              </FormField>
              <FormField label="segmented">
                <CheckBox id="segmented" name="segmented" toggle={true} onChange={this._setFormValues.bind(this)}/>
              </FormField>
              <FormField label="smooth">
                <CheckBox id="smooth" name="smooth" toggle={true} onChange={this._setFormValues.bind(this)}/>
              </FormField>
              <FormField label="sparkline">
                <CheckBox id="sparkline" name="sparkline" toggle={true} onChange={this._setFormValues.bind(this)}/>
              </FormField>
              <FormField label="units">
                <input type="text" name="units" onChange={this._setFormValues.bind(this)}/>
              </FormField>
            </FormFields>
          </Form>
        </Tab>
      </Tabs>
    );
  }
}
