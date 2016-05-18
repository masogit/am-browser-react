import GraphForm from './FormGenerator';

export default class ChartForm extends GraphForm {

  constructor() {
    super();
    this.init = {
      series_col: '',
      size: 'medium', //small|medium|large
      legendTotal: false,
      full: true,
      units: ''
    };

    this.state = {
      distribution: Object.assign({}, this.init),
      type: 'distribution'
    };
  }

  _genGraph(form) {
    const distribution = {
      size: form.size,
      units: form.units,
      legendTotal: form.legendTotal,
      series_col: form.series_col,
      full: false,
      series: []
    };

    if (form.series_col) {
      distribution.series = this.props.data.rows.map((row, i) => ( {
        label: '' + (form.label ? row[form.label] : i),
        value: row[form.series_col] / 1.0,
        index: i
      }));

      distribution.legend = !!(form.units || form.legendTotal);
    }

    return distribution;
  }

  render() {
    const col_options = [{value: '', text: ''}];
    const label_options = [{value: '', text: ''}];
    if (this.props.data.header) {
      this.props.data.header.map((header, index) => {
        label_options.push({value:header.Index, text:`${header.Type}: ${header.Name}`});

        if (['Long', 'Short', 'Int', 'Double', 'Byte'].includes(header.Type)) {
          col_options.push({value: header.Index, text: `${header.Type}: ${header.Name}`});
        }
      });
    }

    if (this.props.distribution) {
      this.state.distribution.series_col = this.props.distribution.series_col;
    }

    const selections = {
      series_col: col_options,
      label: label_options,
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
      name: 'label',
      type: 'SelectField'
    }, {
      name: 'size',
      type: 'SelectField'
    }, {
      label: 'Legend units',
      name: 'units',
      type: 'InputField'
    }, {
      label: 'Show legend total',
      name: 'legendTotal',
      type: 'SwitchField'
    }/*, {
      name: 'full',
      type: 'SwitchField'
    }*/];

    return super.render(basicOptions, [], selections);
  }
}

