import GraphForm, {assignObjectProp} from './FormGenerator';

export default class ChartForm extends GraphForm {

  constructor() {
    super();
    this.init = {
      series_col: new Set(),
      xAxis: {
        placement: '',
        data: [],
        label: ''
      },
      xAxis_col: '',
      type: 'bar',
      size: 'medium',
      legend: {
        position: '',
        units: '',
        total: false
      },
      important: 0,
      threshold: 0,
      max: 0,
      min: 0,
      points: false,
      segmented: false,
      sparkline: false
    };

    this.state = {
      type: 'chart',
      chart: Object.assign({}, this.init)
    };
  }

  _genGraph(form) {
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

    if (form.series_col.size > 0 || form.series.length > 0) {
      form.xAxis.data = [];

      // gen series
      const series = [...form.series_col].map(col => ({
        label: this.props.data.header[col].Name,
        values: [],
        index: col
      }));

      this.props.data.rows.map((row, i) => {
        // gen series
        series.forEach(item => {
          const value = row[item.index];
          item.values.push([i, value / 1.0]);
        });

        // gen xAxis
        const xAxisLabel = form.xAxis_col ? row[form.xAxis_col] : i;
        form.xAxis.data.push({"label": '' + xAxisLabel, "value": i});
      });
      chart.series = series;

      assignObjectProp(form, chart, 'max');
      assignObjectProp(form, chart, 'min');

      // gen legend
      if (form.legend.position) {
        chart.legend = {
          position: form.legend.position,
          total: form.legend.total
        };
      }

      if (form.xAxis.placement) {
        chart.xAxis = form.xAxis;
      }
    }

    return chart;
  }

  render() {
    const col_options = [];
    const xAxis_col_options = [];
    if (this.props.data.header) {
      let series_col = this.state.chart.series_col;
      if (this.props.chart) {
        series_col = new Set(this.props.chart.series.map((item) => item.index));
      }
      this.props.data.header.map((header, index) => {
        xAxis_col_options.push({value: header.Index, text: `${header.Type}: ${header.Name}`});
        if (['Long', 'Short', 'Int', 'Double', 'Byte'].includes(header.Type)) {
          col_options.push({
            id: header.Index,
            name: 'series_col',
            label: `${header.Type} : ${header.Name}`,
            checked: series_col.has(header.Index),
            onChange: this._setFormValues.bind(this)
          });
        }
      });
    }

    const selections = {
      series_col: col_options,
      type: [
        {value: 'bar', text: 'bar'},
        {value: 'area', text: 'area'},
        {value: 'line', text: 'line'}
      ],
      size: [
        {value: 'small', text: 'small'},
        {value: 'medium', text: 'medium'},
        {value: 'large', text: 'large'}
      ],
      legend_position: [
        {value: '', text: ''},
        {value: 'overlay', text: 'overlay'},
        {value: 'after', text: 'after'}
      ],
      xAxis_placement: [
        {value: '', text: ''},
        {value: 'top', text: 'top'},
        {value: 'bottom', text: 'bottom'}
      ]
    };

    if (this.state.chart.type === 'line') {
      selections.xAxis_placement.push({value: 'inline', text: 'inline'});
    }

    const basicOptions = [{
      label: 'Column',
      name: 'series_col',
      type: 'MultiCheckField'
    }, {
      name: 'type',
      type: 'SelectField'
    }, {
      name: 'size',
      type: 'SelectField'
    }, {
      label: 'X Axis placement',
      name: 'xAxis.placement',
      type: 'SelectField'
    }, {
      label: 'X Axis label',
      name: 'xAxis_col',
      options: xAxis_col_options,
      type: 'SelectField'
    }, {
      name: 'legend.position',
      type: 'SelectField'
    }, {
      label: 'Legend units',
      name: 'units',
      type: 'InputField'
    }, {
      label: 'Show legend total',
      name: 'legend.total',
      type: 'SwitchField'
    }];

    const advanceOptions = [{
      name: 'important',
      type: 'NumberField'
    }, {
      name: 'threshold',
      type: 'NumberField'
    }, {
      name: 'max',
      type: 'NumberField'
    }, {
      name: 'min',
      type: 'NumberField'
    }, {
      name: 'points',
      type: 'SwitchField'
    }, {
      name: 'segmented',
      type: 'SwitchField'
    }, {
      name: 'sparkline',
      type: 'SwitchField'
    }];

    if (this.state.chart.type === 'line' || this.state.chart.type === 'area') {
      advanceOptions.push({
        name: 'smooth',
        type: 'SwitchField'
      });
    }

    return super.render(basicOptions, advanceOptions, selections);
  }
}
