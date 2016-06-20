import React, {Component} from 'react';

import { Box, Button, Title, FormField, Form, Footer, Menu } from 'grommet';
var SocialSlack = require('grommet/components/icons/base/SocialSlack');

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
    if (event.keyCode === 13 && (event.ctrlKey || event.shiftKey) && this.state.message.trim()) {
      this.props.onClick(this.state.message);
      this.props.onClose();
    }
    return true;
  }

  render() {
    return (
      <Box pad='medium' size='medium'>
        <Form className='long-form'>
          <Title>Send message to Slack</Title>
          <fieldset>
            <FormField>
              <textarea value={this.state.message} onChange={this.onChange.bind(this)}
                        placeholder='What do you want to say to HPE AM Browser team?'
                        onKeyUp={this.onKeyUp.bind(this)} rows={8}>
              </textarea>
            </FormField>
          </fieldset>
          <Footer justify="between">
            <a href='https://ambrowser.slack.com' style={{ lineHeight: '13px', fontSize: '13px'}} target='_blank'>
              <Box align='center'>
                <SocialSlack />
                <span>AM Browser team</span>
              </Box>
            </a>

            <Menu direction="row">
              <Button label="Send" primary={true} onClick={this.state.message.trim() ? this.onClick.bind(this) : null}/>
              <span></span>
              <Button label="Cancel" onClick={this.props.onClose}/>
            </Menu>
          </Footer>
        </Form>
      </Box>
    );
  }
}