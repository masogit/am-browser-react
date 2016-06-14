import React, {Component, PropTypes} from 'react';
import {
  Box,
  Button,
  Layer,
  Form,
  Footer,
  Header,
  Notification
} from 'grommet';

export default class AlertForm extends Component {

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
      <Box>
        {
          this.props.status &&
          <Notification status={this.props.status} message={this.props.desc} pad={{vertical: 'small'}}
                        onClick={this.props.onClose} />
        }
        {
          !this.props.status &&
          <Layer onClose={this.props.onClose} closer={true} {...this.props}>
            <Box full={this.props.full} justify="center">
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
        }
      </Box>
    );
  }
}

AlertForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  desc: PropTypes.string,
  full: PropTypes.oneOf([true, 'horizontal', 'vertical', false]),
  align: PropTypes.oneOf(['center', 'top', 'bottom', 'left', 'right'])
};

