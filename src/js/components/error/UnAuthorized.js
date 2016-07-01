/**
 * Created by huling on 7/1/2016.
 */
import React, {Component} from 'react';
import {Box} from 'grommet';

export default class UnAuthorized extends Component {
  render() {
    return (
      <Box flex={true} align="center" justify="center">
        <Box colorIndex="light-2" pad={{horizontal: 'large', vertical: 'medium'}}>
          You are not Authorized
        </Box>
      </Box>
    );
  }
}
