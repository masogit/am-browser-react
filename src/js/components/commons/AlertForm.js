import React, {Component} from 'react';
import {
  Box,
  Button,
  Layer,
  Form,
  Footer,
  Header
} from 'grommet';

export default class AQL extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
  }

  _onClick() {
    this.props.onConfirm();
    this.props.onClose();
  }

  render() {

    return (

      <Layer onClose={this.props.onClose} closer={true} align="right">
        <Box full="vertical" justify="center">
          <Form pad={{vertical: 'large'}}>
            <Header>
              <h2>
                {this.props.title}
              </h2>
            </Header>
            <p>
                {this.props.desc}
            </p>
            <Footer>
              {
                this.props.onConfirm &&
                <Button label="Confirm" primary={true} strong={true} onClick={this._onClick.bind(this)}/>
              }
            </Footer>
          </Form>
        </Box>
      </Layer>
    );
  }
}

