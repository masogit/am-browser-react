import GraphForm from './FormGenerator';

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

  render() {
    const col_options = [];
    const xAxis_col_options = [{value: '', text: ''}];
    if (this.props.data.header) {
      let series_col = this.state.chart.series_col;
      if (this.props.chart && this.props.chart.series) {
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
