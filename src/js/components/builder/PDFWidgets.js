/**
 * Created by huling on 11/10/2016.
 */
import React, {Component} from 'react';
import {Box, Header, Anchor, FormField, Form, CheckBox, SVGIcon, Icons,
  Title, Button, Footer, NumberInput, List, ListItem, Label} from 'grommet';
const {Add} = Icons.Base;
import {init_style, getPreviewStyle} from '../../util/pdfGenerator';

const Brush = (props) => (
  <SVGIcon viewBox="0 0 24 24" {...props}>
    <path fill="none" stroke="#000000" strokeWidth="2" d="M13,9 L20.5,2 C20.5,2 21.125,2.125 21.5,2.5 C21.875,2.875 22,3.5 22,3.5 L15,11 L13,9 Z M14,14 L10,10 M1.70033383,20.1053387 C1.70033383,20.1053387 3.79489719,20.0776099 5.25566729,20.060253 C6.71643739,20.0428962 8.23797002,20.0142636 10.2253759,19.9972314 C12.2127817,19.9801992 14.4826673,16.0267479 11.414668,13.0099775 C8.34666868,9.99320721 6.34639355,12.0876248 5.34441315,13.062 C2.38723495,15.9377059 1.70033383,20.1053387 1.70033383,20.1053387 Z"/>
  </SVGIcon>
);

class MarginDesigner extends Component {
  componentWillMount() {
    this.updateValue = this.updateValue.bind(this);
  }

  updateValue(event) {
    const value = [parseInt(this.left.value), parseInt(this.top.value), parseInt(this.right.value), parseInt(this.bottom.value)];
    this.props.updateValue(event, value, 'margin', 'text');
  }

  renderInput(refName, value) {
    return (<input type='number' ref={node=> this[refName] = node} min={0} max={64} value={value} onChange={this.updateValue}/>);
  }

  render() {
    const {styleObj} = this.props;
    const [left = 0, top = 0, right = 0, bottom = 0] = styleObj.margin || [];

    return (
      <Box className='margin-designer' pad={{horizontal: 'medium'}}>
        <Box className='grid' style={{height: 300}} align='center' justify='center'>
          <Box align='center' justify='center' >
            {this.renderInput('top', top)}
          </Box>
          <Box direction='row' justify='center' align='center'>
            {this.renderInput('left', left)}
            <Box style={{border: '1px dashed'}}>
              <input style={getPreviewStyle(styleObj)} value='AM Browser' readOnly={true}/>
            </Box>
            {this.renderInput('right', right)}
          </Box>
          <Box align='center' justify='center'>
            {this.renderInput('bottom', bottom)}
          </Box>
        </Box>
      </Box>
    );
  }
}

class StyleDesigner extends Component {
  componentWillMount() {
    this.state = {
      styles: this.props.styles
    };
    this.updateValue = this.updateValue.bind(this);
    this.initStyle = this.initStyle.bind(this);
    this.initStyle();
  }

  initStyle() {
    this.setState({styleObj: Object.assign({}, init_style)});
  }

  updateValue(event, val = event.target.value, name = event.target.name, type = event.target.type) {
    if (type == 'range' || type == 'number') {
      val = parseInt(val);
    } else if (type == 'checkbox') {
      val = event.target.checked;
    }

    if (name.indexOf('.') > -1) {
      const nameParts = name.split('.');
      nameParts.reduce((state, key, index) => {
        if (index == nameParts.length - 1) {
          state[key] = val;
        }
        return state[key];
      }, this.state.styleObj);
    } else {
      this.state.styleObj[name] = val;
    }

    this.setState(this.state);
  }

  renderNumberInput(label, name, min, max, step = 1) {
    let value = this.state.styleObj[name];

    //https://gist.github.com/Candy374/80bf411ff286f6785eb80a9098f01c39
    return (
      <FormField label={
          <Box justify='between' direction='row'>
            <Label margin='none'>{label}</Label>
          </Box>}>
        <NumberInput className='number-input-label' name={name} type="range" min={min} max={max} step={step} value={value} onChange={this.updateValue}/>
        <input name={name} type="range" min={min} max={max} step={step} value={value} onChange={this.updateValue}/>
      </FormField>
    );
  }

  renderSidebar(styles = this.state.styles) {
    return (
      <List>
        {Object.keys(styles).map((key, index) => {
          const onClick = () => {
            // add default styles
            const newObj = Object.assign({}, init_style, styles[key]);
            this.setState({
              styleObj: Object.assign(styles[key], newObj, {name: key})
            });
          };

          return (
            <ListItem onClick={onClick} key={index}>
              <label style={getPreviewStyle(styles[key], true)}>{key}</label>
            </ListItem>
          );
        })}
      </List>
    );
  }

  render() {
    const {onConfirm, onCancel} = this.props;
    const { styleObj }= this.state;
    return (
      <Box flex={true}>
        <Header direction='row' justify='between'>
          <Title>Style Designer</Title>
          <Box pad={{horizontal: 'medium'}}><Anchor icon={<Add />} onClick={this.initStyle} label="New Style"/></Box>
        </Header>
        <Box direction='row'>
          {this.renderSidebar()}
          <Box>
            <Form className='no-border strong-label style-designer'>
              <FormField>
                <MarginDesigner styleObj={styleObj} updateValue={this.updateValue}/>
              </FormField>
              <FormField>
                <Box direction='row' align='center' justify='between' pad='medium'>
                  <Box direction='row'><Label margin='none' style={{color: '#ff0000', fontWeight: '400'}}>Name:</Label>
                    <input className='input-field' name='name' type="text" value={styleObj.name} onChange={this.updateValue}
                           autoFocus={true} maxLength='20'/>
                  </Box>
                  <label><Label>Color:</Label><input type='color' name='color' value={styleObj.color} onChange={this.updateValue}/></label>
                  <CheckBox checked={styleObj.bold} name='bold' toggle={true}
                            value={styleObj.bold} label={<Label>Bold</Label>}
                            onChange={this.updateValue}/>
                  <CheckBox checked={styleObj.italics} name='italics' toggle={true}
                            value={styleObj.italics} label={<Label>Italics</Label>}
                            onChange={this.updateValue}/>
                </Box>
              </FormField>
              {this.renderNumberInput('Font Size', 'fontSize', 10, 64)}
            </Form>

            <Footer justify='end' pad='medium'>
              <Button label="Confirm" primary={true} strong={true} onClick={styleObj.name ? () => onConfirm(styleObj) : null}/>
              <Box pad={{horizontal: 'small'}}/>
              <Button label="Cancel" primary={true} strong={true} onClick={onCancel}/>
            </Footer>
          </Box>
        </Box>
      </Box>
    );
  }
}

export {Brush, MarginDesigner, StyleDesigner};
