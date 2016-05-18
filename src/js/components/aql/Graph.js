/**
 * Created by huling on 5/22/2016.
 */
import React, {Component} from 'react';
import {
  Chart,
  Meter,
  Distribution
} from 'grommet';

const assignObjectProp = (from, to, propName) => {
  if (from[propName]) {
    to[propName] = from[propName];
  }
};

export default class Graph extends Component {
  constructor () {
    super();
  }

  _genChart(form, data) {
    const chart = {
      important: form.important,
      threshold: form.threshold,
      type: form.type,
      size: form.size,
      points: form.points,
      segmented: form.segmented,
      smooth: form.smooth,
      sparkline: form.sparkline,
      units: form.units,
      xAxis_col: form.xAxis_col,
      series_col: form.series_col,
      series: []
    };

    if (form.series_col.size > 0 || (form.series && form.series.length > 0)) {
      if (form.xAxis) {
        form.xAxis.data = [];
      }

      // gen series
      const series = [...form.series_col].map(col => ({
        label: data.header[col].Name,
        values: [],
        index: col
      }));

      data.rows.map((row, i) => {
        series.forEach(item => {
          const value = row[item.index];
          item.values.push([i, value / 1.0]);
        });

        // gen xAxis
        if (form.xAxis) {
          const xAxisLabel = form.xAxis_col ? row[form.xAxis_col] : i;
          form.xAxis.data.push({"label": '' + xAxisLabel, "value": i});
        }
      });
      chart.series = series.length > 0 ? series : form.series;

      assignObjectProp(form, chart, 'max');
      assignObjectProp(form, chart, 'min');

      // gen legend
      if (form.legend && form.legend.position) {
        chart.legend = {
          position: form.legend.position,
          total: form.legend.total
        };
      }

      if (form.xAxis && form.xAxis.placement) {
        chart.xAxis = form.xAxis;
      }
    }

    return chart;
  }


  _genDistribution(form, data) {
    const distribution = {
      size: form.size,
      units: form.units,
      legendTotal: form.legendTotal,
      series_col: form.series_col,
      full: false,
      series: []
    };

    if (form.series_col) {
      distribution.series = data.rows.map((row, i) => ( {
        label: '' + (form.label ? row[form.label] : i),
        value: row[form.series_col] / 1.0,
        index: i
      }));

      distribution.legend = !!(form.units || form.legendTotal);
    }

    return distribution;
  }



  _genMeter(form, data) {
    const meter = {
      important: form.important,
      threshold: form.threshold,
      type: form.type,
      series_col: form.series_col,
      size: form.size,
      vertical: form.vertical,
      stacked: form.stacked,
      units: form.units
    };

    if (form.series_col) {
      meter.series = data.rows.map((row, i) => ({
        label: '' + i,
        value: row[form.series_col] / 1.0,
        index: i
      }));

      assignObjectProp(form, meter, 'max');
      assignObjectProp(form, meter, 'min');
      assignObjectProp(form, meter, 'value');

      // gen legend
      if (form.legend && form.legend.position) {
        meter.legend = {
          position: form.legend.position,
          total: form.legend.total
        };
      }
    }

    return meter;
  }

  render() {
    const {type, chart, meter, distribution, data} = this.props;
    if (type === 'chart') {
      return <Chart {...this._genChart(chart, data)} />;
    }

    if (type === 'meter') {
      return <Meter {...this._genMeter(meter, data)} />;
    }

    if (type === 'distribution') {
      return <Distribution {...this._genDistribution(distribution, data)} />;
    }
  }
}
