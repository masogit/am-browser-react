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
    const {desc, title, status, onClose, onConfirm, full, onCancel} = this.props;
    return (
      <Box flex={false}>
        {status ?
          <Notification status={status} message={desc} onClose={onClose} closer={true}/>
        :
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
                <Footer justify='between'>
                  {onConfirm &&
                    <Button label="Confirm" primary={true} strong={true} onClick={this._onClick.bind(this)}/>
                  }
                  {onCancel &&
                  <Button label="Cancel" strong={true} onClick={onCancel}/>
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
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  desc: PropTypes.string,
  full: PropTypes.oneOf([true, 'horizontal', 'vertical', false]),
  align: PropTypes.oneOf(['center', 'top', 'bottom', 'left', 'right'])
};

