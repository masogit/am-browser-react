import GraphForm from './FormGenerator';

export default class DistributionForm extends GraphForm {

  constructor() {
    super();
    this._init();
  }

  _init() {
    this.state = {
      distribution: {
        series_col: '',
        series: [],
        size: 'medium', //small|medium|large
        legendTotal: false,
        full: true,
        units: ''
      },
      type: 'distribution'
    };
  }

  render() {
    const col_options = [];
    const label_options = [{value: '', text: ''}];
    if (this.props.data.header) {
      this.props.data.header.map((header, index) => {
        //label_options.push({value:header.Index, text:`${header.Type}: ${header.Name}`});
        label_options.push({value:header.Index, text: header.Name});

        if (_.includes(['Long', 'Short', 'Int', 'Double', 'Byte'], header.Type)) {
          //col_options.push({value: header.Index, text: `${header.Type}: ${header.Name}`});
          col_options.push({
            id: header.Index,
            name: 'series_col',
            //label: `${header.Type} : ${header.Name}`,
            label: header.Name,
            checked: this.state.distribution.series_col == header.Index,
            onChange: this._setFormValues.bind(this)
          });
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
      type: 'SingleCheckField'
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

