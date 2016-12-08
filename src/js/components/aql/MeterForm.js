import GraphForm from './FormGenerator';

export default class MeterForm extends GraphForm {

  constructor() {
    super();
    this._init();
  }

  _init() {
    this.state = {
      type: 'meter',
      meter: {
        series_col: '',
        series: [],
        type: 'bar', //bar|arc|circle|spiral
        size: 'medium', //small|medium|large
        legend: {
          position: '', //right|bottom|inline
          units: '',
          total: true
        },
        important: 0,
        threshold: 0,
        max: 100,
        min: 0,
        vertical: false,
        stacked: false,
        value: 0
      }
    };
  }

  render() {
    const col_options = [];
    const col_unit_options = [{value: '', text: ''}];
    if (this.props.data.header) {
      this.props.data.header.map((header, index) => {
        //const option = {value: header.Index, text: `${header.Type}: ${header.Name}`};
        const option = {value: header.Index, text: header.Name};
        if (_.includes(['Long', 'Short', 'Int', 'Double', 'Byte'], header.Type)) {
          col_options.push({
            id: header.Index,
            name: 'series_col',
            //label: `${header.Type} : ${header.Name}`,
            label: header.Name,
            checked: this.state.meter.series_col == header.Index,
            onChange: this._setFormValues.bind(this)
          });
        }
        col_unit_options.push(option);
      });
    }

    if (this.props.meter) {
      this.state.meter.series_col = this.props.meter.series_col;
    }

    const selections = {
      series_col: col_options,
      col_unit: col_unit_options,
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
      ]
    };


    const basicOptions = [{
      label: 'Column',
      name: 'series_col',
      type: 'SingleCheckField'
    }, {
      label: 'Column units',
      name: 'col_unit',
      type: 'SelectField'
    }, {
      name: 'type',
      type: 'SelectField'
    }, {
      name: 'size',
      type: 'SelectField'
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
    }];

    if (this.state.meter.type == 'bar' || this.state.meter.type == 'arc') {
      advanceOptions.push({
        name: 'vertical',
        type: 'SwitchField'
      });
    }

    return super.render(basicOptions, advanceOptions, selections);
  }
}

