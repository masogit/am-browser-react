import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  Box,
  Header,
  Title,
  Table,
  TableRow
} from 'grommet';

class ErrorHistory extends Component {

  render() {
    return (
      <Box pad="large">
        <Header><Title>Error log history</Title></Header>
        <Table>
          <thead>
          <th>Time</th>
          <th>Message</th>
          </thead>
          <tbody>
          {
            this.props.msgs.map((msg, index)=> {
              return (
                <TableRow>
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

let error = (state) => {
  return {
    msgs: state.error.msgs
  };
};

export default connect(error)(ErrorHistory);
