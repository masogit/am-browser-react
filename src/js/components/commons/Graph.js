/**
 * Created by huling on 5/22/2016.
 */
import React, {Component, PropTypes} from 'react';
import { Legend, Distribution, Table, TableRow} from 'grommet';
import Legend_Meter from './Legend_Meter';
import LegendChart from './Legend_Chart';

//import {LegendChart} from '@hpe/chang-e-ui';
//import LegendChart from './Legend_Chart';

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
    const {xAxis: {placement: xAxisPlacement}, legend: {position: legendPosition}, units, type, smooth, size, points} = form;
    const chart = {
      points,
      size,
      smooth,
      type,
      xAxisPlacement
    };

    const xAxisLabels = [];

    if (form.series_col.length > 0 || (form.series && form.series.length > 0)) {
      // gen series
      //const series = form.series_col.map(index => []);
      const series = [];
      const legendSeries = [];

      data.rows.map((row, i) => {
        const value = row[form.series_col] / 1.0;

        const xAxisLabel = form.xAxis_col ? row[form.xAxis_col] : i;
        series.push(value);

        const legend = {
          value,
          label: xAxisLabel,
          colorIndex: 'graph-' + (i % 8 + 1)
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

        legendSeries.push(legend);

        // gen xAxis
        if (xAxisPlacement) {
          xAxisLabels.push({label: xAxisLabel, displayValue: value, index: i});
        }
      });

      chart.chartsValues = [series];
      if (legendPosition) {
        chart.legendPosition = legendPosition;
        chart.legendSeries = legendSeries;
        chart.showLegendTotal = true;
        chart.units = units;
      }

      chart.xAxisLabels = xAxisLabels;

    }
    assignObjectProp(form, chart, 'max');
    assignObjectProp(form, chart, 'min:');
    assignObjectProp(form, chart, 'legendPosition');
    assignObjectProp(form, chart, 'threshold');
    assignObjectProp(form, chart, 'important');
    return chart;
    //const chart = {
    //  important: form.important || 0,
    //  threshold: form.threshold || 0,
    //  type: form.type || 'bar',
    //  size: form.size || 'medium',
    //  points: form.points || false,
    //  segmented: form.segmented || false,
    //  smooth: form.smooth || false,
    //  sparkline: form.sparkline || false,
    //  units: form.units || '',
    //  xAxis_col: form.xAxis_col || '',
    //  series_col: form.series_col || [],
    //  series: []
    //};
    //
    //if (form.series_col.length > 0 || (form.series && form.series.length > 0)) {
    //  if (form.xAxis) {
    //    form.xAxis.data = [];
    //  }
    //
    //  // gen series
    //  const series = form.series_col.map(index => ({
    //    label: '' + data.header[index].Name,
    //    values: [],
    //    index
    //  }));
    //
    //  data.rows.map((row, i) => {
    //    series.forEach(item => {
    //      const value = row[item.index] / 1.0;
    //      if (!isNaN(value)) {
    //        let seriesItem = [i, value];
    //        if (form.type === 'bar') {
    //          let val = row[form.xAxis_col];
    //          let filter = this._getFullCol(row, data.header);
    //          let mainFilterKey = form.label || form.xAxis_col;
    //          let mainFilterValue = form.label ? label : val;
    //          if (mainFilterKey)
    //            seriesItem.onClick = onClick && onClick.bind(this, {
    //              key: data.header[mainFilterKey].Name,
    //              value: mainFilterValue
    //            }, filter);
    //        }
    //        item.values.push(seriesItem);
    //      }
    //    });
    //
    //    // gen xAxis
    //    if (form.xAxis) {
    //      const xAxisLabel = form.xAxis_col ? row[form.xAxis_col] : i;
    //      form.xAxis.data.push({ "label": '' + xAxisLabel, "value": i });
    //    }
    //  });
    //  chart.series = series.length > 0 ? series : form.series;
    //
    //  assignObjectProp(form, chart, 'max');
    //  assignObjectProp(form, chart, 'min');
    //
    //  // gen legend
    //  if (form.legend && form.legend.position) {
    //    chart.legend = {
    //      position: form.legend.position,
    //      total: form.legend.total
    //    };
    //  }
    //
    //  if (form.xAxis && form.xAxis.placement) {
    //    chart.xAxis = form.xAxis;
    //  }
    //}
    //
    //chart.showLegendTotal = true;
    //chart.xAxisPlacement="bottom";
    //chart.legendPosition="overlay";
    //chart.legendSeries=[];
    //chart.values = [16, 11, 30, 51, 38];
    //
    //chart.xAxisLabels = [{label: "Computer Hardware", index: 0}, {label: "Computer Servers", index: 1},
    //  {label: "Desktop computers", index: 2}, {label: "Smart Phone", index: 3}, {label: "Virtual Machine", index: 4}];
    //
    //return chart;
  }

  _getFullCol(row, header) {
    return row.map((value, index) => ({
      key: header[index].Name,
      value
    }));
  }

  _gen_distribution(form, data, onClick) {
    const distribution = {
      size: form.size,
      units: form.units,
      legendTotal: form.legendTotal,
      series_col: form.series_col,
      full: false,
      series: []
    };

    if (form.series_col) {
      data.rows.map((row, index) => {
        const value = row[form.series_col] / 1.0;
        if (!isNaN(value)) {
          const label = form.label ? '' + row[form.label] : '';
          const filter = this._getFullCol(row, data.header);
          const mainFilterKey = form.label || form.series_col;
          const mainFilterValue = form.label ? label : value;
          distribution.series.push({
            colorIndex: 'graph-' + (index % 8 + 1),
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

      distribution.legend = !!(form.units || form.legendTotal);
    }

    return distribution;
  }

  _gen_meter(form, data, onClick) {
    return {form, data, onClick};
    //const meter = {
    //  //important: form.important || 0,
    //  //threshold: form.threshold || 0,
    //  //type: form.type,
    //  //series_col: form.series_col,
    //  //series: [],
    //  //col_unit: form.col_unit,
    //  //size: form.size,
    //  //vertical: form.vertical,
    //  //stacked: form.stacked,
    //  //units: form.units
    //  active: true,
    //  activeIndex: form.activeIndex,
    //  label: form.label,
    //  max: form.max,
    //  min: form.min,
    //  onActive: form.onActive,
    //  series: [],
    //  size: form.size,
    //  stacked: form.stacked,
    //  tabIndex: form.tabIndex,
    //  threshold: form.threshold,
    //  thresholds: form.thresholds,
    //  type: form.type,
    //  value: form.value,
    //  vertical: form.vertical,
    //  responsive: form.responsive
    //};
    //
    //if (form.series_col) {
    //  data.rows.filter((row, index) => {
    //    const value = row[form.series_col] / 1.0;
    //    if (!isNaN(value)) {
    //      const label = form.col_unit ? '' + row[form.col_unit] : '';
    //      const filter = this._getFullCol(row, data.header);
    //      const mainFilterKey = form.col_unit || form.series_col;
    //      const mainFilterValue = form.col_unit ? label : value;
    //      meter.series.push({
    //        colorIndex: 'graph-' + (index % 8 + 1),
    //        label,
    //        value,
    //        onClick: onClick && onClick.bind(this, {
    //          key: data.header[mainFilterKey].Name,
    //          value: mainFilterValue
    //        }, filter)
    //      });
    //    }
    //  });
    //
    //  // gen legend
    //  if (form.legend && form.legend.position) {
    //    meter.legend = {
    //      position: form.legend.position,
    //      total: form.legend.total
    //    };
    //  }
    //}
    //
    //return meter;
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
            colorIndex: 'graph-' + (index % 8 + 1),
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

    let classes = ['hiddenScroll candy'];
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
          return <Legend_Meter {...graph} className={classes}/>;
        case 'distribution':
          return <Distribution {...graph} className={classes}/>;
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
