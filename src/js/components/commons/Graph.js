/**
 * Created by huling on 5/22/2016.
 */
import React, {Component, PropTypes} from 'react';
import { Table, TableRow} from 'grommet';
import LegendMeter from './Legend_Meter';
import LegendChart from './Legend_Chart';
import Legend from './Legend';
import LegendDistribution from './Legend_Distribution';
import {findIndex} from 'lodash';

const assignObjectProp = (from, to, propName) => {
  if (from[propName]) {
    to[propName] = from[propName];
  }
};

const getFullCol = (row, header) => {
  return row.map((value, index) => ({
    key: header[index].Name,
    value
  }));
};

const setOnClick = (obj, value, onClick, row, header, keyIndex, valueIndex) => {
  if (!isNaN(value)) {
    const filter = getFullCol(row, header);
    if (onClick) {
      obj.onClick = () => {
        onClick({
          key: !isNaN(Number.parseInt(keyIndex)) ? header[keyIndex].Name: keyIndex,
          value: row[valueIndex]
        }, filter);
      };
    }
  }
};

const setSeriesItem = (seriesIndex, onClick, row, header, index, text, condition = {}) => {
  const value = row[seriesIndex] / 1.0;

  const legend = {
    value,
    label: '' + text
  };

  const valueIndex = condition.value ? findIndex(header, item => item.Name == condition.value) : index || 0;
  setOnClick(legend, value, onClick, row, header, condition.key || index || 0, valueIndex);
  return legend;
};

const cloneObj = form => {
  const { xAxis = {}, legend={},  type, size, important = 0 } = form;
  const { position: legendPosition, direction: legendDirection = 'row', total: legendTotal } = legend;
  const { placement: xAxisPlacement } = xAxis;
  const chart = {
    size,
    type,
    xAxisPlacement,
    important,
    legendPosition,
    legendDirection,
    legendTotal
  };

  assignObjectProp(form, chart, 'threshold');
  assignObjectProp(form, chart, 'thresholds');
  assignObjectProp(form, chart, 'points');
  assignObjectProp(form, chart, 'smooth');
  assignObjectProp(form, chart, 'units');
  assignObjectProp(form, chart, 'stacked');
  assignObjectProp(form, chart, 'vertical');
  assignObjectProp(form, chart, 'col_unit');
  assignObjectProp(form, chart, 'min');
  assignObjectProp(form, chart, 'max');

  return chart;
};

export default class Graph extends Component {
  _gen_chart(form, data, onClick) {
    const { series_col = [], series, xAxis_col, label, condition} = form;
    const chart = cloneObj(form);

    if (series_col.length > 0 || (series && series.length > 0)) {
      const xAxisLabels = [];
      const titles = [];
      // gen series
      const legendSeries = _.times(form.series_col.length, () => []);
      const chartsValues = _.times(form.series_col.length, () => []);

      data.rows.map((row, i) => {
        const xAxisLabel = form.xAxis_col ? row[form.xAxis_col] : i;
        const values = [];
        form.series_col.map((seriesIndex, index) => {
          const value = row[seriesIndex] / 1.0;
          const legend = setSeriesItem(seriesIndex, onClick, row, data.header, label || xAxis_col, xAxisLabel, condition);
          legendSeries[index].push(legend);

          chartsValues[index].push(value);
          values.push(value);
        });

        // gen xAxis
        xAxisLabels.push({label: xAxisLabel, displayValue: values, index: i});
      });

      series_col.map(col => titles.push(data.header[col] ? data.header[col].Name : ''));

      chart.chartsValues = chartsValues;
      chart.legendSeries = legendSeries;
      chart.legendTitles = titles;
      chart.xAxisLabels = xAxisLabels;
    }
    return chart;
  }

  _gen_distribution(form, data, onClick) {
    const {series_col, important, label, condition} = form;
    const distribution = cloneObj(form);

    const series = [];

    if (series_col) {
      data.rows.forEach(row  => {
        const legend = setSeriesItem(series_col, onClick, row, data.header, label, row[label] || '', condition);
        legend.important = series_col == important;
        series.push(legend);
      });

      distribution.legendSeries = series;
      distribution.legendTitle = data.header[series_col] && data.header[series_col].Name;
      distribution.distributionSeries = series;
    }

    return distribution;
  }

  _gen_meter(form, data, onClick) {
    const { col_unit, series_col, condition} = form;
    const meter = cloneObj(form);

    const series = [];

    if (series_col) {
      data.rows.forEach(row => {
        const legend = setSeriesItem(series_col, onClick, row, data.header, col_unit, row[col_unit] || '', condition);
        series.push(legend);
      });

      // gen legend
      meter.legendSeries = series;
      meter.legendTitle = data.header[series_col] && data.header[series_col].Name;
      meter.meterSeries = series;
    }

    return meter;
  }

  _gen_legend(form, data, onClick) {
    const {series_col, label, title} = form;
    const legend = cloneObj(form);
    delete legend.size;
    const series = [];

    if (series_col) {
      data.rows.forEach(row => {
        const legend = setSeriesItem(series_col, onClick, row, data.header, label, row[label] || '');
        series.push(legend);
      });
    }

    legend.series = series;
    legend.title = title;
    return legend;
  }

  _gen_table(data) {
    const header = data.header.map((col) => <th key={col.Index}>{col.Name}</th>);
    const rows = data.rows.map((row, index) => (
      <TableRow key={index}>{
        row.map((col, i) => <td key={i}>{col}</td>)
      }</TableRow>
    ));

    return (
      <Table>
        <thead>
        <tr>{header}</tr>
        </thead>
        <tbody>
        {rows}
        </tbody>
      </Table>
    );
  }

  render() {
    const {type, config, onClick, data, className} = this.props;

    let classes = ['hiddenScroll'];
    if (className) {
      classes.push(className);
    }
    classes = classes.join(' ');

    if (config == 'init') {
      return this._gen_table(data);
    }

    if (data && data.rows.length > 0) {
      const graph = this['_gen_' + type](config, data, onClick);
      let Chart;
      switch (type) {
        case 'chart':
          Chart = LegendChart; break;
        case 'meter':
          Chart = LegendMeter; break;
        case 'distribution':
          Chart = LegendDistribution; break;
        case 'legend':
          Chart = Legend; break;
      }

      return <Chart {...graph} className={classes}/>;
    }

    return null;
  }
}

Graph.propTypes = {
  type: PropTypes.string.isRequired,
  config: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  data: PropTypes.shape({
    header: PropTypes.array,
    rows: PropTypes.array
  }),
  onClick: PropTypes.func
};
