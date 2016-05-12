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
        threshold: 0,
        type: 'bar',
        xAxis: {placement: '', data: []},
        series_col: new Set(),
        xAxis_col: '',
        legend: {},
        size: 'medium'
      }
    };
  }

  componentWillMount() {
    if (this.props.chart) {
      const chart = Object.assign({}, this.state.chart, this.props.chart);
      //const chart = {...this.state.chart, ...nextProps.chart};
      this.setState({chart: chart});
    }
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.chart) {
      const chart = Object.assign({}, this.state.chart, nextProps.chart);
      //const chart = {...this.state.chart, ...nextProps.chart};
      this.setState({chart: chart});
    }
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
    let val;
    if (event.target.type === 'checkbox') {
      val = event.target.checked;
    } else if (event.target.type === 'number') {
      val = event.target.value / 1;
    } else {
      val = event.target.value;
    }

    const path = event.target.name;
    const obj = this.state.chart;
    if (path === 'series_col') {
      if (event.target.checked === true) {
        this.state.chart.series_col.add(event.target.id);
      } else {
        this.state.chart.series_col.delete(event.target.id);
      }
      val = this.state.chart.series_col;
    }

    this.setValueByJsonPath(path, val, obj);
    this.setState({chart: obj}, this.props.genChart(obj, 'chart'));
  }

  render() {
    const col_options = [];
    const xAxis_col_options = [];
    if (this.props.header) {
      this.props.header.map((header, index) => {
        xAxis_col_options.push(<option key={index} value={header.Index}>{header.Type}: {header.Name}</option>);
        if (['Long', 'Short', 'Int', 'Double', 'Byte'].includes(header.Type)) {
          col_options.push(
            <CheckBox
              key={index}
              id={header.Index}
              name='series_col'
              label={`${header.Type} : ${header.Name}`}
              checked={this.state.chart.series_col.has(header.Index)}
              onChange={this._setFormValues.bind(this)}/>
          );
        }
      });
    }
    return (
      <Tabs initialIndex={0} justify="end">
        <Tab title="Basic">
          <Form pad="none" compact={true}>
            <FormFields>
              <FormField label="Column">
                {col_options}
              </FormField>
              <FormField label="Type">
                <select name="type" value={this.state.chart.type} onChange={this._setFormValues.bind(this)}>
                  <option value="bar">bar</option>
                  <option value="area">area</option>
                  <option value="line">line</option>
                </select>
              </FormField>
              <FormField label="Size">
                <select value={this.state.chart.size} name="size" onChange={this._setFormValues.bind(this)}>
                  <option value="small">small</option>
                  <option value="medium">medium</option>
                  <option value="large">large</option>
                </select>
              </FormField>
              <FormField label="X Axis placement">
                <select value={this.state.chart.xAxis && this.state.chart.xAxis.placement} name="xAxis.placement"
                        onChange={this._setFormValues.bind(this)}>
                  <option value=""></option>
                  <option value="top">top</option>
                  <option value="bottom">bottom</option>
                </select>
              </FormField>
              <FormField label="X Axis label">
                <select name="xAxis_col" value={this.state.chart.xAxis_col} onChange={this._setFormValues.bind(this)}>
                  <option value=""></option>
                  {xAxis_col_options}
                </select>
              </FormField>
              <FormField label="Legend position">
                <select value={this.state.chart.legend && this.state.chart.legend.position} name="legend.position"
                        onChange={this._setFormValues.bind(this)}>
                  <option value=""></option>
                  <option value="overlay">overlay</option>
                  <option value="after">after</option>
                  {this.state.chart.type === 'line' && <option value="inline">inline</option>}
                </select>
              </FormField>
              <FormField label="Legend units">
                <input type="text" name="units" value={this.state.chart.units}
                       onChange={this._setFormValues.bind(this)}/>
              </FormField>
              <FormField label="Show legend total">
                <CheckBox checked={this.state.chart.legend && this.state.chart.legend.total} id="legend.total"
                          name="legend.total" toggle={true}
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
                <CheckBox id="points" name="points" checked={this.state.chart.points} toggle={true}
                          onChange={this._setFormValues.bind(this)}/>
              </FormField>
              {this.state.chart.type === 'bar' &&
              <FormField label="segmented">
                <CheckBox id="segmented" name="segmented" toggle={true} checked={this.state.chart.segmented}
                          onChange={this._setFormValues.bind(this)}/>
              </FormField>
              }
              {(this.state.chart.type === 'line' || this.state.chart.type === 'area') && (
                <FormField label="smooth">
                  <CheckBox id="smooth" name="smooth" toggle={true} checked={this.state.chart.smooth}
                            onChange={this._setFormValues.bind(this)}/>
                </FormField>
              )}

              <FormField label="sparkline">
                <CheckBox id="sparkline" name="sparkline" toggle={true} checked={this.state.chart.sparkline}
                          onChange={this._setFormValues.bind(this)}/>
              </FormField>
            </FormFields>
          </Form>
        </Tab>
      </Tabs>
    );
  }
}
