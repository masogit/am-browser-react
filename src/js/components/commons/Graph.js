/**
 * Created by huling on 5/22/2016.
 */
import React, {Component, PropTypes} from 'react';
import { Table, TableRow} from 'grommet';
import LegendMeter from './Legend_Meter';
import LegendChart from './Legend_Chart';
import Legend from './Legend';
import LegendDistribution from './Legend_Distribution';

const assignObjectProp = (from, to, propName) => {
  if (from[propName]) {
    to[propName] = from[propName];
  }
};

export default class Graph extends Component {
  constructor() {
    super();
  }

  _gen_chart(form, data, onClick) {
    const {xAxis: {placement: xAxisPlacement}, legend: {position: legendPosition, direction: legendDirection = 'row'}, type, smooth, size, points} = form;
    const chart = {
      points,
      size,
      smooth,
      type,
      xAxisPlacement
    };


    if (form.series_col.length > 0 || (form.series && form.series.length > 0)) {
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
          chartsValues[index].push(value);

          const legend = {
            value,
            label: xAxisLabel
          };

          if (!isNaN(value)) {
            let val = row[form.xAxis_col];
            let filter = this._getFullCol(row, data.header);
            let mainFilterKey = form.label || form.xAxis_col;
            let mainFilterValue = form.label ? label : val;
            if (mainFilterKey && onClick) {
              legend.onClick = () => {
                onClick({
                  key: data.header[mainFilterKey].Name,
                  value: mainFilterValue
                }, filter);
              };
            }
          }

          legendSeries[index].push(legend);
          values.push(value);
        });

        // gen xAxis
        if (xAxisPlacement) {
          xAxisLabels.push({label: xAxisLabel, displayValue: values, index: i});
        }
      });

      form.series_col.map(col => titles.push(data.header[col] ? data.header[col].Name : ''));

      chart.chartsValues = chartsValues;
      chart.legendPosition = legendPosition;
      chart.legendSeries = legendSeries;
      chart.legendTitles = titles;
      chart.legendDirection = legendDirection;

      chart.xAxisLabels = xAxisLabels;

    }
    assignObjectProp(form, chart, 'max');
    assignObjectProp(form, chart, 'min:');
    assignObjectProp(form, chart, 'legendPosition');
    assignObjectProp(form, chart, 'threshold');
    assignObjectProp(form, chart, 'important');
    assignObjectProp(form, chart, 'units');
    return chart;
  }

  _getFullCol(row, header) {
    return row.map((value, index) => ({
      key: header[index].Name,
      value
    }));
  }

  _gen_distribution(form, data, onClick) {
    const {legend = {}, size, units, series_col, important} = form;
    const  {position: legendPosition, direction: legendDirection = 'row'} = legend;
    const distribution = {
      size,
      units
    };

    const series = [];

    if (series_col) {
      data.rows.map((row, index) => {
        const value = row[form.series_col] / 1.0;
        if (!isNaN(value)) {
          const label = form.label ? '' + row[form.label] : '';
          const filter = this._getFullCol(row, data.header);
          const mainFilterKey = form.label || form.series_col;
          const mainFilterValue = form.label ? label : value;
          series.push({
            label,
            value,
            important: form.series_col == important,
            index,
            onClick: onClick && onClick.bind(this, {
              key: data.header[mainFilterKey].Name,
              value: mainFilterValue
            }, filter)
          });
        }
      });

      distribution.legendPosition = legendPosition;
      distribution.distributionSeries = series;
      distribution.legendSeries = series;
      distribution.legendTitle = data.header[series_col] && data.header[series_col].Name;
      distribution.legendDirection = legendDirection;

    }

    return distribution;
  }

  _gen_meter(form, data, onClick) {
    const { type, units, size, legend: {position: legendPosition, direction: legendDirection = 'row'}, series_col} = form;
    const meter = {
      size,
      type,
      units,
      legendPosition,
      legendDirection
    };

    const series = [];

    assignObjectProp(form, meter, 'threshold');
    assignObjectProp(form, meter, 'thresholds');
    assignObjectProp(form, meter, 'stacked');
    assignObjectProp(form, meter, 'vertical');
    assignObjectProp(form, meter, 'important');
    assignObjectProp(form, meter, 'max');
    assignObjectProp(form, meter, 'min');

    if (series_col) {
      data.rows.filter((row, index) => {
        const value = row[series_col] / 1.0;
        if (!isNaN(value)) {
          const label = form.col_unit ? '' + row[form.col_unit] : '';
          const filter = this._getFullCol(row, data.header);
          const mainFilterKey = form.col_unit || form.series_col;
          const mainFilterValue = form.col_unit ? label : value;
          series.push({
            label,
            value,
            onClick: onClick && onClick.bind(this, {
              key: data.header[mainFilterKey].Name,
              value: mainFilterValue
            }, filter)
          });
        }
      });

      // gen legend
      if (legendPosition) {
        meter.legendPosition = legendPosition;
        meter.legendSeries = series;
        meter.legendTitle = data.header[series_col] && data.header[series_col].Name;
        meter.legendDirection = legendDirection;
      }

      meter.meterSeries = series;
    }

    return meter;
  }

  _gen_legend(form, data, onClick) {
    const legend = {
      series_col: form.series_col,
      series: [],
      col_unit: form.col_unit,
      units: form.units,
      total: form.total
    };

    if (form.series_col) {
      data.rows.filter((row, index) => {
        const value = row[form.series_col] / 1.0;
        if (!isNaN(value)) {
          const label = form.label ? '' + row[form.label] : '';
          const filter = this._getFullCol(row, data.header);
          const mainFilterKey = form.label || form.series_col;
          const mainFilterValue = form.label ? label : value;
          legend.series.push({
            label,
            value,
            index,
            onClick: onClick && onClick.bind(this, {
              key: data.header[mainFilterKey].Name,
              value: mainFilterValue
            }, filter)
          });
        }
      });
    }

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
      switch (type) {
        case 'chart':
          return <LegendChart {...graph} className={classes}/>;
        case 'meter':
          return <LegendMeter {...graph} className={classes}/>;
        case 'distribution':
          return <LegendDistribution {...graph} className={classes}/>;
        case 'legend':
          return <Legend {...graph} className={classes}/>;
        default :
          return <div/>;
      }
    } else
      return <div/>;
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
