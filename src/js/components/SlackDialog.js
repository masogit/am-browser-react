import React, {Component} from 'react';

import { Box, Button, Title, FormField, Form, Footer, Menu } from 'grommet';

export default class SlackDialog extends Component {
  constructor() {
    super();
    this.state = {
      message: ''
    };
  }

  onChange(event) {
    this.setState({
      message: event.target.value
    });
  }

  onClick() {
    this.props.onClick(this.state.message);
    this.props.onClose();
  }

  onKeyUp(event) {
    if (event.keyCode === 13 && !event.ctrlKey && this.state.message.trim()) {
      this.props.onClick(this.state.message);
      this.props.onClose();
    }
    return true;
  }

  render() {
    return (
      <Box pad="large">
        <Form>
          <Title>Send message to slack</Title>
          <fieldset>
            <FormField label="Messages">
              <textarea value={this.state.message} onChange={this.onChange.bind(this)}
                        onKeyUp={this.onKeyUp.bind(this)}></textarea>
            </FormField>
          </fieldset>
          <Footer justify="end">
            <Menu direction="row" justify="end">
              <Button label="Send" primary={true} onClick={this.state.message.trim() ? this.onClick.bind(this) : null}/>
              <Button label="Cancel" onClick={this.props.onClose}/>
            </Menu>
          </Footer>
        </Form>
      </Box>
    );
  }
}
