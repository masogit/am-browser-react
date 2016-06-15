import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  Box,
  Header,
  Title,
  Table,
  TableRow
} from 'grommet';

class MessageHistory extends Component {

  render() {
    var Status = require('grommet/components/icons/Status');
    return (
      <Box pad="large">
        <Header><Title>Message history</Title></Header>
        <Table>
          <thead>
          <th>Status</th>
          <th>Time</th>
          <th>Message</th>
          </thead>
          <tbody>
          {
            this.props.msgs.map((msg, index)=> {
              return (
                <TableRow>
                  <td> <Status value={msg.status} /> </td>
                  <td> {msg.time} </td>
                  <td> {msg.msg} </td>
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
