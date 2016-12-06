/**
 * Created by huling on 11/10/2016.
 */
import React, {Component, PropTypes} from 'react';
import {Box, Header, FormField, Form, CheckBox, SVGIcon, Layer, Paragraph,
  Title, Button, Footer, NumberInput, List, ListItem, Label} from 'grommet';
import {init_style, getPreviewStyle, updateValue} from '../../util/pdfDesigner';
import AlertForm from '../commons/AlertForm';

const Brush = (props) => (
  <SVGIcon viewBox="0 0 24 24" {...props}>
    <path fill="none" stroke="#000000" strokeWidth="2" d="M13,9 L20.5,2 C20.5,2 21.125,2.125 21.5,2.5 C21.875,2.875 22,3.5 22,3.5 L15,11 L13,9 Z M14,14 L10,10 M1.70033383,20.1053387 C1.70033383,20.1053387 3.79489719,20.0776099 5.25566729,20.060253 C6.71643739,20.0428962 8.23797002,20.0142636 10.2253759,19.9972314 C12.2127817,19.9801992 14.4826673,16.0267479 11.414668,13.0099775 C8.34666868,9.99320721 6.34639355,12.0876248 5.34441315,13.062 C2.38723495,15.9377059 1.70033383,20.1053387 1.70033383,20.1053387 Z"/>
  </SVGIcon>
);

const NumberInputField = ({state, label, name, updateValue, min, max, step = 1, compact = false}) => {
  //https://gist.github.com/Candy374/80bf411ff286f6785eb80a9098f01c39
  return (
    <FormField label={
          <Box justify='between' direction='row'>
            {compact ? <span>{label}</span> : <Label margin='none'>{label}</Label>}
          </Box>}>
      <NumberInput className='number-input-label' name={name} type="range" min={min} max={max} step={step} value={state[name]} onChange={updateValue}/>
      <input name={name} type="range" min={min} max={max} step={step} value={state[name]} onChange={updateValue}/>
    </FormField>
  );
};

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

MarginDesigner.propTypes = {
  updateValue: PropTypes.func
};


let idIndex = 0;
class StyleDesigner extends Component {
  componentWillMount() {
    const styleArray = [];
    Object.keys(this.props.styles).map(name => {
      const styleObj = this.props.styles[name];
      if (styleObj.tempId == undefined) {
        styleObj.tempId = idIndex++;
      }
      styleArray.push(Object.assign({}, init_style, styleObj, {name}));
    });

    this.state = {
      styles: styleArray
    };
    this.updateValue = this.updateValue.bind(this);
    this.initStyle = this.initStyle.bind(this);
    this.initStyle();
    this.styles = _.cloneDeep(styleArray);
  }

  componentWillUnmount() {
    const styles = {};
    this.styles.map(style => {
      const key = style.name;
      delete style.name;
      delete style.tempId;
      styles[key] = style;
    });
    this.props.onConfirm(styles);
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

  renderSidebar(styles = this.state.styles) {
    return (
      <Box className='style-designer-sidebar'>
        <List >
          {styles.map((style, index) => {
            const onClick = () => {
              // add default styles
              const newObj = Object.assign({}, init_style, style);
              this.setState({
                styleObj: Object.assign(style, newObj, {name: style.name})
              });
            };

            const classNames = [];
            if (style.tempId == this.state.styleObj.tempId) {
              classNames.push('active');
            }

            if (this.isChanged(style)) {
              classNames.push('editing');
            }

            return (
              <ListItem onClick={onClick} key={index} className={classNames.join(' ')}>
                <label style={getPreviewStyle(style, true)}>{style.name}</label>
              </ListItem>
            );
          })}
        </List>
      </Box>
    );
  }

  isChanged(styleObj) {
    const origin = this.styles.filter(style => style.tempId == styleObj.tempId)[0];
    return !_.isEqual(origin, styleObj);
  }

  _onSave(styleObj) {
    const styles = this.styles;
    let isNew = true;
    for (let i = 0; i < styles.length; i++) {
      if (styles[i].tempId == styleObj.tempId) {
        styles[i] = Object.assign(styles[i], styleObj);
        isNew = false;
        break;
      }
    }

    if (isNew) {
      styleObj.tempId = idIndex++;
      this.styles.push(_.cloneDeep(styleObj));
      this.state.styles.push(_.cloneDeep(styleObj));
    }

    this.setState({
      styles: this.state.styles
    });
  }

  _onDelete(styleObj) {
    if (styleObj.tempId < 0) {
      this.setState({alert: 'CAN_NOT_DELETE'});
    } else {
      const styles = this.state.styles.filter(style => style.tempId != styleObj.tempId);
      this.styles = this.styles.filter(style => style.tempId != styleObj.tempId);
      this.initStyle();
      this.setState({
        styles
      });
    }
  }

  renderNumberInput(props) {
    return <NumberInputField state={this.state.styleObj} {...props} updateValue={this.updateValue}/>;
  }

  renderAlert() {
    if (this.state.alert == 'CAN_NOT_DELETE') {
      const onClose = () => this.setState({alert: ''});
      return (
        <AlertForm onClose={onClose}
                 title='Can not delete'
                 desc='Build in styles can not be deleted'
                 onConfirm={onClose}/>
      );
    }
  }

  render() {
    const { styleObj }= this.state;
    return (
      <Box flex={true}>
        <Header direction='row' justify='between'>
          <Title>Style Designer</Title>
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
              {this.renderNumberInput({label: 'Font Size', name: 'fontSize', min: 10, max: 64})}
            </Form>

            <Footer justify='between' pad='medium' flex={false}>
              <Box direction='row'>
                <Button label="New" onClick={this.initStyle}/>
                <Box pad={{horizontal: 'small'}}/>
                <Button label="Delete" onClick={this._onDelete.bind(this, styleObj)} accent={true}/>
              </Box>
              <Button label="Save" primary={true} onClick={(styleObj.name && this.isChanged(styleObj)) ? () => this._onSave(styleObj) : null}/>
            </Footer>
          </Box>
        </Box>
        {this.renderAlert()}
      </Box>
    );
  }
}

StyleDesigner.defaultProps = {
  styles: {}
};

StyleDesigner.propTypes = {
  styles: PropTypes.object,
  onConfirm: PropTypes.func
};

const getRecordNumber = ({recordsStart, limit, total}) => {
  if (recordsStart + limit > total) {
    return total - recordsStart;
  } else {
    return limit;
  }
};

class ExportComponent extends Component {
  componentWillMount() {
    this.state = {
      recordsStart: this.props.recordsStart,
      limit: this.props.limit,
      total: this.props.total
    };
    this._updateValue = this._updateValue.bind(this);
  }

  _updateValue(event) {
    updateValue(event, {val: event.target.value, name: event.target.name, state: this.state, callback: ()=> this.setState(this.state) });
  }

  render() {
    const {onClick, onClose, records} = this.props;
    const {recordsStart, limit, total} = this.state;

    return (
      <Layer closer={true} onClose={onClose}>
        <Box flex={true} size='large'>
          <Header><Title>Export records settings</Title></Header>

          <Form className='no-border strong-label'>
            {records.limit && <NumberInputField state={this.state} updateValue={(event)=> this._updateValue(event)}
                              label={records.limit.title}
                              name='limit' min={100} max={1000} step={100}/>}
            {records.start && <NumberInputField state={this.state} updateValue={(event)=> this._updateValue(event)}
                              label='From which record do you want to export?'
                              name='recordsStart' min={1} max={total}/>}
          </Form>
          {records.showDescriptions &&
          <Box pad={{horizontal: 'medium'}}>
            <Paragraph size='small'>{'You have '}<strong>{total}</strong>{' records in total.'}</Paragraph>
            <Paragraph
              size='small'>{`You will export records `}<strong>{`${recordsStart} ~ ${getRecordNumber(this.state) + recordsStart}`}</strong></Paragraph>
          </Box>}
          <Footer justify='end' pad={{vertical: 'medium'}}>
            <Button label={records.getExportLabel(this.state)} primary={true}
                    onClick={() => onClick({recordsStart: recordsStart - 1, limit})}/>
          </Footer>
        </Box>
      </Layer>
    );
  }
}

ExportComponent.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

const ExportLayer = (props) => {
  const records = {
    limit: {
      title: 'How many records do you want to export?'
    },
    start: { },
    getExportLabel: (state) =>`Export ${getRecordNumber(state) + 1} records`,
    showDescriptions: true
  };

  return (
    <ExportComponent {...props} records={records} onClick={({recordsStart, limit}) => props.onConfirm({recordsStart, limit})}/>
  );
};

const ExportLayerForDetail = (props) => {
  const records = {
    limit: {
      title: 'Records you want to export for each link:'
    },
    getExportLabel: (state) => 'Export'
  };

  return <ExportComponent {...props} records={records} onClick={({limit}) => props.onConfirm({recordsStart: 0, limit})}/>;
};


export {Brush, MarginDesigner, StyleDesigner, NumberInputField, ExportLayer, ExportLayerForDetail};

