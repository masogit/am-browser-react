import React, {Component} from 'react';
const Next = require('grommet/components/icons/base/Next');
const Previous = require('grommet/components/icons/base/Previous');
import {
  CheckBox,
  // Split,
  Form,
  FormFields,
  FormField,
  NumberInput,
  Box,
  Footer,
  Anchor
} from 'grommet';

const SelectField = ({label, name, value, onChange, options}) => {
  const optionsComp = options.map(option=>
    <option key={option.value} value={option.value}>{option.text}</option>);
  return (
    <FormField label={label} key={label}>
      <select name={name} value={value} onChange={onChange}>
        {optionsComp}
      </select>
    </FormField>
  );
};

const InputField = ({label, name, value, onChange}) => (
  <FormField label={label} key={name}>
    <input type="text" name={name} value={value} onChange={onChange}/>
  </FormField>
);

const SwitchField = ({label, checked, name, onChange}) => (
  <FormField key={name}>
    <CheckBox checked={checked} label={label} toggle={true} id={name} name={name} onChange={onChange}/>
  </FormField>
);

const MultiCheckField = ({label, options}) => {
  const optionsComp = options.map(option=> (
      <CheckBox key={option.id} id={option.id} name={option.name}
                label={option.label} checked={option.checked} onChange={option.onChange}/>
    ));
  return (
    <FormField label={label}>
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

const setValueByJsonPath = (path, val, obj) => {
  const fields = path.split('.');
  let result = obj;
  for (let i = 0, n = fields.length; i < n && result !== undefined; i++) {
    const field = fields[i];
    if (i === n - 1) {
      result[field] = val;
    } else {
      if (typeof result[field] === 'undefined' || !_.isObject(result[field])) {
        result[field] = {};
      }
      result = result[field];
    }
  }
};

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
  return optionsArray.map(({label, name, value, options, type}) => {
    if (name.includes('.')) {
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
        <SelectField key={name} label={label} name={name} value={value} options={options}
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
      return (
        <MultiCheckField key={name} label={label} options={options}/>
      );
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
    const newState = {};
    newState[type] = form;
    if (type === 'chart' ? form.series_col.length > 0 : form.series_col) {
      this.setState(newState, this.props.genGraph(form, this.state.type));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps[this.state.type]) {
      this._init();
    }
  }

  _setFormValues(event) {
    let val;
    const type = this.state.type;
    const path = event.target.name;
    const obj = this.state[type];
    const newState = {};

    if (event.target.type === 'checkbox') {
      val = event.target.checked;
    } else if (event.target.type === 'number') {
      val = event.target.value / 1;
    } else {
      val = event.target.value;
    }

    if (type === 'chart' && path === 'series_col') {
      if (event.target.checked === true) {
        obj.series_col.push(event.target.id);
      } else {
        obj.series_col = obj.series_col.filter((item) => item != event.target.id);
      }
      val = obj.series_col;
    }

    setValueByJsonPath(path, val, obj);

    newState[type] = obj;
    this.setState(newState, this.props.genGraph(obj, type));
  }

  render(basicOptions, advanceOptions, selections) {
    const showAdvance = this.state.showAdvance;
    let label, icon, formFields;
    const advance = genOptions(advanceOptions, this, this.state.type, selections);
    const basic = genOptions(basicOptions, this, this.state.type, selections);
    formFields = basic;
    if (!showAdvance) {
      label = 'advance';
      icon = <Next />;
      formFields = basic;
    } else {
      label = 'basic';
      icon = <Previous />;
      formFields = advance;
    }

    return (
      <Box>
        <Form className='short-form'>
          <FormFields>
            {formFields}
          </FormFields>
        </Form>
        {advance.length > 0 &&
        <Footer justify="end">
          <Anchor icon={icon} label={label} reverse={!showAdvance}
                  onClick={() => form.setState({showAdvance: !showAdvance})}/>
        </Footer>
        }
      </Box>
    );
  }
}
