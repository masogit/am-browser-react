import GraphForm, { assignObjectProp } from './FormGenerator';

export default class ChartForm extends GraphForm {

  constructor() {
    super();
    this.init = {
      series_col: '',
      type: 'bar', //bar|arc|circle|spiral
      size: 'medium', //small|medium|large
      legend: {
        position: '', //right|bottom|inline
        units: '',
        total: false
      },
      important: 0,
      threshold: 0,
      max: 0,
      min: 0,
      vertical: false,
      stacked: false,
      value: 0
    };

    this.state = {
      type: 'meter',
      meter: Object.assign({}, this.init)
    };
  }

  _genGraph(form) {
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
      meter.series = this.props.data.rows.map((row, i) => ({
        label: '' + i,
        value: row[form.series_col] / 1.0,
        index: i
      }));

      assignObjectProp(form, meter, 'max');
      assignObjectProp(form, meter, 'min');
      assignObjectProp(form, meter, 'value');

      // gen legend
      if (form.legend.position) {
        meter.legend = {
          position: form.legend.position,
          total: form.legend.total
        };
      }
    }

    return meter;
  }

  render() {
    const col_options = [{value: '', text: ''}];
    if (this.props.data.header) {
      this.props.data.header.map((header, index) => {
        if (['Long', 'Short', 'Int', 'Double', 'Byte'].includes(header.Type)) {
          col_options.push({value: header.Index, text: `${header.Type}: ${header.Name}`});
        }
      });
    }

    if (this.props.meter) {
      this.state.meter.series_col = this.props.meter.series_col;
    }

    const selections = {
      series_col: col_options,
      type: [
        {value: 'bar', text: 'bar'},
        {value: 'arc', text: 'arc'},
        {value: 'circle', text: 'circle'},
        {value: 'spiral', text: 'spiral'}
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
      ]
    };


    const basicOptions = [{
      label: 'Column',
      name: 'series_col',
      type: 'SelectField'
    }, {
      name: 'type',
      type: 'SelectField'
    }, {
      name: 'size',
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
    }/*, {
      name: 'value',
      type: 'NumberField'
    }*/, {
      name: 'threshold',
      type: 'NumberField'
    }, {
      name: 'max',
      type: 'NumberField'
    }, {
      name: 'min',
      type: 'NumberField'
    }, {
      name: 'stacked',
      type: 'SwitchField'
    }, {
      name: 'vertical',
      type: 'SwitchField'
    }];

    return super.render(basicOptions, advanceOptions, selections);
  }
}

