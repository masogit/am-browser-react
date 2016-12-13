import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  Box,
  Header,
  Table,
  TableRow
} from 'grommet';
import Status from 'grommet/components/icons/Status';

class MessageHistory extends Component {

  render() {
    const sortedMsgs = this.props.msgs.sort((msg_last, msg_latest) => (msg_latest.id > msg_last.id));
    return (
      <Box pad="medium" size='large'>
        <Header>Message history</Header>
        <Table>
          <thead>
          <tr>
            <th>Status</th>
            <th>Time</th>
            <th>Message</th>
          </tr>
          </thead>
          <tbody>
          {
            sortedMsgs.map((msg, index) => {
              return (
                <TableRow key={index}>
                  <td><Status value={msg.status}/></td>
                  <td>{msg.time}</td>
                  <td>{msg.msg}</td>
                </TableRow>
              );
            })
          }
          </tbody>
        </Table>
      </Box>
    );
  }
}

let message = (state) => {
  return {
    msgs: state.message.msgs
  };
};

export default connect(message)(MessageHistory);
