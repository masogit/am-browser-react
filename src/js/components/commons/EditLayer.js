/**
 * Created by huling on 9/1/2016.
 */
import React, {PropTypes, Component} from 'react';
import {Box, FormField, Header, Title, Layer, Button, Footer} from 'grommet';

export default class EditLayer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value || "",
      label: this.props.label || "",
      name: this.props.name || ""
    };
  }

  _onChange(event) {
    const aqlQuery = event.target.value;
    this.setState({
      value: aqlQuery
    });
  }

  render() {
    return (
      <Layer closer={true} onClose={this.props.onClose}>
        <Box flex={true} size='large'>
          <Header><Title>Edit</Title></Header>
          <FormField label={this.state.label} htmlFor={this.state.name}>
                <textarea id={this.state.name} rows='5' name={this.state.name} value={this.state.value} onChange={this._onChange.bind(this)} ref="textArea"/>
          </FormField>
          <Footer justify='end' pad={{vertical: 'medium'}}>
            <Button label="Confirm" primary={true} onClick={() => (this.props.onConfirm(this.refs.textArea))}/>
          </Footer>
        </Box>
      </Layer>
    );
  }
}

EditLayer.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};
