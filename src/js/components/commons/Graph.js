/**
 * Created by huling on 5/22/2016.
 */
import {queryAQL} from '../../actions/aql';
import React, {Component,PropTypes} from 'react';
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
    this.state = {
      data: null
    };
  }

  componentDidMount() {
    queryAQL(this.props.aqlStr, (data) => {
      if (data) {
        this.setState({data});
      }
    });
  }

  _gen_chart(form, data) {
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
          if (!value.isNaN) {
            item.values.push([i, value]);
          }
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

  _gen_distribution(form, data) {
    const distribution = {
      size: form.size,
      units: form.units,
      legendTotal: form.legendTotal,
      series_col: form.series_col,
      full: false,
      series: []
    };

    if (form.series_col) {
      distribution.series = data.rows.map((row, index) => {
        const value = row[form.series_col] / 1.0;
        if (!value.isNaN) {
          return {
            label: '' + (form.label ? row[form.label] : index),
            value,
            index
          };
        }
      });

      distribution.legend = !!(form.units || form.legendTotal);
    }

    return distribution;
  }

  _gen_meter(form, data) {
    const meter = {
      important: form.important,
      threshold: form.threshold,
      type: form.type,
      series_col: form.series_col,
      series: [],
      size: form.size,
      vertical: form.vertical,
      stacked: form.stacked,
      units: form.units
    };

    if (form.series_col) {
      meter.series = data.rows.map((row, index) => {
        const value = row[form.series_col] / 1.0;
        if (!value.isNaN) {
          return {
            label: '' + index,
            value,
            index
          };
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
    const {type, graphConfig} = this.props;

    if (this.state.data) {
      const graph = this['_gen_' + type](graphConfig, this.state.data);
      if (graph.series.length > 0) {
        switch (type) {
          case 'chart':
            return <Chart {...graph} />;
          case 'meter':
            return <Meter {...graph} />;
          case 'distribution':
            return <Distribution {...graph} />;
        }
      }
    }
    return <div></div>;
  }
}

Graph.propTypes = {
  type: PropTypes.string.isRequired,
  graphConfig: PropTypes.object.isRequired,
  aqlStr: PropTypes.string.isRequired
};
