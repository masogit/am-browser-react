import React, {Component} from 'react';
import {
  CheckBox,
  // Split,
  Form,
  FormFields,
  FormField,
  NumberInput,
  Tabs,
  Tab
} from 'grommet';

const FormContainer = ({basicOptions, advanceOptions, form, selections}) => (
  <Tabs initialIndex={0} justify="end" key={form.state.type}>
    <Tab title="Basic">
      <Form pad="none" compact={true}>
        <FormFields>
          {genOptions(basicOptions, form, form.state.type, selections)}
        </FormFields>
      </Form>
    </Tab>
    <Tab title="Advance">
      <Form pad="none" compact={true}>
        <FormFields>
          {genOptions(advanceOptions, form, form.state.type, selections)}
        </FormFields>
      </Form>
    </Tab>
  </Tabs>
);

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
  <FormField label={label} key={name}>
    <CheckBox checked={checked} id={name} name={name} toggle={true} onChange={onChange}/>
  </FormField>
);

const MultiCheckField = ({label, options}) => {
  const optionsComp = options.map(option=>
    (
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
    <NumberInput name={name} value={value} onChange={onChange}/>
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
        <InputField label={label} name={name} value={value} onChange={form._setFormValues.bind(form)}/>
      );
    } else if (type === 'SwitchField') {
      return (
        <SwitchField label={label} name={name} checked={value} onChange={form._setFormValues.bind(form)}/>
      );
    } else if (type === 'NumberField') {
      return (
        <NumberField label={label} name={name} value={value} onChange={form._setFormValues.bind(form)}/>
      );
    } else if (type === 'MultiCheckField') {
      return (
        <MultiCheckField label={label} options={options}/>
      );
    }
  });
};

export default class GraphForm extends Component {

  componentWillMount() {
    this._updateState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._updateState(nextProps);
  }

  _updateState(nextProps) {
    const type = this.state.type;
    if (nextProps[type]) {
      const newState = {};

      newState[type] = Object.assign({}, this.state[type], nextProps[type]);

      if (type === 'chart' && !nextProps[type].series_col) {
        newState[type].series_col = [];
      }

      //newState[type] = {...this.state[type], ...nextProps[type]};
      this.setState(newState);
    } else {
      this.state[type] = this.init;
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
    //const graph = this._genGraph(obj);
    newState[type] = obj;
    this.setState(newState, this.props.genGraph(obj, type));
  }

  render(basicOptions, advanceOptions, selections) {
    return (<FormContainer basicOptions={basicOptions} advanceOptions={advanceOptions}
                          form={this} selections={selections}/>);
  }
}
