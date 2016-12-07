import GraphForm from './FormGenerator';

export default class ChartForm extends GraphForm {

  constructor() {
    super();
    this._init();
  }

  _init() {
    this.state = {
      type: 'chart',
      chart: {
        series_col: [],
        series: [],
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
          units: ''
        },
        important: 0,
        threshold: 0,
        max: 100,
        min: 0,
        points: false
      }
    };
  }

  render() {
    const col_options = [];
    const xAxis_col_options = [{value: '', text: ''}];

    if (this.props.data.header) {
      let series_col = this.state.chart.series_col;
      if (this.props.chart) {
        series_col = this.props.chart.series_col;
        if (this.props.chart.series && this.props.chart.series.length > 0) {
          series_col = this.props.chart.series.map((item) => item.index);
        }
      }

      this.props.data.header.map((header, index) => {
        //xAxis_col_options.push({value: header.Index, text: `${header.Type}: ${header.Name}`});
        xAxis_col_options.push({value: header.Index, text: header.Name});
        if (_.includes(['Long', 'Short', 'Int', 'Double', 'Byte'], header.Type)) {
          col_options.push({
            id: header.Index,
            name: 'series_col',
            //label: `${header.Type} : ${header.Name}`,
            label: header.Name,
            checked: _.includes(series_col, header.Index),
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
        {value: 'xxsmall', text: 'xxsmall'},
        {value: 'xsmall', text: 'xsmall'},
        {value: 'small', text: 'small'},
        {value: 'medium', text: 'medium'},
        {value: 'large', text: 'large'},
        {value: 'sparkline', text: 'sparkline'}
      ],
      legend_position: [
        {value: '', text: ''},
        {value: 'right', text: 'right'},
        {value: 'left', text: 'left'},
        {value: 'top', text: 'top'},
        {value: 'bottom', text: 'bottom'}
      ],
      legend_direction: [
        {value: 'row', text: 'horizontal'},
        {value: 'column', text: 'vertical'}
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
      name: 'legend.direction',
      type: 'SelectField'
    }, {
      label: 'Legend units',
      name: 'units',
      type: 'InputField'
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
