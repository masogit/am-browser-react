import React, {Component} from 'react';
import {
  CheckBox, Form, FormField, NumberInput, Box, RadioButton
} from 'grommet';
import _ from 'lodash';
import objectPath from 'object-path';

const SelectField = ({label, name, value, onChange, options}) => {
  const optionsComp = options.map((option, index)=>
    <option key={index} value={option.value}>{option.text}</option>);
  return (
    <FormField label={label} key={name}>
      <select name={name} value={value} onChange={onChange}>
        {optionsComp}
      </select>
    </FormField>
  );
};

const InputField = ({label, name, value, onChange}) => (
  <FormField label={label} key={name}>
    <input type="text" name={name} value={value || ''} onChange={onChange}/>
  </FormField>
);

const SwitchField = ({label, checked, name, onChange}) => (
  <FormField key={name} label={label}>
    <CheckBox checked={checked} toggle={true} id={name} name={name} onChange={onChange}/>
  </FormField>
);

const MultiCheckField = ({label, options}) => {
  const optionsComp = options.map(option=> (
    <CheckBox key={option.id} id={option.id} name={option.name}
              label={option.label} checked={option.checked} onChange={option.onChange}/>
  ));
  return (
    <FormField label={label} className='multi-check'>
      {optionsComp}
    </FormField>
  );
};

const SingleCheckField = ({label, options}) => {
  const optionsComp = options.map(option=> (
    <RadioButton key={option.id} id={option.id} name={option.name}
              label={option.label} checked={option.checked} onChange={option.onChange}/>
  ));
  return (
    <FormField label={label} className='multi-check'>
      {optionsComp}
    </FormField>
  );
};

const NumberField = ({label, name, value, onChange}) => (
  <FormField label={label} key={name}>
    {/*<input type='range' name={name} value={value} onChange={onChange}/>*/}
    <NumberInput name={name} value={value / 1.0} onChange={onChange}/>
  </FormField>
);

// each object in optionsArray has label, name, type, options, value
// name and type is required,  label, options, value is optional
// -- options
// only needed for SelectField
// if selections name is same as options, options can be ignored
// if name has '.', use '_' in the selections
// -- label
// if ignored it will be capitalized name
// -- value
// if ignored it will be this.state.distribute.name
const genOptions = (optionsArray, form, fromType, selections) => {
  return optionsArray.map(({label, name, value, options, type}, index) => {
    if (_.includes(name, '.')) {
      const [name1, name2] = name.split('.');
      label = label || (name1.charAt(0).toUpperCase() + name1.slice(1) + ' ' + name2);
      value = value || (form.state[fromType][name1] && form.state[fromType][name1][name2]);
      options = options || selections[`${name1}_${name2}`];
    } else {
      value = value || form.state[fromType][name];
      options = options || selections[name];
      label = label || (name.charAt(0).toUpperCase() + name.slice(1));
    }

    if (type === 'SelectField') {
      return (
        <SelectField key={index} label={label} name={name} value={value} options={options}
                     onChange={form._setFormValues.bind(form)}/>
      );
    } else if (type === 'InputField') {
      return (
        <InputField key={name} label={label} name={name} value={value} onChange={form._setFormValues.bind(form)}/>
      );
    } else if (type === 'SwitchField') {
      return (
        <SwitchField key={name} label={label} name={name} checked={value} onChange={form._setFormValues.bind(form)}/>
      );
    } else if (type === 'NumberField') {
      return (
        <NumberField key={name} label={label} name={name} value={value} onChange={form._setFormValues.bind(form)}/>
      );
    } else if (type === 'MultiCheckField') {
      return <MultiCheckField key={name} label={label} options={options}/>;
    } else if (type == 'SingleCheckField') {
      return <SingleCheckField key={name} label={label} options={options} onChange={form._setFormValues.bind(form)}/>;
    }
  });
};

export default class GraphForm extends Component {
  componentWillMount() {
    const type = this.state.type;

    let form;
    if (this.props[type]) {
      form = Object.assign({}, this.state[type], this.props[type]);
    } else {
      this._init();
      form = this.state[type];
    }
    const newState = this.initState();
    newState[type] = form;
    //if (type === 'chart' ? form.series_col.length > 0 : form.series_col) {
    //  this.setState(newState, this.props.genGraph(form, this.state.type));
    //}
    this.setState(newState, () => {
      if (type === 'chart' ? form.series_col.length > 0 : form.series_col) {
        this.props.genGraph(form, this.state.type);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps[this.state.type]) {
      this._init();
    }
  }

  initState(state = {}) {
    state.showBasic = this.state.showBasic == undefined ? true : this.state.showBasic;
    state.showAdvance = this.state.showAdvance == undefined ? false : this.state.showAdvance;
    return state;
  }

  _setFormValues(event) {
    let val;
    const type = this.state.type;
    const path = event.target.name;
    const obj = this.state[type];
    const newState = this.initState();

    if (event.target.type === 'checkbox' || event.target.type === 'radio') {
      val = event.target.checked;
    } else if (event.target.type === 'number') {
      val = event.target.value / 1;
    } else {
      val = event.target.value;
    }

    if (path === 'series_col') {
      if (type === 'chart') {
        if (event.target.checked === true) {
          obj.series_col.push(event.target.id);
        } else {
          obj.series_col = obj.series_col.filter((item) => item != event.target.id);
        }
      } else {
        if (event.target.checked === true) {
          obj.series_col = event.target.id;
        }
      }
      val = obj.series_col;
    }

    objectPath.set(obj, path, val);

    newState[type] = obj;
    this.setState(newState, this.props.genGraph(obj, type));
  }

  render(basicOptions, advanceOptions, selections) {
    const showBasic = this.state.showBasic;
    const showAdvance = this.state.showAdvance;
    const advance = genOptions(advanceOptions, this, this.state.type, selections);
    const basic = genOptions(basicOptions, this, this.state.type, selections);

    return (
      <Box separator='bottom' flex={true}>
        {showBasic && basic[0]}
        <Form className='vertical-form'>
          {showBasic && basic.slice(1)}
        </Form>
        <Form className='vertical-form'>
          {showAdvance && advance}
        </Form>
        <Box className='toggle' direction='row'>
          <CheckBox label='Basic' checked={this.state.showBasic} value={this.state.showBasic}
                    onChange={() => this.setState({showBasic: !showBasic})}/>
          {advance.length > 0 &&
            <CheckBox label='Advance' checked={this.state.showAdvance} value={this.state.showAdvance}
                      onChange={() => this.setState({showAdvance: !showAdvance})}/>
          }
        </Box>
      </Box>
    );
  }
}

