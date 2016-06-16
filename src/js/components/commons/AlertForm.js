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
    const {desc, title, status, onClose, onConfirm, full} = this.props;
    const messages = desc.length > 60 ? desc.substring(0, 60) + '...' : desc;
    return (
      <Box flex={false}>
        {
          this.props.status &&
          <Notification status={status} message={messages} pad={{vertical: 'small'}}
                        onClick={onClose}/>
        }
        {
          !this.props.status &&
          <Layer onClose={onClose} closer={true} {...this.props}>
            <Box full={full} justify="center">
              <Form pad={{vertical: 'large'}}>
                <Header>
                  <h2>
                    {title}
                  </h2>
                </Header>
                <p>
                  {desc}
                </p>
                <Footer>
                  {
                    onConfirm &&
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

