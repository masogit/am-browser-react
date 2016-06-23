/**
 * Created by huling on 5/22/2016.
 */
import React, {Component, PropTypes} from 'react';
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
  constructor() {
    super();
  }

  _gen_chart(form, data, onClick) {
    const chart = {
      important: form.important || 0,
      threshold: form.threshold || 0,
      type: form.type || 'bar',
      size: form.size || 'medium',
      points: form.points || false,
      segmented: form.segmented || false,
      smooth: form.smooth || false,
      sparkline: form.sparkline || false,
      units: form.units || '',
      xAxis_col: form.xAxis_col || '',
      series_col: form.series_col || [],
      series: []
    };

    if (form.series_col.length > 0 || (form.series && form.series.length > 0)) {
      if (form.xAxis) {
        form.xAxis.data = [];
      }

      // gen series
      const series = form.series_col.map(index => ({
        label: '' + data.header[index].Name,
        values: [],
        index
      }));

      data.rows.map((row, i) => {
        series.forEach(item => {
          const value = row[item.index] / 1.0;
          if (!isNaN(value)) {
            let seriesItem = [i, value];
            if (form.type === 'bar') {
              let val = row[form.xAxis_col];
              let filter = this._getFullCol(row, data.header);
              let mainFilterKey = form.label || form.xAxis_col;
              let mainFilterValue = form.label ? label : val;
              if (mainFilterKey)
                seriesItem.onClick = onClick && onClick.bind(this, {
                  key: data.header[mainFilterKey].Name,
                  value: mainFilterValue
                }, filter);
            }
            item.values.push(seriesItem);
          }
        });

        // gen xAxis
        if (form.xAxis) {
          const xAxisLabel = form.xAxis_col ? row[form.xAxis_col] : i;
          form.xAxis.data.push({ "label": '' + xAxisLabel, "value": i });
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
    const meter = {
      important: form.important || 0,
      threshold: form.threshold || 0,
      type: form.type,
      series_col: form.series_col,
      series: [],
      col_unit: form.col_unit,
      size: form.size,
      vertical: form.vertical,
      stacked: form.stacked,
      units: form.units
    };

    if (form.series_col) {
      data.rows.filter((row, index) => {
        const value = row[form.series_col] / 1.0;
        if (!isNaN(value)) {
          const label = form.col_unit ? '' + row[form.col_unit] : '';
          const filter = this._getFullCol(row, data.header);
          const mainFilterKey = form.col_unit || form.series_col;
          const mainFilterValue = form.col_unit ? label : value;
          meter.series.push({
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
    const {type, config, onClick, data} = this.props;

    if (data && data.rows.length > 0) {
      const graph = this['_gen_' + type](config, data, onClick);
      if (graph.series.length > 0) {
        switch (type) {
          case 'chart':
            return <Chart {...graph} />;
          case 'meter':
            return <Meter {...graph} />;
          case 'distribution':
            return <Distribution {...graph} />;
        }
      } else {
        return <div></div>;
      }
    } else
      return <div></div>;
  }
}

Graph.propTypes = {
  type: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  data: PropTypes.shape({
    header: PropTypes.array,
    rows: PropTypes.array
  }),
  onClick: PropTypes.func
};
