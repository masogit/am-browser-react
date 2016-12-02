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

const getFullCol = (row, header) => {
  return row.map((value, index) => ({
    key: header[index].Name,
    value
  }));
};

const setOnClick = (obj, value, onClick, row, header, valueIndex, headerIndex = valueIndex) => {
  if (!isNaN(value)) {
    const filter = getFullCol(row, header);
    if (onClick) {
      obj.onClick = () => {
        onClick({
          key: header[headerIndex].Name,
          value: row[valueIndex]
        }, filter);
      };
    }
  }
};

export default class Graph extends Component {
  _gen_chart(form, data, onClick) {
    const {xAxis: {placement: xAxisPlacement}, legend: {position: legendPosition, direction: legendDirection = 'row'},
      type, smooth, size, points, series_col = [], series, xAxis_col, label} = form;
    const chart = {
      points,
      size,
      smooth,
      type,
      xAxisPlacement
    };


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
          chartsValues[index].push(value);

          const legend = {
            value,
            label: xAxisLabel
          };

          setOnClick(legend, value, onClick, row, data.header, xAxis_col, label);

          legendSeries[index].push(legend);
          values.push(value);
        });

        // gen xAxis
        if (xAxisPlacement) {
          xAxisLabels.push({label: xAxisLabel, displayValue: values, index: i});
        }
      });

      series_col.map(col => titles.push(data.header[col] ? data.header[col].Name : ''));

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

  _gen_distribution(form, data, onClick) {
    const {legend = {}, size, units, series_col, important, label} = form;
    const  {position: legendPosition, direction: legendDirection = 'row'} = legend;
    const distribution = {
      size,
      units
    };

    const series = [];

    if (series_col) {
      data.rows.forEach((row, index) => {
        const value = row[series_col] / 1.0;
        const legend = {
          label: row[label] || '',
          value,
          important: series_col == important
        };

        setOnClick(legend, value, onClick, row, data.header, series_col, label);
        series.push(legend);
      });

      if (legendPosition) {
        distribution.legendPosition = legendPosition;
        distribution.legendSeries = series;
        distribution.legendTitle = data.header[series_col] && data.header[series_col].Name;
        distribution.legendDirection = legendDirection;
      }

      distribution.distributionSeries = series;
    }

    return distribution;
  }

  _gen_meter(form, data, onClick) {
    const { type, units, size, col_unit,
      legend: {position: legendPosition, direction: legendDirection = 'row'}, series_col} = form;
    const meter = {
      size,
      type,
      units,
      legendPosition,
      legendDirection
    };

    const series = [];

    if (series_col) {
      data.rows.forEach((row, index) => {
        const value = row[series_col] / 1.0;
        const legend = {
          label: col_unit ? '' + row[col_unit] : '',
          value
        };

        setOnClick(legend, value, onClick, row, data.header, series_col, col_unit);
        series.push(legend);
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

    assignObjectProp(form, meter, 'threshold');
    assignObjectProp(form, meter, 'thresholds');
    assignObjectProp(form, meter, 'stacked');
    assignObjectProp(form, meter, 'vertical');
    assignObjectProp(form, meter, 'important');
    assignObjectProp(form, meter, 'max');
    assignObjectProp(form, meter, 'min');

    return meter;
  }

  _gen_legend(form, data, onClick) {
    const {series_col, col_unit, units, total, label = ''} = form;
    const legend = {
      col_unit,
      units,
      total
    };

    const series = [];

    if (series_col) {
      data.rows.forEach((row, index) => {
        const value = row[series_col] / 1.0;
        const legend = {
          label: row[label] || label,
          value
        };

        setOnClick(legend, value, onClick, row, data.header, series_col, label);
        series.push(legend);
      });
    }

    legend.series = series;
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
      }
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
